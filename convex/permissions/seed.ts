import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { ResourceKey } from "../resources/constants";
import { PermissionKey } from "./constants";
import { permissionResource } from "./helpers";

/**
 * Creates the missing built-in permissions, each linked to its resource;
 * returns every permission's id by key.
 */
export async function seedPermissions(
  ctx: MutationCtx,
  resourceIds: Record<ResourceKey, Id<"resources">>,
) {
  const permissionIds = {} as Record<PermissionKey, Id<"permissions">>;
  for (const key of Object.values(PermissionKey)) {
    const existing = await ctx.db
      .query("permissions")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    permissionIds[key] =
      existing?._id ??
      (await ctx.db.insert("permissions", {
        key,
        resourceId: resourceIds[permissionResource(key)],
      }));
  }
  return permissionIds;
}
