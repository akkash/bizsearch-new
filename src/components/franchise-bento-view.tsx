import { useState, useMemo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    MapPin,
    Building2,
    ChevronLeft,
    ChevronRight,
    Wallet,
    TrendingUp,
    CheckCircle,
    Shield,
    Star,
    Search,
    IndianRupee,
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
    ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatINR } from '@/lib/format-currency';
import { StoreFormatPicker } from '@/components/store-format-picker';
import {
    findStoreFormat,
    formatInvestmentRange,
    formatStoreFormatSpace,
    getFranchiseInvestmentRange,
    getListingRequirements,
    getStoreFormatsFromFranchise,
} from '@/lib/store-formats';
import { VabgoClient, hasSearchableIntent } from '@/lib/vabgo-client';
import { listingImageUrl } from '@/lib/listing-media';
import { hasUnitEconomics, isPlatformVerified, mappedTerritoryCount } from '@/lib/listing-trust';
import { buyerReviewLine } from '@/lib/opportunity-record';

interface FranchiseBentoViewProps {
    franchise: any;
    className?: string;
    selectedFormatId?: string | null;
    onFormatChange?: (formatId: string) => void;
    onEnquire?: () => void;
    pitchDeckAction?: ReactNode;
}

function filledMoney(amount: number | null | undefined): string | null {
    if (amount === null || amount === undefined) return null;
    const value = Number(amount);
    if (!Number.isFinite(value)) return null;
    return formatINR(value);
}

function AskFranchisor({ onEnquire }: { onEnquire?: () => void }) {
    return (
        <button
            type="button"
            onClick={onEnquire}
            className="inline-flex min-h-11 items-center text-left text-sm font-semibold text-trust-blue underline-offset-4 hover:underline"
        >
            Ask franchisor
        </button>
    );
}

// Display value or N/A
export function FranchiseBentoView({
    franchise,
    className,
    selectedFormatId,
    onFormatChange,
    onEnquire,
    pitchDeckAction,
}: FranchiseBentoViewProps) {
    const [brandSlideIndex, setBrandSlideIndex] = useState(0);
    const [territorySearch, setTerritorySearch] = useState('');
    const [territorySubmitted, setTerritorySubmitted] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);

    const formats = getStoreFormatsFromFranchise(franchise);
    const selectedFormat = findStoreFormat(formats, selectedFormatId);
    const aggregate = getFranchiseInvestmentRange(franchise);

    const currentYear = new Date().getFullYear();
    const establishedYear = franchise.establishedYear || franchise.established_year;
    const yearsExperience = establishedYear ? currentYear - establishedYear : null;

    const totalInvestmentMin =
        selectedFormat?.investmentMin ??
        aggregate.min ??
        franchise.investmentMin ??
        franchise.total_investment_min;
    const totalInvestmentMax =
        selectedFormat?.investmentMax ??
        selectedFormat?.investmentMin ??
        aggregate.max ??
        franchise.investmentMax ??
        franchise.total_investment_max;
    const franchiseFee =
        selectedFormat?.franchiseFee ??
        franchise.franchiseFee ??
        franchise.franchise_fee;
    const royaltyRaw = franchise.royaltyPercentage ?? franchise.royalty_percentage;
    const royalty =
        royaltyRaw == null || royaltyRaw === '' || !Number.isFinite(Number(royaltyRaw))
            ? null
            : Number(royaltyRaw);

    const setupCost =
        franchise.setup_cost ??
        franchise.setupCost ??
        (totalInvestmentMin != null && franchiseFee != null
            ? Math.max(0, Number(totalInvestmentMin) - Number(franchiseFee))
            : null);
    const listingReqs = getListingRequirements(franchise);
    const spaceReq = selectedFormat
        ? formatStoreFormatSpace(selectedFormat)
        : franchise.space_requirement ||
          franchise.min_area_sqft ||
          franchise.spaceRequirement ||
          franchise.space_required_sqft;
    const propertyUrl =
        typeof franchise.vabgo_property_url === 'string'
            ? franchise.vabgo_property_url
            : typeof franchise.property_url === 'string'
              ? franchise.property_url
              : typeof franchise.vabgoUrl === 'string'
                ? franchise.vabgoUrl
                : null;
    const vabgoIntent = {
        city: listingReqs.preferredCities[0] || franchise.city || franchise.headquarters_city,
        propertyType: selectedFormat?.propertyType || listingReqs.propertyType,
        minAreaSqft: selectedFormat?.minSqft ?? listingReqs.minAreaSqft,
        maxAreaSqft: selectedFormat?.maxSqft ?? listingReqs.maxAreaSqft,
        listingType: 'Rent' as const,
        propertyUrl,
    };
    const platformVerified = isPlatformVerified(franchise);
    const unitEconomicsKnown = hasUnitEconomics(franchise);
    const reviewLine = buyerReviewLine(franchise as Record<string, unknown>, platformVerified);
    const verifiedAt = franchise.verified_at || franchise.verifiedAt;
    const nextReviewAt = franchise.verification_next_review_at || franchise.verificationNextReviewAt;

    const hasInvestmentData = franchiseFee || totalInvestmentMax || totalInvestmentMin;
    const investmentBreakdown = hasInvestmentData
        ? [
              franchiseFee != null && {
                  label: 'Franchise fee',
                  amount: franchiseFee,
                  color: 'bg-trust-blue',
              },
              setupCost != null && setupCost > 0 && {
                  label: 'Setup',
                  amount: setupCost,
                  color: 'bg-growth-green',
              },
          ].filter(Boolean) as { label: string; amount: number; color: string }[]
        : null;

    // ROI data
    const breakevenRaw = franchise.breakevenPeriod || franchise.breakeven_period;
    const paybackMonths = Number(franchise.paybackPeriodMonths ?? franchise.payback_period_months);
    const breakEvenLabel = breakevenRaw
        ? String(breakevenRaw)
        : Number.isFinite(paybackMonths) && paybackMonths > 0
          ? `${paybackMonths} months`
          : null;
    const projectedRoi = franchise.expectedRoiPercentage ?? franchise.expected_roi_percentage;
    const roiLabel =
        projectedRoi != null && projectedRoi !== '' && Number.isFinite(Number(projectedRoi))
            ? `${projectedRoi}%`
            : null;

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

    // Territories - from database. Hide the checker unless mapped cities exist.
    const allTerritories = franchise.territories || franchise.territory_availability || [];
    const hasTerritoriesData = mappedTerritoryCount(franchise) > 0;

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

    const brandName = franchise.brandName || franchise.brand_name || 'Franchise';
    const logoUrl = franchise.logo || franchise.logo_url;
    const investmentLabel = formatInvestmentRange(
        totalInvestmentMin != null ? Number(totalInvestmentMin) : null,
        totalInvestmentMax != null ? Number(totalInvestmentMax) : null,
        franchiseFee != null ? Number(franchiseFee) : null
    );
    const gallery = (Array.isArray(franchise.images) ? franchise.images : [])
        .map((item: unknown) => listingImageUrl(item))
        .filter((url: string | null): url is string => Boolean(url));
    const galleryPhoto = gallery[Math.min(galleryIndex, Math.max(gallery.length - 1, 0))];

    return (
        <div className={cn("space-y-6", className)}>
            {/* Identity + investment economics */}
            <div className="rounded-lg border border-border bg-card p-5 md:p-6">
                <div className="flex flex-wrap items-start gap-4 mb-6">
                    <div className="h-20 w-20 border border-border bg-white dark:bg-card flex items-center justify-center overflow-hidden shrink-0 p-2">
                        {logoUrl ? (
                            <img src={logoUrl} alt={`${brandName} logo`} className="h-full w-full object-contain" />
                        ) : (
                            <Building2 className="h-8 w-8 text-growth-green" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="outline" className="border-electric-blue/30 text-electric-blue text-[10px]">
                                Franchise
                            </Badge>
                            {platformVerified ? (
                                <Badge className="bg-growth-green/15 text-growth-green border-0">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Platform verified
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                    Franchisor-provided listing
                                </Badge>
                            )}
                            {franchise.industry && (
                                <Badge variant="secondary">{franchise.industry}</Badge>
                            )}
                            {formats.length > 1 && (
                                <Badge variant="outline" className="text-[10px]">
                                    {formats.length} formats
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{brandName}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {establishedYear ? `Est. ${establishedYear}` : 'Established year not listed'}
                            {totalOutlets ? ` · ${totalOutlets} outlets` : ''}
                            {selectedFormat ? ` · ${selectedFormat.name}` : ''}
                        </p>
                        {platformVerified && (verifiedAt || nextReviewAt) && (
                            <p className="text-[11px] text-muted-foreground mt-1">
                                {verifiedAt ? `Verified ${String(verifiedAt).slice(0, 10)}` : 'Platform verified'}
                                {nextReviewAt ? ` · next review ${String(nextReviewAt).slice(0, 10)}` : ''}
                            </p>
                        )}
                    </div>
                </div>

                {formats.length > 0 && onFormatChange && (
                    <div className="mb-6">
                        <StoreFormatPicker
                            formats={formats}
                            value={selectedFormatId || formats[0]?.id || null}
                            onChange={onFormatChange}
                            label="Outlet formats"
                            required={formats.length > 1}
                            variant="tabs"
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                    {(
                        [
                            {
                                label: selectedFormat ? `${selectedFormat.name} investment` : 'Total investment',
                                value: investmentLabel === 'Not provided' ? null : investmentLabel,
                                large: true,
                            },
                            { label: 'Franchise fee', value: filledMoney(franchiseFee) },
                            { label: 'Setup', value: filledMoney(setupCost) },
                            { label: 'Royalty', value: royalty != null ? `${royalty}%` : null },
                            { label: 'Break-even', value: breakEvenLabel },
                        ] as { label: string; value: string | null; large?: boolean }[]
                    ).map((metric) => (
                        <div key={metric.label} className={metric.large ? 'col-span-2 md:col-span-1' : undefined}>
                            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                                {metric.label}
                            </div>
                            {metric.value ? (
                                <div
                                    className={cn(
                                        'font-semibold font-mono tabular-nums',
                                        metric.large
                                            ? 'text-3xl md:text-4xl font-bold tracking-tight'
                                            : 'text-xl md:text-2xl'
                                    )}
                                >
                                    {metric.value}
                                </div>
                            ) : (
                                <AskFranchisor onEnquire={onEnquire} />
                            )}
                            {metric.label === 'Break-even' && metric.value && !unitEconomicsKnown && (
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Stated by the franchisor. Unit profit is not in this listing.
                                </p>
                            )}
                        </div>
                    ))}
                </div>
                {(spaceReq || listingReqs.propertyType || listingReqs.preferredCities.length > 0) && (
                    <p className="mt-4 text-sm text-muted-foreground">
                        {spaceReq ? (
                            <>
                                Space requirement:{' '}
                                <span className="text-foreground font-medium">
                                    {typeof spaceReq === 'number' ? `${spaceReq} sq ft` : spaceReq}
                                </span>
                            </>
                        ) : (
                            'Need a commercial site for this format?'
                        )}
                    </p>
                )}
                {VabgoClient.isEnabled() && hasSearchableIntent(vabgoIntent) && vabgoIntent.propertyUrl && (
                    <a
                        href={vabgoIntent.propertyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-growth-green/30 bg-growth-green/10 p-4 hover:bg-growth-green/15 transition-colors duration-150"
                    >
                        <div>
                            <p className="font-display text-lg font-bold uppercase tracking-tight">
                                Looking for a Commercial Space?
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Find verified retail outlets suitable for {brandName}
                                {selectedFormat
                                  ? ` (${formatStoreFormatSpace(selectedFormat)})`
                                  : listingReqs.minAreaSqft
                                    ? ` (${listingReqs.minAreaSqft}${listingReqs.maxAreaSqft ? `–${listingReqs.maxAreaSqft}` : ''} sq.ft)`
                                    : ''}{' '}
                                on Vabgo
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-bold uppercase tracking-widest text-growth-green whitespace-nowrap">
                            Open Vabgo
                            <ExternalLink className="h-4 w-4" />
                        </span>
                    </a>
                )}
                {pitchDeckAction}
            </div>

            {galleryPhoto && (
                <div className="relative aspect-video md:aspect-[21/9] rounded-xl overflow-hidden bg-muted">
                    <img
                        src={galleryPhoto}
                        alt={`${brandName} outlet ${galleryIndex + 1}`}
                        className="w-full h-full object-cover"
                    />
                    {gallery.length > 1 && (
                        <>
                            <div className="absolute top-3 right-3 rounded-lg bg-foreground/80 text-background text-xs font-mono px-2 py-1">
                                {galleryIndex + 1}/{gallery.length} Photos
                            </div>
                            <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto">
                                {gallery.slice(0, 8).map((url, i) => (
                                    <button
                                        key={url + i}
                                        type="button"
                                        onClick={() => setGalleryIndex(i)}
                                        className={cn(
                                            'h-12 w-16 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer',
                                            i === galleryIndex ? 'border-white' : 'border-transparent opacity-80'
                                        )}
                                        aria-label={`Photo ${i + 1}`}
                                    >
                                        <img src={url} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ============ CARD A: FINANCIALS ============ */}
            <Card className="overflow-hidden border-border">
                <CardHeader className="bg-secondary/50 pb-2">
                    <div className="flex items-center gap-2">
                        <IndianRupee className="h-5 w-5 text-growth-green" />
                        <CardTitle className="text-lg">Investment details</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
                        {/* LEFT: Investment Breakdown */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Wallet className="h-4 w-4 text-trust-blue" />
                                <span className="text-sm font-medium text-muted-foreground">Total investment</span>
                            </div>
                            {investmentLabel === 'Not provided' ? (
                                <AskFranchisor onEnquire={onEnquire} />
                            ) : (
                                <div className="text-3xl font-bold font-mono tabular-nums text-foreground mb-1">
                                    {investmentLabel}
                                </div>
                            )}

                            {investmentBreakdown && investmentBreakdown.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    {investmentBreakdown.map((item) => (
                                        <div key={item.label} className="rounded-md border border-border p-3">
                                            <div className="text-[11px] text-muted-foreground">{item.label}</div>
                                            <div className="text-sm font-semibold font-mono tabular-nums">
                                                {filledMoney(item.amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            <div className="mt-4 pt-3 border-t border-border text-sm text-muted-foreground">
                                {royalty != null ? (
                                    `${royalty}% royalty on gross sales`
                                ) : (
                                    <AskFranchisor onEnquire={onEnquire} />
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-accent/30">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-4 w-4 text-growth-green" />
                                <span className="text-sm font-medium text-muted-foreground">Returns</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                                        Break-even
                                    </div>
                                    {breakEvenLabel ? (
                                        <div className="text-xl font-semibold">{breakEvenLabel}</div>
                                    ) : (
                                        <AskFranchisor onEnquire={onEnquire} />
                                    )}
                                </div>
                                <div>
                                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                                        Stated annual ROI
                                    </div>
                                    {roiLabel ? (
                                        <div className="text-xl font-semibold text-growth-green">{roiLabel}</div>
                                    ) : (
                                        <AskFranchisor onEnquire={onEnquire} />
                                    )}
                                </div>
                                {(breakEvenLabel || roiLabel) && !unitEconomicsKnown && (
                                    <p className="text-sm text-muted-foreground">
                                        Stated by the franchisor. Unit revenue and profit are not in this listing.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <p className="px-6 py-4 border-t border-border text-sm text-muted-foreground">
                        {reviewLine}
                    </p>
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
                                <Badge variant="outline" className="ml-auto text-xs text-muted-foreground">
                                    Typical categories — not verified
                                </Badge>
                            </div>

                            {/* Pre-Opening */}
                            <div className="mb-4">
                                <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Pre-Opening</div>
                                <div className="grid grid-cols-2 gap-3">
                                    {preOpeningSupport.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.name} className="rounded-xl border border-border bg-card p-3 shadow-sm">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <Icon className="h-5 w-5 text-growth-green" />
                                                    <CheckCircle className="h-4 w-4 text-growth-green" />
                                                </div>
                                                <span className="text-sm font-medium leading-snug">{item.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Post-Opening */}
                            <div>
                                <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Post-Opening</div>
                                <div className="grid grid-cols-2 gap-3">
                                    {postOpeningSupport.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.name} className="rounded-xl border border-border bg-card p-3 shadow-sm">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <Icon className="h-5 w-5 text-growth-green" />
                                                    <CheckCircle className="h-4 w-4 text-growth-green" />
                                                </div>
                                                <span className="text-sm font-medium leading-snug">{item.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Territory Search Tool — hidden unless mapped cities exist */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="h-4 w-4 text-growth-green" />
                                <span className="font-medium">
                                    {hasTerritoriesData ? 'Check Territory Availability' : 'Territory'}
                                </span>
                            </div>

                            {hasTerritoriesData ? (
                                <>
                                    <form
                                        className="flex gap-2 mb-4"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            setTerritorySubmitted(true);
                                        }}
                                    >
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Pincode or city"
                                                value={territorySearch}
                                                onChange={(e) => {
                                                    setTerritorySearch(e.target.value);
                                                    setTerritorySubmitted(false);
                                                }}
                                                className="pl-9"
                                            />
                                        </div>
                                        <Button type="submit" size="sm" className="whitespace-nowrap">
                                            Check Availability
                                        </Button>
                                    </form>

                                    <div className="space-y-2 min-h-[140px]">
                                        {!territorySubmitted && !territorySearch.trim() && (
                                            <p className="text-sm text-muted-foreground">
                                                Enter a city or pincode to check if {brandName} is expanding there.
                                            </p>
                                        )}
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
                                <p className="text-sm text-muted-foreground">
                                    This brand has not published city-level availability. We do not guess whether you can open in a given city.
                                </p>
                            )}

                            {hasTerritoriesData && (
                            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Mapped available cities:</span>
                                <span className="font-semibold text-growth-green">
                                    {availableTerritories ? `${availableTerritories} cities` : `${mappedTerritoryCount(franchise)} listed`}
                                </span>
                            </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
