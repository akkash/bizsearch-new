/**
 * Industry Intelligence Data
 * Market statistics and insights for franchise and business categories
 */

export interface IndustryStats {
    marketSize: string; // e.g., "₹50,000 Cr"
    growthRate: string; // e.g., "12.5% CAGR"
    totalBrands: number;
    totalOutlets: string; // e.g., "50,000+"
    avgInvestment: {
        min: number;
        max: number;
    };
    avgROI: string; // e.g., "18-24 months"
    topCities: string[];
}

export interface IndustryInsight {
    id: string;
    name: string;
    slug: string;
    icon: string;
    description: string;
    highlights: string[];
    stats: IndustryStats;
    trends: string[];
    challenges: string[];
    opportunities: string[];
    seoTitle: string;
    seoDescription: string;
}

export const INDUSTRY_INSIGHTS: IndustryInsight[] = [
    {
        id: 'food-beverage',
        name: 'Food & Beverage',
        slug: 'food-beverage',
        icon: 'UtensilsCrossed',
        description: 'The F&B sector remains India\'s largest franchise industry, driven by changing consumer preferences, urbanization, and the rise of quick-service restaurants (QSRs). From traditional Indian cuisine to international fast-food chains, this sector offers diverse investment opportunities.',
        highlights: [
            'Fastest growing franchise sector in India',
            'High demand in tier-2 and tier-3 cities',
            'Cloud kitchens emerging as low-investment option',
            'Health-conscious food concepts gaining traction'
        ],
        stats: {
            marketSize: '₹5,99,000 Cr',
            growthRate: '11% CAGR',
            totalBrands: 3500,
            totalOutlets: '7,50,000+',
            avgInvestment: { min: 500000, max: 5000000 },
            avgROI: '12-18 months',
            topCities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune']
        },
        trends: [
            'Rise of cloud kitchens and delivery-only brands',
            'Health and organic food concepts growing 25% YoY',
            'Regional cuisine franchises expanding nationally',
            'Technology integration for ordering and operations'
        ],
        challenges: [
            'High real estate costs in metro cities',
            'Staff retention and training',
            'Food safety compliance requirements',
            'Intense competition from aggregators'
        ],
        opportunities: [
            'Untapped tier-2 and tier-3 city markets',
            'Healthy and organic food segment',
            'Quick commerce integration',
            'Franchise models under ₹10 lakh investment'
        ],
        seoTitle: 'Food & Beverage Franchise Opportunities in India | BizSearch',
        seoDescription: 'Explore food and beverage franchise opportunities in India. Market size ₹5.99 lakh crore with 11% growth. Find QSR, cafe, and restaurant franchises.'
    },
    {
        id: 'education',
        name: 'Education',
        slug: 'education',
        icon: 'GraduationCap',
        description: 'India\'s education sector is witnessing rapid transformation with EdTech integration, skill development focus, and growing demand for quality preschools. The franchise model has proven highly successful in this sector.',
        highlights: [
            'Recession-resistant industry',
            'Government push for skill development',
            'EdTech integration creating new models',
            'Strong demand for preschool franchises'
        ],
        stats: {
            marketSize: '₹1,17,000 Cr',
            growthRate: '10.4% CAGR',
            totalBrands: 1200,
            totalOutlets: '1,50,000+',
            avgInvestment: { min: 300000, max: 3000000 },
            avgROI: '18-24 months',
            topCities: ['Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata']
        },
        trends: [
            'Hybrid learning models post-pandemic',
            'Coding and robotics education for children',
            'Vernacular language digital content',
            'Upskilling and reskilling programs for adults'
        ],
        challenges: [
            'Regulatory compliance across states',
            'Quality teacher recruitment',
            'Technology infrastructure costs',
            'Competition from free online content'
        ],
        opportunities: [
            'Rural and semi-urban education access',
            'Vocational training centers',
            'Test preparation franchises',
            'Special needs education'
        ],
        seoTitle: 'Education Franchise Opportunities in India | BizSearch',
        seoDescription: 'Find education franchise opportunities in India. Market size ₹1.17 lakh crore. Explore preschool, coaching, and EdTech franchise options.'
    },
    {
        id: 'beauty-health',
        name: 'Beauty & Health',
        slug: 'beauty-health',
        icon: 'Sparkles',
        description: 'The beauty and wellness industry in India is booming, driven by increasing disposable income, social media influence, and growing health consciousness. From salon chains to fitness centers, this sector offers premium franchise opportunities.',
        highlights: [
            'Premium segment growing fastest',
            'Male grooming market expanding rapidly',
            'Wellness tourism driving spa demand',
            'Ayurveda and natural products trending'
        ],
        stats: {
            marketSize: '₹1,46,000 Cr',
            growthRate: '12% CAGR',
            totalBrands: 800,
            totalOutlets: '3,00,000+',
            avgInvestment: { min: 1000000, max: 10000000 },
            avgROI: '24-36 months',
            topCities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai']
        },
        trends: [
            'Personalized beauty and skincare',
            'Wellness retreats and medical spas',
            'Organic and clean beauty products',
            'Fitness technology integration'
        ],
        challenges: [
            'High initial investment for premium brands',
            'Skilled staff shortage',
            'Maintaining service quality consistency',
            'Customer retention in competitive market'
        ],
        opportunities: [
            'Men\'s grooming segment',
            'Budget salon chains in tier-2 cities',
            'Home service beauty platforms',
            'Corporate wellness programs'
        ],
        seoTitle: 'Beauty & Health Franchise Opportunities in India | BizSearch',
        seoDescription: 'Discover beauty and wellness franchise opportunities. Salons, spas, gyms with ₹1.46 lakh crore market size and 12% growth rate.'
    },
    {
        id: 'retail',
        name: 'Retail',
        slug: 'retail',
        icon: 'ShoppingBag',
        description: 'India\'s retail sector is one of the world\'s largest, with organized retail growing rapidly. From supermarkets to specialty stores, retail franchises offer stable returns with proven business models.',
        highlights: [
            'Organized retail penetration increasing',
            'Omnichannel retail becoming standard',
            'Private labels gaining market share',
            'Convenience stores in high demand'
        ],
        stats: {
            marketSize: '₹76,00,000 Cr',
            growthRate: '9% CAGR',
            totalBrands: 2500,
            totalOutlets: '15,00,000+',
            avgInvestment: { min: 1500000, max: 15000000 },
            avgROI: '24-30 months',
            topCities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune']
        },
        trends: [
            'Quick commerce and hyperlocal delivery',
            'Sustainable and eco-friendly products',
            'Experience-driven retail stores',
            'Digital-first retail concepts'
        ],
        challenges: [
            'E-commerce competition',
            'High real estate costs',
            'Inventory management',
            'Thin margins in grocery segment'
        ],
        opportunities: [
            'Specialty retail (organic, pet supplies)',
            'Franchise conversions (kiranas)',
            'Rural retail expansion',
            'D2C brand retail stores'
        ],
        seoTitle: 'Retail Franchise Opportunities in India | BizSearch',
        seoDescription: 'Explore retail franchise opportunities in India\'s ₹76 lakh crore market. Find supermarket, convenience store, and specialty retail franchises.'
    },
    {
        id: 'automotive',
        name: 'Automotive',
        slug: 'automotive',
        icon: 'Car',
        description: 'The automotive franchise sector is transforming with EV adoption, premium car services, and organized multi-brand workshops. From car washes to EV charging stations, opportunities are diverse.',
        highlights: [
            'EV segment driving new franchise models',
            'Car care services in high demand',
            'Multi-brand service centers growing',
            'Used car business booming'
        ],
        stats: {
            marketSize: '₹7,50,000 Cr',
            growthRate: '8.7% CAGR',
            totalBrands: 600,
            totalOutlets: '2,00,000+',
            avgInvestment: { min: 2000000, max: 50000000 },
            avgROI: '30-48 months',
            topCities: ['Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai', 'Ahmedabad']
        },
        trends: [
            'EV charging infrastructure expansion',
            'Ceramic coating and detailing services',
            'Subscription-based car services',
            'Connected car service solutions'
        ],
        challenges: [
            'High capital investment',
            'Skilled technician shortage',
            'OEM relationship requirements',
            'Rapid technology changes'
        ],
        opportunities: [
            'EV charging station franchises',
            'Two-wheeler EV dealerships',
            'Car subscription services',
            'Mobile car service units'
        ],
        seoTitle: 'Automotive Franchise Opportunities in India | BizSearch',
        seoDescription: 'Find automotive franchise opportunities including car care, EV charging, and dealerships. ₹7.5 lakh crore market with 8.7% growth.'
    },
    {
        id: 'business-services',
        name: 'Business Services',
        slug: 'business-services',
        icon: 'Briefcase',
        description: 'B2B service franchises offer high margins and recurring revenue models. From staffing solutions to digital marketing agencies, this sector serves the growing needs of Indian businesses.',
        highlights: [
            'Recurring revenue business models',
            'Low overhead compared to retail',
            'Digital transformation driving demand',
            'SME segment highly underserved'
        ],
        stats: {
            marketSize: '₹25,00,000 Cr',
            growthRate: '14% CAGR',
            totalBrands: 400,
            totalOutlets: '50,000+',
            avgInvestment: { min: 500000, max: 5000000 },
            avgROI: '12-18 months',
            topCities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune']
        },
        trends: [
            'Digital marketing and SaaS services',
            'HR tech and staffing solutions',
            'Fintech and payment services',
            'Co-working and managed offices'
        ],
        challenges: [
            'Talent acquisition and retention',
            'Maintaining service quality',
            'Long sales cycles for B2B',
            'Economic sensitivity'
        ],
        opportunities: [
            'SME-focused service franchises',
            'GST and compliance services',
            'Digital transformation consultants',
            'Industry-specific software services'
        ],
        seoTitle: 'Business Services Franchise Opportunities | BizSearch',
        seoDescription: 'Explore B2B service franchise opportunities. Staffing, digital marketing, fintech with ₹25 lakh crore market and 14% growth rate.'
    },
    {
        id: 'hotels-travel',
        name: 'Hotels, Travel & Tourism',
        slug: 'hotels-travel',
        icon: 'Plane',
        description: 'India\'s hospitality and travel sector is recovering strongly post-pandemic, with domestic tourism leading the revival. Budget hotels, homestays, and travel agencies offer attractive franchise models.',
        highlights: [
            'Domestic tourism at all-time high',
            'Budget hotel segment growing fastest',
            'Religious tourism driving tier-2 growth',
            'Adventure tourism gaining momentum'
        ],
        stats: {
            marketSize: '₹15,00,000 Cr',
            growthRate: '13% CAGR',
            totalBrands: 350,
            totalOutlets: '75,000+',
            avgInvestment: { min: 5000000, max: 100000000 },
            avgROI: '36-60 months',
            topCities: ['Goa', 'Jaipur', 'Kerala', 'Uttarakhand', 'Mumbai']
        },
        trends: [
            'Experiential and sustainable tourism',
            'Bleisure travel (business + leisure)',
            'Tech-enabled hotel operations',
            'Boutique and heritage properties'
        ],
        challenges: [
            'High capital requirements',
            'Seasonal demand fluctuations',
            'OTA commission pressures',
            'Staff training and retention'
        ],
        opportunities: [
            'Budget hotel chains',
            'Pilgrimage circuit hotels',
            'Wellness and medical tourism',
            'Adventure tourism operators'
        ],
        seoTitle: 'Hotel & Travel Franchise Opportunities in India | BizSearch',
        seoDescription: 'Discover hospitality and travel franchise opportunities. Hotels, resorts, travel agencies in India\'s ₹15 lakh crore tourism market.'
    },
    {
        id: 'fashion',
        name: 'Fashion',
        slug: 'fashion',
        icon: 'Shirt',
        description: 'India\'s fashion retail market is driven by a young population, rising aspirations, and increasing brand consciousness. From ethnic wear to athleisure, fashion franchises offer diverse investment options.',
        highlights: [
            'Youth demographic driving growth',
            'Premiumization trend accelerating',
            'D2C brands entering offline retail',
            'Sustainable fashion gaining traction'
        ],
        stats: {
            marketSize: '₹6,00,000 Cr',
            growthRate: '10% CAGR',
            totalBrands: 1500,
            totalOutlets: '4,00,000+',
            avgInvestment: { min: 1000000, max: 20000000 },
            avgROI: '24-36 months',
            topCities: ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Ahmedabad']
        },
        trends: [
            'Athleisure and casual wear growth',
            'Sustainable and eco-fashion',
            'Plus-size and inclusive fashion',
            'Rental and resale fashion'
        ],
        challenges: [
            'Fast-changing fashion trends',
            'High inventory risks',
            'E-commerce competition',
            'Working capital requirements'
        ],
        opportunities: [
            'Regional ethnic wear brands',
            'Kids fashion specialty stores',
            'Sustainable fashion retail',
            'Fashion accessories and footwear'
        ],
        seoTitle: 'Fashion Franchise Opportunities in India | BizSearch',
        seoDescription: 'Find fashion retail franchise opportunities. Clothing, footwear, accessories in India\'s ₹6 lakh crore fashion market.'
    },
    {
        id: 'dealers-distributors',
        name: 'Dealers & Distributors',
        slug: 'dealers-distributors',
        icon: 'Package',
        description: 'Distribution franchises form the backbone of India\'s supply chain. From FMCG to building materials, distributorship opportunities offer steady returns with established brand pull.',
        highlights: [
            'Essential supply chain role',
            'Recurring business from retailers',
            'FMCG distribution highly stable',
            'B2B e-commerce creating new models'
        ],
        stats: {
            marketSize: '₹45,00,000 Cr',
            growthRate: '7% CAGR',
            totalBrands: 2000,
            totalOutlets: '10,00,000+',
            avgInvestment: { min: 1000000, max: 10000000 },
            avgROI: '18-24 months',
            topCities: ['Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Ahmedabad']
        },
        trends: [
            'Direct-to-retailer (D2R) platforms',
            'Cold chain distribution expansion',
            'Rural distribution networks',
            'Tech-enabled inventory management'
        ],
        challenges: [
            'Working capital requirements',
            'Credit risk with retailers',
            'Logistics and warehousing costs',
            'Brand loyalty management'
        ],
        opportunities: [
            'Organic and health products',
            'Rural FMCG distribution',
            'EV components distribution',
            'Pharmaceutical distribution'
        ],
        seoTitle: 'Distributorship & Dealership Opportunities | BizSearch',
        seoDescription: 'Explore dealership and distributorship opportunities in India. FMCG, building materials, electronics distribution franchise options.'
    },
    {
        id: 'home-based',
        name: 'Home Based Business',
        slug: 'home-based',
        icon: 'Home',
        description: 'Home-based franchises offer flexibility and low investment entry into entrepreneurship. From tutoring to consulting, these models suit part-time entrepreneurs and work-from-home professionals.',
        highlights: [
            'Lowest investment category',
            'Work-life balance friendly',
            'Growing post-pandemic acceptance',
            'Ideal for women entrepreneurs'
        ],
        stats: {
            marketSize: '₹50,000 Cr',
            growthRate: '18% CAGR',
            totalBrands: 500,
            totalOutlets: '5,00,000+',
            avgInvestment: { min: 50000, max: 500000 },
            avgROI: '6-12 months',
            topCities: ['Pan India - Location Independent']
        },
        trends: [
            'Online tutoring and coaching',
            'Home-based food businesses',
            'Digital services and consulting',
            'E-commerce and reselling'
        ],
        challenges: [
            'Limited scalability',
            'Work-life boundary management',
            'Marketing and visibility',
            'Credibility building'
        ],
        opportunities: [
            'EdTech micro-franchises',
            'Home services aggregators',
            'Content creation and marketing',
            'Health and wellness coaching'
        ],
        seoTitle: 'Home Based Franchise Opportunities | BizSearch',
        seoDescription: 'Start a home-based franchise business in India. Low investment options from ₹50,000. Perfect for work-from-home entrepreneurs.'
    },
    {
        id: 'sports-entertainment',
        name: 'Sports, Fitness & Entertainment',
        slug: 'sports-entertainment',
        icon: 'Dumbbell',
        description: 'The fitness and entertainment sector is experiencing rapid growth driven by health consciousness and experience economy. From gyms to gaming zones, these franchises offer engaging customer experiences.',
        highlights: [
            'Post-pandemic health focus driving gym signups',
            'Kids entertainment zones in high demand',
            'Gaming and esports emerging segment',
            'Sports academies growing in metros'
        ],
        stats: {
            marketSize: '₹35,000 Cr',
            growthRate: '15% CAGR',
            totalBrands: 450,
            totalOutlets: '50,000+',
            avgInvestment: { min: 2000000, max: 20000000 },
            avgROI: '24-36 months',
            topCities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai']
        },
        trends: [
            'Boutique fitness studios',
            'Hybrid gym memberships',
            'VR/AR entertainment experiences',
            'Sports leagues and coaching apps'
        ],
        challenges: [
            'High real estate and equipment costs',
            'Seasonal membership fluctuations',
            'Trainer retention',
            'Maintenance and upkeep costs'
        ],
        opportunities: [
            'Women-only fitness centers',
            'Kids activity and sports zones',
            'Corporate wellness centers',
            'Outdoor adventure experiences'
        ],
        seoTitle: 'Sports & Fitness Franchise Opportunities | BizSearch',
        seoDescription: 'Find sports, fitness, and entertainment franchise opportunities. Gyms, gaming zones, sports academies with 15% market growth.'
    }
];

// Helper function to get industry by slug
export function getIndustryBySlug(slug: string): IndustryInsight | undefined {
    return INDUSTRY_INSIGHTS.find(industry => industry.slug === slug);
}

// Get all industries as a simple list
export function getAllIndustries(): Pick<IndustryInsight, 'id' | 'name' | 'slug' | 'icon'>[] {
    return INDUSTRY_INSIGHTS.map(({ id, name, slug, icon }) => ({ id, name, slug, icon }));
}

// Format currency for display
export function formatInvestment(min: number, max: number): string {
    const formatValue = (val: number): string => {
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(0)} L`;
        return `₹${(val / 1000).toFixed(0)}K`;
    };
    return `${formatValue(min)} - ${formatValue(max)}`;
}

// Industry statistics summary for the hub page
export const INDUSTRY_SUMMARY_STATS = {
    totalFranchiseBrands: 15000,
    totalBusinessListings: 50000,
    totalInvestors: 100000,
    avgDealClosureTime: '45 days',
    successfulDeals: 5000,
    citiesCovered: 500
};
