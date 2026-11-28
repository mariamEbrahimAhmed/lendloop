import { defineTable } from "convex/server";
import { rolePermissionFields } from "./validators";

/** Which permissions each role has (many-to-many between roles and permissions). */
export const rolePermissionsTable = defineTable(rolePermissionFields)
  .index("by_role_permission", ["roleId", "permissionId"]) // "does role X have permission Y?"; also lists a role's permissions
  .index("by_permission", ["permissionId"]); // which roles have a permission
