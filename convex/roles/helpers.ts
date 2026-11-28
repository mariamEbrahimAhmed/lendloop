import type { QueryCtx } from "../_generated/server";
import { RoleKey } from "./constants";

/** A built-in role by key, or null if it doesn't exist (seed not run). */
export async function getRoleByKey(ctx: QueryCtx, key: RoleKey) {
  return await ctx.db
    .query("roles")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
}
