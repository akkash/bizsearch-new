import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    ChevronRight,
    Save,
    Send,
    Loader2,
    CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StickyActionBarProps {
    onSaveDraft: () => void;
    onNext: () => void;
    onPrevious: () => void;
    nextStepName: string;
    currentStepIndex: number;
    totalSteps: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    isSaving: boolean;
    lastSaved?: Date | null;
    isValid?: boolean;
    onSubmit?: () => void;
    className?: string;
}

export function StickyActionBar({
    onSaveDraft,
    onNext,
    onPrevious,
    nextStepName,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    isSaving,
    lastSaved,
    isValid = false,
    onSubmit,
    className,
}: StickyActionBarProps) {
    const progress = ((currentStepIndex + 1) / totalSteps) * 100;

    const formatLastSaved = (date: Date) => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
                className
            )}
        >
            {/* Progress bar at top of sticky bar */}
            <div className="h-1 w-full bg-muted">
                <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="container mx-auto px-4 py-3">
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between">
                    {/* Left: Save Status */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSaveDraft}
                            disabled={isSaving}
                            className="gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Draft
                                </>
                            )}
                        </Button>

                        {lastSaved && !isSaving && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                Saved {formatLastSaved(lastSaved)}
                            </div>
                        )}
                    </div>

                    {/* Center: Progress Indicator */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            Step {currentStepIndex + 1} of {totalSteps}
                        </span>
                        <Badge variant="secondary" className="font-mono">
                            {Math.round(progress)}%
                        </Badge>
                    </div>

                    {/* Right: Navigation Buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={onPrevious}
                            disabled={isFirstStep}
                            className="gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>

                        {isLastStep ? (
                            <Button
                                onClick={onSubmit}
                                disabled={!isValid}
                                size="lg"
                                className="gap-2 min-w-[160px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                            >
                                <Send className="h-4 w-4" />
                                Submit Listing
                            </Button>
                        ) : (
                            <Button
                                onClick={onNext}
                                size="lg"
                                className="gap-2 min-w-[180px]"
                            >
                                Next: {nextStepName}
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="flex md:hidden flex-col gap-3">
                    {/* Progress info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {lastSaved && !isSaving && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    Saved
                                </div>
                            )}
                            {isSaving && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Saving...
                                </div>
                            )}
                        </div>
                        <Badge variant="secondary" className="font-mono text-xs">
                            {currentStepIndex + 1}/{totalSteps} • {Math.round(progress)}%
                        </Badge>
                    </div>

                    {/* Navigation buttons - full width */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={onPrevious}
                            disabled={isFirstStep}
                            className="flex-1"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>

                        {isLastStep ? (
                            <Button
                                onClick={onSubmit}
                                disabled={!isValid}
                                className="flex-[2] bg-gradient-to-r from-primary to-primary/90"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Submit Listing
                            </Button>
                        ) : (
                            <Button onClick={onNext} className="flex-[2]">
                                Next: {nextStepName}
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
