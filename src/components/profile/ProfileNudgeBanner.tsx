import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    X,
    Sparkles,
    ArrowRight,
    TrendingUp,
    UserCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileCompleteness } from '@/hooks/use-profile-completeness';
import { cn } from '@/lib/utils';

interface ProfileNudgeBannerProps {
    variant?: 'banner' | 'card' | 'inline';
    dismissible?: boolean;
    storageKey?: string;
    className?: string;
}

export function ProfileNudgeBanner({
    variant = 'banner',
    dismissible = true,
    storageKey = 'bizsearch_nudge_dismissed',
    className,
}: ProfileNudgeBannerProps) {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const completeness = useProfileCompleteness(profile);
    const [dismissed, setDismissed] = useState(false);

    // Check if dismissed in localStorage
    useEffect(() => {
        if (dismissible && user) {
            const dismissedData = localStorage.getItem(`${storageKey}_${user.id}`);
            if (dismissedData) {
                const { dismissedAt } = JSON.parse(dismissedData);
                // Re-show after 7 days
                const daysDiff = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
                if (daysDiff < 7) {
                    setDismissed(true);
                }
            }
        }
    }, [user, dismissible, storageKey]);

    // Don't show if not logged in, profile not loaded, already complete, or dismissed
    if (!user || !profile || completeness.score >= 80 || dismissed) {
        return null;
    }

    const handleDismiss = () => {
        if (user) {
            localStorage.setItem(
                `${storageKey}_${user.id}`,
                JSON.stringify({ dismissedAt: Date.now() })
            );
        }
        setDismissed(true);
    };

    const handleComplete = () => {
        navigate('/onboarding');
    };

    const highPriorityCount = completeness.missingFields.filter(
        f => f.priority === 'high'
    ).length;

    if (variant === 'inline') {
        return (
            <div className={cn('flex items-center gap-3 p-3 bg-primary/5 rounded-lg', className)}>
                <div className="p-2 bg-primary/10 rounded-full">
                    <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                        Complete your profile for better matches
                    </p>
                </div>
                <Button size="sm" onClick={handleComplete}>
                    Complete
                </Button>
            </div>
        );
    }

    if (variant === 'card') {
        return (
            <div className={cn(
                'relative p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20',
                className
            )}>
                {dismissible && (
                    <button
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground rounded"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/20 rounded-full">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div>
                            <p className="font-medium text-sm">
                                Get 3x more responses!
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Complete {highPriorityCount} more field{highPriorityCount !== 1 ? 's' : ''} to boost your visibility
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Progress value={completeness.score} className="h-1.5 flex-1" />
                            <span className="text-xs font-medium text-primary">{completeness.score}%</span>
                        </div>

                        <Button size="sm" variant="outline" onClick={handleComplete} className="w-full">
                            Complete Profile
                            <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Default: Banner variant
    return (
        <Alert className={cn(
            'relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20',
            className
        )}>
            {dismissible && (
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground rounded"
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-primary/20 rounded-full shrink-0">
                        <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <AlertTitle className="text-base font-semibold mb-1">
                            Complete your profile for better visibility
                        </AlertTitle>
                        <AlertDescription className="text-sm">
                            Verified profiles get <span className="font-semibold">3x more responses</span> from serious buyers and sellers.
                            {highPriorityCount > 0 && (
                                <span className="text-muted-foreground ml-1">
                                    • {highPriorityCount} key field{highPriorityCount !== 1 ? 's' : ''} remaining
                                </span>
                            )}
                        </AlertDescription>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:shrink-0">
                    <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={completeness.score} className="h-2 w-20" />
                        <span className="text-sm font-medium">{completeness.score}%</span>
                    </div>
                    <Button onClick={handleComplete} size="sm">
                        Complete Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Alert>
    );
}
