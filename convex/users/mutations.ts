import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { normalizeEmail } from "../lib/email";
import { DEFAULT_ROLE_KEY } from "../roles/constants";
import { getRoleByKey } from "../roles/helpers";
import { DEFAULT_TRUSTED } from "./constants";
import { getUserByClerkId } from "./helpers";
import { userFields } from "./validators";

/**
 * Creates or updates the user for a Clerk account (called by the Clerk webhook).
 * Idempotent: looks the user up by `clerkId`, so a retried event updates the
 * same row instead of adding another.
 *
 * Only the profile (email, names, image) is synced from Clerk. Role and trust are
 * set on creation and then managed in LendLoop, never overwritten by Clerk.
 */
export const upsertFromClerk = internalMutation({
  args: {
    clerkId: userFields.clerkId,
    email: userFields.email,
    firstName: v.optional(v.string()), // optional here: Clerk may send none (fallback below)
    lastName: userFields.lastName,
    imageUrl: userFields.imageUrl,
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const profile = {
      email,
      firstName: args.firstName?.trim() || email.split("@")[0],
      lastName: args.lastName?.trim() || undefined, // undefined removes it on update
      imageUrl: args.imageUrl || undefined,
    };

    const existing = await getUserByClerkId(ctx, args.clerkId);
    if (existing) {
      await ctx.db.patch(existing._id, profile);
      return existing._id;
    }

    const role = await getRoleByKey(ctx, DEFAULT_ROLE_KEY);
    if (!role) {
      throw new Error(`Role "${DEFAULT_ROLE_KEY}" not found. Run: npx convex run seed`);
    }
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      ...profile,
      roleId: role._id,
      isTrusted: DEFAULT_TRUSTED,
    });
  },
});

/**
 * Removes the user for a deleted Clerk account (called by the Clerk webhook).
 * Idempotent: does nothing if the user is already gone.
 */
export const deleteFromClerk = internalMutation({
  args: { clerkId: userFields.clerkId },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.clerkId);
    if (user) {
      await ctx.db.delete(user._id);
    }
    return null;
  },
});
