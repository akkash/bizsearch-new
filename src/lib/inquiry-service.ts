import { supabase } from './supabase';
import type { FranchiseInquiry, InquiryPriority, InquiryStatus } from '@/types/franchise-domain';

function mapInquiry(row: Record<string, unknown>, listingName?: string): FranchiseInquiry {
  const sender = row.sender as Record<string, unknown> | null | undefined;
  return {
    id: String(row.id),
    senderId: row.sender_id ? String(row.sender_id) : null,
    recipientId: String(row.recipient_id),
    listingId: String(row.listing_id),
    listingType: row.listing_type as 'business' | 'franchise',
    subject: row.subject ? String(row.subject) : null,
    message: String(row.message),
    contactEmail: String(row.contact_email),
    contactPhone: row.contact_phone ? String(row.contact_phone) : null,
    status: (row.status as InquiryStatus) || 'new',
    priority: (row.priority as InquiryPriority) || 'medium',
    notes: row.notes ? String(row.notes) : null,
    metadata: (row.metadata as Record<string, unknown>) || null,
    createdAt: String(row.created_at),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    listingName,
    sender: sender
      ? {
          displayName: String(sender.display_name || ''),
          email: String(sender.email || ''),
          avatarUrl: sender.avatar_url ? String(sender.avatar_url) : null,
        }
      : undefined,
  };
}

export class InquiryService {
  /** Listing IDs owned by the user (franchises + businesses) */
  private static async getOwnedListingIds(userId: string): Promise<{
    franchiseIds: string[];
    businessIds: string[];
  }> {
    const [{ data: franchises }, { data: businesses }] = await Promise.all([
      supabase.from('franchises').select('id').eq('franchisor_id', userId),
      supabase.from('businesses').select('id').eq('seller_id', userId),
    ]);

    return {
      franchiseIds: franchises?.map((f) => f.id) ?? [],
      businessIds: businesses?.map((b) => b.id) ?? [],
    };
  }

  /** Build OR filter: recipient match OR listing ownership (aligns with migration 028 RLS) */
  private static buildReceivedInquiriesFilter(
    userId: string,
    franchiseIds: string[],
    businessIds: string[]
  ): string {
    const parts = [`recipient_id.eq.${userId}`];

    if (franchiseIds.length) {
      parts.push(
        `and(listing_type.eq.franchise,listing_id.in.(${franchiseIds.join(',')}))`
      );
    }
    if (businessIds.length) {
      parts.push(
        `and(listing_type.eq.business,listing_id.in.(${businessIds.join(',')}))`
      );
    }

    return parts.join(',');
  }

  /** Leads received by the current user (franchisor/seller as recipient or listing owner) */
  static async getReceivedInquiries(userId: string): Promise<FranchiseInquiry[]> {
    const { franchiseIds, businessIds } = await this.getOwnedListingIds(userId);

    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        sender:profiles!inquiries_sender_id_fkey(display_name, email, avatar_url)
      `)
      .or(this.buildReceivedInquiriesFilter(userId, franchiseIds, businessIds))
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = data || [];
    const listingNames = await this.resolveListingNames(rows);

    return rows.map((row) =>
      mapInquiry(row as Record<string, unknown>, listingNames.get(String(row.listing_id)))
    );
  }

  /** Inquiries sent by the current user */
  static async getSentInquiries(userId: string): Promise<FranchiseInquiry[]> {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = data || [];
    const listingNames = await this.resolveListingNames(rows);

    return rows.map((row) =>
      mapInquiry(row as Record<string, unknown>, listingNames.get(String(row.listing_id)))
    );
  }

  static async countReceivedByStatus(userId: string, status?: InquiryStatus): Promise<number> {
    const { franchiseIds, businessIds } = await this.getOwnedListingIds(userId);

    let query = supabase
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .or(this.buildReceivedInquiriesFilter(userId, franchiseIds, businessIds));

    if (status) query = query.eq('status', status);

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  static async updateInquiry(
    inquiryId: string,
    updates: Partial<{ status: InquiryStatus; priority: InquiryPriority; notes: string }>
  ): Promise<void> {
    const { error } = await supabase
      .from('inquiries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', inquiryId);

    if (error) throw error;
  }

  private static async resolveListingNames(
    rows: Array<{ listing_id: string; listing_type: string }>
  ): Promise<Map<string, string>> {
    const names = new Map<string, string>();
    const franchiseIds = [
      ...new Set(rows.filter((r) => r.listing_type === 'franchise').map((r) => r.listing_id)),
    ];
    const businessIds = [
      ...new Set(rows.filter((r) => r.listing_type === 'business').map((r) => r.listing_id)),
    ];

    if (franchiseIds.length) {
      const { data } = await supabase
        .from('franchises')
        .select('id, brand_name')
        .in('id', franchiseIds);
      data?.forEach((f) => names.set(f.id, f.brand_name));
    }

    if (businessIds.length) {
      const { data } = await supabase
        .from('businesses')
        .select('id, name')
        .in('id', businessIds);
      data?.forEach((b) => names.set(b.id, b.name));
    }

    return names;
  }
}
