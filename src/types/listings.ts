export interface Business {
    id: string;
    slug?: string;
    seller_id?: string;
    owner_id?: string;
    name: string;
    industry: string;
    location: string;
    city: string;
    state: string;
    priceRange?: string;
    price: number;
    revenueRange?: string;
    revenue?: number;
    establishedYear?: number;
    established_year?: number;
    employees?: number;
    employee_count?: number;
    businessType?: string;
    business_type?: string;
    description?: string;
    highlights?: string[] | any;
    badges?: string[] | any;
    images?: string[] | any;
    logo?: string;
    broker_name?: string;
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
    verified?: boolean;
    contact?: {
        brokerName?: string;
        phone: string;
        email: string;
    };
    featured?: boolean;
    trending?: boolean;
    status?: string;
    createdAt?: string;
    created_at?: string;
    // New verification system fields
    verified_at?: string;
    verification_status?: 'verified' | 'pending' | 'unverified' | 'rejected';
    data_completeness_score?: number;
    last_activity_at?: string;
}

export interface Franchise {
    id: string;
    slug?: string;
    owner_id?: string;
    franchisor_id?: string;
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
    status?: string;
    createdAt?: string;
    created_at?: string;
    // New verification system fields
    verified_at?: string;
    verification_status?: 'verified' | 'pending' | 'unverified' | 'rejected';
    data_completeness_score?: number;
    last_activity_at?: string;
}
