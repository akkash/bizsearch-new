#!/usr/bin/env node
/**
 * Write public/sitemap.xml from live public listings.
 * Run as part of `npm run build`.
 */
import { writeFileSync } from 'fs';
import { readFileSync, existsSync } from 'fs';

function loadEnv() {
  if (!existsSync('.env')) return;
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

const ORIGIN = 'https://www.bizsearch.in';
const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;

const staticPaths = [
  '/',
  '/franchises',
  '/businesses',
  '/match',
  '/smart-search',
  '/industries',
  '/about',
  '/contact',
  '/help',
  '/privacy',
  '/terms',
  '/refund-policy',
  '/disclaimer',
];

async function fetchRows(path) {
  if (!url || !anon) return [];
  try {
    const res = await fetch(`${url}/rest/v1/${path}`, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` },
    });
    if (!res.ok) {
      console.warn(`sitemap: ${path} ${res.status}`);
      return [];
    }
    return res.json();
  } catch (err) {
    console.warn(`sitemap: ${path} failed`, err);
    return [];
  }
}

const franchises = await fetchRows('franchise_public?select=id,slug,published_at,created_at');
const businesses = await fetchRows('business_public?select=id,slug,published_at,created_at');

function loc(path, lastmod) {
  const last = lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : '';
  return `  <url><loc>${ORIGIN}${path}</loc>${last}<changefreq>daily</changefreq></url>`;
}

const urls = [
  ...staticPaths.map((p) => loc(p)),
  ...franchises.map((row) =>
    loc(`/franchise/${row.slug || row.id}`, row.updated_at || row.published_at || row.created_at)
  ),
  ...businesses.map((row) =>
    loc(`/business/${row.slug || row.id}`, row.updated_at || row.published_at || row.created_at)
  ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

writeFileSync('public/sitemap.xml', xml);
console.log(`Wrote public/sitemap.xml (${urls.length} URLs)`);
