import { useEffect } from 'react';

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    ogType?: 'website' | 'article' | 'product';
    canonicalUrl?: string;
    noIndex?: boolean;
}

const DEFAULT_TITLE = 'BizSearch - India\'s #1 Business & Franchise Marketplace';
const DEFAULT_DESCRIPTION = 'Find verified businesses for sale and franchise opportunities in India. Connect with sellers, get valuations, and make informed investment decisions.';
const DEFAULT_OG_IMAGE = '/og-image.png';

/**
 * SEO Head Component
 * Updates document head with meta tags for SEO
 * 
 * Usage:
 * <SEOHead 
 *   title="Food Franchise Opportunities" 
 *   description="Explore 500+ food franchise opportunities..." 
 * />
 */
export function SEOHead({
    title,
    description = DEFAULT_DESCRIPTION,
    keywords = [],
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    canonicalUrl,
    noIndex = false,
}: SEOHeadProps) {
    const fullTitle = title ? `${title} | BizSearch` : DEFAULT_TITLE;

    useEffect(() => {
        // Update document title
        document.title = fullTitle;

        // Helper to update or create meta tag
        const setMetaTag = (name: string, content: string, isProperty = false) => {
            const attr = isProperty ? 'property' : 'name';
            let element = document.querySelector(`meta[${attr}="${name}"]`);

            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attr, name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Basic meta tags
        setMetaTag('description', description);

        if (keywords.length > 0) {
            setMetaTag('keywords', keywords.join(', '));
        }

        if (noIndex) {
            setMetaTag('robots', 'noindex, nofollow');
        } else {
            setMetaTag('robots', 'index, follow');
        }

        // Open Graph tags
        setMetaTag('og:title', fullTitle, true);
        setMetaTag('og:description', description, true);
        setMetaTag('og:image', ogImage, true);
        setMetaTag('og:type', ogType, true);
        setMetaTag('og:site_name', 'BizSearch', true);

        if (canonicalUrl) {
            setMetaTag('og:url', canonicalUrl, true);

            // Update or create canonical link
            let canonical = document.querySelector('link[rel="canonical"]');
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.setAttribute('rel', 'canonical');
                document.head.appendChild(canonical);
            }
            canonical.setAttribute('href', canonicalUrl);
        }

        // Twitter Card tags
        setMetaTag('twitter:card', 'summary_large_image');
        setMetaTag('twitter:title', fullTitle);
        setMetaTag('twitter:description', description);
        setMetaTag('twitter:image', ogImage);

        // Cleanup function
        return () => {
            // Reset to defaults when component unmounts
            document.title = DEFAULT_TITLE;
        };
    }, [fullTitle, description, keywords, ogImage, ogType, canonicalUrl, noIndex]);

    return null; // This component doesn't render anything
}
