#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import prompts from 'prompts';

const TEMPLATE_REPO = 'alta/alta-boilerplate';
const BRANCH = 'main';

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
        type: 'select',
        name: 'supabaseSetup',
        message: 'How do you want to configure Supabase?',
        choices: [
          { title: 'Enter credentials manually', value: 'manual' },
          { title: 'Skip for now (use .env.example later)', value: 'skip' },
        ],
      },
      {
        type: (_, values) => (values.supabaseSetup === 'manual' ? 'text' : null),
        name: 'supabaseUrl',
        message: 'Supabase URL:',
        initial: 'http://localhost:54321',
      },
      {
        type: (_, values) => (values.supabaseSetup === 'manual' ? 'text' : null),
        name: 'supabaseAnonKey',
        message: 'Supabase Anon Key:',
      },
    ],
    {
      onCancel: () => {
        console.log('\n  Cancelled.\n');
        process.exit(0);
      },
    }
  );

  const projectName = argName || response.projectName;
  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.error(`\n  Error: Directory "${projectName}" already exists.\n`);
    process.exit(1);
  }

  // Clone template
  console.log(`\n  Downloading template...\n`);

  const hasDegit = canRun('npx --version');
  if (hasDegit) {
    run(`npx --yes degit ${TEMPLATE_REPO}#${BRANCH} "${projectName}"`, process.cwd());
  } else {
    run(`git clone --depth 1 https://github.com/${TEMPLATE_REPO}.git "${projectName}"`, process.cwd());
    fs.rmSync(path.join(targetDir, '.git'), { recursive: true, force: true });
  }

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

  // Write .env file
  if (response.supabaseSetup === 'manual') {
    const envContent = [
      `VITE_SUPABASE_URL=${response.supabaseUrl || 'http://localhost:54321'}`,
      `VITE_SUPABASE_ANON_KEY=${response.supabaseAnonKey || 'your-anon-key-here'}`,
      '',
    ].join('\n');
    fs.writeFileSync(path.join(targetDir, '.env'), envContent);
    console.log('  Created .env with your Supabase credentials.\n');
  }

  // Install dependencies
  console.log('  Installing dependencies...\n');
  const hasPnpm = canRun('pnpm --version');
  if (hasPnpm) {
    run('pnpm install', targetDir);
  } else {
    console.log('  pnpm not found. Install it with: npm install -g pnpm');
    console.log('  Then run: cd ' + projectName + ' && pnpm install\n');
  }

  // Init git
  run('git init', targetDir);
  run('git add -A', targetDir);
  try {
    run('git commit -m "Initial commit from create-alta-app"', targetDir);
  } catch {
    // git commit can fail if no user is configured
  }

  console.log(`\n  Done! Your project is ready.\n`);
  console.log(`  Next steps:\n`);
  console.log(`    cd ${projectName}`);
  if (response.supabaseSetup !== 'manual') {
    console.log(`    cp .env.example .env   # Add your Supabase credentials`);
  }
  console.log(`    pnpm dev`);
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
