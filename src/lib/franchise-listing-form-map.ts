import type { FranchiseListingFormValues } from '@/polymet/data/franchise-listing-data';
import { normalizeStoreFormats } from '@/lib/store-formats';
import type { Franchise } from '@/types/listings';

function asStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return [];
}

function mediaFromUrl(url: string | undefined, name: string, type: string) {
  if (!url) return [];
  return [
    {
      id: url,
      name,
      url,
      type,
      size: 0,
    },
  ];
}

export function mapFranchiseToListingForm(
  franchise: Franchise
): Partial<FranchiseListingFormValues> {
  const brandName = franchise.brandName || franchise.brand_name || '';
  const industry = franchise.industry ? [franchise.industry] : [];
  const formats = normalizeStoreFormats(franchise.store_formats || franchise.storeFormats);
  const operating = asStringArray(
    franchise.operating_locations || franchise.operatingLocations
  );
  const logo = franchise.logo_url || franchise.logo;
  const images = asStringArray(franchise.images);
  const docs = Array.isArray(franchise.documents) ? franchise.documents : [];
  const fdd = docs
    .map((doc) => {
      if (typeof doc === 'string') {
        return { id: doc, name: 'FDD', url: doc, type: 'application/pdf', size: 0 };
      }
      const record = doc as { url?: string; name?: string; type?: string };
      if (!record.url) return null;
      return {
        id: record.url,
        name: record.name || 'Document',
        url: record.url,
        type: record.type || 'application/pdf',
        size: 0,
      };
    })
    .filter(Boolean) as FranchiseListingFormValues['media']['franchiseDisclosureDocument'];

  return {
    brandOverview: {
      brandName,
      tagline: franchise.tagline || `${brandName} franchise`,
      industry,
      subcategory: industry,
      businessModel: 'traditional',
      yearEstablished: franchise.establishedYear || franchise.established_year || new Date().getFullYear(),
      totalOutlets: franchise.total_outlets || franchise.outlets || 1,
      companyOutlets: franchise.company_owned_outlets || 0,
      franchiseOutlets: franchise.franchise_outlets || 0,
      territories: operating.length ? operating : [franchise.headquarters_state || 'India'].filter(Boolean),
      website: franchise.website,
    },
    description: {
      brandDescription: franchise.description || franchise.brand_story || '',
      uniqueSellingPoints: asStringArray(franchise.highlights),
      targetMarket: franchise.target_market,
      mission: franchise.mission,
      founderBio: franchise.founder_bio,
    },
    investment: {
      franchiseFee: franchise.franchise_fee || franchise.franchiseFee || 1,
      totalInvestment: {
        min: franchise.total_investment_min || franchise.investmentMin || 1,
        max: franchise.total_investment_max || franchise.investmentMax || 1,
      },
      liquidCapitalRequired: franchise.minimum_liquid_capital || 0,
      royaltyStructure: {
        type: 'fixed',
        baseTiers: [
          {
            id: 'base',
            minRevenue: 0,
            percentage: franchise.royalty_percentage || franchise.royaltyPercentage || 0,
          },
        ],
      },
      marketingFee: {
        type: 'percentage',
        value: franchise.marketing_fee_percentage || 0,
      },
      investmentBreakdown: [],
      breakEvenPeriod: franchise.payback_period_months || 12,
      averageROI: franchise.expected_roi_percentage || 0,
      financingOptions: [],
      storeFormats: formats.length
        ? formats.map((format) => ({
            id: format.id,
            name: format.name,
            minSqft: format.minSqft,
            maxSqft: format.maxSqft,
            investmentMin: format.investmentMin || 1,
            investmentMax: format.investmentMax || format.investmentMin || 1,
            description: format.description,
          }))
        : [
            {
              id: 'standard',
              name: 'Standard',
              minSqft: franchise.min_area_sqft || 0,
              maxSqft: franchise.max_area_sqft || 0,
              investmentMin: franchise.total_investment_min || 1,
              investmentMax: franchise.total_investment_max || 1,
            },
          ],
    },
    support: {
      initialTrainingDuration: franchise.training_duration_days || 1,
      ongoingSupport: asStringArray(franchise.support_provided),
      marketingSupport: franchise.marketing_support ? ['Launch campaign'] : [],
      operationalSupport: [],
      technologySupport: [],
      qualityAssurance: 'Quality process documented with the listing.',
    },
    territory: {
      selectedTerritories: (operating.length ? operating : [franchise.headquarters_state || 'India'])
        .filter(Boolean)
        .map((name) => ({
          id: name,
          type: 'state' as const,
          name,
          isAvailable: true,
          isProtected: false,
        })),
      protectedTerritoryEnabled: false,
      territorySize: 'city',
      populationRequirement: 0,
      territoryAvailability: asStringArray(franchise.preferred_cities).join('\n'),
    },
    franchiseeProfile: {
      minimumNetWorth: franchise.minimum_net_worth,
      experienceRequired: franchise.experience_required,
      preferredCities: asStringArray(franchise.preferred_cities).join(', '),
    },
    media: {
      brandLogo: mediaFromUrl(logo, 'logo', 'image/*'),
      outletPhotos: images.map((url, index) => ({
        id: url,
        name: `Outlet ${index + 1}`,
        url,
        type: 'image/*',
        size: 0,
      })),
      marketingMaterials: [],
      franchiseDisclosureDocument: fdd,
      financialStatements: [],
      videos: [],
    },
    contact: {
      primaryContact: {
        name: franchise.contact_person || '',
        title: 'Franchise development',
        email: franchise.contact_email || franchise.contactEmail || '',
        phone: franchise.contact_phone || franchise.contactPhone || '',
      },
      companyAddress: {
        street: franchise.headquarters_city || '',
        city: franchise.headquarters_city || '',
        state: franchise.headquarters_state || '',
        zipCode: '000000',
        country: franchise.headquarters_country || 'India',
      },
      legalStructure: 'Private Limited',
      registrationNumber: 'PENDING',
      franchiseRegistration: '',
    },
    publishing: {
      listingTitle: `${brandName} franchise`,
      visibility: 'public',
      featuredListing: false,
      urgentListing: false,
      contactPreferences: {
        allowDirectContact: true,
        requireNDA: false,
        screeningQuestions: [],
      },
      termsAccepted: true,
      verificationConsent: true,
    },
  };
}
