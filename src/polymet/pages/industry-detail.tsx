import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Building2,
    ArrowRight,
    ArrowLeft,
    BarChart3,
    CheckCircle,
    AlertTriangle,
    Lightbulb,
    ChevronRight,
    MapPin,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getIndustryBySlug, formatInvestment, INDUSTRY_INSIGHTS } from '@/data/industry-data';
import { FRANCHISE_CATEGORIES, SMERGERS_BUSINESS_CATEGORIES } from '@/data/categories';
import { SEOHead } from '@/components/seo-head';
import { StructuredData } from '@/components/structured-data';
import { PageHero } from '@/components/page-hero';

function DynamicIcon({ name, className }: { name: string; className?: string }) {
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
    if (!IconComponent) return <Building2 className={className} />;
    return <IconComponent className={className} />;
}

export function IndustryDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const industry = slug ? getIndustryBySlug(slug) : undefined;

    const relatedFranchiseCategory = FRANCHISE_CATEGORIES.find(c => c.slug === slug);
    const relatedBusinessCategory = SMERGERS_BUSINESS_CATEGORIES.find(c => c.slug === slug);
    const otherIndustries = INDUSTRY_INSIGHTS.filter(i => i.slug !== slug).slice(0, 4);

    if (!industry) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Industry not found</h1>
                <p className="text-muted-foreground mb-8">
                    No details found in the table.
                </p>
                <Link to="/industries">
                    <Button>View all industries</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <SEOHead
                title={industry.seoTitle.replace(' | BizSearch', '')}
                description={industry.seoDescription}
                keywords={[industry.name, 'franchise', 'business opportunity', 'india', 'investment']}
                canonicalUrl={`https://bizsearch.in/industry/${industry.slug}`}
            />

            <StructuredData
                type="BreadcrumbList"
                items={[
                    { name: 'Home', url: 'https://bizsearch.in' },
                    { name: 'Industries', url: 'https://bizsearch.in/industries' },
                    { name: industry.name, url: `https://bizsearch.in/industry/${industry.slug}` }
                ]}
            />

            <PageHero
                title={industry.name}
                description={industry.description}
            >
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 -mt-2">
                    <Link to="/" className="hover:text-foreground">Home</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <Link to="/industries" className="hover:text-foreground">Industries</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="text-foreground">{industry.name}</span>
                </nav>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <DynamicIcon name={industry.icon} className="h-6 w-6 text-primary" />
                    </div>
                    {industry.stats.growthRate && (
                        <Badge variant="secondary" className="text-growth-green">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {industry.stats.growthRate} growth
                        </Badge>
                    )}
                    {industry.stats.totalBrands != null && (
                        <Badge variant="outline">{industry.stats.totalBrands} brands noted</Badge>
                    )}
                </div>
            </PageHero>

            <section className="container mx-auto px-4 py-10 md:py-12">
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-border">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                    Key highlights
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {industry.highlights.map((highlight, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-2 p-3 rounded-md bg-secondary/50"
                                        >
                                            <CheckCircle className="h-4 w-4 text-growth-green shrink-0 mt-0.5" />
                                            <span className="text-sm">{highlight}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-growth-green" />
                                    Market trends
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {industry.trends.map((trend, index) => (
                                        <li key={index} className="flex items-start gap-3 text-sm">
                                            <div className="h-1.5 w-1.5 bg-growth-green rounded-full mt-2 shrink-0" />
                                            <span>{trend}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Card className="border-border">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2 text-growth-green">
                                        <Lightbulb className="h-4 w-4" />
                                        Opportunities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {industry.opportunities.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-growth-green shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-border">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2 text-warning">
                                        <AlertTriangle className="h-4 w-4" />
                                        Challenges
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {industry.challenges.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm">
                                                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-border">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Cities often cited for {industry.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {industry.stats.topCities.map((city, index) => (
                                        <Badge key={index} variant="secondary">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {city}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card className="border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">At a glance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Market size</span>
                                    <span className="font-medium font-mono tabular-nums text-right">
                                        {industry.stats.marketSize}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Investment range</span>
                                    <span className="font-medium font-mono tabular-nums text-right">
                                        {formatInvestment(
                                            industry.stats.avgInvestment.min,
                                            industry.stats.avgInvestment.max
                                        )}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Typical ROI period</span>
                                    <span className="font-medium text-right">{industry.stats.avgROI}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Outlets noted</span>
                                    <span className="font-medium font-mono tabular-nums text-right">
                                        {industry.stats.totalOutlets}
                                    </span>
                                </div>
                                <div className="pt-2 space-y-2">
                                    <Button className="w-full" asChild>
                                        <Link to={`/franchises?category=${industry.slug}`}>
                                            View franchises
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link to={`/businesses?category=${industry.slug}`}>
                                            View businesses
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {(relatedFranchiseCategory || relatedBusinessCategory) && (
                            <Card className="border-border">
                                <CardHeader>
                                    <CardTitle className="text-base">Subcategories</CardTitle>
                                    <CardDescription>Related segments</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1 max-h-64 overflow-y-auto">
                                        {(relatedFranchiseCategory?.subcategories ||
                                            relatedBusinessCategory?.subcategories ||
                                            [])
                                            .slice(0, 10)
                                            .map((sub) => (
                                                <Link
                                                    key={sub.id}
                                                    to={`/franchises?category=${slug}&subcategory=${sub.slug}`}
                                                    className="block p-2 rounded-md hover:bg-muted text-sm transition-colors"
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-border">
                            <CardHeader>
                                <CardTitle className="text-base">Other industries</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {otherIndustries.map((ind) => (
                                    <Link
                                        key={ind.id}
                                        to={`/industry/${ind.slug}`}
                                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                                    >
                                        <DynamicIcon name={ind.icon} className="h-4 w-4 text-primary" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{ind.name}</p>
                                            <p className="text-xs text-muted-foreground">{ind.stats.growthRate}</p>
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Link>
                                ))}
                                <Link
                                    to="/industries"
                                    className="block text-center text-sm text-primary hover:underline pt-2"
                                >
                                    View all industries
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 pb-12">
                <Button variant="outline" onClick={() => navigate('/industries')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to industries
                </Button>
            </section>
        </div>
    );
}
