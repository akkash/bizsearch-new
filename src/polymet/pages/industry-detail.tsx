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
    MapPin
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

// Dynamic icon component
function DynamicIcon({ name, className }: { name: string; className?: string }) {
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
    if (!IconComponent) return <Building2 className={className} />;
    return <IconComponent className={className} />;
}

export function IndustryDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const industry = slug ? getIndustryBySlug(slug) : undefined;

    // Get related categories from franchise and business data
    const relatedFranchiseCategory = FRANCHISE_CATEGORIES.find(c => c.slug === slug);
    const relatedBusinessCategory = SMERGERS_BUSINESS_CATEGORIES.find(c => c.slug === slug);

    // Get other industries for navigation
    const otherIndustries = INDUSTRY_INSIGHTS.filter(i => i.slug !== slug).slice(0, 4);

    if (!industry) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Industry Not Found</h1>
                <p className="text-muted-foreground mb-8">
                    The industry you're looking for doesn't exist.
                </p>
                <Link to="/industries">
                    <Button>View All Industries</Button>
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

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-50 to-blue-50 border-b">
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        <Link to="/" className="hover:text-foreground">Home</Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link to="/industries" className="hover:text-foreground">Industries</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">{industry.name}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left Column */}
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-4 bg-white rounded-xl shadow-sm">
                                    <DynamicIcon name={industry.icon} className="h-10 w-10 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-4xl font-bold">{industry.name}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className="bg-green-100 text-green-700 border-green-200">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            {industry.stats.growthRate} Growth
                                        </Badge>
                                        <Badge variant="outline">{industry.stats.totalBrands}+ Brands</Badge>
                                    </div>
                                </div>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                {industry.description}
                            </p>
                        </div>

                        {/* Right Column - Quick Stats */}
                        <div className="md:w-80">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Market Size</span>
                                        <span className="font-bold text-blue-600">{industry.stats.marketSize}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Investment Range</span>
                                        <span className="font-semibold">
                                            {formatInvestment(industry.stats.avgInvestment.min, industry.stats.avgInvestment.max)}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Avg. ROI Period</span>
                                        <span className="font-semibold">{industry.stats.avgROI}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Total Outlets</span>
                                        <span className="font-semibold">{industry.stats.totalOutlets}</span>
                                    </div>
                                    <div className="pt-2">
                                        <Link to={`/franchises?category=${industry.slug}`}>
                                            <Button className="w-full">
                                                View Franchises
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="container mx-auto px-4 py-12">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Key Highlights */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                    Key Highlights
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {industry.highlights.map((highlight, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg">
                                            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">{highlight}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Market Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    Current Market Trends
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {industry.trends.map((trend, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                            <span>{trend}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Opportunities & Challenges */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-700">
                                        <Lightbulb className="h-5 w-5" />
                                        Opportunities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {industry.opportunities.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-amber-700">
                                        <AlertTriangle className="h-5 w-5" />
                                        Challenges
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {industry.challenges.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm">
                                                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Cities */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-rose-600" />
                                    Top Cities for {industry.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {industry.stats.topCities.map((city, index) => (
                                        <Badge key={index} variant="secondary" className="px-3 py-1">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {city}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Subcategories */}
                        {(relatedFranchiseCategory || relatedBusinessCategory) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Subcategories</CardTitle>
                                    <CardDescription>Explore specific segments</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {(relatedFranchiseCategory?.subcategories || relatedBusinessCategory?.subcategories || [])
                                            .slice(0, 10)
                                            .map((sub) => (
                                                <Link
                                                    key={sub.id}
                                                    to={`/franchises?category=${slug}&subcategory=${sub.slug}`}
                                                    className="block p-2 rounded hover:bg-muted text-sm transition-colors"
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))
                                        }
                                        {((relatedFranchiseCategory?.subcategories.length || 0) > 10 ||
                                            (relatedBusinessCategory?.subcategories.length || 0) > 10) && (
                                                <Link
                                                    to={`/franchises?category=${slug}`}
                                                    className="block p-2 text-sm text-blue-600 hover:underline"
                                                >
                                                    View all subcategories →
                                                </Link>
                                            )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* CTA Card */}
                        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-semibold mb-2">
                                    Ready to Invest in {industry.name}?
                                </h3>
                                <p className="text-blue-100 text-sm mb-4">
                                    Browse verified franchise and business opportunities in this sector.
                                </p>
                                <div className="space-y-2">
                                    <Link to={`/franchises?category=${industry.slug}`}>
                                        <Button variant="secondary" className="w-full">
                                            View Franchises
                                        </Button>
                                    </Link>
                                    <Link to={`/businesses?category=${industry.slug}`}>
                                        <Button variant="outline" className="w-full bg-transparent border-white/30 text-white hover:bg-white/10">
                                            View Businesses
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Other Industries */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Explore Other Industries</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {otherIndustries.map((ind) => (
                                    <Link
                                        key={ind.id}
                                        to={`/industry/${ind.slug}`}
                                        className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors"
                                    >
                                        <DynamicIcon name={ind.icon} className="h-5 w-5 text-blue-600" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{ind.name}</p>
                                            <p className="text-xs text-muted-foreground">{ind.stats.growthRate}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </Link>
                                ))}
                                <Link to="/industries" className="block text-center text-sm text-blue-600 hover:underline pt-2">
                                    View All Industries
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Back Button */}
            <section className="container mx-auto px-4 pb-12">
                <Button variant="outline" onClick={() => navigate('/industries')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Industries
                </Button>
            </section>
        </div>
    );
}
