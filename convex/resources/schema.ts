import { defineTable } from "convex/server";
import { resourceFields } from "./validators";

/** Sections permissions are grouped under (tools, requests, loans…). */
export const resourcesTable = defineTable(resourceFields)
  .index("by_key", ["key"]); // the seed looks resources up by key
