import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SellerCtaSectionProps {
  className?: string;
}

const STEPS = [
  { step: "1", title: "Create listing", desc: "Add business details and financials" },
  { step: "2", title: "Verify business", desc: "Complete identity and document checks" },
  { step: "3", title: "Receive qualified interest", desc: "Buyers who match your criteria" },
  { step: "4", title: "Connect with buyers", desc: "Negotiate and move toward close" },
];

export function SellerCtaSection({ className }: SellerCtaSectionProps) {
  return (
    <section className={cn("py-14 md:py-16 border-t border-border", className)}>
      <div className="container mx-auto px-4">
        <div className="rounded-lg border border-border bg-card p-6 md:p-10">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                Sell your business
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg leading-relaxed">
                Find qualified buyers and present your business with the
                information serious buyers need.
              </p>
              <Link to="/add-business-listing">
                <Button size="lg" className="bg-growth-green hover:bg-growth-green/90 text-white">
                  List Your Business
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <ol className="grid sm:grid-cols-2 gap-4">
              {STEPS.map((item) => (
                <li key={item.step} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold font-mono">
                    {item.step}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
