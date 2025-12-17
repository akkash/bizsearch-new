-- Insert 5K Car Care Franchise Data and Branch Locations

-- Note: This migration assumes the franchisor profile already exists or will be created through the signup flow
-- For demo purposes, we'll reference an existing admin user or create a placeholder

DO $$
DECLARE
  franchisor_uuid UUID;
  franchise_uuid UUID;
BEGIN
  -- Try to get an existing admin user, or use a placeholder
  SELECT id INTO franchisor_uuid FROM public.profiles WHERE role = 'admin' LIMIT 1;
  
  -- If no admin found, exit early (franchisor must be created through signup)
  IF franchisor_uuid IS NULL THEN
    RAISE NOTICE 'No admin user found. Please create a franchisor profile through the signup flow.';
    RETURN;
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
    franchisor_uuid,
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
    updated_at = NOW();

  -- Get the franchise UUID
  SELECT id INTO franchise_uuid FROM public.franchises WHERE slug = '5kcarcare' LIMIT 1;

  -- If franchise doesn't exist, exit early
  IF franchise_uuid IS NULL THEN
    RAISE NOTICE 'Failed to create or find franchise';
    RETURN;
  END IF;

  -- Insert Branch Locations (Sample locations from Tamil Nadu)
  INSERT INTO public.franchise_locations (franchise_id, location_name, address_line1, city, state, zip_code, country, latitude, longitude, status, opening_date, verified) VALUES
  
  -- Chennai Branches
  (franchise_uuid, '5K Car Care - Thuraipakkam', 'OMR Road', 'Chennai', 'Tamil Nadu', '600096', 'India', 12.9349, 80.2426, 'operating', '2021-04-12', true),
  (franchise_uuid, '5K Car Care - Nungambakkam', 'Nungambakkam High Road', 'Chennai', 'Tamil Nadu', '600034', 'India', 13.0569, 80.2426, 'operating', '2020-08-15', true),
  (franchise_uuid, '5K Car Care - Athipet', 'Athipet Main Road', 'Chennai', 'Tamil Nadu', '600052', 'India', 13.0644, 80.2569, 'operating', '2022-12-26', true),
  (franchise_uuid, '5K Car Care - Surapet', 'Surapet Area', 'Chennai', 'Tamil Nadu', '600099', 'India', 13.1475, 80.2086, 'operating', '2021-09-10', true),
  (franchise_uuid, '5K Car Care - Valasaravakkam', 'Valasaravakkam Main Road', 'Chennai', 'Tamil Nadu', '600087', 'India', 13.0382, 80.1621, 'operating', '2022-03-20', true),
  (franchise_uuid, '5K Car Care - Thavalakuppam', 'ECR Road', 'Chennai', 'Tamil Nadu', '600041', 'India', 12.9634, 80.2462, 'operating', '2021-11-05', true),
  
  -- Trichy Branches
  (franchise_uuid, '5K Car Care - Thiruverumbur', 'Trichy Main Road', 'Trichy', 'Tamil Nadu', '620013', 'India', 10.8155, 78.7047, 'operating', '2019-01-15', true),
  (franchise_uuid, '5K Car Care - Collector Office Road', 'Collector Office Road', 'Trichy', 'Tamil Nadu', '620001', 'India', 10.8268, 78.6871, 'operating', '2019-06-20', true),
  (franchise_uuid, '5K Car Care - Gundur', 'Gundur Main Road', 'Trichy', 'Tamil Nadu', '620017', 'India', 10.7905, 78.7047, 'operating', '2020-02-10', true),
  (franchise_uuid, '5K Car Care - KK Nagar', 'KK Nagar', 'Trichy', 'Tamil Nadu', '620021', 'India', 10.8305, 78.6958, 'operating', '2020-07-15', true),
  (franchise_uuid, '5K Car Care - Puthur', 'Puthur Main Road', 'Trichy', 'Tamil Nadu', '620017', 'India', 10.7865, 78.7047, 'operating', '2021-01-20', true),
  
  -- Coimbatore Branches
  (franchise_uuid, '5K Car Care - Singanallur', 'Trichy Road', 'Coimbatore', 'Tamil Nadu', '641005', 'India', 10.9945, 77.0257, 'operating', '2020-05-12', true),
  (franchise_uuid, '5K Car Care - Saravanampatti', 'Avinashi Road', 'Coimbatore', 'Tamil Nadu', '641035', 'India', 11.0776, 77.0018, 'operating', '2021-03-18', true),
  (franchise_uuid, '5K Car Care - Vadavalli', 'Vadavalli Main Road', 'Coimbatore', 'Tamil Nadu', '641041', 'India', 11.0234, 76.9043, 'operating', '2021-08-25', true),
  (franchise_uuid, '5K Car Care - Sulur', 'Sulur Main Road', 'Coimbatore', 'Tamil Nadu', '641402', 'India', 11.0297, 77.1265, 'operating', '2022-01-10', true),
  
  -- Madurai Branches
  (franchise_uuid, '5K Car Care - Palani Road', 'Palani Road', 'Madurai', 'Tamil Nadu', '625014', 'India', 10.0104, 78.1466, 'operating', '2020-09-15', true),
  (franchise_uuid, '5K Car Care - Goripalayam', 'Goripalayam Main Road', 'Madurai', 'Tamil Nadu', '625002', 'India', 9.9252, 78.1198, 'operating', '2021-02-20', true),
  
  -- Salem Branches
  (franchise_uuid, '5K Car Care - Salem', 'Omalur Main Road', 'Salem', 'Tamil Nadu', '636004', 'India', 11.6643, 78.1460, 'operating', '2020-11-05', true),
  
  -- Erode Branches
  (franchise_uuid, '5K Car Care - Erode', 'Perundurai Road', 'Erode', 'Tamil Nadu', '638011', 'India', 11.3410, 77.7172, 'operating', '2021-04-18', true),
  
  -- Tirunelveli Branches
  (franchise_uuid, '5K Car Care - Tirunelveli', 'High Ground Road', 'Tirunelveli', 'Tamil Nadu', '627001', 'India', 8.7139, 77.7567, 'operating', '2021-06-22', true),
  (franchise_uuid, '5K Car Care - Palayamkottai', 'Shanthi Nagar', 'Tirunelveli', 'Tamil Nadu', '627002', 'India', 8.7282, 77.7243, 'operating', '2021-09-30', true),
  
  -- Vellore Branches
  (franchise_uuid, '5K Car Care - Vellore', 'Katpadi Road', 'Vellore', 'Tamil Nadu', '632004', 'India', 12.9165, 79.1325, 'operating', '2021-07-12', true),
  
  -- Thanjavur Branches
  (franchise_uuid, '5K Car Care - Thanjavur', 'Trichy Road', 'Thanjavur', 'Tamil Nadu', '613001', 'India', 10.7870, 79.1378, 'operating', '2021-10-15', true),
  (franchise_uuid, '5K Car Care - Karanthattankudi', 'Karanthattankudi', 'Thanjavur', 'Tamil Nadu', '613007', 'India', 10.7831, 79.1442, 'operating', '2022-02-18', true),
  
  -- Puducherry
  (franchise_uuid, '5K Car Care - Puducherry', 'ECR Main Road', 'Puducherry', 'Puducherry', '605001', 'India', 11.9416, 79.8083, 'operating', '2021-09-24', true),
  
  -- Krishnagiri
  (franchise_uuid, '5K Car Care - Krishnagiri', 'Bangalore Road', 'Krishnagiri', 'Tamil Nadu', '635001', 'India', 12.5186, 78.2137, 'operating', '2023-02-03', true),
  
  -- Namakkal
  (franchise_uuid, '5K Car Care - Namakkal', 'Mohanur Road', 'Namakkal', 'Tamil Nadu', '637001', 'India', 11.2189, 78.1677, 'operating', '2023-03-08', true),
  
  -- Sivakasi
  (franchise_uuid, '5K Car Care - Sivakasi', 'Madurai Road', 'Sivakasi', 'Tamil Nadu', '626123', 'India', 9.4530, 77.8081, 'operating', '2022-05-12', true),
  
  -- Dindigul
  (franchise_uuid, '5K Car Care - Dindigul', 'Trichy Road', 'Dindigul', 'Tamil Nadu', '624001', 'India', 10.3624, 77.9694, 'operating', '2022-08-20', true),
  
  -- Karur
  (franchise_uuid, '5K Car Care - Karur', 'Trichy Road', 'Karur', 'Tamil Nadu', '639001', 'India', 10.9601, 78.0766, 'operating', '2022-11-15', true),
  
  -- Expansion Territories (Looking for Franchise)
  (franchise_uuid, '5K Car Care - Kanyakumari Territory', 'Kanyakumari District', 'Kanyakumari', 'Tamil Nadu', '629001', 'India', 8.0883, 77.5385, 'looking_for_franchise', NULL, false),
  (franchise_uuid, '5K Car Care - Tuticorin Territory', 'Tuticorin District', 'Tuticorin', 'Tamil Nadu', '628001', 'India', 8.7642, 78.1348, 'looking_for_franchise', NULL, false),
  (franchise_uuid, '5K Car Care - Cuddalore Territory', 'Cuddalore District', 'Cuddalore', 'Tamil Nadu', '607001', 'India', 11.7480, 79.7714, 'looking_for_franchise', NULL, false),
  (franchise_uuid, '5K Car Care - Dharmapuri Territory', 'Dharmapuri District', 'Dharmapuri', 'Tamil Nadu', '636701', 'India', 12.1211, 78.1582, 'looking_for_franchise', NULL, false);

END $$;
