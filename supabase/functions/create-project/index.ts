import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_ACCESS_TOKEN = Deno.env.get('ADMIN_SUPABASE_ACCESS_TOKEN')!;
const SUPABASE_ORG_ID = Deno.env.get('ADMIN_SUPABASE_ORG_ID')!;
const VERCEL_TOKEN = Deno.env.get('ADMIN_VERCEL_TOKEN')!;
const VERCEL_TEAM_ID = Deno.env.get('ADMIN_VERCEL_TEAM_ID') || '';
const GITHUB_REPO = Deno.env.get('ADMIN_GITHUB_REPO') || ''; // e.g. "adiel-hub/alta"
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
    // ── 1. Create Supabase project ──
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

    // Build database URL for local development
    const databaseUrl = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

    // ── 2. Create Vercel project ──
    console.log(`Creating Vercel project: ${name}`);

    const vercelCreateUrl = VERCEL_TEAM_ID
      ? `https://api.vercel.com/v10/projects?teamId=${VERCEL_TEAM_ID}`
      : 'https://api.vercel.com/v10/projects';

    const vercelBody: Record<string, unknown> = {
      name,
      framework: 'vite',
      buildCommand: 'pnpm build',
      outputDirectory: 'build/client',
      rootDirectory: `apps/ai-engineer/${name}`,
      ignoreCommand: `git diff HEAD^ HEAD --quiet apps/ai-engineer/${name}`,
    };

    // Connect to the monorepo GitHub repo for auto-deploy
    if (GITHUB_REPO) {
      vercelBody.gitRepository = {
        type: 'github',
        repo: GITHUB_REPO,
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
    let vercelProjectId = '';
    if (vcRes.ok) {
      const vcProject = await vcRes.json();
      vercelProjectId = vcProject.id;
      vercelProjectUrl = `https://${name}.vercel.app`;

      // Set build-time env vars on Vercel (anon key will be set by the installer after polling)
      const allTargets = ['production', 'preview', 'development'];
      const envVars = [
        { key: 'VITE_SUPABASE_URL', value: supabaseUrl, target: allTargets, type: 'plain' },
      ];

      const envUrl = VERCEL_TEAM_ID
        ? `https://api.vercel.com/v10/projects/${vcProject.id}/env?teamId=${VERCEL_TEAM_ID}&upsert=true`
        : `https://api.vercel.com/v10/projects/${vcProject.id}/env?upsert=true`;

      // Send all env vars in a single batch request
      const envRes = await fetch(envUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(envVars),
      });

      if (!envRes.ok) {
        const envErr = await envRes.text();
        console.error(`Vercel env vars failed: ${envErr}`);
      } else {
        console.log('Vercel env vars set successfully');
      }
    } else {
      const err = await vcRes.text();
      console.error(`Vercel project creation failed: ${err}`);
    }

    return Response.json(
      {
        supabaseUrl,
        supabaseProjectRef: projectRef,
        supabaseToken: SUPABASE_ACCESS_TOKEN,
        databaseUrl,
        vercelUrl: vercelProjectUrl,
        vercelProjectId,
        vercelToken: VERCEL_TOKEN,
        dbPassword,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error(err);
    return Response.json({ error: String(err) }, { status: 500, headers: corsHeaders });
  }
});
