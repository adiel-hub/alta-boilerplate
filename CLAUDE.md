# Alta Boilerplate

## Tech Stack
- React 19 + React Router v7 (framework mode, SPA) + Vite
- Tailwind CSS v4
- TanStack Query v5 + Supabase
- TypeScript (strict mode)
- pnpm monorepo with Turborepo

## Monorepo Structure
- `apps/web` - React SPA
- `packages/supabase` - DB config, migrations, edge functions, generated types
- `packages/shared` - Shared schemas, types, utils
- `packages/eslint-config` - Shared ESLint config
- `packages/typescript-config` - Shared tsconfig

## UI Components
- **ALWAYS use `@altahq/design-system` first** for buttons, inputs, colors, typography, and all UI components
- Only use plain Tailwind or other components if the design system doesn't have what you need
- Import from: `import { Button, Input, ... } from '@altahq/design-system'`

## Conventions
- File naming: kebab-case
- Zod for validation, derive types with `z.infer<typeof schema>`
- TanStack Query with query key factory (`lib/query/query-keys.ts`)
- Supabase client singleton (`lib/supabase/client.ts`)
- Auth via React context provider (`providers/auth-provider.tsx`)
- Protected routes via `_app.tsx` layout route
- Barrel exports via `index.ts` files

## Commands
- `pnpm dev` - Start dev server
- `pnpm build` - Build all packages
- `pnpm type-check` - TypeScript check
- `pnpm format` - Format with Prettier
- `pnpm format:check` - Check formatting
- `pnpm --filter @alta/supabase db:start` - Start local Supabase
- `pnpm --filter @alta/supabase gen-types` - Generate DB types

## Routes
- `_auth.*` routes - Public (login, signup, forgot-password, callback)
- `_app.*` routes - Protected (dashboard, settings)
- `_app.tsx` acts as auth guard for all nested routes
