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
- Deploy a function: `npx supabase functions deploy <function-name> --linked`
- Deploy all functions: `npx supabase functions deploy --linked`
- Set secrets: `npx supabase secrets set KEY=value --linked`
- List secrets: `npx supabase secrets list --linked`
- All commands use `--linked` which reads the project ref from the local Supabase config (set during install)

## Supabase Authentication

The installer (`create-alta-app`) automatically:
1. Runs `supabase login --token <token>` — authenticates the Supabase CLI (persists in `~/.supabase/`)
2. Runs `supabase link --project-ref <ref>` — links the project so all `--linked` commands work

All db commands (`pnpm db:push`, `pnpm db:gen-types`, etc.) use `--linked` which reads from the local Supabase config. No environment variables or `.env` files needed.

### Claude Code MCP
The MCP token is written directly to `.claude/mcp.json` during install — no shell env vars needed.

### Troubleshooting
If Supabase CLI commands fail with "not linked":
```bash
npx supabase link --project-ref <ref-from-alta.config.json>
```
If CLI commands fail with "Access token not provided":
```bash
npx supabase login
```

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
- The token is written directly to the config during install — no shell env vars needed
- Use MCP tools to query tables, run migrations, and manage the Supabase project directly from Claude Code

## Routes (folder-based, explicit config in `routes.ts`)
- `routes/auth/` - Public (login, signup, forgot-password, callback)
- `routes/app/` - Protected (dashboard, settings)
- `routes/app/_layout.tsx` acts as auth guard for all nested routes
- `routes/auth/_layout.tsx` provides centered card layout for auth pages
