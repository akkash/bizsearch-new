import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export function OnboardingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            <div className="container mx-auto px-4 py-8 md:py-16">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Welcome to BizSearch
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Let's set up your profile to get you started
                    </p>
                </div>

                {/* Wizard */}
                <OnboardingWizard />
            </div>
        </div>
    );
}
