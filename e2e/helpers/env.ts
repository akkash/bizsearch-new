import { readFileSync, existsSync } from 'fs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function loadEnv() {
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

export const ACCOUNTS = {
  franchisee: 'entrepreneur-a@test.example',
  franchisor: 'franchisor-a@test.example',
  seller: 'seller-a@test.example',
  buyer: 'buyer-a@test.example',
  advisor: 'advisor-a@test.example',
} as const;

export const PASSWORD = process.env.TEST_ACCOUNT_PASSWORD || 'TestPass123!';

export type GeneratedIds = {
  franchiseAId: string;
  franchiseeId: string;
  franchisorId: string;
  sellerId?: string;
  buyerId?: string;
  advisorId?: string;
  adminId?: string;
};

export function readIds(): GeneratedIds {
  if (!existsSync('e2e/.generated-ids.json')) {
    throw new Error('e2e/.generated-ids.json missing — global setup did not run');
  }
  return JSON.parse(readFileSync('e2e/.generated-ids.json', 'utf8')) as GeneratedIds;
}

export function adminClient(): SupabaseClient {
  const url = process.env.VITE_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
