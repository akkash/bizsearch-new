export interface BaseProfile {
  id: string;
  email: string;
  phone: string;
  avatar?: string;
  displayName: string;
  role: "seller" | "buyer" | "franchisor" | "franchisee" | "advisor";
  location: {
    city: string;
    state: string;
    country: string;
  };
  bio: string;
  verificationStatus: "unverified" | "pending" | "verified";
  joinedDate: string;
  lastActive: string;
  isPublic: boolean;
  ndaAccepted: boolean;
}

export interface BusinessSellerProfile extends BaseProfile {
  role: "seller";
  companyName: string;
  companyLogo?: string;
  industry: string;
  businessType: "sole-proprietorship" | "partnership" | "llc" | "corporation";
  yearEstablished: number;
  employees: number;
  // Public fields
  publicInfo: {
    shortDescription: string;
    keyFeatures: string[];
    businessHours: string;
    website?: string;
  };
  // Private fields (NDA required)
  privateInfo: {
    monthlyRevenue: number;
    annualRevenue: number;
    netProfit: number;
    askingPrice: number;
    assets: {
      equipment: number;
      inventory: number;
      realEstate: number;
    };
    liabilities: number;
    customerBase: number;
    leaseInfo: {
      monthlyRent: number;
      leaseExpiry: string;
      renewalOptions: string;
    };
    reasonForSelling: string;
  };
  listings: string[]; // Business IDs
  inquiries: number;
  offers: number;
}

export interface BusinessBuyerProfile extends BaseProfile {
  role: "buyer";
  buyerType: "individual" | "private-equity" | "venture-capital" | "strategic";
  firmName?: string;
  firmLogo?: string;
  investmentRange: {
    min: number;
    max: number;
  };
  preferredIndustries: string[];
  preferredLocations: string[];
  experience: string;
  // Private fields
  privateInfo: {
    financingPreference: "cash" | "sba-loan" | "seller-financing" | "mixed";
    preApprovalAmount?: number;
    timeline: string;
    dueDiligenceProcess: string;
  };
  savedBusinesses: string[];
  savedSearches: string[];
  ndaRequests: string[];
}

export interface FranchisorProfile extends BaseProfile {
  role: "franchisor";
  brandName: string;
  brandLogo?: string;
  industry: string;
  yearFounded: number;
  totalOutlets: number;
  franchiseFee: number;
  royaltyPercentage: number;
  investmentRange: {
    min: number;
    max: number;
  };
  // Public fields
  publicInfo: {
    brandStory: string;
    keyDifferentiators: string[];
    supportProvided: string[];
    territoryAvailability: string[];
  };
  // Private fields (NDA required)
  privateInfo: {
    franchiseKit: string;
    roiCaseStudies: string[];
    legalDocuments: string[];
    financialPerformance: {
      averageUnitRevenue: number;
      averageUnitProfit: number;
      breakEvenTime: number;
    };
    franchiseeRequirements: string[];
  };
  franchiseListings: string[];
  leads: number;
  activeNegotiations: number;
}

export interface FranchiseeProfile extends BaseProfile {
  role: "franchisee";
  preferredIndustries: string[];
  preferredTerritories: string[];
  investmentBudget: {
    min: number;
    max: number;
  };
  experience: {
    businessExperience: string;
    franchiseExperience: string;
    industryExperience: string;
  };
  timeline: string;
  savedFranchises: string[];
  applications: string[];
  comparisonMatrix: string[];
}

export interface AdvisorProfile extends BaseProfile {
  role: "advisor";
  firmName: string;
  firmLogo?: string;
  licenseNumber: string;
  services: string[];
  specialization: string[];
  coverageRegions: string[];
  experience: number;
  credentials: string[];
  // Professional info
  professionalInfo: {
    successRate: number;
    averageDealSize: number;
    totalDealsCompleted: number;
    clientTestimonials: string[];
  };
  managedListings: string[];
  activeClients: number;
  commissionStructure: string;
}

export type UserProfile =
  | BusinessSellerProfile
  | BusinessBuyerProfile
  | FranchisorProfile
  | FranchiseeProfile
  | AdvisorProfile;

// Mock profile data
export const mockProfiles: UserProfile[] = [
  {
    id: "u1",
    email: "rajesh.kumar@techflow.com",
    phone: "+91 98765 43210",
    avatar: "https://github.com/yusufhilmi.png",
    displayName: "Rajesh Kumar",
    role: "seller",
    location: {
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
    },
    bio: "Experienced tech entrepreneur looking to sell my successful software consultancy to focus on new ventures.",
    verificationStatus: "verified",
    joinedDate: "2023-06-15",
    lastActive: "2024-01-15",
    isPublic: true,
    ndaAccepted: false,
    companyName: "TechFlow Solutions",
    companyLogo: "https://github.com/polymet-ai.png",
    industry: "Technology",
    businessType: "llc",
    yearEstablished: 2018,
    employees: 25,
    publicInfo: {
      shortDescription:
        "Leading software consultancy specializing in enterprise solutions and digital transformation.",
      keyFeatures: [
        "Established client base of 50+ companies",
        "Recurring revenue model",
        "Skilled development team",
        "Modern tech stack",
      ],

      businessHours: "Mon-Fri 9AM-6PM",
      website: "https://techflow.com",
    },
    privateInfo: {
      monthlyRevenue: 800000,
      annualRevenue: 9600000,
      netProfit: 2400000,
      askingPrice: 12000000,
      assets: {
        equipment: 500000,
        inventory: 0,
        realEstate: 0,
      },
      liabilities: 200000,
      customerBase: 52,
      leaseInfo: {
        monthlyRent: 150000,
        leaseExpiry: "2026-12-31",
        renewalOptions: "5-year renewal available",
      },
      reasonForSelling: "Pursuing new venture in AI/ML space",
    },
    listings: ["b1", "b2"],
    inquiries: 23,
    offers: 5,
  } as BusinessSellerProfile,

  {
    id: "u2",
    email: "priya.investments@gmail.com",
    phone: "+91 98765 43211",
    avatar: "https://github.com/kdrnp.png",
    displayName: "Priya Sharma",
    role: "buyer",
    location: {
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
    },
    bio: "Private equity investor focused on acquiring profitable SMEs in technology and healthcare sectors.",
    verificationStatus: "verified",
    joinedDate: "2023-08-20",
    lastActive: "2024-01-14",
    isPublic: true,
    ndaAccepted: true,
    buyerType: "private-equity",
    firmName: "Sharma Capital Partners",
    firmLogo: "https://github.com/polymet-ai.png",
    investmentRange: {
      min: 5000000,
      max: 50000000,
    },
    preferredIndustries: ["Technology", "Healthcare", "Manufacturing"],
    preferredLocations: ["Mumbai", "Pune", "Bangalore", "Delhi"],
    experience: "15+ years in private equity and business acquisitions",
    privateInfo: {
      financingPreference: "mixed",
      preApprovalAmount: 30000000,
      timeline: "3-6 months for due diligence and closing",
      dueDiligenceProcess:
        "Comprehensive financial, legal, and operational review",
    },
    savedBusinesses: ["b1", "b3", "b5"],
    savedSearches: ["tech-bangalore", "healthcare-mumbai"],
    ndaRequests: ["b1", "b2"],
  } as BusinessBuyerProfile,

  {
    id: "u3",
    email: "franchise@burgerjunction.com",
    phone: "+91 98765 43212",
    avatar: "https://github.com/yahyabedirhan.png",
    displayName: "Amit Patel",
    role: "franchisor",
    location: {
      city: "Ahmedabad",
      state: "Gujarat",
      country: "India",
    },
    bio: "Founder of Burger Junction, expanding our successful QSR franchise across India with proven systems and support.",
    verificationStatus: "verified",
    joinedDate: "2023-05-10",
    lastActive: "2024-01-15",
    isPublic: true,
    ndaAccepted: false,
    brandName: "Burger Junction",
    brandLogo: "https://github.com/polymet-ai.png",
    industry: "Food & Beverage",
    yearFounded: 2019,
    totalOutlets: 45,
    franchiseFee: 500000,
    royaltyPercentage: 6,
    investmentRange: {
      min: 2000000,
      max: 3500000,
    },
    publicInfo: {
      brandStory:
        "Started as a single outlet in Ahmedabad, now India's fastest-growing burger franchise with a focus on quality ingredients and customer experience.",
      keyDifferentiators: [
        "Fresh, never frozen patties",
        "Proprietary sauce recipes",
        "Quick service model",
        "Strong brand recognition",
      ],

      supportProvided: [
        "Site selection assistance",
        "Complete training program",
        "Marketing support",
        "Operations manual",
        "Ongoing business coaching",
      ],

      territoryAvailability: ["Mumbai", "Pune", "Surat", "Vadodara", "Rajkot"],
    },
    privateInfo: {
      franchiseKit: "comprehensive-franchise-kit-v2.pdf",
      roiCaseStudies: [
        "mumbai-outlet-case-study.pdf",
        "pune-success-story.pdf",
      ],

      legalDocuments: ["franchise-agreement.pdf", "disclosure-document.pdf"],
      financialPerformance: {
        averageUnitRevenue: 2500000,
        averageUnitProfit: 500000,
        breakEvenTime: 18,
      },
      franchiseeRequirements: [
        "Minimum 5 years business experience",
        "Food service experience preferred",
        "Commitment to brand standards",
        "Local market knowledge",
      ],
    },
    franchiseListings: ["f1", "f2"],
    leads: 34,
    activeNegotiations: 8,
  } as FranchisorProfile,
];

// Utility functions
export const getProfileByRole = (role: UserProfile["role"]): UserProfile[] => {
  return mockProfiles.filter((profile) => profile.role === role);
};

export const getProfileById = (id: string): UserProfile | undefined => {
  return mockProfiles.find((profile) => profile.id === id);
};

export const getCurrentUserProfile = (): UserProfile => {
  // In real app, this would get the current user's profile
  return mockProfiles[0]; // Default to first profile for demo
};

export const updateProfile = (
  id: string,
  updates: Partial<UserProfile>
): UserProfile => {
  const profileIndex = mockProfiles.findIndex((p) => p.id === id);
  if (profileIndex !== -1) {
    mockProfiles[profileIndex] = { ...mockProfiles[profileIndex], ...updates };
    return mockProfiles[profileIndex];
  }
  throw new Error("Profile not found");
};

// Activity timeline data
export interface ActivityEvent {
  id: string;
  type:
    | "listing_created"
    | "inquiry_received"
    | "offer_made"
    | "document_uploaded"
    | "profile_updated"
    | "nda_signed";
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const mockActivityEvents: ActivityEvent[] = [
  {
    id: "a1",
    type: "listing_created",
    title: "New Business Listed",
    description: "TechFlow Solutions listed for sale",
    timestamp: "2024-01-15T10:30:00Z",
    metadata: { listingId: "b1", askingPrice: 12000000 },
  },
  {
    id: "a2",
    type: "inquiry_received",
    title: "New Inquiry",
    description: "Inquiry received from Priya Sharma",
    timestamp: "2024-01-14T15:45:00Z",
    metadata: { inquiryId: "i1", buyerId: "u2" },
  },
  {
    id: "a3",
    type: "document_uploaded",
    title: "Financial Documents Uploaded",
    description: "P&L statements and balance sheets uploaded",
    timestamp: "2024-01-13T09:15:00Z",
    metadata: { documentCount: 5, documentType: "financial" },
  },
  {
    id: "a4",
    type: "nda_signed",
    title: "NDA Signed",
    description: "Non-disclosure agreement signed with potential buyer",
    timestamp: "2024-01-12T14:20:00Z",
    metadata: { buyerId: "u2", ndaId: "nda1" },
  },
  {
    id: "a5",
    type: "offer_made",
    title: "Offer Received",
    description: "₹10.5Cr offer received for TechFlow Solutions",
    timestamp: "2024-01-11T11:00:00Z",
    metadata: { offerId: "o1", amount: 10500000, buyerId: "u2" },
  },
];

export const getActivityEvents = (userId: string): ActivityEvent[] => {
  // In real app, filter by user ID
  return mockActivityEvents;
};
