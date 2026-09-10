#!/usr/bin/env node
/**
 * Validate application assumptions against live Supabase schema.
 * Run: npm run validate:schema
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
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = 'suiexvkyakjvexnldvmr';

if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE in .env');
  process.exit(1);
}

const db = createClient(url, serviceKey);

const REQUIRED_TABLES = [
  'profiles', 'profile_roles', 'verification_documents', 'activity_logs',
  'businesses', 'franchises', 'inquiries', 'saved_listings', 'notifications',
  'franchise_locations', 'franchise_territories', 'franchise_applications',
  'conversations', 'messages', 'business_inquiries', 'nda_agreements',
  'deal_room_documents', 'deal_room_activity', 'listing_analytics',
  'advisor_clients', 'deals', 'commissions', 'advisor_profiles', 'advisor_reviews',
  'fraud_alerts', 'feature_flags', 'seller_details', 'buyer_details',
  'franchisor_details', 'franchisee_details', 'advisor_details', 'verification_logs',
  'agent_tasks', 'quote_requests', 'quote_responses', 'lead_queue',
  'availability_checks', 'platform_settings', 'cms_pages', 'platform_announcements',
];

const COLUMN_ASSERTIONS = [
  { table: 'profiles', column: 'is_banned', mustExist: true },
  { table: 'businesses', column: 'seller_id', mustExist: true },
  { table: 'businesses', column: 'owner_id', mustExist: false },
  { table: 'franchises', column: 'franchisor_id', mustExist: true },
  { table: 'inquiries', column: 'sender_id', mustExist: true },
  { table: 'inquiries', column: 'recipient_id', mustExist: true },
  { table: 'inquiries', column: 'contact_email', mustExist: true },
  { table: 'inquiries', column: 'priority', mustExist: false },
  { table: 'inquiries', column: 'metadata', mustExist: false },
  { table: 'verification_documents', column: 'status', mustExist: true },
  { table: 'verification_documents', column: 'rejection_reason', mustExist: false },
  { table: 'activity_logs', column: 'entity_id', mustExist: true },
  { table: 'platform_settings', column: 'key', mustExist: true },
  { table: 'cms_pages', column: 'slug', mustExist: true },
];

const PROBE_QUERIES = [
  { name: 'businesses by seller_id', run: () => db.from('businesses').select('id, seller_id').limit(1) },
  { name: 'franchises by franchisor_id', run: () => db.from('franchises').select('id, franchisor_id').limit(1) },
  { name: 'inquiries unified', run: () => db.from('inquiries').select('id, listing_type, sender_id, recipient_id').limit(1) },
  { name: 'business_inquiries legacy', run: () => db.from('business_inquiries').select('id, business_id, buyer_id').limit(1) },
  { name: 'verification_documents', run: () => db.from('verification_documents').select('id, profile_id, status').limit(1) },
  { name: 'fraud_alerts', run: () => db.from('fraud_alerts').select('id, type, entity_id, status').limit(1) },
  { name: 'platform_settings', run: () => db.from('platform_settings').select('key, value').limit(5) },
  { name: 'cms_pages', run: () => db.from('cms_pages').select('id, slug, status').limit(1) },
  { name: 'public_profiles view', run: () => db.from('public_profiles').select('id, display_name').limit(1) },
  { name: 'franchise_location_summary view', run: () => db.from('franchise_location_summary').select('*').limit(1) },
  { name: 'lead_queue', run: () => db.from('lead_queue').select('id, inquiry_id, seller_id').limit(1) },
  { name: 'quote_requests', run: () => db.from('quote_requests').select('id, listing_ids, listing_type').limit(1) },
];

let failures = 0;

function pass(msg) {
  console.log(`✅ ${msg}`);
}

function fail(msg) {
  console.error(`❌ ${msg}`);
  failures++;
}

async function fetchColumns(table) {
  if (!accessToken) return null;
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}' ORDER BY ordinal_position`,
    }),
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return (rows || []).map((r) => r.column_name);
}

async function checkTables() {
  console.log('\n--- Tables ---');
  for (const table of REQUIRED_TABLES) {
    const { error } = await db.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      fail(`Table missing or inaccessible: ${table} — ${error.message}`);
    } else {
      pass(`Table OK: ${table}`);
    }
  }
}

async function checkColumns() {
  console.log('\n--- Column assertions ---');
  if (!accessToken) {
    console.log('⚠️  SUPABASE_ACCESS_TOKEN not set — skipping information_schema checks');
    return;
  }

  const tables = [...new Set(COLUMN_ASSERTIONS.map((c) => c.table))];
  const columnMap = new Map();
  for (const table of tables) {
    columnMap.set(table, new Set(await fetchColumns(table)));
  }

  for (const { table, column, mustExist } of COLUMN_ASSERTIONS) {
    const cols = columnMap.get(table);
    if (!cols) {
      console.log(`⚠️  Could not introspect ${table}.${column}`);
      continue;
    }
    const exists = cols.has(column);
    if (mustExist && !exists) fail(`Missing required column: ${table}.${column}`);
    else if (!mustExist && exists) fail(`Unexpected column still present: ${table}.${column}`);
    else pass(`${table}.${column} — ${mustExist ? 'present' : 'absent (expected)'}`);
  }
}

async function runProbes() {
  console.log('\n--- Application probe queries ---');
  for (const probe of PROBE_QUERIES) {
    const { error } = await probe.run();
    if (error) fail(`${probe.name}: ${error.message}`);
    else pass(probe.name);
  }
}

async function checkCodePatterns() {
  console.log('\n--- Static code pattern scan ---');
  const patterns = [
    { file: 'src/polymet/pages/buyer-inquiries.tsx', bad: "eq('owner_id'" },
    { file: 'src/polymet/pages/nda-management.tsx', bad: "eq('owner_id'" },
    { file: 'src/polymet/pages/seller-analytics.tsx', bad: "eq('owner_id'" },
    { file: 'supabase/functions/quote-agent/index.ts', bad: 'owner_id' },
  ];

  for (const { file, bad } of patterns) {
    try {
      const content = readFileSync(file, 'utf8');
      if (content.includes(bad) && !content.includes("// legacy owner_id")) {
        fail(`Code still references invalid pattern in ${file}: ${bad}`);
      } else {
        pass(`No invalid ${bad} in ${file}`);
      }
    } catch {
      console.log(`⚠️  Could not read ${file}`);
    }
  }
}

async function main() {
  console.log('BizSearch — Live Schema Validation');
  console.log(`Project: ${url}`);

  await checkTables();
  await checkColumns();
  await runProbes();
  await checkCodePatterns();

  console.log('\n--- Summary ---');
  if (failures === 0) {
    console.log('✅ All schema validation checks passed');
    process.exit(0);
  } else {
    console.error(`❌ ${failures} check(s) failed`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
