import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { ProfileUpdate } from '@/types/auth.types';

export type OnboardingStep = 'essentials' | 'role' | 'verification' | 'complete';

export interface OnboardingData {
    // Step 1: Essentials
    phone: string;
    phoneVerified: boolean;
    city: string;
    state: string;
    country: string;
    bio: string;

    // Step 2: Role-specific (stored as generic object)
    roleData: Record<string, any>;
}

const STORAGE_KEY = 'bizsearch_onboarding_progress';

const STEP_ORDER: OnboardingStep[] = ['essentials', 'role', 'verification', 'complete'];

const initialData: OnboardingData = {
    phone: '',
    phoneVerified: false,
    city: '',
    state: '',
    country: 'India',
    bio: '',
    roleData: {},
};

export function useOnboarding() {
    const { user, profile, updateProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState<OnboardingStep>('essentials');
    const [data, setData] = useState<OnboardingData>(initialData);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load saved progress from localStorage
    useEffect(() => {
        if (user) {
            const saved = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setData(parsed.data || initialData);
                    setCurrentStep(parsed.step || 'essentials');
                } catch (e) {
                    console.error('Failed to parse onboarding progress:', e);
                }
            }
        }
    }, [user]);

    // Pre-fill from existing profile
    useEffect(() => {
        if (profile) {
            setData(prev => ({
                ...prev,
                phone: profile.phone || prev.phone,
                city: profile.city || prev.city,
                state: profile.state || prev.state,
                country: profile.country || prev.country || 'India',
                bio: profile.bio || prev.bio,
            }));
        }
    }, [profile]);

    // Save progress to localStorage
    const saveProgress = useCallback(() => {
        if (user) {
            localStorage.setItem(
                `${STORAGE_KEY}_${user.id}`,
                JSON.stringify({ step: currentStep, data })
            );
        }
    }, [user, currentStep, data]);

    // Auto-save on data change
    useEffect(() => {
        saveProgress();
    }, [saveProgress]);

    // Update form data
    const updateData = useCallback((updates: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...updates }));
        setError(null);
    }, []);

    // Get current step index
    const currentStepIndex = STEP_ORDER.indexOf(currentStep);
    const totalSteps = STEP_ORDER.length - 1; // Exclude 'complete' from count

    // Navigation
    const goToNextStep = useCallback(() => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < STEP_ORDER.length) {
            setCurrentStep(STEP_ORDER[nextIndex]);
        }
    }, [currentStepIndex]);

    const goToPreviousStep = useCallback(() => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(STEP_ORDER[prevIndex]);
        }
    }, [currentStepIndex]);

    const goToStep = useCallback((step: OnboardingStep) => {
        setCurrentStep(step);
    }, []);

    // Save current step data to profile
    const saveStepData = useCallback(async (): Promise<boolean> => {
        console.log('💾 saveStepData called', { hasUser: !!user, hasProfile: !!profile, data });

        if (!user || !profile) {
            console.error('❌ saveStepData: No user or profile available');
            setError('Profile not loaded. Please refresh the page.');
            return false;
        }

        setSaving(true);
        setError(null);

        try {
            const updates: ProfileUpdate = {};

            // Map onboarding data to profile fields
            if (data.phone) updates.phone = data.phone;
            if (data.city) updates.city = data.city;
            if (data.state) updates.state = data.state;
            if (data.country) updates.country = data.country;
            if (data.bio) updates.bio = data.bio;

            // Add role-specific fields
            const role = profile.role;
            console.log('📋 Role:', role, 'RoleData:', data.roleData);

            if (role === 'buyer') {
                if (data.roleData.investment_min) updates.investment_min = data.roleData.investment_min;
                if (data.roleData.investment_max) updates.investment_max = data.roleData.investment_max;
                if (data.roleData.buyer_type) updates.buyer_type = data.roleData.buyer_type;
                if (data.roleData.preferred_industries) updates.preferred_industries = data.roleData.preferred_industries;
                if (data.roleData.investment_criteria) updates.investment_criteria = data.roleData.investment_criteria;
            } else if (role === 'seller') {
                if (data.roleData.founded_year) updates.founded_year = data.roleData.founded_year;
                if (data.roleData.employees) updates.employees = data.roleData.employees;
                if (data.roleData.industry) updates.industry = data.roleData.industry;
                if (data.roleData.key_products) updates.key_products = data.roleData.key_products;
                if (data.roleData.asking_price) updates.asking_price = data.roleData.asking_price;
            } else if (role === 'franchisor') {
                if (data.roleData.total_outlets) updates.total_outlets = data.roleData.total_outlets;
                if (data.roleData.royalty_percentage) updates.royalty_percentage = data.roleData.royalty_percentage;
                if (data.roleData.franchise_fee) updates.franchise_fee = data.roleData.franchise_fee;
                if (data.roleData.support) updates.support = data.roleData.support;
            } else if (role === 'franchisee') {
                if (data.roleData.investment_min) updates.investment_min = data.roleData.investment_min;
                if (data.roleData.investment_max) updates.investment_max = data.roleData.investment_max;
                if (data.roleData.preferred_industries) updates.preferred_industries = data.roleData.preferred_industries;
            }
            // Add more roles as needed

            console.log('📝 Updates to save:', updates);

            const { error: updateError } = await updateProfile(updates);

            if (updateError) {
                console.error('❌ updateProfile error:', updateError);
                throw updateError;
            }

            console.log('✅ Profile updated successfully');
            await refreshProfile();
            return true;
        } catch (err: any) {
            console.error('❌ Failed to save onboarding data:', err);
            setError(err?.message || 'Failed to save. Please try again.');
            return false;
        } finally {
            setSaving(false);
        }
    }, [user, profile, data, updateProfile, refreshProfile]);

    // Complete onboarding
    const completeOnboarding = useCallback(async () => {
        const saved = await saveStepData();
        if (saved && user) {
            // Clear localStorage progress
            localStorage.removeItem(`${STORAGE_KEY}_${user.id}`);
            goToStep('complete');
        }
    }, [saveStepData, user, goToStep]);

    // Skip onboarding (go to home)
    const skipOnboarding = useCallback(() => {
        navigate('/');
    }, [navigate]);

    // Finish (after complete step)
    const finishOnboarding = useCallback(() => {
        navigate('/');
    }, [navigate]);

    // Check if user needs onboarding
    const needsOnboarding = useCallback((): boolean => {
        if (!profile) return false;

        // Check minimum required fields
        const hasPhone = !!profile.phone;
        const hasLocation = !!profile.city && !!profile.state;

        return !hasPhone || !hasLocation;
    }, [profile]);

    return {
        // State
        currentStep,
        currentStepIndex,
        totalSteps,
        data,
        saving,
        error,
        profile,

        // Actions
        updateData,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        saveStepData,
        completeOnboarding,
        skipOnboarding,
        finishOnboarding,
        needsOnboarding,
    };
}
