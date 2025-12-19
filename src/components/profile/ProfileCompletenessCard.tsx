import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileCompleteness } from '@/hooks/use-profile-completeness';
import {
    User,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Sparkles
} from 'lucide-react';

interface ProfileCompletenessCardProps {
    showIfComplete?: boolean;
    className?: string;
}

export function ProfileCompletenessCard({
    showIfComplete = false,
    className = ''
}: ProfileCompletenessCardProps) {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const completeness = useProfileCompleteness(profile);

    // Don't show if profile is complete and showIfComplete is false
    if (completeness.score >= 100 && !showIfComplete) {
        return null;
    }

    // Don't show if no profile
    if (!profile) {
        return null;
    }

    const highPriorityMissing = completeness.missingFields
        .filter(f => f.priority === 'high')
        .slice(0, 3);

    const getStatusColor = () => {
        if (completeness.score >= 80) return 'text-green-600';
        if (completeness.score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressColor = () => {
        if (completeness.score >= 80) return 'bg-green-500';
        if (completeness.score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Card className={`border-dashed ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile Completeness
                    </CardTitle>
                    <Badge
                        variant={completeness.score >= 80 ? 'default' : 'secondary'}
                        className={getStatusColor()}
                    >
                        {completeness.score}%
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress bar */}
                <div className="space-y-2">
                    <Progress
                        value={completeness.score}
                        className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                        {completeness.score >= 80 ? (
                            <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                Great job! Your profile is well optimized
                            </span>
                        ) : completeness.score >= 50 ? (
                            <span className="flex items-center gap-1 text-yellow-600">
                                <Sparkles className="h-3 w-3" />
                                Almost there! Complete a few more fields
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <AlertCircle className="h-3 w-3" />
                                Complete your profile to improve visibility
                            </span>
                        )}
                    </p>
                </div>

                {/* Missing high-priority fields */}
                {highPriorityMissing.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                            Suggested next steps:
                        </p>
                        <ul className="space-y-1">
                            {highPriorityMissing.map((field, index) => (
                                <li
                                    key={field.field}
                                    className="text-sm flex items-center gap-2 text-muted-foreground"
                                >
                                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">
                                        {index + 1}
                                    </span>
                                    Add {field.label.toLowerCase()}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* CTA Button */}
                <Button
                    variant={completeness.score >= 80 ? 'outline' : 'default'}
                    size="sm"
                    className="w-full"
                    onClick={() => navigate('/profile/edit')}
                >
                    {completeness.score >= 80 ? 'View Profile' : 'Complete Profile'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </CardContent>
        </Card>
    );
}
