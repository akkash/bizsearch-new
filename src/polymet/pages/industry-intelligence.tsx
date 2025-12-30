import { Link } from 'react-router-dom';
import {
    Building2,
    ArrowRight,
    BarChart3,
    Target,
    Zap,
    Users
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { INDUSTRY_INSIGHTS, INDUSTRY_SUMMARY_STATS, formatInvestment } from '@/data/industry-data';
import { SEOHead } from '@/components/seo-head';
import { StructuredData } from '@/components/structured-data';

// Dynamic icon component
function DynamicIcon({ name, className }: { name: string; className?: string }) {
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
    if (!IconComponent) return <Building2 className={className} />;
    return <IconComponent className={className} />;
}

export function IndustryIntelligencePage() {
    const formatNumber = (num: number) => {
        if (num >= 100000) return `${(num / 100000).toFixed(0)}L+`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
        return num.toString();
    };

    return (
        <div className="min-h-screen bg-background">
            <SEOHead
                title="Industry Intelligence - Franchise & Business Market Insights"
                description="Explore market insights, trends, and opportunities across 11+ industries. Get data on market size, growth rates, and investment requirements for franchises and businesses in India."
                keywords={['franchise industry', 'business market india', 'industry trends', 'investment opportunities']}
            />

            <StructuredData
                type="BreadcrumbList"
                items={[
                    { name: 'Home', url: 'https://bizsearch.in' },
                    { name: 'Industries', url: 'https://bizsearch.in/industries' }
                ]}
            />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
                <div className="container mx-auto px-4 py-16 md:py-24 relative">
                    <div className="max-w-3xl">
                        <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-400/30">
                            Industry Intelligence
                        </Badge>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">
                            Make Data-Driven Investment Decisions
                        </h1>
                        <p className="text-lg text-slate-300 mb-8">
                            Explore comprehensive market insights, trends, and opportunities across
                            India's top franchise and business sectors. Backed by real data.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/franchises">
                                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                                    Explore Franchises
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link to="/businesses">
                                <Button size="lg" variant="secondary" className="bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur-sm">
                                    Browse Businesses
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-white border-b">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-blue-600">
                                {formatNumber(INDUSTRY_SUMMARY_STATS.totalFranchiseBrands)}
                            </div>
                            <div className="text-sm text-muted-foreground">Franchise Brands</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-green-600">
                                {formatNumber(INDUSTRY_SUMMARY_STATS.totalBusinessListings)}
                            </div>
                            <div className="text-sm text-muted-foreground">Business Listings</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-purple-600">
                                {formatNumber(INDUSTRY_SUMMARY_STATS.totalInvestors)}
                            </div>
                            <div className="text-sm text-muted-foreground">Active Investors</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-orange-600">
                                {INDUSTRY_SUMMARY_STATS.avgDealClosureTime}
                            </div>
                            <div className="text-sm text-muted-foreground">Avg. Deal Time</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-teal-600">
                                {formatNumber(INDUSTRY_SUMMARY_STATS.successfulDeals)}
                            </div>
                            <div className="text-sm text-muted-foreground">Deals Closed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-rose-600">
                                {INDUSTRY_SUMMARY_STATS.citiesCovered}+
                            </div>
                            <div className="text-sm text-muted-foreground">Cities Covered</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Industry Cards Grid */}
            <section className="container mx-auto px-4 py-12">
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Explore Industries</h2>
                    <p className="text-muted-foreground">
                        Deep dive into market insights, trends, and investment opportunities by sector
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {INDUSTRY_INSIGHTS.map((industry) => (
                        <Link key={industry.id} to={`/industry/${industry.slug}`}>
                            <Card className="h-full hover:shadow-lg transition-all hover:border-blue-200 group cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <DynamicIcon name={industry.icon} className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                            {industry.stats.growthRate}
                                        </Badge>
                                    </div>
                                    <CardTitle className="mt-4 group-hover:text-blue-600 transition-colors">
                                        {industry.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {industry.description.slice(0, 120)}...
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Market Size</p>
                                            <p className="font-semibold text-sm">{industry.stats.marketSize}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Investment</p>
                                            <p className="font-semibold text-sm">
                                                {formatInvestment(industry.stats.avgInvestment.min, industry.stats.avgInvestment.max)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Brands</p>
                                            <p className="font-semibold text-sm">{industry.stats.totalBrands.toLocaleString()}+</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">ROI Period</p>
                                            <p className="font-semibold text-sm">{industry.stats.avgROI}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
                                        View Details <ArrowRight className="ml-1 h-4 w-4" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Ready to Start Your Entrepreneurial Journey?
                        </h2>
                        <p className="text-blue-100 mb-8">
                            Connect with verified franchise owners and business sellers.
                            Get personalized recommendations based on your investment capacity and interests.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/signup">
                                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                                    Create Free Account
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button size="lg" variant="secondary" className="bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur-sm">
                                    Talk to an Advisor
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why BizSearch */}
            <section className="container mx-auto px-4 py-12">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Why Choose BizSearch?</h2>
                    <p className="text-muted-foreground">Trusted by thousands of investors and entrepreneurs</p>
                </div>
                <div className="grid md:grid-cols-4 gap-6">
                    <Card className="text-center p-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Data-Driven Insights</h3>
                        <p className="text-sm text-muted-foreground">Market intelligence backed by comprehensive research</p>
                    </Card>
                    <Card className="text-center p-6">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Verified Listings</h3>
                        <p className="text-sm text-muted-foreground">All businesses and franchises are verified</p>
                    </Card>
                    <Card className="text-center p-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Expert Advisors</h3>
                        <p className="text-sm text-muted-foreground">Get guidance from experienced business advisors</p>
                    </Card>
                    <Card className="text-center p-6">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Fast Transactions</h3>
                        <p className="text-sm text-muted-foreground">Streamlined process for quick deal closures</p>
                    </Card>
                </div>
            </section>
        </div>
    );
}
