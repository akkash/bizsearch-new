import { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/auth.types';

export type VerificationTier = 0 | 1 | 2 | 3 | 4;

export interface VerificationTierInfo {
    tier: VerificationTier;
    label: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: 'shield' | 'shield-check' | 'shield-plus' | 'badge-check' | 'verified';
    nextSteps: string[];
}

const TIER_INFO: Record<VerificationTier, Omit<VerificationTierInfo, 'tier' | 'nextSteps'>> = {
    0: {
        label: 'Unverified',
        description: 'Email not confirmed',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        icon: 'shield',
    },
    1: {
        label: 'Email Verified',
        description: 'Basic verification complete',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: 'shield-check',
    },
    2: {
        label: 'Phone Verified',
        description: 'Contact verified',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: 'shield-plus',
    },
    3: {
        label: 'Identity Verified',
        description: 'ID documents verified',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: 'badge-check',
    },
    4: {
        label: 'Business Verified',
        description: 'Fully verified business',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: 'verified',
    },
};

interface DocumentVerificationStatus {
    hasIdentityDoc: boolean;
    hasBusinessDoc: boolean;
    identityVerified: boolean;
    businessVerified: boolean;
}

export function useVerificationTier(profileOverride?: Profile | null) {
    const { user, profile: authProfile } = useAuth();
    const profile = profileOverride ?? authProfile;

    const [docStatus, setDocStatus] = useState<DocumentVerificationStatus>({
        hasIdentityDoc: false,
        hasBusinessDoc: false,
        identityVerified: false,
        businessVerified: false,
    });
    const [loading, setLoading] = useState(true);

    // Fetch document verification status
    useEffect(() => {
        async function fetchDocStatus() {
            if (!profile?.id) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('verification_documents')
                    .select('document_type, status')
                    .eq('profile_id', profile.id);

                if (error) throw error;

                const docs = data || [];

                const identityDocs = docs.filter(d => d.document_type === 'identity');
                const businessDocs = docs.filter(d => d.document_type === 'business');

                setDocStatus({
                    hasIdentityDoc: identityDocs.length > 0,
                    hasBusinessDoc: businessDocs.length > 0,
                    identityVerified: identityDocs.some(d => d.status === 'verified'),
                    businessVerified: businessDocs.some(d => d.status === 'verified'),
                });
            } catch (err) {
                console.error('Error fetching verification documents:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchDocStatus();
    }, [profile?.id]);

    const tierInfo = useMemo((): VerificationTierInfo => {
        // Calculate tier based on verification status
        let tier: VerificationTier = 0;
        const nextSteps: string[] = [];

        // Tier 0: No email verification
        const emailVerified = user?.email_confirmed_at || user?.confirmed_at;

        if (!emailVerified) {
            nextSteps.push('Verify your email address');
            return { tier: 0, ...TIER_INFO[0], nextSteps };
        }

        // Tier 1: Email verified
        tier = 1;

        // Check phone verification
        const phoneVerified = profile?.phone_verified === true;

        if (!phoneVerified) {
            nextSteps.push('Add and verify your phone number');
        } else {
            tier = 2;
        }

        // Check identity documents
        if (!docStatus.identityVerified) {
            if (!docStatus.hasIdentityDoc) {
                nextSteps.push('Upload identity documents (PAN/Aadhaar)');
            } else {
                nextSteps.push('Identity documents pending verification');
            }
        } else {
            tier = Math.max(tier, 3) as VerificationTier;
        }

        // Check business documents
        if (!docStatus.businessVerified) {
            if (!docStatus.hasBusinessDoc) {
                nextSteps.push('Upload business documents (GST/Registration)');
            } else {
                nextSteps.push('Business documents pending verification');
            }
        } else {
            tier = 4;
        }

        return { tier, ...TIER_INFO[tier], nextSteps };
    }, [user, profile, docStatus]);

    return {
        ...tierInfo,
        loading,
        docStatus,
    };
}

// Helper function to get tier info without hook (for server-side or static use)
export function getVerificationTierInfo(tier: VerificationTier): Omit<VerificationTierInfo, 'nextSteps'> & { tier: VerificationTier } {
    return { tier, ...TIER_INFO[tier] };
}
