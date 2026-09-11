#!/usr/bin/env node
/**
 * Import a small set of public Franchise India listings into Supabase
 * so search, ROI, and compare can be checked against real brand facts.
 *
 * Source: franchiseindia.com brand pages (investment, fee, royalty, area, HQ).
 * Does not invent fees, margins, or photos. Missing FI fields stay null.
 *
 * Run: node scripts/import-franchise-india.mjs
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
if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE in .env');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CATALOG_EMAIL = 'franchise-india-catalog@test.example';
const CATALOG_PASSWORD = process.env.TEST_ACCOUNT_PASSWORD || 'TestPass123!';
const S3 = 'https://franchiseindia.s3.ap-south-1.amazonaws.com';

function format({
  minSqft,
  maxSqft,
  investmentMin,
  investmentMax,
  franchiseFee,
  propertyType,
}) {
  return [
    {
      id: 'standard',
      name: 'Standard',
      minSqft,
      maxSqft,
      investmentMin,
      investmentMax,
      franchiseFee,
      description: 'Format published on the Franchise India listing',
      propertyType,
    },
  ];
}

const LISTINGS = [
  {
    slug: 'snow-cube',
    brand_name: 'SNOW CUBE',
    industry: 'Food & Beverage',
    tagline: 'Juices, smoothies and dairy desserts',
    description:
      'Chennai-headquartered juice and dairy dessert franchise listed on Franchise India. Investment band ₹50,000–₹2 lakh, brand fee ₹1 lakh, 8% royalty, 500–1,000 sq ft commercial space. Established 2013; franchising from 2017.',
    website: 'https://www.franchiseindia.com/brands/SNOW-CUBE.27392',
    established_year: 2013,
    franchise_fee: 100000,
    total_investment_min: 50000,
    total_investment_max: 200000,
    royalty_percentage: 8,
    space_required_sqft: 500,
    min_area_sqft: 500,
    max_area_sqft: 1000,
    property_type: 'Commercial',
    headquarters_city: 'Chennai',
    headquarters_state: 'Tamil Nadu',
    preferred_cities: ['Chennai'],
    operating_locations: [{ city: 'Chennai', state: 'Tamil Nadu' }],
    logo_url: `${S3}/uploads/franchisor/SNOW-CUBE_1.jpg`,
    images: [
      `${S3}/franchisor/template/slider/1121/163995503.jpg`,
      `${S3}/franchisor/template/slider/1121/627949789.jpg`,
    ],
    training_provided: true,
    marketing_support: true,
    support_provided: ['Field assistance', 'IT systems', 'Head-office opening guidance'],
    store_formats: format({
      minSqft: 500,
      maxSqft: 1000,
      investmentMin: 50000,
      investmentMax: 200000,
      franchiseFee: 100000,
      propertyType: 'Commercial',
    }),
    featured: false,
    trending: true,
  },
  {
    slug: 'chai-nagri',
    brand_name: 'Chai Nagri',
    industry: 'Food & Beverage',
    tagline: 'Tea and coffee chain',
    description:
      'Tea-and-coffee franchise listed on Franchise India. Unit investment ₹10–20 lakh, brand fee ₹4 lakh, 2% royalty, 100–550 sq ft in high-footfall malls and high streets. Published ROI 80% with 1–2 year payback. Operations from 2018; franchising from 2019. Headquarters Rajpura.',
    website: 'https://www.franchiseindia.com/brands/chai-nagri.40911',
    established_year: 2018,
    franchise_fee: 400000,
    total_investment_min: 1000000,
    total_investment_max: 2000000,
    royalty_percentage: 2,
    expected_roi_percentage: 80,
    payback_period_months: 18,
    breakeven_period: '1-2 years',
    space_required_sqft: 100,
    min_area_sqft: 100,
    max_area_sqft: 550,
    property_type: 'Commercial',
    headquarters_city: 'Rajpura',
    headquarters_state: 'Punjab',
    logo_url: `${S3}/uploads/franchisor/chai-nagri_1.gif`,
    images: [
      `${S3}/franchisor/template/slider/0715/1860292731.webp`,
      `${S3}/franchisor/template/slider/0715/1924305144.webp`,
    ],
    training_provided: true,
    marketing_support: true,
    support_provided: ['Operating manuals', 'On-site training', 'Field assistance', 'IT systems'],
    store_formats: format({
      minSqft: 100,
      maxSqft: 550,
      investmentMin: 1000000,
      investmentMax: 2000000,
      franchiseFee: 400000,
      propertyType: 'Commercial',
    }),
    featured: true,
    trending: true,
  },
  {
    slug: 'waah-hyderabadi',
    brand_name: 'WAAH HYDERABADI',
    industry: 'Food & Beverage',
    tagline: 'Hyderabadi biryani QSR',
    description:
      'Hyderabadi biryani QSR listed on Franchise India with headquarters in Egmore, Chennai. Investment ₹20–30 lakh, brand fee ₹7.5 lakh, 5% royalty, 500–1,000 sq ft in markets, malls and IT catchments. Operations and franchising both listed as 2025.',
    website: 'https://www.franchiseindia.com/brands/waah-hyderabadi.112206',
    established_year: 2025,
    franchise_fee: 750000,
    total_investment_min: 2000000,
    total_investment_max: 3000000,
    royalty_percentage: 5,
    expected_roi_percentage: 100,
    space_required_sqft: 500,
    min_area_sqft: 500,
    max_area_sqft: 1000,
    property_type: 'Commercial',
    headquarters_city: 'Chennai',
    headquarters_state: 'Tamil Nadu',
    preferred_cities: ['Chennai'],
    operating_locations: [{ city: 'Chennai', state: 'Tamil Nadu' }],
    logo_url: `${S3}/uploads/franchisor/68eccb0c776f9.webp`,
    images: [
      `${S3}/franchisor/template/slider/1013/142947820.webp`,
      `${S3}/franchisor/template/slider/1013/1563230366.webp`,
    ],
    training_provided: true,
    marketing_support: true,
    support_provided: ['Operating manuals', 'IT systems'],
    store_formats: format({
      minSqft: 500,
      maxSqft: 1000,
      investmentMin: 2000000,
      investmentMax: 3000000,
      franchiseFee: 750000,
      propertyType: 'Commercial',
    }),
    featured: true,
    trending: true,
  },
  {
    slug: 'burgertory',
    brand_name: 'Burgertory',
    industry: 'Food & Beverage',
    tagline: 'QSR burger franchise',
    description:
      'QSR burger brand listed on Franchise India. Investment ₹30–50 lakh, brand fee ₹15 lakh, 8% royalty, 800–3,000 sq ft on high streets and malls. Published ROI 79% with 2–3 year payback. Operations from 2018; franchising from 2023. Headquarters Faridabad.',
    website: 'https://www.franchiseindia.com/brands/burgertory.101088',
    established_year: 2018,
    franchise_fee: 1500000,
    total_investment_min: 3000000,
    total_investment_max: 5000000,
    royalty_percentage: 8,
    expected_roi_percentage: 79,
    payback_period_months: 30,
    breakeven_period: '2-3 years',
    space_required_sqft: 800,
    min_area_sqft: 800,
    max_area_sqft: 3000,
    property_type: 'Commercial',
    headquarters_city: 'Faridabad',
    headquarters_state: 'Haryana',
    logo_url: `${S3}/uploads/franchisor/burgertory_1.png`,
    images: [
      `${S3}/franchisor/template/slider/1112/75661253.jpg`,
      `${S3}/franchisor/template/slider/1112/1096973805.jpg`,
    ],
    training_provided: true,
    marketing_support: true,
    support_provided: ['Operating manuals', 'IT systems'],
    store_formats: format({
      minSqft: 800,
      maxSqft: 3000,
      investmentMin: 3000000,
      investmentMax: 5000000,
      franchiseFee: 1500000,
      propertyType: 'Commercial',
    }),
    featured: true,
    trending: false,
  },
  {
    slug: 'kritunga',
    brand_name: 'Kritunga',
    industry: 'Food & Beverage',
    tagline: 'Andhra and Hyderabadi biryani QSR',
    description:
      'Andhra/Hyderabadi biryani QSR listed on Franchise India. Investment ₹50 lakh–₹1 crore, brand fee ₹5 lakh, 5% royalty, 1,500–2,500 sq ft. Published ROI 60% with 1–2 year payback. Operations from 2003; franchising from 2006. Headquarters Serilingampalli, Hyderabad; Franchise India lists Tamil Nadu among expansion markets and includes the brand on the Chennai opportunities page. Disclosed outlet band 50–100.',
    website: 'https://www.franchiseindia.com/brands/kritunga.28476',
    established_year: 2003,
    franchise_fee: 500000,
    total_investment_min: 5000000,
    total_investment_max: 10000000,
    royalty_percentage: 5,
    expected_roi_percentage: 60,
    payback_period_months: 18,
    breakeven_period: '1-2 years',
    total_outlets: 50,
    space_required_sqft: 1500,
    min_area_sqft: 1500,
    max_area_sqft: 2500,
    property_type: 'Commercial',
    headquarters_city: 'Hyderabad',
    headquarters_state: 'Telangana',
    preferred_cities: ['Chennai', 'Hyderabad'],
    operating_locations: [{ city: 'Hyderabad', state: 'Telangana' }],
    logo_url: `${S3}/uploads/franchisor/kritunga_1.png`,
    images: [],
    training_provided: true,
    marketing_support: true,
    support_provided: [
      'Operating manuals',
      'Central kitchen training',
      'Field assistance',
      'IT systems',
    ],
    store_formats: format({
      minSqft: 1500,
      maxSqft: 2500,
      investmentMin: 5000000,
      investmentMax: 10000000,
      franchiseFee: 500000,
      propertyType: 'Commercial',
    }),
    featured: true,
    trending: false,
  },
  {
    slug: 'little-millennium',
    brand_name: 'Little Millennium',
    industry: 'Education',
    tagline: 'Preschool franchise',
    description:
      'Preschool franchise listed on Franchise India. Investment ₹10–20 lakh, brand fee ₹4.1 lakh, 15% royalty, 2,400–3,000 sq ft in residential catchments. Published ROI 40% with 2–3 year payback. Operations and franchising from 2008. Headquarters Gurugram. Disclosed outlet band 500–1,000. Appears on Franchise India’s Chennai opportunities list.',
    website: 'https://www.franchiseindia.com/brands/little-millennium.5893',
    established_year: 2008,
    franchise_fee: 410000,
    total_investment_min: 1000000,
    total_investment_max: 2000000,
    royalty_percentage: 15,
    expected_roi_percentage: 40,
    payback_period_months: 30,
    breakeven_period: '2-3 years',
    total_outlets: 500,
    space_required_sqft: 2400,
    min_area_sqft: 2400,
    max_area_sqft: 3000,
    property_type: 'Residential',
    headquarters_city: 'Gurugram',
    headquarters_state: 'Haryana',
    preferred_cities: ['Chennai', 'Gurugram'],
    logo_url: null,
    images: [],
    training_provided: true,
    marketing_support: true,
    support_provided: ['Operating manuals', 'Franchisee-centre training', 'IT systems'],
    store_formats: format({
      minSqft: 2400,
      maxSqft: 3000,
      investmentMin: 1000000,
      investmentMax: 2000000,
      franchiseFee: 410000,
      propertyType: 'Residential',
    }),
    featured: false,
    trending: false,
  },
  {
    slug: 'chisel-montessori',
    brand_name: 'Chisel Montessori',
    industry: 'Education',
    tagline: 'Montessori preschool',
    description:
      'Chennai-headquartered Montessori preschool listed on Franchise India. Investment ₹20–30 lakh, brand fee ₹10 lakh, 1,500–2,000 sq ft. Published ROI 80% with 3–5 year payback. Operations from 2013; franchising from 2023.',
    website: 'https://www.franchiseindia.com/brands/chisel-montessori.77827',
    established_year: 2013,
    franchise_fee: 1000000,
    total_investment_min: 2000000,
    total_investment_max: 3000000,
    expected_roi_percentage: 80,
    payback_period_months: 48,
    breakeven_period: '3-5 years',
    space_required_sqft: 1500,
    min_area_sqft: 1500,
    max_area_sqft: 2000,
    property_type: 'Domestic',
    headquarters_city: 'Chennai',
    headquarters_state: 'Tamil Nadu',
    preferred_cities: ['Chennai'],
    operating_locations: [{ city: 'Chennai', state: 'Tamil Nadu' }],
    logo_url: `${S3}/uploads/franchisor/chisel-montessori_1.png`,
    images: [],
    training_provided: true,
    marketing_support: true,
    support_provided: ['Standard franchise agreement'],
    store_formats: format({
      minSqft: 1500,
      maxSqft: 2000,
      investmentMin: 2000000,
      investmentMax: 3000000,
      franchiseFee: 1000000,
      propertyType: 'Domestic',
    }),
    featured: false,
    trending: false,
  },
  {
    slug: 'farmers-best',
    brand_name: 'Farmers Best',
    industry: 'Retail',
    tagline: 'Organic products retail',
    description:
      'Organic products retailer listed on Franchise India. Investment ₹20–30 lakh, brand fee ₹2.9 lakh, 10% royalty, 600–3,000 sq ft commercial space. Published ROI 25%. Operations from 2016; franchising from 2020. Headquarters Hyderabad. Appears on Franchise India’s Chennai opportunities list.',
    website: 'https://www.franchiseindia.com/brands/farmers-best.43270',
    established_year: 2016,
    franchise_fee: 290000,
    total_investment_min: 2000000,
    total_investment_max: 3000000,
    royalty_percentage: 10,
    expected_roi_percentage: 25,
    space_required_sqft: 600,
    min_area_sqft: 600,
    max_area_sqft: 3000,
    property_type: 'Commercial',
    headquarters_city: 'Hyderabad',
    headquarters_state: 'Telangana',
    preferred_cities: ['Chennai', 'Hyderabad'],
    logo_url: `${S3}/uploads/franchisor/open-thought-retail-private-limited_1.jpg`,
    images: [],
    training_provided: true,
    marketing_support: true,
    support_provided: ['Operating manuals', 'In-store training', 'Field assistance', 'IT systems'],
    store_formats: format({
      minSqft: 600,
      maxSqft: 3000,
      investmentMin: 2000000,
      investmentMax: 3000000,
      franchiseFee: 290000,
      propertyType: 'Commercial',
    }),
    featured: false,
    trending: false,
  },
];

const DUMMY_SLUGS = [
  'coffeehub-express-cad2',
  'fitzone-gym-8197',
  'edutech-academy-3390',
];

async function ensureCatalogUser() {
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users?.find((u) => u.email === CATALOG_EMAIL);
  if (existing) {
    await admin.from('profiles').upsert({
      id: existing.id,
      email: CATALOG_EMAIL,
      display_name: 'Franchise India Catalog',
      role: 'franchisor',
      updated_at: new Date().toISOString(),
    });
    return existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: CATALOG_EMAIL,
    password: CATALOG_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: 'Franchise India Catalog', role: 'franchisor' },
  });
  if (error) throw new Error(`Failed to create catalog user: ${error.message}`);

  await admin.from('profiles').upsert({
    id: data.user.id,
    email: CATALOG_EMAIL,
    display_name: 'Franchise India Catalog',
    role: 'franchisor',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  return data.user.id;
}

async function upsertListing(franchisorId, listing) {
  const row = {
    ...listing,
    franchisor_id: franchisorId,
    headquarters_country: 'India',
    status: 'active',
    visibility: 'public',
    verification_status: 'pending',
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await admin
    .from('franchises')
    .select('id')
    .eq('slug', listing.slug)
    .maybeSingle();

  if (existing) {
    const { error } = await admin.from('franchises').update(row).eq('id', existing.id);
    if (error) throw new Error(`${listing.brand_name}: ${error.message}`);
    console.log(`  ↳ updated ${listing.brand_name} (${existing.id})`);
    return existing.id;
  }

  const { data, error } = await admin.from('franchises').insert(row).select('id').single();
  if (error) throw new Error(`${listing.brand_name}: ${error.message}`);
  console.log(`  ✓ inserted ${listing.brand_name} (${data.id})`);
  return data.id;
}

async function main() {
  console.log('Importing Franchise India listings\n');
  const franchisorId = await ensureCatalogUser();
  console.log(`Catalog franchisor: ${franchisorId}\n`);

  for (const listing of LISTINGS) {
    await upsertListing(franchisorId, listing);
  }

  if (DUMMY_SLUGS.length) {
    const { error } = await admin
      .from('franchises')
      .update({ status: 'inactive' })
      .in('slug', DUMMY_SLUGS);
    if (error) console.warn('Could not hide sample Unsplash listings:', error.message);
    else console.log(`\nHid sample listings: ${DUMMY_SLUGS.join(', ')}`);
  }

  console.log('\n=== IMPORT COMPLETE ===');
  console.log(`${LISTINGS.length} Franchise India brands are now active.`);
  console.log('Try: Food & Beverage + ₹50L + Chennai');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
