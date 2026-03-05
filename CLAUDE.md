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
- **ALWAYS use `@altahq/design-system` first** for buttons, inputs, colors, typography, and all UI components
- Only use plain Tailwind or other components if the design system doesn't have what you need
- Import from: `import { Button, Input, ... } from '@altahq/design-system'`

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
- `pnpm deploy` - **Preview deploy** (gives a unique preview URL to test)
- `pnpm deploy:prod` - **Production deploy** (updates the live site)
- Preview deploys are created per push — each gets a unique URL like `https://project-xyz123.vercel.app`
- Production deploy updates `https://<project-name>.vercel.app`
- **ONLY run `pnpm deploy:prod` when the user explicitly asks** (e.g. "deploy to production", "go live")
- After making code changes, **always commit, push, and deploy a preview**:
  ```
  git add -A && git commit -m "description" && git push && pnpm deploy
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
- View logs: `npx supabase functions logs <function-name> --project-ref $SUPABASE_PROJECT_REF`
- Set secrets: `npx supabase secrets set KEY=value --project-ref $SUPABASE_PROJECT_REF`
- List secrets: `npx supabase secrets list --project-ref $SUPABASE_PROJECT_REF`
- The `SUPABASE_PROJECT_REF` is in `.env`

## Environment Variables

### `.env` (root, gitignored) — App runtime + DB credentials
| Variable | Purpose | Used by |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | App (browser, via Vite) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | App (browser, via Vite) |
| `SUPABASE_PROJECT_REF` | Project reference ID | DB commands, edge function deploys |
| `SUPABASE_DB_PASSWORD` | Database password | Reference only |
| `DATABASE_URL` | Full Postgres connection string | `db:push`, `db:diff`, `db:gen-types` |
| `GITHUB_TOKEN` | GitHub PAT for push access | Git remote (embedded in origin URL) |
| `GITHUB_REPO` | GitHub org/repo (e.g. `adiel-hub/my-app`) | Reference, remote URL reconstruction |
| `VERCEL_URL` | Vercel production URL | Reference |
| `SUPABASE_DASHBOARD` | Supabase dashboard link | Reference |

### Vercel env vars (set automatically during project creation)
| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Same as local — used at build time |
| `VITE_SUPABASE_ANON_KEY` | Same as local — used at build time |

These are set on the Vercel project for all environments (production, preview, development).
To update them: `vercel env add VITE_SUPABASE_URL` or via the Vercel dashboard.

### `supabase/.env.local` (gitignored) — Admin secrets for the create-project edge function
These are NOT needed for app development — only for the Alta CLI provisioning service.

## Git & GitHub

This project is pre-configured with a GitHub remote that includes authentication. You can push immediately without any GitHub setup:

```bash
git add -A && git commit -m "your message" && git push
```

- The remote URL has an embedded access token — no SSH keys or GitHub login needed
- The remote points to a private repo under the `adiel-hub` GitHub org
- **Never share or log the remote URL** — it contains a secret token
- To check the remote: `git remote -v`
- The token grants push access to this specific repo
- If the remote stops working (e.g. token rotated), re-set it using the `GITHUB_TOKEN` from `.env`:
  ```bash
  git remote set-url origin https://$GITHUB_TOKEN@github.com/$GITHUB_REPO.git
  ```

### Typical workflow
1. Make changes
2. Commit and push: `git add -A && git commit -m "description" && git push`
3. Preview deploy: `pnpm deploy` (or auto-deploys on push via Vercel)
4. Production deploy: `pnpm deploy:prod` (only when explicitly asked)

## MCP
- Supabase MCP is configured in `.claude/mcp.json`
- Use MCP tools to query, migrate, and manage the Supabase project directly from Claude Code

## Routes (folder-based, explicit config in `routes.ts`)
- `routes/auth/` - Public (login, signup, forgot-password, callback)
- `routes/app/` - Protected (dashboard, settings)
- `routes/app/_layout.tsx` acts as auth guard for all nested routes
- `routes/auth/_layout.tsx` provides centered card layout for auth pages
