import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

/**
 * Restrained product page header — no blobs, glow, or gradient marketing chrome.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
  compact = false,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "border-b border-border bg-card",
        compact ? "py-8 md:py-10" : "py-10 md:py-14",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-foreground leading-[0.95]">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </section>
  );
}

interface AuthShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {(title || subtitle) && (
          <div className="text-center mb-6">
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        <div className="rounded-none border-2 border-foreground bg-card p-6 shadow-none">
          {children}
        </div>
      </div>
    </div>
  );
}
