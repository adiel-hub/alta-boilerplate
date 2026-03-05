import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_ACCESS_TOKEN = Deno.env.get('ADMIN_SUPABASE_ACCESS_TOKEN')!;
const SUPABASE_ORG_ID = Deno.env.get('ADMIN_SUPABASE_ORG_ID')!;
const VERCEL_TOKEN = Deno.env.get('ADMIN_VERCEL_TOKEN')!;
const VERCEL_TEAM_ID = Deno.env.get('ADMIN_VERCEL_TEAM_ID') || '';
const GITHUB_TOKEN = Deno.env.get('ADMIN_GITHUB_TOKEN')!;
const GITHUB_ORG = Deno.env.get('ADMIN_GITHUB_ORG') || '';
const PASSWORD = Deno.env.get('PASSWORD')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const { name } = await req.json();
  if (!name || typeof name !== 'string') {
    return Response.json({ error: 'Project name is required' }, { status: 400, headers: corsHeaders });
  }

  const dbPassword = crypto.randomUUID().replace(/-/g, '') + 'Aa1!';

  try {
    // ── 1. Create GitHub repo ──
    console.log(`Creating GitHub repo: ${name}`);

    const ghRepoUrl = GITHUB_ORG
      ? `https://api.github.com/orgs/${GITHUB_ORG}/repos`
      : 'https://api.github.com/user/repos';

    const ghRes = await fetch(ghRepoUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({
        name,
        private: true,
        auto_init: false,
      }),
    });

    let githubRepoUrl = '';
    let githubFullName = '';
    if (ghRes.ok) {
      const ghRepo = await ghRes.json();
      githubRepoUrl = ghRepo.clone_url;
      githubFullName = ghRepo.full_name;
      console.log(`GitHub repo created: ${githubFullName}`);
    } else {
      const err = await ghRes.text();
      console.error(`GitHub repo creation failed: ${err}`);
    }

    // ── 2. Create Supabase project ──
    console.log(`Creating Supabase project: ${name}`);

    const sbRes = await fetch('https://api.supabase.com/v1/projects', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        organization_id: SUPABASE_ORG_ID,
        db_pass: dbPassword,
        region: 'us-east-1',
        plan: 'free',
      }),
    });

    if (!sbRes.ok) {
      const err = await sbRes.text();
      return Response.json({ error: `Supabase error: ${err}` }, { status: 500, headers: corsHeaders });
    }

    const sbProject = await sbRes.json();
    const projectRef = sbProject.id;
    const supabaseUrl = `https://${projectRef}.supabase.co`;

    // Wait for project to provision
    console.log('Waiting for project to provision...');
    let anonKey = '';
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 10000));

      const keysRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/api-keys`, {
        headers: { Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}` },
      });

      if (keysRes.ok) {
        const keys = await keysRes.json();
        const anonKeyObj = keys.find((k: { name: string }) => k.name === 'anon');
        if (anonKeyObj) {
          anonKey = anonKeyObj.api_key;
          break;
        }
      }
    }

    if (!anonKey) {
      return Response.json(
        { error: 'Project created but keys not ready yet. Check Supabase dashboard.', projectRef },
        { status: 202, headers: corsHeaders }
      );
    }

    // Build database URL for local development
    const databaseUrl = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

    // ── 3. Create Vercel project + connect to GitHub ──
    console.log(`Creating Vercel project: ${name}`);

    const vercelCreateUrl = VERCEL_TEAM_ID
      ? `https://api.vercel.com/v10/projects?teamId=${VERCEL_TEAM_ID}`
      : 'https://api.vercel.com/v10/projects';

    const vercelBody: Record<string, unknown> = {
      name,
      framework: 'vite',
      buildCommand: 'pnpm build',
      outputDirectory: 'build/client',
    };

    // Connect GitHub repo to Vercel for auto-deploy
    if (githubFullName) {
      vercelBody.gitRepository = {
        type: 'github',
        repo: githubFullName,
      };
    }

    const vcRes = await fetch(vercelCreateUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vercelBody),
    });

    let vercelProjectUrl = '';
    if (vcRes.ok) {
      const vcProject = await vcRes.json();
      vercelProjectUrl = `https://${name}.vercel.app`;

      // Set env vars on Vercel
      const envVars = [
        { key: 'VITE_SUPABASE_URL', value: supabaseUrl, target: ['production', 'preview', 'development'] },
        { key: 'VITE_SUPABASE_ANON_KEY', value: anonKey, target: ['production', 'preview', 'development'] },
      ];

      const envUrl = VERCEL_TEAM_ID
        ? `https://api.vercel.com/v10/projects/${vcProject.id}/env?teamId=${VERCEL_TEAM_ID}`
        : `https://api.vercel.com/v10/projects/${vcProject.id}/env`;

      for (const env of envVars) {
        await fetch(envUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: 'plain', ...env }),
        });
      }
    } else {
      const err = await vcRes.text();
      console.error(`Vercel project creation failed: ${err}`);
    }

    return Response.json(
      {
        supabaseUrl,
        supabaseAnonKey: anonKey,
        supabaseProjectRef: projectRef,
        databaseUrl,
        vercelUrl: vercelProjectUrl,
        githubRepoUrl,
        githubFullName,
        dbPassword,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error(err);
    return Response.json({ error: String(err) }, { status: 500, headers: corsHeaders });
  }
});
