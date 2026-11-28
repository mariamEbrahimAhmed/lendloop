import { PermissionKey } from "../permissions/constants";

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

/** Rows the seed creates in the `roles` table. */
export const BUILT_IN_ROLES = [
  { key: RoleKey.Member, name: "Member", description: "Can list, borrow and lend tools." },
  { key: RoleKey.Admin, name: "Admin", description: "Manages users, roles and listings." },
];

/** Permissions the seed grants each built-in role (it only adds, never removes). */
export const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  [RoleKey.Member]: [
    PermissionKey.ToolsViewAny,
    PermissionKey.ToolsCreateOwn,
    PermissionKey.ToolsUpdateOwn,
    PermissionKey.ToolsDeleteOwn,
    PermissionKey.RequestsCreateOwn,
    PermissionKey.RequestsViewOwn,
    PermissionKey.RequestsCancelOwn,
    PermissionKey.RequestsDecideOwn,
    PermissionKey.LoansReturnOwn,
    PermissionKey.AutomationViewOwn,
  ],
  [RoleKey.Admin]: Object.values(PermissionKey), // everything
};
