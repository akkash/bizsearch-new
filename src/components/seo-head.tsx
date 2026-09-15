import { useEffect } from 'react';
import { DEFAULT_OG_IMAGE, SITE_ORIGIN, siteUrl } from '@/lib/site-config';

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    ogType?: 'website' | 'article' | 'product';
    canonicalUrl?: string;
    noIndex?: boolean;
}

const DEFAULT_TITLE = 'BizSearch — Find the right franchise';
const DEFAULT_DESCRIPTION =
    'Discover franchises in India by investment, location, industry and expected returns. Compare opportunities and connect with brands. Businesses for sale also available.';

function toAbsolute(url: string): string {
    if (!url) return DEFAULT_OG_IMAGE;
    if (/^https?:\/\//i.test(url)) return url;
    return siteUrl(url.startsWith('/') ? url : `/${url}`);
}

/**
 * SEO Head Component
 * Updates document head with meta tags for SEO
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
    const fullTitle = title
        ? title.includes('BizSearch')
            ? title
            : `${title} | BizSearch`
        : DEFAULT_TITLE;
    const absoluteImage = toAbsolute(ogImage);
    const absoluteCanonical = canonicalUrl
        ? toAbsolute(canonicalUrl)
        : `${SITE_ORIGIN}${typeof window !== 'undefined' ? window.location.pathname : '/'}`;

    useEffect(() => {
        document.title = fullTitle;

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

        setMetaTag('description', description);

        if (keywords.length > 0) {
            setMetaTag('keywords', keywords.join(', '));
        }

        setMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

        setMetaTag('og:title', fullTitle, true);
        setMetaTag('og:description', description, true);
        setMetaTag('og:image', absoluteImage, true);
        setMetaTag('og:type', ogType, true);
        setMetaTag('og:site_name', 'BizSearch', true);
        setMetaTag('og:url', absoluteCanonical, true);

        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', absoluteCanonical);

        setMetaTag('twitter:card', 'summary_large_image');
        setMetaTag('twitter:title', fullTitle);
        setMetaTag('twitter:description', description);
        setMetaTag('twitter:image', absoluteImage);

        return () => {
            document.title = DEFAULT_TITLE;
        };
    }, [fullTitle, description, keywords, absoluteImage, ogType, absoluteCanonical, noIndex]);

    return null;
}
