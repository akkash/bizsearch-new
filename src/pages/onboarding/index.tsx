import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export function OnboardingPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 md:py-16">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                        Welcome to BizSearch
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Let's set up your profile to get you started
                    </p>
                </div>

                <OnboardingWizard />
            </div>
        </div>
    );
}
