import { supabase } from './supabase';
import type {
  FranchiseInquiry,
  InquiryPriority,
  InquiryStatus,
  LeadQualification,
} from '@/types/franchise-domain';

function mapInquiry(
  row: Record<string, unknown>,
  listingName?: string,
  linkedApplicationId?: string | null
): FranchiseInquiry {
  const sender = row.sender as Record<string, unknown> | null | undefined;
  const meta = (row.metadata as Record<string, unknown>) || {};

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
    metadata: meta,
    createdAt: String(row.created_at),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    listingName,
    investmentCapacity:
      (row.investment_capacity as string) ||
      (meta.investment_capacity as string) ||
      (meta.budget_range as string) ||
      null,
    preferredLocation:
      (row.preferred_location as string) ||
      (meta.preferred_location as string) ||
      null,
    openingTimeline:
      (row.opening_timeline as string) ||
      (meta.opening_timeline as string) ||
      (meta.timeline as string) ||
      null,
    fundsAvailable:
      (row.funds_available as string) ||
      (meta.funds_available as string) ||
      null,
    relevantExperience:
      (row.relevant_experience as string) ||
      (meta.relevant_experience as string) ||
      null,
    matchScore:
      row.match_score != null
        ? Number(row.match_score)
        : meta.match_score != null
          ? Number(meta.match_score)
          : null,
    linkedApplicationId: linkedApplicationId ?? null,
    selectedStoreFormatId:
      (row.selected_store_format_id as string) ||
      (meta.selected_store_format_id as string) ||
      null,
    selectedStoreFormatName:
      (row.selected_store_format_name as string) ||
      (meta.selected_store_format_name as string) ||
      null,
    selectedStoreFormatSnapshot:
      (row.selected_store_format_snapshot as Record<string, unknown>) ||
      (meta.selected_store_format_snapshot as Record<string, unknown>) ||
      null,
    sender: sender
      ? {
          displayName: String(
            (meta.sender_name as string) || sender.display_name || ''
          ),
          email: String(row.contact_email || ''),
          avatarUrl: sender.avatar_url ? String(sender.avatar_url) : null,
        }
      : {
          displayName: String((meta.sender_name as string) || ''),
          email: String(row.contact_email || ''),
          avatarUrl: null,
        },
  };
}

export interface FranchiseGrowthMetrics {
  qualifiedOpportunities: number;
  newThisWeek: number;
  meetings: number;
  applications: number;
  approved: number;
  territoriesFilled: number;
  pipeline: {
    new: number;
    qualified: number;
    meeting: number;
    application: number;
    approved: number;
  };
  locationDemand: Array<{ location: string; count: number }>;
}

export type CreateInquiryInput = {
  senderId: string;
  listingId: string;
  listingType: 'business' | 'franchise';
  subject: string;
  message: string;
  contactEmail: string;
  contactPhone?: string;
  qualification?: Partial<LeadQualification>;
  selectedStoreFormat?: {
    id: string;
    name: string;
    snapshot?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
};

export class InquiryService {
  private static async resolveListingOwnerId(
    listingId: string,
    listingType: 'business' | 'franchise'
  ): Promise<string> {
    if (listingType === 'franchise') {
      const { data, error } = await supabase
        .from('franchises')
        .select('franchisor_id')
        .eq('id', listingId)
        .maybeSingle();
      if (error) throw error;
      if (!data?.franchisor_id) throw new Error('Franchise listing not found');
      return data.franchisor_id;
    }

    const { data, error } = await supabase
      .from('businesses')
      .select('seller_id')
      .eq('id', listingId)
      .maybeSingle();
    if (error) throw error;
    if (!data?.seller_id) throw new Error('Business listing not found');
    return data.seller_id;
  }

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

  private static buildReceivedInquiriesFilter(
    userId: string,
    franchiseIds: string[],
    businessIds: string[],
    franchiseOnly = false
  ): string {
    const parts = [`recipient_id.eq.${userId}`];

    if (franchiseIds.length) {
      parts.push(
        `and(listing_type.eq.franchise,listing_id.in.(${franchiseIds.join(',')}))`
      );
    }
    if (!franchiseOnly && businessIds.length) {
      parts.push(
        `and(listing_type.eq.business,listing_id.in.(${businessIds.join(',')}))`
      );
    }

    return parts.join(',');
  }

  static async createInquiry(input: CreateInquiryInput): Promise<string> {
    const recipientId = await this.resolveListingOwnerId(
      input.listingId,
      input.listingType
    );

    const q = input.qualification;
    const fmt = input.selectedStoreFormat;

    const row: Record<string, unknown> = {
      sender_id: input.senderId,
      recipient_id: recipientId,
      listing_id: input.listingId,
      listing_type: input.listingType,
      subject: input.subject,
      message: input.message,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone || null,
      status: 'new',
    };

    if (q?.investmentCapacity) row.investment_capacity = q.investmentCapacity;
    if (q?.preferredLocation) row.preferred_location = q.preferredLocation;
    if (q?.openingTimeline) row.opening_timeline = q.openingTimeline;
    if (q?.fundsAvailable) row.funds_available = q.fundsAvailable;
    if (q?.relevantExperience) row.relevant_experience = q.relevantExperience;
    if (fmt?.id) {
      row.selected_store_format_id = fmt.id;
      row.selected_store_format_name = fmt.name;
      row.selected_store_format_snapshot = fmt.snapshot || null;
    }

    const { data, error } = await supabase
      .from('inquiries')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('You already have an open enquiry for this listing.');
      }
      // Fallback without optional qualification columns if migration not yet applied
      if (
        error.message?.includes('investment_capacity') ||
        error.message?.includes('selected_store_format') ||
        error.code === 'PGRST204'
      ) {
        const { data: fallback, error: err2 } = await supabase
          .from('inquiries')
          .insert({
            sender_id: input.senderId,
            recipient_id: recipientId,
            listing_id: input.listingId,
            listing_type: input.listingType,
            subject: input.subject,
            message: input.message,
            contact_email: input.contactEmail,
            contact_phone: input.contactPhone || null,
            status: 'new',
          })
          .select('id')
          .single();
        if (err2) throw err2;
        return String(fallback.id);
      }
      throw error;
    }

    return String(data.id);
  }

  /** Franchise pipeline leads for franchisor */
  static async getFranchisePipeline(userId: string): Promise<FranchiseInquiry[]> {
    const { franchiseIds } = await this.getOwnedListingIds(userId);
    if (!franchiseIds.length) {
      // Still return recipient-matched franchise inquiries
    }

    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        sender:public_profiles!inquiries_sender_id_fkey(display_name, avatar_url)
      `)
      .or(this.buildReceivedInquiriesFilter(userId, franchiseIds, [], true))
      .eq('listing_type', 'franchise')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = data || [];
    const listingNames = await this.resolveListingNames(rows);
    const appMap = await this.resolveLinkedApplications(rows.map((r) => String(r.id)));

    return rows.map((row) =>
      mapInquiry(
        row as Record<string, unknown>,
        listingNames.get(String(row.listing_id)),
        appMap.get(String(row.id)) || null
      )
    );
  }

  static async getReceivedInquiries(userId: string): Promise<FranchiseInquiry[]> {
    const { franchiseIds, businessIds } = await this.getOwnedListingIds(userId);

    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        sender:public_profiles!inquiries_sender_id_fkey(display_name, avatar_url)
      `)
      .or(this.buildReceivedInquiriesFilter(userId, franchiseIds, businessIds))
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = data || [];
    const listingNames = await this.resolveListingNames(rows);
    const appMap = await this.resolveLinkedApplications(rows.map((r) => String(r.id)));

    return rows.map((row) =>
      mapInquiry(
        row as Record<string, unknown>,
        listingNames.get(String(row.listing_id)),
        appMap.get(String(row.id)) || null
      )
    );
  }

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
    updates: Partial<{
      status: InquiryStatus;
      priority: InquiryPriority;
      notes: string;
      match_score: number;
    }>
  ): Promise<void> {
    const { error } = await supabase
      .from('inquiries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', inquiryId);

    if (error) throw error;
  }

  /** Mark inquiry as application stage when linked app is created */
  static async markApplicationStarted(inquiryId: string): Promise<void> {
    await this.updateInquiry(inquiryId, { status: 'application' });
  }

  /** Latest non-lost franchise inquiry from this sender for this listing */
  static async findFranchiseInquiryForSender(
    senderId: string,
    listingId: string
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('inquiries')
      .select('id')
      .eq('sender_id', senderId)
      .eq('listing_id', listingId)
      .eq('listing_type', 'franchise')
      .neq('status', 'lost')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data?.id ? String(data.id) : null;
  }

  /**
   * Reuse an existing franchise inquiry or create one so every application
   * has a canonical Lead / Opportunity row.
   */
  static async enquireFromMatch(input: {
    senderId: string;
    listingId: string;
    contactEmail: string;
    contactPhone?: string;
    matchScore: number;
    brandName?: string;
  }): Promise<string> {
    const inquiryId = await this.ensureFranchiseInquiry({
      senderId: input.senderId,
      listingId: input.listingId,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      subject: input.brandName
        ? `Match enquiry: ${input.brandName}`
        : 'Franchise match enquiry',
      message: `Enquiry started from franchise matcher${
        input.brandName ? ` for ${input.brandName}` : ''
      }.`,
    });

    try {
      await this.updateInquiry(inquiryId, {
        match_score: Math.round(input.matchScore),
      });
    } catch (error) {
      console.warn('Could not persist match_score on inquiry:', error);
    }

    return inquiryId;
  }

  static async ensureFranchiseInquiry(input: {
    senderId: string;
    listingId: string;
    contactEmail: string;
    contactPhone?: string;
    subject?: string;
    message?: string;
  }): Promise<string> {
    const existing = await this.findFranchiseInquiryForSender(
      input.senderId,
      input.listingId
    );
    if (existing) return existing;

    try {
      return await this.createInquiry({
        senderId: input.senderId,
        listingId: input.listingId,
        listingType: 'franchise',
        subject: input.subject || 'Franchise application',
        message:
          input.message ||
          'Application submitted via the franchise apply flow.',
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
      });
    } catch (err) {
      const raced = await this.findFranchiseInquiryForSender(
        input.senderId,
        input.listingId
      );
      if (raced) return raced;
      throw err;
    }
  }

  static applicationStatusToInquiryStatus(
    appStatus: string
  ): InquiryStatus | null {
    switch (appStatus) {
      case 'submitted':
      case 'under_review':
        return 'application';
      case 'interview_scheduled':
        return 'meeting';
      case 'approved':
        return 'negotiation';
      case 'rejected':
      case 'withdrawn':
        return 'lost';
      default:
        return null;
    }
  }

  static async syncInquiryFromApplication(
    inquiryId: string,
    appStatus: string
  ): Promise<void> {
    const status = this.applicationStatusToInquiryStatus(appStatus);
    if (!status) return;
    await this.updateInquiry(inquiryId, { status });
  }

  static async getFranchiseGrowthMetrics(
    userId: string
  ): Promise<FranchiseGrowthMetrics> {
    const leads = await this.getFranchisePipeline(userId);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const active = leads.filter((l) => l.status !== 'lost');

    const locationCounts = new Map<string, number>();
    for (const lead of active) {
      const loc = (lead.preferredLocation || '').trim();
      if (!loc) continue;
      locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1);
    }

    const locationDemand = [...locationCounts.entries()]
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const applications = leads.filter(
      (l) => l.status === 'application' || Boolean(l.linkedApplicationId)
    ).length;

    return {
      qualifiedOpportunities: active.length,
      newThisWeek: leads.filter(
        (l) => new Date(l.createdAt).getTime() >= weekAgo
      ).length,
      meetings: leads.filter((l) => l.status === 'meeting').length,
      applications,
      approved: leads.filter((l) => l.status === 'negotiation').length,
      territoriesFilled: leads.filter((l) => l.status === 'opened').length,
      pipeline: {
        new: leads.filter((l) => l.status === 'new').length,
        qualified: leads.filter((l) => l.status === 'qualified').length,
        meeting: leads.filter((l) => l.status === 'meeting').length,
        application: applications,
        approved: leads.filter((l) => l.status === 'negotiation').length,
      },
      locationDemand,
    };
  }

  private static async resolveLinkedApplications(
    inquiryIds: string[]
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (!inquiryIds.length) return map;

    const { data, error } = await supabase
      .from('franchise_applications')
      .select('id, inquiry_id')
      .in('inquiry_id', inquiryIds);

    if (error) {
      // Column may not exist until migration 029
      console.warn('Linked applications lookup skipped:', error.message);
      return map;
    }

    data?.forEach((row) => {
      if (row.inquiry_id) map.set(String(row.inquiry_id), String(row.id));
    });
    return map;
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
