import { defineTable } from "convex/server";
import { roleFields } from "./validators";

export const rolesTable = defineTable(roleFields)
  .index("by_key", ["key"]); // find a role by key; keeps keys unique in the seed
