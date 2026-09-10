/**
 * BizSearch homepage — franchise-first GTM surface.
 * Business sales remain available as secondary inventory.
 *
 * Section order:
 * 1. Nav (MainLayout)
 * 2. Franchise search hero
 * 3. Franchise inventory (primary)
 * 4. Businesses for sale (secondary)
 * 5. Franchise match preview (SAMPLE)
 * 6. Franchise ROI preview (SAMPLE)
 * 7. Verification
 * 8. List your franchise CTA
 * Footer (MainLayout)
 */
import { MarketplaceHero } from "@/polymet/components/marketplace-hero";
import {
  HomeBusinessInventory,
  HomeFranchiseInventory,
} from "@/polymet/components/home-inventory";
import { MatchPreviewSection } from "@/polymet/components/match-preview-section";
import { ValuationPreviewSection } from "@/polymet/components/valuation-preview-section";
import { TrustVerificationSection } from "@/polymet/components/trust-verification-section";
import { SellerCtaSection } from "@/polymet/components/seller-cta-section";
import { cn } from "@/lib/utils";

interface HomePageProps {
  className?: string;
}

export function HomePage({ className }: HomePageProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)} data-homepage="franchise-first">
      <MarketplaceHero />
      <HomeFranchiseInventory />
      <HomeBusinessInventory />
      <div className="border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-8 items-stretch">
          <MatchPreviewSection embedded />
          <ValuationPreviewSection embedded />
        </div>
      </div>
      <TrustVerificationSection />
      <SellerCtaSection />
    </div>
  );
}
