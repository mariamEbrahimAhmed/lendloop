import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";
import { isAppError } from "../lib/errors";
import { verifyWebhookSignature } from "../lib/webhooks";

/** The parts of Clerk's user event payload we use. */
type ClerkUserEvent = {
  type: string; // "user.created" | "user.updated" | "user.deleted" | …
  data: {
    id?: string;
    email_addresses?: { id: string; email_address: string }[];
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
  };
};

/**
 * Receives Clerk's user events (routed in convex/http.ts) and keeps the `users`
 * table in sync. Clerk signs each request (HMAC-SHA256, see lib/webhooks.ts);
 * nothing is trusted until that signature checks out.
 *
 * Replies 2xx once the event is handled or deliberately ignored, including
 * expected errors (appError, e.g. an invalid email): retrying can't fix bad data.
 * Unexpected errors return 500, so Clerk retries; that's safe because the
 * mutations are idempotent.
 */
export const clerkUsersWebhook = httpAction(async (ctx, request) => {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    console.error("CLERK_WEBHOOK_SIGNING_SECRET is not set on this Convex deployment");
    return new Response("Webhook not configured", { status: 500 });
  }

  // Verify against the raw body: re-serialized JSON would not match the signature.
  const body = await request.text();
  if (!(await verifyWebhookSignature(body, request.headers, secret))) {
    return new Response("Invalid signature", { status: 401 });
  }
  const event = JSON.parse(body) as ClerkUserEvent;

  const clerkId = event.data.id;
  if (!clerkId) {
    return new Response("Ignored: no user id", { status: 200 });
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const { data } = event;
        const email = (
          data.email_addresses?.find((e) => e.id === data.primary_email_address_id) ??
          data.email_addresses?.[0]
        )?.email_address;
        if (!email) {
          // Retrying wouldn't help; LendLoop needs an email (require it in Clerk).
          console.error(`Clerk user ${clerkId} has no email address; not synced`);
          return new Response("Ignored: user has no email", { status: 200 });
        }
        await ctx.runMutation(internal.users.mutations.upsertFromClerk, {
          clerkId,
          email,
          firstName: data.first_name ?? undefined,
          lastName: data.last_name ?? undefined,
          imageUrl: data.image_url ?? undefined,
        });
        break;
      }
      case "user.deleted":
        await ctx.runMutation(internal.users.mutations.deleteFromClerk, { clerkId });
        break;
      default:
        // An event type we don't handle (e.g. subscribed by mistake): acknowledge it.
        break;
    }
  } catch (error) {
    if (isAppError(error)) {
      console.error(`Clerk ${event.type} for ${clerkId} not synced: ${error.data.code}`);
      return new Response(`Ignored: ${error.data.code}`, { status: 200 });
    }
    throw error; // unexpected: Convex replies 500 and Clerk retries
  }
  return new Response(null, { status: 200 });
});
