import { supabase } from './supabase';

// Types
export interface BusinessInquiry {
    id: string;
    business_id: string;
    buyer_id: string;
    message: string;
    status: 'pending' | 'responded' | 'approved' | 'rejected';
    nda_signed: boolean;
    created_at: string;
    updated_at: string;
    buyer?: {
        id: string;
        display_name: string;
        email: string;
        avatar_url?: string;
    };
    business?: {
        id: string;
        name: string;
    };
}

export interface NDAgreement {
    id: string;
    business_id: string;
    buyer_id: string;
    status: 'sent' | 'viewed' | 'signed' | 'expired';
    sent_at: string;
    viewed_at?: string;
    signed_at?: string;
    expires_at: string;
    custom_terms?: string;
    signature_data?: {
        fullName: string;
        email: string;
        company?: string;
        signedAt: string;
    };
    buyer?: {
        id: string;
        display_name: string;
        email: string;
    };
    business?: {
        id: string;
        name: string;
    };
}

export interface DealRoomDocument {
    id: string;
    business_id: string;
    name: string;
    file_url: string;
    category: 'financial' | 'legal' | 'operational' | 'overview';
    size_bytes?: number;
    access_level: 'all' | 'nda_signed';
    uploaded_by: string;
    uploaded_at: string;
}

export interface DealRoomActivity {
    id: string;
    business_id: string;
    user_id: string;
    action: string;
    document_id?: string;
    metadata?: Record<string, any>;
    created_at: string;
    user?: {
        display_name: string;
        email: string;
    };
    document?: {
        name: string;
    };
}

export interface ListingAnalytics {
    views: number;
    saves: number;
    inquiries: number;
    shares: number;
    viewsByDay: { date: string; count: number }[];
    topLocations: { location: string; count: number }[];
}

export class DealRoomService {
    // ============ INQUIRIES ============

    static async getInquiriesForBusiness(businessId: string): Promise<BusinessInquiry[]> {
        const { data, error } = await supabase
            .from('business_inquiries')
            .select(`
        *,
        buyer:profiles!buyer_id(id, display_name, email, avatar_url),
        business:businesses!business_id(id, name)
      `)
            .eq('business_id', businessId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    static async getInquiriesForSeller(sellerId: string): Promise<BusinessInquiry[]> {
        // Get all businesses owned by this seller first
        const { data: businesses } = await supabase
            .from('businesses')
            .select('id')
            .eq('seller_id', sellerId);

        if (!businesses || businesses.length === 0) return [];

        const businessIds = businesses.map(b => b.id);

        const { data, error } = await supabase
            .from('business_inquiries')
            .select(`
        *,
        buyer:profiles!buyer_id(id, display_name, email, avatar_url),
        business:businesses!business_id(id, name)
      `)
            .in('business_id', businessIds)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    static async updateInquiryStatus(
        inquiryId: string,
        status: BusinessInquiry['status']
    ): Promise<void> {
        const { error } = await supabase
            .from('business_inquiries')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', inquiryId);

        if (error) throw error;
    }

    static async createInquiry(
        businessId: string,
        buyerId: string,
        message: string
    ): Promise<BusinessInquiry> {
        const { data, error } = await supabase
            .from('business_inquiries')
            .insert({ business_id: businessId, buyer_id: buyerId, message })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ============ NDAs ============

    static async getNDAsForBusiness(businessId: string): Promise<NDAgreement[]> {
        const { data, error } = await supabase
            .from('nda_agreements')
            .select(`
        *,
        buyer:profiles!buyer_id(id, display_name, email)
      `)
            .eq('business_id', businessId)
            .order('sent_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    static async getNDAsForSeller(sellerId: string): Promise<NDAgreement[]> {
        const { data: businesses } = await supabase
            .from('businesses')
            .select('id, name')
            .eq('seller_id', sellerId);

        if (!businesses || businesses.length === 0) return [];

        const businessIds = businesses.map(b => b.id);
        const businessMap = new Map(businesses.map(b => [b.id, b]));

        const { data, error } = await supabase
            .from('nda_agreements')
            .select(`
        *,
        buyer:profiles!buyer_id(id, display_name, email)
      `)
            .in('business_id', businessIds)
            .order('sent_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(nda => ({
            ...nda,
            business: businessMap.get(nda.business_id),
        }));
    }

    static async sendNDA(
        businessId: string,
        buyerId: string,
        customTerms?: string
    ): Promise<NDAgreement> {
        const { data, error } = await supabase
            .from('nda_agreements')
            .insert({
                business_id: businessId,
                buyer_id: buyerId,
                custom_terms: customTerms,
                expires_at: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async signNDA(
        ndaId: string,
        signatureData: NDAgreement['signature_data']
    ): Promise<void> {
        const { error } = await supabase
            .from('nda_agreements')
            .update({
                status: 'signed',
                signed_at: new Date().toISOString(),
                signature_data: signatureData,
            })
            .eq('id', ndaId);

        if (error) throw error;
    }

    static async markNDAViewed(ndaId: string): Promise<void> {
        const { error } = await supabase
            .from('nda_agreements')
            .update({
                status: 'viewed',
                viewed_at: new Date().toISOString(),
            })
            .eq('id', ndaId)
            .eq('status', 'sent'); // Only update if still in 'sent' status

        if (error) throw error;
    }

    static async getNDAForBuyer(businessId: string, buyerId: string): Promise<NDAgreement | null> {
        const { data, error } = await supabase
            .from('nda_agreements')
            .select('*')
            .eq('business_id', businessId)
            .eq('buyer_id', buyerId)
            .single();

        if (error) return null;
        return data;
    }

    // ============ DOCUMENTS ============

    static async getDocumentsForBusiness(businessId: string): Promise<DealRoomDocument[]> {
        const { data, error } = await supabase
            .from('deal_room_documents')
            .select('*')
            .eq('business_id', businessId)
            .order('uploaded_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    static async uploadDocument(
        businessId: string,
        uploaderId: string,
        doc: Omit<DealRoomDocument, 'id' | 'business_id' | 'uploaded_by' | 'uploaded_at'>
    ): Promise<DealRoomDocument> {
        const { data, error } = await supabase
            .from('deal_room_documents')
            .insert({
                business_id: businessId,
                uploaded_by: uploaderId,
                ...doc,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updateDocument(
        docId: string,
        updates: Partial<Pick<DealRoomDocument, 'name' | 'category' | 'access_level'>>
    ): Promise<void> {
        const { error } = await supabase
            .from('deal_room_documents')
            .update(updates)
            .eq('id', docId);

        if (error) throw error;
    }

    static async deleteDocument(docId: string): Promise<void> {
        const { error } = await supabase
            .from('deal_room_documents')
            .delete()
            .eq('id', docId);

        if (error) throw error;
    }

    // ============ ACTIVITY ============

    static async logActivity(
        businessId: string,
        userId: string,
        action: string,
        documentId?: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        const { error } = await supabase
            .from('deal_room_activity')
            .insert({
                business_id: businessId,
                user_id: userId,
                action,
                document_id: documentId,
                metadata,
            });

        if (error) console.error('Failed to log activity:', error);
    }

    static async getActivityForBusiness(businessId: string, limit = 50): Promise<DealRoomActivity[]> {
        const { data, error } = await supabase
            .from('deal_room_activity')
            .select(`
        *,
        user:profiles!user_id(display_name, email),
        document:deal_room_documents!document_id(name)
      `)
            .eq('business_id', businessId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    // ============ ANALYTICS ============

    static async getListingAnalytics(
        listingId: string,
        listingType: 'business' | 'franchise'
    ): Promise<ListingAnalytics> {
        const { data, error } = await supabase
            .from('listing_analytics')
            .select('event_type, location, created_at')
            .eq('listing_id', listingId)
            .eq('listing_type', listingType);

        if (error) throw error;

        const events = data || [];

        // Count by event type
        const views = events.filter(e => e.event_type === 'view').length;
        const saves = events.filter(e => e.event_type === 'save').length;
        const inquiries = events.filter(e => e.event_type === 'inquiry').length;
        const shares = events.filter(e => e.event_type === 'share').length;

        // Views by day (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const viewEvents = events.filter(
            e => e.event_type === 'view' && new Date(e.created_at) >= thirtyDaysAgo
        );

        const viewsByDayMap = new Map<string, number>();
        viewEvents.forEach(e => {
            const date = new Date(e.created_at).toISOString().split('T')[0];
            viewsByDayMap.set(date, (viewsByDayMap.get(date) || 0) + 1);
        });

        const viewsByDay = Array.from(viewsByDayMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Top locations
        const locationCounts = new Map<string, number>();
        events.forEach(e => {
            if (e.location) {
                locationCounts.set(e.location, (locationCounts.get(e.location) || 0) + 1);
            }
        });

        const topLocations = Array.from(locationCounts.entries())
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return { views, saves, inquiries, shares, viewsByDay, topLocations };
    }

    static async trackEvent(
        listingId: string,
        listingType: 'business' | 'franchise',
        eventType: 'view' | 'save' | 'inquiry' | 'share',
        userId?: string,
        location?: string
    ): Promise<void> {
        const { error } = await supabase
            .from('listing_analytics')
            .insert({
                listing_id: listingId,
                listing_type: listingType,
                event_type: eventType,
                user_id: userId,
                location,
                session_id: crypto.randomUUID(),
            });

        if (error) console.error('Failed to track event:', error);
    }
}
