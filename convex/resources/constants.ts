/**
 * Built-in resources: the sections permissions are grouped under, and the first
 * part of every permission key (`<resource>`.action.scope). The seed
 * (convex/seed.ts) creates one `resources` row per key.
 */
export enum ResourceKey {
  Tools = "tools",
  Requests = "requests",
  Loans = "loans",
  Users = "users",
  Automation = "automation",
}
