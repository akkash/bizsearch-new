/**
 * Franchise Categories and Subcategories
 * Complete structure based on FranchiseIndia.com
 */

export interface SubCategory {
    id: string;
    name: string;
    slug: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string; // lucide icon name
    subcategories: SubCategory[];
}

export const FRANCHISE_CATEGORIES: Category[] = [
    {
        id: 'automotive',
        name: 'Automotive',
        slug: 'automotive',
        icon: 'Car',
        subcategories: [
            // Automobile Related
            { id: 'automobile-accessories', name: 'Automobile Accessories', slug: 'automobile-accessories' },
            { id: 'automobile-garage', name: 'Automobile Garage & Related', slug: 'automobile-garage' },
            { id: 'automobile-spares-tyre', name: 'Automobile Spares / Tyre', slug: 'automobile-spares-tyre' },
            { id: 'charging-stations', name: 'EV Charging Stations', slug: 'charging-stations' },
            { id: 'road-safety', name: 'Road Safety Equipments', slug: 'road-safety' },
            // Commercial Vehicles
            { id: 'commercial-vehicles', name: 'Commercial Vehicles', slug: 'commercial-vehicles' },
            { id: 'three-wheeler', name: 'Three Wheeler (Auto) Showroom', slug: 'three-wheeler' },
            { id: 'tractors', name: 'Tractors', slug: 'tractors' },
            // Four Wheeler
            { id: 'car-showroom', name: 'Car Showroom', slug: 'car-showroom' },
            { id: 'car-maintenance-repair', name: 'Car Maintenance & Repair', slug: 'car-maintenance-repair' },
            { id: 'car-wash-detailing', name: 'Car Wash / Ceramic Coating / Detailing', slug: 'car-wash-detailing' },
            { id: 'car-rental', name: 'Car Rental', slug: 'car-rental' },
            { id: 'car-reselling', name: 'Used Car Reselling', slug: 'car-reselling' },
            { id: 'electric-vehicles-four', name: 'Electric Vehicles Four Wheelers (EV)', slug: 'electric-vehicles-four' },
            // Two Wheeler
            { id: 'bike-showroom', name: 'Bike Showroom', slug: 'bike-showroom' },
            { id: 'bike-maintenance-repair', name: 'Bike Maintenance & Repair', slug: 'bike-maintenance-repair' },
            { id: 'bike-rental', name: 'Bike Rental', slug: 'bike-rental' },
            { id: 'electric-vehicles-two', name: 'Electric Vehicles Two Wheelers (EV)', slug: 'electric-vehicles-two' },
            { id: 'bicycle', name: 'Bicycle', slug: 'bicycle' },
            { id: 'bikers-accessories', name: "Biker's Accessories", slug: 'bikers-accessories' },
        ],
    },
    {
        id: 'beauty-health',
        name: 'Beauty & Health',
        slug: 'beauty-health',
        icon: 'Sparkles',
        subcategories: [
            // Beauty Aesthetics & Supplies
            { id: 'beauty-salons', name: 'Beauty Salons / Unisex Salons', slug: 'beauty-salons' },
            { id: 'cosmetics-stores', name: 'Cosmetics & Beauty Product Stores', slug: 'cosmetics-stores' },
            { id: 'beauty-equipments', name: 'Beauty Equipments', slug: 'beauty-equipments' },
            { id: 'bath-products', name: 'Bath Products', slug: 'bath-products' },
            { id: 'tattoo-nail-art', name: 'Tattoo, Piercing & Nail Art', slug: 'tattoo-nail-art' },
            { id: 'pet-grooming', name: 'Pet Grooming', slug: 'pet-grooming' },
            // Health Care
            { id: 'ayurvedic-herbal', name: 'Ayurvedic, Herbal & Organic Products', slug: 'ayurvedic-herbal' },
            { id: 'clinics-nursing', name: 'Clinics & Nursing Homes', slug: 'clinics-nursing' },
            { id: 'hospitals', name: 'Hospitals', slug: 'hospitals' },
            { id: 'healthcare-products', name: 'Healthcare Products', slug: 'healthcare-products' },
            { id: 'pathological-labs', name: 'Pathological Labs', slug: 'pathological-labs' },
            { id: 'pharmacies', name: 'Pharmacies', slug: 'pharmacies' },
            { id: 'dental-clinics', name: 'Dental Clinics', slug: 'dental-clinics' },
            { id: 'optical-stores', name: 'Optical Stores', slug: 'optical-stores' },
            // Wellness
            { id: 'gyms-fitness', name: 'Gyms & Fitness Centres', slug: 'gyms-fitness' },
            { id: 'spas', name: 'Spas', slug: 'spas' },
            { id: 'medical-spas', name: 'Medical Spas', slug: 'medical-spas' },
            { id: 'massage-centres', name: 'Massage Centres', slug: 'massage-centres' },
            { id: 'slimming-center', name: 'Slimming Center', slug: 'slimming-center' },
            { id: 'yoga-classes', name: 'Yoga Classes', slug: 'yoga-classes' },
            { id: 'meditation-centre', name: 'Meditation Centre', slug: 'meditation-centre' },
            { id: 'diet-consultancy', name: 'Diet Consultancy', slug: 'diet-consultancy' },
            { id: 'physiotherapy', name: 'Physiotherapy Centre', slug: 'physiotherapy' },
        ],
    },
    {
        id: 'business-services',
        name: 'Business Services',
        slug: 'business-services',
        icon: 'Briefcase',
        subcategories: [
            // Advertisement & Media
            { id: 'ad-agencies', name: 'Ad Agencies & Collection Centres', slug: 'ad-agencies' },
            { id: 'digital-marketing', name: 'Digital Media & Internet Marketing', slug: 'digital-marketing' },
            { id: 'public-relations', name: 'Public Relations (PR)', slug: 'public-relations' },
            { id: 'publications-print', name: 'Publications & Print Media', slug: 'publications-print' },
            // Consultancy
            { id: 'bpo', name: 'BPO', slug: 'bpo' },
            { id: 'career-counseling', name: 'Career Counseling', slug: 'career-counseling' },
            { id: 'financial-consultancy', name: 'Financial Consultancy', slug: 'financial-consultancy' },
            { id: 'hr-recruitment', name: 'HR & Recruitment', slug: 'hr-recruitment' },
            { id: 'immigration', name: 'Immigration Services', slug: 'immigration' },
            { id: 'legal-services', name: 'Legal Services', slug: 'legal-services' },
            { id: 'matrimonial', name: 'Matrimonial Services', slug: 'matrimonial' },
            { id: 'real-estate', name: 'Real Estate Services', slug: 'real-estate' },
            { id: 'technology-consultancy', name: 'Technology Consultancy', slug: 'technology-consultancy' },
            // Financial
            { id: 'accounting-auditing', name: 'Accounting & Auditing', slug: 'accounting-auditing' },
            { id: 'finance-advisors', name: 'Finance Advisors & Brokers', slug: 'finance-advisors' },
            { id: 'financial-trading', name: 'Financial Investment & Trading', slug: 'financial-trading' },
            { id: 'forex', name: 'Foreign Exchange (FOREX)', slug: 'forex' },
            { id: 'insurance', name: 'Insurance', slug: 'insurance' },
            { id: 'microfinance', name: 'Microfinance', slug: 'microfinance' },
            { id: 'nbfc', name: 'NBFC', slug: 'nbfc' },
            { id: 'payment-solutions', name: 'Payment Solution Services', slug: 'payment-solutions' },
            { id: 'tax-consulting', name: 'Tax Consulting', slug: 'tax-consulting' },
            { id: 'wealth-management', name: 'Wealth Management', slug: 'wealth-management' },
            // IT Services
            { id: 'computer-ict', name: 'Computer & ICT Services', slug: 'computer-ict' },
            { id: 'cartridge-refilling', name: 'Cartridge Refilling', slug: 'cartridge-refilling' },
            { id: 'printing-services', name: 'Printing Services', slug: 'printing-services' },
            { id: 'security-services', name: 'Security Services', slug: 'security-services' },
            { id: 'telecom', name: 'Telecom', slug: 'telecom' },
            // Logistics
            { id: 'courier-delivery', name: 'Courier & Delivery', slug: 'courier-delivery' },
            { id: 'logistics-outsourcing', name: 'Logistics Outsourcing', slug: 'logistics-outsourcing' },
            { id: 'supply-chain', name: 'Supply Chain Management', slug: 'supply-chain' },
            { id: 'transportation', name: 'Transportation', slug: 'transportation' },
            { id: 'warehousing', name: 'Warehousing', slug: 'warehousing' },
        ],
    },
    {
        id: 'dealers-distributors',
        name: 'Dealers & Distributors',
        slug: 'dealers-distributors',
        icon: 'Package',
        subcategories: [
            // Agriculture
            { id: 'agro-products', name: 'Agro Products & Commodities', slug: 'agro-products' },
            { id: 'poultry-feed', name: 'Poultry Feed', slug: 'poultry-feed' },
            { id: 'farming-tools', name: 'Farming Tools & Machines', slug: 'farming-tools' },
            { id: 'fishery', name: 'Fishery', slug: 'fishery' },
            // Automobile
            { id: 'auto-accessories-dist', name: 'Automobile Accessories Distribution', slug: 'auto-accessories-dist' },
            { id: 'auto-components', name: 'Automobile Components', slug: 'auto-components' },
            { id: 'auto-spare-parts', name: 'Engine & Spare Parts', slug: 'auto-spare-parts' },
            { id: 'oil-lubricants', name: 'Oil & Lubricants', slug: 'oil-lubricants' },
            { id: 'tyre-tube', name: 'Tyre & Tube', slug: 'tyre-tube' },
            // Building & Construction
            { id: 'bathroom-fittings', name: 'Bathroom Fittings', slug: 'bathroom-fittings' },
            { id: 'bricks-cement', name: 'Bricks & Cement', slug: 'bricks-cement' },
            { id: 'hardware', name: 'Hardware', slug: 'hardware' },
            { id: 'paints', name: 'Paints', slug: 'paints' },
            { id: 'tiles', name: 'Tiles', slug: 'tiles' },
            { id: 'doors-windows', name: 'Doors & Windows', slug: 'doors-windows' },
            { id: 'marble-granite', name: 'Marble & Granite', slug: 'marble-granite' },
            // Electronics & Electricals
            { id: 'consumer-electronics-dist', name: 'Consumer Electronics', slug: 'consumer-electronics-dist' },
            { id: 'led-lights', name: 'LED Lights', slug: 'led-lights' },
            { id: 'solar-products', name: 'Solar Products', slug: 'solar-products' },
            { id: 'inverters-batteries', name: 'Inverters & Batteries', slug: 'inverters-batteries' },
            // Food & Beverage Distribution
            { id: 'beverages-dist', name: 'Beverages Distribution', slug: 'beverages-dist' },
            { id: 'dairy-dist', name: 'Dairy Distribution', slug: 'dairy-dist' },
            { id: 'packaged-food', name: 'Packaged Food', slug: 'packaged-food' },
            { id: 'snacks-dist', name: 'Snacks Distribution', slug: 'snacks-dist' },
            { id: 'spices-dist', name: 'Spices Distribution', slug: 'spices-dist' },
            { id: 'tea-coffee-dist', name: 'Tea & Coffee Distribution', slug: 'tea-coffee-dist' },
            { id: 'organic-food-dist', name: 'Organic Food Distribution', slug: 'organic-food-dist' },
            // Other
            { id: 'fmcg', name: 'FMCG Products', slug: 'fmcg' },
            { id: 'pharmaceutical-dist', name: 'Pharmaceutical Distribution', slug: 'pharmaceutical-dist' },
            { id: 'chemical-products', name: 'Chemical Products', slug: 'chemical-products' },
            { id: 'direct-selling', name: 'Direct Selling / MLM', slug: 'direct-selling' },
        ],
    },
    {
        id: 'education',
        name: 'Education',
        slug: 'education',
        icon: 'GraduationCap',
        subcategories: [
            // Coaching & Tutoring
            { id: 'school-tutoring', name: 'School Tutoring', slug: 'school-tutoring' },
            { id: 'competitive-exam', name: 'Competitive Exam Coaching', slug: 'competitive-exam' },
            { id: 'online-coaching', name: 'Online Coaching', slug: 'online-coaching' },
            { id: 'robotics-ai', name: 'Robotics & AI Training', slug: 'robotics-ai' },
            { id: 'cad-cam', name: 'CAD/CAM Training', slug: 'cad-cam' },
            // Early Education
            { id: 'preschools', name: 'Preschools', slug: 'preschools' },
            { id: 'daycare-creches', name: 'Day Care & Creches', slug: 'daycare-creches' },
            { id: 'activity-centres', name: 'Activity Centres', slug: 'activity-centres' },
            { id: 'after-school', name: 'After School Activities', slug: 'after-school' },
            // Higher Education
            { id: 'degree-diploma', name: 'Degree/Diploma Colleges', slug: 'degree-diploma' },
            { id: 'distance-learning', name: 'Distance Learning', slug: 'distance-learning' },
            { id: 'professional-education', name: 'Professional Education Colleges', slug: 'professional-education' },
            { id: 'universities', name: 'Universities', slug: 'universities' },
            // K-12
            { id: 'k12-schools', name: 'K-12 Schools', slug: 'k12-schools' },
            // Vocational Training
            { id: 'aviation-hospitality', name: 'Aviation & Hospitality Training', slug: 'aviation-hospitality' },
            { id: 'banking-insurance-training', name: 'Banking & Insurance Training', slug: 'banking-insurance-training' },
            { id: 'beauty-wellness-training', name: 'Beauty & Wellness Training', slug: 'beauty-wellness-training' },
            { id: 'it-education', name: 'IT Education', slug: 'it-education' },
            { id: 'language-schools', name: 'Language Schools', slug: 'language-schools' },
            { id: 'paramedical', name: 'Paramedical Training', slug: 'paramedical' },
            { id: 'retail-training', name: 'Retail Training', slug: 'retail-training' },
            { id: 'skills-development', name: 'Skills Development', slug: 'skills-development' },
            // Other
            { id: 'abacus-brain', name: 'Abacus & Brain Development', slug: 'abacus-brain' },
            { id: 'music-dance', name: 'Music & Dance Schools', slug: 'music-dance' },
            { id: 'art-craft', name: 'Art & Craft Classes', slug: 'art-craft' },
            { id: 'education-consultants', name: 'Education Consultants', slug: 'education-consultants' },
        ],
    },
    {
        id: 'fashion',
        name: 'Fashion',
        slug: 'fashion',
        icon: 'Shirt',
        subcategories: [
            // Accessories
            { id: 'fashion-accessories', name: 'Fashion Accessories', slug: 'fashion-accessories' },
            { id: 'leather-products', name: 'Leather Products', slug: 'leather-products' },
            { id: 'luggage-bags', name: 'Luggage & Bags', slug: 'luggage-bags' },
            { id: 'opticians-eyewear', name: 'Opticians / Eye Wear', slug: 'opticians-eyewear' },
            { id: 'watches', name: 'Watches', slug: 'watches' },
            // Clothing
            { id: 'departmental-unisex', name: 'Departmental / Unisex', slug: 'departmental-unisex' },
            { id: 'ethnic-stores', name: 'Ethnic Stores', slug: 'ethnic-stores' },
            { id: 'kids-wear', name: 'Kids Wear', slug: 'kids-wear' },
            { id: 'lingerie', name: 'Lingerie', slug: 'lingerie' },
            { id: 'mens-wear', name: "Men's Wear", slug: 'mens-wear' },
            { id: 'readymade', name: 'Readymade Garments', slug: 'readymade' },
            { id: 'sportswear', name: 'Sports Wear', slug: 'sportswear' },
            { id: 'textiles', name: 'Textiles', slug: 'textiles' },
            { id: 'womens-wear', name: "Women's Wear", slug: 'womens-wear' },
            // Footwear
            { id: 'casual-footwear', name: 'Casual Footwear', slug: 'casual-footwear' },
            { id: 'designer-footwear', name: 'Designer Footwear', slug: 'designer-footwear' },
            { id: 'formal-footwear', name: 'Formal Footwear', slug: 'formal-footwear' },
            { id: 'kids-footwear', name: 'Kids Footwear', slug: 'kids-footwear' },
            { id: 'sports-footwear', name: 'Sports Footwear', slug: 'sports-footwear' },
            // Jewellery
            { id: 'diamond-platinum', name: 'Diamond & Platinum', slug: 'diamond-platinum' },
            { id: 'gems-stones', name: 'Gems & Stones', slug: 'gems-stones' },
            { id: 'imitation-jewelry', name: 'Imitation / Art / Junk Jewelry', slug: 'imitation-jewelry' },
            { id: 'precious-jewelry', name: 'Precious Jewelry', slug: 'precious-jewelry' },
        ],
    },
    {
        id: 'food-beverage',
        name: 'Food & Beverage',
        slug: 'food-beverage',
        icon: 'UtensilsCrossed',
        subcategories: [
            // Bakery, Sweets & Ice Cream
            { id: 'bakery', name: 'Bakery & Confectionary', slug: 'bakery' },
            { id: 'chocolate-stores', name: 'Chocolate Stores', slug: 'chocolate-stores' },
            { id: 'ice-cream', name: 'Ice Cream Parlors', slug: 'ice-cream' },
            { id: 'snacks-namkeen', name: 'Snacks / Namkeen Shops', slug: 'snacks-namkeen' },
            { id: 'sweets-mithai', name: 'Sweetshop / Mithai', slug: 'sweets-mithai' },
            // Cafe & Parlors
            { id: 'juice-smoothies', name: 'Juices / Smoothies / Dairy Parlors', slug: 'juice-smoothies' },
            { id: 'tea-coffee-chain', name: 'Tea & Coffee Chain', slug: 'tea-coffee-chain' },
            // Quick Bites
            { id: 'express-food', name: 'Express Food Joints', slug: 'express-food' },
            { id: 'food-trucks', name: 'Mobile Vans & Food Trucks', slug: 'food-trucks' },
            { id: 'pizzeria', name: 'Pizzeria', slug: 'pizzeria' },
            { id: 'qsr', name: 'Quick Service Restaurants (QSR)', slug: 'qsr' },
            { id: 'street-food', name: 'Street Food', slug: 'street-food' },
            // Restaurant & Night Clubs
            { id: 'bars-lounges', name: 'Bars & Lounges', slug: 'bars-lounges' },
            { id: 'casual-dine', name: 'Casual Dine', slug: 'casual-dine' },
            { id: 'fine-dining', name: 'Fine Dine Restaurants', slug: 'fine-dining' },
            { id: 'multi-cuisine', name: 'Multi Cuisine', slug: 'multi-cuisine' },
            { id: 'theme-restaurants', name: 'Theme Restaurants', slug: 'theme-restaurants' },
            // Cuisine Types
            { id: 'indian-cuisine', name: 'Indian Cuisine', slug: 'indian-cuisine' },
            { id: 'chinese-asian', name: 'Chinese & Asian Cuisine', slug: 'chinese-asian' },
            { id: 'biryani-kebabs', name: 'Biryani & Kebabs', slug: 'biryani-kebabs' },
            { id: 'burgers', name: 'Burger Joints', slug: 'burgers' },
            // Other
            { id: 'cloud-kitchen', name: 'Cloud Kitchen', slug: 'cloud-kitchen' },
            { id: 'catering', name: 'Catering Services', slug: 'catering' },
        ],
    },
    {
        id: 'home-based',
        name: 'Home Based Business',
        slug: 'home-based',
        icon: 'Home',
        subcategories: [
            // Beauty & Fitness
            { id: 'home-beauty', name: 'Home Beauty Services', slug: 'home-beauty' },
            { id: 'home-fitness', name: 'Home Fitness Training', slug: 'home-fitness' },
            // Business Services
            { id: 'home-consulting', name: 'Home Business Consulting', slug: 'home-consulting' },
            { id: 'home-accounting', name: 'Home Accounting Services', slug: 'home-accounting' },
            // Home Based Manufacturing
            { id: 'handicrafts', name: 'Handicrafts', slug: 'handicrafts' },
            { id: 'gift-items', name: 'Gift Items Manufacturing', slug: 'gift-items' },
            { id: 'crafts-handmade', name: 'Crafts & Handmade Products', slug: 'crafts-handmade' },
            // Home Based Tutoring
            { id: 'home-dance-classes', name: 'Home Dance Classes', slug: 'home-dance-classes' },
            { id: 'home-music-classes', name: 'Home Music Classes', slug: 'home-music-classes' },
            { id: 'home-tutoring', name: 'Home School Tutoring', slug: 'home-tutoring' },
            // Home Care Services
            { id: 'home-cleaning', name: 'Home Cleaning Services', slug: 'home-cleaning' },
            { id: 'interior-decor', name: 'Interior Decor', slug: 'interior-decor' },
            { id: 'property-management', name: 'Property Management', slug: 'property-management' },
            // Technology Related
            { id: 'app-design', name: 'App Design & Development', slug: 'app-design' },
            { id: 'content-creation', name: 'Content Creation', slug: 'content-creation' },
            { id: 'web-development', name: 'Web Development', slug: 'web-development' },
            // Other
            { id: 'tiffin-services', name: 'Home Tiffin Services', slug: 'tiffin-services' },
            { id: 'reselling', name: 'Reselling Business', slug: 'reselling' },
            { id: 'dropshipping', name: 'Dropshipping', slug: 'dropshipping' },
            { id: 'online-business', name: 'Online Businesses', slug: 'online-business' },
        ],
    },
    {
        id: 'hotels-travel',
        name: 'Hotels, Travel & Tourism',
        slug: 'hotels-travel',
        icon: 'Plane',
        subcategories: [
            // Hotels & Resorts
            { id: 'booking-accommodation', name: 'Booking & Accommodation', slug: 'booking-accommodation' },
            { id: 'guest-house', name: 'Guest House / Service Apartments', slug: 'guest-house' },
            { id: 'hotel-chain', name: 'Hotel Chain', slug: 'hotel-chain' },
            { id: 'motels', name: 'Motels', slug: 'motels' },
            { id: 'pg-services', name: 'PG Services', slug: 'pg-services' },
            { id: 'resorts', name: 'Resorts', slug: 'resorts' },
            { id: 'budget-hotels', name: 'Budget Hotels', slug: 'budget-hotels' },
            // Tourism Services
            { id: 'adventure-tourism', name: 'Adventure Tourism', slug: 'adventure-tourism' },
            { id: 'business-tourism', name: 'Business Tourism', slug: 'business-tourism' },
            { id: 'holiday-services', name: 'Holiday Services', slug: 'holiday-services' },
            { id: 'honeymoon-services', name: 'Honeymoon Services', slug: 'honeymoon-services' },
            { id: 'online-travel', name: 'Online Travel', slug: 'online-travel' },
            { id: 'passport-visa', name: 'Passport & Visa Services', slug: 'passport-visa' },
            { id: 'tour-packages', name: 'Tour Packages', slug: 'tour-packages' },
            { id: 'travel-agents', name: 'Travel Agents', slug: 'travel-agents' },
            { id: 'pilgrimage-tourism', name: 'Pilgrimage Tourism', slug: 'pilgrimage-tourism' },
        ],
    },
    {
        id: 'retail',
        name: 'Retail',
        slug: 'retail',
        icon: 'ShoppingBag',
        subcategories: [
            // Books, Toys & Gifts
            { id: 'books-stationery', name: 'Books & Stationery', slug: 'books-stationery' },
            { id: 'toys-games', name: 'Toys & Games', slug: 'toys-games' },
            { id: 'gift-shops', name: 'Gift Shops', slug: 'gift-shops' },
            // Consumer Durables, Telecom & IT
            { id: 'consumer-electronics', name: 'Consumer Electronics', slug: 'consumer-electronics' },
            { id: 'mobile-gadgets', name: 'Mobile & Gadget Stores', slug: 'mobile-gadgets' },
            { id: 'computer-stores', name: 'Computer Stores', slug: 'computer-stores' },
            // E-Retail
            { id: 'e-retail', name: 'E-Retail / Online Stores', slug: 'e-retail' },
            // Home & Office
            { id: 'art-decor', name: 'Art & Decor', slug: 'art-decor' },
            { id: 'furniture', name: 'Furniture', slug: 'furniture' },
            { id: 'garden-outdoor', name: 'Garden & Outdoor', slug: 'garden-outdoor' },
            { id: 'hardware-tools', name: 'Hardware & Tools', slug: 'hardware-tools' },
            { id: 'home-furnishing', name: 'Home Furnishing', slug: 'home-furnishing' },
            { id: 'kitchen-appliances', name: 'Kitchen Appliances', slug: 'kitchen-appliances' },
            // Supermarkets & Marts
            { id: 'supermarkets', name: 'Supermarkets & Grocery', slug: 'supermarkets' },
            { id: 'dairy-shops', name: 'Dairy Shops', slug: 'dairy-shops' },
            { id: 'food-marts', name: 'Food Marts', slug: 'food-marts' },
            { id: 'meat-shops', name: 'Meat Shops', slug: 'meat-shops' },
            { id: 'organic-stores', name: 'Organic Products Stores', slug: 'organic-stores' },
            { id: 'pet-stores', name: 'Pet Stores', slug: 'pet-stores' },
            { id: 'wine-shops', name: 'Wine Shops', slug: 'wine-shops' },
            // Other
            { id: 'pharmacy', name: 'Pharmacy & Medical Stores', slug: 'pharmacy' },
            { id: 'convenience-stores', name: 'Convenience Stores', slug: 'convenience-stores' },
            { id: 'specialty-retail', name: 'Specialty Retail', slug: 'specialty-retail' },
            { id: 'luxury-retail', name: 'Luxury Retail', slug: 'luxury-retail' },
        ],
    },
    {
        id: 'sports-entertainment',
        name: 'Sports, Fitness & Entertainment',
        slug: 'sports-entertainment',
        icon: 'Dumbbell',
        subcategories: [
            // Entertainment & Leisure
            { id: 'childrens-parks', name: "Children's Parks", slug: 'childrens-parks' },
            { id: 'clubs', name: 'Clubs', slug: 'clubs' },
            { id: 'kids-zones', name: 'Kids Zones', slug: 'kids-zones' },
            { id: 'multiplexes', name: 'Multiplexes / Cinema', slug: 'multiplexes' },
            { id: 'gaming-zones', name: 'Gaming Zones & Arcades', slug: 'gaming-zones' },
            { id: 'amusement-parks', name: 'Amusement Parks', slug: 'amusement-parks' },
            { id: 'bowling-alleys', name: 'Bowling Alleys', slug: 'bowling-alleys' },
            { id: 'escape-rooms', name: 'Escape Rooms', slug: 'escape-rooms' },
            // Sports Goods & Fitness Stores
            { id: 'adventure-goods', name: 'Adventure Goods', slug: 'adventure-goods' },
            { id: 'diet-supplements', name: 'Diet Supplements', slug: 'diet-supplements' },
            { id: 'fitness-equipment', name: 'Fitness Equipment', slug: 'fitness-equipment' },
            { id: 'golf-stores', name: 'Golf Stores', slug: 'golf-stores' },
            { id: 'sports-accessories', name: 'Sports Accessories', slug: 'sports-accessories' },
            { id: 'sports-garments', name: 'Sports Garments', slug: 'sports-garments' },
            // Sports Academies
            { id: 'sports-academies', name: 'Sports Academies', slug: 'sports-academies' },
            { id: 'cricket-academies', name: 'Cricket Academies', slug: 'cricket-academies' },
            { id: 'swimming-pools', name: 'Swimming Pools', slug: 'swimming-pools' },
            { id: 'badminton-courts', name: 'Badminton Courts', slug: 'badminton-courts' },
            { id: 'football-academies', name: 'Football Academies', slug: 'football-academies' },
        ],
    },
];

// =============================================================================
// BUSINESS CATEGORIES (for Business Listings - based on SMERGERS.com)
// Complete industry hierarchy for business sales/acquisitions
// =============================================================================

export interface BusinessSubCategory {
    id: string;
    name: string;
    slug: string;
}

export interface BusinessCategory {
    id: string;
    name: string;
    slug: string;
    icon: string; // lucide icon name
    subcategories: BusinessSubCategory[];
}

export const SMERGERS_BUSINESS_CATEGORIES: BusinessCategory[] = [
    {
        id: 'energy',
        name: 'Energy',
        slug: 'energy',
        icon: 'Zap',
        subcategories: [
            { id: 'coal', name: 'Coal', slug: 'coal' },
            { id: 'integrated-oil-gas', name: 'Integrated Oil and Gas', slug: 'integrated-oil-gas' },
            { id: 'oil-gas-exploration', name: 'Oil & Gas Exploration and Production', slug: 'oil-gas-exploration' },
            { id: 'oil-gas-refining', name: 'Oil & Gas Refining and Marketing', slug: 'oil-gas-refining' },
            { id: 'oil-gas-drilling', name: 'Oil & Gas Drilling', slug: 'oil-gas-drilling' },
            { id: 'oil-gas-transportation', name: 'Oil & Gas Transportation', slug: 'oil-gas-transportation' },
            { id: 'renewable-energy-equipment', name: 'Renewable Energy Equipment', slug: 'renewable-energy-equipment' },
            { id: 'renewable-fuels', name: 'Renewable Fuels', slug: 'renewable-fuels' },
            { id: 'uranium', name: 'Uranium', slug: 'uranium' },
            { id: 'environmental-services', name: 'Environmental Services', slug: 'environmental-services' },
            { id: 'renewable-power-plants', name: 'Renewable Power Plants', slug: 'renewable-power-plants' },
            { id: 'nonrenewable-power-plants', name: 'Nonrenewable Power Plants', slug: 'nonrenewable-power-plants' },
            { id: 'natural-gas-utilities', name: 'Natural Gas Utilities', slug: 'natural-gas-utilities' },
            { id: 'water-utilities', name: 'Water Utilities', slug: 'water-utilities' },
            { id: 'multiline-utilities', name: 'Multiline Utilities', slug: 'multiline-utilities' },
        ],
    },
    {
        id: 'industrial',
        name: 'Industrial',
        slug: 'industrial',
        icon: 'Factory',
        subcategories: [
            { id: 'commodity-chemicals', name: 'Commodity Chemicals', slug: 'commodity-chemicals' },
            { id: 'agricultural-chemicals', name: 'Agricultural Chemicals', slug: 'agricultural-chemicals' },
            { id: 'specialty-chemicals', name: 'Specialty Chemicals', slug: 'specialty-chemicals' },
            { id: 'diversified-chemicals', name: 'Diversified Chemicals', slug: 'diversified-chemicals' },
            { id: 'precious-metals', name: 'Precious Metals', slug: 'precious-metals' },
            { id: 'gold', name: 'Gold', slug: 'gold' },
            { id: 'mining-support', name: 'Mining Support', slug: 'mining-support' },
            { id: 'integrated-mining', name: 'Integrated Mining', slug: 'integrated-mining' },
            { id: 'steel', name: 'Steel', slug: 'steel' },
            { id: 'aluminium', name: 'Aluminium', slug: 'aluminium' },
            { id: 'specialty-mining', name: 'Specialty Mining', slug: 'specialty-mining' },
            { id: 'forest-products', name: 'Forest Products', slug: 'forest-products' },
            { id: 'pulp-paper', name: 'Pulp & Paper', slug: 'pulp-paper' },
            { id: 'packaging', name: 'Packaging', slug: 'packaging' },
            { id: 'aerospace-defense', name: 'Aerospace & Defense', slug: 'aerospace-defense' },
            { id: 'industrial-machinery', name: 'Industrial Machinery', slug: 'industrial-machinery' },
            { id: 'machine-shops', name: 'Machine Shops', slug: 'machine-shops' },
            { id: 'heavy-machinery', name: 'Heavy Machinery', slug: 'heavy-machinery' },
            { id: 'shipbuilding', name: 'Shipbuilding', slug: 'shipbuilding' },
            { id: 'electrical-equipment', name: 'Electrical Equipment', slug: 'electrical-equipment' },
            { id: 'heavy-electrical-equipment', name: 'Heavy Electrical Equipment', slug: 'heavy-electrical-equipment' },
            { id: 'trading', name: 'Trading', slug: 'trading' },
            { id: 'automobile-manufacturing', name: 'Automobile Manufacturing', slug: 'automobile-manufacturing' },
            { id: 'auto-component', name: 'Auto Component', slug: 'auto-component' },
            { id: 'tires-rubber-products', name: 'Tires and Rubber Products', slug: 'tires-rubber-products' },
            { id: 'scrap-metal', name: 'Scrap Metal', slug: 'scrap-metal' },
        ],
    },
    {
        id: 'finance',
        name: 'Finance',
        slug: 'finance',
        icon: 'Landmark',
        subcategories: [
            { id: 'banks', name: 'Banks', slug: 'banks' },
            { id: 'consumer-lending', name: 'Consumer Lending', slug: 'consumer-lending' },
            { id: 'investment-banks', name: 'Investment Banks', slug: 'investment-banks' },
            { id: 'fund-operators', name: 'Fund Operators', slug: 'fund-operators' },
            { id: 'financial-market-operators', name: 'Financial Market Operators', slug: 'financial-market-operators' },
            { id: 'property-casualty-insurance', name: 'Property & Casualty Insurance', slug: 'property-casualty-insurance' },
            { id: 'life-health-insurance', name: 'Life & Health Insurance', slug: 'life-health-insurance' },
            { id: 'reinsurance', name: 'Reinsurance', slug: 'reinsurance' },
            { id: 'corporate-financial-services', name: 'Corporate Financial Services', slug: 'corporate-financial-services' },
            { id: 'shell-companies', name: 'Shell Companies', slug: 'shell-companies' },
            { id: 'financial-distributors', name: 'Financial Distributors', slug: 'financial-distributors' },
        ],
    },
    {
        id: 'healthcare',
        name: 'Healthcare',
        slug: 'healthcare',
        icon: 'HeartPulse',
        subcategories: [
            { id: 'beauty-wellness', name: 'Beauty and Wellness', slug: 'beauty-wellness' },
            { id: 'advanced-medical-technology', name: 'Advanced Medical Technology', slug: 'advanced-medical-technology' },
            { id: 'medical-supplies-equipment', name: 'Medical Supplies and Equipment', slug: 'medical-supplies-equipment' },
            { id: 'healthcare-services', name: 'Healthcare Services', slug: 'healthcare-services' },
            { id: 'pharmaceuticals', name: 'Pharmaceuticals', slug: 'pharmaceuticals' },
            { id: 'biotechnology', name: 'Biotechnology', slug: 'biotechnology' },
        ],
    },
    {
        id: 'technology',
        name: 'Technology',
        slug: 'technology',
        icon: 'Laptop',
        subcategories: [
            { id: 'semiconductors', name: 'Semiconductors', slug: 'semiconductors' },
            { id: 'semiconductor-equipment', name: 'Semiconductor Equipment', slug: 'semiconductor-equipment' },
            { id: 'networking-equipment', name: 'Networking Equipment', slug: 'networking-equipment' },
            { id: 'office-equipment', name: 'Office Equipment', slug: 'office-equipment' },
            { id: 'electronic-equipment', name: 'Electronic Equipment', slug: 'electronic-equipment' },
            { id: 'computer-hardware', name: 'Computer Hardware', slug: 'computer-hardware' },
            { id: 'phones-handheld-devices', name: 'Phones and Handheld Devices', slug: 'phones-handheld-devices' },
            { id: 'household-electronics', name: 'Household Electronics', slug: 'household-electronics' },
            { id: 'software-companies', name: 'Software Companies', slug: 'software-companies' },
            { id: 'telecommunications', name: 'Telecommunications', slug: 'telecommunications' },
            { id: 'internet', name: 'Internet', slug: 'internet' },
        ],
    },
    {
        id: 'building-construction',
        name: 'Building, Construction and Maintenance',
        slug: 'building-construction',
        icon: 'Building2',
        subcategories: [
            { id: 'construction-materials', name: 'Construction Materials', slug: 'construction-materials' },
            { id: 'engineering-procurement-construction', name: 'Engineering, Procurement & Construction', slug: 'engineering-procurement-construction' },
            { id: 'building-maintenance', name: 'Building Maintenance', slug: 'building-maintenance' },
            { id: 'real-estate-construction', name: 'Real Estate Construction', slug: 'real-estate-construction' },
            { id: 'construction-supplies', name: 'Construction Supplies', slug: 'construction-supplies' },
            { id: 'home-furnishings', name: 'Home Furnishings', slug: 'home-furnishings' },
            { id: 'household-products', name: 'Household Products', slug: 'household-products' },
            { id: 'real-estate-rental', name: 'Real Estate Rental', slug: 'real-estate-rental' },
            { id: 'real-estate-agencies', name: 'Real Estate Agencies', slug: 'real-estate-agencies' },
            { id: 'reits', name: 'REITs', slug: 'reits' },
            { id: 'commercial-real-estate', name: 'Commercial Real Estate', slug: 'commercial-real-estate' },
            { id: 'residential-real-estate', name: 'Residential Real Estate', slug: 'residential-real-estate' },
        ],
    },
    {
        id: 'food-beverage',
        name: 'Food & Beverage',
        slug: 'food-beverage',
        icon: 'UtensilsCrossed',
        subcategories: [
            { id: 'restaurants-bars', name: 'Restaurants and Bars', slug: 'restaurants-bars' },
            { id: 'alcoholic-beverages', name: 'Alcoholic Beverages', slug: 'alcoholic-beverages' },
            { id: 'non-alcoholic-beverages', name: 'Non-Alcoholic Beverages', slug: 'non-alcoholic-beverages' },
            { id: 'agriculture', name: 'Agriculture', slug: 'agriculture' },
            { id: 'food-processing', name: 'Food Processing', slug: 'food-processing' },
            { id: 'tobacco', name: 'Tobacco', slug: 'tobacco' },
        ],
    },
    {
        id: 'retail-shops',
        name: 'Retail Shops',
        slug: 'retail-shops',
        icon: 'Store',
        subcategories: [
            { id: 'auto-dealers', name: 'Auto Dealers', slug: 'auto-dealers' },
            { id: 'home-furnishing-shops', name: 'Home Furnishing Shops', slug: 'home-furnishing-shops' },
            { id: 'specialty-retailers', name: 'Specialty Retailers', slug: 'specialty-retailers' },
            { id: 'apparel-stores', name: 'Apparel Stores', slug: 'apparel-stores' },
            { id: 'computer-shops', name: 'Computer Shops', slug: 'computer-shops' },
            { id: 'food-drug-retail', name: 'Food & Drug Retail', slug: 'food-drug-retail' },
        ],
    },
    {
        id: 'education',
        name: 'Education',
        slug: 'education',
        icon: 'GraduationCap',
        subcategories: [
            { id: 'training-institutes', name: 'Training Institutes', slug: 'training-institutes' },
            { id: 'education-support', name: 'Education Support', slug: 'education-support' },
            { id: 'schools-colleges', name: 'Schools & Colleges', slug: 'schools-colleges' },
        ],
    },
    {
        id: 'logistics',
        name: 'Logistics',
        slug: 'logistics',
        icon: 'Truck',
        subcategories: [
            { id: 'freight-logistics', name: 'Freight & Logistics', slug: 'freight-logistics' },
            { id: 'airlines', name: 'Airlines', slug: 'airlines' },
            { id: 'transportation', name: 'Transportation', slug: 'transportation' },
            { id: 'highways-rail-operators', name: 'Highways and Rail Operators', slug: 'highways-rail-operators' },
            { id: 'airport-services', name: 'Airport Services', slug: 'airport-services' },
            { id: 'marine-port-services', name: 'Marine Port Services', slug: 'marine-port-services' },
        ],
    },
    {
        id: 'media',
        name: 'Media',
        slug: 'media',
        icon: 'Tv',
        subcategories: [
            { id: 'printing', name: 'Printing', slug: 'printing' },
            { id: 'professional-information', name: 'Professional Information', slug: 'professional-information' },
            { id: 'advertising-marketing', name: 'Advertising and Marketing', slug: 'advertising-marketing' },
            { id: 'broadcasting', name: 'Broadcasting', slug: 'broadcasting' },
            { id: 'entertainment-production', name: 'Entertainment Production', slug: 'entertainment-production' },
            { id: 'publishing', name: 'Publishing', slug: 'publishing' },
        ],
    },
    {
        id: 'travel-leisure',
        name: 'Travel & Leisure',
        slug: 'travel-leisure',
        icon: 'Plane',
        subcategories: [
            { id: 'recreational-products', name: 'Recreational Products', slug: 'recreational-products' },
            { id: 'hotels-resorts', name: 'Hotels and Resorts', slug: 'hotels-resorts' },
            { id: 'casinos-gaming', name: 'Casinos and Gaming', slug: 'casinos-gaming' },
            { id: 'leisure-recreation', name: 'Leisure and Recreation', slug: 'leisure-recreation' },
        ],
    },
    {
        id: 'textiles',
        name: 'Textiles',
        slug: 'textiles',
        icon: 'Scissors',
        subcategories: [
            { id: 'textile', name: 'Textile', slug: 'textile' },
            { id: 'apparel-accessories', name: 'Apparel and Accessories', slug: 'apparel-accessories' },
            { id: 'footwear', name: 'Footwear', slug: 'footwear' },
        ],
    },
    {
        id: 'business-services',
        name: 'Business Services',
        slug: 'business-services',
        icon: 'Briefcase',
        subcategories: [
            { id: 'employment-services', name: 'Employment Services', slug: 'employment-services' },
            { id: 'it-services', name: 'IT Services', slug: 'it-services' },
            { id: 'bpos', name: 'BPOs', slug: 'bpos' },
            { id: 'professional-services', name: 'Professional Services', slug: 'professional-services' },
        ],
    },
];

// Flat list of business industry names (for backward compatibility)
export const BUSINESS_INDUSTRIES = SMERGERS_BUSINESS_CATEGORIES.map(cat => cat.name);

// Get all business subcategories as a flat list
export const ALL_BUSINESS_SUBCATEGORIES = SMERGERS_BUSINESS_CATEGORIES.flatMap(cat =>
    cat.subcategories.map(sub => ({
        ...sub,
        categoryId: cat.id,
        categoryName: cat.name,
    }))
);

// =============================================================================
// BUSINESS CATEGORY HELPER FUNCTIONS
// =============================================================================

// Helper function to get business category by slug
export function getBusinessCategoryBySlug(slug: string): BusinessCategory | undefined {
    return SMERGERS_BUSINESS_CATEGORIES.find(cat => cat.slug === slug);
}

// Helper function to get business subcategory by slug
export function getBusinessSubcategoryBySlug(categorySlug: string, subcategorySlug: string): BusinessSubCategory | undefined {
    const category = getBusinessCategoryBySlug(categorySlug);
    return category?.subcategories.find(sub => sub.slug === subcategorySlug);
}

// Helper function to get all business subcategories for a category
export function getBusinessSubcategoriesForCategory(categoryId: string): BusinessSubCategory[] {
    const category = SMERGERS_BUSINESS_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.subcategories || [];
}

// Get business category name from subcategory slug
export function getBusinessCategoryFromSubcategory(subcategorySlug: string): BusinessCategory | undefined {
    return SMERGERS_BUSINESS_CATEGORIES.find(cat =>
        cat.subcategories.some(sub => sub.slug === subcategorySlug)
    );
}

// =============================================================================
// FRANCHISE EXPORTS (for Franchise Listings)
// =============================================================================

// Flat list of franchise category names
export const FRANCHISE_INDUSTRIES = FRANCHISE_CATEGORIES.map(cat => cat.name);

// Legacy alias for backward compatibility (maps to franchise industries)
export const INDUSTRIES = FRANCHISE_INDUSTRIES;

// Get all subcategories as a flat list
export const ALL_SUBCATEGORIES = FRANCHISE_CATEGORIES.flatMap(cat =>
    cat.subcategories.map(sub => ({
        ...sub,
        categoryId: cat.id,
        categoryName: cat.name,
    }))
);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Helper function to get category by slug
export function getCategoryBySlug(slug: string): Category | undefined {
    return FRANCHISE_CATEGORIES.find(cat => cat.slug === slug);
}

// Helper function to get subcategory by slug
export function getSubcategoryBySlug(categorySlug: string, subcategorySlug: string): SubCategory | undefined {
    const category = getCategoryBySlug(categorySlug);
    return category?.subcategories.find(sub => sub.slug === subcategorySlug);
}

// Helper function to get all subcategories for a category
export function getSubcategoriesForCategory(categoryId: string): SubCategory[] {
    const category = FRANCHISE_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.subcategories || [];
}

// Get category name from subcategory slug
export function getCategoryFromSubcategory(subcategorySlug: string): Category | undefined {
    return FRANCHISE_CATEGORIES.find(cat =>
        cat.subcategories.some(sub => sub.slug === subcategorySlug)
    );
}

