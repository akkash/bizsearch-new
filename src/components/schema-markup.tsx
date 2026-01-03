import { useEffect, useId } from 'react';

// Helper hook to inject JSON-LD into document head
function useJsonLd(schema: object) {
    const id = useId();

    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = `jsonld-${id}`;
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);

        return () => {
            const existingScript = document.getElementById(`jsonld-${id}`);
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
        };
    }, [schema, id]);
}

interface BusinessSchemaProps {
    business: {
        id: string;
        name: string;
        description?: string;
        industry?: string;
        location?: string;
        city?: string;
        state?: string;
        price?: number;
        revenue?: number;
        established_year?: number;
        images?: string[];
        slug?: string;
        verified_at?: string;
    };
}

export function BusinessSchema({ business }: BusinessSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `https://bizsearch.in/business/${business.slug || business.id}`,
        name: business.name,
        description: business.description,
        image: business.images?.[0],
        address: {
            '@type': 'PostalAddress',
            addressLocality: business.city,
            addressRegion: business.state,
            addressCountry: 'IN',
        },
        priceRange: business.price ? `₹${(business.price / 100000).toFixed(1)}L` : undefined,
        foundingDate: business.established_year ? `${business.established_year}` : undefined,
        ...(business.verified_at && {
            award: 'BizSearch Verified Business',
        }),
    };

    // Remove undefined values
    const cleanSchema = JSON.parse(JSON.stringify(schema));
    useJsonLd(cleanSchema);

    return null;
}

interface FranchiseSchemaProps {
    franchise: {
        id: string;
        brand_name: string;
        description?: string;
        industry?: string;
        investment_range_min?: number;
        investment_range_max?: number;
        franchise_fee?: number;
        established_year?: number;
        total_outlets?: number;
        logo_url?: string;
        slug?: string;
        verified_at?: string;
    };
}

export function FranchiseSchema({ franchise }: FranchiseSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `https://bizsearch.in/franchise/${franchise.slug || franchise.id}`,
        name: franchise.brand_name,
        description: franchise.description,
        logo: franchise.logo_url,
        foundingDate: franchise.established_year ? `${franchise.established_year}` : undefined,
        numberOfEmployees: franchise.total_outlets ? {
            '@type': 'QuantitativeValue',
            name: 'Franchise Outlets',
            value: franchise.total_outlets,
        } : undefined,
        makesOffer: {
            '@type': 'Offer',
            name: `${franchise.brand_name} Franchise Opportunity`,
            description: `Franchise opportunity in ${franchise.industry}`,
            price: franchise.investment_range_min,
            priceCurrency: 'INR',
            priceSpecification: franchise.investment_range_max ? {
                '@type': 'PriceSpecification',
                minPrice: franchise.investment_range_min,
                maxPrice: franchise.investment_range_max,
                priceCurrency: 'INR',
            } : undefined,
        },
        ...(franchise.verified_at && {
            award: 'BizSearch Verified Franchise',
        }),
    };

    const cleanSchema = JSON.parse(JSON.stringify(schema));
    useJsonLd(cleanSchema);

    return null;
}

interface BreadcrumbSchemaProps {
    items: Array<{
        name: string;
        url: string;
    }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `https://bizsearch.in${item.url}`,
        })),
    };

    useJsonLd(schema);
    return null;
}

interface FAQSchemaProps {
    faqs: Array<{
        question: string;
        answer: string;
    }>;
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    useJsonLd(schema);
    return null;
}

// Organization schema for the main site
export function OrganizationSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'BizSearch',
        url: 'https://bizsearch.in',
        logo: 'https://bizsearch.in/logo.png',
        description: 'India\'s leading platform for buying and selling businesses and franchise opportunities',
        sameAs: [
            'https://twitter.com/bizsearchin',
            'https://linkedin.com/company/bizsearch',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+91-XXXXXXXXXX',
            contactType: 'customer service',
            areaServed: 'IN',
            availableLanguage: ['English', 'Hindi'],
        },
    };

    useJsonLd(schema);
    return null;
}

// WebSite schema with search action
export function WebsiteSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'BizSearch',
        url: 'https://bizsearch.in',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://bizsearch.in/search?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
        },
    };

    useJsonLd(schema);
    return null;
}
