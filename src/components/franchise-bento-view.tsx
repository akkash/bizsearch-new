import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    MapPin,
    Building2,
    ChevronLeft,
    ChevronRight,
    Wallet,
    TrendingUp,
    Clock,
    CheckCircle,
    Shield,
    Star,
    Search,
    IndianRupee,
    Store,
    GraduationCap,
    Headphones,
    Package,
    Megaphone,
    Palette,
    Settings,
    Users,
    Award,
    MapIcon,
    AlertCircle,
    HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FranchiseBentoViewProps {
    franchise: any;
    className?: string;
}

// Format currency in Indian style
function formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return 'N/A';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
}

// Display value or N/A
function displayValue(value: any, suffix: string = ''): string {
    if (value === null || value === undefined || value === '') return 'N/A';
    return `${value}${suffix}`;
}

export function FranchiseBentoView({ franchise, className }: FranchiseBentoViewProps) {
    const [brandSlideIndex, setBrandSlideIndex] = useState(0);
    const [territorySearch, setTerritorySearch] = useState('');

    // Calculate values - no fallbacks
    const currentYear = new Date().getFullYear();
    const establishedYear = franchise.establishedYear || franchise.established_year;
    const yearsExperience = establishedYear ? currentYear - establishedYear : null;

    const totalInvestmentMin = franchise.investmentMin || franchise.total_investment_min;
    const totalInvestmentMax = franchise.investmentMax || franchise.total_investment_max;
    const franchiseFee = franchise.franchiseFee || franchise.franchise_fee;
    const royalty = franchise.royaltyPercentage || franchise.royalty_percentage;

    // Investment breakdown - only if data exists
    const hasInvestmentData = franchiseFee || totalInvestmentMax;
    const investmentBreakdown = hasInvestmentData ? [
        { label: 'Franchise Fee', amount: franchiseFee, percent: 25, color: 'bg-trust-blue' },
        { label: 'Interiors & Branding', amount: totalInvestmentMax ? totalInvestmentMax * 0.25 : null, percent: 25, color: 'bg-primary/70' },
        { label: 'Equipment & Setup', amount: totalInvestmentMax ? totalInvestmentMax * 0.35 : null, percent: 35, color: 'bg-growth-green' },
        { label: 'Working Capital', amount: totalInvestmentMax ? totalInvestmentMax * 0.15 : null, percent: 15, color: 'bg-growth-green/60' },
    ] : null;

    // ROI data
    const breakeven = franchise.breakevenPeriod || franchise.breakeven_period;
    const projectedRoi = franchise.expectedRoiPercentage || franchise.expected_roi_percentage;

    // Brand carousel slides - only add slides that have content
    const brandSlides = [
        franchise.description && {
            type: 'origin',
            title: 'The Origin Story',
            content: franchise.description
        },
        (franchise.mission) && {
            type: 'mission',
            title: 'Mission & Values',
            content: franchise.mission
        },
        (franchise.founderBio || franchise.founder_bio) && {
            type: 'founder',
            title: 'Leadership',
            content: franchise.founderBio || franchise.founder_bio
        },
    ].filter(Boolean);

    // Support features - these are static as they represent standard franchise support
    const preOpeningSupport = [
        { name: 'Site Selection', icon: MapPin },
        { name: 'Store Design & Layout', icon: Palette },
        { name: 'Equipment Setup', icon: Settings },
        { name: 'Initial Training', icon: GraduationCap },
    ];

    const postOpeningSupport = [
        { name: 'Marketing Launch', icon: Megaphone },
        { name: 'Supply Chain Access', icon: Package },
        { name: 'Ongoing Training', icon: Users },
        { name: 'Support Helpline', icon: Headphones },
    ];

    // Territories - from database
    const allTerritories = franchise.territories || franchise.territory_availability || [];
    const hasTerritoriesData = allTerritories.length > 0;

    // Territory search
    const territoryResult = useMemo(() => {
        if (!hasTerritoriesData) {
            return { found: null, suggestions: [], message: 'Territory data not available' };
        }

        if (!territorySearch.trim()) {
            return { found: null, suggestions: allTerritories.filter((t: any) => t.status === 'available').slice(0, 4) };
        }

        const searchLower = territorySearch.toLowerCase();
        const exactMatch = allTerritories.find((t: any) => t.city?.toLowerCase() === searchLower);

        if (exactMatch) {
            if (exactMatch.status === 'taken' || exactMatch.status === 'limited') {
                const available = allTerritories.filter((t: any) => t.status === 'available');
                return {
                    found: exactMatch,
                    suggestions: available.slice(0, 3),
                    message: `${exactMatch.city} is ${exactMatch.status}. Consider these nearby cities:`
                };
            }
            return { found: exactMatch, suggestions: [] };
        }

        const partialMatches = allTerritories.filter((t: any) =>
            t.city?.toLowerCase().includes(searchLower) && t.status === 'available'
        );

        if (partialMatches.length > 0) {
            return { found: null, suggestions: partialMatches.slice(0, 4) };
        }

        return {
            found: null,
            suggestions: allTerritories.filter((t: any) => t.status === 'available').slice(0, 3),
            message: 'City not found. Available territories:'
        };
    }, [territorySearch, allTerritories, hasTerritoriesData]);

    // Awards/recognition from database
    const awards = franchise.awards || [];
    const hasAwards = awards.length > 0;

    const totalOutlets = franchise.outlets || franchise.total_outlets;
    const availableTerritories = franchise.availableTerritories || franchise.available_territories_count;

    return (
        <div className={cn("space-y-6", className)}>
            {/* Hero Section */}
            <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-muted">
                {(franchise.images?.[0] || franchise.logo || franchise.logo_url) ? (
                    <img
                        src={franchise.images?.[0] || franchise.logo || franchise.logo_url}
                        alt={franchise.brandName || franchise.brand_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Store className="h-24 w-24 text-muted-foreground/30" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--trust-blue-dark))] via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-4">
                        {(franchise.logo || franchise.logo_url) ? (
                            <img
                                src={franchise.logo || franchise.logo_url}
                                alt={franchise.brandName || franchise.brand_name}
                                className="h-16 w-16 rounded-xl border-4 border-white shadow-lg object-cover"
                            />
                        ) : (
                            <div className="h-16 w-16 rounded-xl border-4 border-white shadow-lg bg-white flex items-center justify-center">
                                <Store className="h-8 w-8 text-primary" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-white">{franchise.brandName || franchise.brand_name || 'Franchise Name'}</h1>
                            <p className="text-white/80">
                                {franchise.industry || 'Industry N/A'}
                                {establishedYear && ` • Est. ${establishedYear}`}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                    {franchise.featured && <Badge className="bg-amber-500 text-white">Featured</Badge>}
                    {franchise.trending && <Badge className="bg-rose-500 text-white">Trending</Badge>}
                    {(franchise.verificationStatus === 'verified' || franchise.verification_status === 'verified') && (
                        <Badge className="bg-growth-green text-white"><Shield className="h-3 w-3 mr-1" />Verified</Badge>
                    )}
                </div>
            </div>

            {/* ============ CARD A: FINANCIALS ============ */}
            <Card className="overflow-hidden border-border">
                <CardHeader className="gradient-trust text-primary-foreground pb-2">
                    <div className="flex items-center gap-2">
                        <IndianRupee className="h-5 w-5" />
                        <CardTitle className="text-lg">Can I Afford It?</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
                        {/* LEFT: Investment Breakdown */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Wallet className="h-4 w-4 text-trust-blue" />
                                <span className="text-sm font-medium text-muted-foreground">Total Investment</span>
                            </div>
                            <div className="text-3xl font-bold text-foreground mb-4">
                                {totalInvestmentMin || totalInvestmentMax
                                    ? `${formatCurrency(totalInvestmentMin)} - ${formatCurrency(totalInvestmentMax)}`
                                    : 'Investment details not available'
                                }
                            </div>

                            {/* Color-coded breakdown bar */}
                            {investmentBreakdown ? (
                                <>
                                    <div className="flex h-3 rounded-full overflow-hidden mb-3">
                                        {investmentBreakdown.map((item, i) => (
                                            <div
                                                key={i}
                                                className={cn(item.color, "transition-all hover:opacity-80")}
                                                style={{ width: `${item.percent}%` }}
                                                title={`${item.label}: ${formatCurrency(item.amount)}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Legend */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {investmentBreakdown.map((item) => (
                                            <div key={item.label} className="flex items-center gap-2 text-sm">
                                                <div className={cn("w-3 h-3 rounded", item.color)} />
                                                <span className="text-muted-foreground truncate">{item.label}</span>
                                                <span className="font-medium ml-auto">{formatCurrency(item.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <HelpCircle className="h-4 w-4" />
                                    <span>Detailed breakdown not available</span>
                                </div>
                            )}

                            <div className="mt-4 pt-3 border-t border-border text-sm text-muted-foreground">
                                {royalty ? `+ ${royalty}% monthly royalty on gross sales` : 'Royalty information not available'}
                            </div>
                        </div>

                        {/* RIGHT: ROI & Break-even */}
                        <div className="p-6 bg-accent/30">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-4 w-4 text-growth-green" />
                                <span className="text-sm font-medium text-muted-foreground">Return on Investment</span>
                            </div>

                            {/* Break-even - PROMINENT BADGE */}
                            <div className="bg-accent rounded-xl p-4 mb-4 text-center border border-accent-foreground/20">
                                {breakeven ? (
                                    <>
                                        <Badge className="bg-growth-green text-white text-lg px-4 py-1 mb-2">
                                            <Clock className="h-4 w-4 mr-2" />
                                            Break-even: {breakeven}
                                        </Badge>
                                        <p className="text-xs text-accent-foreground">
                                            Recover your investment and start profiting
                                        </p>
                                    </>
                                ) : (
                                    <div className="text-muted-foreground">
                                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>Break-even period not specified</p>
                                    </div>
                                )}
                            </div>

                            {/* ROI Percentage */}
                            <div className="text-center">
                                {projectedRoi ? (
                                    <>
                                        <div className="text-4xl font-bold text-growth-green">{projectedRoi}%</div>
                                        <div className="text-sm text-muted-foreground">Expected Annual ROI (Year 3+)</div>
                                    </>
                                ) : (
                                    <div className="text-muted-foreground">
                                        <p>ROI projections not available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ============ CARD B: CREDIBILITY ============ */}
            <Card className="overflow-hidden border-border">
                <CardHeader className="bg-secondary pb-2">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-trust-blue" />
                        <CardTitle className="text-lg">Is This Brand Reliable?</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
                        {/* LEFT: Brand Story Carousel */}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-trust-blue" />
                                    <span className="font-medium">The Brand</span>
                                </div>
                                {brandSlides.length > 1 && (
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => setBrandSlideIndex(Math.max(0, brandSlideIndex - 1))}
                                            disabled={brandSlideIndex === 0}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => setBrandSlideIndex(Math.min(brandSlides.length - 1, brandSlideIndex + 1))}
                                            disabled={brandSlideIndex === brandSlides.length - 1}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {brandSlides.length > 0 ? (
                                <>
                                    <div className="min-h-[120px] mb-3">
                                        <Badge variant="outline" className="mb-2 text-xs border-primary text-primary">
                                            {brandSlides[brandSlideIndex].title}
                                        </Badge>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {brandSlides[brandSlideIndex].content}
                                        </p>
                                    </div>

                                    {/* Carousel dots */}
                                    {brandSlides.length > 1 && (
                                        <div className="flex justify-center gap-1">
                                            {brandSlides.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setBrandSlideIndex(i)}
                                                    className={cn(
                                                        "w-2 h-2 rounded-full transition-colors",
                                                        i === brandSlideIndex ? "bg-primary" : "bg-muted-foreground/30"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="min-h-[120px] flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>Brand story not available</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Network Map + Awards */}
                        <div className="p-6">
                            {/* Network with visual dots */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapIcon className="h-4 w-4 text-trust-blue" />
                                    <span className="font-medium">Network Presence</span>
                                </div>
                                <div className="bg-secondary rounded-lg p-3">
                                    {totalOutlets ? (
                                        <>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-2xl font-bold">{totalOutlets}+</span>
                                                <span className="text-sm text-muted-foreground">Outlets Pan-India</span>
                                            </div>
                                            {/* Visual dot cluster */}
                                            <div className="flex flex-wrap gap-0.5 mb-2">
                                                {Array(Math.min(60, totalOutlets)).fill(0).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            i < 20 ? "bg-primary" : i < 40 ? "bg-primary/70" : "bg-primary/40"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-2 text-muted-foreground">
                                            <p>Outlet count not specified</p>
                                        </div>
                                    )}
                                    <div className="flex gap-4 text-xs text-muted-foreground">
                                        {yearsExperience && <span>{yearsExperience}+ years</span>}
                                        {establishedYear && <><span>•</span><span>Est. {establishedYear}</span></>}
                                        {franchise.countries_operating > 1 && (
                                            <>
                                                <span>•</span>
                                                <span>{franchise.countries_operating} countries</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Awards/Recognition */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="h-4 w-4 text-amber-500" />
                                    <span className="font-medium">Recognition</span>
                                </div>
                                {hasAwards ? (
                                    <div className="space-y-2">
                                        {awards.slice(0, 2).map((award: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 rounded-md p-2">
                                                <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium truncate">{award.name}</div>
                                                    <div className="text-xs text-muted-foreground">{award.org}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-2 text-muted-foreground bg-muted/50 rounded-md">
                                        <p className="text-sm">No awards listed</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ============ CARD C: OPERATIONS ============ */}
            <Card className="overflow-hidden border-border">
                <CardHeader className="bg-accent pb-2">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-accent-foreground" />
                        <CardTitle className="text-lg text-accent-foreground">What Do I Get?</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
                        {/* LEFT: Support Checklist (Pre/Post Opening) */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <GraduationCap className="h-4 w-4 text-growth-green" />
                                <span className="font-medium">Support & Training</span>
                                <Badge variant="secondary" className="ml-auto text-xs bg-accent text-accent-foreground">Standard</Badge>
                            </div>

                            {/* Pre-Opening */}
                            <div className="mb-4">
                                <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Pre-Opening</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {preOpeningSupport.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.name} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
                                                <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                                                <span className="text-sm truncate">{item.name}</span>
                                                <CheckCircle className="h-3 w-3 text-growth-green ml-auto flex-shrink-0" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Post-Opening */}
                            <div>
                                <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Post-Opening</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {postOpeningSupport.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.name} className="flex items-center gap-2 bg-accent/50 p-2 rounded-md">
                                                <Icon className="h-4 w-4 text-accent-foreground flex-shrink-0" />
                                                <span className="text-sm truncate">{item.name}</span>
                                                <CheckCircle className="h-3 w-3 text-growth-green ml-auto flex-shrink-0" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Territory Search Tool */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="h-4 w-4 text-growth-green" />
                                <span className="font-medium">Check Territory Availability</span>
                            </div>

                            {hasTerritoriesData ? (
                                <>
                                    {/* Search Input */}
                                    <div className="relative mb-4">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Enter your city..."
                                            value={territorySearch}
                                            onChange={(e) => setTerritorySearch(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>

                                    {/* Results */}
                                    <div className="space-y-2 min-h-[140px]">
                                        {territoryResult.found && territoryResult.found.status === 'available' && (
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent border border-accent-foreground/20">
                                                <CheckCircle className="h-5 w-5 text-growth-green" />
                                                <div>
                                                    <div className="font-medium text-accent-foreground">{territoryResult.found.city} is Available!</div>
                                                    <div className="text-xs text-accent-foreground/70">Click "Get Details" to secure this territory</div>
                                                </div>
                                            </div>
                                        )}

                                        {territoryResult.message && (
                                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span>{territoryResult.message}</span>
                                            </div>
                                        )}

                                        {territoryResult.suggestions.length > 0 && (
                                            <div className="space-y-1">
                                                {!territoryResult.found && !territoryResult.message && (
                                                    <div className="text-xs text-muted-foreground mb-2">Available territories:</div>
                                                )}
                                                {territoryResult.suggestions.map((t: any) => (
                                                    <div
                                                        key={t.city}
                                                        className="flex items-center justify-between p-2 rounded-md bg-secondary hover:bg-muted cursor-pointer transition-colors"
                                                        onClick={() => setTerritorySearch(t.city)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm">{t.city}</span>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs border-growth-green/50 text-growth-green">
                                                            Available
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="min-h-[140px] flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>Territory data not available</p>
                                        <p className="text-xs mt-1">Contact franchise for availability</p>
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Total available:</span>
                                <span className="font-semibold text-growth-green">
                                    {availableTerritories ? `${availableTerritories} cities` : 'Contact for details'}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
