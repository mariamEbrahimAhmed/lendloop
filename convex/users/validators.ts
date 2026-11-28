import { v } from "convex/values";

/**
 * Fields of a `users` document. Convex adds `_id` (the user's id) and
 * `_creationTime` itself.
 */
export const userFields = {
  clerkId: v.string(), // Clerk's user id (identity.subject); links the login to this row
  email: v.string(), // stored normalized: pass it through normalizeEmail() (lib/email.ts)
  firstName: v.string(), // if Clerk sends none, the webhook uses the email's local part
  lastName: v.optional(v.string()), // Google allows accounts without one; single-name users
  imageUrl: v.optional(v.string()),
  roleId: v.id("roles"),
  isTrusted: v.boolean(),
};
