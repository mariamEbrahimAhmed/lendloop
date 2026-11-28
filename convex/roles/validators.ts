import { v } from "convex/values";

/**
 * Fields of a `roles` document. `key` is the stable id the code checks
 * (e.g. "admin"); `name` and `description` are for the admin screens.
 */
export const roleFields = {
  key: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
};
