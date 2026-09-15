#!/usr/bin/env node
/**
 * Ban/disable *@test.example Auth users on the linked project.
 * Uses service role from .env. Does not commit secrets.
 *
 * Run: node scripts/disable-test-accounts.mjs
 */
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

function loadEnv() {
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
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
if (error) throw error;

const targets = (data.users || []).filter((u) => (u.email || '').endsWith('@test.example'));
if (!targets.length) {
  console.log('No @test.example users found.');
  process.exit(0);
}

for (const user of targets) {
  const rotated = randomBytes(24).toString('base64url');
  await admin.auth.admin.updateUserById(user.id, {
    password: rotated,
    ban_duration: '876000h',
    user_metadata: { ...(user.user_metadata || {}), disabled_reason: 'e2e-prod-lock' },
  });
  console.log(`Disabled ${user.email}`);
}

console.log(`Disabled ${targets.length} test account(s).`);
