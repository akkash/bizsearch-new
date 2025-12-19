import { useMemo } from 'react';
import type { Profile } from '@/types/auth.types';

export interface ProfileCompletenessResult {
    score: number; // 0-100
    completedFields: string[];
    missingFields: { field: string; label: string; priority: 'high' | 'medium' | 'low' }[];
    tier: 'basic' | 'complete' | 'verified';
}

// Field definitions with labels and priorities
const BASE_FIELDS = [
    { field: 'display_name', label: 'Full Name', priority: 'high' as const, weight: 10 },
    { field: 'email', label: 'Email Address', priority: 'high' as const, weight: 10 },
    { field: 'phone', label: 'Phone Number', priority: 'high' as const, weight: 15 },
    { field: 'city', label: 'City', priority: 'high' as const, weight: 10 },
    { field: 'state', label: 'State', priority: 'high' as const, weight: 5 },
    { field: 'bio', label: 'About / Bio', priority: 'medium' as const, weight: 10 },
    { field: 'avatar_url', label: 'Profile Photo', priority: 'medium' as const, weight: 10 },
    { field: 'linkedin_url', label: 'LinkedIn Profile', priority: 'low' as const, weight: 5 },
    { field: 'website', label: 'Website', priority: 'low' as const, weight: 5 },
];

const BUYER_FIELDS = [
    { field: 'investment_min', label: 'Minimum Investment', priority: 'high' as const, weight: 10 },
    { field: 'investment_max', label: 'Maximum Investment', priority: 'high' as const, weight: 10 },
    { field: 'preferred_industries', label: 'Preferred Industries', priority: 'medium' as const, weight: 5 },
    { field: 'buyer_type', label: 'Buyer Type', priority: 'medium' as const, weight: 5 },
];

const SELLER_FIELDS = [
    { field: 'industry', label: 'Industry', priority: 'high' as const, weight: 10 },
    { field: 'founded_year', label: 'Year Founded', priority: 'medium' as const, weight: 5 },
    { field: 'employees', label: 'Number of Employees', priority: 'medium' as const, weight: 5 },
    { field: 'asking_price', label: 'Asking Price', priority: 'high' as const, weight: 10 },
];

const FRANCHISOR_FIELDS = [
    { field: 'total_outlets', label: 'Total Outlets', priority: 'high' as const, weight: 10 },
    { field: 'franchise_fee', label: 'Franchise Fee', priority: 'high' as const, weight: 10 },
    { field: 'royalty_percentage', label: 'Royalty Percentage', priority: 'medium' as const, weight: 5 },
];

const FRANCHISEE_FIELDS = [
    { field: 'investment_min', label: 'Investment Budget Min', priority: 'high' as const, weight: 10 },
    { field: 'investment_max', label: 'Investment Budget Max', priority: 'high' as const, weight: 10 },
    { field: 'preferred_industries', label: 'Preferred Industries', priority: 'medium' as const, weight: 5 },
];

const ADVISOR_FIELDS = [
    { field: 'bio', label: 'Professional Bio', priority: 'high' as const, weight: 15 },
    { field: 'linkedin_url', label: 'LinkedIn Profile', priority: 'high' as const, weight: 10 },
];

const BROKER_FIELDS = [
    { field: 'bio', label: 'Professional Bio', priority: 'high' as const, weight: 15 },
    { field: 'linkedin_url', label: 'LinkedIn Profile', priority: 'high' as const, weight: 10 },
];

function getFieldsForRole(role: string | undefined) {
    const baseFields = [...BASE_FIELDS];

    switch (role) {
        case 'buyer':
            return [...baseFields, ...BUYER_FIELDS];
        case 'seller':
            return [...baseFields, ...SELLER_FIELDS];
        case 'franchisor':
            return [...baseFields, ...FRANCHISOR_FIELDS];
        case 'franchisee':
            return [...baseFields, ...FRANCHISEE_FIELDS];
        case 'advisor':
            return [...baseFields, ...ADVISOR_FIELDS];
        case 'broker':
            return [...baseFields, ...BROKER_FIELDS];
        default:
            return baseFields;
    }
}

function isFieldComplete(profile: Profile, field: string): boolean {
    const value = (profile as any)[field];

    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;

    return true;
}

export function useProfileCompleteness(profile: Profile | null): ProfileCompletenessResult {
    return useMemo(() => {
        if (!profile) {
            return {
                score: 0,
                completedFields: [],
                missingFields: [],
                tier: 'basic',
            };
        }

        const fields = getFieldsForRole(profile.role);
        const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);

        const completedFields: string[] = [];
        const missingFields: { field: string; label: string; priority: 'high' | 'medium' | 'low' }[] = [];
        let completedWeight = 0;

        for (const fieldDef of fields) {
            if (isFieldComplete(profile, fieldDef.field)) {
                completedFields.push(fieldDef.field);
                completedWeight += fieldDef.weight;
            } else {
                missingFields.push({
                    field: fieldDef.field,
                    label: fieldDef.label,
                    priority: fieldDef.priority,
                });
            }
        }

        // Sort missing fields by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        missingFields.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        const score = Math.round((completedWeight / totalWeight) * 100);

        // Determine tier
        let tier: 'basic' | 'complete' | 'verified' = 'basic';
        if (score >= 80 && profile.verified) {
            tier = 'verified';
        } else if (score >= 60) {
            tier = 'complete';
        }

        return {
            score,
            completedFields,
            missingFields,
            tier,
        };
    }, [profile]);
}

// Helper function to get profile completeness for a profile without hook
export function calculateProfileCompleteness(profile: Profile | null): ProfileCompletenessResult {
    if (!profile) {
        return {
            score: 0,
            completedFields: [],
            missingFields: [],
            tier: 'basic',
        };
    }

    const fields = getFieldsForRole(profile.role);
    const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);

    const completedFields: string[] = [];
    const missingFields: { field: string; label: string; priority: 'high' | 'medium' | 'low' }[] = [];
    let completedWeight = 0;

    for (const fieldDef of fields) {
        if (isFieldComplete(profile, fieldDef.field)) {
            completedFields.push(fieldDef.field);
            completedWeight += fieldDef.weight;
        } else {
            missingFields.push({
                field: fieldDef.field,
                label: fieldDef.label,
                priority: fieldDef.priority,
            });
        }
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    missingFields.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    const score = Math.round((completedWeight / totalWeight) * 100);

    let tier: 'basic' | 'complete' | 'verified' = 'basic';
    if (score >= 80 && profile.verified) {
        tier = 'verified';
    } else if (score >= 60) {
        tier = 'complete';
    }

    return { score, completedFields, missingFields, tier };
}
