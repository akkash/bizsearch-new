import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SellerCtaSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-8 leading-tight">
          Expanding your franchise brand?
        </h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/add-franchise-listing">
            <Button className="h-14 px-8">
              List Your Franchise
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link to="/add-business-listing">
            <Button variant="outline" className="h-14 px-8">
              Sell a business
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
