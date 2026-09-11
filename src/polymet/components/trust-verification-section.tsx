import { CheckCircle2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const CHECKS = [
  {
    label: "Owner identity",
    body: "Confirm the franchisor’s legal name, directors, and that the person you are speaking with is authorised to offer the territory.",
  },
  {
    label: "Business registration",
    body: "Ask for CIN / GST / FSSAI (where relevant) and match them to the brand on the listing. Unverified registrations should pause the deal.",
  },
  {
    label: "GST information",
    body: "Royalty, brand fee, and fit-out invoices should show GST. Build 18% into working-capital so the first quarter is not underfunded.",
  },
  {
    label: "Financial documents",
    body: "Request unit-level P&L, not only network averages. Compare published investment, royalty, and payback against two operating outlets.",
  },
  {
    label: "Listing information",
    body: "Space, fee, and royalty on this page are franchisor-provided estimates. Walk the site, read the agreement, and take independent advice before you apply.",
  },
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
              Verification is listing-specific. Expand each check for the due-diligence
              step we recommend before you send an application.
            </p>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Due-diligence checklist
            </div>
            <Accordion type="single" collapsible className="border border-border rounded-xl bg-card shadow-sm divide-y divide-border">
              {CHECKS.map((item) => (
                <AccordionItem key={item.label} value={item.label} className="border-0 px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="flex items-center gap-3 text-left">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-growth-green" aria-hidden="true" />
                      <span className="text-base font-medium">{item.label}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4 pl-8">
                    {item.body}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
