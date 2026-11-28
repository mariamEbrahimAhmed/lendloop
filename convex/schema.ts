import { defineSchema } from "convex/server";
import { permissionsTable } from "./permissions/schema";
import { resourcesTable } from "./resources/schema";
import { rolePermissionsTable } from "./rolePermissions/schema";
import { rolesTable } from "./roles/schema";
import { usersTable } from "./users/schema";

// Combines the tables defined in each folder (<table>/schema.ts).
// Convex checks every write against this schema, and the types it generates
// are shared with the Next.js app.
export default defineSchema({
  resources: resourcesTable,
  permissions: permissionsTable,
  roles: rolesTable,
  rolePermissions: rolePermissionsTable,
  users: usersTable,
});
