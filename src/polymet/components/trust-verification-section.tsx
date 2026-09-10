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
    <section className={cn("py-16 md:py-24 border-b border-border", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4 leading-tight">
              Know what you&apos;re looking at.
            </h2>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Verification is listing-specific. Status badges appear only when
              checks are completed for that business.
            </p>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-6">
              Verification Checklist
            </div>
            <ul className="space-y-6 border-t border-border pt-6">
              {CHECKS.map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-4 text-lg font-medium"
                >
                  <CheckCircle2
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-muted-foreground mt-6">
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
