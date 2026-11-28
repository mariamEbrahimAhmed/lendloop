import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { seedPermissions } from "./permissions/seed";
import { seedResources } from "./resources/seed";
import { seedRolePermissions } from "./rolePermissions/seed";
import { seedRoles } from "./roles/seed";

/**
 * Creates the built-in data the app needs, using each table's seed helper
 * (<table>/seed.ts), in dependency order. One transaction: if any step fails,
 * nothing is written.
 *
 * Safe to run any number of times: it only adds what's missing and never edits
 * or removes rows. Run it once on every new deployment:
 *   npx convex run seed
 */
export default internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const resourceIds = await seedResources(ctx);
    const permissionIds = await seedPermissions(ctx, resourceIds);
    const roleIds = await seedRoles(ctx);
    await seedRolePermissions(ctx, roleIds, permissionIds);
    return null;
  },
});
