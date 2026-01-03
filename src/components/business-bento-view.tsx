import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    MapPin,
    Building2,
    Calendar,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    Shield,
    IndianRupee,
    Store,
    ChevronLeft,
    ChevronRight,
    Wallet,
    Package,
    Briefcase,
    Users,
    FileText,
    Home,
    Key,
    ArrowUpRight,
    Lightbulb,
    GraduationCap,
    AlertTriangle,
    Zap,
    HelpCircle,
    XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface BusinessBentoViewProps {
    business: any;
    className?: string;
}

// Format currency in Indian style
function formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return 'N/A';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
}

export function BusinessBentoView({ business, className }: BusinessBentoViewProps) {
    const [galleryIndex, setGalleryIndex] = useState(0);

    // Calculate values - no fallbacks
    const currentYear = new Date().getFullYear();
    const establishedYear = business.establishedYear || business.established_year;
    const yearsInBusiness = establishedYear ? currentYear - establishedYear : null;

    const askingPrice = business.price;
    const annualRevenue = business.revenue;
    const annualProfit = business.annual_profit || business.profit || (business.monthly_profit ? business.monthly_profit * 12 : null);
    const profitMargin = annualRevenue && annualProfit ? Math.round((annualProfit / annualRevenue) * 100) : null;

    // Calculate multiples and payback - only if we have data
    const profitMultiple = askingPrice && annualProfit ? (askingPrice / annualProfit).toFixed(1) : null;
    const paybackMonths = askingPrice && annualProfit ? Math.ceil((askingPrice / annualProfit) * 12) : null;
    const cashOnCashReturn = askingPrice && annualProfit ? Math.round((annualProfit / askingPrice) * 100) : null;

    // YoY Growth from database
    const revenueGrowth = business.revenueGrowthYoY || business.revenue_growth_yoy;
    const profitGrowth = business.profitGrowthYoY || business.profit_growth_yoy;

    // Gallery images
    const images = business.images || [];
    const hasImages = images.length > 0;

    // Asset inventory from database
    const physicalAssets = business.physicalAssets || business.physical_assets || business.assets_included || [];
    const hasPhysicalAssets = Array.isArray(physicalAssets) && physicalAssets.length > 0;

    const inventoryValue = business.inventoryValue || business.inventory_value;

    // Lease details from database
    const leaseDetails = {
        monthlyRent: business.monthlyRent || business.monthly_rent,
        leaseRemaining: business.leaseRemaining || business.lease_remaining_years,
        lockInPeriod: business.lockInPeriod || business.lease_lock_in_period,
        securityDeposit: business.securityDeposit || business.security_deposit,
    };
    const hasLeaseData = leaseDetails.monthlyRent || leaseDetails.leaseRemaining;

    // Growth opportunities from database
    const growthOpportunities = business.growthOpportunities || business.growth_opportunities || [];
    const hasGrowthOpportunities = Array.isArray(growthOpportunities) && growthOpportunities.length > 0;

    // Training/transition support
    const trainingPeriod = business.trainingPeriod || business.training_period;

    // Reason for sale
    const reasonForSale = business.reasonForSale || business.reason_for_sale;

    // Trust level for reason
    const getReasonTrustLevel = (reason: string | null) => {
        if (!reason) return 'unknown';
        const highTrust = ['retiring', 'retirement', 'health', 'relocating', 'family'];
        const mediumTrust = ['new venture', 'other business', 'focus'];
        const reasonLower = reason.toLowerCase();

        if (highTrust.some(r => reasonLower.includes(r))) return 'high';
        if (mediumTrust.some(r => reasonLower.includes(r))) return 'medium';
        return 'low';
    };

    const trustLevel = getReasonTrustLevel(reasonForSale);

    // Location highlights
    const locationHighlights = business.locationHighlights || business.location_highlights || [];
    const hasLocationHighlights = Array.isArray(locationHighlights) && locationHighlights.length > 0;

    // Verification
    const verificationStatus = business.verificationStatus || business.verification_status;
    const dataCompletenessScore = business.dataCompletenessScore || business.data_completeness_score;

    return (
        <div className={cn("space-y-6", className)}>
            {/* Hero Section */}
            <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-muted">
                {images[0] ? (
                    <img
                        src={images[0]}
                        alt={business.name}
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
                        <div className="h-16 w-16 rounded-xl border-4 border-white shadow-lg bg-white flex items-center justify-center">
                            <Store className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{business.name || 'Business Name'}</h1>
                            <p className="text-white/80">
                                {business.industry || 'Industry N/A'} • {business.city || 'City'}, {business.state || 'State'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                    {business.featured && <Badge className="bg-amber-500 text-white">Featured</Badge>}
                    {business.trending && <Badge className="bg-rose-500 text-white">Trending</Badge>}
                    {verificationStatus === 'verified' && (
                        <Badge className="bg-growth-green text-white"><Shield className="h-3 w-3 mr-1" />Verified</Badge>
                    )}
                </div>
            </div>

            {/* ============ CARD A: PROOF OF PROFIT ============ */}
            <Card className="overflow-hidden border-border">
                <CardHeader className="gradient-trust text-primary-foreground pb-2">
                    <div className="flex items-center gap-2">
                        <IndianRupee className="h-5 w-5" />
                        <CardTitle className="text-lg">Proof of Profit</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
                        {/* LEFT: Financial Performance with YoY Trends */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Wallet className="h-4 w-4 text-trust-blue" />
                                <span className="text-sm font-medium text-muted-foreground">Financial Performance</span>
                            </div>

                            {/* Revenue with YoY */}
                            <div className="flex items-center justify-between mb-4 p-3 bg-secondary rounded-lg">
                                <div>
                                    <div className="text-xs text-muted-foreground">Annual Revenue</div>
                                    <div className="text-2xl font-bold">{formatCurrency(annualRevenue)}</div>
                                </div>
                                {revenueGrowth !== null && revenueGrowth !== undefined && (
                                    <div className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium",
                                        revenueGrowth >= 0
                                            ? "bg-accent text-accent-foreground"
                                            : "bg-destructive/10 text-destructive"
                                    )}>
                                        {revenueGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}% YoY
                                    </div>
                                )}
                            </div>

                            {/* Profit (EBITDA/SDE) with YoY */}
                            <div className="flex items-center justify-between mb-4 p-3 bg-accent/30 rounded-lg border border-accent-foreground/10">
                                <div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        SDE (Seller Discretionary Earnings)
                                        <span className="text-[10px] bg-muted px-1 rounded">?</span>
                                    </div>
                                    <div className={cn("text-2xl font-bold", annualProfit ? "text-growth-green" : "text-muted-foreground")}>
                                        {formatCurrency(annualProfit)}
                                    </div>
                                </div>
                                {profitGrowth !== null && profitGrowth !== undefined && (
                                    <div className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium",
                                        profitGrowth >= 0
                                            ? "bg-accent text-accent-foreground"
                                            : "bg-destructive/10 text-destructive"
                                    )}>
                                        {profitGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        {profitGrowth >= 0 ? '+' : ''}{profitGrowth}% YoY
                                    </div>
                                )}
                            </div>

                            {/* Monthly breakdown */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="p-2 bg-secondary rounded">
                                    <div className="text-xs text-muted-foreground">Monthly Revenue</div>
                                    <div className="font-semibold">{annualRevenue ? formatCurrency(annualRevenue / 12) : 'N/A'}</div>
                                </div>
                                <div className="p-2 bg-secondary rounded">
                                    <div className="text-xs text-muted-foreground">Monthly SDE</div>
                                    <div className={cn("font-semibold", annualProfit ? "text-growth-green" : "")}>
                                        {annualProfit ? formatCurrency(annualProfit / 12) : 'N/A'}
                                    </div>
                                </div>
                                <div className="p-2 bg-secondary rounded">
                                    <div className="text-xs text-muted-foreground">Profit Margin</div>
                                    <div className="font-semibold">{profitMargin !== null ? `${profitMargin}%` : 'N/A'}</div>
                                </div>
                                <div className="p-2 bg-secondary rounded">
                                    <div className="text-xs text-muted-foreground">Employees</div>
                                    <div className="font-semibold">{business.employees || 'N/A'}</div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Valuation Check */}
                        <div className="p-6 bg-accent/20">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-4 w-4 text-growth-green" />
                                <span className="text-sm font-medium text-muted-foreground">Valuation Check</span>
                            </div>

                            {/* Asking Price */}
                            <div className="text-center mb-4">
                                <div className="text-xs text-muted-foreground">Asking Price</div>
                                <div className="text-3xl font-bold">{formatCurrency(askingPrice)}</div>
                            </div>

                            {/* Payback Period - PROMINENT */}
                            <div className="bg-accent rounded-xl p-4 mb-4 text-center border border-accent-foreground/20">
                                {paybackMonths ? (
                                    <>
                                        <Badge className="bg-growth-green text-white text-lg px-4 py-1 mb-1">
                                            <Clock className="h-4 w-4 mr-2" />
                                            Payback: {paybackMonths} months
                                        </Badge>
                                        <p className="text-xs text-accent-foreground">
                                            Based on current cash flow
                                        </p>
                                    </>
                                ) : (
                                    <div className="text-muted-foreground">
                                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>Payback period cannot be calculated</p>
                                        <p className="text-xs">Profit data required</p>
                                    </div>
                                )}
                            </div>

                            {/* Multiples */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-3 bg-card rounded-lg border border-border">
                                    <div className="text-2xl font-bold">{profitMultiple ? `${profitMultiple}x` : 'N/A'}</div>
                                    <div className="text-xs text-muted-foreground">SDE Multiple</div>
                                </div>
                                <div className="text-center p-3 bg-card rounded-lg border border-border">
                                    <div className={cn("text-2xl font-bold", cashOnCashReturn ? "text-growth-green" : "")}>
                                        {cashOnCashReturn ? `${cashOnCashReturn}%` : 'N/A'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Cash-on-Cash ROI</div>
                                </div>
                            </div>

                            {/* Cash Flow Status */}
                            {annualProfit && annualProfit > 0 && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-growth-green">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">Cash Flow Positive</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ============ CARD B: RISK & OPPORTUNITY ============ */}
            <Card className="overflow-hidden border-border">
                <CardHeader className="bg-secondary pb-2">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-trust-blue" />
                        <CardTitle className="text-lg">The Story</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
                        {/* LEFT: Business Overview & Growth Upside */}
                        <div className="p-6">
                            {/* Image Gallery */}
                            {hasImages && (
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Business Gallery</span>
                                        {images.length > 1 && (
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => setGalleryIndex(Math.max(0, galleryIndex - 1))}
                                                    disabled={galleryIndex === 0}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => setGalleryIndex(Math.min(images.length - 1, galleryIndex + 1))}
                                                    disabled={galleryIndex === images.length - 1}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                                        <img src={images[galleryIndex]} alt="" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Building2 className="h-4 w-4 text-trust-blue" />
                                    <span className="font-medium">About This Business</span>
                                </div>
                                {business.description ? (
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {business.description}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No description provided</p>
                                )}
                            </div>

                            {/* Growth Upside - KEY SECTION */}
                            <div className="bg-accent/50 rounded-lg p-4 border border-accent-foreground/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="h-4 w-4 text-amber-500" />
                                    <span className="font-medium">Growth Upside</span>
                                </div>
                                {hasGrowthOpportunities ? (
                                    <>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            Opportunities for new owner:
                                        </p>
                                        <ul className="space-y-1">
                                            {growthOpportunities.slice(0, 3).map((opp: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <ArrowUpRight className="h-4 w-4 text-growth-green mt-0.5 flex-shrink-0" />
                                                    <span>{opp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">
                                        Growth opportunities not specified
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Seller & Transition Info */}
                        <div className="p-6">
                            {/* Reason for Sale - PROMINENT */}
                            <div className={cn(
                                "rounded-xl p-4 mb-4 border",
                                reasonForSale ? (
                                    trustLevel === 'high' ? "bg-accent border-accent-foreground/20" :
                                        trustLevel === 'medium' ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" :
                                            "bg-secondary border-border"
                                ) : "bg-muted border-border"
                            )}>
                                <div className="flex items-center gap-2 mb-2">
                                    {reasonForSale ? (
                                        trustLevel === 'high' ? (
                                            <CheckCircle className="h-5 w-5 text-growth-green" />
                                        ) : trustLevel === 'medium' ? (
                                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                                        ) : (
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                        )
                                    ) : (
                                        <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                    )}
                                    <span className="font-semibold">Reason for Sale</span>
                                </div>
                                {reasonForSale ? (
                                    <>
                                        <p className={cn(
                                            "text-lg",
                                            trustLevel === 'high' ? "text-accent-foreground" :
                                                trustLevel === 'medium' ? "text-amber-800 dark:text-amber-200" :
                                                    "text-foreground"
                                        )}>
                                            {reasonForSale}
                                        </p>
                                        {trustLevel === 'high' && (
                                            <Badge variant="outline" className="mt-2 border-growth-green/50 text-growth-green text-xs">
                                                ✓ Verified Reason
                                            </Badge>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground italic">Not specified</p>
                                )}
                            </div>

                            {/* Transition Support - CRITICAL */}
                            <div className="bg-primary/5 rounded-lg p-4 mb-4 border border-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                    <span className="font-medium">Transition Support</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Training Period:</span>
                                    {trainingPeriod ? (
                                        <Badge className="bg-primary text-primary-foreground">{trainingPeriod}</Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Not specified</span>
                                    )}
                                </div>
                                {trainingPeriod && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Owner will train buyer on operations, suppliers, and customer relationships
                                    </p>
                                )}
                            </div>

                            {/* Business Stats */}
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between p-2 bg-secondary rounded">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>Established</span>
                                    </div>
                                    <span className="font-medium">
                                        {establishedYear ? `${establishedYear} (${yearsInBusiness} years)` : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-secondary rounded">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>Employees</span>
                                    </div>
                                    <span className="font-medium">{business.employees || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-secondary rounded">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>Location</span>
                                    </div>
                                    <span className="font-medium">
                                        {business.city && business.state ? `${business.city}, ${business.state}` : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Verification */}
                            <div className="mt-4 pt-3 border-t border-border">
                                <div className="flex items-center gap-2">
                                    <Shield className={cn(
                                        "h-4 w-4",
                                        verificationStatus === 'verified' ? "text-growth-green" : "text-muted-foreground"
                                    )} />
                                    <span className="text-sm">
                                        {verificationStatus === 'verified' ? 'Verified Listing' : 'Pending Verification'}
                                    </span>
                                </div>
                                {dataCompletenessScore !== null && dataCompletenessScore !== undefined && (
                                    <>
                                        <Progress value={dataCompletenessScore} className="h-1.5 mt-2" />
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Data completeness: {dataCompletenessScore}%
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ============ CARD C: ASSET LIST ============ */}
            <Card className="overflow-hidden border-border">
                <CardHeader className="bg-accent pb-2">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-accent-foreground" />
                        <CardTitle className="text-lg text-accent-foreground">What Do I Own?</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
                        {/* LEFT: Asset Register & Inventory */}
                        <div className="p-6">
                            {/* Physical Assets */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Package className="h-4 w-4 text-growth-green" />
                                    <span className="font-medium">Physical Assets (Included)</span>
                                </div>
                                {hasPhysicalAssets ? (
                                    <div className="space-y-2">
                                        {physicalAssets.slice(0, 5).map((asset: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2 p-2 bg-accent/50 rounded-md border border-accent-foreground/10">
                                                <CheckCircle className="h-4 w-4 text-growth-green flex-shrink-0" />
                                                <span className="text-sm">{typeof asset === 'string' ? asset : asset.name || asset}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground bg-muted/50 rounded-md">
                                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Asset list not provided</p>
                                    </div>
                                )}
                            </div>

                            {/* Inventory */}
                            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-amber-600" />
                                        <span className="font-medium">Inventory Included</span>
                                    </div>
                                    {inventoryValue ? (
                                        <Badge className="bg-amber-500 text-white">
                                            {formatCurrency(inventoryValue)}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Not specified</span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {inventoryValue ? 'Current stock value included in asking price' : 'Contact seller for inventory details'}
                                </p>
                            </div>

                            {/* Other Inclusions - only show if we have some data */}
                            <div className="mt-4">
                                <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                    Typically Included
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { name: 'Customer Database', included: true },
                                        { name: 'Supplier Contracts', included: true },
                                        { name: 'Brand & Goodwill', included: true },
                                        { name: 'Website/Social', included: true },
                                    ].map((item) => (
                                        <div key={item.name} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-3 w-3 text-growth-green" />
                                            <span className="text-muted-foreground">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Lease & Location - CRITICAL */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Home className="h-4 w-4 text-primary" />
                                <span className="font-medium">Lease & Location</span>
                                <Badge variant="outline" className="ml-auto text-xs border-primary/50 text-primary">Critical</Badge>
                            </div>

                            {/* Lease Details Card */}
                            {hasLeaseData ? (
                                <div className="bg-secondary rounded-lg p-4 mb-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-muted-foreground">Monthly Rent</div>
                                            <div className="text-xl font-bold">{formatCurrency(leaseDetails.monthlyRent)}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Lease Remaining</div>
                                            <div className={cn("text-xl font-bold", leaseDetails.leaseRemaining ? "text-growth-green" : "")}>
                                                {leaseDetails.leaseRemaining ? `${leaseDetails.leaseRemaining} years` : 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="my-3" />

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Lock-in:</span>
                                            <span className="font-medium">{leaseDetails.lockInPeriod || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Security:</span>
                                            <span className="font-medium">{formatCurrency(leaseDetails.securityDeposit)}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-muted rounded-lg p-4 mb-4 text-center">
                                    <Home className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                                    <p className="text-muted-foreground">Lease details not provided</p>
                                    <p className="text-xs text-muted-foreground mt-1">Contact seller for property information</p>
                                </div>
                            )}

                            {/* Lease Transfer */}
                            <div className="flex items-center gap-2 p-3 bg-accent rounded-lg mb-4 border border-accent-foreground/10">
                                <Key className="h-5 w-5 text-growth-green" />
                                <div>
                                    <div className="text-sm font-medium text-accent-foreground">Lease Transferable</div>
                                    <div className="text-xs text-accent-foreground/70">Subject to landlord approval</div>
                                </div>
                            </div>

                            {/* Location Advantages */}
                            <div>
                                <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                    Location Highlights
                                </div>
                                {hasLocationHighlights ? (
                                    <div className="space-y-1">
                                        {locationHighlights.map((h: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                <Zap className="h-3 w-3 text-primary" />
                                                <span>{h}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">Location highlights not specified</p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
