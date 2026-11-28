import { v } from "convex/values";

/**
 * Fields of a `permissions` document: the key the code checks
 * (e.g. "tools.delete.any") and the resource row it belongs to. Grants in
 * `rolePermissions` point to its `_id`. UI text comes from localization, by key.
 */
export const permissionFields = {
  key: v.string(),
  resourceId: v.id("resources"),
};
