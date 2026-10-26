import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium min-h-11 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-growth-green text-white font-bold normal-case tracking-normal shadow-none hover:bg-growth-green-dark",
        destructive:
          "bg-destructive text-destructive-foreground font-bold normal-case tracking-normal shadow-none hover:bg-destructive/90",
        outline:
          "border-2 border-foreground bg-transparent font-bold normal-case tracking-normal shadow-none hover:bg-foreground hover:text-background",
        secondary:
          "bg-secondary text-secondary-foreground font-bold normal-case tracking-normal shadow-none hover:bg-muted",
        ghost: "hover:bg-secondary hover:text-foreground",
        link: "text-trust-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-11 rounded-lg px-3 text-sm",
        lg: "h-12 rounded-lg px-8",
        icon: "h-11 w-11 min-w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
