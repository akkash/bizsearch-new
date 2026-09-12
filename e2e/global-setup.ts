import { writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { ACCOUNTS, PASSWORD, loadEnv } from './helpers/env';

loadEnv();

const PERSONAS = [
  { email: ACCOUNTS.franchisee, role: 'franchisee', displayName: 'Entrepreneur A' },
  { email: ACCOUNTS.franchisor, role: 'franchisor', displayName: 'Franchisor A' },
  { email: ACCOUNTS.seller, role: 'seller', displayName: 'Seller A' },
  { email: ACCOUNTS.buyer, role: 'buyer', displayName: 'Buyer A' },
  { email: ACCOUNTS.advisor, role: 'advisor', displayName: 'Advisor A' },
] as const;

export default async function globalSetup() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceKey) {
    throw new Error('Missing VITE_SUPABASE_URL or service role for Playwright setup');
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const ids: Record<string, string> = {};
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });

  for (const persona of PERSONAS) {
    let user = list?.users?.find((u) => u.email === persona.email);
    if (!user) {
      const created = await admin.auth.admin.createUser({
        email: persona.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: persona.displayName, role: persona.role },
      });
      if (created.error || !created.data.user) {
        throw new Error(`Create ${persona.email}: ${created.error?.message}`);
      }
      user = created.data.user;
    } else {
      await admin.auth.admin.updateUserById(user.id, { password: PASSWORD });
    }
    ids[persona.email] = user.id;

    const profileRow = {
      id: user.id,
      email: persona.email,
      display_name: persona.displayName,
      role: persona.role,
      phone: '+919876543210',
      city: 'Chennai',
      state: 'Tamil Nadu',
      updated_at: new Date().toISOString(),
    };
    const { error: profileError } = await admin.from('profiles').upsert(profileRow);
    if (profileError) {
      const { error: retryError } = await admin
        .from('profiles')
        .update({
          phone: '+919876543210',
          city: 'Chennai',
          state: 'Tamil Nadu',
          display_name: persona.displayName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (retryError) {
        throw new Error(`Profile update ${persona.email}: ${profileError.message}`);
      }
    }

    const { error: roleError } = await admin.from('profile_roles').upsert(
      { profile_id: user.id, role: persona.role },
      { onConflict: 'profile_id,role' }
    );
    if (roleError) {
      console.warn(`profile_roles upsert skipped: ${roleError.message}`);
    }
  }

  const franchisorId = ids[ACCOUNTS.franchisor];
  const franchiseeId = ids[ACCOUNTS.franchisee];

  let { data: franchise } = await admin
    .from('franchises')
    .select('id, status')
    .eq('franchisor_id', franchisorId)
    .eq('slug', 'phase1-test-franchise-a')
    .maybeSingle();

  if (!franchise) {
    const inserted = await admin
      .from('franchises')
      .insert({
        franchisor_id: franchisorId,
        brand_name: 'Phase1 Test Franchise A',
        slug: 'phase1-test-franchise-a',
        industry: 'Food & Beverage',
        description: 'Phase 1 test franchise — Playwright loop',
        franchise_fee: 500000,
        total_investment_min: 1500000,
        total_investment_max: 3000000,
        status: 'active',
        verification_status: 'verified',
        contact_email: 'contact+phase1-a@test.example',
        headquarters_city: 'Chennai',
        headquarters_state: 'Tamil Nadu',
      })
      .select('id, status')
      .single();
    if (inserted.error) throw new Error(inserted.error.message);
    franchise = inserted.data;
  } else if (franchise.status !== 'active') {
    await admin.from('franchises').update({ status: 'active' }).eq('id', franchise.id);
  }

  await admin
    .from('inquiries')
    .update({ status: 'lost' })
    .eq('sender_id', franchiseeId)
    .eq('listing_id', franchise.id)
    .neq('status', 'lost');

  await admin
    .from('saved_searches')
    .delete()
    .eq('user_id', franchiseeId)
    .ilike('name', '%Chennai%');

  await admin.from('franchises').delete().ilike('slug', 'p1-alert-%');

  writeFileSync(
    'e2e/.generated-ids.json',
    JSON.stringify({
      franchiseAId: franchise.id,
      franchiseeId,
      franchisorId,
      sellerId: ids[ACCOUNTS.seller],
      buyerId: ids[ACCOUNTS.buyer],
      advisorId: ids[ACCOUNTS.advisor],
    })
  );
}
