
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingStepEssentials } from './OnboardingStepEssentials';
import { OnboardingStepRole } from './OnboardingStepRole';
import { OnboardingStepVerification } from './OnboardingStepVerification';
import { OnboardingStepComplete } from './OnboardingStepComplete';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface OnboardingWizardProps {
    className?: string;
}

export function OnboardingWizard({ className = '' }: OnboardingWizardProps) {
    const { user, loading: authLoading } = useAuth();
    const {
        currentStep,
        currentStepIndex,
        data,
        saving,
        error,
        profile,
        updateData,
        goToNextStep,
        goToPreviousStep,
        saveStepData,
        completeOnboarding,
        skipOnboarding,
        finishOnboarding,
    } = useOnboarding();

    // Debug logging
    console.log('🔄 OnboardingWizard render:', {
        authLoading,
        hasUser: !!user,
        hasProfile: !!profile,
        currentStep,
    });

    const handleEssentialsNext = async () => {
        console.log('📝 handleEssentialsNext called');
        const saved = await saveStepData();
        console.log('📝 saveStepData result:', saved);
        if (saved) {
            goToNextStep();
        }
    };

    const handleRoleNext = async () => {
        console.log('📝 handleRoleNext called');
        const saved = await saveStepData();
        console.log('📝 saveStepData result:', saved);
        if (saved) {
            goToNextStep();
        }
    };

    const handleVerificationNext = async () => {
        console.log('📝 handleVerificationNext called');
        await completeOnboarding();
    };

    const handleVerificationSkip = async () => {
        console.log('📝 handleVerificationSkip called');
        await completeOnboarding();
    };

    // Show loading while auth is loading or profile not yet fetched
    if (authLoading || !user) {
        return (
            <div className={`w-full max-w-2xl mx-auto ${className}`}>
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Loading your profile...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show loading while waiting for profile to be fetched
    if (!profile) {
        return (
            <div className={`w-full max-w-2xl mx-auto ${className}`}>
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Setting up your profile...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const renderStep = () => {
        switch (currentStep) {
            case 'essentials':
                return (
                    <OnboardingStepEssentials
                        data={data}
                        onUpdate={updateData}
                        onNext={handleEssentialsNext}
                        onSkip={skipOnboarding}
                        saving={saving}
                        error={error}
                    />
                );
            case 'role':
                return (
                    <OnboardingStepRole
                        data={data}
                        profile={profile}
                        onUpdate={updateData}
                        onNext={handleRoleNext}
                        onBack={goToPreviousStep}
                        saving={saving}
                        error={error}
                    />
                );
            case 'verification':
                return (
                    <OnboardingStepVerification
                        profile={profile}
                        onNext={handleVerificationNext}
                        onBack={goToPreviousStep}
                        onSkip={handleVerificationSkip}
                    />
                );
            case 'complete':
                return (
                    <OnboardingStepComplete
                        profile={profile}
                        onFinish={finishOnboarding}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={`w-full max-w-2xl mx-auto ${className}`}>
            {/* Progress indicator (hide on complete step) */}
            {currentStep !== 'complete' && (
                <OnboardingProgress
                    currentStep={currentStepIndex}
                    className="mb-8"
                />
            )}

            {/* Step content */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-6 md:p-8">
                    {renderStep()}
                </CardContent>
            </Card>
        </div>
    );
}

// Export all onboarding components
export { OnboardingProgress } from './OnboardingProgress';
export { OnboardingStepEssentials } from './OnboardingStepEssentials';
export { OnboardingStepRole } from './OnboardingStepRole';
export { OnboardingStepVerification } from './OnboardingStepVerification';
export { OnboardingStepComplete } from './OnboardingStepComplete';
