-- Seed Data for BizSearch
-- This migration populates the database with sample business and franchise listings

-- First, we need to create a demo seller and franchisor profile
-- Note: Replace these UUIDs with actual user IDs from your auth.users table after signup
-- Or run this after creating test accounts

-- Insert demo businesses
-- Make sure to replace 'SELLER_USER_ID_HERE' with actual user UUID from auth.users

-- Business 1: Mumbai Cafe Chain
INSERT INTO public.businesses (
  seller_id, name, industry, city, state, country, location,
  description, price, revenue, established_year, employees,
  business_type, operating_hours, days_open_per_week,
  highlights, badges, images, logo_url,
  verified, documents_verified, identity_verified,
  status, featured, trending, created_at
) VALUES (
  'dff9f740-f000-4636-8200-156aecaf7282'::uuid,
  'Mumbai Cafe Chain',
  'Food & Beverage',
  'Mumbai',
  'Maharashtra',
  'India',
  'Bandra, Mumbai',
  'Established cafe chain with 3 outlets in prime Mumbai locations. Known for specialty coffee and continental cuisine. Strong brand presence and loyal customer base.',
  4750000,
  9000000,
  2018,
  25,
  'franchise',
  '7:00 AM - 11:00 PM',
  7,
  '["3 prime location outlets", "Established brand with loyal customers", "Consistent 15% annual growth", "Trained staff and management systems"]'::jsonb,
  '["Verified", "Trending", "Hot Deal"]'::jsonb,
  '["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800", "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"]'::jsonb,
  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200',
  true,
  true,
  true,
  'active',
  true,
  true,
  '2024-01-15'::timestamptz
);

-- Business 2: Tech Solutions
INSERT INTO public.businesses (
  seller_id, name, industry, city, state, country, location,
  description, price, revenue, established_year, employees,
  business_type, operating_hours, days_open_per_week,
  highlights, badges, images,
  verified, documents_verified, identity_verified,
  status, featured, trending, created_at
) VALUES (
  'dff9f740-f000-4636-8200-156aecaf7282'::uuid,
  'Tech Solutions Pvt Ltd',
  'Technology',
  'Bangalore',
  'Karnataka',
  'India',
  'Whitefield, Bangalore',
  'Software development company specializing in web and mobile applications. Strong client base across US and Europe with recurring revenue model.',
  13500000,
  25000000,
  2015,
  45,
  'stock_sale',
  '9:00 AM - 6:00 PM',
  5,
  '["45+ skilled developers", "International client base", "Recurring revenue model", "Modern office setup"]'::jsonb,
  '["Verified", "High Growth", "New"]'::jsonb,
  '["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800", "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"]'::jsonb,
  true,
  true,
  true,
  'active',
  true,
  false,
  '2024-01-10'::timestamptz
);

-- Business 3: Fitness First Gym
INSERT INTO public.businesses (
  seller_id, name, industry, city, state, country, location,
  description, price, revenue, established_year, employees,
  business_type, operating_hours, days_open_per_week,
  highlights, badges, images,
  verified, documents_verified, identity_verified,
  status, featured, trending, created_at
) VALUES (
  'dff9f740-f000-4636-8200-156aecaf7282'::uuid,
  'Fitness First Gym',
  'Health & Fitness',
  'Bangalore',
  'Karnataka',
  'India',
  'Koramangala, Bangalore',
  'Well-equipped gym with modern facilities and experienced trainers. Located in prime Koramangala area with high footfall and membership base.',
  2750000,
  4500000,
  2019,
  12,
  'asset_sale',
  '6:00 AM - 10:00 PM',
  7,
  '["Modern equipment worth ₹15L", "500+ active members", "Prime location", "Experienced trainer team"]'::jsonb,
  '["Verified", "Prime Location"]'::jsonb,
  '["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800", "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"]'::jsonb,
  true,
  true,
  true,
  'active',
  false,
  true,
  '2024-01-08'::timestamptz
);

-- Business 4: Fashion Boutique
INSERT INTO public.businesses (
  seller_id, name, industry, city, state, country, location,
  description, price, revenue, established_year, employees,
  business_type, operating_hours, days_open_per_week,
  highlights, badges, images,
  verified, documents_verified, identity_verified,
  status, featured, created_at
) VALUES (
  'dff9f740-f000-4636-8200-156aecaf7282'::uuid,
  'Elite Fashion Boutique',
  'Retail',
  'Mumbai',
  'Maharashtra',
  'India',
  'Linking Road, Mumbai',
  'Premium fashion boutique with curated collection of Indian and Western wear. Established customer base and strong social media presence.',
  2000000,
  7200000,
  2020,
  8,
  'asset_sale',
  '10:00 AM - 9:00 PM',
  7,
  '["Premium location", "Curated collection", "Social media savvy", "Interior worth ₹5L"]'::jsonb,
  '["Verified"]'::jsonb,
  '["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"]'::jsonb,
  true,
  true,
  true,
  'active',
  false,
  '2024-01-05'::timestamptz
);

-- Insert demo franchises
-- Replace 'FRANCHISOR_USER_ID_HERE' with actual user UUID

-- Franchise 1: CoffeeHub Express
INSERT INTO public.franchises (
  franchisor_id, brand_name, industry, description, brand_story,
  franchise_fee, total_investment_min, total_investment_max,
  royalty_percentage, total_outlets,
  headquarters_city, headquarters_state, headquarters_country,
  established_year,
  highlights, awards, images, logo_url,
  verified, documents_verified, franchise_registration_verified,
  status, featured, trending, created_at,
  contact_email, contact_phone, contact_person, website,
  support_provided
) VALUES (
  '324cb775-f452-472c-8ccd-400ee9bc698a'::uuid,
  'CoffeeHub Express',
  'Food & Beverage',
  'Leading coffee franchise with proven business model and strong brand recognition. Perfect for entrepreneurs looking to enter the booming coffee market.',
  'Started in 2015, CoffeeHub Express has revolutionized the coffee experience in India with premium quality coffee at affordable prices.',
  500000,
  1500000,
  2500000,
  6,
  150,
  'Mumbai',
  'Maharashtra',
  'India',
  2015,
  '["Proprietary coffee blend", "30-second service guarantee", "Prime location strategy", "Strong digital presence"]'::jsonb,
  '[]'::jsonb,
  '["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800", "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800"]'::jsonb,
  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200',
  true,
  true,
  true,
  'active',
  true,
  true,
  '2024-01-15'::timestamptz,
  'rohit@coffeehub.com',
  '+91 98765 54321',
  'Rohit Mehta',
  'www.coffeehubexpress.com',
  '["2 weeks intensive training + ongoing support", "National campaigns + local marketing support", "Operations manual + regular audits", "POS system + mobile app integration"]'::jsonb
);

-- Franchise 2: FitZone Gym
INSERT INTO public.franchises (
  franchisor_id, brand_name, industry, description, brand_story,
  franchise_fee, total_investment_min, total_investment_max,
  royalty_percentage, total_outlets,
  headquarters_city, headquarters_state, headquarters_country,
  established_year,
  highlights, images, logo_url,
  verified, documents_verified, franchise_registration_verified,
  status, featured, trending, created_at,
  contact_email, contact_phone, contact_person, website,
  support_provided
) VALUES (
  '324cb775-f452-472c-8ccd-400ee9bc698a'::uuid,
  'FitZone Gym',
  'Health & Fitness',
  'Premium fitness franchise with state-of-the-art equipment and comprehensive fitness programs. Proven track record of successful franchisees.',
  'FitZone has been transforming lives through fitness for over 8 years, with a focus on personalized training and community building.',
  1000000,
  4000000,
  6000000,
  8,
  85,
  'Bangalore',
  'Karnataka',
  'India',
  2016,
  '["Latest fitness equipment", "Certified trainer network", "Comprehensive wellness programs", "Strong member retention"]'::jsonb,
  '["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800", "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"]'::jsonb,
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200',
  true,
  true,
  true,
  'active',
  true,
  true,
  '2024-01-14'::timestamptz,
  'contact@fitzone.com',
  '+91 98765 54322',
  'Anjali Singh',
  'www.fitzonegym.com',
  '["4 weeks comprehensive training program", "Grand opening support + ongoing campaigns", "Operations support + business coaching", "Gym management software + member app"]'::jsonb
);

-- Franchise 3: EduTech Academy
INSERT INTO public.franchises (
  franchisor_id, brand_name, industry, description, brand_story,
  franchise_fee, total_investment_min, total_investment_max,
  royalty_percentage, total_outlets,
  headquarters_city, headquarters_state, headquarters_country,
  established_year,
  highlights, images, logo_url,
  verified, documents_verified, franchise_registration_verified,
  status, featured, trending, created_at,
  contact_email, contact_phone, contact_person,
  support_provided
) VALUES (
  '324cb775-f452-472c-8ccd-400ee9bc698a'::uuid,
  'EduTech Academy',
  'Education',
  'Technology-driven education franchise offering coding, robotics, and STEM programs for kids aged 6-16. Comprehensive curriculum and training provided.',
  'Founded in 2017, EduTech Academy aims to make quality STEM education accessible to every child through innovative teaching methods.',
  300000,
  800000,
  1200000,
  5,
  120,
  'Pune',
  'Maharashtra',
  'India',
  2017,
  '["Proven curriculum", "Low operational costs", "Recurring revenue", "Growing market demand"]'::jsonb,
  '["https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800"]'::jsonb,
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200',
  true,
  true,
  true,
  'active',
  true,
  false,
  '2024-01-12'::timestamptz,
  'franchise@edutech.com',
  '+91 98765 54323',
  'Vikram Patel',
  '["3 weeks training program", "Marketing materials provided", "Ongoing curriculum updates", "Online learning platform"]'::jsonb
);

-- Seed data successfully configured with:
-- Seller ID: dff9f740-f000-4636-8200-156aecaf7282
-- Franchisor ID: 324cb775-f452-472c-8ccd-400ee9bc698a
-- IDs are auto-generated by database for all listings
