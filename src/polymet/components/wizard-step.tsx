import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Eye } from "lucide-react";
import { Step } from "./listing-wizard";

interface WizardStepProps {
    step: Step;
    defaultValues: any;
    onAutoSave: (data: any) => void;
    onNext: (data: any) => void;
    onPrevious: () => void;
    onPreview: (data: any) => void;
    isLastStep: boolean;
    isFirstStep: boolean;
    isAutoSaving: boolean;
    renderContent: (form: any) => React.ReactNode;
}

export function WizardStep({
    step,
    defaultValues,
    onAutoSave,
    onNext,
    onPrevious,
    onPreview,
    isLastStep,
    isFirstStep,
    renderContent,
}: WizardStepProps) {
    const form = useForm({
        resolver: zodResolver(step.schema),
        defaultValues,
        mode: "onChange",
    });

    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-save logic with debounce
    useEffect(() => {
        const subscription = form.watch(() => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
            autoSaveTimeoutRef.current = setTimeout(() => {
                onAutoSave(form.getValues());
            }, 2000);
        });
        return () => {
            subscription.unsubscribe();
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [form, onAutoSave]);

    const handleSubmit = async () => {
        const isValid = await form.trigger();
        if (isValid) {
            onNext(form.getValues());
        }
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {step.icon}
                    {step.title}
                </CardTitle>
                <p className="text-muted-foreground">{step.description}</p>
            </CardHeader>
            <CardContent>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    {renderContent(form)}

                    {/* Navigation Buttons inside the form context */}
                    <div className="flex justify-between pt-6">
                        <Button
                            variant="outline"
                            onClick={onPrevious}
                            disabled={isFirstStep}
                            type="button"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>

                        <div className="flex gap-2">
                            {isLastStep ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            form.trigger().then((valid) => {
                                                if (valid) onPreview(form.getValues());
                                            });
                                        }}
                                        type="button"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Preview
                                    </Button>
                                    <Button onClick={handleSubmit} type="button">Publish Listing</Button>
                                </>
                            ) : (
                                <Button onClick={handleSubmit} type="button">
                                    Next
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
