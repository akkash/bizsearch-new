import { supabase } from './supabase';

/**
 * Feature Flag Interface
 */
export interface FeatureFlag {
    id: string;
    key: string;
    name: string;
    description: string;
    enabled: boolean;
    category: 'core' | 'ai_features' | 'maps' | 'security' | 'beta' | 'system';
    created_at: string;
    updated_at: string;
}

/**
 * Default feature flags - used as fallback and for seeding
 */
export const DEFAULT_FEATURE_FLAGS: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>[] = [
    // Maps
    { key: 'franchise_map', name: 'Franchise Map Discovery', description: 'Interactive map for discovering franchise locations', enabled: true, category: 'maps' },
    { key: 'territory_analytics', name: 'Territory Analytics', description: 'AI-powered territory analysis and recommendations', enabled: true, category: 'maps' },

    // AI Features
    { key: 'ai_matching', name: 'AI Business Matching', description: 'AI-powered matching between buyers and businesses', enabled: true, category: 'ai_features' },
    { key: 'ai_fraud_detection', name: 'AI Fraud Detection', description: 'AI system to detect fraudulent listings', enabled: true, category: 'security' },
    { key: 'ai_valuation', name: 'AI Business Valuation', description: 'Automated business valuation using AI', enabled: false, category: 'ai_features' },
    { key: 'ai_chat_advisor', name: 'AI Chat Advisor', description: 'AI-powered chat assistant for guidance', enabled: false, category: 'ai_features' },
    { key: 'ai_document_analyzer', name: 'AI Document Analyzer', description: 'AI analysis of business documents', enabled: false, category: 'ai_features' },

    // Core Features
    { key: 'deal_room', name: 'Deal Room', description: 'Virtual deal room for negotiations', enabled: true, category: 'core' },
    { key: 'nda_management', name: 'NDA Management', description: 'Digital NDA signing and management', enabled: true, category: 'core' },
    { key: 'notifications', name: 'Push Notifications', description: 'Real-time push notifications', enabled: true, category: 'core' },
    { key: 'saved_searches', name: 'Saved Searches', description: 'Save search criteria for alerts', enabled: true, category: 'core' },

    // Beta Features
    { key: 'advanced_analytics', name: 'Advanced Analytics', description: 'Enhanced analytics dashboard', enabled: false, category: 'beta' },
    { key: 'bulk_messaging', name: 'Bulk Messaging', description: 'Send messages to multiple users', enabled: false, category: 'beta' },

    // System
    { key: 'maintenance_mode', name: 'Maintenance Mode', description: 'Put platform in maintenance mode', enabled: false, category: 'system' },
];

const STORAGE_KEY = 'bizsearch_feature_flags';

/**
 * Feature Flags Service
 * Manages feature flags with database persistence and localStorage fallback
 */
export const FeatureFlagsService = {
    /**
     * Get all feature flags from database with localStorage fallback
     */
    async getAll(): Promise<FeatureFlag[]> {
        try {
            const { data, error } = await supabase
                .from('feature_flags')
                .select('*')
                .order('category', { ascending: true });

            if (error) {
                console.warn('Failed to fetch feature flags from database, using localStorage fallback');
                return this.getFromLocalStorage();
            }

            if (!data || data.length === 0) {
                // No flags in database, seed with defaults
                console.log('No feature flags found, seeding defaults...');
                await this.seedDefaults();
                return this.getFromLocalStorage();
            }

            // Update localStorage cache
            this.saveToLocalStorage(data);
            return data;
        } catch (error) {
            console.error('Error fetching feature flags:', error);
            return this.getFromLocalStorage();
        }
    },

    /**
     * Get a single feature flag by key
     */
    async get(key: string): Promise<boolean> {
        try {
            // Try localStorage first for instant access
            const cached = this.getFromLocalStorage();
            const cachedFlag = cached.find(f => f.key === key);
            if (cachedFlag) return cachedFlag.enabled;

            // Fallback to database
            const { data, error } = await supabase
                .from('feature_flags')
                .select('enabled')
                .eq('key', key)
                .single();

            if (error || !data) {
                // Return default value if exists
                const defaultFlag = DEFAULT_FEATURE_FLAGS.find(f => f.key === key);
                return defaultFlag?.enabled ?? false;
            }

            return data.enabled;
        } catch (error) {
            console.error('Error fetching feature flag:', error);
            const defaultFlag = DEFAULT_FEATURE_FLAGS.find(f => f.key === key);
            return defaultFlag?.enabled ?? false;
        }
    },

    /**
     * Update a feature flag's enabled status
     */
    async update(key: string, enabled: boolean): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('feature_flags')
                .update({ enabled, updated_at: new Date().toISOString() })
                .eq('key', key);

            if (error) {
                console.error('Failed to update feature flag in database:', error);
                // Update localStorage as fallback
                this.updateLocalStorage(key, enabled);
                return true;
            }

            // Update localStorage cache
            this.updateLocalStorage(key, enabled);
            return true;
        } catch (error) {
            console.error('Error updating feature flag:', error);
            this.updateLocalStorage(key, enabled);
            return true;
        }
    },

    /**
     * Seed default feature flags to database
     */
    async seedDefaults(): Promise<void> {
        try {
            const flagsToInsert = DEFAULT_FEATURE_FLAGS.map(flag => ({
                ...flag,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }));

            const { error } = await supabase
                .from('feature_flags')
                .upsert(flagsToInsert, { onConflict: 'key' });

            if (error) {
                console.error('Failed to seed feature flags:', error);
            }

            // Also save to localStorage
            const defaultsWithId = DEFAULT_FEATURE_FLAGS.map((flag, index) => ({
                ...flag,
                id: `default-${index}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }));
            this.saveToLocalStorage(defaultsWithId as FeatureFlag[]);
        } catch (error) {
            console.error('Error seeding feature flags:', error);
        }
    },

    /**
     * Get flags from localStorage
     */
    getFromLocalStorage(): FeatureFlag[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error reading from localStorage:', error);
        }

        // Return defaults if nothing in localStorage
        return DEFAULT_FEATURE_FLAGS.map((flag, index) => ({
            ...flag,
            id: `default-${index}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }));
    },

    /**
     * Save flags to localStorage
     */
    saveToLocalStorage(flags: FeatureFlag[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },

    /**
     * Update a single flag in localStorage
     */
    updateLocalStorage(key: string, enabled: boolean): void {
        try {
            const flags = this.getFromLocalStorage();
            const updatedFlags = flags.map(flag =>
                flag.key === key
                    ? { ...flag, enabled, updated_at: new Date().toISOString() }
                    : flag
            );
            this.saveToLocalStorage(updatedFlags);
        } catch (error) {
            console.error('Error updating localStorage:', error);
        }
    },

    /**
     * Check if a feature is enabled (synchronous, uses localStorage)
     */
    isEnabled(key: string): boolean {
        const flags = this.getFromLocalStorage();
        const flag = flags.find(f => f.key === key);
        if (flag) return flag.enabled;

        const defaultFlag = DEFAULT_FEATURE_FLAGS.find(f => f.key === key);
        return defaultFlag?.enabled ?? false;
    },
};

export default FeatureFlagsService;
