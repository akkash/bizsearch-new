import { z } from "zod";

// Zod validation schemas
export const businessOverviewSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  tagline: z.string().optional(),
  industry: z.array(z.string()).min(1, "Please select at least one industry"),
  subcategory: z.array(z.string()).min(1, "Please select at least one subcategory"),
  businessType: z.enum(["asset_sale", "stock_sale", "franchise"], {
    required_error: "Please select a business type",
  }),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  fullAddress: z.string().min(5, "Full address is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  establishedYear: z
    .number()
    .min(1800, "Year must be after 1800")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  yearsInOperation: z.number().min(0, "Years in operation cannot be negative"),
  numberOfEmployees: z
    .number()
    .min(0, "Number of employees cannot be negative"),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  socialLinks: z.array(z.string().url()).optional(),
});

export const descriptionSchema = z.object({
  longDescription: z
    .string()
    .min(150, "Description must be at least 150 characters"),
  businessModel: z.enum([
    "retail",
    "manufacturing",
    "service",
    "saas",
    "food_beverage",
    "healthcare",
    "education",
    "consulting",
    "e_commerce",
    "other",
  ]),
  customerProfile: z
    .string()
    .min(50, "Customer profile must be at least 50 characters"),
  supplierRelationships: z.string().optional(),
  // NEW: Reason for selling - critical trust signal
  reasonForSale: z.string().min(10, "Please explain why you're selling").optional(),
  // NEW: Training/transition support period
  trainingPeriod: z.string().optional(), // e.g., "2-4 weeks", "30 days"
  // NEW: Growth opportunities for new owner
  growthOpportunities: z.array(z.string()).max(5).optional(),
  // NEW: Location advantages
  locationHighlights: z.array(z.string()).max(5).optional(),
  leaseDetails: z
    .object({
      type: z.enum(["owned", "leased", "mixed"]),
      terms: z.string().optional(),
      monthlyRent: z.number().optional(),
      leaseExpiry: z.string().optional(),
      // NEW: Lease remaining years
      leaseRemainingYears: z.number().min(0).optional(),
      // NEW: Lock-in period
      lockInPeriod: z.string().optional(), // e.g., "2 years"
      // NEW: Security deposit
      securityDeposit: z.number().min(0).optional(),
    })
    .optional(),
});

export const financialsSchema = z.object({
  askingPrice: z.number().min(1, "Asking price must be greater than 0"),
  priceBreakdown: z.object({
    assets: z.number().min(0),
    goodwill: z.number().min(0),
    workingCapital: z.number().min(0),
  }),
  revenue: z
    .object({
      year1: z.number().optional(),
      year2: z.number().optional(),
      year3: z.number().optional(),
    })
    .optional(),
  ebitda: z
    .object({
      year1: z.number().optional(),
      year2: z.number().optional(),
      year3: z.number().optional(),
    })
    .optional(),
  monthlyCashFlow: z.number().optional(),
  profitMargins: z.number().min(0).max(100).optional(),
  financingAvailable: z.boolean(),
  financingDetails: z.string().optional(),
  // NEW: Annual profit (for SDE calculation)
  annualProfit: z.number().min(0).optional(),
  // NEW: Year-over-year growth percentages
  revenueGrowthYoY: z.number().min(-100).max(500).optional(),
  profitGrowthYoY: z.number().min(-100).max(500).optional(),
});

export const assetsSchema = z.object({
  assetsIncluded: z.array(
    z.enum([
      "equipment",
      "inventory",
      "intellectual_property",
      "customer_lists",
      "brand",
      "real_estate",
    ])
  ),
  equipmentDetails: z.string().optional(),
  inventoryValue: z.number().min(0).optional(),
  inventorySnapshotDate: z.string().optional(),
  // NEW: Detailed physical assets list
  physicalAssets: z.array(z.object({
    name: z.string(),
    value: z.number().optional(),
    condition: z.enum(["excellent", "good", "fair", "needs_repair"]).optional(),
  })).optional(),
});

export const mediaSchema = z.object({
  businessPhotos: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        filename: z.string(),
        size: z.number(),
        type: z.string(),
      })
    )
    .min(1, "At least one business photo is required"),
  floorPlans: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        filename: z.string(),
        size: z.number(),
        type: z.string(),
      })
    )
    .optional(),
  videos: z.array(z.string().url()).optional(),
  documents: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        filename: z.string(),
        size: z.number(),
        type: z.string(),
        documentType: z.enum(["financial", "legal", "operational", "other"]),
        confidentiality: z.enum(["public", "nda_required", "restricted"]),
      })
    )
    .optional(),
});

export const contactSchema = z.object({
  sellerDisplayName: z
    .string()
    .min(2, "Display name must be at least 2 characters"),
  contactPhone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"),
  contactEmail: z.string().email("Please enter a valid email address"),
  preferredContactMethod: z.enum(["phone", "email", "platform"]),
  enablePublicContact: z.boolean(),
  verificationConsent: z.boolean().refine((val) => val === true, {
    message: "You must confirm the accuracy of the information",
  }),
});

export const publishSchema = z.object({
  visibility: z.enum(["public", "private", "link_only"]),
  featuredListing: z.boolean(),
  promotionPackage: z.enum(["none", "basic", "premium"]).optional(),
});

// Complete form schema
export const businessListingSchema = z.object({
  overview: businessOverviewSchema,
  description: descriptionSchema,
  financials: financialsSchema,
  assets: assetsSchema,
  media: mediaSchema,
  contact: contactSchema,
  publish: publishSchema,
});

export type BusinessListingFormValues = z.infer<typeof businessListingSchema>;

// Industry options - dynamically generated from SMERGERS categories
import { SMERGERS_BUSINESS_CATEGORIES } from "@/data/categories";

export const industryOptions = SMERGERS_BUSINESS_CATEGORIES.map(cat => ({
  value: cat.slug,
  label: cat.name,
}));

// For backwards compatibility, keep subcategory access
export const getSubcategoriesForIndustry = (industrySlug: string) => {
  const category = SMERGERS_BUSINESS_CATEGORIES.find(cat => cat.slug === industrySlug);
  return category?.subcategories.map(sub => ({
    value: sub.slug,
    label: sub.name,
  })) || [];
};

// Business model options
export const businessModelOptions = [
  { value: "retail", label: "Retail Store" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "service", label: "Service Business" },
  { value: "saas", label: "Software as a Service" },
  { value: "food_beverage", label: "Food & Beverage" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "consulting", label: "Consulting" },
  { value: "e_commerce", label: "E-commerce" },
  { value: "other", label: "Other" },
];

// Mock draft data for testing
export const mockListingDraft: Partial<BusinessListingFormValues> = {
  overview: {
    businessName: "Mumbai Cafe Express",
    tagline: "Premium coffee and quick bites in the heart of Mumbai",
    industry: ["food_beverage", "retail"],
    subcategory: ["cafe", "coffee-shop"],
    businessType: "asset_sale",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    fullAddress:
      "Shop 15, Ground Floor, Linking Road, Bandra West, Mumbai 400050",
    establishedYear: 2018,
    yearsInOperation: 6,
    numberOfEmployees: 12,
    website: "https://mumbaicafeexpress.com",
    socialLinks: ["https://instagram.com/mumbaicafeexpress"],
  },
  description: {
    longDescription:
      "Mumbai Cafe Express is a thriving coffee shop and quick service restaurant located in the bustling Linking Road area of Bandra West. Established in 2018, we have built a loyal customer base with our premium coffee blends, fresh sandwiches, and authentic Mumbai street food fusion items. The cafe operates 12 hours daily and serves over 300 customers per day during peak seasons.",
    businessModel: "food_beverage",
    customerProfile:
      "Our primary customers are young professionals (25-40 years), college students, and local residents. We see high foot traffic from office workers during lunch hours and evening commuters. Weekend customers include families and tourists exploring the Bandra area.",
    supplierRelationships:
      "Strong relationships with local coffee roasters and food suppliers. Exclusive partnership with organic vegetable suppliers.",
    leaseDetails: {
      type: "leased",
      terms: "5-year lease with 2-year renewal option",
      monthlyRent: 85000,
      leaseExpiry: "2027-03-31",
    },
  },
  financials: {
    askingPrice: 2500000,
    priceBreakdown: {
      assets: 800000,
      goodwill: 1200000,
      workingCapital: 500000,
    },
    revenue: {
      year1: 4200000,
      year2: 3800000,
      year3: 3500000,
    },
    monthlyCashFlow: 180000,
    profitMargins: 22,
    financingAvailable: true,
    financingDetails:
      "Seller financing available for 40% of purchase price over 3 years",
  },
};

// API response types
export interface UploadResponse {
  url: string;
  id: string;
  type: string;
  size: number;
  expiresAt?: string;
}

export interface ListingResponse {
  listingId: string;
  status: "draft" | "submitted" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface AIsuggestion {
  type: "valuation" | "description" | "comparable";
  title: string;
  content: string;
  confidence: number;
}

export interface NDAAccessResponse {
  accessToken: string;
  expiresAt: string;
  documentsAccess: string[];
}
