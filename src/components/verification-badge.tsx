import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, Clock, AlertCircle, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export type VerificationStatus = 'verified' | 'pending' | 'unverified' | 'rejected';

interface VerificationBadgeProps {
    status: VerificationStatus;
    verifiedAt?: string | Date | null;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

const statusConfig = {
    verified: {
        icon: ShieldCheck,
        label: 'Verified',
        color: 'bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20',
        iconColor: 'text-green-600',
        description: 'This listing has been verified by BizSearch',
    },
    pending: {
        icon: Clock,
        label: 'Pending',
        color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20',
        iconColor: 'text-yellow-600',
        description: 'Verification in progress',
    },
    unverified: {
        icon: ShieldQuestion,
        label: 'Unverified',
        color: 'bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/20',
        iconColor: 'text-gray-500',
        description: 'This listing has not been verified yet',
    },
    rejected: {
        icon: ShieldAlert,
        label: 'Rejected',
        color: 'bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20',
        iconColor: 'text-red-600',
        description: 'Verification was rejected',
    },
};

const sizeConfig = {
    sm: {
        badge: 'text-xs px-1.5 py-0.5',
        icon: 'h-3 w-3',
    },
    md: {
        badge: 'text-sm px-2 py-1',
        icon: 'h-4 w-4',
    },
    lg: {
        badge: 'text-base px-3 py-1.5',
        icon: 'h-5 w-5',
    },
};

export function VerificationBadge({
    status,
    verifiedAt,
    size = 'md',
    showLabel = true,
    className = '',
}: VerificationBadgeProps) {
    const config = statusConfig[status];
    const sizes = sizeConfig[size];
    const Icon = config.icon;

    const getVerifiedTimeAgo = () => {
        if (!verifiedAt) return null;
        const date = typeof verifiedAt === 'string' ? new Date(verifiedAt) : verifiedAt;
        return formatDistanceToNow(date, { addSuffix: true });
    };

    const tooltipContent = (
        <div className="text-center">
            <p className="font-medium">{config.description}</p>
            {status === 'verified' && verifiedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                    Verified {getVerifiedTimeAgo()}
                </p>
            )}
        </div>
    );

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge
                        variant="outline"
                        className={`${config.color} ${sizes.badge} gap-1 cursor-help ${className}`}
                    >
                        <Icon className={`${sizes.icon} ${config.iconColor}`} />
                        {showLabel && <span>{config.label}</span>}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    {tooltipContent}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Compact version for listing cards
export function VerificationIcon({ status, size = 'sm' }: { status: VerificationStatus; size?: 'sm' | 'md' | 'lg' }) {
    const config = statusConfig[status];
    const sizes = sizeConfig[size];
    const Icon = config.icon;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Icon className={`${sizes.icon} ${config.iconColor} cursor-help`} />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{config.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Last verified timestamp display
export function LastVerifiedLabel({
    verifiedAt,
    className = ''
}: {
    verifiedAt: string | Date | null;
    className?: string;
}) {
    if (!verifiedAt) {
        return (
            <span className={`text-xs text-muted-foreground ${className}`}>
                Not yet verified
            </span>
        );
    }

    const date = typeof verifiedAt === 'string' ? new Date(verifiedAt) : verifiedAt;
    const timeAgo = formatDistanceToNow(date, { addSuffix: true });
    const daysSinceVerification = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

    // Color based on recency
    const colorClass = daysSinceVerification <= 30
        ? 'text-green-600'
        : daysSinceVerification <= 90
            ? 'text-yellow-600'
            : 'text-red-600';

    return (
        <span className={`text-xs flex items-center gap-1 ${colorClass} ${className}`}>
            <CheckCircle className="h-3 w-3" />
            Last verified {timeAgo}
        </span>
    );
}

// Data completeness indicator
export function DataCompletenessBar({
    score,
    showLabel = true,
    className = ''
}: {
    score: number;
    showLabel?: boolean;
    className?: string;
}) {
    const getColor = () => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className={`${className}`}>
            {showLabel && (
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Data completeness</span>
                    <span className="font-medium">{score}%</span>
                </div>
            )}
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${getColor()} transition-all duration-300`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}
