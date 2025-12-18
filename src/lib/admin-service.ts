import { supabase } from './supabase';

// Types
export interface AdminUser {
    id: string;
    email: string;
    display_name: string | null;
    role: string;
    avatar_url: string | null;
    verified: boolean;
    created_at: string;
    updated_at: string;
    city: string | null;
    state: string | null;
    phone: string | null;
    is_banned?: boolean;
}

export interface AdminListing {
    id: string;
    type: 'business' | 'franchise';
    name: string;
    status: string;
    industry: string;
    created_at: string;
    owner: {
        id: string;
        display_name: string;
        email: string;
    };
}

export interface AdminDocument {
    id: string;
    profile_id: string;
    document_type: string;
    file_name: string;
    file_url: string;
    status: 'pending' | 'verified' | 'rejected';
    created_at: string;
    profile: {
        display_name: string;
        email: string;
    };
}

export interface PlatformStats {
    totalUsers: number;
    totalBusinesses: number;
    totalFranchises: number;
    pendingListings: number;
    pendingDocuments: number;
    newUsersThisWeek: number;
    newListingsThisWeek: number;
}

export interface ActivityLog {
    id: string;
    profile_id: string;
    action: string;
    entity_type: string | null;
    entity_id: string | null;
    metadata: any;
    created_at: string;
    profile?: {
        display_name: string;
        email: string;
    };
}

export interface UserFilters {
    search?: string;
    role?: string;
    verified?: boolean;
    limit?: number;
    offset?: number;
}

export interface ListingFilters {
    status?: 'pending_review' | 'active' | 'rejected' | 'draft' | 'all';
    type?: 'business' | 'franchise' | 'all';
    search?: string;
    limit?: number;
    offset?: number;
}

export class AdminService {
    /**
     * Get all users with filters
     */
    static async getUsers(filters?: UserFilters): Promise<AdminUser[]> {
        let query = supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.search) {
            query = query.or(`display_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }

        if (filters?.role && filters.role !== 'all') {
            query = query.eq('role', filters.role);
        }

        if (filters?.verified !== undefined) {
            query = query.eq('verified', filters.verified);
        }

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        if (filters?.offset) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching users:', error);
            throw error;
        }

        return data || [];
    }

    /**
     * Get user by ID with their listings
     */
    static async getUserById(userId: string): Promise<AdminUser | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user:', error);
            return null;
        }

        return data;
    }

    /**
     * Get user's businesses
     */
    static async getUserBusinesses(userId: string) {
        const { data, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('seller_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user businesses:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Get user's franchises
     */
    static async getUserFranchises(userId: string) {
        const { data, error } = await supabase
            .from('franchises')
            .select('*')
            .eq('franchisor_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user franchises:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Update user profile (admin action)
     */
    static async updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating user:', error);
            throw error;
        }

        return data;
    }

    /**
     * Get pending listings (businesses and franchises)
     */
    static async getPendingListings(filters?: ListingFilters): Promise<AdminListing[]> {
        const listings: AdminListing[] = [];
        const status = filters?.status === 'all' ? undefined : (filters?.status || 'pending_review');

        // Fetch businesses
        if (!filters?.type || filters.type === 'all' || filters.type === 'business') {
            let businessQuery = supabase
                .from('businesses')
                .select('id, name, status, industry, created_at, seller_id, profiles!seller_id(id, display_name, email)')
                .order('created_at', { ascending: false });

            if (status) {
                businessQuery = businessQuery.eq('status', status);
            }

            if (filters?.limit) {
                businessQuery = businessQuery.limit(filters.limit);
            }

            const { data: businesses, error: bizError } = await businessQuery;

            if (!bizError && businesses) {
                businesses.forEach((biz: any) => {
                    listings.push({
                        id: biz.id,
                        type: 'business',
                        name: biz.name,
                        status: biz.status,
                        industry: biz.industry,
                        created_at: biz.created_at,
                        owner: {
                            id: biz.profiles?.id || biz.seller_id,
                            display_name: biz.profiles?.display_name || 'Unknown',
                            email: biz.profiles?.email || '',
                        },
                    });
                });
            }
        }

        // Fetch franchises
        if (!filters?.type || filters.type === 'all' || filters.type === 'franchise') {
            let franchiseQuery = supabase
                .from('franchises')
                .select('id, brand_name, status, industry, created_at, franchisor_id, profiles!franchisor_id(id, display_name, email)')
                .order('created_at', { ascending: false });

            if (status) {
                franchiseQuery = franchiseQuery.eq('status', status);
            }

            if (filters?.limit) {
                franchiseQuery = franchiseQuery.limit(filters.limit);
            }

            const { data: franchises, error: franError } = await franchiseQuery;

            if (!franError && franchises) {
                franchises.forEach((fran: any) => {
                    listings.push({
                        id: fran.id,
                        type: 'franchise',
                        name: fran.brand_name,
                        status: fran.status,
                        industry: fran.industry,
                        created_at: fran.created_at,
                        owner: {
                            id: fran.profiles?.id || fran.franchisor_id,
                            display_name: fran.profiles?.display_name || 'Unknown',
                            email: fran.profiles?.email || '',
                        },
                    });
                });
            }
        }

        // Sort by created_at
        listings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return listings;
    }

    /**
     * Approve a listing
     */
    static async approveListing(listingId: string, type: 'business' | 'franchise'): Promise<boolean> {
        const table = type === 'business' ? 'businesses' : 'franchises';

        const { error } = await supabase
            .from(table)
            .update({ status: 'active', published_at: new Date().toISOString() })
            .eq('id', listingId);

        if (error) {
            console.error('Error approving listing:', error);
            throw error;
        }

        return true;
    }

    /**
     * Reject a listing
     */
    static async rejectListing(listingId: string, type: 'business' | 'franchise', reason?: string): Promise<boolean> {
        const table = type === 'business' ? 'businesses' : 'franchises';

        const { error } = await supabase
            .from(table)
            .update({
                status: 'rejected',
                rejection_reason: reason,
            })
            .eq('id', listingId);

        if (error) {
            console.error('Error rejecting listing:', error);
            throw error;
        }

        return true;
    }

    /**
     * Get pending verification documents
     */
    static async getPendingDocuments(): Promise<AdminDocument[]> {
        const { data, error } = await supabase
            .from('verification_documents')
            .select('*, profile:profiles!profile_id(display_name, email)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching documents:', error);
            return [];
        }

        return (data || []).map((doc: any) => ({
            ...doc,
            profile: doc.profile || { display_name: 'Unknown', email: '' },
        }));
    }

    /**
     * Approve a document
     */
    static async approveDocument(documentId: string, adminId: string): Promise<boolean> {
        const { error } = await supabase
            .from('verification_documents')
            .update({
                status: 'verified',
                verified_at: new Date().toISOString(),
                verified_by: adminId,
            })
            .eq('id', documentId);

        if (error) {
            console.error('Error approving document:', error);
            throw error;
        }

        return true;
    }

    /**
     * Reject a document
     */
    static async rejectDocument(documentId: string, adminId: string, reason?: string): Promise<boolean> {
        const { error } = await supabase
            .from('verification_documents')
            .update({
                status: 'rejected',
                verified_at: new Date().toISOString(),
                verified_by: adminId,
            })
            .eq('id', documentId);

        if (error) {
            console.error('Error rejecting document:', error);
            throw error;
        }

        return true;
    }

    /**
     * Get platform statistics
     */
    static async getPlatformStats(): Promise<PlatformStats> {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Parallel queries for stats
        const [
            usersResult,
            businessesResult,
            franchisesResult,
            pendingBusinessesResult,
            pendingFranchisesResult,
            pendingDocsResult,
            newUsersResult,
            newBusinessesResult,
            newFranchisesResult,
        ] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
            supabase.from('businesses').select('id', { count: 'exact', head: true }),
            supabase.from('franchises').select('id', { count: 'exact', head: true }),
            supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
            supabase.from('franchises').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
            supabase.from('verification_documents').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', oneWeekAgo.toISOString()),
            supabase.from('businesses').select('id', { count: 'exact', head: true }).gte('created_at', oneWeekAgo.toISOString()),
            supabase.from('franchises').select('id', { count: 'exact', head: true }).gte('created_at', oneWeekAgo.toISOString()),
        ]);

        return {
            totalUsers: usersResult.count || 0,
            totalBusinesses: businessesResult.count || 0,
            totalFranchises: franchisesResult.count || 0,
            pendingListings: (pendingBusinessesResult.count || 0) + (pendingFranchisesResult.count || 0),
            pendingDocuments: pendingDocsResult.count || 0,
            newUsersThisWeek: newUsersResult.count || 0,
            newListingsThisWeek: (newBusinessesResult.count || 0) + (newFranchisesResult.count || 0),
        };
    }

    /**
     * Get activity logs
     */
    static async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*, profile:profiles!profile_id(display_name, email)')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching activity logs:', error);
            return [];
        }

        return (data || []).map((log: any) => ({
            ...log,
            profile: log.profile || { display_name: 'System', email: '' },
        }));
    }

    /**
     * Check if current user is admin
     */
    static async isAdmin(userId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (error || !data) {
            return false;
        }

        return data.role === 'admin';
    }
}
