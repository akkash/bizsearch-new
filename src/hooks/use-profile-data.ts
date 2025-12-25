import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { BusinessService } from '@/lib/business-service';
import { FranchiseService } from '@/lib/franchise-service';
import { type ExtendedProfile } from '@/types/auth.types';
import type { Business, Franchise } from '@/types/listings';

interface ProfileDataState {
    profile: ExtendedProfile | null;
    listings: (Business | Franchise)[];
    savedListings: any[]; // Todo: Type this properly when SavedListing type is available
    stats: {
        views: number;
        inquiries: number;
        connections: number;
    };
    loading: boolean;
    error: Error | null;
}

export function useProfileData(userId: string | undefined) {
    const [state, setState] = useState<ProfileDataState>({
        profile: null,
        listings: [],
        savedListings: [],
        stats: { views: 0, inquiries: 0, connections: 0 },
        loading: true,
        error: null,
    });

    const loadData = useCallback(async () => {
        if (!userId) return;

        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            // 1. Fetch Basic Identity & Roles (Using the existing rich query logic would be ideal, 
            // but for now we essentially replicate fetchProfile or use a lighter version since we are likely already auth'd.
            // However, this hook might be used for PUBLIC profiles where we aren't the auth'd user).

            // We'll reuse the logic similar to AuthContext's fetchProfile but purely for reading data.
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;

            // Fetch Roles
            const { data: rolesData } = await supabase
                .from('profile_roles')
                .select('*')
                .eq('profile_id', userId);

            // Fetch Detail Tables in parallel
            const [
                sellerDetails,
                buyerDetails,
                franchisorDetails,
                franchiseeDetails,
                advisorDetails
            ] = await Promise.all([
                supabase.from('seller_details').select('*').eq('profile_id', userId).maybeSingle(),
                supabase.from('buyer_details').select('*').eq('profile_id', userId).maybeSingle(),
                supabase.from('franchisor_details').select('*').eq('profile_id', userId).maybeSingle(),
                supabase.from('franchisee_details').select('*').eq('profile_id', userId).maybeSingle(),
                supabase.from('advisor_details').select('*').eq('profile_id', userId).maybeSingle(),
            ]);

            const fullProfile: ExtendedProfile = {
                ...profileData,
                roles: rolesData || [],
                seller_details: sellerDetails.data,
                buyer_details: buyerDetails.data,
                franchisor_details: franchisorDetails.data,
                franchisee_details: franchiseeDetails.data,
                advisor_details: advisorDetails.data,
            };

            // 2. Fetch Listings based on Roles
            let listings: (Business | Franchise)[] = [];

            // Check roles to decide what to fetch
            const isSeller = rolesData?.some(r => r.role === 'seller') || profileData.role === 'seller';
            const isFranchisor = rolesData?.some(r => r.role === 'franchisor') || profileData.role === 'franchisor';

            if (isSeller) {
                const businesses = await BusinessService.getUserBusinesses(userId);
                if (businesses) listings = [...listings, ...businesses as any];
            }

            if (isFranchisor) {
                const franchises = await FranchiseService.getUserFranchises(userId);
                if (franchises) listings = [...listings, ...franchises as any];
            }

            // 3. Fetch Saved Items (Only if viewing own profile usually, but we'll fetch for now)
            // Note: RLS will prevent fetching this for other users anyway.
            let savedItems: any[] = [];
            try {
                const saved = await BusinessService.getSavedBusinesses(userId);
                if (saved) savedItems = saved;
            } catch (e) {
                // Ignore error (likely RLS forbidding access to someone else's saved items)
            }

            // 4. Calculate Stats (mock for now, or aggregate from listings)
            const stats = {
                views: listings.reduce((acc, item: any) => acc + (item.views_count || 0), 0),
                inquiries: listings.reduce((acc, item: any) => acc + (item.inquiries_count || 0), 0),
                connections: 0, // Placeholder
            };

            setState({
                profile: fullProfile,
                listings,
                savedListings: savedItems,
                stats,
                loading: false,
                error: null,
            });

        } catch (err: any) {
            console.error('Error in useProfileData:', err);
            setState(prev => ({ ...prev, loading: false, error: err }));
        }
    }, [userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return { ...state, refresh: loadData };
}
