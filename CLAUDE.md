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
- `pnpm dev` - Start dev server
- `pnpm build` - Build
- `pnpm type-check` - TypeScript check
- `pnpm format` - Format with Prettier
- `pnpm format:check` - Check formatting
- `pnpm db:gen-types` - Generate TypeScript types from DB schema (cloud)
- `pnpm db:push` - Push migrations to cloud
- `pnpm db:diff` - Diff schema changes
- `pnpm deploy` - Deploy preview to Vercel
- `pnpm deploy:prod` - Deploy production to Vercel
- `bash scripts/setup.sh` - First-time setup (creates cloud Supabase project + Vercel project + writes .env)

## Deployment
- Everything works on `main` — no branches
- After making code changes, **always commit, push, and deploy a preview**:
  ```
  git add -A && git commit -m "description" && git push && pnpm deploy
  ```
- `pnpm deploy` → **preview deploy** (gives a unique preview URL to test)
- **ONLY run `pnpm deploy:prod` when the user explicitly asks** (e.g. "deploy to production", "update production", "go live")
- Never deploy to production automatically — always preview first
- Vercel env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are set automatically during setup

## MCP
- Supabase MCP is configured in `.claude/mcp.json`
- Use MCP tools to query, migrate, and manage the Supabase project directly from Claude Code

## Routes (folder-based, explicit config in `routes.ts`)
- `routes/auth/` - Public (login, signup, forgot-password, callback)
- `routes/app/` - Protected (dashboard, settings)
- `routes/app/_layout.tsx` acts as auth guard for all nested routes
- `routes/auth/_layout.tsx` provides centered card layout for auth pages
