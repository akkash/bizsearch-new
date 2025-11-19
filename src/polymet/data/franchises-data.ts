export interface Franchise {
  id: string;
  // Support both camelCase and snake_case
  brandName?: string;
  brand_name?: string;
  industry: string;
  investmentRequired?: string;
  investmentMin?: number;
  investmentMax?: number;
  total_investment_min?: number;
  total_investment_max?: number;
  franchiseFee?: number;
  franchise_fee?: number;
  royaltyPercentage?: number;
  royalty_percentage?: number;
  outlets?: number;
  total_outlets?: number;
  territories?: string[];
  description: string;
  brandStory?: string;
  brand_story?: string;
  businessModel?: string;
  competitiveEdge?: string[];
  highlights?: string[] | any;
  investmentBreakdown?: {
    franchiseFee: number;
    equipment: number;
    inventory: number;
    marketing: number;
    workingCapital: number;
    other: number;
  };
  support?: {
    training: string;
    marketing: string;
    operations: string;
    technology: string;
  };
  support_provided?: string[] | any;
  marketing_support?: boolean;
  roiProjections?: {
    year: number;
    revenue: number;
    profit: number;
    roi: number;
  }[];
  expected_roi_percentage?: number;
  requirements?: {
    spaceRequired: string;
    experience: string;
    investment: string;
    location: string;
  };
  badges?: string[] | any;
  images?: string[] | any;
  logo?: string;
  logo_url?: string;
  verification?: {
    verified: boolean;
    documentsVerified: boolean;
    brandVerified: boolean;
  };
  verified?: boolean;
  contact?: {
    franchiseDeveloper: string;
    phone: string;
    email: string;
    website: string;
  };
  featured?: boolean;
  trending?: boolean;
  multiUnit?: boolean;
  financing?: boolean;
  createdAt?: string;
  created_at?: string;
}

export const franchisesData: Franchise[] = [
  {
    id: "fran-001",
    brandName: "CoffeeHub Express",
    industry: "Food & Beverage",
    investmentRequired: "₹15L - ₹25L",
    investmentMin: 1500000,
    investmentMax: 2500000,
    franchiseFee: 500000,
    royaltyPercentage: 6,
    outlets: 150,
    territories: ["Mumbai", "Delhi", "Bangalore", "Pune", "Chennai"],
    description:
      "Leading coffee franchise with proven business model and strong brand recognition. Perfect for entrepreneurs looking to enter the booming coffee market.",
    brandStory:
      "Started in 2015, CoffeeHub Express has revolutionized the coffee experience in India with premium quality coffee at affordable prices.",
    businessModel:
      "Quick service coffee shop with takeaway and limited seating. Focus on high-quality coffee, quick service, and strategic locations.",
    competitiveEdge: [
      "Proprietary coffee blend",
      "30-second service guarantee",
      "Prime location strategy",
      "Strong digital presence",
    ],

    investmentBreakdown: {
      franchiseFee: 500000,
      equipment: 800000,
      inventory: 200000,
      marketing: 150000,
      workingCapital: 300000,
      other: 50000,
    },
    support: {
      training: "2 weeks intensive training + ongoing support",
      marketing: "National campaigns + local marketing support",
      operations: "Operations manual + regular audits",
      technology: "POS system + mobile app integration",
    },
    roiProjections: [
      { year: 1, revenue: 3600000, profit: 540000, roi: 27 },
      { year: 2, revenue: 4200000, profit: 840000, roi: 42 },
      { year: 3, revenue: 4800000, profit: 1200000, roi: 60 },
    ],

    requirements: {
      spaceRequired: "200-400 sq ft",
      experience: "No prior experience required",
      investment: "₹15L - ₹25L liquid capital",
      location: "High footfall areas, malls, offices",
    },
    badges: ["Verified", "Top Performer", "Hot Deal"],
    images: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800",
    ],

    logo: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200",
    verification: {
      verified: true,
      documentsVerified: true,
      brandVerified: true,
    },
    contact: {
      franchiseDeveloper: "Rohit Mehta",
      phone: "+91 98765 54321",
      email: "rohit@coffeehub.com",
      website: "www.coffeehubexpress.com",
    },
    featured: true,
    trending: true,
    multiUnit: true,
    financing: true,
    createdAt: "2024-01-15",
  },
  {
    id: "fran-002",
    brandName: "FitZone Gym",
    industry: "Health & Fitness",
    investmentRequired: "₹40L - ₹60L",
    investmentMin: 4000000,
    investmentMax: 6000000,
    franchiseFee: 1000000,
    royaltyPercentage: 8,
    outlets: 85,
    territories: ["Tier 1 & Tier 2 cities"],
    description:
      "Premium fitness franchise with state-of-the-art equipment and comprehensive fitness programs. Proven track record of successful franchisees.",
    brandStory:
      "FitZone has been transforming lives through fitness for over 8 years, with a focus on personalized training and community building.",
    businessModel:
      "Full-service gym with personal training, group classes, and wellness programs. Membership-based recurring revenue model.",
    competitiveEdge: [
      "Latest fitness equipment",
      "Certified trainer network",
      "Comprehensive wellness programs",
      "Strong member retention",
    ],

    investmentBreakdown: {
      franchiseFee: 1000000,
      equipment: 3000000,
      inventory: 200000,
      marketing: 300000,
      workingCapital: 500000,
      other: 0,
    },
    support: {
      training: "4 weeks comprehensive training program",
      marketing: "Grand opening support + ongoing campaigns",
      operations: "Operations support + business coaching",
      technology: "Gym management software + member app",
    },
    roiProjections: [
      { year: 1, revenue: 7200000, profit: 1440000, roi: 24 },
      { year: 2, revenue: 8400000, profit: 2520000, roi: 42 },
      { year: 3, revenue: 9600000, profit: 3840000, roi: 64 },
    ],

    requirements: {
      spaceRequired: "3000-5000 sq ft",
      experience: "Business or fitness background preferred",
      investment: "₹40L - ₹60L total investment",
      location: "Residential areas with parking",
    },
    badges: ["Verified", "Premium Brand", "High ROI"],
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    ],

    logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200",
    verification: {
      verified: true,
      documentsVerified: true,
      brandVerified: true,
    },
    contact: {
      franchiseDeveloper: "Priya Sharma",
      phone: "+91 98765 54322",
      email: "priya@fitzone.com",
      website: "www.fitzonegym.com",
    },
    featured: true,
    trending: false,
    multiUnit: true,
    financing: true,
    createdAt: "2024-01-12",
  },
  {
    id: "fran-003",
    brandName: "EduSmart Learning Center",
    industry: "Education",
    investmentRequired: "₹8L - ₹15L",
    investmentMin: 800000,
    investmentMax: 1500000,
    franchiseFee: 300000,
    royaltyPercentage: 5,
    outlets: 200,
    territories: ["Pan India"],
    description:
      "Leading education franchise offering after-school programs, test prep, and skill development courses for students aged 6-18.",
    brandStory:
      "EduSmart has been empowering students for academic excellence for over 10 years with innovative teaching methodologies.",
    businessModel:
      "After-school learning center with structured programs, small batch sizes, and personalized attention.",
    competitiveEdge: [
      "Proven curriculum",
      "Technology-enabled learning",
      "Experienced faculty training",
      "Strong parent satisfaction",
    ],

    investmentBreakdown: {
      franchiseFee: 300000,
      equipment: 200000,
      inventory: 100000,
      marketing: 100000,
      workingCapital: 200000,
      other: 100000,
    },
    support: {
      training: "3 weeks training + curriculum support",
      marketing: "Enrollment campaigns + digital marketing",
      operations: "Academic support + quality monitoring",
      technology: "Learning management system + parent app",
    },
    roiProjections: [
      { year: 1, revenue: 1800000, profit: 360000, roi: 36 },
      { year: 2, revenue: 2400000, profit: 720000, roi: 72 },
      { year: 3, revenue: 3000000, profit: 1200000, roi: 120 },
    ],

    requirements: {
      spaceRequired: "1000-1500 sq ft",
      experience: "Education background preferred",
      investment: "₹8L - ₹15L total investment",
      location: "Residential areas near schools",
    },
    badges: ["Verified", "Education Leader", "New"],
    images: [
      "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    ],

    logo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200",
    verification: {
      verified: true,
      documentsVerified: true,
      brandVerified: true,
    },
    contact: {
      franchiseDeveloper: "Dr. Anita Rao",
      phone: "+91 98765 54323",
      email: "anita@edusmart.com",
      website: "www.edusmartlearning.com",
    },
    featured: false,
    trending: true,
    multiUnit: true,
    financing: false,
    createdAt: "2024-01-10",
  },
  {
    id: "fran-004",
    brandName: "QuickBite Food Truck",
    industry: "Food & Beverage",
    investmentRequired: "₹12L - ₹18L",
    investmentMin: 1200000,
    investmentMax: 1800000,
    franchiseFee: 400000,
    royaltyPercentage: 4,
    outlets: 75,
    territories: ["Metro cities"],
    description:
      "Mobile food franchise specializing in healthy fast food. Perfect for entrepreneurs wanting flexibility and lower overhead costs.",
    brandStory:
      "QuickBite revolutionized street food with healthy, hygienic, and delicious options served from custom-designed food trucks.",
    businessModel:
      "Mobile food service with fixed routes and event catering. Focus on healthy fast food and premium ingredients.",
    competitiveEdge: [
      "Healthy fast food concept",
      "Mobile flexibility",
      "Lower overhead costs",
      "Event catering opportunities",
    ],

    investmentBreakdown: {
      franchiseFee: 400000,
      equipment: 600000,
      inventory: 100000,
      marketing: 100000,
      workingCapital: 200000,
      other: 400000,
    },
    support: {
      training: "2 weeks operational training",
      marketing: "Launch support + social media marketing",
      operations: "Route planning + vendor support",
      technology: "Mobile POS + order management app",
    },
    roiProjections: [
      { year: 1, revenue: 2400000, profit: 480000, roi: 32 },
      { year: 2, revenue: 3000000, profit: 750000, roi: 50 },
      { year: 3, revenue: 3600000, profit: 1080000, roi: 72 },
    ],

    requirements: {
      spaceRequired: "Food truck provided",
      experience: "Food service experience preferred",
      investment: "₹12L - ₹18L total investment",
      location: "High traffic areas, events",
    },
    badges: ["Verified", "Mobile Business", "Hot Deal"],
    images: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    ],

    logo: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200",
    verification: {
      verified: true,
      documentsVerified: true,
      brandVerified: true,
    },
    contact: {
      franchiseDeveloper: "Vikram Singh",
      phone: "+91 98765 54324",
      email: "vikram@quickbite.com",
      website: "www.quickbitefoodtruck.com",
    },
    featured: false,
    trending: true,
    multiUnit: false,
    financing: true,
    createdAt: "2024-01-08",
  },
  {
    id: "fran-005",
    brandName: "TechRepair Pro",
    industry: "Technology",
    investmentRequired: "₹5L - ₹10L",
    investmentMin: 500000,
    investmentMax: 1000000,
    franchiseFee: 200000,
    royaltyPercentage: 6,
    outlets: 120,
    territories: ["All major cities"],
    description:
      "Mobile and laptop repair franchise with doorstep service model. Growing demand for device repair services with excellent margins.",
    brandStory:
      "TechRepair Pro has been the trusted name in device repair for 6 years, known for quality service and quick turnaround times.",
    businessModel:
      "Device repair service with both store and doorstep service options. Focus on smartphones, laptops, and tablets.",
    competitiveEdge: [
      "Doorstep service model",
      "Quick turnaround time",
      "Genuine spare parts",
      "Skilled technician training",
    ],

    investmentBreakdown: {
      franchiseFee: 200000,
      equipment: 300000,
      inventory: 200000,
      marketing: 50000,
      workingCapital: 150000,
      other: 100000,
    },
    support: {
      training: "3 weeks technical training",
      marketing: "Digital marketing + local campaigns",
      operations: "Technical support + spare parts supply",
      technology: "Service management app + customer portal",
    },
    roiProjections: [
      { year: 1, revenue: 1500000, profit: 450000, roi: 45 },
      { year: 2, revenue: 2000000, profit: 700000, roi: 70 },
      { year: 3, revenue: 2500000, profit: 1000000, roi: 100 },
    ],

    requirements: {
      spaceRequired: "300-500 sq ft + service vehicle",
      experience: "Technical background preferred",
      investment: "₹5L - ₹10L total investment",
      location: "Commercial areas with good connectivity",
    },
    badges: ["Verified", "Tech Service", "Doorstep Service"],
    images: [
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800",
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800",
    ],

    logo: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=200",
    verification: {
      verified: true,
      documentsVerified: true,
      brandVerified: true,
    },
    contact: {
      franchiseDeveloper: "Suresh Kumar",
      phone: "+91 98765 54325",
      email: "suresh@techrepairpro.com",
      website: "www.techrepairpro.com",
    },
    featured: true,
    trending: false,
    multiUnit: true,
    financing: false,
    createdAt: "2024-01-05",
  },
];

export const getFranchiseById = (id: string): Franchise | undefined => {
  return franchisesData.find((franchise) => franchise.id === id);
};

export const getFranchisesByIndustry = (industry: string): Franchise[] => {
  return franchisesData.filter((franchise) => franchise.industry === industry);
};

export const getFeaturedFranchises = (): Franchise[] => {
  return franchisesData.filter((franchise) => franchise.featured);
};

export const getTrendingFranchises = (): Franchise[] => {
  return franchisesData.filter((franchise) => franchise.trending);
};

export const getFranchisesByInvestment = (
  minInvestment: number,
  maxInvestment: number
): Franchise[] => {
  return franchisesData.filter(
    (franchise) =>
      (franchise.investmentMin ?? 0) >= minInvestment &&
      (franchise.investmentMax ?? 0) <= maxInvestment
  );
};
