/**
 * Slug Utilities
 * 
 * Utilities for generating and validating URL-friendly slugs
 * for business and franchise listings.
 */

// UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Check if a string is a valid UUID v4
 */
export function isUUID(str: string): boolean {
    return UUID_REGEX.test(str);
}

/**
 * Generate a URL-friendly slug from a name
 * Format: brand-name-a3b2 (lowercase, hyphenated, with 4-char random suffix)
 * 
 * @example
 * generateSlug("5K Car Care") // "5k-car-care-x7m2"
 * generateSlug("Coffee Shop Mumbai") // "coffee-shop-mumbai-a3b2"
 */
export function generateSlug(name: string): string {
    // Convert to lowercase
    let slug = name.toLowerCase();

    // Replace special characters and spaces with hyphens
    slug = slug.replace(/[^a-z0-9\s-]/g, '');
    slug = slug.replace(/\s+/g, '-');
    slug = slug.replace(/-+/g, '-');
    slug = slug.replace(/^-|-$/g, '');

    // Generate 4-character alphanumeric random suffix
    const randomSuffix = generateRandomSuffix(4);

    return `${slug}-${randomSuffix}`;
}

/**
 * Generate a random alphanumeric string
 */
function generateRandomSuffix(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Extract the base name from a slug (without the random suffix)
 * 
 * @example
 * getSlugBaseName("coffee-shop-mumbai-a3b2") // "coffee-shop-mumbai"
 */
export function getSlugBaseName(slug: string): string {
    // Remove the last segment (random suffix)
    const parts = slug.split('-');
    if (parts.length > 1 && parts[parts.length - 1].length === 4) {
        return parts.slice(0, -1).join('-');
    }
    return slug;
}

/**
 * Sanitize a URL parameter to prevent SQL injection
 * Allows only alphanumeric characters and hyphens
 */
export function sanitizeSlug(slug: string): string {
    return slug.replace(/[^a-z0-9-]/gi, '').toLowerCase();
}

/**
 * Get the appropriate lookup field based on identifier type
 * Returns 'id' for UUIDs and 'slug' for slugs
 */
export function getIdType(identifier: string): 'id' | 'slug' {
    return isUUID(identifier) ? 'id' : 'slug';
}
