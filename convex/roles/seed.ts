import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { RoleKey } from "./constants";

/** Rows the seed creates in the `roles` table. */
const BUILT_IN_ROLES = [
  { key: RoleKey.Member, name: "Member", description: "Can list, borrow and lend tools." },
  { key: RoleKey.Admin, name: "Admin", description: "Manages users, roles and listings." },
];

/** Creates the missing built-in roles; returns every built-in role's id by key. */
export async function seedRoles(ctx: MutationCtx) {
  const roleIds = {} as Record<RoleKey, Id<"roles">>;
  for (const role of BUILT_IN_ROLES) {
    const existing = await ctx.db
      .query("roles")
      .withIndex("by_key", (q) => q.eq("key", role.key))
      .unique();
    roleIds[role.key] = existing?._id ?? (await ctx.db.insert("roles", role));
  }
  return roleIds;
}
