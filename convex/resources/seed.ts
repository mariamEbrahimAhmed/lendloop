import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { ResourceKey } from "./constants";

/** Creates the missing built-in resources; returns every resource's id by key. */
export async function seedResources(ctx: MutationCtx) {
  const resourceIds = {} as Record<ResourceKey, Id<"resources">>;
  for (const key of Object.values(ResourceKey)) {
    const existing = await ctx.db
      .query("resources")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    resourceIds[key] = existing?._id ?? (await ctx.db.insert("resources", { key }));
  }
  return resourceIds;
}
