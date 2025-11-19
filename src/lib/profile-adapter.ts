import type { Database } from "@/types/supabase";
import type { UserProfile } from "@/polymet/data/profile-data";

type SupabaseProfile = Database['public']['Tables']['profiles']['Row'];

/**
 * Adapts Supabase profile to the legacy UserProfile type
 * This allows existing components to work with the new database schema
 */
export function adaptSupabaseProfileToUserProfile(profile: SupabaseProfile): UserProfile {
  const baseProfile = {
    id: profile.id,
    email: profile.email,
    phone: profile.phone || "",
    avatar: profile.avatar_url || undefined,
    displayName: profile.display_name || "Unknown User",
    location: {
      city: profile.city || "",
      state: profile.state || "",
      country: profile.country || "India",
    },
    bio: profile.bio || "",
    verificationStatus: (profile.verified ? "verified" : "unverified") as "verified" | "unverified" | "pending",
    joinedDate: profile.created_at,
    lastActive: profile.updated_at,
    isPublic: true,
    ndaAccepted: false,
  };

  // Adapt based on role
  switch (profile.role) {
    case "seller":
      return {
        ...baseProfile,
        role: "seller",
        companyName: profile.display_name || "Business",
        companyLogo: profile.avatar_url || undefined,
        industry: profile.industry || "General",
        businessType: "llc",
        yearEstablished: profile.founded_year || new Date().getFullYear(),
        employees: profile.employees || 0,
        publicInfo: {
          shortDescription: profile.bio || "",
          keyFeatures: Array.isArray(profile.key_products) ? profile.key_products as string[] : [],
          businessHours: "Mon-Fri 9AM-6PM",
          website: profile.website || undefined,
        },
        privateInfo: {
          monthlyRevenue: 0,
          annualRevenue: 0,
          netProfit: 0,
          askingPrice: profile.asking_price || 0,
          assets: {
            equipment: 0,
            inventory: 0,
            realEstate: 0,
          },
          liabilities: 0,
          customerBase: 0,
          leaseInfo: {
            monthlyRent: 0,
            leaseExpiry: "",
            renewalOptions: "",
          },
          reasonForSelling: "",
        },
        listings: [],
        inquiries: 0,
        offers: 0,
      };

    case "buyer":
      return {
        ...baseProfile,
        role: "buyer",
        buyerType: (profile.buyer_type as any) || "individual",
        firmName: profile.display_name || undefined,
        firmLogo: profile.avatar_url || undefined,
        investmentRange: {
          min: profile.investment_min || 0,
          max: profile.investment_max || 0,
        },
        preferredIndustries: Array.isArray(profile.preferred_industries) ? profile.preferred_industries as string[] : [],
        preferredLocations: [],
        experience: profile.bio || "",
        privateInfo: {
          financingPreference: "cash",
          preApprovalAmount: 0,
          timeline: "",
          dueDiligenceProcess: "",
        },
        savedBusinesses: [],
        savedSearches: [],
        ndaRequests: [],
      };

    case "franchisor":
      const support = profile.support as any;
      return {
        ...baseProfile,
        role: "franchisor",
        brandName: profile.display_name || "Brand",
        brandLogo: profile.avatar_url || undefined,
        industry: profile.industry || "General",
        yearFounded: profile.founded_year || new Date().getFullYear(),
        totalOutlets: profile.total_outlets || 0,
        franchiseFee: profile.franchise_fee || 0,
        royaltyPercentage: profile.royalty_percentage || 0,
        investmentRange: {
          min: profile.investment_min || 0,
          max: profile.investment_max || 0,
        },
        publicInfo: {
          brandStory: profile.bio || "",
          keyDifferentiators: [],
          supportProvided: support?.training ? [support.training, support.marketing, support.operations] : [],
          territoryAvailability: [],
        },
        privateInfo: {
          franchiseKit: "",
          roiCaseStudies: [],
          legalDocuments: [],
          financialPerformance: {
            averageUnitRevenue: 0,
            averageUnitProfit: 0,
            breakEvenTime: 0,
          },
          franchiseeRequirements: [],
        },
        franchiseListings: [],
        leads: 0,
        activeNegotiations: 0,
      };

    case "franchisee":
      return {
        ...baseProfile,
        role: "franchisee",
        preferredIndustries: Array.isArray(profile.preferred_industries) ? profile.preferred_industries as string[] : [],
        preferredTerritories: [],
        investmentBudget: {
          min: profile.investment_min || 0,
          max: profile.investment_max || 0,
        },
        experience: {
          businessExperience: profile.bio || "",
          franchiseExperience: "",
          industryExperience: "",
        },
        timeline: "",
        savedFranchises: [],
        applications: [],
        comparisonMatrix: [],
      };

    case "advisor":
      return {
        ...baseProfile,
        role: "advisor",
        firmName: profile.display_name || "Advisory Firm",
        firmLogo: profile.avatar_url || undefined,
        licenseNumber: "",
        services: [],
        specialization: [],
        coverageRegions: [],
        experience: 0,
        credentials: [],
        professionalInfo: {
          successRate: 0,
          averageDealSize: 0,
          totalDealsCompleted: 0,
          clientTestimonials: [],
        },
        managedListings: [],
        activeClients: 0,
        commissionStructure: "",
      };

    case "broker":
      // Map broker to advisor for legacy compatibility
      return {
        ...baseProfile,
        role: "advisor",
        firmName: profile.display_name || "Brokerage Firm",
        firmLogo: profile.avatar_url || undefined,
        licenseNumber: "",
        services: [],
        specialization: [],
        coverageRegions: [],
        experience: 0,
        credentials: [],
        professionalInfo: {
          successRate: 0,
          averageDealSize: 0,
          totalDealsCompleted: 0,
          clientTestimonials: [],
        },
        managedListings: [],
        activeClients: 0,
        commissionStructure: "",
      };

    case "admin":
      // Map admin to advisor for legacy compatibility
      return {
        ...baseProfile,
        role: "advisor",
        firmName: profile.display_name || "Admin",
        firmLogo: profile.avatar_url || undefined,
        licenseNumber: "",
        services: [],
        specialization: [],
        coverageRegions: [],
        experience: 0,
        credentials: [],
        professionalInfo: {
          successRate: 0,
          averageDealSize: 0,
          totalDealsCompleted: 0,
          clientTestimonials: [],
        },
        managedListings: [],
        activeClients: 0,
        commissionStructure: "",
      };

    default:
      throw new Error(`Unsupported role: ${profile.role}`);
  }
}

/**
 * Type guard to check if a profile is from Supabase
 */
export function isSupabaseProfile(profile: any): profile is SupabaseProfile {
  return profile && 'created_at' in profile && 'updated_at' in profile;
}
