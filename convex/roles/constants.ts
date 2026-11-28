/**
 * Built-in roles. The code relies on these keys (permission checks, the default
 * role), so they always exist: convex/seed.ts creates them. Roles added later by
 * an admin live only in the `roles` table.
 */
export enum RoleKey {
  Member = "member",
  Admin = "admin",
}

/** Role a new user gets. */
export const DEFAULT_ROLE_KEY = RoleKey.Member;
