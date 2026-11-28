import { defineTable } from "convex/server";
import { permissionFields } from "./validators";

export const permissionsTable = defineTable(permissionFields)
  .index("by_key", ["key"]) // permission checks and the seed look keys up
  .index("by_resource", ["resourceId"]); // list a resource's permissions (admin screen)
