import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
    TrendingUp,
    IndianRupee,
    MapPin,
    Users,
    Calendar,
    Building2,
    Award,
    Shield,
    CheckCircle,
    Clock,
    Star,
    Zap,
    Target,
    BarChart3,
    Wallet,
    GraduationCap,
    Headphones,
    Store,
} from 'lucide-react';

// Format currency in Indian style
function formatCurrency(amount: number): string {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)}L`;
    return `₹${amount.toLocaleString()}`;
}

// Bento Grid Container
interface BentoGridProps {
    children: ReactNode;
    className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
    return (
        <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(140px,auto)]",
            className
        )}>
            {children}
        </div>
    );
}

// Individual Bento Card
interface BentoCardProps {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    colSpan?: 1 | 2 | 3 | 4;
    rowSpan?: 1 | 2;
    variant?: 'default' | 'gradient' | 'glass' | 'highlight';
}

export function BentoCard({
    title,
    description,
    children,
    className,
    colSpan = 1,
    rowSpan = 1,
    variant = 'default',
}: BentoCardProps) {
    const colSpanClasses = {
        1: 'md:col-span-1',
        2: 'md:col-span-2',
        3: 'md:col-span-3 lg:col-span-3',
        4: 'md:col-span-4 lg:col-span-4',
    };

    const rowSpanClasses = {
        1: 'row-span-1',
        2: 'row-span-2',
    };

    const variantClasses = {
        default: 'bg-card border',
        gradient: 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20',
        glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20',
        highlight: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20',
    };

    return (
        <Card className={cn(
            "overflow-hidden transition-all hover:shadow-lg",
            colSpanClasses[colSpan],
            rowSpanClasses[rowSpan],
            variantClasses[variant],
            className
        )}>
            {(title || description) && (
                <CardHeader className="pb-2">
                    {title && <CardTitle className="text-base font-semibold">{title}</CardTitle>}
                    {description && <CardDescription className="text-xs">{description}</CardDescription>}
                </CardHeader>
            )}
            <CardContent className={cn(!title && !description && "pt-4")}>
                {children}
            </CardContent>
        </Card>
    );
}

// Investment Card - Big bold numbers
interface InvestmentCardProps {
    min: number;
    max: number;
    franchiseFee?: number;
    royalty?: number;
}

export function InvestmentCard({ min, max, franchiseFee, royalty }: InvestmentCardProps) {
    return (
        <BentoCard colSpan={2} variant="gradient" className="relative overflow-hidden">
            <div className="absolute top-4 right-4 opacity-10">
                <Wallet className="h-24 w-24" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <IndianRupee className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Total Investment</span>
                </div>
                <div className="text-4xl font-bold tracking-tight">
                    {formatCurrency(min)} - {formatCurrency(max)}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    {franchiseFee && (
                        <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground">Franchise Fee</div>
                            <div className="text-lg font-semibold">{formatCurrency(franchiseFee)}</div>
                        </div>
                    )}
                    {royalty && (
                        <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground">Royalty</div>
                            <div className="text-lg font-semibold">{royalty}%</div>
                        </div>
                    )}
                </div>
            </div>
        </BentoCard>
    );
}

// ROI Graph Card
interface ROICardProps {
    projectedRoi: number;
    breakeven: string;
    roiData?: { year: string; roi: number }[];
}

export function ROICard({ projectedRoi, breakeven, roiData }: ROICardProps) {
    const defaultData = [
        { year: 'Y1', roi: 10 },
        { year: 'Y2', roi: 18 },
        { year: 'Y3', roi: 25 },
        { year: 'Y4', roi: 32 },
        { year: 'Y5', roi: 38 },
    ];

    const data = roiData || defaultData;
    const maxRoi = Math.max(...data.map(d => d.roi));

    return (
        <BentoCard colSpan={2} title="ROI Projection" variant="highlight">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="text-3xl font-bold text-emerald-600">{projectedRoi}%</div>
                    <div className="text-xs text-muted-foreground">Expected 5-Year ROI</div>
                </div>
                <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
                    <Clock className="h-3 w-3 mr-1" />
                    Breakeven: {breakeven}
                </Badge>
            </div>
            <div className="flex items-end gap-2 h-20">
                {data.map((item, i) => (
                    <div key={item.year} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-sm transition-all hover:from-emerald-600 hover:to-teal-500"
                            style={{ height: `${(item.roi / maxRoi) * 100}%`, minHeight: '8px' }}
                        />
                        <span className="text-[10px] text-muted-foreground">{item.year}</span>
                    </div>
                ))}
            </div>
        </BentoCard>
    );
}

// Support Features Card
interface SupportCardProps {
    features: { name: string; included: boolean }[];
}

export function SupportCard({ features }: SupportCardProps) {
    return (
        <BentoCard colSpan={2} title="Support & Training">
            <div className="grid grid-cols-2 gap-2">
                {features.slice(0, 6).map((feature) => (
                    <div
                        key={feature.name}
                        className={cn(
                            "flex items-center gap-2 p-2 rounded-md text-sm",
                            feature.included
                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                                : "bg-muted/50 text-muted-foreground"
                        )}
                    >
                        {feature.included ? (
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                        )}
                        <span className="truncate">{feature.name}</span>
                    </div>
                ))}
            </div>
        </BentoCard>
    );
}

// Brand Stats Card
interface StatsCardProps {
    outlets: number;
    countries?: number;
    employees?: number;
    experience: number;
}

export function StatsCard({ outlets, countries = 1, employees, experience }: StatsCardProps) {
    return (
        <BentoCard colSpan={1} title="Network">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <Store className="h-4 w-4 text-primary" />
                        <span>Outlets</span>
                    </div>
                    <span className="font-bold text-lg">{outlets.toLocaleString()}+</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Experience</span>
                    </div>
                    <span className="font-bold">{experience} yrs</span>
                </div>
                {countries > 1 && (
                    <>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>Countries</span>
                            </div>
                            <span className="font-bold">{countries}</span>
                        </div>
                    </>
                )}
            </div>
        </BentoCard>
    );
}

// Verification Badge Card
interface VerificationCardProps {
    status: 'verified' | 'pending' | 'unverified';
    score: number;
    verifiedAt?: string;
}

export function VerificationCard({ status, score, verifiedAt }: VerificationCardProps) {
    const statusConfig = {
        verified: {
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
            text: 'text-emerald-700 dark:text-emerald-300',
            icon: Shield,
            label: 'Verified Listing'
        },
        pending: {
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            text: 'text-amber-700 dark:text-amber-300',
            icon: Clock,
            label: 'Pending Verification'
        },
        unverified: {
            bg: 'bg-slate-50 dark:bg-slate-950/30',
            text: 'text-slate-600 dark:text-slate-400',
            icon: Shield,
            label: 'Not Verified'
        },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <BentoCard colSpan={1}>
            <div className={cn("rounded-lg p-3", config.bg)}>
                <div className={cn("flex items-center gap-2 mb-2", config.text)}>
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{config.label}</span>
                </div>
                <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span>Data Completeness</span>
                        <span className="font-medium">{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                </div>
            </div>
        </BentoCard>
    );
}

// Quick Facts Card
interface QuickFactsCardProps {
    facts: { icon: ReactNode; label: string; value: string }[];
}

export function QuickFactsCard({ facts }: QuickFactsCardProps) {
    return (
        <BentoCard colSpan={1}>
            <div className="space-y-3">
                {facts.slice(0, 4).map((fact, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {fact.icon}
                            <span>{fact.label}</span>
                        </div>
                        <span className="font-medium text-sm">{fact.value}</span>
                    </div>
                ))}
            </div>
        </BentoCard>
    );
}

// Brand Story Card
interface BrandStoryCardProps {
    description: string;
    highlights?: string[];
}

export function BrandStoryCard({ description, highlights }: BrandStoryCardProps) {
    return (
        <BentoCard colSpan={2} rowSpan={1} title="Brand Story">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                {description}
            </p>
            {highlights && highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {highlights.slice(0, 4).map((h, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            {h}
                        </Badge>
                    ))}
                </div>
            )}
        </BentoCard>
    );
}

// Territory Availability Card
interface TerritoryCardProps {
    available: number;
    total: number;
    hotCities?: string[];
}

export function TerritoryCard({ available, total, hotCities }: TerritoryCardProps) {
    const percentage = Math.round((available / total) * 100);

    return (
        <BentoCard colSpan={1} title="Territory">
            <div className="text-center mb-3">
                <div className="text-3xl font-bold">{available}</div>
                <div className="text-xs text-muted-foreground">of {total} cities available</div>
            </div>
            <Progress value={percentage} className="h-2 mb-3" />
            {hotCities && hotCities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {hotCities.slice(0, 3).map((city) => (
                        <Badge key={city} variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {city}
                        </Badge>
                    ))}
                </div>
            )}
        </BentoCard>
    );
}

// Awards/Recognition Card
interface AwardsCardProps {
    awards: string[];
}

export function AwardsCard({ awards }: AwardsCardProps) {
    return (
        <BentoCard colSpan={1} variant="glass">
            <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-amber-500" />
                <span className="font-semibold">Recognition</span>
            </div>
            <div className="space-y-2">
                {awards.slice(0, 3).map((award, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                        <Star className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground line-clamp-2">{award}</span>
                    </div>
                ))}
            </div>
        </BentoCard>
    );
}
