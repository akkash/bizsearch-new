import React from "react";
import { HeroSection } from "@/polymet/components/hero-section";
import { FeaturedCarousel } from "@/polymet/components/featured-carousel";
import { FranchiseeMatcher } from "@/components/franchisee-matcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightIcon,
  Sparkles,
  Target,
  Zap,
  Shield,
  CheckCircle,
  MapPin,
  GitCompareArrows,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileNudgeBanner } from "@/components/profile/ProfileNudgeBanner";

interface HomePageProps {
  className?: string;
}

const trustPrinciples = [
  {
    icon: Shield,
    title: "Transparent investment details",
    description: "Franchise fees, royalties, and requirements shown clearly on each listing.",
  },
  {
    icon: CheckCircle,
    title: "Verified when documented",
    description: "Verification badges reflect completed checks — not marketing labels.",
  },
  {
    icon: Target,
    title: "Explainable matching",
    description: "Recommendations show why a franchise fits your budget, location, and goals.",
  },
  {
    icon: MapPin,
    title: "Real marketplace data",
    description: "Listings, saves, and enquiries come from our database — not fabricated stats.",
  },
];

export function HomePage({ className }: HomePageProps) {
  const [showFranchiseeMatcher, setShowFranchiseeMatcher] = React.useState(false);
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
      <HeroSection onSearch={handleSearch} />

      {user && (
        <div className="container mx-auto px-4 mt-6">
          <ProfileNudgeBanner variant="banner" />
        </div>
      )}

      {/* Discovery tools */}
      <section className="py-12 bg-gradient-to-br from-trust-blue/5 via-growth-green/5 to-trust-blue/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              Discover Franchises
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Search, filter, and find your fit
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Use natural language search or get matched to franchises based on
              your budget, location, and industry interests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Natural Language Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Try &quot;I have ₹40 lakh and want a food business in Chennai&quot;
                  — we translate it into real filters.
                </p>
                <Link to="/smart-search">
                  <Button variant="outline" className="w-full">
                    Try Smart Search
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-growth-green/30">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-growth-green/10 flex items-center justify-center mb-3">
                  <Target className="h-6 w-6 text-growth-green" />
                </div>
                <CardTitle className="text-xl">Franchise Matcher</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Enter your budget and preferences to see explainable match
                  scores against live franchise listings.
                </p>
                <Button
                  className="w-full bg-growth-green hover:bg-growth-green/90"
                  onClick={() => setShowFranchiseeMatcher(true)}
                >
                  Find My Match
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-trust-blue/10 flex items-center justify-center mb-3">
                  <GitCompareArrows className="h-6 w-6 text-trust-blue" />
                </div>
                <CardTitle className="text-xl">Compare Franchises</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Browse franchises side by side — investment, fees, space
                  requirements, and support.
                </p>
                <Link to="/franchises">
                  <Button variant="outline" className="w-full">
                    Browse & Compare
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Primary: Featured Franchises */}
      <section className="py-8 md:py-16 bg-background">
        <FeaturedCarousel
          type="franchise"
          title="Featured Franchises"
          subtitle="Explore franchise opportunities from verified franchisors"
          onViewAll={() => navigate("/franchises")}
        />
      </section>

      {/* Secondary: Businesses for Sale */}
      <section className="py-8 md:py-12 bg-muted/30 border-t">
        <FeaturedCarousel
          type="business"
          title="Businesses for Sale"
          subtitle="Already operating? Explore verified businesses ready for acquisition."
          onViewAll={() => navigate("/businesses")}
        />
      </section>

      {/* Honest trust principles */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Built for trust, not hype</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We show real listing data and clear verification levels — never
              inflated counts or fabricated success stories.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPrinciples.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-r from-trust-blue via-[hsl(213,50%,30%)] to-[hsl(180,50%,25%)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to find your franchise?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Discover opportunities, compare investment details, and request
            information from franchisors — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/franchises">
              <Button size="lg" variant="secondary" className="gap-2 px-8">
                <Store className="h-5 w-5" />
                Find a Franchise
              </Button>
            </Link>
            <Link to="/add-franchise-listing">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 px-8 bg-transparent border-white text-white hover:bg-white hover:text-trust-blue"
              >
                List Your Franchise
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-sm opacity-75">
            <Link to="/businesses" className="underline underline-offset-4 hover:opacity-100">
              Explore businesses for sale
            </Link>
            {" · "}
            <Link to="/help" className="underline underline-offset-4 hover:opacity-100">
              Help & resources
            </Link>
          </p>
        </div>
      </section>

      {showFranchiseeMatcher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <FranchiseeMatcher onClose={() => setShowFranchiseeMatcher(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
