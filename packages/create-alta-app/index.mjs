#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import prompts from 'prompts';

const TEMPLATE_REPO = 'adiel-hub/alta-boilerplate';
const BRANCH = 'main';

// ── Alta project provisioning service ──
const ALTA_SERVICE_URL = 'https://ikbbbmmzxeemjwzrzsmt.supabase.co/functions/v1/create-project';

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function canRun(cmd) {
  try {
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function createProject(name, password) {
  const res = await fetch(ALTA_SERVICE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': password,
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Server error: ${res.status}`);
  }

  return res.json();
}

function removeAuth(targetDir) {
  const appDir = path.join(targetDir, 'apps', 'web', 'app');

  // Remove auth routes
  fs.rmSync(path.join(appDir, 'routes', 'auth'), { recursive: true, force: true });

  // Remove auth provider
  fs.unlinkSync(path.join(appDir, 'providers', 'auth-provider.tsx'));

  // Rewrite routes.ts — no auth routes
  fs.writeFileSync(
    path.join(appDir, 'routes.ts'),
    `import { type RouteConfig, route, layout } from '@react-router/dev/routes';

export default [
  route('/', './routes/_index.tsx'),

  layout('./routes/app/_layout.tsx', [
    route('dashboard', './routes/app/dashboard.tsx'),
    route('settings', './routes/app/settings.tsx'),
  ]),
] satisfies RouteConfig;
`
  );

  // Rewrite _index.tsx — redirect to dashboard (useEffect for SPA pre-render compat)
  fs.writeFileSync(
    path.join(appDir, 'routes', '_index.tsx'),
    `import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function IndexRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return null;
}
`
  );

  // Rewrite app/_layout.tsx — no auth guard
  fs.writeFileSync(
    path.join(appDir, 'routes', 'app', '_layout.tsx'),
    `import { Outlet } from 'react-router';
import { AppSidebar } from '~/components/layout/sidebar';
import { Header } from '~/components/layout/header';

export default function AppLayoutRoute() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
`
  );

  // Rewrite root.tsx — no AuthProvider
  fs.writeFileSync(
    path.join(appDir, 'root.tsx'),
    `import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { QueryProvider } from '~/providers/query-provider';
import './styles/tailwind.css';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}

export default function Root() {
  return (
    <QueryProvider>
      <Outlet />
    </QueryProvider>
  );
}
`
  );

  // Rewrite header.tsx — no user/signOut
  fs.writeFileSync(
    path.join(appDir, 'components', 'layout', 'header.tsx'),
    `import { Separator } from '@altahq/design-system/components/ui/separator';
import { Text } from '@altahq/design-system/components/ui/text';

export function Header() {
  return (
    <header className="flex items-center gap-2 border-b px-4 py-2">
      <Separator orientation="vertical" className="h-4" />
      <div className="ml-auto flex items-center gap-4">
        <Text variant="muted">Alta App</Text>
      </div>
    </header>
  );
}
`
  );

  // Rewrite dashboard — no user reference
  fs.writeFileSync(
    path.join(appDir, 'routes', 'app', 'dashboard.tsx'),
    `import { Card, CardContent, CardHeader, CardTitle } from '@altahq/design-system/components/ui/card';
import { Text } from '@altahq/design-system/components/ui/text';

export default function DashboardRoute() {
  return (
    <div>
      <Text variant="heading3" className="mb-4">
        Dashboard
      </Text>
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <Text variant="muted">Your app is ready.</Text>
        </CardContent>
      </Card>
    </div>
  );
}
`
  );

  // Rewrite settings — no user reference
  fs.writeFileSync(
    path.join(appDir, 'routes', 'app', 'settings.tsx'),
    `import { Card, CardContent, CardHeader, CardTitle } from '@altahq/design-system/components/ui/card';
import { Text } from '@altahq/design-system/components/ui/text';

export default function SettingsRoute() {
  return (
    <div>
      <Text variant="heading3" className="mb-4">
        Settings
      </Text>
      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Text variant="paragraph">Configure your app here.</Text>
        </CardContent>
      </Card>
    </div>
  );
}
`
  );
}

async function main() {
  console.log('\n  create-alta-app\n');

  const argName = process.argv[2];

  const response = await prompts(
    [
      {
        type: argName ? null : 'text',
        name: 'projectName',
        message: 'Project name:',
        initial: 'my-alta-app',
        validate: (v) => (v.length > 0 ? true : 'Project name is required'),
      },
      {
        type: 'password',
        name: 'password',
        message: 'Alta password:',
        validate: (v) => (v.length > 0 ? true : 'Password is required'),
      },
      {
        type: 'toggle',
        name: 'includeAuth',
        message: 'Include Supabase authentication? (login, signup, forgot password)',
        initial: true,
        active: 'Yes',
        inactive: 'No',
      },
    ],
    { onCancel: () => process.exit(0) }
  );

  const projectName = argName || response.projectName;
  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.error(`\n  Error: Directory "${projectName}" already exists.\n`);
    process.exit(1);
  }

  // ── Clone template ──
  console.log('  Downloading template...\n');
  run(`npx --yes degit ${TEMPLATE_REPO}#${BRANCH} "${projectName}"`, process.cwd());

  // Remove the create-alta-app package from the cloned template
  const cliDir = path.join(targetDir, 'packages', 'create-alta-app');
  if (fs.existsSync(cliDir)) {
    fs.rmSync(cliDir, { recursive: true, force: true });
  }

  // Update package.json name
  const rootPkgPath = path.join(targetDir, 'package.json');
  const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf-8'));
  rootPkg.name = projectName;
  fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n');

  // ── Remove auth if not needed ──
  if (!response.includeAuth) {
    console.log('  Removing auth...\n');
    removeAuth(targetDir);
  }

  // ── Create Supabase + Vercel projects ──
  console.log('  Creating Supabase & Vercel projects...\n');

  let credentials;
  try {
    credentials = await createProject(projectName, response.password);
  } catch (err) {
    console.error(`  Error creating projects: ${err.message}`);
    console.error('  You can set up manually later with: bash scripts/setup.sh\n');
    credentials = null;
  }

  if (credentials) {
    // Write apps/web/.env — used by Vite dev server and Vercel builds
    const webEnv = [
      `VITE_SUPABASE_URL=${credentials.supabaseUrl}`,
      `VITE_SUPABASE_ANON_KEY=${credentials.supabaseAnonKey}`,
      '',
    ].join('\n');
    fs.writeFileSync(path.join(targetDir, 'apps', 'web', '.env'), webEnv);

    // Write packages/supabase/.env — used by supabase CLI for migrations & dev
    const supabaseEnv = [
      `SUPABASE_PROJECT_REF=${credentials.supabaseProjectRef}`,
      `SUPABASE_DB_PASSWORD=${credentials.dbPassword}`,
      `DATABASE_URL=${credentials.databaseUrl}`,
      '',
    ].join('\n');
    fs.writeFileSync(path.join(targetDir, 'packages', 'supabase', '.env'), supabaseEnv);

    console.log('  Supabase project created.');
    if (credentials.vercelUrl) {
      console.log('  Vercel project created.');
    }
    console.log('');
  }

  // ── Install dependencies ──
  console.log('  Installing dependencies...\n');
  if (canRun('pnpm --version')) {
    run('pnpm install', targetDir);
  } else {
    console.log('  pnpm not found. Install it with: npm install -g pnpm');
    console.log(`  Then run: cd ${projectName} && pnpm install\n`);
  }

  // ── Init git + push to GitHub ──
  run('git init', targetDir);
  run('git add -A', targetDir);
  try {
    run('git commit -m "Initial commit from create-alta-app"', targetDir);
  } catch {
    // git commit can fail if no user is configured
  }

  if (credentials?.githubRepoUrl) {
    console.log('  Pushing to GitHub...\n');
    try {
      run(`git remote add origin ${credentials.githubRepoUrl}`, targetDir);
      run('git branch -M main', targetDir);
      run('git push -u origin main', targetDir);
      console.log('  Pushed to GitHub.\n');
    } catch {
      console.log('  Could not push to GitHub. Push manually with: git push -u origin main\n');
    }
  }

  // ── Done ──
  console.log(`\n  Done! Your project is ready.\n`);
  if (credentials) {
    console.log(`  Supabase:  ${credentials.supabaseUrl}`);
    if (credentials.vercelUrl) {
      console.log(`  Vercel:    ${credentials.vercelUrl}`);
    }
    if (credentials.githubRepoUrl) {
      console.log(`  GitHub:    ${credentials.githubRepoUrl}`);
    }
    console.log(`  DB pass:   ${credentials.dbPassword}  (save this!)`);
    console.log('');
    console.log('  Auto-deploy: every push deploys to Vercel');
    console.log('');
  }
  console.log(`  Next steps:\n`);
  console.log(`    cd ${projectName}`);
  console.log(`    pnpm dev`);
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
