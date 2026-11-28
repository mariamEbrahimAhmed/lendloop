/**
 * Every permission the code checks. Format: <resource>.<action>.<scope>
 *   own: only rows the user owns or takes part in
 *   any: every row
 * The seed (convex/seed.ts) creates one `permissions` row per key.
 */
export enum PermissionKey {
  ToolsViewAny = "tools.view.any",
  ToolsCreateOwn = "tools.create.own",
  ToolsUpdateOwn = "tools.update.own",
  ToolsDeleteOwn = "tools.delete.own",
  ToolsDeleteAny = "tools.delete.any",

  RequestsCreateOwn = "requests.create.own",
  RequestsViewOwn = "requests.view.own",
  RequestsCancelOwn = "requests.cancel.own",
  RequestsDecideOwn = "requests.decide.own",

  LoansReturnOwn = "loans.return.own",
  LoansViewAny = "loans.view.any",

  UsersViewAny = "users.view.any",
  UsersTrustAny = "users.trust.any",

  AutomationViewOwn = "automation.view.own",
}
