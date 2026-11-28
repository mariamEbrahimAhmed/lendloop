import { v } from "convex/values";

/** Fields of a `rolePermissions` document: one row = this role has this permission. */
export const rolePermissionFields = {
  roleId: v.id("roles"),
  permissionId: v.id("permissions"),
};
