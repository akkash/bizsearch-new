#!/usr/bin/env node
/**
 * Rotate keys exposed in git history (.env was committed with anon, Gemini, Mapbox).
 *
 * Requires SUPABASE_ACCESS_TOKEN in .env.
 * Gemini + Mapbox must be rotated manually in their dashboards (URLs printed below).
 *
 * Run: npm run rotate:secrets
 */

import { readFileSync } from 'fs';

const PROJECT_REF = 'suiexvkyakjvexnldvmr';

function loadEnv() {
  try {
    const raw = readFileSync('.env', 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* ignore */
  }
}

loadEnv();

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

async function managementApi(path, method = 'GET', body) {
  const res = await fetch(`https://api.supabase.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`API ${method} ${path} (${res.status}): ${text}`);
  return text ? JSON.parse(text) : null;
}

async function main() {
  console.log('BizSearch — Rotate Exposed Secrets\n');

  if (!accessToken) {
    console.error('Missing SUPABASE_ACCESS_TOKEN in .env');
    process.exit(1);
  }

  console.log('--- Supabase API keys (legacy anon / service_role) ---');
  const keys = await managementApi(`/projects/${PROJECT_REF}/api-keys`);
  console.log('Current keys:');
  for (const k of keys || []) {
    console.log(`  ${k.name || k.id}: ${k.api_key ? k.api_key.slice(0, 20) + '…' : '(hidden)'}`);
  }

  console.log(`
To rotate Supabase keys:
  1. Dashboard → Project Settings → API → create new publishable + secret keys
     https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api
  2. Update .env with new VITE_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY
  3. Redeploy edge functions: npm run deploy:p0-p1
  4. Deactivate compromised legacy keys in the same dashboard page

--- Google Gemini (was VITE_GOOGLE_AI_API_KEY in git) ---
  1. https://aistudio.google.com/app/apikey → revoke old key, create new
  2. Set CMD_API_KEY in .env and run: npm run deploy:p0-p1

--- Mapbox (was VITE_MAPBOX_TOKEN in git) ---
  1. https://account.mapbox.com/access-tokens/ → rotate token, restrict by URL
  2. Update VITE_MAPBOX_TOKEN in .env (client-only, rebuild app)

After rotation, purge .env from git history (optional but recommended):
  git filter-repo --path .env --invert-paths
  (or BFG Repo-Cleaner)
`);

  // Attempt to list if new-style keys exist
  try {
    const newKeys = await managementApi(`/projects/${PROJECT_REF}/api-keys?reveal=true`);
    const hasNew = (newKeys || []).some((k) => String(k.name || '').includes('publishable') || String(k.api_key || '').startsWith('sb_'));
    if (hasNew) {
      console.log('✅ New-style sb_ keys detected — prefer migrating to publishable/secret keys.');
    }
  } catch {
    /* non-fatal */
  }

  console.log('\n⚠️  Key rotation requires dashboard confirmation. Follow steps above.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
