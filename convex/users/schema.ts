import { defineTable } from "convex/server";
import { userFields } from "./validators";

export const usersTable = defineTable(userFields)
  .index("by_clerk_id", ["clerkId"]) // find the signed-in user; webhook upserts
  .index("by_email", ["email"])
  .index("by_role", ["roleId"]); // list users of a role; block deleting a role in use
