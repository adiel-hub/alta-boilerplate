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
const ALTA_FINALIZE_URL = 'https://ikbbbmmzxeemjwzrzsmt.supabase.co/functions/v1/finalize-project';

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

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
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
    `export function Header() {
  return (
    <header className="flex h-14 items-center justify-end border-b px-4" />
  );
}
`
  );

  fs.writeFileSync(
    path.join(appDir, 'routes', 'app', 'dashboard.tsx'),
    `export default function DashboardRoute() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
    </div>
  );
}
`
  );

  fs.writeFileSync(
    path.join(appDir, 'routes', 'app', 'settings.tsx'),
    `export default function SettingsRoute() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
    </div>
  );
}
`
  );
}

async function main() {
  console.clear();
  console.log('');
  const W = 44;
  const line = (s) => pc.magenta('   ┃') + pc.bold(pc.white(s.padEnd(W))) + pc.magenta('┃');
  const dim  = (s) => pc.magenta('   ┃') + pc.dim(s.padEnd(W)) + pc.magenta('┃');
  const empty = () => pc.magenta('   ┃') + ' '.repeat(W) + pc.magenta('┃');
  console.log(pc.magenta('   ┏' + '━'.repeat(W) + '┓'));
  console.log(empty());
  console.log(line('     █████╗ ██╗  ████████╗█████╗ '));
  console.log(line('    ██╔══██╗██║  ╚══██╔══╝██╔══██╗'));
  console.log(line('    ███████║██║     ██║   ███████║'));
  console.log(line('    ██╔══██║██║     ██║   ██╔══██║'));
  console.log(line('    ██║  ██║███████╗██║   ██║  ██║'));
  console.log(line('    ╚═╝  ╚═╝╚══════╝╚═╝   ╚═╝  ╚═╝'));
  console.log(empty());
  console.log(dim('    The Full-Stack Project Scaffolder'));
  console.log(dim('  React · Supabase · Vercel · Claude Skills'));
  console.log(empty());
  console.log(pc.magenta('   ┗' + '━'.repeat(W) + '┛'));
  console.log('');

  // Install under apps/ai-engineer/ relative to cwd (the monorepo root)
  const MONOREPO_BASE = path.join(process.cwd(), 'apps', 'ai-engineer');
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

  // Always install under the Nx monorepo
  if (!fs.existsSync(MONOREPO_BASE)) {
    fs.mkdirSync(MONOREPO_BASE, { recursive: true });
  }

  const targetDir = path.resolve(MONOREPO_BASE, projectName);

  if (fs.existsSync(targetDir)) {
    console.log(`\n  ${pc.red('✗')} Directory ${pc.bold(`"${projectName}"`)} already exists.\n`);
    process.exit(1);
  }

  console.log('');

  // ── Step 1: Clone template ──
  const spinnerClone = ora({ text: 'Downloading template...', indent: 2 }).start();
  try {
    run(`npx --yes degit ${TEMPLATE_REPO}#${BRANCH} "${targetDir}"`, process.cwd());

    const cliDir = path.join(targetDir, 'packages', 'create-alta-app');
    if (fs.existsSync(cliDir)) fs.rmSync(cliDir, { recursive: true, force: true });
    const packagesDir = path.join(targetDir, 'packages');
    if (fs.existsSync(packagesDir) && fs.readdirSync(packagesDir).length === 0) {
      fs.rmSync(packagesDir, { recursive: true, force: true });
    }
    const scriptsDir = path.join(targetDir, 'scripts');
    if (fs.existsSync(scriptsDir)) fs.rmSync(scriptsDir, { recursive: true, force: true });

    const rootPkgPath = path.join(targetDir, 'package.json');
    const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf-8'));
    rootPkg.name = projectName;
    fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n');

    // Generate Nx project.json
    const nxProject = {
      name: projectName,
      $schema: '../../node_modules/nx/schemas/project-schema.json',
      sourceRoot: `apps/ai-engineer/${projectName}/src`,
      projectType: 'application',
      tags: [],
      targets: {
        build: {
          executor: '@nx/vite:build',
          outputs: ['{options.outputPath}'],
          defaultConfiguration: 'production',
          options: {
            outputPath: `dist/apps/ai-engineer/${projectName}`,
            emptyOutDir: true,
          },
          configurations: {
            development: { mode: 'development' },
            staging: { mode: 'staging' },
            production: { mode: 'production' },
          },
        },
        serve: {
          executor: 'nx:run-commands',
          defaultConfiguration: 'development',
          options: {
            command: 'npx react-router dev',
            cwd: `apps/ai-engineer/${projectName}`,
          },
          configurations: {
            development: {},
            production: {},
          },
        },
        preview: {
          executor: '@nx/vite:preview-server',
          defaultConfiguration: 'development',
          options: {
            buildTarget: `${projectName}:build`,
          },
          configurations: {
            development: {
              buildTarget: `${projectName}:build:development`,
            },
            production: {
              buildTarget: `${projectName}:build:production`,
            },
          },
          dependsOn: ['build'],
        },
        test: {
          executor: '@nx/vitest:test',
          outputs: ['{options.reportsDirectory}'],
          options: {
            passWithNoTests: true,
            reportsDirectory: `../../coverage/apps/ai-engineer/${projectName}`,
          },
        },
        lint: {
          executor: '@nx/eslint:lint',
          outputs: ['{options.outputFile}'],
        },
      },
    };
    fs.writeFileSync(
      path.join(targetDir, 'project.json'),
      JSON.stringify(nxProject, null, 2) + '\n'
    );

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

  // ── Step 4: Wait for Supabase project to provision & get anon key ──
  let anonKey = '';
  if (credentials) {
    const spinnerKeys = ora({ text: 'Waiting for Supabase project to provision...', indent: 2 }).start();
    const ref = credentials.supabaseProjectRef;

    for (let i = 0; i < 24; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      try {
        const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys`, {
          headers: { Authorization: `Bearer ${credentials.supabaseToken}` },
        });
        if (res.ok) {
          const keys = await res.json();
          const found = keys.find((k) => k.name === 'anon');
          if (found) {
            anonKey = found.api_key;
            break;
          }
        }
      } catch {}
    }

    if (anonKey) {
      spinnerKeys.succeed(pc.green('Supabase project ready'));

      // Finalize: disable email confirmation, set shared secrets, set Vercel anon key
      try {
        await fetch(ALTA_FINALIZE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': response.password,
          },
          body: JSON.stringify({
            projectRef: ref,
            anonKey,
            vercelProjectId: credentials.vercelProjectId || '',
          }),
        });
      } catch {}
    } else {
      spinnerKeys.warn(pc.yellow('Keys not ready yet — check Supabase dashboard'));
    }
  }

  // ── Step 5: Write project config ──
  if (credentials) {
    const spinnerEnv = ora({ text: 'Writing project config...', indent: 2 }).start();
    const altaConfig = {
      supabaseProjectRef: credentials.supabaseProjectRef,
      supabaseUrl: credentials.supabaseUrl,
      supabaseAnonKey: anonKey,
      vercelProjectName: projectName,
      vercelUrl: credentials.vercelUrl || '',
    };
    fs.writeFileSync(
      path.join(targetDir, 'alta.config.json'),
      JSON.stringify(altaConfig, null, 2) + '\n'
    );
    spinnerEnv.succeed(pc.green('Project configured'));
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


  // ── Step 6: Login & link Supabase + Vercel ──
  if (credentials) {
    const spinnerLink = ora({ text: 'Linking Supabase project...', indent: 2 }).start();
    try {
      run(`npx supabase login --token ${credentials.supabaseToken}`, targetDir);
      run(`npx supabase link --project-ref ${credentials.supabaseProjectRef}`, targetDir);
      spinnerLink.succeed(pc.green('Supabase project linked'));
    } catch {
      spinnerLink.warn(pc.yellow('Could not link Supabase project'));
      console.log(`  ${pc.dim(`Run manually: npx supabase login && npx supabase link --project-ref ${credentials.supabaseProjectRef}`)}`);
    }

    const spinnerVercel = ora({ text: 'Authenticating Vercel CLI...', indent: 2 }).start();
    try {
      // Persist Vercel auth globally so user doesn't need --token on every command
      const vercelConfigDir = path.join(process.env.HOME, 'Library', 'Application Support', 'com.vercel.cli');
      if (!fs.existsSync(vercelConfigDir)) fs.mkdirSync(vercelConfigDir, { recursive: true });

      fs.writeFileSync(
        path.join(vercelConfigDir, 'auth.json'),
        JSON.stringify({ token: credentials.vercelToken }) + '\n'
      );

      // Set current team scope
      const configPath = path.join(vercelConfigDir, 'config.json');
      let vercelConfig = {};
      if (fs.existsSync(configPath)) {
        vercelConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
      vercelConfig.currentTeam = credentials.vercelTeamId;
      fs.writeFileSync(configPath, JSON.stringify(vercelConfig, null, 2) + '\n');

      // Link the project to Vercel
      run(`npx vercel link --project ${projectName} --yes`, targetDir);
      spinnerVercel.succeed(pc.green('Vercel authenticated & project linked'));
    } catch {
      spinnerVercel.warn(pc.yellow('Could not link Vercel project'));
      console.log(`  ${pc.dim('Deploy manually: cd ' + projectName + ' && pnpm run deploy')}`);
    }
  }

  // ── Step 7: Write project-specific MCP config ──
  if (credentials) {
    const spinnerMcp = ora({ text: 'Configuring Claude MCP...', indent: 2 }).start();
    try {
      const claudeDir = path.join(targetDir, '.claude');
      if (!fs.existsSync(claudeDir)) fs.mkdirSync(claudeDir, { recursive: true });

      const mcpConfig = {
        mcpServers: {
          supabase: {
            url: `https://mcp.supabase.com/mcp`,
            headers: {
              'x-supabase-access-token': credentials.supabaseToken,
              'x-project-ref': credentials.supabaseProjectRef,
            },
          },
        },
      };
      fs.writeFileSync(
        path.join(claudeDir, 'mcp.json'),
        JSON.stringify(mcpConfig, null, 2) + '\n'
      );
      spinnerMcp.succeed(pc.green('Claude MCP configured'));
    } catch {
      console.log(`  ${pc.dim('Could not write .claude/mcp.json — configure MCP manually')}`);
    }
  }

  // ── Step 8: Install Claude Skills ──
  const spinnerSkills = ora({ text: 'Installing Claude Skills...', indent: 2 }).start();
  try {
    run('npx --yes skills add https://github.com/supabase/agent-skills --skill supabase-postgres-best-practices', targetDir);
    run('npx --yes skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices', targetDir);
    run('npx --yes skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines', targetDir);
    run('npx --yes skills add https://github.com/anthropics/skills --skill frontend-design', targetDir);
    spinnerSkills.succeed(pc.green('Claude Skills installed'));
  } catch {
    spinnerSkills.warn(pc.yellow('Could not install Claude Skills'));
    console.log(`  ${pc.dim('Install manually: npx skills add <package>')}`);
  }

  // ── Done ──
  console.log('');
  console.log(pc.bold(pc.green('  Your project is ready!')));
  console.log('');

  if (credentials) {
    console.log(`  ${pc.bold('Project Details:')}`);
    console.log('');
    console.log(`    ${pc.magenta('◆')} ${pc.dim('Supabase')}   ${credentials.supabaseUrl}`);
    if (credentials.vercelUrl) {
      console.log(`    ${pc.magenta('◆')} ${pc.dim('Vercel')}     ${credentials.vercelUrl} ${pc.dim('(first deploy may take a few minutes)')}`);
    }
    console.log(`    ${pc.magenta('◆')} ${pc.dim('Config')}     alta.config.json`);
    console.log(`    ${pc.magenta('◆')} ${pc.dim('Location')}   ${targetDir}`);
    console.log('');
  }

  // ── Step 9: Deploy to Vercel ──
  if (credentials?.vercelProjectName) {
    const spinnerDeploy = ora({ text: 'Deploying to Vercel...', indent: 2 }).start();
    try {
      run('pnpm run deploy', targetDir);
      spinnerDeploy.succeed(pc.green('Deployed to Vercel'));
    } catch {
      spinnerDeploy.warn(pc.yellow('Could not deploy to Vercel'));
      console.log(`  ${pc.dim('Deploy manually: cd ' + projectName + ' && pnpm run deploy')}`);
    }
  }

  // ── Step 10: Start dev server ──
  console.log(`  ${pc.bold('Starting dev server...')}`);
  console.log('');
  try {
    execSync('pnpm dev', { cwd: targetDir, stdio: 'inherit' });
  } catch {
    console.log('');
    console.log(`  ${pc.dim('To start manually:')}`);
    console.log(`    ${pc.cyan(`cd ${projectName}`)}`);
    console.log(`    ${pc.cyan('pnpm dev')}`);
    console.log('');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
