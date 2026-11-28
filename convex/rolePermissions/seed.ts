import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { PermissionKey } from "../permissions/constants";
import { RoleKey } from "../roles/constants";

/**
 * Permissions each built-in role starts with. INITIAL grants only: once seeded,
 * the `rolePermissions` table is the truth (admins can change it), so
 * permission checks read the table, never this list.
 */
const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  [RoleKey.Member]: [
    PermissionKey.ToolsViewAny,
    PermissionKey.ToolsCreateOwn,
    PermissionKey.ToolsUpdateOwn,
    PermissionKey.ToolsDeleteOwn,
    PermissionKey.RequestsCreateOwn,
    PermissionKey.RequestsViewOwn,
    PermissionKey.RequestsCancelOwn,
    PermissionKey.RequestsDecideOwn,
    PermissionKey.LoansReturnOwn,
    PermissionKey.AutomationViewOwn,
  ],
  [RoleKey.Admin]: Object.values(PermissionKey), // everything
};

/**
 * Grants each built-in role its initial permissions (ROLE_PERMISSIONS) where
 * the grant doesn't exist yet. Never removes grants.
 */
export async function seedRolePermissions(
  ctx: MutationCtx,
  roleIds: Record<RoleKey, Id<"roles">>,
  permissionIds: Record<PermissionKey, Id<"permissions">>,
) {
  for (const roleKey of Object.values(RoleKey)) {
    const roleId = roleIds[roleKey];
    for (const permissionKey of ROLE_PERMISSIONS[roleKey]) {
      const permissionId = permissionIds[permissionKey];
      const granted = await ctx.db
        .query("rolePermissions")
        .withIndex("by_role_permission", (q) =>
          q.eq("roleId", roleId).eq("permissionId", permissionId),
        )
        .unique();
      if (!granted) {
        await ctx.db.insert("rolePermissions", { roleId, permissionId });
      }
    }
  }
}
