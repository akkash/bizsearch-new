/**
 * BizSearch homepage — franchise-first GTM surface.
 * Business sales remain available as secondary inventory.
 *
 * Section order:
 * 1. Nav (MainLayout)
 * 2. Franchise search hero
 * 3. Franchise inventory (primary)
 * 4. Businesses for sale (secondary)
 * 5. Match + live ROI estimator
 * 6. Category comparison table
 * 7. Verification
 * 8. List your franchise CTA
 * Footer (MainLayout)
 */
import { MarketplaceHero } from "@/polymet/components/marketplace-hero";
import {
  HomeBusinessInventory,
  HomeFranchiseInventory,
} from "@/polymet/components/home-inventory";
import { ValuationPreviewSection } from "@/polymet/components/valuation-preview-section";
import { HomeCompareTable } from "@/polymet/components/home-compare-table";
import { TrustVerificationSection } from "@/polymet/components/trust-verification-section";
import { SellerCtaSection } from "@/polymet/components/seller-cta-section";
import { cn } from "@/lib/utils";

interface HomePageProps {
  className?: string;
}

export function HomePage({ className }: HomePageProps) {
  return (
    <div className={cn("bg-background", className)} data-homepage="franchise-first">
      <MarketplaceHero />
      <HomeFranchiseInventory />
      <HomeBusinessInventory />
      <ValuationPreviewSection />
      <HomeCompareTable />
      <TrustVerificationSection />
      <SellerCtaSection />
    </div>
  );
}
