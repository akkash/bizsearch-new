import { useEffect } from 'react';
import { CONTACT_EMAIL, SITE_ORIGIN, siteUrl } from '@/lib/site-config';

interface BreadcrumbItem {
    name: string;
    url: string;
}

interface OrganizationSchemaProps {
    type: 'Organization';
}

interface BreadcrumbSchemaProps {
    type: 'BreadcrumbList';
    items: BreadcrumbItem[];
}

interface LocalBusinessSchemaProps {
    type: 'LocalBusiness';
    name: string;
    description: string;
    address?: {
        streetAddress?: string;
        city: string;
        state: string;
        postalCode?: string;
        country: string;
    };
    telephone?: string;
    priceRange?: string;
    category?: string;
}

interface ItemListSchemaProps {
    type: 'ItemList';
    name: string;
    items: Array<{
        name: string;
        url: string;
    }>;
}

type StructuredDataProps =
    | OrganizationSchemaProps
    | BreadcrumbSchemaProps
    | LocalBusinessSchemaProps
    | ItemListSchemaProps;

const ORGANIZATION_SCHEMA = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BizSearch',
    url: SITE_ORIGIN,
    logo: siteUrl('/logo.png'),
    description:
        'BizSearch is a franchise and business marketplace in India. Browse public listings, compare opportunities, and connect with brands.',
    email: CONTACT_EMAIL,
    contactPoint: {
        '@type': 'ContactPoint',
        email: CONTACT_EMAIL,
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi'],
    },
};

/**
 * Structured Data Component
 * Injects JSON-LD structured data for SEO
 */
export function StructuredData(props: StructuredDataProps) {
    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = `structured-data-${props.type}`;

        let schema: object;

        switch (props.type) {
            case 'Organization':
                schema = ORGANIZATION_SCHEMA;
                break;

            case 'BreadcrumbList':
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: props.items.map((item, index) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        name: item.name,
                        item: item.url.startsWith('http') ? item.url : siteUrl(item.url),
                    })),
                };
                break;

            case 'LocalBusiness':
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'LocalBusiness',
                    name: props.name,
                    description: props.description,
                    ...(props.address && {
                        address: {
                            '@type': 'PostalAddress',
                            streetAddress: props.address.streetAddress,
                            addressLocality: props.address.city,
                            addressRegion: props.address.state,
                            postalCode: props.address.postalCode,
                            addressCountry: props.address.country,
                        },
                    }),
                    ...(props.telephone && { telephone: props.telephone }),
                    ...(props.priceRange && { priceRange: props.priceRange }),
                    ...(props.category && { '@category': props.category }),
                };
                break;

            case 'ItemList':
                schema = {
                    '@context': 'https://schema.org',
                    '@type': 'ItemList',
                    name: props.name,
                    numberOfItems: props.items.length,
                    itemListElement: props.items.map((item, index) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        name: item.name,
                        url: item.url.startsWith('http') ? item.url : siteUrl(item.url),
                    })),
                };
                break;

            default:
                return;
        }

        script.textContent = JSON.stringify(schema);

        const existing = document.getElementById(script.id);
        if (existing) {
            existing.remove();
        }

        document.head.appendChild(script);

        return () => {
            const element = document.getElementById(script.id);
            if (element) {
                element.remove();
            }
        };
    }, [props]);

    return null;
}

/**
 * Website Schema - Add to root layout
 */
export function WebsiteSchema() {
    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'structured-data-website';

        const schema = {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'BizSearch',
            url: SITE_ORIGIN,
            description:
                'Search franchises in India by investment, location, industry, and expected returns. Businesses for sale are also listed.',
            potentialAction: {
                '@type': 'SearchAction',
                target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${SITE_ORIGIN}/franchises?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
            },
        };

        script.textContent = JSON.stringify(schema);

        const existing = document.getElementById(script.id);
        if (existing) {
            existing.remove();
        }

        document.head.appendChild(script);

        return () => {
            const element = document.getElementById(script.id);
            if (element) {
                element.remove();
            }
        };
    }, []);

    return null;
}
