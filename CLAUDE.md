# LendLoop

Neighborhood tool-lending board. Next.js frontend, Convex backend, Clerk auth, n8n automations.
Goals: server-side RBAC, HMAC-signed webhooks, idempotent automations.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript strict, Tailwind CSS 4) — `src/`
- **Convex** (database + backend functions, runs in Convex's cloud) — `convex/`
- **Clerk** (`@clerk/nextjs` 7) — authentication; package installed only, not wired into the app yet
- **n8n** (Docker) — automations; planned: `n8n/workflows/*.json` + `docker-compose.yml`

One repo, one `package.json`. Not a monorepo on purpose: the frontend imports Convex's
generated types from `convex/_generated/` directly. Only split into `apps/` + `packages/`
if a second app needs the same backend.

## Layout

```
src/app/[locale]/   ALL routes live here (root layout included); /en/..., /ar/...
src/components/     presentational UI: props in, JSX out — no data fetching, no Convex/Clerk hooks
src/containers/     connect data to components: call Convex queries/mutations and Clerk hooks,
                    handle loading/error states, pass plain props down to components/
src/providers/      React context providers (Convex, theme, locale…); composed in app/layout.tsx
src/theme/          design tokens and theme config (colors, typography, light/dark)
src/localization/   next-intl setup: routing.ts (locales, RTL), request.ts, navigation.ts,
                    <locale>.json (en.json, ar.json) — no hard-coded UI text
src/proxy.ts        middleware (Next 16 name for middleware.ts): next-intl language routing
convex/             schema.ts, http.ts, seed.ts, lib/, one folder per table (users/, roles/…)
                    with constants.ts, validators.ts, schema.ts, queries.ts, mutations.ts
convex/_generated/  created by `npx convex dev` — commit it, never edit it
```

## Commands

```
npm run dev                 # Next.js dev server (localhost:3000)
npx convex dev              # sync convex/ to the dev deployment, regenerate types
npm run lint                # ESLint
npx tsc --noEmit            # type-check the app
npx tsc -p convex/tsconfig.json   # type-check Convex functions
npm run build               # production build — run before calling work done
```

## Rules

### Git
- **Never commit or push.** The user commits. Suggest a descriptive commit message instead
  (conventional prefix: `feat:`, `fix:`, `chore:` …, with a body explaining what and why).
  Use the `stage-change` skill to stage one specific change (only its files/lines) and prefill VS Code's
  Source Control box.
- Branches: `type/short-description` (e.g. `chore/project-setup`, `feature/tool-listing`),
  created from `develop`. Flow: work branch → `develop` → `test` → `main`.
- Remote uses the SSH host alias `github-personal` (key `~/.ssh/personalgithub`).

### Where code goes
- `app/` route files stay thin: they render a container, they don't hold UI or data logic.
- A component that needs data is split in two: the container in `containers/` fetches,
  the component in `components/` renders.
- Providers never go in `components/`.
- UI text comes from `localization/`, colors and fonts from `theme/`, not inline values.

### Theme
- Tailwind 4: no `tailwind.config.js`. Tokens live in `src/theme/` as `@theme` blocks, split by
  type: `typography.css` (sizes, weights, fonts), `colors.css` (palette, light/dark colors, mode
  rules). `index.css` imports them and is imported by `src/app/globals.css`. Adding a token
  creates its utility class; a new token type (spacing, radius…) gets its own file in `index.css`.
- Use the semantic tokens: `text-display|title|heading|subheading|body|label|caption`,
  `font-regular|medium|semibold|bold`, colors `background, surface, surface-muted, border,
  foreground, foreground-muted, primary, primary-hover, primary-foreground, success, warning,
  danger`, raw palette `brand-50…900`. Avoid hard-coded hex and `black/…`/`white/…`.
- Semantic colors use `light-dark()`, so they switch with the mode on their own — don't add
  `dark:` overrides for them. Mode follows the OS; `data-theme="light|dark"` on `<html>` forces one.

### Localization (next-intl, English + Arabic)
- Language is in the URL (`localePrefix: "always"`); `src/proxy.ts` runs next-intl's routing.
  Don't switch to cookie-based locale: it breaks prerendering
  under `cacheComponents`.
- Get the locale with `next/root-params` (`locale()`) or next-intl, never by awaiting a
  page's catch-all `params` outside `<Suspense>` — that fails `next build`.
- Server Components: `await getTranslations("Namespace")`. Client Components:
  `useTranslations("Namespace")` (provided by `LocalizationProvider`).
- Every new key goes in **both** `en.json` and `ar.json`; `en.json` drives the types.
- Use `Link`/`redirect`/`useRouter` from `@/localization/navigation`, not `next/link` /
  `next/navigation`, so URLs keep their language.
- Arabic is RTL (`<html dir="rtl">`): use logical Tailwind classes (`ms-*`, `me-*`, `ps-*`,
  `pe-*`, `start-*`, `end-*`, `text-start`) instead of `ml-*`/`mr-*`/`left-*`/`text-left`.

### Next.js
- `cacheComponents: true` is on. Anything that reads request data (cookies, headers, auth
  session, uncached fetches) must render inside `<Suspense>`, or `next build` fails.
- Middleware file is `src/proxy.ts` (not `middleware.ts`).
- Import from `src/` with the `@/` alias.

### Security
- Auth (Clerk) isn't wired in yet — don't add sign-in, middleware or providers for it
  unless asked.
- Enforce permissions on the server (Convex functions / server code), never only in the UI.
- Never expose secret keys to client code.
- Don't read or print `.env*` files. They're gitignored and hold keys.

### Convex
Full guidelines: `.claude/rules/convex.md` (folder layout, validators, queries, auth, Next.js usage).
- One folder per table; each table is defined in `<table>/schema.ts` and combined in `convex/schema.ts`.
- Every function has `args` **and** `returns` validators; no `.filter()` — use indexes.
- Public functions check permissions on the server (`PermissionKey`, not roles); backend-only
  ones are `internal*`.
- Webhooks from n8n/Clerk arrive as Convex `httpAction`s: verify the HMAC signature first,
  and make handlers idempotent (safe to receive the same event twice).

## Next.js version notes

`AGENTS.md` is maintained by `next dev` (it re-adds its block if removed). Its rules apply here:

@AGENTS.md

## Project skills

Project-specific skills live in `.claude/skills/<name>/SKILL.md`; topic rules in `.claude/rules/*.md`.
