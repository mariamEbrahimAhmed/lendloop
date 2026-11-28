import type { QueryCtx } from "../_generated/server";

/** The user linked to a Clerk account, or null if there's none (yet). */
export async function getUserByClerkId(ctx: QueryCtx, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
}
