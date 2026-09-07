import { Link } from 'react-router-dom';
import {
    Building2,
    ArrowRight,
    BarChart3,
    Target,
    Search,
    Shield,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { INDUSTRY_INSIGHTS, formatInvestment } from '@/data/industry-data';
import { SEOHead } from '@/components/seo-head';
import { StructuredData } from '@/components/structured-data';
import { PageHero } from '@/components/page-hero';

function DynamicIcon({ name, className }: { name: string; className?: string }) {
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
    if (!IconComponent) return <Building2 className={className} />;
    return <IconComponent className={className} />;
}

export function IndustryIntelligencePage() {
    return (
        <div className="min-h-screen bg-background">
            <SEOHead
                title="Industry Intelligence - Franchise & Business Market Insights"
                description="Explore market insights, trends, and opportunities across industries. Review market context, growth notes, and investment ranges for franchises and businesses."
                keywords={['franchise industry', 'business market india', 'industry trends', 'investment opportunities']}
            />

            <StructuredData
                type="BreadcrumbList"
                items={[
                    { name: 'Home', url: 'https://bizsearch.in' },
                    { name: 'Industries', url: 'https://bizsearch.in/industries' }
                ]}
            />

            <PageHero
                eyebrow="Industries"
                title="Industry context for buyers and franchisors"
                description="Sector overviews with market notes, typical investment ranges, and links to franchise and business listings."
            >
                <div className="flex flex-wrap gap-3">
                    <Button asChild>
                        <Link to="/franchises">
                            Explore franchises
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link to="/businesses">Browse businesses</Link>
                    </Button>
                </div>
            </PageHero>

            <section className="container mx-auto px-4 py-10 md:py-14">
                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">
                        Explore industries
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Open a sector for highlights, trends, and listing links.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {INDUSTRY_INSIGHTS.map((industry) => (
                        <Link key={industry.id} to={`/industry/${industry.slug}`}>
                            <Card className="h-full border-border hover:border-primary/40 transition-colors group">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="p-2.5 bg-primary/10 rounded-md">
                                            <DynamicIcon name={industry.icon} className="h-5 w-5 text-primary" />
                                        </div>
                                        {industry.stats.growthRate && (
                                            <Badge variant="secondary" className="text-growth-green">
                                                {industry.stats.growthRate}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="mt-3 text-lg group-hover:text-primary transition-colors">
                                        {industry.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {industry.description.slice(0, 120)}…
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                        <div>
                                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                                Market size
                                            </p>
                                            <p className="font-medium font-mono tabular-nums">
                                                {industry.stats.marketSize}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                                Investment
                                            </p>
                                            <p className="font-medium font-mono tabular-nums">
                                                {formatInvestment(
                                                    industry.stats.avgInvestment.min,
                                                    industry.stats.avgInvestment.max
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                                Brands noted
                                            </p>
                                            <p className="font-medium font-mono tabular-nums">
                                                {industry.stats.totalBrands.toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                                Typical ROI period
                                            </p>
                                            <p className="font-medium">{industry.stats.avgROI}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-sm text-primary font-medium">
                                        View details <ArrowRight className="ml-1 h-4 w-4" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="border-t border-border bg-card">
                <div className="container mx-auto px-4 py-10 md:py-14">
                    <div className="max-w-2xl mb-8">
                        <h2 className="text-xl font-bold tracking-tight mb-1">
                            How BizSearch helps
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Product capabilities for researching sectors and listings.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                icon: BarChart3,
                                title: 'Sector overviews',
                                description: 'Market notes and typical investment ranges by industry',
                            },
                            {
                                icon: Shield,
                                title: 'Verified listings',
                                description: 'Business and franchise listings with verification status',
                            },
                            {
                                icon: Search,
                                title: 'Search & filters',
                                description: 'Narrow by category, location, and investment band',
                            },
                            {
                                icon: Target,
                                title: 'Compare listings',
                                description: 'Side-by-side fees, investment, and requirements',
                            },
                        ].map((item) => (
                            <Card key={item.title} className="border-border">
                                <CardContent className="pt-6">
                                    <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                                        <item.icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button asChild>
                            <Link to="/signup">Create account</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to="/contact">Contact us</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
