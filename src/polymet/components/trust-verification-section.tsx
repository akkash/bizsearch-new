import { Link } from "react-router-dom";
import { CheckCircle2, FileCheck, BadgeCheck, Shield, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustVerificationSectionProps {
  className?: string;
}

const VERIFICATION_CHECKS = [
  { icon: BadgeCheck, label: "Owner identity verified" },
  { icon: FileCheck, label: "Business registration verified" },
  { icon: ClipboardCheck, label: "GST details verified" },
  { icon: FileCheck, label: "Financial documents uploaded" },
  { icon: Shield, label: "Listing reviewed" },
];

export function TrustVerificationSection({ className }: TrustVerificationSectionProps) {
  return (
    <section className={cn("py-14 md:py-16 border-t border-border", className)}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-growth-green mb-3">
              Verification
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              Trust comes from evidence
            </h2>
            <p className="text-muted-foreground text-base max-w-md leading-relaxed">
              Serious buyers need more than a listing. Verification status shows
              what has been checked — not marketing claims.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
              <CheckCircle2 className="h-5 w-5 text-growth-green" />
              <span className="font-semibold text-sm tracking-wide uppercase text-foreground">
                Verified Business
              </span>
            </div>
            <ul className="space-y-3">
              {VERIFICATION_CHECKS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-center gap-3 text-sm">
                    <Icon className="h-4 w-4 text-growth-green shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 pt-4 border-t border-border text-xs text-muted-foreground">
              Badges appear only when checks are completed for that listing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
