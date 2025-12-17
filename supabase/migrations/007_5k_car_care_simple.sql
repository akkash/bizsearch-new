-- Simplified 5K Car Care Franchise Insert
-- This version creates the franchise without requiring an admin user
-- Run this in your Supabase SQL Editor

-- First, let's check what users exist and pick one to be the franchisor
DO $$
DECLARE
  franchisor_uuid UUID;
  franchise_uuid UUID;
BEGIN
  -- Get ANY existing profile to use as franchisor (first available)
  SELECT id INTO franchisor_uuid FROM public.profiles LIMIT 1;
  
  -- If no profile exists, we'll create the franchise with a placeholder UUID
  -- that can be updated later
  IF franchisor_uuid IS NULL THEN
    RAISE NOTICE 'No user profiles found. Creating franchise anyway with NULL franchisor_id.';
    RAISE NOTICE 'You will need to update the franchisor_id after creating a user.';
  END IF;

  -- Insert 5K Car Care Franchise
  INSERT INTO public.franchises (
    franchisor_id,
    brand_name,
    tagline,
    slug,
    industry,
    headquarters_country,
    headquarters_state,
    headquarters_city,
    established_year,
    description,
    brand_story,
    franchise_fee,
    total_investment_min,
    total_investment_max,
    royalty_percentage,
    marketing_fee_percentage,
    total_outlets,
    company_owned_outlets,
    franchise_outlets,
    space_required_sqft,
    training_provided,
    training_duration_days,
    support_provided,
    marketing_support,
    logo_url,
    contact_email,
    contact_phone,
    website,
    highlights,
    awards,
    status,
    verified,
    featured,
    trending
  ) VALUES (
    franchisor_uuid, -- Can be NULL if no users exist
    '5K Car Care',
    'India''s Leading Car Detailing & Care Service',
    '5kcarcare',
    'Automotive Services',
    'India',
    'Tamil Nadu',
    'Trichy',
    2018,
    '5K Car Care is India''s premier car detailing and care service provider with over 150 branches across Tamil Nadu, Kerala, Karnataka, Telangana, and Pondicherry. We offer comprehensive car care services including detailing, interior and exterior cleaning, sanitization, AC services, and advanced coating solutions using state-of-the-art equipment and technology.',
    '5K Car Care was founded with a vision to revolutionize car care services in India. Starting from Trichy in 2018, we have grown to become one of India''s largest car care franchise networks. Our commitment to quality, customer satisfaction, and advanced technology has earned us the IKON award for Excellence in Car Service and ISO 9001:2015 certification.',
    500000,
    1500000,
    2500000,
    5.00,
    2.00,
    150,
    5,
    145,
    1200,
    true,
    15,
    '["24/7 Technical Support", "Advanced Equipment Provided", "Marketing & Branding Support", "Regular Training Programs", "Operational Guidance", "Quality Control Systems"]'::jsonb,
    true,
    'https://5kcarcare.com/wp-content/uploads/2024/01/5kcarcare-logo.png',
    'franchise@5kcarcare.com',
    '+91 91500 54700',
    'https://5kcarcare.com',
    '["Over 150+ Branches Across South India", "ISO 9001:2015 Certified", "400,000+ Satisfied Customers", "65+ Premium Car Services", "24/7 Operations", "Advanced Automated Equipment", "IKON Award Winner 2019"]'::jsonb,
    '["IKON Award for Excellence in Car Service 2019", "ISO 9001:2015 Certification"]'::jsonb,
    'active',
    true,
    true,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    brand_name = EXCLUDED.brand_name,
    description = EXCLUDED.description,
    status = 'active',
    updated_at = NOW();

  -- Get the franchise UUID
  SELECT id INTO franchise_uuid FROM public.franchises WHERE slug = '5kcarcare' LIMIT 1;

  IF franchise_uuid IS NOT NULL THEN
    RAISE NOTICE '✅ 5K Car Care franchise created with ID: %', franchise_uuid;
  ELSE
    RAISE NOTICE '❌ Failed to create franchise';
  END IF;

END $$;

-- Verify the insert
SELECT id, brand_name, slug, status, verified FROM public.franchises WHERE slug = '5kcarcare';
