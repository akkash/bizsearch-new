
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingStepEssentials } from './OnboardingStepEssentials';
import { OnboardingStepRole } from './OnboardingStepRole';
import { OnboardingStepVerification } from './OnboardingStepVerification';
import { OnboardingStepComplete } from './OnboardingStepComplete';
import { useOnboarding } from '@/hooks/use-onboarding';

interface OnboardingWizardProps {
    className?: string;
}

export function OnboardingWizard({ className = '' }: OnboardingWizardProps) {
    const {
        currentStep,
        currentStepIndex,
        totalSteps,
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

    const handleEssentialsNext = async () => {
        const saved = await saveStepData();
        if (saved) {
            goToNextStep();
        }
    };

    const handleRoleNext = async () => {
        const saved = await saveStepData();
        if (saved) {
            goToNextStep();
        }
    };

    const handleVerificationNext = async () => {
        await completeOnboarding();
    };

    const handleVerificationSkip = async () => {
        await completeOnboarding();
    };

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
                    totalSteps={totalSteps}
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
