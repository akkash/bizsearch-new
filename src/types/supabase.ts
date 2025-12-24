export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          role: 'seller' | 'buyer' | 'franchisor' | 'franchisee' | 'advisor' | 'broker' | 'admin'
          avatar_url: string | null
          bio: string | null
          phone: string | null
          location: string | null
          city: string | null
          state: string | null
          country: string | null
          website: string | null
          linkedin_url: string | null
          verified: boolean
          verification_level: number
          created_at: string
          updated_at: string
          // Seller specific fields
          founded_year: number | null
          employees: number | null
          industry: string | null
          key_products: Json | null
          asking_price: number | null
          // Buyer specific fields
          buyer_type: string | null
          investment_min: number | null
          investment_max: number | null
          preferred_industries: Json | null
          investment_criteria: string | null
          // Franchisor specific fields
          total_outlets: number | null
          royalty_percentage: number | null
          franchise_fee: number | null
          support: Json | null
          phone_verified: boolean
          phone_verified_at: string | null
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          role: 'seller' | 'buyer' | 'franchisor' | 'franchisee' | 'advisor' | 'broker' | 'admin'
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          location?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          website?: string | null
          linkedin_url?: string | null
          verified?: boolean
          verification_level?: number
          created_at?: string
          updated_at?: string
          founded_year?: number | null
          employees?: number | null
          industry?: string | null
          key_products?: Json | null
          asking_price?: number | null
          buyer_type?: string | null
          investment_min?: number | null
          investment_max?: number | null
          preferred_industries?: Json | null
          investment_criteria?: string | null
          total_outlets?: number | null
          royalty_percentage?: number | null
          franchise_fee?: number | null
          support?: Json | null
          phone_verified?: boolean
          phone_verified_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          role?: 'seller' | 'buyer' | 'franchisor' | 'franchisee' | 'advisor' | 'broker' | 'admin'
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          location?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          website?: string | null
          linkedin_url?: string | null
          verified?: boolean
          verification_level?: number
          created_at?: string
          updated_at?: string
          founded_year?: number | null
          employees?: number | null
          industry?: string | null
          key_products?: Json | null
          asking_price?: number | null
          buyer_type?: string | null
          investment_min?: number | null
          investment_max?: number | null
          preferred_industries?: Json | null
          investment_criteria?: string | null
          total_outlets?: number | null
          royalty_percentage?: number | null
          franchise_fee?: number | null
          support?: Json | null
          phone_verified?: boolean
          phone_verified_at?: string | null
        }
      }
      verification_documents: {
        Row: {
          id: string
          profile_id: string
          document_type: 'identity' | 'business' | 'financial' | 'legal'
          file_name: string
          file_url: string
          status: 'pending' | 'verified' | 'rejected'
          verified_at: string | null
          verified_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          document_type: 'identity' | 'business' | 'financial' | 'legal'
          file_name: string
          file_url: string
          status?: 'pending' | 'verified' | 'rejected'
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          document_type?: 'identity' | 'business' | 'financial' | 'legal'
          file_name?: string
          file_url?: string
          status?: 'pending' | 'verified' | 'rejected'
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          profile_id: string
          action: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          action: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      profile_roles: {
        Row: {
          id: string
          profile_id: string
          role: 'seller' | 'buyer' | 'franchisor' | 'franchisee' | 'advisor' | 'broker' | 'admin'
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          role: 'seller' | 'buyer' | 'franchisor' | 'franchisee' | 'advisor' | 'broker' | 'admin'
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          role?: 'seller' | 'buyer' | 'franchisor' | 'franchisee' | 'advisor' | 'broker' | 'admin'
          is_primary?: boolean
          created_at?: string
        }
      }
      seller_details: {
        Row: {
          profile_id: string
          company_name: string | null
          company_logo: string | null
          founded_year: number | null
          employees: number | null
          industry: string | null
          business_type: string | null
          key_products: Json | null
          asking_price: number | null
          monthly_revenue: number | null
          annual_revenue: number | null
          net_profit: number | null
          reason_for_selling: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          company_name?: string | null
          company_logo?: string | null
          founded_year?: number | null
          employees?: number | null
          industry?: string | null
          business_type?: string | null
          key_products?: Json | null
          asking_price?: number | null
          monthly_revenue?: number | null
          annual_revenue?: number | null
          net_profit?: number | null
          reason_for_selling?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          profile_id?: string
          company_name?: string | null
          company_logo?: string | null
          founded_year?: number | null
          employees?: number | null
          industry?: string | null
          business_type?: string | null
          key_products?: Json | null
          asking_price?: number | null
          monthly_revenue?: number | null
          annual_revenue?: number | null
          net_profit?: number | null
          reason_for_selling?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      buyer_details: {
        Row: {
          profile_id: string
          buyer_type: string | null
          firm_name: string | null
          firm_logo: string | null
          investment_min: number | null
          investment_max: number | null
          preferred_industries: Json | null
          preferred_locations: Json | null
          investment_criteria: string | null
          financing_preference: string | null
          timeline: string | null
          experience: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          buyer_type?: string | null
          firm_name?: string | null
          firm_logo?: string | null
          investment_min?: number | null
          investment_max?: number | null
          preferred_industries?: Json | null
          preferred_locations?: Json | null
          investment_criteria?: string | null
          financing_preference?: string | null
          timeline?: string | null
          experience?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          profile_id?: string
          buyer_type?: string | null
          firm_name?: string | null
          firm_logo?: string | null
          investment_min?: number | null
          investment_max?: number | null
          preferred_industries?: Json | null
          preferred_locations?: Json | null
          investment_criteria?: string | null
          financing_preference?: string | null
          timeline?: string | null
          experience?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      franchisor_details: {
        Row: {
          profile_id: string
          brand_name: string | null
          brand_logo: string | null
          industry: string | null
          year_founded: number | null
          total_outlets: number | null
          franchise_fee: number | null
          royalty_percentage: number | null
          investment_min: number | null
          investment_max: number | null
          brand_story: string | null
          key_differentiators: Json | null
          support_provided: Json | null
          territory_availability: Json | null
          franchisee_requirements: Json | null
          avg_unit_revenue: number | null
          avg_unit_profit: number | null
          break_even_months: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          brand_name?: string | null
          brand_logo?: string | null
          industry?: string | null
          year_founded?: number | null
          total_outlets?: number | null
          franchise_fee?: number | null
          royalty_percentage?: number | null
          investment_min?: number | null
          investment_max?: number | null
          brand_story?: string | null
          key_differentiators?: Json | null
          support_provided?: Json | null
          territory_availability?: Json | null
          franchisee_requirements?: Json | null
          avg_unit_revenue?: number | null
          avg_unit_profit?: number | null
          break_even_months?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          profile_id?: string
          brand_name?: string | null
          brand_logo?: string | null
          industry?: string | null
          year_founded?: number | null
          total_outlets?: number | null
          franchise_fee?: number | null
          royalty_percentage?: number | null
          investment_min?: number | null
          investment_max?: number | null
          brand_story?: string | null
          key_differentiators?: Json | null
          support_provided?: Json | null
          territory_availability?: Json | null
          franchisee_requirements?: Json | null
          avg_unit_revenue?: number | null
          avg_unit_profit?: number | null
          break_even_months?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      franchisee_details: {
        Row: {
          profile_id: string
          preferred_industries: Json | null
          preferred_territories: Json | null
          investment_budget_min: number | null
          investment_budget_max: number | null
          business_experience: string | null
          franchise_experience: string | null
          industry_experience: string | null
          timeline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          preferred_industries?: Json | null
          preferred_territories?: Json | null
          investment_budget_min?: number | null
          investment_budget_max?: number | null
          business_experience?: string | null
          franchise_experience?: string | null
          industry_experience?: string | null
          timeline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          profile_id?: string
          preferred_industries?: Json | null
          preferred_territories?: Json | null
          investment_budget_min?: number | null
          investment_budget_max?: number | null
          business_experience?: string | null
          franchise_experience?: string | null
          industry_experience?: string | null
          timeline?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      advisor_details: {
        Row: {
          profile_id: string
          firm_name: string | null
          firm_logo: string | null
          license_number: string | null
          services: Json | null
          specialization: Json | null
          coverage_regions: Json | null
          years_experience: number | null
          credentials: Json | null
          success_rate: number | null
          avg_deal_size: number | null
          total_deals_completed: number | null
          commission_structure: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          firm_name?: string | null
          firm_logo?: string | null
          license_number?: string | null
          services?: Json | null
          specialization?: Json | null
          coverage_regions?: Json | null
          years_experience?: number | null
          credentials?: Json | null
          success_rate?: number | null
          avg_deal_size?: number | null
          total_deals_completed?: number | null
          commission_structure?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          profile_id?: string
          firm_name?: string | null
          firm_logo?: string | null
          license_number?: string | null
          services?: Json | null
          specialization?: Json | null
          coverage_regions?: Json | null
          years_experience?: number | null
          credentials?: Json | null
          success_rate?: number | null
          avg_deal_size?: number | null
          total_deals_completed?: number | null
          commission_structure?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'seller' | 'buyer' | 'franchisor' | 'franchisee' | 'advisor' | 'broker' | 'admin'
      verification_status: 'pending' | 'verified' | 'rejected'
      document_type: 'identity' | 'business' | 'financial' | 'legal'
    }
  }
}
