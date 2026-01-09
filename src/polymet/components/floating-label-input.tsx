import React, { useState, forwardRef, InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingLabelInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    label: string;
    tooltip?: string;
    error?: string;
    isValid?: boolean;
    helperText?: string;
    required?: boolean;
}

export const FloatingLabelInput = forwardRef<
    HTMLInputElement,
    FloatingLabelInputProps
>(
    (
        {
            label,
            tooltip,
            error,
            isValid,
            helperText,
            required,
            className,
            id,
            value,
            defaultValue,
            onFocus,
            onBlur,
            ...props
        },
        ref
    ) => {
        const [isFocused, setIsFocused] = useState(false);
        const [hasValue, setHasValue] = useState(
            Boolean(value || defaultValue || props.placeholder)
        );

        const inputId = id || `floating-${label.toLowerCase().replace(/\s+/g, "-")}`;
        const isFloating = isFocused || hasValue;

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            setHasValue(Boolean(e.target.value));
            onBlur?.(e);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setHasValue(Boolean(e.target.value));
            props.onChange?.(e);
        };

        return (
            <div className="relative w-full">
                <div className="relative">
                    <Input
                        id={inputId}
                        ref={ref}
                        value={value}
                        defaultValue={defaultValue}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        className={cn(
                            "h-12 pt-4 pb-1 px-3 peer transition-all",
                            error && "border-destructive focus-visible:ring-destructive",
                            isValid && !error && "border-green-500 focus-visible:ring-green-500",
                            className
                        )}
                        {...props}
                    />

                    {/* Floating Label */}
                    <Label
                        htmlFor={inputId}
                        className={cn(
                            "absolute left-3 transition-all duration-200 pointer-events-none",
                            "text-muted-foreground",
                            isFloating
                                ? "top-1.5 text-[10px] font-medium"
                                : "top-1/2 -translate-y-1/2 text-sm",
                            isFocused && "text-primary",
                            error && "text-destructive"
                        )}
                    >
                        {label}
                        {required && <span className="text-destructive ml-0.5">*</span>}
                    </Label>

                    {/* Status Icons */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {/* Tooltip */}
                        {tooltip && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            <HelpCircle className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                        <p className="text-sm">{tooltip}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        {/* Validation Status */}
                        {isValid && !error && (
                            <CheckCircle className="h-4 w-4 text-green-500 animate-in fade-in duration-200" />
                        )}
                        {error && (
                            <AlertCircle className="h-4 w-4 text-destructive animate-in fade-in duration-200" />
                        )}
                    </div>
                </div>

                {/* Helper/Error Text */}
                {(error || helperText) && (
                    <p
                        className={cn(
                            "text-xs mt-1 ml-1 animate-in slide-in-from-top-1 duration-200",
                            error ? "text-destructive" : "text-muted-foreground"
                        )}
                    >
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

FloatingLabelInput.displayName = "FloatingLabelInput";
