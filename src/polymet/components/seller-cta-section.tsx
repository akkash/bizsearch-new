import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: "1", title: "List brand" },
  { n: "2", title: "Get leads" },
  { n: "3", title: "Qualify & convert" },
];

export function SellerCtaSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-7 md:py-9", className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-t border-border pt-7">
          <div className="max-w-lg">
            <h2 className="text-xl md:text-[1.75rem] font-bold tracking-tight mb-1.5 leading-tight">
              Expanding your franchise brand?
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              List your franchise and reach prospective franchisees ready to invest.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link to="/add-franchise-listing">
                <Button size="sm" className="h-9 bg-growth-green hover:bg-growth-green/90 text-white">
                  List Your Franchise
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link to="/add-business-listing">
                <Button size="sm" variant="outline" className="h-9">
                  Sell a business
                </Button>
              </Link>
            </div>
          </div>
          <ol className="flex gap-6 md:gap-8">
            {STEPS.map((s) => (
              <li key={s.n} className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                <span className="text-sm font-medium">{s.title}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
