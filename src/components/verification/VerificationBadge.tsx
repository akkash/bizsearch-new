import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Shield,
    ShieldCheck,
    ShieldPlus,
    BadgeCheck,
    Verified,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VerificationTier } from '@/hooks/use-verification-tier';
import { getVerificationTierInfo } from '@/hooks/use-verification-tier';

interface VerificationBadgeProps {
    tier: VerificationTier;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    showTooltip?: boolean;
    className?: string;
}

const iconMap = {
    'shield': Shield,
    'shield-check': ShieldCheck,
    'shield-plus': ShieldPlus,
    'badge-check': BadgeCheck,
    'verified': Verified,
};

const sizeClasses = {
    sm: {
        badge: 'px-1.5 py-0.5 text-xs',
        icon: 'h-3 w-3',
        iconOnly: 'p-1',
    },
    md: {
        badge: 'px-2 py-1 text-xs',
        icon: 'h-4 w-4',
        iconOnly: 'p-1.5',
    },
    lg: {
        badge: 'px-3 py-1.5 text-sm',
        icon: 'h-5 w-5',
        iconOnly: 'p-2',
    },
};

export function VerificationBadge({
    tier,
    size = 'md',
    showLabel = true,
    showTooltip = true,
    className,
}: VerificationBadgeProps) {
    const tierInfo = getVerificationTierInfo(tier);
    const Icon = iconMap[tierInfo.icon];
    const sizes = sizeClasses[size];

    const badge = (
        <Badge
            variant="outline"
            className={cn(
                tierInfo.bgColor,
                tierInfo.color,
                tierInfo.borderColor,
                showLabel ? sizes.badge : sizes.iconOnly,
                'inline-flex items-center gap-1 font-medium',
                className
            )}
        >
            <Icon className={sizes.icon} />
            {showLabel && <span>{tierInfo.label}</span>}
        </Badge>
    );

    if (!showTooltip) {
        return badge;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {badge}
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-2">
                        <div className="font-medium flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            Tier {tier}: {tierInfo.label}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {tierInfo.description}
                        </p>
                        {tier < 4 && (
                            <div className="pt-1 border-t">
                                <p className="text-xs font-medium mb-1">Verification Tiers:</p>
                                <ul className="text-xs text-muted-foreground space-y-0.5">
                                    {[1, 2, 3, 4].map((t) => {
                                        const info = getVerificationTierInfo(t as VerificationTier);
                                        const isComplete = t <= tier;
                                        return (
                                            <li
                                                key={t}
                                                className={cn(
                                                    'flex items-center gap-1',
                                                    isComplete && info.color
                                                )}
                                            >
                                                {isComplete ? (
                                                    <CheckCircle2 className="h-3 w-3" />
                                                ) : (
                                                    <div className="h-3 w-3 rounded-full border border-current opacity-40" />
                                                )}
                                                Tier {t}: {info.label}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Simple icon-only version for cards
export function VerificationIcon({
    tier,
    className,
}: {
    tier: VerificationTier;
    className?: string;
}) {
    return (
        <VerificationBadge
            tier={tier}
            size="sm"
            showLabel={false}
            className={className}
        />
    );
}
