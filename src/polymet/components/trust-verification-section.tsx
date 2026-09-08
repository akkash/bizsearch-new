import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CHECKS = [
  "Owner identity",
  "Business registration",
  "GST information",
  "Financial documents",
  "Listing information",
];

export function TrustVerificationSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-7 md:py-9 border-b border-border", className)}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 lg:gap-12 items-start">
          <div>
            <h2 className="text-xl md:text-[1.75rem] font-bold tracking-tight mb-2 leading-tight">
              Know what you&apos;re looking at.
            </h2>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Verification is listing-specific. Status badges appear only when
              checks are completed for that business.
            </p>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium mb-3">
              What we verify
            </div>
            <ul className="space-y-0 border-t border-border">
              {CHECKS.map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-3 text-sm py-2.5 border-b border-border"
                >
                  <CheckCircle2
                    className="h-3.5 w-3.5 text-growth-green shrink-0"
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-muted-foreground mt-3">
              Default status is{" "}
              <span className="text-foreground">Verification available</span>
              {" "}— not every listing has completed every check.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
