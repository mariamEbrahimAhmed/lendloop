import { v } from "convex/values";

/**
 * Fields of a `resources` document: a section permissions are grouped under
 * (e.g. "tools"). Built-in keys are the ResourceKey enum; UI text comes from
 * localization, by key.
 */
export const resourceFields = {
  key: v.string(),
};
