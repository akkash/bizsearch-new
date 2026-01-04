import { z } from "zod";

// Franchise-specific validation schemas
export const franchiseListingSchema = z.object({
  // Brand Overview
  brandOverview: z.object({
    brandName: z.string().min(2, "Brand name must be at least 2 characters"),
    tagline: z.string().min(10, "Tagline must be at least 10 characters"),
    industry: z.array(z.string()).min(1, "Select at least one industry"),
    subcategory: z.array(z.string()).min(1, "Select at least one subcategory"),
    businessModel: z.string().min(1, "Business model is required"),
    yearEstablished: z
      .number()
      .min(1900, "Invalid year")
      .max(new Date().getFullYear()),
    totalOutlets: z.number().min(1, "Must have at least 1 outlet"),
    companyOutlets: z.number().min(0, "Company outlets cannot be negative"),
    franchiseOutlets: z.number().min(0, "Franchise outlets cannot be negative"),
    territories: z.array(z.string()).min(1, "Select at least one territory"),
    website: z.string().url("Invalid website URL").optional(),
    // NEW: Countries where franchise operates
    countriesOperating: z.number().min(1).optional(),
    // NEW: Awards and recognition
    awards: z.array(z.object({
      name: z.string(),
      org: z.string(),
      year: z.number().optional(),
    })).optional(),
  }),

  // Franchise Description
  description: z.object({
    brandDescription: z
      .string()
      .min(100, "Brand description must be at least 100 characters"),
    uniqueSellingPoints: z
      .array(z.string())
      .min(3, "Add at least 3 unique selling points"),
    targetMarket: z.string().min(50, "Target market description required"),
    competitiveAdvantages: z
      .array(z.string())
      .min(2, "Add at least 2 competitive advantages"),
    growthPotential: z
      .string()
      .min(50, "Growth potential description required"),
    // NEW: Mission statement for brand carousel
    mission: z.string().min(50, "Mission statement should be at least 50 characters").optional(),
    // NEW: Founder/leadership bio
    founderBio: z.string().min(50, "Founder bio should be at least 50 characters").optional(),
  }),

  // Investment & Financials
  investment: z.object({
    franchiseFee: z.number().min(0, "Franchise fee cannot be negative"),
    totalInvestment: z.object({
      min: z.number().min(0, "Minimum investment cannot be negative"),
      max: z.number().min(0, "Maximum investment cannot be negative"),
    }),
    liquidCapitalRequired: z
      .number()
      .min(0, "Liquid capital cannot be negative"),
    royaltyStructure: z.object({
      type: z.enum(["fixed", "tiered", "performance_based"]),
      baseTiers: z.array(
        z.object({
          id: z.string(),
          minRevenue: z.number(),
          maxRevenue: z.number().optional(),
          percentage: z.number(),
          description: z.string().optional(),
        })
      ),
      performanceIncentives: z
        .object({
          enabled: z.boolean(),
          bonusThreshold: z.number(),
          bonusReduction: z.number(),
        })
        .optional(),
      volumeDiscounts: z
        .object({
          enabled: z.boolean(),
          multiUnitDiscount: z.number(),
          loyaltyDiscount: z.number(),
        })
        .optional(),
    }),
    marketingFee: z.object({
      type: z.enum(["fixed", "percentage", "tiered"]),
      value: z.number(),
      tiers: z
        .array(
          z.object({
            id: z.string(),
            minRevenue: z.number(),
            maxRevenue: z.number().optional(),
            percentage: z.number(),
          })
        )
        .optional(),
    }),
    investmentBreakdown: z.array(
      z.object({
        id: z.string(),
        category: z.string(),
        name: z.string(),
        amount: z.number(),
        isRequired: z.boolean(),
        description: z.string().optional(),
        financingAvailable: z.boolean().optional(),
        paymentTiming: z
          .enum(["upfront", "monthly", "quarterly", "annual"])
          .optional(),
      })
    ),
    breakEvenPeriod: z
      .number()
      .min(1, "Break-even period must be at least 1 month"),
    averageROI: z.number().min(0).max(100, "ROI cannot exceed 100%"),
    financingOptions: z.array(z.string()),
    roiProjections: z
      .object({
        scenarios: z.array(
          z.object({
            name: z.string(),
            probability: z.number(),
            projections: z.array(
              z.object({
                year: z.number(),
                revenue: z.number(),
                expenses: z.number(),
                netIncome: z.number(),
                cumulativeROI: z.number(),
              })
            ),
            assumptions: z.array(z.string()),
          })
        ),
      })
      .optional(),
  }),

  // Support & Training
  support: z.object({
    initialTrainingDuration: z.number().min(1, "Training duration required"),
    ongoingSupport: z.array(z.string()).min(3, "Add at least 3 support types"),
    marketingSupport: z
      .array(z.string())
      .min(2, "Add at least 2 marketing support types"),
    operationalSupport: z
      .array(z.string())
      .min(2, "Add at least 2 operational support types"),
    technologySupport: z.array(z.string()),
    qualityAssurance: z
      .string()
      .min(50, "Quality assurance description required"),
  }),

  // Territory & Requirements
  territory: z.object({
    selectedTerritories: z
      .array(
        z.object({
          id: z.string(),
          type: z.enum(["state", "city", "district", "custom"]),
          name: z.string(),
          population: z.number().optional(),
          coordinates: z
            .object({
              lat: z.number(),
              lng: z.number(),
            })
            .optional(),
          bounds: z
            .object({
              north: z.number(),
              south: z.number(),
              east: z.number(),
              west: z.number(),
            })
            .optional(),
          isAvailable: z.boolean(),
          isProtected: z.boolean(),
          exclusivityRadius: z.number().optional(),
        })
      )
      .min(1, "Select at least one territory"),
    protectedTerritoryEnabled: z.boolean(),
    territorySize: z.string().min(1, "Territory size required"),
    populationRequirement: z
      .number()
      .min(0, "Population requirement cannot be negative"),
    demographicProfile: z.string().min(50, "Demographic profile required"),
    competitionAnalysis: z.string().min(50, "Competition analysis required"),
    multiUnitDevelopment: z
      .object({
        enabled: z.boolean(),
        minimumUnits: z.number().optional(),
        developmentTimeline: z.string().optional(),
        additionalIncentives: z.string().optional(),
      })
      .optional(),
    // NEW: Count of available territories for summary display
    availableTerritoriesCount: z.number().min(0).optional(),
    // NEW: Territory availability list for Bento search feature
    territoryAvailability: z.array(z.object({
      city: z.string(),
      status: z.enum(["available", "taken", "limited"]),
      state: z.string().optional(),
    })).optional(),
  }),

  // Franchisee Profile
  franchiseeProfile: z.object({
    idealCandidateProfile: z
      .string()
      .min(100, "Ideal candidate profile required"),
    experienceRequired: z.string().min(1, "Experience requirement needed"),
    skillsRequired: z
      .array(z.string())
      .min(3, "Add at least 3 required skills"),
    timeCommitment: z.string().min(1, "Time commitment required"),
    backgroundPreferences: z.array(z.string()),
  }),

  // Media & Documents
  media: z.object({
    brandLogo: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          url: z.string(),
          type: z.string(),
          size: z.number(),
        })
      )
      .min(1, "Brand logo is required"),
    outletPhotos: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          url: z.string(),
          type: z.string(),
          size: z.number(),
        })
      )
      .min(3, "At least 3 outlet photos required"),
    marketingMaterials: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        url: z.string(),
        type: z.string(),
        size: z.number(),
      })
    ),
    franchiseDisclosureDocument: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          url: z.string(),
          type: z.string(),
          size: z.number(),
        })
      )
      .min(1, "FDD is required"),
    financialStatements: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        url: z.string(),
        type: z.string(),
        size: z.number(),
      })
    ),
  }),

  // Contact & Legal
  contact: z.object({
    primaryContact: z.object({
      name: z.string().min(2, "Contact name required"),
      title: z.string().min(2, "Contact title required"),
      email: z.string().email("Invalid email address"),
      phone: z.string().min(10, "Valid phone number required"),
    }),
    companyAddress: z.object({
      street: z.string().min(5, "Street address required"),
      city: z.string().min(2, "City required"),
      state: z.string().min(2, "State required"),
      zipCode: z.string().min(5, "Valid zip code required"),
      country: z.string().min(2, "Country required"),
    }),
    legalStructure: z.string().min(1, "Legal structure required"),
    registrationNumber: z.string().min(5, "Registration number required"),
    franchiseRegistration: z.string().min(5, "Franchise registration required"),
  }),

  // Publishing Settings
  publishing: z.object({
    listingTitle: z
      .string()
      .min(10, "Listing title must be at least 10 characters"),
    visibility: z.enum(["public", "private", "verified_only"]),
    featuredListing: z.boolean(),
    urgentListing: z.boolean(),
    contactPreferences: z.object({
      allowDirectContact: z.boolean(),
      requireNDA: z.boolean(),
      screeningQuestions: z.array(z.string()),
    }),
    termsAccepted: z
      .boolean()
      .refine((val) => val === true, "Must accept terms"),
    verificationConsent: z
      .boolean()
      .refine((val) => val === true, "Must consent to verification"),
  }),
});

export type FranchiseListingFormValues = z.infer<typeof franchiseListingSchema>;

// Industry options for franchises - dynamically generated from FRANCHISE_CATEGORIES
import { FRANCHISE_CATEGORIES } from "@/data/categories";

export const franchiseIndustryOptions = FRANCHISE_CATEGORIES.map(cat => ({
  value: cat.slug,
  label: cat.name,
}));

// Business model options for franchises
export const franchiseBusinessModelOptions = [
  { value: "traditional", label: "Traditional Franchise" },
  { value: "master", label: "Master Franchise" },
  { value: "area-development", label: "Area Development" },
  { value: "conversion", label: "Conversion Franchise" },
  { value: "mobile", label: "Mobile Franchise" },
  { value: "home-based", label: "Home-Based Franchise" },
  { value: "kiosk", label: "Kiosk/Cart Franchise" },
  { value: "multi-unit", label: "Multi-Unit Development" },
];

// Support types
export const supportTypes = [
  "Site Selection Assistance",
  "Store Design & Layout",
  "Equipment Procurement",
  "Staff Recruitment",
  "Initial Training Program",
  "Operations Manual",
  "Marketing Launch Support",
  "Ongoing Operational Support",
  "Technology Support",
  "Supply Chain Management",
  "Quality Control",
  "Performance Monitoring",
];

// Marketing support types
export const marketingSupportTypes = [
  "National Advertising Campaigns",
  "Local Marketing Templates",
  "Digital Marketing Support",
  "Social Media Management",
  "Website Development",
  "SEO Support",
  "Print Marketing Materials",
  "Grand Opening Support",
  "Promotional Campaigns",
  "Brand Guidelines",
];

// Mock franchise listing draft
export const mockFranchiseListing: Partial<FranchiseListingFormValues> = {
  brandOverview: {
    brandName: "FreshBite Café",
    tagline: "Healthy, Fresh, Fast - The Future of Quick Service",
    industry: ["food-beverage"],
    subcategory: ["bakery", "cafe"],
    businessModel: "traditional",
    yearEstablished: 2018,
    totalOutlets: 125,
    companyOutlets: 15,
    franchiseOutlets: 110,
    territories: ["Maharashtra", "Karnataka", "Tamil Nadu", "Delhi NCR"],
    website: "https://freshbitecafe.com",
  },
  description: {
    brandDescription:
      "FreshBite Café revolutionizes the quick-service restaurant industry by offering healthy, fresh, and customizable meals. Our innovative concept combines the speed of fast food with the quality of fresh ingredients, catering to health-conscious consumers who don't want to compromise on taste or convenience.",
    uniqueSellingPoints: [
      "100% fresh ingredients, no preservatives",
      "Customizable healthy meals in under 3 minutes",
      "Proprietary technology for order management",
      "Sustainable packaging and eco-friendly practices",
    ],

    targetMarket:
      "Health-conscious millennials and Gen-Z consumers aged 18-40, office workers, fitness enthusiasts, and families seeking convenient healthy dining options.",
    competitiveAdvantages: [
      "First-mover advantage in healthy fast-casual segment",
      "Proprietary technology platform for seamless operations",
      "Strong brand recognition and customer loyalty",
    ],

    growthPotential:
      "Projected to expand to 500+ outlets across India by 2027, with plans for international expansion in Southeast Asia.",
  },
  investment: {
    franchiseFee: 800000,
    totalInvestment: {
      min: 2500000,
      max: 4000000,
    },
    liquidCapitalRequired: 1500000,
    royaltyStructure: {
      type: "fixed",
      baseTiers: [{ id: "t1", minRevenue: 0, percentage: 6 }],
    },
    marketingFee: {
      type: "percentage",
      value: 2,
    },
    breakEvenPeriod: 18,
    averageROI: 25,
    financingOptions: [
      "Bank partnerships",
      "Equipment financing",
      "Working capital loans",
    ],
    investmentBreakdown: [], // Added required empty array to match schema
  },
  support: {
    initialTrainingDuration: 21,
    ongoingSupport: [
      "Operations Manual",
      "Technology Support",
      "Marketing Support",
      "Quality Control",
    ],

    marketingSupport: [
      "National Advertising",
      "Digital Marketing",
      "Local Promotions",
    ],

    operationalSupport: ["Site Selection", "Store Setup", "Staff Training"],
    technologySupport: ["POS System", "Mobile App", "Inventory Management"],
    qualityAssurance:
      "Regular quality audits, mystery shopping, and performance monitoring to ensure brand standards are maintained across all outlets.",
  },
};

// AI suggestion types for franchises
export interface FranchiseAISuggestion {
  id: string;
  type: "investment" | "territory" | "support" | "marketing" | "description";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  suggestion: string;
  data?: any;
}

// Mock AI suggestions for franchises
export const mockFranchiseAISuggestions: FranchiseAISuggestion[] = [
  {
    id: "fs1",
    type: "investment",
    title: "Optimize Investment Range",
    description: "Based on similar food & beverage franchises",
    impact: "high",
    confidence: 85,
    suggestion:
      "Consider adjusting franchise fee to ₹6-8L and total investment to ₹25-40L for better market positioning",
    data: {
      suggestedFee: 700000,
      suggestedRange: { min: 2500000, max: 4000000 },
    },
  },
  {
    id: "fs2",
    type: "territory",
    title: "High-Potential Markets",
    description: "AI analysis of demographic and competition data",
    impact: "high",
    confidence: 78,
    suggestion:
      "Pune, Hyderabad, and Ahmedabad show high potential for healthy food concepts with low competition",
    data: { markets: ["Pune", "Hyderabad", "Ahmedabad"] },
  },
  {
    id: "fs3",
    type: "support",
    title: "Enhanced Training Program",
    description: "Benchmark against top-performing franchises",
    impact: "medium",
    confidence: 72,
    suggestion:
      "Extend training to 30 days and add digital marketing certification for better franchisee success",
    data: { recommendedDuration: 30 },
  },
];
