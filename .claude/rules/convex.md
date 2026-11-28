---
paths:
  - "convex/**"
  - "src/containers/**"
  - "src/providers/**"
---

# Convex guidelines

Adapted from an opinionated community ruleset (srizvi's "Convex rules" gist) to this
project: single repo (no `apps/app/`), relative imports (no `#cvx/` alias), Clerk for auth.

## Folder structure: one folder per table

```
convex/
  schema.ts              combines the table fragments; nothing else
  http.ts                HTTP router (webhooks); fixed name
  crons.ts               scheduled jobs; fixed name
  auth.config.ts         Clerk as the auth provider; fixed name
  lib/                   shared helpers (auth/role checks, input checks, function wrappers)
  users/
    constants.ts         enums and fixed values (e.g. DEFAULT_TRUSTED)
    validators.ts        v.* validators (userFields)
    schema.ts            usersTable = defineTable(userFields).index(...)
    queries.ts           public `query` + `internalQuery`
    mutations.ts         public `mutation` + `internalMutation`
    helpers.ts           plain functions taking `ctx` for lookups used by several functions
                         (`getUserByClerkId(ctx, id)`); not Convex functions
    actions.ts           `action` / `internalAction` (only when calling outside services)
  resources/             permission sections; constants.ts has the ResourceKey enum
  permissions/           constants.ts has the PermissionKey enum
  roles/                 constants.ts has RoleKey and DEFAULT_ROLE_KEY
  rolePermissions/       link table: which role has which permission
  seed.ts                entry point of the idempotent seed (`npx convex run seed`):
                         calls each table's `<table>/seed.ts` helper in dependency order
  tools/ loans/ ...      same shape per table
  _generated/            created by `npx convex dev` as .ts files (set in /convex.json);
                         commit it together with the code it reflects, never edit it
```

- Every table has its own folder named after the table, link tables included
  (`rolePermissions/`); `<table>/schema.ts` defines exactly that one table.
- Built-in data a table needs goes in `<table>/seed.ts`, both the rows and the plain helper
  that inserts them (`seedRoles(ctx)`), not a Convex function; only `convex/seed.ts` is
  runnable. `constants.ts` keeps only what running code uses (enums, defaults).
- File path = API path: `convex/users/queries.ts` → `api.users.queries.getMe`,
  internal ones → `internal.users.mutations.upsertFromClerk`.
- File names: letters, numbers, `_` only (no `-`).
- Keep exported functions thin (validate, check permissions, call a helper). Shared logic
  lives in plain async TypeScript helpers (in `lib/` or the domain folder), not in
  `ctx.runQuery`/`ctx.runMutation` calls between functions.

## Functions

- Always use the object syntax with **both** validators:
  ```ts
  import { query } from "../_generated/server";
  import { v } from "convex/values";

  export const getById = query({
    args: { userId: v.id("users") },
    returns: v.union(v.null(), v.object({ /* fields */ })),
    handler: async (ctx, args) => { /* ... */ },
  });
  ```
  A function that returns nothing declares `returns: v.null()` and `return null;`.
- **Public** (`query`, `mutation`, `action`) = callable from the browser by anyone. Every
  public function checks auth/role on the server first (via `lib/` helpers).
- **Internal** (`internalQuery`, `internalMutation`, `internalAction`) for anything only the
  backend calls: webhook handlers, crons, scheduled jobs, sensitive writes.
- Calling other functions:
  - `ctx.runQuery` / `ctx.runMutation` / `ctx.runAction` take a function **reference**
    (`api.x.y` / `internal.x.y`), never the function itself.
  - From a mutation/query, prefer calling a helper directly (same transaction).
  - From an action, keep calls few: each `runMutation` is its own transaction, so splitting
    logic across several invites races.
  - Only call an action from an action to switch runtime (V8 ↔ Node).
  - Calling a function in the same file: annotate the result type
    (`const name: string = await ctx.runQuery(...)`) to avoid TS circularity errors.
- Scheduling follow-up work from a mutation: `ctx.scheduler.runAfter(0, internal.x.y, args)`.

## HTTP endpoints (webhooks)

- Defined in `convex/http.ts` with `httpRouter()` + `httpAction`; registered at exactly
  the `path` given. Served from the `.convex.site` URL.
- `http.ts` only routes. Each handler lives with its table (`users/webhook.ts` →
  `POST /clerk-users-webhook`).
- Every webhook (Clerk, n8n): verify the HMAC signature on the raw body **before** parsing
  or acting (`verifyWebhookSignature` in `lib/webhooks.ts`, built on Web Crypto; no
  package), return 401 on failure, then hand off to an `internalMutation`.
- Webhook secrets are Convex environment variables (`npx convex env set NAME value`), not
  `.env.local`: the handler runs on Convex's servers.
- Handlers are idempotent: store the event id (or upsert by external id) so a retried
  delivery changes nothing.

## Schema and validators

- Fields live in `<domain>/validators.ts`, the table in `<domain>/schema.ts`, and
  `convex/schema.ts` only combines them:
  ```ts
  // convex/users/validators.ts
  export const userFields = { clerkId: v.string(), roleId: v.id("roles") /* ... */ };

  // convex/users/schema.ts
  export const usersTable = defineTable(userFields).index("by_clerk_id", ["clerkId"]);

  // convex/schema.ts
  export default defineSchema({ users: usersTable });
  ```
  Reuse the same validator fragments in function `args`/`returns`.
- `validators.ts` holds only `v.*` validators and their `Infer` types. Checks that run
  (normalizing, format checks) are helpers: shared ones in `lib/` (e.g. `lib/email.ts`),
  domain-only ones in the domain folder.
- Fixed sets of values (e.g. loan statuses) are a string `enum` in `<domain>/constants.ts`,
  with defaults next to it; the validator in `validators.ts` is built from
  `Object.values(TheEnum)`, and code uses `TheEnum.Value`, never the raw string.
- RBAC is data: `users.roleId` → `roles`, and `rolePermissions` links roles to
  `permissions` (many-to-many). Admins can change grants without a deploy.
- Functions check **permissions, not roles**: `requirePermission(ctx, PermissionKey.ToolsDeleteAny)`.
  Keys are `<resource>.<action>.<scope>`; each permission points to its section in the
  `resources` table (`resourceId`; built-in keys are the `ResourceKey` enum). For `.own`
  the function must also check the user owns / takes part in the row. Compare by key (enums in `<table>/constants.ts`),
  never by `_id` or `name`.
- A new permission: add it to `PermissionKey` (a new section also to `ResourceKey`),
  grant it in `ROLE_PERMISSIONS` (`rolePermissions/seed.ts`; initial grants only, checks
  read the table), then `npx convex run seed`. The seed only adds missing rows; it
  never edits or revokes, so removing a grant is a data change (dashboard or mutation).
- Every document has `_id` and `_creationTime`. Look things up by `_id` when you have it.
- Validators: `v.int64()` (not the deprecated `v.bigint()`); `v.record(keys, values)` for
  maps (`v.map()` / `v.set()` aren't supported).

## TypeScript

- Type ids with `Id<"users">` from `_generated/dataModel`, never plain `string`.
- Records give explicit key and value types: `v.record(v.id("users"), v.string())`.

## Queries

- **No `.filter()`.** Add an index to the schema and use `.withIndex(...)`.
- `.unique()` for a single result (throws if more than one matches); `.first()` /
  `.take(n)` to limit; `.collect()` only when the result set is known to be small.
- Order: ascending `_creationTime` by default; `.order("desc")` to flip. Indexed queries
  are ordered by the index fields.
- No bulk delete: `.collect()` (or paginate) then `ctx.db.delete(doc._id)` per document.
- Pagination:
  ```ts
  import { paginationOptsValidator } from "convex/server";

  export const listByOwner = query({
    args: { paginationOpts: paginationOptsValidator, ownerId: v.id("users") },
    handler: async (ctx, args) =>
      ctx.db
        .query("tools")
        .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
        .order("desc")
        .paginate(args.paginationOpts), // → { page, isDone, continueCursor }
  });
  ```
- Full-text search: a `searchIndex` in the schema, then
  `.withSearchIndex("search_name", (q) => q.search("name", text).eq("ownerId", id)).take(10)`.

## Errors

- Errors the user should see: `throw appError(ErrorCode.X)` (`lib/errors.ts`). The client
  reads `error.data.code` and shows `t("Errors.<code>")`; never send UI text from Convex.
- Prefer a general code (`bad_request`, `forbidden`, `not_found`, `conflict`…); add a
  specific one (like `invalid_email`) only when the UI needs a clearer message.
- A new code: add it to `ErrorCode`, `ERROR_HTTP_STATUS`, and `Errors` in **both**
  `en.json` and `ar.json`.
- HTTP statuses only matter in `httpAction`s (`ERROR_HTTP_STATUS[code]`); queries and
  mutations report `error.data.code`, never a status.
- Bugs and setup problems: plain `throw new Error(...)`; Convex hides them in production.
- Catching: `isAppError(error, ErrorCode.X)`. Webhooks reply 2xx for appErrors (retrying
  can't fix bad data) and let unexpected errors become 500 (the sender retries).

## Mutations

- `ctx.db.patch(id, fields)` merges; `ctx.db.replace(id, doc)` replaces whole. Both throw
  if the document doesn't exist.

## Crons

- Only `crons.interval(...)` or `crons.cron(...)` (not `hourly`/`daily`/`weekly`).
- Pass a reference from `internal` (import it from `_generated/api`, even for a function in
  the same file); `export default crons`.

## File storage

- `ctx.storage.getUrl(id)` → URL or `null`.
- Metadata: `ctx.db.system.get(id)` on the `_storage` table (not the deprecated
  `ctx.storage.getMetadata`).

## Auth and permissions (Clerk)

- Identity: `await ctx.auth.getUserIdentity()` (`identity.subject` = Clerk user id), then
  load the user with `.withIndex("by_clerk_id", ...).unique()`.
- Put this in `lib/` helpers (`getCurrentUser(ctx)`, `requirePermission(ctx, PermissionKey.UsersTrustAny)`) and wrap
  them into custom functions (`authedQuery`, `adminMutation`) with `customQuery` /
  `customMutation` from `convex-helpers` (install when first needed).
- Row-level rules (who may read/modify which rows) can use `convex-helpers`'
  `rowLevelSecurity` (`wrapDatabaseReader` / `wrapDatabaseWriter`) inside those wrappers.
- The UI hiding a button is not a permission check; the Convex function is.

## Using Convex from Next.js

Convex hooks are used only in `src/containers/` (see CLAUDE.md "Where code goes").

| Need | Use |
| --- | --- |
| Live data in a Client Component | `useQuery(api.x.y, args)` (from `convex/react`) |
| Live data that survives navigation | `useQuery` from `convex-helpers/react/cache/hooks` + `ConvexQueryCacheProvider` (install when needed) |
| Server-rendered first paint, then live | `preloadQuery` in a Server Component → `usePreloadedQuery` in the client one |
| One-off server read, no live updates | `fetchQuery` in a Server Component / server action |

- `preloadQuery` / `fetchQuery` read the request (auth token), so with `cacheComponents`
  they must render inside `<Suspense>`.
- Pass the Clerk token for authed server calls (`{ token }` option); never expose
  secret keys to the client.
