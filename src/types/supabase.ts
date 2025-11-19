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
