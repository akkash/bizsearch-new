export interface Business {
  id: string;
  name: string;
  industry: string;
  location: string;
  city: string;
  state: string;
  priceRange?: string;
  price: number;
  revenueRange?: string;
  revenue?: number;
  establishedYear: number;
  employees: number;
  businessType?: string;
  description: string;
  highlights?: string[] | any;
  badges?: string[] | any;
  images?: string[] | any;
  logo?: string;
  // Database fields (snake_case)
  broker_name?: string;
  // Dummy data fields
  financials?: {
    year: number;
    revenue: number;
    profit: number;
    expenses: number;
  }[];
  assets?: string[];
  operations?: {
    hours: string;
    daysOpen: number;
    seasonality: string;
  };
  verification?: {
    verified: boolean;
    documentsVerified: boolean;
    identityVerified: boolean;
  };
  contact?: {
    brokerName?: string;
    phone: string;
    email: string;
  };
  featured?: boolean;
  trending?: boolean;
  createdAt?: string;
  created_at?: string;
}

export const businessesData: Business[] = [
  {
    id: "biz-001",
    name: "Mumbai Cafe Chain",
    industry: "Food & Beverage",
    location: "Bandra, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    priceRange: "₹45L - ₹50L",
    price: 4750000,
    revenueRange: "₹80L - ₹1Cr",
    revenue: 9000000,
    establishedYear: 2018,
    employees: 25,
    businessType: "Franchise",
    description:
      "Established cafe chain with 3 outlets in prime Mumbai locations. Known for specialty coffee and continental cuisine. Strong brand presence and loyal customer base.",
    highlights: [
      "3 prime location outlets",
      "Established brand with loyal customers",
      "Consistent 15% annual growth",
      "Trained staff and management systems",
    ],

    badges: ["Verified", "Trending", "Hot Deal"],
    images: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    ],

    logo: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200",
    financials: [
      { year: 2023, revenue: 9000000, profit: 1350000, expenses: 7650000 },
      { year: 2022, revenue: 7800000, profit: 1170000, expenses: 6630000 },
      { year: 2021, revenue: 6500000, profit: 975000, expenses: 5525000 },
    ],

    assets: [
      "Kitchen equipment",
      "Furniture & fixtures",
      "POS systems",
      "Inventory",
      "Brand rights",
    ],

    operations: {
      hours: "7:00 AM - 11:00 PM",
      daysOpen: 7,
      seasonality: "Year-round with peak during festivals",
    },
    verification: {
      verified: true,
      documentsVerified: true,
      identityVerified: true,
    },
    contact: {
      brokerName: "Rajesh Sharma",
      phone: "+91 98765 43210",
      email: "rajesh@bizsearch.com",
    },
    featured: true,
    trending: true,
    createdAt: "2024-01-15",
  },
  {
    id: "biz-002",
    name: "Tech Solutions Pvt Ltd",
    industry: "Technology",
    location: "Whitefield, Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    priceRange: "₹1.2Cr - ₹1.5Cr",
    price: 13500000,
    revenueRange: "₹2Cr - ₹3Cr",
    revenue: 25000000,
    establishedYear: 2015,
    employees: 45,
    businessType: "Private Limited",
    description:
      "Software development company specializing in web and mobile applications. Strong client base across US and Europe with recurring revenue model.",
    highlights: [
      "45+ skilled developers",
      "International client base",
      "Recurring revenue model",
      "Modern office setup",
    ],

    badges: ["Verified", "High Growth", "New"],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    ],

    financials: [
      { year: 2023, revenue: 25000000, profit: 5000000, expenses: 20000000 },
      { year: 2022, revenue: 20000000, profit: 4000000, expenses: 16000000 },
      { year: 2021, revenue: 15000000, profit: 3000000, expenses: 12000000 },
    ],

    assets: [
      "Office space",
      "Computer equipment",
      "Software licenses",
      "Client contracts",
    ],

    operations: {
      hours: "9:00 AM - 6:00 PM",
      daysOpen: 5,
      seasonality: "Consistent year-round",
    },
    verification: {
      verified: true,
      documentsVerified: true,
      identityVerified: true,
    },
    contact: {
      brokerName: "Priya Nair",
      phone: "+91 98765 43211",
      email: "priya@bizsearch.com",
    },
    featured: true,
    trending: false,
    createdAt: "2024-01-10",
  },
  {
    id: "biz-003",
    name: "Fitness First Gym",
    industry: "Health & Fitness",
    location: "Koramangala, Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    priceRange: "₹25L - ₹30L",
    price: 2750000,
    revenueRange: "₹40L - ₹50L",
    revenue: 4500000,
    establishedYear: 2019,
    employees: 12,
    businessType: "Partnership",
    description:
      "Well-equipped gym with modern facilities and experienced trainers. Located in prime Koramangala area with high footfall and membership base.",
    highlights: [
      "Modern equipment worth ₹15L",
      "500+ active members",
      "Prime location",
      "Experienced trainer team",
    ],

    badges: ["Verified", "Prime Location"],
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    ],

    financials: [
      { year: 2023, revenue: 4500000, profit: 900000, expenses: 3600000 },
      { year: 2022, revenue: 3800000, profit: 760000, expenses: 3040000 },
      { year: 2021, revenue: 3200000, profit: 640000, expenses: 2560000 },
    ],

    assets: [
      "Gym equipment",
      "Sound system",
      "AC units",
      "Membership database",
    ],

    operations: {
      hours: "5:00 AM - 11:00 PM",
      daysOpen: 7,
      seasonality: "Peak during Jan-Mar and Sep-Nov",
    },
    verification: {
      verified: true,
      documentsVerified: true,
      identityVerified: false,
    },
    contact: {
      phone: "+91 98765 43212",
      email: "fitness@bizsearch.com",
    },
    featured: false,
    trending: true,
    createdAt: "2024-01-08",
  },
  {
    id: "biz-004",
    name: "Organic Farm & Store",
    industry: "Agriculture",
    location: "Pune, Maharashtra",
    city: "Pune",
    state: "Maharashtra",
    priceRange: "₹60L - ₹75L",
    price: 6800000,
    revenueRange: "₹1Cr - ₹1.5Cr",
    revenue: 12000000,
    establishedYear: 2016,
    employees: 20,
    businessType: "Private Limited",
    description:
      "Organic farming operation with retail store and online presence. Certified organic produce with direct-to-consumer sales model.",
    highlights: [
      "50 acres certified organic farm",
      "Retail store + online sales",
      "Government certifications",
      "Growing demand for organic",
    ],

    badges: ["Verified", "Certified Organic", "Sustainable"],
    images: [
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    ],

    financials: [
      { year: 2023, revenue: 12000000, profit: 2400000, expenses: 9600000 },
      { year: 2022, revenue: 10000000, profit: 2000000, expenses: 8000000 },
      { year: 2021, revenue: 8500000, profit: 1700000, expenses: 6800000 },
    ],

    assets: [
      "50 acres farmland",
      "Farm equipment",
      "Retail store",
      "Inventory",
      "Certifications",
    ],

    operations: {
      hours: "6:00 AM - 8:00 PM",
      daysOpen: 6,
      seasonality: "Seasonal crop cycles",
    },
    verification: {
      verified: true,
      documentsVerified: true,
      identityVerified: true,
    },
    contact: {
      brokerName: "Amit Patil",
      phone: "+91 98765 43213",
      email: "amit@bizsearch.com",
    },
    featured: true,
    trending: false,
    createdAt: "2024-01-05",
  },
  {
    id: "biz-005",
    name: "Fashion Boutique Chain",
    industry: "Retail",
    location: "Khan Market, Delhi",
    city: "Delhi",
    state: "Delhi",
    priceRange: "₹35L - ₹40L",
    price: 3750000,
    revenueRange: "₹60L - ₹80L",
    revenue: 7200000,
    establishedYear: 2017,
    employees: 18,
    businessType: "Partnership",
    description:
      "Trendy fashion boutique with 2 outlets in premium Delhi locations. Curated collection of designer wear and accessories with strong social media presence.",
    highlights: [
      "2 premium location stores",
      "Strong social media following",
      "Curated designer collection",
      "Loyal customer base",
    ],

    badges: ["Verified", "Trendy", "Hot Deal"],
    images: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800",
    ],

    financials: [
      { year: 2023, revenue: 7200000, profit: 1080000, expenses: 6120000 },
      { year: 2022, revenue: 6500000, profit: 975000, expenses: 5525000 },
      { year: 2021, revenue: 5800000, profit: 870000, expenses: 4930000 },
    ],

    assets: ["Store fixtures", "Inventory", "POS systems", "Brand assets"],
    operations: {
      hours: "10:00 AM - 9:00 PM",
      daysOpen: 7,
      seasonality: "Peak during festivals and wedding season",
    },
    verification: {
      verified: true,
      documentsVerified: true,
      identityVerified: true,
    },
    contact: {
      brokerName: "Sneha Gupta",
      phone: "+91 98765 43214",
      email: "sneha@bizsearch.com",
    },
    featured: false,
    trending: true,
    createdAt: "2024-01-12",
  },
];

export const getBusinessById = (id: string): Business | undefined => {
  return businessesData.find((business) => business.id === id);
};

export const getBusinessesByIndustry = (industry: string): Business[] => {
  return businessesData.filter((business) => business.industry === industry);
};

export const getFeaturedBusinesses = (): Business[] => {
  return businessesData.filter((business) => business.featured);
};

export const getTrendingBusinesses = (): Business[] => {
  return businessesData.filter((business) => business.trending);
};
