#!/usr/bin/env node
/**
 * Apply P0/P1 migrations, deploy edge functions, set secrets, and verify live state.
 *
 * Required in .env:
 *   SUPABASE_ACCESS_TOKEN   — personal access token (https://supabase.com/dashboard/account/tokens)
 *   SUPABASE_SERVICE_ROLE_KEY — for seed + validation probes
 *
 * Optional in .env:
 *   CMD_API_KEY             — Gemini key (edge function secret)
 *   EDGE_FUNCTION_SECRET    — cron secret for lead-agent / quote-agent (auto-generated if missing)
 *   VITE_SUPABASE_URL       — defaults from .env
 *
 * Run: npm run deploy:p0-p1
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { randomBytes } from 'crypto';
import { createClient } from '@supabase/supabase-js';

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
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const cmdApiKey = process.env.CMD_API_KEY;
let edgeSecret = process.env.EDGE_FUNCTION_SECRET;

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), ...opts });
}

function requireEnv() {
  const missing = [];
  if (!accessToken) missing.push('SUPABASE_ACCESS_TOKEN');
  if (!url) missing.push('VITE_SUPABASE_URL');
  if (missing.length) {
    console.error(`Missing required env: ${missing.join(', ')}`);
    console.error('Add them to .env and re-run: npm run deploy:p0-p1');
    process.exit(1);
  }
}

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
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`Management API ${method} ${path} failed (${res.status}): ${text}`);
  }
  return json;
}

async function verifyMigrations() {
  if (!anonKey) {
    console.log('⚠️  Skipping migration verify (VITE_SUPABASE_ANON_KEY not set)');
    return false;
  }
  const anon = createClient(url, anonKey);
  const { error: viewErr } = await anon.from('public_profiles').select('id').limit(1);
  const { data: profiles, error: profErr } = await anon.from('profiles').select('id,email').limit(1);

  const viewOk = !viewErr;
  const profilesBlocked = !!profErr || (profiles?.length ?? 0) === 0;

  console.log(`  public_profiles view: ${viewOk ? 'OK' : 'MISSING'}`);
  console.log(`  profiles anon blocked: ${profilesBlocked ? 'OK' : 'STILL OPEN'}`);
  return viewOk && profilesBlocked;
}

async function verifyFunctions() {
  const names = ['lead-agent', 'gemini-proxy', 'api-v1', 'nl-search', 'quote-agent'];
  let allOk = true;
  for (const fn of names) {
    try {
      const res = await fetch(`${url}/functions/v1/${fn}`, { method: 'OPTIONS' });
      const ok = res.status === 200 || res.status === 204;
      console.log(`  ${fn}: ${ok ? 'deployed' : `status ${res.status}`}`);
      if (!ok) allOk = false;
    } catch (err) {
      console.log(`  ${fn}: error — ${err.message}`);
      allOk = false;
    }
  }
  return allOk;
}

async function main() {
  console.log('BizSearch P0/P1 Live Deploy\n');
  requireEnv();

  if (!edgeSecret) {
    edgeSecret = randomBytes(32).toString('hex');
    console.log('Generated EDGE_FUNCTION_SECRET (add to .env to persist):');
    console.log(`EDGE_FUNCTION_SECRET=${edgeSecret}`);
  }

  if (!cmdApiKey) {
    console.warn('⚠️  CMD_API_KEY not set — gemini-proxy will not work until set in Supabase secrets');
  }

  // 1. Authenticate CLI
  run(`npx supabase login --token "${accessToken}"`);

  // 2. Link project (idempotent)
  try {
    run(`npx supabase link --project-ref ${PROJECT_REF}`);
  } catch {
    console.log('Link may already exist; continuing…');
  }

  // 3. Push migrations 031 + 032 (and any pending)
  run('npx supabase db push --linked --yes');

  // 4. Set edge function secrets
  const secretArgs = [`EDGE_FUNCTION_SECRET=${edgeSecret}`];
  if (cmdApiKey) secretArgs.push(`CMD_API_KEY=${cmdApiKey}`);
  run(`npx supabase secrets set ${secretArgs.join(' ')} --project-ref ${PROJECT_REF}`);

  // 5. Deploy edge functions
  run(
    `npx supabase functions deploy lead-agent gemini-proxy api-v1 nl-search quote-agent --project-ref ${PROJECT_REF} --use-api`
  );

  // 6. Verify
  console.log('\n--- Post-deploy verification ---');
  const migrationsOk = await verifyMigrations();
  const functionsOk = await verifyFunctions();

  if (!migrationsOk) {
    console.error('\n❌ Migrations may not be fully applied. Check Supabase SQL editor.');
    process.exit(1);
  }
  if (!functionsOk) {
    console.error('\n❌ Some edge functions are not reachable.');
    process.exit(1);
  }

  console.log('\n✅ Deploy complete. Run: npm run seed:phase1 && npm run validate:phase1');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
