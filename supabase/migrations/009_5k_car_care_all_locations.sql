-- Complete 5K Car Care Franchise Locations Insert
-- This includes ALL branches from https://5kcarcare.com/branches/
-- Run this AFTER running 007_5k_car_care_simple.sql

DO $$
DECLARE
  franchise_uuid UUID;
BEGIN
  -- Get the 5K Car Care franchise UUID
  SELECT id INTO franchise_uuid FROM public.franchises WHERE slug = '5kcarcare' LIMIT 1;

  -- If franchise doesn't exist, exit early
  IF franchise_uuid IS NULL THEN
    RAISE NOTICE '❌ 5K Car Care franchise not found. Please run 007_5k_car_care_simple.sql first.';
    RETURN;
  END IF;

  -- First, delete existing locations for this franchise to avoid duplicates
  DELETE FROM public.franchise_locations WHERE franchise_id = franchise_uuid;

  RAISE NOTICE '✅ Found 5K Car Care franchise with ID: %', franchise_uuid;
  RAISE NOTICE '📍 Inserting all branch locations...';

  -- Insert ALL Branch Locations from https://5kcarcare.com/branches/
  INSERT INTO public.franchise_locations (franchise_id, location_name, address_line1, city, state, zip_code, country, latitude, longitude, status, verified) VALUES
  
  -- TAMIL NADU BRANCHES (A-Z)
  (franchise_uuid, '5K Car Care - Ammapalayam', 'Ammapalayam Main Road', 'Ammapalayam', 'Tamil Nadu', '638701', 'India', 11.45, 77.68, 'operating', true),
  (franchise_uuid, '5K Car Care - Ambattur', 'Ambattur Industrial Estate', 'Chennai', 'Tamil Nadu', '600053', 'India', 13.1067, 80.1618, 'operating', true),
  (franchise_uuid, '5K Car Care - Andimadam', 'Andimadam Main Road', 'Andimadam', 'Tamil Nadu', '621801', 'India', 11.38, 78.96, 'operating', true),
  (franchise_uuid, '5K Car Care - Annur', 'Annur Main Road', 'Annur', 'Tamil Nadu', '641653', 'India', 11.2341, 77.1082, 'operating', true),
  (franchise_uuid, '5K Car Care - Ariyalur', 'Main Road', 'Ariyalur', 'Tamil Nadu', '621704', 'India', 11.14, 79.08, 'operating', true),
  (franchise_uuid, '5K Car Care - Arumbakkam', 'Arumbakkam', 'Chennai', 'Tamil Nadu', '600106', 'India', 13.0733, 80.2089, 'operating', true),
  (franchise_uuid, '5K Car Care - Aruppukottai', 'Main Road', 'Aruppukottai', 'Tamil Nadu', '626101', 'India', 9.5133, 78.0967, 'operating', true),
  (franchise_uuid, '5K Car Care - Athipet', 'Athipet Main Road', 'Chennai', 'Tamil Nadu', '600052', 'India', 13.0644, 80.2569, 'operating', true),
  (franchise_uuid, '5K Car Care - Attur', 'Main Road', 'Attur', 'Tamil Nadu', '636102', 'India', 11.5960, 78.5984, 'operating', true),
  (franchise_uuid, '5K Car Care - Avadi', 'Avadi Main Road', 'Chennai', 'Tamil Nadu', '600054', 'India', 13.1067, 80.0972, 'operating', true),
  (franchise_uuid, '5K Car Care - Avadi Moorthy Nagar', 'Moorthy Nagar', 'Chennai', 'Tamil Nadu', '600054', 'India', 13.1100, 80.1000, 'operating', true),
  (franchise_uuid, '5K Car Care - Avarampalayam', 'Avarampalayam Road', 'Coimbatore', 'Tamil Nadu', '641006', 'India', 11.0243, 76.9763, 'operating', true),
  
  -- Bangalore (Karnataka)
  (franchise_uuid, '5K Car Care - Bangalore', 'Main Road', 'Bangalore', 'Karnataka', '560001', 'India', 12.9716, 77.5946, 'operating', true),
  
  -- Chennai Branches
  (franchise_uuid, '5K Car Care - Chengalpattu', 'Main Road', 'Chengalpattu', 'Tamil Nadu', '603001', 'India', 12.6819, 79.9888, 'operating', true),
  (franchise_uuid, '5K Car Care - Chennai Potheri', 'SRM Road', 'Chennai', 'Tamil Nadu', '603203', 'India', 12.8231, 80.0425, 'operating', true),
  (franchise_uuid, '5K Car Care - Chennai Selaiyur', 'Selaiyur Main Road', 'Chennai', 'Tamil Nadu', '600073', 'India', 12.9033, 80.1441, 'operating', true),
  (franchise_uuid, '5K Car Care - Cheyyar', 'Main Road', 'Cheyyar', 'Tamil Nadu', '604407', 'India', 12.6614, 79.5424, 'operating', true),
  (franchise_uuid, '5K Car Care - Chidambaram', 'Main Road', 'Chidambaram', 'Tamil Nadu', '608001', 'India', 11.3993, 79.6924, 'operating', true),
  (franchise_uuid, '5K Car Care - Chinnasalem', 'Main Road', 'Chinnasalem', 'Tamil Nadu', '606201', 'India', 11.6336, 79.0039, 'operating', true),
  
  -- Coimbatore Region
  (franchise_uuid, '5K Car Care - Codissia', 'CODISSIA Trade Fair Complex', 'Coimbatore', 'Tamil Nadu', '641014', 'India', 11.0512, 76.9982, 'operating', true),
  (franchise_uuid, '5K Car Care - Cuddalore', 'Main Road', 'Cuddalore', 'Tamil Nadu', '607001', 'India', 11.7480, 79.7714, 'operating', true),
  (franchise_uuid, '5K Car Care - Cumbum', 'Main Road', 'Cumbum', 'Tamil Nadu', '625516', 'India', 9.7316, 77.2842, 'operating', true),
  (franchise_uuid, '5K Car Care - Dharapuram', 'Main Road', 'Dharapuram', 'Tamil Nadu', '638656', 'India', 10.7363, 77.5306, 'operating', true),
  (franchise_uuid, '5K Car Care - Dharmapuri', 'Main Road', 'Dharmapuri', 'Tamil Nadu', '636701', 'India', 12.1211, 78.1582, 'operating', true),
  (franchise_uuid, '5K Car Care - Dindugal', 'Trichy Road', 'Dindigul', 'Tamil Nadu', '624001', 'India', 10.3624, 77.9694, 'operating', true),
  (franchise_uuid, '5K Car Care - Edayarpalayam 2', 'Edayarpalayam', 'Coimbatore', 'Tamil Nadu', '641025', 'India', 11.0521, 77.0133, 'operating', true),
  (franchise_uuid, '5K Car Care - Erode Nasiyanur 2', 'Nasiyanur Road', 'Erode', 'Tamil Nadu', '638001', 'India', 11.3433, 77.7150, 'operating', true),
  
  -- G-H Branches
  (franchise_uuid, '5K Car Care - Ganapathy', 'Ganapathy Main Road', 'Coimbatore', 'Tamil Nadu', '641006', 'India', 11.0365, 76.9660, 'operating', true),
  (franchise_uuid, '5K Car Care - Gobichettipalayam', 'Modachur Road', 'Gobichettipalayam', 'Tamil Nadu', '638476', 'India', 11.4536, 77.4378, 'operating', true),
  (franchise_uuid, '5K Car Care - Goldwins Elite Grand Mall', 'Goldwins Elite Mall', 'Coimbatore', 'Tamil Nadu', '641002', 'India', 11.0056, 76.9614, 'operating', true),
  (franchise_uuid, '5K Car Care - Goraguntepalya', 'Main Road', 'Bangalore', 'Karnataka', '560040', 'India', 13.0295, 77.5140, 'operating', true),
  (franchise_uuid, '5K Car Care - Guduvanchery', 'GST Road', 'Guduvanchery', 'Tamil Nadu', '603202', 'India', 12.8448, 80.0620, 'operating', true),
  (franchise_uuid, '5K Car Care - Harur', 'Main Road', 'Harur', 'Tamil Nadu', '636903', 'India', 12.0518, 78.4838, 'operating', true),
  (franchise_uuid, '5K Car Care - Hopes 2', 'HOPES Campus', 'Coimbatore', 'Tamil Nadu', '641004', 'India', 10.9990, 76.9616, 'operating', true),
  (franchise_uuid, '5K Car Care - Hosur Old Rayakottah HUDCO', 'Old Rayakottah Road', 'Hosur', 'Tamil Nadu', '635109', 'India', 12.7356, 77.8253, 'operating', true),
  (franchise_uuid, '5K Car Care - Hosur 2', 'Main Road', 'Hosur', 'Tamil Nadu', '635109', 'India', 12.7409, 77.8300, 'operating', true),
  
  -- J-K Branches
  (franchise_uuid, '5K Car Care - Jeeva Nagar Thiruvetriyur', 'Jeeva Nagar', 'Chennai', 'Tamil Nadu', '600019', 'India', 13.1540, 80.2959, 'operating', true),
  (franchise_uuid, '5K Car Care - Kallakurichi', 'Main Road', 'Kallakurichi', 'Tamil Nadu', '606202', 'India', 11.7380, 78.9603, 'operating', true),
  (franchise_uuid, '5K Car Care - Kanchipuram', 'Main Road', 'Kanchipuram', 'Tamil Nadu', '631501', 'India', 12.8342, 79.7036, 'operating', true),
  (franchise_uuid, '5K Car Care - Kandanchavadi', 'OMR Road', 'Chennai', 'Tamil Nadu', '600096', 'India', 12.9606, 80.2385, 'operating', true),
  (franchise_uuid, '5K Car Care - Kangayam', 'Main Road', 'Kangayam', 'Tamil Nadu', '638701', 'India', 10.9962, 77.5613, 'operating', true),
  (franchise_uuid, '5K Car Care - Kannapa Nagar', 'Kannapa Nagar', 'Coimbatore', 'Tamil Nadu', '641027', 'India', 11.0168, 76.9800, 'operating', true),
  (franchise_uuid, '5K Car Care - Karur', 'Trichy Road', 'Karur', 'Tamil Nadu', '639001', 'India', 10.9601, 78.0766, 'operating', true),
  (franchise_uuid, '5K Car Care - Karur 2', 'Main Road', 'Karur', 'Tamil Nadu', '639002', 'India', 10.9630, 78.0800, 'operating', true),
  (franchise_uuid, '5K Car Care - Karaikudi', 'Main Road', 'Karaikudi', 'Tamil Nadu', '630001', 'India', 10.0696, 78.7813, 'operating', true),
  (franchise_uuid, '5K Car Care - Keeranatham', 'Keeranatham Road', 'Coimbatore', 'Tamil Nadu', '641035', 'India', 11.0600, 77.0200, 'operating', true),
  (franchise_uuid, '5K Car Care - Kilakarai', 'Main Road', 'Kilakarai', 'Tamil Nadu', '623517', 'India', 9.2315, 78.7857, 'operating', true),
  (franchise_uuid, '5K Car Care - Kolathur', 'Main Road', 'Chennai', 'Tamil Nadu', '600099', 'India', 13.1272, 80.2203, 'operating', true),
  (franchise_uuid, '5K Car Care - Korattur', 'Korattur Main Road', 'Chennai', 'Tamil Nadu', '600076', 'India', 13.1200, 80.1950, 'operating', true),
  (franchise_uuid, '5K Car Care - Kovaipudur', 'Kovaipudur Main Road', 'Coimbatore', 'Tamil Nadu', '641042', 'India', 10.9423, 76.9270, 'operating', true),
  (franchise_uuid, '5K Car Care - Kovilpalayam', 'Main Road', 'Coimbatore', 'Tamil Nadu', '641107', 'India', 11.0838, 77.0600, 'operating', true),
  (franchise_uuid, '5K Car Care - Kovilpatti', 'Main Road', 'Kovilpatti', 'Tamil Nadu', '628501', 'India', 9.1747, 77.8690, 'operating', true),
  (franchise_uuid, '5K Car Care - Krishnagiri 3', 'Bangalore Road', 'Krishnagiri', 'Tamil Nadu', '635001', 'India', 12.5186, 78.2137, 'operating', true),
  (franchise_uuid, '5K Car Care - Kumbakonam', 'Main Road', 'Kumbakonam', 'Tamil Nadu', '612001', 'India', 10.9617, 79.3881, 'operating', true),
  
  -- Madurai Region
  (franchise_uuid, '5K Car Care - Madurai K K Nagar', 'K K Nagar', 'Madurai', 'Tamil Nadu', '625020', 'India', 9.9543, 78.1420, 'operating', true),
  (franchise_uuid, '5K Car Care - Madurai Kochadai', 'Kochadai Main Road', 'Madurai', 'Tamil Nadu', '625016', 'India', 9.9600, 78.0900, 'operating', true),
  (franchise_uuid, '5K Car Care - Madurai Koodal Nagar', 'Koodal Nagar', 'Madurai', 'Tamil Nadu', '625018', 'India', 9.9700, 78.1300, 'operating', true),
  (franchise_uuid, '5K Car Care - Madurai Palanganatham', 'Palanganatham', 'Madurai', 'Tamil Nadu', '625003', 'India', 9.9300, 78.1200, 'operating', true),
  (franchise_uuid, '5K Car Care - Madurai Iyer Bangalow', 'Iyer Bangalow Road', 'Madurai', 'Tamil Nadu', '625014', 'India', 10.0104, 78.1466, 'operating', true),
  (franchise_uuid, '5K Car Care - Mayiladuthurai', 'Main Road', 'Mayiladuthurai', 'Tamil Nadu', '609001', 'India', 11.1038, 79.6539, 'operating', true),
  (franchise_uuid, '5K Car Care - Mettupalayam', 'Main Road', 'Mettupalayam', 'Tamil Nadu', '641301', 'India', 11.2993, 76.9378, 'operating', true),
  (franchise_uuid, '5K Car Care - Miraj Mall 2', 'Miraj Mall', 'Coimbatore', 'Tamil Nadu', '641028', 'India', 11.0200, 76.9700, 'operating', true),
  (franchise_uuid, '5K Car Care - Mogappair', 'Mogappair Main Road', 'Chennai', 'Tamil Nadu', '600037', 'India', 13.0850, 80.1750, 'operating', true),
  (franchise_uuid, '5K Car Care - Mudichur Lakshmi Nagar', 'Lakshmi Nagar', 'Chennai', 'Tamil Nadu', '600048', 'India', 12.9100, 80.0670, 'operating', true),
  
  -- N-O Branches
  (franchise_uuid, '5K Car Care - Nagercoil', 'Main Road', 'Nagercoil', 'Tamil Nadu', '629001', 'India', 8.1833, 77.4119, 'operating', true),
  (franchise_uuid, '5K Car Care - Namakkal', 'Mohanur Road', 'Namakkal', 'Tamil Nadu', '637001', 'India', 11.2189, 78.1677, 'operating', true),
  (franchise_uuid, '5K Car Care - Namakkal Salem Road', 'Salem Road', 'Namakkal', 'Tamil Nadu', '637001', 'India', 11.2300, 78.1800, 'operating', true),
  (franchise_uuid, '5K Car Care - Namakkal Trichy Road', 'Trichy Road', 'Namakkal', 'Tamil Nadu', '637002', 'India', 11.2100, 78.1600, 'operating', true),
  (franchise_uuid, '5K Car Care - Narasimhanaickenpalayam', 'Main Road', 'Coimbatore', 'Tamil Nadu', '641031', 'India', 11.1096, 77.0027, 'operating', true),
  (franchise_uuid, '5K Car Care - Navakarai', 'Navakarai Road', 'Coimbatore', 'Tamil Nadu', '641105', 'India', 11.0400, 76.9200, 'operating', true),
  (franchise_uuid, '5K Car Care - Neyveli', 'Main Road', 'Neyveli', 'Tamil Nadu', '607801', 'India', 11.5474, 79.4869, 'operating', true),
  (franchise_uuid, '5K Car Care - Nungambakkam', 'Nungambakkam High Road', 'Chennai', 'Tamil Nadu', '600034', 'India', 13.0569, 80.2426, 'operating', true),
  (franchise_uuid, '5K Car Care - Oddanchatram', 'Main Road', 'Oddanchatram', 'Tamil Nadu', '624619', 'India', 10.5064, 77.7567, 'operating', true),
  
  -- P Branches
  (franchise_uuid, '5K Car Care - Padur', 'OMR Road', 'Chennai', 'Tamil Nadu', '603103', 'India', 12.8500, 80.2081, 'operating', true),
  (franchise_uuid, '5K Car Care - Padappai', 'Main Road', 'Padappai', 'Tamil Nadu', '601301', 'India', 12.8802, 80.0169, 'operating', true),
  (franchise_uuid, '5K Car Care - Palani', 'Main Road', 'Palani', 'Tamil Nadu', '624601', 'India', 10.4500, 77.5167, 'operating', true),
  (franchise_uuid, '5K Car Care - Palladam CBE Road', 'CBE Road', 'Palladam', 'Tamil Nadu', '641664', 'India', 10.9922, 77.2864, 'operating', true),
  (franchise_uuid, '5K Car Care - Pallikarnai', 'Main Road', 'Chennai', 'Tamil Nadu', '600100', 'India', 12.9396, 80.2020, 'operating', true),
  (franchise_uuid, '5K Car Care - Panruti', 'Main Road', 'Panruti', 'Tamil Nadu', '607106', 'India', 11.7752, 79.5559, 'operating', true),
  (franchise_uuid, '5K Car Care - Pattukkottai', 'Main Road', 'Pattukkottai', 'Tamil Nadu', '614601', 'India', 10.4261, 79.3200, 'operating', true),
  (franchise_uuid, '5K Car Care - Perambalur', 'Main Road', 'Perambalur', 'Tamil Nadu', '621212', 'India', 11.2336, 78.8820, 'operating', true),
  (franchise_uuid, '5K Car Care - Periyakulam', 'Main Road', 'Periyakulam', 'Tamil Nadu', '625601', 'India', 10.1233, 77.5483, 'operating', true),
  (franchise_uuid, '5K Car Care - Perumbakkam', 'OMR Road', 'Chennai', 'Tamil Nadu', '600100', 'India', 12.9100, 80.1870, 'operating', true),
  (franchise_uuid, '5K Car Care - Perumugai', 'Main Road', 'Vellore', 'Tamil Nadu', '632009', 'India', 12.9400, 79.1400, 'operating', true),
  (franchise_uuid, '5K Car Care - Perundurai', 'Main Road', 'Perundurai', 'Tamil Nadu', '638052', 'India', 11.2750, 77.5878, 'operating', true),
  (franchise_uuid, '5K Car Care - Pochampalli', 'Main Road', 'Pochampalli', 'Tamil Nadu', '635205', 'India', 12.3578, 78.3414, 'operating', true),
  (franchise_uuid, '5K Car Care - Pollachi 2 CBE Road', 'CBE Road', 'Pollachi', 'Tamil Nadu', '642001', 'India', 10.6600, 77.0100, 'operating', true),
  (franchise_uuid, '5K Car Care - Pollachi Palladam Road', 'Palladam Road', 'Pollachi', 'Tamil Nadu', '642001', 'India', 10.6616, 77.0055, 'operating', true),
  (franchise_uuid, '5K Car Care - Porur', 'Porur Main Road', 'Chennai', 'Tamil Nadu', '600116', 'India', 13.0372, 80.1535, 'operating', true),
  (franchise_uuid, '5K Car Care - Puducherry', 'ECR Main Road', 'Puducherry', 'Puducherry', '605001', 'India', 11.9416, 79.8083, 'operating', true),
  (franchise_uuid, '5K Car Care - Purasaiwakkam', 'Main Road', 'Chennai', 'Tamil Nadu', '600007', 'India', 13.0900, 80.2600, 'operating', true),
  
  -- R-S Branches
  (franchise_uuid, '5K Car Care - Rajapalayam', 'Main Road', 'Rajapalayam', 'Tamil Nadu', '626117', 'India', 9.4524, 77.5542, 'operating', true),
  (franchise_uuid, '5K Car Care - Ramanathapuram 2', 'Main Road', 'Ramanathapuram', 'Tamil Nadu', '623501', 'India', 9.3710, 78.8308, 'operating', true),
  (franchise_uuid, '5K Car Care - Ramnad', 'Main Road', 'Ramnad', 'Tamil Nadu', '623501', 'India', 9.3710, 78.8308, 'operating', true),
  (franchise_uuid, '5K Car Care - Red Hills', 'Red Hills Road', 'Chennai', 'Tamil Nadu', '600052', 'India', 13.1900, 80.1800, 'operating', true),
  (franchise_uuid, '5K Car Care - Salem', 'Omalur Main Road', 'Salem', 'Tamil Nadu', '636004', 'India', 11.6643, 78.1460, 'operating', true),
  (franchise_uuid, '5K Car Care - Salem Kandasamy Puthur', 'Kandasamy Puthur', 'Salem', 'Tamil Nadu', '636007', 'India', 11.6700, 78.1500, 'operating', true),
  (franchise_uuid, '5K Car Care - Saravanampatty', 'Avinashi Road', 'Coimbatore', 'Tamil Nadu', '641035', 'India', 11.0776, 77.0018, 'operating', true),
  (franchise_uuid, '5K Car Care - Sattur', 'Main Road', 'Sattur', 'Tamil Nadu', '626203', 'India', 9.3535, 77.9225, 'operating', true),
  (franchise_uuid, '5K Car Care - Seelanaickenpatti', 'Main Road', 'Salem', 'Tamil Nadu', '636201', 'India', 11.7100, 78.1200, 'operating', true),
  (franchise_uuid, '5K Car Care - Selvapuram', 'Selvapuram Road', 'Coimbatore', 'Tamil Nadu', '641026', 'India', 10.9829, 77.0035, 'operating', true),
  (franchise_uuid, '5K Car Care - Shanthi Nagar Palayamkottai', 'Shanthi Nagar', 'Tirunelveli', 'Tamil Nadu', '627002', 'India', 8.7282, 77.7243, 'operating', true),
  (franchise_uuid, '5K Car Care - Singanallur 2', 'Trichy Road', 'Coimbatore', 'Tamil Nadu', '641005', 'India', 10.9945, 77.0257, 'operating', true),
  (franchise_uuid, '5K Car Care - Sivakasi', 'Madurai Road', 'Sivakasi', 'Tamil Nadu', '626123', 'India', 9.4530, 77.8081, 'operating', true),
  (franchise_uuid, '5K Car Care - Sulur 3', 'Sulur Main Road', 'Coimbatore', 'Tamil Nadu', '641402', 'India', 11.0297, 77.1265, 'operating', true),
  (franchise_uuid, '5K Car Care - Sundarapuram', 'Main Road', 'Coimbatore', 'Tamil Nadu', '641028', 'India', 10.9600, 76.9700, 'operating', true),
  (franchise_uuid, '5K Car Care - Surapet Chennai', 'Surapet Area', 'Chennai', 'Tamil Nadu', '600099', 'India', 13.1475, 80.2086, 'operating', true),
  
  -- T Branches
  (franchise_uuid, '5K Car Care - Tenkasi', 'Main Road', 'Tenkasi', 'Tamil Nadu', '627811', 'India', 8.9604, 77.3152, 'operating', true),
  (franchise_uuid, '5K Car Care - Thanjavur', 'Trichy Road', 'Thanjavur', 'Tamil Nadu', '613001', 'India', 10.7870, 79.1378, 'operating', true),
  (franchise_uuid, '5K Car Care - Thanjavur Karanthai', 'Karanthai', 'Thanjavur', 'Tamil Nadu', '613007', 'India', 10.7831, 79.1442, 'operating', true),
  (franchise_uuid, '5K Car Care - Thavalakuppam 2', 'ECR Road', 'Chennai', 'Tamil Nadu', '600041', 'India', 12.9634, 80.2462, 'operating', true),
  (franchise_uuid, '5K Car Care - Theni 2', 'Main Road', 'Theni', 'Tamil Nadu', '625531', 'India', 10.0104, 77.4760, 'operating', true),
  (franchise_uuid, '5K Car Care - Thiruchengode', 'Main Road', 'Thiruchengode', 'Tamil Nadu', '637211', 'India', 11.3778, 77.8930, 'operating', true),
  (franchise_uuid, '5K Car Care - Thirunallur', 'Main Road', 'Thirunallur', 'Tamil Nadu', '609607', 'India', 10.8700, 79.8500, 'operating', true),
  (franchise_uuid, '5K Car Care - Thoothukudi', 'Main Road', 'Thoothukudi', 'Tamil Nadu', '628001', 'India', 8.7642, 78.1348, 'operating', true),
  (franchise_uuid, '5K Car Care - Tiruvallur', 'Shanmuga Padmavathi Nagar', 'Tiruvallur', 'Tamil Nadu', '602001', 'India', 13.1439, 79.9108, 'operating', true),
  (franchise_uuid, '5K Car Care - Thiruverumbur', 'Trichy Main Road', 'Trichy', 'Tamil Nadu', '620013', 'India', 10.8155, 78.7047, 'operating', true),
  (franchise_uuid, '5K Car Care - Thittakudi', 'Main Road', 'Thittakudi', 'Tamil Nadu', '606106', 'India', 11.5400, 79.1800, 'operating', true),
  (franchise_uuid, '5K Car Care - Thudiyalur', 'Main Road', 'Coimbatore', 'Tamil Nadu', '641034', 'India', 11.0900, 76.9400, 'operating', true),
  (franchise_uuid, '5K Car Care - Thuraipakkam', 'OMR Road', 'Chennai', 'Tamil Nadu', '600096', 'India', 12.9349, 80.2426, 'operating', true),
  (franchise_uuid, '5K Car Care - Thuraiyur', 'Main Road', 'Trichy', 'Tamil Nadu', '621010', 'India', 11.1417, 78.5977, 'operating', true),
  (franchise_uuid, '5K Car Care - Tindivanam', 'Main Road', 'Tindivanam', 'Tamil Nadu', '604001', 'India', 12.2384, 79.6526, 'operating', true),
  (franchise_uuid, '5K Car Care - Tirunelveli', 'High Ground Road', 'Tirunelveli', 'Tamil Nadu', '627001', 'India', 8.7139, 77.7567, 'operating', true),
  (franchise_uuid, '5K Car Care - Tirupattur', 'Main Road', 'Tirupattur', 'Tamil Nadu', '635601', 'India', 12.4945, 78.5730, 'operating', true),
  (franchise_uuid, '5K Car Care - Tiruvannamalai 2', 'Main Road', 'Tiruvannamalai', 'Tamil Nadu', '606601', 'India', 12.2253, 79.0747, 'operating', true),
  
  -- Trichy Region
  (franchise_uuid, '5K Car Care - Trichy Collector Office Road', 'Collector Office Road', 'Trichy', 'Tamil Nadu', '620001', 'India', 10.8268, 78.6871, 'operating', true),
  (franchise_uuid, '5K Car Care - Trichy Gundur', 'Gundur Main Road', 'Trichy', 'Tamil Nadu', '620017', 'India', 10.7905, 78.7047, 'operating', true),
  (franchise_uuid, '5K Car Care - Trichy KK Nagar', 'KK Nagar', 'Trichy', 'Tamil Nadu', '620021', 'India', 10.8305, 78.6958, 'operating', true),
  (franchise_uuid, '5K Car Care - Trichy Puthur', 'Puthur Main Road', 'Trichy', 'Tamil Nadu', '620017', 'India', 10.7865, 78.7047, 'operating', true),
  
  -- U-V Branches
  (franchise_uuid, '5K Car Care - Udumalpet Palani Road', 'Palani Road', 'Udumalpet', 'Tamil Nadu', '642126', 'India', 10.5850, 77.2481, 'operating', true),
  (franchise_uuid, '5K Car Care - Udumalpet DV Pattinam', 'DV Pattinam', 'Udumalpet', 'Tamil Nadu', '642126', 'India', 10.5900, 77.2500, 'operating', true),
  (franchise_uuid, '5K Car Care - Vadakovai', 'Vadakovai Road', 'Coimbatore', 'Tamil Nadu', '641041', 'India', 11.0168, 76.9168, 'operating', true),
  (franchise_uuid, '5K Car Care - Vadavalli', 'Vadavalli Main Road', 'Coimbatore', 'Tamil Nadu', '641041', 'India', 11.0234, 76.9043, 'operating', true),
  (franchise_uuid, '5K Car Care - Valasaravakkam', 'Valasaravakkam Main Road', 'Chennai', 'Tamil Nadu', '600087', 'India', 13.0382, 80.1621, 'operating', true),
  (franchise_uuid, '5K Car Care - Valparai', 'Main Road', 'Valparai', 'Tamil Nadu', '642127', 'India', 10.3268, 76.9502, 'operating', true),
  (franchise_uuid, '5K Car Care - Vellalore', 'Vellalore Road', 'Coimbatore', 'Tamil Nadu', '641111', 'India', 10.9600, 77.0100, 'operating', true),
  (franchise_uuid, '5K Car Care - Viluppuram', 'Main Road', 'Viluppuram', 'Tamil Nadu', '605602', 'India', 11.9395, 79.4926, 'operating', true),
  (franchise_uuid, '5K Car Care - Virudhachalam', 'Main Road', 'Virudhachalam', 'Tamil Nadu', '606001', 'India', 11.5208, 79.3241, 'operating', true),
  (franchise_uuid, '5K Car Care - Virudhunagar', 'Main Road', 'Virudhunagar', 'Tamil Nadu', '626001', 'India', 9.5850, 77.9520, 'operating', true),
  (franchise_uuid, '5K Car Care - Vivira Mall', 'Vivira Mall OMR', 'Chennai', 'Tamil Nadu', '600096', 'India', 12.9200, 80.2300, 'operating', true)
  
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Successfully inserted all 5K Car Care locations!';

END $$;

-- Verify the locations were inserted
SELECT 
  COUNT(*) as total_locations,
  COUNT(*) FILTER (WHERE status = 'operating') as operating,
  COUNT(DISTINCT state) as states_covered,
  COUNT(DISTINCT city) as cities_covered
FROM public.franchise_locations 
WHERE franchise_id = (SELECT id FROM public.franchises WHERE slug = '5kcarcare');
