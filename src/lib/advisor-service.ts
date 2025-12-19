import { supabase } from './supabase';

// Types
export interface AdvisorClient {
    id: string;
    advisor_id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    type: 'buyer' | 'seller' | 'both';
    status: 'active' | 'inactive' | 'prospect';
    budget_min?: number;
    budget_max?: number;
    interests?: string[];
    notes?: string;
    last_contact: string;
    created_at: string;
    updated_at: string;
}

export interface Deal {
    id: string;
    advisor_id: string;
    title: string;
    client_id?: string;
    listing_id?: string;
    listing_type?: 'business' | 'franchise';
    listing_name?: string;
    value: number;
    stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
    probability: number;
    expected_close?: string;
    notes?: string;
    last_activity: string;
    created_at: string;
    updated_at: string;
    client?: AdvisorClient;
}

export interface Commission {
    id: string;
    advisor_id: string;
    deal_id?: string;
    deal_title: string;
    listing_name?: string;
    client_name?: string;
    deal_value: number;
    commission_rate: number;
    commission_amount: number;
    status: 'pending' | 'approved' | 'paid';
    closed_date: string;
    payment_date?: string;
    created_at: string;
}

export interface AdvisorProfile {
    id: string;
    title?: string;
    company?: string;
    location?: string;
    specializations?: string[];
    bio?: string;
    years_experience: number;
    deals_closed: number;
    total_value: number;
    rating: number;
    reviews_count: number;
    verified: boolean;
    featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface DashboardStats {
    totalClients: number;
    activeClients: number;
    totalDeals: number;
    pipelineValue: number;
    wonValue: number;
    pendingCommissions: number;
    paidCommissions: number;
}

export type DealStage = Deal['stage'];

export const DEAL_STAGES: { value: DealStage; label: string; color: string }[] = [
    { value: 'lead', label: 'Lead', color: 'bg-gray-100 text-gray-800' },
    { value: 'qualified', label: 'Qualified', color: 'bg-blue-100 text-blue-800' },
    { value: 'proposal', label: 'Proposal', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
    { value: 'closed_won', label: 'Won', color: 'bg-green-100 text-green-800' },
    { value: 'closed_lost', label: 'Lost', color: 'bg-red-100 text-red-800' },
];

export class AdvisorService {
    // ============ CLIENTS ============

    static async getClients(advisorId: string): Promise<AdvisorClient[]> {
        const { data, error } = await supabase
            .from('advisor_clients')
            .select('*')
            .eq('advisor_id', advisorId)
            .order('last_contact', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    static async getClient(clientId: string): Promise<AdvisorClient | null> {
        const { data, error } = await supabase
            .from('advisor_clients')
            .select('*')
            .eq('id', clientId)
            .single();

        if (error) return null;
        return data;
    }

    static async createClient(
        advisorId: string,
        client: Omit<AdvisorClient, 'id' | 'advisor_id' | 'created_at' | 'updated_at' | 'last_contact'>
    ): Promise<AdvisorClient> {
        const { data, error } = await supabase
            .from('advisor_clients')
            .insert({
                advisor_id: advisorId,
                ...client,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updateClient(
        clientId: string,
        updates: Partial<AdvisorClient>
    ): Promise<AdvisorClient> {
        const { data, error } = await supabase
            .from('advisor_clients')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', clientId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async deleteClient(clientId: string): Promise<void> {
        const { error } = await supabase
            .from('advisor_clients')
            .delete()
            .eq('id', clientId);

        if (error) throw error;
    }

    // ============ DEALS ============

    static async getDeals(advisorId: string): Promise<Deal[]> {
        const { data, error } = await supabase
            .from('deals')
            .select('*, client:advisor_clients(*)')
            .eq('advisor_id', advisorId)
            .order('last_activity', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    static async getDeal(dealId: string): Promise<Deal | null> {
        const { data, error } = await supabase
            .from('deals')
            .select('*, client:advisor_clients(*)')
            .eq('id', dealId)
            .single();

        if (error) return null;
        return data;
    }

    static async createDeal(
        advisorId: string,
        deal: Omit<Deal, 'id' | 'advisor_id' | 'created_at' | 'updated_at' | 'last_activity' | 'client'>
    ): Promise<Deal> {
        const { data, error } = await supabase
            .from('deals')
            .insert({
                advisor_id: advisorId,
                ...deal,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updateDeal(dealId: string, updates: Partial<Deal>): Promise<Deal> {
        const { data, error } = await supabase
            .from('deals')
            .update({
                ...updates,
                last_activity: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', dealId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updateDealStage(dealId: string, stage: DealStage): Promise<Deal> {
        return this.updateDeal(dealId, { stage, probability: this.getStageProbability(stage) });
    }

    static getStageProbability(stage: DealStage): number {
        const probabilities: Record<DealStage, number> = {
            lead: 10,
            qualified: 25,
            proposal: 50,
            negotiation: 75,
            closed_won: 100,
            closed_lost: 0,
        };
        return probabilities[stage];
    }

    static async deleteDeal(dealId: string): Promise<void> {
        const { error } = await supabase.from('deals').delete().eq('id', dealId);
        if (error) throw error;
    }

    // ============ COMMISSIONS ============

    static async getCommissions(advisorId: string): Promise<Commission[]> {
        const { data, error } = await supabase
            .from('commissions')
            .select('*')
            .eq('advisor_id', advisorId)
            .order('closed_date', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    static async createCommission(
        advisorId: string,
        commission: Omit<Commission, 'id' | 'advisor_id' | 'created_at'>
    ): Promise<Commission> {
        const { data, error } = await supabase
            .from('commissions')
            .insert({
                advisor_id: advisorId,
                ...commission,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ============ PROFILE ============

    static async getAdvisorProfile(advisorId: string): Promise<AdvisorProfile | null> {
        const { data, error } = await supabase
            .from('advisor_profiles')
            .select('*')
            .eq('id', advisorId)
            .single();

        if (error) return null;
        return data;
    }

    static async upsertAdvisorProfile(
        advisorId: string,
        profile: Partial<AdvisorProfile>
    ): Promise<AdvisorProfile> {
        const { data, error } = await supabase
            .from('advisor_profiles')
            .upsert({
                id: advisorId,
                ...profile,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ============ STATS ============

    static async getDashboardStats(advisorId: string): Promise<DashboardStats> {
        const [clients, deals, commissions] = await Promise.all([
            this.getClients(advisorId),
            this.getDeals(advisorId),
            this.getCommissions(advisorId),
        ]);

        const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
        const wonDeals = deals.filter(d => d.stage === 'closed_won');

        return {
            totalClients: clients.length,
            activeClients: clients.filter(c => c.status === 'active').length,
            totalDeals: deals.length,
            pipelineValue: activeDeals.reduce((sum, d) => sum + d.value, 0),
            wonValue: wonDeals.reduce((sum, d) => sum + d.value, 0),
            pendingCommissions: commissions
                .filter(c => c.status === 'pending')
                .reduce((sum, c) => sum + c.commission_amount, 0),
            paidCommissions: commissions
                .filter(c => c.status === 'paid')
                .reduce((sum, c) => sum + c.commission_amount, 0),
        };
    }
}
