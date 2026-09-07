#!/usr/bin/env node
/**
 * BizSearch Phase 1 — Test Data Seeder
 *
 * Creates test personas + Franchise A/B for end-to-end validation.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env
 *
 * Run: npm run seed:phase1
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  try {
    const raw = readFileSync('.env', 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx);
      const value = trimmed.slice(idx + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* ignore */
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const testPassword = process.env.TEST_ACCOUNT_PASSWORD || 'TestPass123!';

if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PERSONAS = [
  { email: 'entrepreneur-a@test.example', role: 'franchisee', displayName: 'Entrepreneur A' },
  { email: 'entrepreneur-b@test.example', role: 'franchisee', displayName: 'Entrepreneur B' },
  { email: 'franchisor-a@test.example', role: 'franchisor', displayName: 'Franchisor A' },
  { email: 'franchisor-b@test.example', role: 'franchisor', displayName: 'Franchisor B' },
];

async function ensureUser({ email, role, displayName }) {
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users?.find((u) => u.email === email);

  if (existing) {
    console.log(`  ↳ ${email} already exists (${existing.id})`);
    await admin.from('profiles').upsert({
      id: existing.id,
      email,
      display_name: displayName,
      role,
      updated_at: new Date().toISOString(),
    });
    return existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: testPassword,
    email_confirm: true,
    user_metadata: { display_name: displayName, role },
  });

  if (error) throw new Error(`Failed to create ${email}: ${error.message}`);

  await admin.from('profiles').upsert({
    id: data.user.id,
    email,
    display_name: displayName,
    role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  console.log(`  ✓ Created ${email} (${data.user.id})`);
  return data.user.id;
}

async function ensureFranchise(franchisorId, brandName, slug) {
  const { data: existing } = await admin
    .from('franchises')
    .select('id, brand_name, status')
    .eq('franchisor_id', franchisorId)
    .eq('brand_name', brandName)
    .maybeSingle();

  if (existing) {
    if (existing.status !== 'active') {
      await admin.from('franchises').update({ status: 'active' }).eq('id', existing.id);
      console.log(`  ↳ Activated existing franchise: ${brandName}`);
    } else {
      console.log(`  ↳ Franchise exists: ${brandName} (${existing.id})`);
    }
    return existing.id;
  }

  const { data, error } = await admin
    .from('franchises')
    .insert({
      franchisor_id: franchisorId,
      brand_name: brandName,
      slug,
      industry: 'Food & Beverage',
      description: `Phase 1 test franchise — ${brandName}`,
      franchise_fee: 500000,
      total_investment_min: 1500000,
      total_investment_max: 3000000,
      status: 'active',
      verification_status: 'verified',
      contact_email: `contact+${slug}@test.example`,
      city: 'Chennai',
      state: 'Tamil Nadu',
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create ${brandName}: ${error.message}`);
  console.log(`  ✓ Created franchise: ${brandName} (${data.id})`);
  return data.id;
}

async function main() {
  console.log('BizSearch Phase 1 Test Data Seeder\n');
  console.log(`Supabase: ${url}\n`);

  console.log('Creating test personas...');
  const ids = {};
  for (const persona of PERSONAS) {
    ids[persona.email] = await ensureUser(persona);
  }

  console.log('\nCreating test franchises...');
  const franchiseAId = await ensureFranchise(
    ids['franchisor-a@test.example'],
    'Phase1 Test Franchise A',
    'phase1-test-franchise-a'
  );
  const franchiseBId = await ensureFranchise(
    ids['franchisor-b@test.example'],
    'Phase1 Test Franchise B',
    'phase1-test-franchise-b'
  );

  console.log('\n=== SEED COMPLETE ===');
  console.log(JSON.stringify({
    personas: Object.fromEntries(PERSONAS.map((p) => [p.email, ids[p.email]])),
    franchises: { franchiseA: franchiseAId, franchiseB: franchiseBId },
    password: testPassword,
    nextStep: 'npm run validate:phase1',
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
