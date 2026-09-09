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
    pendingFraudAlerts: number;
    newUsersThisWeek: number;
    newListingsThisWeek: number;
}

export interface AnalyticsTrendPoint {
    date: string;
    users: number;
    businesses: number;
    franchises: number;
    inquiries: number;
}

export interface FraudAlert {
    id: string;
    type: string;
    entity_id: string;
    entity_name: string;
    risk_score: number;
    reason: string;
    status: string;
    created_at: string;
    reviewed_at?: string | null;
}

export interface CmsPage {
    id: string;
    title: string;
    slug: string;
    body: string;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    updated_at: string;
}

export interface PlatformAnnouncement {
    id: string;
    title: string;
    body: string;
    type: 'feature' | 'info' | 'maintenance' | 'alert';
    active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
}

export type PlatformSettingsMap = Record<string, Record<string, unknown>>;

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
    private static async logAction(
        action: string,
        entityType: string,
        entityId: string,
        metadata?: Record<string, unknown>
    ): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from('activity_logs').insert({
            profile_id: user.id,
            user_id: user.id,
            action,
            entity_type: entityType,
            entity_id: entityId,
            metadata: metadata || null,
        });
    }

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

    static async setUserBanned(userId: string, banned: boolean): Promise<void> {
        const { error } = await supabase
            .from('profiles')
            .update({ is_banned: banned })
            .eq('id', userId);

        if (error) {
            console.error('Error updating ban status:', error);
            throw error;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('activity_logs').insert({
                profile_id: user.id,
                user_id: user.id,
                action: banned ? 'user_banned' : 'user_unbanned',
                entity_type: 'profile',
                entity_id: userId,
            });
        }
    }

    static async changeUserRole(userId: string, role: string): Promise<void> {
        const allowed = ['seller', 'buyer', 'franchisor', 'franchisee', 'advisor', 'broker', 'admin'];
        if (!allowed.includes(role)) {
            throw new Error(`Invalid role: ${role}`);
        }

        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', userId);

        if (profileError) {
            console.error('Error changing user role:', profileError);
            throw profileError;
        }

        await supabase
            .from('profile_roles')
            .update({ is_primary: false })
            .eq('profile_id', userId);

        const { error: roleError } = await supabase
            .from('profile_roles')
            .upsert(
                { profile_id: userId, role, is_primary: true },
                { onConflict: 'profile_id,role' }
            );

        if (roleError) {
            console.error('Error updating profile_roles:', roleError);
            throw roleError;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('activity_logs').insert({
                profile_id: user.id,
                user_id: user.id,
                action: 'user_role_changed',
                entity_type: 'profile',
                entity_id: userId,
                metadata: { role },
            });
        }
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

        await this.logAction('listing_approved', type, listingId);
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

        await this.logAction('listing_rejected', type, listingId, { reason });
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
     * Get all verification documents with optional filters
     */
    static async getAllDocuments(filters?: { status?: 'pending' | 'verified' | 'rejected' | 'all' }): Promise<AdminDocument[]> {
        let query = supabase
            .from('verification_documents')
            .select('*, profile:profiles!profile_id(display_name, email)')
            .order('created_at', { ascending: false });

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query;

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
     * Approve a document and update user verification status
     */
    static async approveDocument(documentId: string, adminId: string): Promise<boolean> {
        // Get the document to find the profile_id
        const { data: doc, error: docError } = await supabase
            .from('verification_documents')
            .select('profile_id, document_type')
            .eq('id', documentId)
            .single();

        if (docError || !doc) {
            console.error('Error fetching document:', docError);
            throw new Error('Document not found');
        }

        // Update the document status
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

        // Check if user now has verified documents and update profile
        await this.updateUserVerificationStatus(doc.profile_id);

        return true;
    }

    /**
     * Reject a document with reason
     */
    static async rejectDocument(documentId: string, adminId: string, reason?: string): Promise<boolean> {
        const { error } = await supabase
            .from('verification_documents')
            .update({
                status: 'rejected',
                verified_at: new Date().toISOString(),
                verified_by: adminId,
                rejection_reason: reason || null,
            })
            .eq('id', documentId);

        if (error) {
            console.error('Error rejecting document:', error);
            throw error;
        }

        return true;
    }

    /**
     * Update user's verification status based on their verified documents
     */
    static async updateUserVerificationStatus(profileId: string): Promise<boolean> {
        // Get all verified documents for this user
        const { data: verifiedDocs, error: docsError } = await supabase
            .from('verification_documents')
            .select('document_type')
            .eq('profile_id', profileId)
            .eq('status', 'verified');

        if (docsError) {
            console.error('Error fetching verified docs:', docsError);
            return false;
        }

        const docTypes = (verifiedDocs || []).map(d => d.document_type);
        const hasIdentity = docTypes.includes('identity');
        const hasBusiness = docTypes.includes('business');

        // User is verified if they have at least identity document verified
        const shouldBeVerified = hasIdentity;

        // Update profile verification status
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ verified: shouldBeVerified })
            .eq('id', profileId);

        if (updateError) {
            console.error('Error updating profile verification:', updateError);
            return false;
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
            pendingFraudResult,
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
            supabase.from('fraud_alerts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
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
            pendingFraudAlerts: pendingFraudResult.count || 0,
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
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (!profileError && profile?.role === 'admin') {
            return true;
        }

        const { data: roles, error: rolesError } = await supabase
            .from('profile_roles')
            .select('role')
            .eq('profile_id', userId)
            .eq('role', 'admin');

        if (rolesError) {
            console.error('Admin role check failed:', rolesError);
            return false;
        }

        return (roles?.length ?? 0) > 0;
    }

    static async getPendingFraudAlerts(): Promise<FraudAlert[]> {
        const { data, error } = await supabase
            .from('fraud_alerts')
            .select('*')
            .eq('status', 'pending')
            .order('risk_score', { ascending: false });

        if (error) {
            console.error('Error fetching fraud alerts:', error);
            return [];
        }
        return data || [];
    }

    static async getFraudAlertsResolvedToday(): Promise<number> {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const { count, error } = await supabase
            .from('fraud_alerts')
            .select('id', { count: 'exact', head: true })
            .in('status', ['reviewed', 'dismissed', 'confirmed'])
            .gte('reviewed_at', start.toISOString());

        if (error) return 0;
        return count || 0;
    }

    static async resolveFraudAlert(
        alertId: string,
        status: 'reviewed' | 'dismissed' | 'confirmed'
    ): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
            .from('fraud_alerts')
            .update({
                status,
                reviewed_by: user?.id || null,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', alertId);

        if (error) throw error;
        await this.logAction(`fraud_alert_${status}`, 'fraud_alert', alertId, { status });
    }

    static async getListingById(
        listingId: string,
        type: 'business' | 'franchise'
    ): Promise<Record<string, unknown> | null> {
        const table = type === 'business' ? 'businesses' : 'franchises';
        const ownerCol = type === 'business' ? 'seller_id' : 'franchisor_id';
        const { data, error } = await supabase
            .from(table)
            .select(`*, owner:profiles!${ownerCol}(id, display_name, email)`)
            .eq('id', listingId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching listing:', error);
            return null;
        }
        return data as Record<string, unknown>;
    }

    static async getAnalyticsTrends(days = 14): Promise<AnalyticsTrendPoint[]> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const [users, businesses, franchises, inquiries] = await Promise.all([
            supabase.from('profiles').select('created_at').gte('created_at', since.toISOString()),
            supabase.from('businesses').select('created_at').gte('created_at', since.toISOString()),
            supabase.from('franchises').select('created_at').gte('created_at', since.toISOString()),
            supabase.from('inquiries').select('created_at').gte('created_at', since.toISOString()),
        ]);

        const buckets = new Map<string, AnalyticsTrendPoint>();
        for (let i = 0; i < days; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            const key = d.toISOString().slice(0, 10);
            buckets.set(key, { date: key, users: 0, businesses: 0, franchises: 0, inquiries: 0 });
        }

        const addToBucket = (rows: { created_at: string }[] | null, field: keyof Omit<AnalyticsTrendPoint, 'date'>) => {
            (rows || []).forEach((row) => {
                const key = row.created_at.slice(0, 10);
                const bucket = buckets.get(key);
                if (bucket) bucket[field] += 1;
            });
        };

        addToBucket(users.data, 'users');
        addToBucket(businesses.data, 'businesses');
        addToBucket(franchises.data, 'franchises');
        addToBucket(inquiries.data, 'inquiries');

        return [...buckets.values()];
    }

    static async getSettings(): Promise<PlatformSettingsMap> {
        const { data, error } = await supabase.from('platform_settings').select('key, value');
        if (error) throw error;
        const map: PlatformSettingsMap = {};
        (data || []).forEach((row) => {
            map[row.key] = row.value as Record<string, unknown>;
        });
        return map;
    }

    static async updateSettings(
        key: string,
        value: Record<string, unknown>
    ): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
            .from('platform_settings')
            .upsert({
                key,
                value,
                updated_by: user?.id || null,
                updated_at: new Date().toISOString(),
            });

        if (error) throw error;
        await this.logAction('settings_updated', 'platform_settings', key);
    }

    static async getCmsPages(): Promise<CmsPage[]> {
        const { data, error } = await supabase
            .from('cms_pages')
            .select('*')
            .order('updated_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    static async upsertCmsPage(page: Partial<CmsPage> & { title: string; slug: string }): Promise<CmsPage> {
        const { data: { user } } = await supabase.auth.getUser();
        const payload = {
            ...page,
            updated_by: user?.id || null,
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase
            .from('cms_pages')
            .upsert(payload)
            .select()
            .single();
        if (error) throw error;
        await this.logAction('cms_page_upserted', 'cms_page', data.id);
        return data;
    }

    static async deleteCmsPage(id: string): Promise<void> {
        const { error } = await supabase.from('cms_pages').delete().eq('id', id);
        if (error) throw error;
        await this.logAction('cms_page_deleted', 'cms_page', id);
    }

    static async getAnnouncements(): Promise<PlatformAnnouncement[]> {
        const { data, error } = await supabase
            .from('platform_announcements')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    static async upsertAnnouncement(
        announcement: Partial<PlatformAnnouncement> & { title: string }
    ): Promise<PlatformAnnouncement> {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('platform_announcements')
            .upsert({
                ...announcement,
                updated_by: user?.id || null,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();
        if (error) throw error;
        await this.logAction('announcement_upserted', 'platform_announcement', data.id);
        return data;
    }

    static async deleteAnnouncement(id: string): Promise<void> {
        const { error } = await supabase.from('platform_announcements').delete().eq('id', id);
        if (error) throw error;
        await this.logAction('announcement_deleted', 'platform_announcement', id);
    }
}
