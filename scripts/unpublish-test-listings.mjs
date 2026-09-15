#!/usr/bin/env node
/**
 * Unpublish seed/test franchise rows on the linked Supabase project.
 * Uses service role from .env. Does not commit secrets.
 *
 * Run: node scripts/unpublish-test-listings.mjs
 */
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

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

const NAME_PATTERN = '%Phase1%';
const NAME_PATTERN_B = '%P1 Alert%';
const NAME_PATTERN_C = '%Test Franchise%';

async function unpublish(column, pattern) {
  const { data, error } = await admin
    .from('franchises')
    .select('id, brand_name, slug, status')
    .ilike(column, pattern);
  if (error) throw error;
  const rows = data || [];
  if (!rows.length) {
    console.log(`No rows for ${column} ${pattern}`);
    return 0;
  }
  const ids = rows.map((r) => r.id);
  const { error: updateError } = await admin
    .from('franchises')
    .update({
      status: 'inactive',
      visibility: 'private',
      verified: false,
      featured: false,
    })
    .in('id', ids);
  if (updateError) throw updateError;
  for (const row of rows) {
    console.log(`Unpublished ${row.brand_name} (${row.slug || row.id})`);
  }
  return rows.length;
}

const a = await unpublish('brand_name', NAME_PATTERN);
const b = await unpublish('brand_name', NAME_PATTERN_B);
const c = await unpublish('brand_name', NAME_PATTERN_C);
const d = await unpublish('slug', 'phase1-test-franchise-%');
const e = await unpublish('slug', 'p1-alert-%');

console.log(`Done. Touched up to ${a + b + c + d + e} rows (overlaps possible).`);
