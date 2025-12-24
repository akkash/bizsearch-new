import { cn } from '@/lib/utils';
import { Check, User, Briefcase, Shield, PartyPopper } from 'lucide-react';

interface OnboardingProgressProps {
    currentStep: number;
    className?: string;
}

const steps = [
    { id: 1, label: 'Essentials', icon: User },
    { id: 2, label: 'Your Role', icon: Briefcase },
    { id: 3, label: 'Verify', icon: Shield },
    { id: 4, label: 'Complete', icon: PartyPopper },
];

export function OnboardingProgress({ currentStep, className }: OnboardingProgressProps) {
    return (
        <div className={cn('w-full', className)}>
            {/* Progress Bar */}
            <div className="relative">
                {/* Background track */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />

                {/* Filled progress */}
                <div
                    className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;
                        const Icon = step.icon;

                        return (
                            <div
                                key={step.id}
                                className="flex flex-col items-center"
                            >
                                {/* Step circle */}
                                <div
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                                        isCompleted && 'bg-primary border-primary text-primary-foreground',
                                        isCurrent && 'bg-background border-primary text-primary',
                                        !isCompleted && !isCurrent && 'bg-muted border-muted-foreground/30 text-muted-foreground'
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <Icon className="w-5 h-5" />
                                    )}
                                </div>

                                {/* Step label */}
                                <span
                                    className={cn(
                                        'mt-2 text-xs font-medium transition-colors',
                                        isCurrent && 'text-primary',
                                        isCompleted && 'text-primary',
                                        !isCompleted && !isCurrent && 'text-muted-foreground'
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step counter text */}
            <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground">
                    Step {Math.min(currentStep + 1, steps.length)} of {steps.length}
                </span>
            </div>
        </div>
    );
}
