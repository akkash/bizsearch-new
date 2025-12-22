import { useEffect } from 'react';

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
    url: 'https://bizsearch.in',
    logo: 'https://bizsearch.in/logo.png',
    description: 'India\'s leading marketplace for buying, selling, and investing in verified businesses and franchise opportunities.',
    sameAs: [
        'https://facebook.com/bizsearch',
        'https://twitter.com/bizsearch',
        'https://linkedin.com/company/bizsearch',
        'https://instagram.com/bizsearch'
    ],
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-1800-123-456',
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi']
    },
    address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Business Hub, MG Road',
        addressLocality: 'Bangalore',
        addressRegion: 'Karnataka',
        postalCode: '560001',
        addressCountry: 'IN'
    }
};

/**
 * Structured Data Component
 * Injects JSON-LD structured data for SEO
 * 
 * Usage:
 * <StructuredData type="Organization" />
 * <StructuredData type="BreadcrumbList" items={[...]} />
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
                        item: item.url
                    }))
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
                            addressCountry: props.address.country
                        }
                    }),
                    ...(props.telephone && { telephone: props.telephone }),
                    ...(props.priceRange && { priceRange: props.priceRange }),
                    ...(props.category && { '@category': props.category })
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
                        url: item.url
                    }))
                };
                break;

            default:
                return;
        }

        script.textContent = JSON.stringify(schema);

        // Remove existing script with same ID if present
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
            url: 'https://bizsearch.in',
            description: 'India\'s leading marketplace for buying, selling, and investing in verified businesses and franchise opportunities.',
            potentialAction: {
                '@type': 'SearchAction',
                target: {
                    '@type': 'EntryPoint',
                    urlTemplate: 'https://bizsearch.in/businesses?q={search_term_string}'
                },
                'query-input': 'required name=search_term_string'
            }
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
