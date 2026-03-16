import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_ACCESS_TOKEN = Deno.env.get('ADMIN_SUPABASE_ACCESS_TOKEN')!;
const VERCEL_TOKEN = Deno.env.get('ADMIN_VERCEL_TOKEN')!;
const VERCEL_TEAM_ID = Deno.env.get('ADMIN_VERCEL_TEAM_ID') || '';
const PASSWORD = Deno.env.get('PASSWORD')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const { projectRef, anonKey, vercelProjectId } = await req.json();

  try {
    // Disable email confirmation
    await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ MAILER_AUTOCONFIRM: true }),
    });

    // Set shared secrets on the new project
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const secretsRes = await fetch(`${supabaseUrl}/rest/v1/shared_secrets?select=key,value`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    if (secretsRes.ok) {
      const secretRows: { key: string; value: string }[] = await secretsRes.json();
      if (secretRows.length > 0) {
        await fetch(`https://api.supabase.com/v1/projects/${projectRef}/secrets`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(secretRows.map((r) => ({ name: r.key, value: r.value }))),
        });
      }
    }

    // Set VITE_SUPABASE_ANON_KEY on Vercel
    if (vercelProjectId && anonKey) {
      const envUrl = VERCEL_TEAM_ID
        ? `https://api.vercel.com/v10/projects/${vercelProjectId}/env?teamId=${VERCEL_TEAM_ID}&upsert=true`
        : `https://api.vercel.com/v10/projects/${vercelProjectId}/env?upsert=true`;

      await fetch(envUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          { key: 'VITE_SUPABASE_ANON_KEY', value: anonKey, target: ['production', 'preview', 'development'], type: 'plain' },
        ]),
      });
    }

    return Response.json({ ok: true }, { headers: corsHeaders });
  } catch (err) {
    console.error(err);
    return Response.json({ error: String(err) }, { status: 500, headers: corsHeaders });
  }
});
