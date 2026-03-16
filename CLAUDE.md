# Alta Boilerplate

## Tech Stack
- React 19 + React Router v7 (framework mode, SPA) + Vite
- Tailwind CSS v4
- Supabase (Auth, DB, Edge Functions)
- TypeScript (strict mode)
- pnpm

## Project Structure
- `app/` - React SPA source
  - `components/` - UI components
  - `lib/shared/` - Shared schemas, types, utils, constants
  - `lib/supabase/` - Supabase client + generated types
  - `providers/` - Auth provider
  - `routes/` - Route components
- `supabase/` - Supabase config, migrations, edge functions

## UI Components
- **ALWAYS use `@alta/design-system` first** for buttons, inputs, colors, typography, and all UI components
- Only use plain Tailwind or other components if the design system doesn't have what you need
- Import from: `import { Button, Input, ... } from '@alta/design-system'`

## Conventions
- File naming: kebab-case
- Zod for validation, derive types with `z.infer<typeof schema>`
- Supabase client singleton (`lib/supabase/client.ts`)
- Auth via React context provider (`providers/auth-provider.tsx`)
- Protected routes via `routes/app/_layout.tsx` layout route
- Barrel exports via `index.ts` files

## Commands

### Development
- `pnpm dev` - Start dev server (localhost:5173)
- `pnpm build` - Build for production
- `pnpm type-check` - TypeScript check
- `pnpm format` - Format with Prettier
- `pnpm format:check` - Check formatting

### Vercel Deployment
- `pnpm run deploy` - **Preview deploy** (gives a unique preview URL to test)
- `pnpm run deploy:prod` - **Production deploy** (updates the live site)
- Preview deploys are created per push — each gets a unique URL like `https://project-xyz123.vercel.app`
- Production deploy updates `https://<project-name>.vercel.app`
- **ONLY run `pnpm run deploy:prod` when the user explicitly asks** (e.g. "deploy to production", "go live")
- After making code changes, **always commit, push, and deploy a preview**:
  ```
  git add -A && git commit -m "description" && git push && pnpm run deploy
  ```
- Auto-deploy is also set up: every push to GitHub triggers a Vercel deploy automatically

### Database & Migrations
- `pnpm db:gen-types` - Generate TypeScript types from DB schema → `app/lib/supabase/types/database.types.ts`
- `pnpm db:new-migration <name>` - Create a new migration file in `supabase/migrations/`
- `pnpm db:push` - Push local migrations to the cloud Supabase DB
- `pnpm db:diff` - Diff local schema changes against the cloud DB
- `pnpm db:reset` - Reset the cloud DB and re-run all migrations

**Migration workflow:**
1. Create a migration: `pnpm db:new-migration add_users_table`
2. Edit the SQL file in `supabase/migrations/`
3. Push to cloud: `pnpm db:push`
4. Regenerate types: `pnpm db:gen-types`

### Edge Functions
- Edge functions live in `supabase/functions/<function-name>/index.ts`
- Deploy a function: `npx supabase functions deploy <function-name> --project-ref $SUPABASE_PROJECT_REF`
- Deploy all functions: `npx supabase functions deploy --project-ref $SUPABASE_PROJECT_REF`
- Set secrets: `npx supabase secrets set KEY=value --project-ref $SUPABASE_PROJECT_REF`
- List secrets: `npx supabase secrets list --project-ref $SUPABASE_PROJECT_REF`
- The `SUPABASE_PROJECT_REF` comes from `alta.config.json`

## Shell Credentials (~/.zshrc)

The CLI installer (`create-alta-app`) adds the following to `~/.zshrc`:

```bash
# Alta
export SUPABASE_ACCESS_TOKEN=sbp_...
```

This token is **org-level** — it grants access to all Supabase projects in the Alta org via the Management API. It's used by:
- **Supabase CLI** — all `npx supabase` commands automatically read `$SUPABASE_ACCESS_TOKEN` from the environment (no `supabase login` needed)
- **Claude Code MCP** — `.claude/mcp.json` references `${SUPABASE_ACCESS_TOKEN}` which Claude Code resolves from the shell environment

### How Supabase CLI uses the token
The Supabase CLI automatically picks up `SUPABASE_ACCESS_TOKEN` from the environment. No need to run `supabase login`. Examples:
```bash
# These all work without login — the CLI reads SUPABASE_ACCESS_TOKEN from ~/.zshrc
npx supabase functions deploy my-function --project-ref <ref>
npx supabase secrets list --project-ref <ref>
npx supabase db push --project-ref <ref>
```

### Important
- The token is set once during `npx create-alta-app` and persists across all projects
- If Claude Code can't access Supabase MCP, make sure `SUPABASE_ACCESS_TOKEN` is exported in your shell (restart terminal after first install)
- **Never commit this token** — it lives only in `~/.zshrc`

### Troubleshooting: "Access token not provided"
If Supabase CLI commands fail with "Access token not provided" after a fresh install:
1. The installer writes `SUPABASE_ACCESS_TOKEN` to `~/.zshrc`, but your current terminal session won't have it until you reload
2. Run `source ~/.zshrc` in your terminal, or restart the terminal
3. Verify with `echo $SUPABASE_ACCESS_TOKEN` — it should print the token
4. As a one-time fallback you can run `npx supabase link --project-ref <ref>` to authenticate the project directly

## Project Config (zero-env architecture)

This project uses **no `.env` files**. All config is in `alta.config.json` (committed to git):

| Field | Purpose |
|---|---|
| `supabaseProjectRef` | Supabase project ID — used by DB commands, edge function deploys |
| `supabaseUrl` | Supabase project URL — used by the app |
| `supabaseAnonKey` | Supabase anon/public key — used by the app (safe to commit) |
| `vercelProjectName` | Vercel project name |
| `vercelUrl` | Vercel production URL |

### Shared secrets (API keys)
Shared API keys (Anthropic, Cursor, Lovable, etc.) are automatically set as Supabase project secrets during project creation. Edge functions access them via `Deno.env.get('KEY_NAME')`. **Never hardcode API keys in code or config files.**

### Vercel env vars (set automatically during project creation)
| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase URL — used at build time |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key — used at build time |

### Deploys
- **Vercel**: Auto-deploys on every push to GitHub — no local Vercel token needed
- **Edge functions**: Auto-deploy via GitHub Action when `supabase/functions/` changes

## MCP
- Supabase MCP is configured in `.claude/mcp.json` per project
- The config uses `${SUPABASE_ACCESS_TOKEN}` from your shell and the project-specific ref from `alta.config.json`
- Use MCP tools to query tables, run migrations, and manage the Supabase project directly from Claude Code
- If MCP isn't connecting, restart your terminal to ensure `SUPABASE_ACCESS_TOKEN` is loaded

## Routes (folder-based, explicit config in `routes.ts`)
- `routes/auth/` - Public (login, signup, forgot-password, callback)
- `routes/app/` - Protected (dashboard, settings)
- `routes/app/_layout.tsx` acts as auth guard for all nested routes
- `routes/auth/_layout.tsx` provides centered card layout for auth pages
