import { FranchiseeMatcher } from '@/components/franchisee-matcher';
import { PageHero } from '@/components/page-hero';

export function FranchiseMatchPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHero
        eyebrow="Franchise match"
        title="Match my profile"
        description="Score active franchise listings against your investment, territory, and experience. Enquire writes to your inquiry pipeline."
      />
      <div className="container mx-auto px-4 py-10 md:py-14">
        <FranchiseeMatcher />
      </div>
    </div>
  );
}
