#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import prompts from 'prompts';
import ora from 'ora';
import pc from 'picocolors';

const TEMPLATE_REPO = 'adiel-hub/alta-boilerplate';
const BRANCH = 'main';
const ALTA_SERVICE_URL = 'https://ikbbbmmzxeemjwzrzsmt.supabase.co/functions/v1/create-project';

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: 'ignore' });
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
  const appDir = path.join(targetDir, 'app');

  fs.rmSync(path.join(appDir, 'routes', 'auth'), { recursive: true, force: true });
  fs.unlinkSync(path.join(appDir, 'providers', 'auth-provider.tsx'));
  fs.writeFileSync(path.join(appDir, 'providers', 'index.ts'), '');

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

  fs.writeFileSync(
    path.join(appDir, 'root.tsx'),
    `import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import './styles/tailwind.css';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/alta-icon.png" />
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
  return <Outlet />;
}
`
  );

  fs.writeFileSync(
    path.join(appDir, 'components', 'layout', 'header.tsx'),
    `import { Separator } from '@altahq/design-system/components/ui/separator';
import { Text } from '@altahq/design-system/components/ui/text';

export function Header() {
  return (
    <header className="flex h-14 items-center gap-2 border-b px-4">
      <Separator orientation="vertical" className="h-4" />
      <div className="ml-auto flex items-center gap-3">
        <Text variant="muted">Alta App</Text>
      </div>
    </header>
  );
}
`
  );

  fs.writeFileSync(
    path.join(appDir, 'routes', 'app', 'dashboard.tsx'),
    `import { Card, CardContent, CardHeader, CardTitle } from '@altahq/design-system/components/ui/card';
import { Text } from '@altahq/design-system/components/ui/text';
import { Badge } from '@altahq/design-system/components/ui/badge';
import { Separator } from '@altahq/design-system/components/ui/separator';

export default function DashboardRoute() {
  return (
    <div className="space-y-6">
      <div>
        <Text variant="heading3">Dashboard</Text>
        <Text variant="muted" className="mt-1">Welcome to your app</Text>
      </div>
      <Separator />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            <Badge variant="default">Active</Badge>
          </CardHeader>
          <CardContent>
            <Text variant="heading3">All systems go</Text>
            <Text variant="small" className="mt-1 text-muted-foreground">Your app is running smoothly</Text>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <Text variant="heading3">Development</Text>
            <Text variant="small" className="mt-1 text-muted-foreground">Local dev server</Text>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Framework</CardTitle>
          </CardHeader>
          <CardContent>
            <Text variant="heading3">Alta</Text>
            <Text variant="small" className="mt-1 text-muted-foreground">React + Supabase + Vercel</Text>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`
  );

  fs.writeFileSync(
    path.join(appDir, 'routes', 'app', 'settings.tsx'),
    `import { Card, CardContent, CardHeader, CardTitle } from '@altahq/design-system/components/ui/card';
import { Text } from '@altahq/design-system/components/ui/text';

export default function SettingsRoute() {
  return (
    <div className="space-y-6">
      <div>
        <Text variant="heading3">Settings</Text>
        <Text variant="muted" className="mt-1">Manage your app preferences</Text>
      </div>
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
  console.log('');
  console.log(pc.bold(pc.magenta('  ✦ create-alta-app')));
  console.log(pc.dim('  Full-stack project scaffolding'));
  console.log('');

  const argName = process.argv[2];

  const response = await prompts(
    [
      {
        type: argName ? null : 'text',
        name: 'projectName',
        message: 'Project name',
        initial: 'my-alta-app',
        validate: (v) => (v.length > 0 ? true : 'Project name is required'),
      },
      {
        type: 'password',
        name: 'password',
        message: 'Alta password',
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
    console.log(`\n  ${pc.red('✗')} Directory ${pc.bold(`"${projectName}"`)} already exists.\n`);
    process.exit(1);
  }

  console.log('');

  // ── Step 1: Clone template ──
  const spinnerClone = ora({ text: 'Downloading template...', indent: 2 }).start();
  try {
    run(`npx --yes degit ${TEMPLATE_REPO}#${BRANCH} "${projectName}"`, process.cwd());

    const cliDir = path.join(targetDir, 'packages', 'create-alta-app');
    if (fs.existsSync(cliDir)) fs.rmSync(cliDir, { recursive: true, force: true });
    const packagesDir = path.join(targetDir, 'packages');
    if (fs.existsSync(packagesDir) && fs.readdirSync(packagesDir).length === 0) {
      fs.rmSync(packagesDir, { recursive: true, force: true });
    }

    const rootPkgPath = path.join(targetDir, 'package.json');
    const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf-8'));
    rootPkg.name = projectName;
    fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n');

    spinnerClone.succeed(pc.green('Template downloaded'));
  } catch (err) {
    spinnerClone.fail(pc.red('Failed to download template'));
    throw err;
  }

  // ── Step 2: Remove auth if not needed ──
  if (!response.includeAuth) {
    const spinnerAuth = ora({ text: 'Removing authentication...', indent: 2 }).start();
    try {
      removeAuth(targetDir);
      spinnerAuth.succeed(pc.green('Authentication removed'));
    } catch (err) {
      spinnerAuth.fail(pc.red('Failed to remove auth'));
      throw err;
    }
  }

  // ── Step 3: Create cloud projects ──
  const spinnerCloud = ora({ text: 'Creating Supabase & Vercel projects...', indent: 2 }).start();
  let credentials;
  try {
    credentials = await createProject(projectName, response.password);
    spinnerCloud.succeed(pc.green('Cloud projects created'));
  } catch (err) {
    spinnerCloud.fail(pc.yellow('Could not create cloud projects'));
    console.log(`  ${pc.dim(err.message)}`);
    console.log(`  ${pc.dim('You can set up manually later.')}`);
    credentials = null;
  }

  // ── Step 4: Write env files ──
  if (credentials) {
    const spinnerEnv = ora({ text: 'Writing environment variables...', indent: 2 }).start();
    const env = [
      `VITE_SUPABASE_URL=${credentials.supabaseUrl}`,
      `VITE_SUPABASE_ANON_KEY=${credentials.supabaseAnonKey}`,
      `SUPABASE_PROJECT_REF=${credentials.supabaseProjectRef}`,
      `SUPABASE_DB_PASSWORD=${credentials.dbPassword}`,
      `DATABASE_URL=${credentials.databaseUrl}`,
      '',
    ].join('\n');
    fs.writeFileSync(path.join(targetDir, '.env'), env);
    spinnerEnv.succeed(pc.green('Environment configured'));
  }

  // ── Step 5: Install dependencies ──
  if (canRun('pnpm --version')) {
    const spinnerInstall = ora({ text: 'Installing dependencies...', indent: 2 }).start();
    try {
      run('pnpm install', targetDir);
      spinnerInstall.succeed(pc.green('Dependencies installed'));
    } catch {
      spinnerInstall.fail(pc.yellow('Failed to install dependencies'));
      console.log(`  ${pc.dim(`Run: cd ${projectName} && pnpm install`)}`);
    }
  } else {
    console.log(`  ${pc.yellow('⚠')} pnpm not found. Install it: ${pc.bold('npm install -g pnpm')}`);
    console.log(`  ${pc.dim(`Then run: cd ${projectName} && pnpm install`)}`);
  }

  // ── Step 6: Init git + push ──
  const spinnerGit = ora({ text: 'Initializing git...', indent: 2 }).start();
  try {
    run('git init', targetDir);
    run('git add -A', targetDir);
    run('git commit -m "Initial commit from create-alta-app"', targetDir);
    spinnerGit.succeed(pc.green('Git initialized'));
  } catch {
    spinnerGit.warn(pc.yellow('Git init completed (commit may have failed)'));
  }

  if (credentials?.githubRepoUrl) {
    const spinnerPush = ora({ text: 'Pushing to GitHub...', indent: 2 }).start();
    try {
      run(`git remote add origin ${credentials.githubRepoUrl}`, targetDir);
      run('git branch -M main', targetDir);
      run('git push -u origin main', targetDir);
      spinnerPush.succeed(pc.green('Pushed to GitHub'));
    } catch {
      spinnerPush.warn(pc.yellow('Could not push to GitHub'));
      console.log(`  ${pc.dim('Push manually: git push -u origin main')}`);
    }
  }

  // ── Done ──
  console.log('');
  console.log(pc.bold(pc.green('  ✦ Your project is ready!')));
  console.log('');

  if (credentials) {
    console.log(`  ${pc.dim('Supabase')}  ${credentials.supabaseUrl}`);
    if (credentials.vercelUrl) {
      console.log(`  ${pc.dim('Vercel')}    ${credentials.vercelUrl}`);
    }
    if (credentials.githubRepoUrl) {
      console.log(`  ${pc.dim('GitHub')}    ${credentials.githubRepoUrl}`);
    }
    console.log(`  ${pc.dim('DB pass')}   ${pc.yellow(credentials.dbPassword)}  ${pc.dim('(save this!)')}`);
    console.log('');
    console.log(`  ${pc.dim('Auto-deploy: every push to GitHub deploys to Vercel')}`);
    console.log('');
  }

  console.log(pc.bold('  Next steps:'));
  console.log('');
  console.log(`    ${pc.cyan(`cd ${projectName}`)}`);
  console.log(`    ${pc.cyan('pnpm dev')}`);
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
