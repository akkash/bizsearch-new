import { HeroSection } from "@/polymet/components/hero-section";
import { FeaturedCarousel } from "@/polymet/components/featured-carousel";
import { ValuationPreviewSection } from "@/polymet/components/valuation-preview-section";
import { TrustVerificationSection } from "@/polymet/components/trust-verification-section";
import { SellerCtaSection } from "@/polymet/components/seller-cta-section";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileNudgeBanner } from "@/components/profile/ProfileNudgeBanner";

interface HomePageProps {
  className?: string;
}

export function HomePage({ className }: HomePageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSearch = (
    query: string,
    type: "business" | "franchise",
    filters: Record<string, unknown>
  ) => {
    const searchParams = new URLSearchParams();
    if (query) searchParams.set("q", query);
    if (filters?.industry && filters.industry !== "All Industries") {
      searchParams.set("industry", String(filters.industry));
    }
    if (filters?.location && filters.location !== "All Locations") {
      searchParams.set("location", String(filters.location));
    }

    const path = type === "franchise" ? "/franchises" : "/businesses";
    const queryString = searchParams.toString();
    navigate(queryString ? `${path}?${queryString}` : path);
  };

  return (
    <div className={cn("min-h-screen", className)}>
      {/* 2–3: Discovery + user paths */}
      <HeroSection onSearch={handleSearch} />

      {user && (
        <div className="container mx-auto px-4 mt-6">
          <ProfileNudgeBanner variant="banner" />
        </div>
      )}

      {/* 4: Business opportunities first — buyer journey */}
      <section className="py-10 md:py-14 bg-background">
        <FeaturedCarousel
          type="business"
          title="Businesses for sale"
          subtitle="Operating businesses with asking price, revenue, and verification status"
          onViewAll={() => navigate("/businesses")}
        />
      </section>

      {/* 5: Franchise opportunities — distinct inventory */}
      <section className="py-10 md:py-14 bg-muted/30 border-y border-border">
        <FeaturedCarousel
          type="franchise"
          title="Franchise opportunities"
          subtitle="Initial investment, fees, territories, and break-even expectations"
          onViewAll={() => navigate("/franchises")}
        />
      </section>

      {/* 6: Product preview — valuation / BI */}
      <ValuationPreviewSection />

      {/* 7: Trust / verification */}
      <TrustVerificationSection />

      {/* 8: Seller CTA */}
      <SellerCtaSection />

      {/* 9: Final CTA — restrained */}
      <section className="py-12 md:py-14 border-t border-border bg-[hsl(220,32%,7%)] text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">
                Start with a search
              </h2>
              <p className="text-white/65 text-sm md:text-base max-w-md">
                Compare financials, review verification, and contact sellers when you are ready.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/businesses">
                <Button size="lg" className="w-full sm:w-auto bg-growth-green hover:bg-growth-green/90 text-white">
                  <Building2 className="h-4 w-4 mr-2" />
                  Browse businesses
                </Button>
              </Link>
              <Link to="/franchises">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/30 bg-transparent text-white hover:bg-white/10"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Browse franchises
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
