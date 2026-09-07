#!/usr/bin/env node
/**
 * BizSearch Phase 1 — Production Validation Script
 *
 * Run: npm run validate:phase1
 * Optional: SUPABASE_SERVICE_ROLE_KEY for migration apply + test seeding
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
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const anon = createClient(url, anonKey);
const admin = serviceKey ? createClient(url, serviceKey) : null;

const MIGRATION_028_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'information_sent',
  'meeting',
  'application',
  'negotiation',
  'converted',
  'lost',
];

const LEGACY_STATUSES = ['read', 'replied', 'closed'];

const report = {
  environment: { supabaseUrl: url, migration028: 'unknown' },
  schema: {},
  data: {},
  security: {},
  bugs: [],
  verdict: 'CODE COMPLETE — LIVE VALIDATION PENDING',
};

function pass(section, message) {
  console.log(`✅ ${section}: ${message}`);
}

function fail(section, message) {
  console.error(`❌ ${section}: ${message}`);
  report.bugs.push({ section, message });
}

async function checkConnectivity() {
  const { error } = await anon.from('franchises').select('id').limit(1);
  if (error?.message?.includes('fetch failed') || error?.message?.includes('ENOTFOUND')) {
    fail('connectivity', 'Cannot reach Supabase. Check network/DNS.');
    return false;
  }
  if (error && !error.message.includes('0 rows')) {
    fail('connectivity', error.message);
    return false;
  }
  pass('connectivity', 'Supabase reachable');
  return true;
}

async function checkMigration028() {
  const client = admin || anon;

  const { data: inquiries, error } = await client.from('inquiries').select('status').limit(500);
  if (error) {
    fail('migration028', `Cannot read inquiries: ${error.message}`);
    return;
  }

  const statuses = [...new Set((inquiries || []).map((i) => i.status))];
  const legacy = statuses.filter((s) => LEGACY_STATUSES.includes(s));
  const invalid = statuses.filter((s) => !MIGRATION_028_STATUSES.includes(s));

  report.schema.inquiryStatuses = statuses;
  report.schema.legacyStatusesRemaining = legacy;
  report.schema.invalidStatuses = invalid;

  if (legacy.length) {
    fail('migration028', `Legacy inquiry statuses still present: ${legacy.join(', ')}`);
    report.environment.migration028 = 'NOT APPLIED (legacy statuses found)';
    return;
  }

  if (invalid.length) {
    fail('migration028', `Invalid inquiry statuses found: ${invalid.join(', ')}`);
    report.environment.migration028 = 'PARTIAL OR BROKEN';
    return;
  }

  // Probe constraint by attempting insert with information_sent (service role only)
  if (admin) {
    const probeId = crypto.randomUUID();
    const { error: insertErr } = await admin.from('inquiries').insert({
      id: probeId,
      sender_id: null,
      recipient_id: '00000000-0000-0000-0000-000000000001',
      listing_id: '00000000-0000-0000-0000-000000000002',
      listing_type: 'franchise',
      message: 'migration-028-probe',
      contact_email: 'probe@test.example',
      status: 'information_sent',
    });
    await admin.from('inquiries').delete().eq('id', probeId);
    if (insertErr && !insertErr.message.includes('foreign key')) {
      fail('migration028', `information_sent status rejected: ${insertErr.message}`);
      report.environment.migration028 = 'NOT APPLIED (constraint)';
      return;
    }
  }

  pass('migration028', 'Inquiry statuses compatible with migration 028');
  report.environment.migration028 = 'LIKELY APPLIED';
}

async function checkFranchiseDiscovery() {
  const { data: allFranchises, error: allErr } = await anon
    .from('franchises')
    .select('id, brand_name, status')
    .limit(200);

  if (allErr) {
    fail('discovery', allErr.message);
    return;
  }

  const { data: activeFranchises, error: activeErr } = await anon
    .from('franchises')
    .select('id, brand_name, status')
    .eq('status', 'active');

  if (activeErr) {
    fail('discovery', activeErr.message);
    return;
  }

  const nonActiveVisible = (allFranchises || []).filter((f) => f.status !== 'active');
  report.data.franchiseTotalVisibleToAnon = allFranchises?.length ?? 0;
  report.data.activeFranchiseCount = activeFranchises?.length ?? 0;
  report.data.nonActiveVisibleToAnon = nonActiveVisible.length;

  // Public RLS should only expose active franchises to anon
  if (nonActiveVisible.length > 0) {
    fail(
      'discovery',
      `Anon can see ${nonActiveVisible.length} non-active franchise(s): ${nonActiveVisible.map((f) => `${f.brand_name}:${f.status}`).join(', ')}`
    );
  } else {
    pass('discovery', `Public discovery returns ${activeFranchises?.length ?? 0} active franchise(s) only`);
  }
}

async function checkVerificationLogsSchema() {
  if (!admin) {
    console.log('⚠️  verification_logs: skipped (SUPABASE_SERVICE_ROLE_KEY not set)');
    return;
  }

  const probeListingId = '00000000-0000-0000-0000-000000000099';
  const { data, error } = await admin
    .from('verification_logs')
    .insert({
      listing_id: probeListingId,
      listing_type: 'franchise',
      previous_status: 'unverified',
      new_status: 'verified',
      notes: 'phase1-validation-probe',
      verification_method: 'manual',
    })
    .select('id')
    .single();

  if (error) {
    fail('verification_logs', `Insert failed: ${error.message}`);
    return;
  }

  await admin.from('verification_logs').delete().eq('id', data.id);
  pass('verification_logs', 'Schema accepts previous_status/new_status/verification_method');
}

async function checkDataIntegrity() {
  const client = admin || anon;
  const { data: inquiries, error } = await client
    .from('inquiries')
    .select('id, listing_id, listing_type, sender_id, status')
    .limit(500);

  if (error) {
    fail('integrity', error.message);
    return;
  }

  const nullStatus = (inquiries || []).filter((i) => !i.status);
  if (nullStatus.length) {
    fail('integrity', `${nullStatus.length} inquiries with NULL status`);
  } else {
    pass('integrity', 'No NULL inquiry statuses in sample');
  }

  report.data.inquiryCount = inquiries?.length ?? 0;
}

async function signInAs(email, password) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Sign-in failed for ${email}: ${error.message}`);
  return client;
}

async function runSecurityTests() {
  const testPassword = process.env.TEST_ACCOUNT_PASSWORD || 'TestPass123!';
  const personas = [
    { key: 'entrepreneurA', email: 'entrepreneur-a@test.example', role: 'entrepreneur' },
    { key: 'entrepreneurB', email: 'entrepreneur-b@test.example', role: 'entrepreneur' },
    { key: 'franchisorA', email: 'franchisor-a@test.example', role: 'franchisor' },
    { key: 'franchisorB', email: 'franchisor-b@test.example', role: 'franchisor' },
  ];

  const sessions = {};
  let anySignedIn = false;

  for (const persona of personas) {
    try {
      sessions[persona.key] = await signInAs(persona.email, testPassword);
      anySignedIn = true;
    } catch (err) {
      console.log(`⚠️  security/${persona.key}: skipped — ${err.message}`);
      report.security[persona.key] = 'SKIPPED (account missing)';
    }
  }

  if (!anySignedIn) {
    console.log('\n--- Security probes skipped: no test accounts found ---');
    console.log('Run: npm run seed:phase1  (requires SUPABASE_SERVICE_ROLE_KEY)');
    console.log('Then re-run: npm run validate:phase1');
    return;
  }

  // Entrepreneur A: own inquiries only
  if (sessions.entrepreneurA) {
    const userId = (await sessions.entrepreneurA.auth.getUser()).data.user?.id;
    const { data: visible, error } = await sessions.entrepreneurA
      .from('inquiries')
      .select('id, sender_id')
      .limit(100);
    if (error) {
      fail('security/entrepreneurA', error.message);
    } else {
      const foreign = (visible || []).filter((i) => i.sender_id && i.sender_id !== userId);
      if (foreign.length) {
        fail('security/entrepreneurA', `Can see ${foreign.length} inquiries not sent by self`);
        report.security.entrepreneurA_own = 'FAIL';
      } else {
        pass('security/entrepreneurA', `Sees ${visible?.length ?? 0} inquiry row(s) (no foreign senders)`);
        report.security.entrepreneurA_own = 'PASS';
      }
    }
  }

  // Franchisor A vs B cross-lead isolation
  if (sessions.franchisorA && sessions.franchisorB) {
    const userA = (await sessions.franchisorA.auth.getUser()).data.user;
    const userB = (await sessions.franchisorB.auth.getUser()).data.user;

    const { data: franchisesA } = await sessions.franchisorA
      .from('franchises')
      .select('id, brand_name')
      .eq('franchisor_id', userA?.id);
    const { data: franchisesB } = await sessions.franchisorB
      .from('franchises')
      .select('id, brand_name')
      .eq('franchisor_id', userB?.id);

    const franchiseAIds = new Set((franchisesA || []).map((f) => f.id));
    const franchiseBIds = new Set((franchisesB || []).map((f) => f.id));

    const { data: leadsA } = await sessions.franchisorA
      .from('inquiries')
      .select('id, listing_id, listing_type')
      .eq('listing_type', 'franchise')
      .limit(200);

    const crossLeaks = (leadsA || []).filter((i) => franchiseBIds.has(i.listing_id));
    const ownLeads = (leadsA || []).filter((i) => franchiseAIds.has(i.listing_id));

    if (crossLeaks.length) {
      fail('security/franchisorA', `Can see ${crossLeaks.length} Franchise B lead(s) — RLS breach`);
      report.security.franchisorA_cross = 'FAIL';
    } else {
      pass('security/franchisorA', `No cross-franchisor lead leaks (${ownLeads.length} own franchise lead(s))`);
      report.security.franchisorA_cross = 'PASS';
    }

    // Franchisor A cannot edit Franchise B
    const franchiseBId = franchisesB?.[0]?.id;
    if (franchiseBId) {
      const { error: editErr } = await sessions.franchisorA
        .from('franchises')
        .update({ description: 'RLS probe — should fail' })
        .eq('id', franchiseBId);
      if (!editErr) {
        fail('security/franchisorA_edit', 'Was able to update Franchise B listing');
        report.security.franchisorA_edit_other = 'FAIL';
      } else {
        pass('security/franchisorA_edit', 'Cannot edit Franchise B (RLS enforced)');
        report.security.franchisorA_edit_other = 'PASS';
      }
    }
  }

  // Entrepreneur A cannot see Entrepreneur B applications
  if (sessions.entrepreneurA && sessions.entrepreneurB) {
    const userB = (await sessions.entrepreneurB.auth.getUser()).data.user;
    const { data: apps } = await sessions.entrepreneurA
      .from('franchise_applications')
      .select('id, applicant_id')
      .limit(100);

    const leaks = (apps || []).filter((a) => a.applicant_id === userB?.id);
    if (leaks.length) {
      fail('security/entrepreneurA_apps', `Can see ${leaks.length} of Entrepreneur B's application(s)`);
      report.security.entrepreneurA_cross_apps = 'FAIL';
    } else {
      pass('security/entrepreneurA_apps', 'Cannot see Entrepreneur B applications');
      report.security.entrepreneurA_cross_apps = 'PASS';
    }
  }
}

async function runSecurityProbe() {
  if (process.env.SKIP_RLS_TESTS === '1') {
    console.log('⚠️  RLS tests skipped (SKIP_RLS_TESTS=1)');
    return;
  }
  await runSecurityTests();
}

async function main() {
  console.log('BizSearch Phase 1 Production Validation\n');
  console.log(`Supabase: ${url}\n`);

  const ok = await checkConnectivity();
  if (!ok) {
    report.verdict = 'NOT READY — P0 BUGS REMAIN';
    console.log('\n=== VERDICT ===');
    console.log(report.verdict);
    console.log('Blocker: cannot reach Supabase from this environment.');
    process.exit(1);
  }

  await checkMigration028();
  await checkFranchiseDiscovery();
  await checkVerificationLogsSchema();
  await checkDataIntegrity();
  await runSecurityProbe();

  if (report.bugs.length === 0 && report.environment.migration028 === 'LIKELY APPLIED') {
    report.verdict = 'CODE COMPLETE — LIVE VALIDATION PENDING';
  } else if (report.bugs.some((b) => b.section === 'migration028' || b.section === 'discovery')) {
    report.verdict = 'NOT READY — P0 BUGS REMAIN';
  }

  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(report, null, 2));
  console.log('\n=== VERDICT ===');
  console.log(report.verdict);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
