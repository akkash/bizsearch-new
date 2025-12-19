
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    PartyPopper,
    ArrowRight,
    User,
    Briefcase,
    Store,
    Building2,
    Search,
    Sparkles
} from 'lucide-react';
import { useProfileCompleteness } from '@/hooks/use-profile-completeness';
import type { Profile } from '@/types/auth.types';

interface OnboardingStepCompleteProps {
    profile: Profile | null;
    onFinish: () => void;
}

export function OnboardingStepComplete({
    profile,
    onFinish,
}: OnboardingStepCompleteProps) {
    const navigate = useNavigate();
    const completeness = useProfileCompleteness(profile);

    const getNextSteps = () => {
        const role = profile?.role;

        switch (role) {
            case 'buyer':
                return [
                    { icon: Search, label: 'Browse Businesses', path: '/businesses' },
                    { icon: Store, label: 'Explore Franchises', path: '/franchises' },
                ];
            case 'seller':
                return [
                    { icon: Building2, label: 'List Your Business', path: '/add-business-listing' },
                    { icon: User, label: 'Complete Profile', path: '/profile/edit' },
                ];
            case 'franchisor':
                return [
                    { icon: Store, label: 'List Your Franchise', path: '/add-franchise-listing' },
                    { icon: User, label: 'Complete Profile', path: '/profile/edit' },
                ];
            case 'franchisee':
                return [
                    { icon: Store, label: 'Explore Franchises', path: '/franchises' },
                    { icon: Search, label: 'Browse Map', path: '/franchise-map' },
                ];
            case 'advisor':
            case 'broker':
                return [
                    { icon: Briefcase, label: 'View Dashboard', path: '/clients' },
                    { icon: User, label: 'Complete Profile', path: '/profile/edit' },
                ];
            default:
                return [
                    { icon: Search, label: 'Explore Listings', path: '/businesses' },
                    { icon: User, label: 'View Profile', path: '/profile' },
                ];
        }
    };

    const nextSteps = getNextSteps();

    return (
        <div className="relative">
            <div className="space-y-8 text-center">
                {/* Success Icon with animation */}
                <div className="flex justify-center">
                    <div className="relative animate-bounce">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </div>
                        <div className="absolute -right-2 -top-2 animate-pulse">
                            <PartyPopper className="w-8 h-8 text-yellow-500" />
                        </div>
                        <div className="absolute -left-3 top-4 animate-pulse delay-75">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div>
                    <h2 className="text-3xl font-bold text-foreground">
                        You're all set! 🎉
                    </h2>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Your profile is ready. Welcome to BizSearch!
                    </p>
                </div>

                {/* Profile Completeness */}
                <Card className="max-w-sm mx-auto">
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Profile Completeness</span>
                                <Badge variant={completeness.score >= 80 ? 'default' : 'secondary'}>
                                    {completeness.score}%
                                </Badge>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${completeness.score}%` }}
                                />
                            </div>
                            {completeness.missingFields.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Complete {completeness.missingFields.length} more field{completeness.missingFields.length > 1 ? 's' : ''} to boost your visibility
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Next Steps */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">What would you like to do next?</h3>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {nextSteps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <Button
                                    key={step.path}
                                    variant={index === 0 ? 'default' : 'outline'}
                                    size="lg"
                                    onClick={() => navigate(step.path)}
                                    className="min-w-[180px]"
                                >
                                    <Icon className="mr-2 h-5 w-5" />
                                    {step.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Home Link */}
                <Button
                    variant="link"
                    onClick={onFinish}
                    className="text-muted-foreground"
                >
                    Go to Homepage
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
