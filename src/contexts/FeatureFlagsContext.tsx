import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FeatureFlagsService, FeatureFlag, DEFAULT_FEATURE_FLAGS } from '@/lib/feature-flags-service';

interface FeatureFlagsContextType {
    flags: FeatureFlag[];
    loading: boolean;
    isEnabled: (key: string) => boolean;
    setEnabled: (key: string, enabled: boolean) => Promise<void>;
    refreshFlags: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

/**
 * Feature Flags Provider
 * Provides feature flag state and methods throughout the app
 */
export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
    const [flags, setFlags] = useState<FeatureFlag[]>(() => {
        // Initialize with localStorage for instant availability
        return FeatureFlagsService.getFromLocalStorage();
    });
    const [loading, setLoading] = useState(true);

    /**
     * Load flags from database
     */
    const loadFlags = useCallback(async () => {
        try {
            const data = await FeatureFlagsService.getAll();
            setFlags(data);
        } catch (error) {
            console.error('Failed to load feature flags:', error);
            // Keep using localStorage data
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Initialize flags on mount
     */
    useEffect(() => {
        loadFlags();
    }, [loadFlags]);

    /**
     * Check if a feature is enabled
     */
    const isEnabled = useCallback((key: string): boolean => {
        const flag = flags.find(f => f.key === key);
        if (flag) return flag.enabled;

        // Fallback to defaults
        const defaultFlag = DEFAULT_FEATURE_FLAGS.find(f => f.key === key);
        return defaultFlag?.enabled ?? false;
    }, [flags]);

    /**
     * Update a feature flag
     */
    const setEnabled = useCallback(async (key: string, enabled: boolean): Promise<void> => {
        // Optimistic update
        setFlags(prev => prev.map(f =>
            f.key === key ? { ...f, enabled, updated_at: new Date().toISOString() } : f
        ));

        // Persist to database
        const success = await FeatureFlagsService.update(key, enabled);
        if (!success) {
            // Revert on failure
            await loadFlags();
        }
    }, [loadFlags]);

    /**
     * Refresh flags from database
     */
    const refreshFlags = useCallback(async (): Promise<void> => {
        setLoading(true);
        await loadFlags();
    }, [loadFlags]);

    return (
        <FeatureFlagsContext.Provider value={{
            flags,
            loading,
            isEnabled,
            setEnabled,
            refreshFlags,
        }}>
            {children}
        </FeatureFlagsContext.Provider>
    );
}

/**
 * Hook to access feature flags context
 */
export function useFeatureFlags(): FeatureFlagsContextType {
    const context = useContext(FeatureFlagsContext);
    if (!context) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
    }
    return context;
}

/**
 * Hook to check if a specific feature is enabled
 */
export function useFeatureFlag(key: string): boolean {
    const { isEnabled } = useFeatureFlags();
    return isEnabled(key);
}

/**
 * HOC to conditionally render component based on feature flag
 */
export function withFeatureFlag<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    featureKey: string,
    FallbackComponent?: React.ComponentType<P>
): React.FC<P> {
    return function FeatureFlaggedComponent(props: P) {
        const isEnabled = useFeatureFlag(featureKey);

        if (!isEnabled) {
            return FallbackComponent ? <FallbackComponent {...props} /> : null;
        }

        return <WrappedComponent {...props} />;
    };
}

export default FeatureFlagsContext;
