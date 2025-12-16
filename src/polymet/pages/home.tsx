import React from "react";
import { HeroSection } from "@/polymet/components/hero-section";
import { FeaturedCarousel } from "@/polymet/components/featured-carousel";
import { TrustIndicators } from "@/polymet/components/trust-indicators";
import { AIChat } from "@/polymet/components/ai-chat";
import { Footer } from "@/polymet/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightIcon,
  TrendingUpIcon,
  UsersIcon,
  ShieldCheckIcon,
  StarIcon,
  PlayCircleIcon,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface HomePageProps {
  className?: string;
}

const successStories = [
  {
    id: "1",
    buyerName: "Rajesh Kumar",
    businessName: "TechStart Solutions",
    industry: "Technology",
    dealValue: "₹2.5 Cr",
    timeline: "45 days",
    image: "https://github.com/yusufhilmi.png",
    testimonial:
      "BizSearch made finding and acquiring my dream tech business incredibly smooth. The AI agent Ajay provided invaluable insights throughout the process.",
  },
  {
    id: "2",
    buyerName: "Priya Sharma",
    businessName: "Café Delight Franchise",
    industry: "Food & Beverage",
    dealValue: "₹35 L",
    timeline: "30 days",
    image: "https://github.com/kdrnp.png",
    testimonial:
      "Vijay helped me find the perfect franchise opportunity. The ROI projections were accurate and the support was exceptional.",
  },
  {
    id: "3",
    buyerName: "Amit Patel",
    businessName: "HealthCare Plus",
    industry: "Healthcare",
    dealValue: "₹1.8 Cr",
    timeline: "60 days",
    image: "https://github.com/yahyabedirhan.png",
    testimonial:
      "The verification process and document management made the entire acquisition transparent and secure.",
  },
];

const platformStats = [
  { label: "Active Listings", value: "12,500+", icon: TrendingUpIcon },
  { label: "Successful Deals", value: "3,200+", icon: ShieldCheckIcon },
  { label: "Verified Users", value: "45,000+", icon: UsersIcon },
  { label: "Average Rating", value: "4.8/5", icon: StarIcon },
];

const aiFeatures = [
  {
    title: "Smart Matching",
    description:
      "AI-powered recommendations based on your preferences and investment capacity",
    icon: "🎯",
    illustration: "🤖💡",
  },
  {
    title: "Market Analysis",
    description:
      "Real-time market insights and competitive analysis for informed decisions",
    icon: "📊",
    illustration: "📈🔍",
  },
  {
    title: "ROI Projections",
    description:
      "Accurate return on investment calculations with risk assessment",
    icon: "💰",
    illustration: "💹📊",
  },
  {
    title: "Document Review",
    description: "AI-assisted document verification and due diligence support",
    icon: "📋",
    illustration: "📄✅",
  },
];

const partnerLogos = [
  { 
    name: "HDFC Bank", 
    logo: "https://logo.clearbit.com/hdfcbank.com",
    fallback: "HDFC"
  },
  { 
    name: "ICICI Bank", 
    logo: "https://logo.clearbit.com/icicibank.com",
    fallback: "ICICI"
  },
  { 
    name: "Kotak Mahindra", 
    logo: "https://logo.clearbit.com/kotak.com",
    fallback: "Kotak"
  },
  { 
    name: "Axis Bank", 
    logo: "https://logo.clearbit.com/axisbank.com",
    fallback: "Axis"
  },
  { 
    name: "SBI", 
    logo: "https://logo.clearbit.com/sbi.co.in",
    fallback: "SBI"
  },
  { 
    name: "Yes Bank", 
    logo: "https://logo.clearbit.com/yesbank.in",
    fallback: "Yes"
  },
];

export function HomePage({ className }: HomePageProps) {
  const [showAIChat, setShowAIChat] = React.useState(false);

  const handleSearch = (
    query: string,
    type: "business" | "franchise",
    filters: any
  ) => {
    console.log("Homepage search:", { query, type, filters });
    // Search functionality will be handled by the search component
    // Navigation will be handled by Link components
  };

  const handleViewAllBusinesses = () => {
    // This will be handled by Link component instead
    console.log("View all businesses clicked");
  };

  const handleViewAllFranchises = () => {
    // This will be handled by Link component instead
    console.log("View all franchises clicked");
  };

  const handleViewAllStories = () => {
    // Navigate to about page which has success stories
    window.location.href = '/about#success-stories';
  };

  const handleWatchAIDemo = () => {
    // Open AI chat to demonstrate capabilities
    setShowAIChat(true);
  };

  const handleTryAINow = () => {
    // Open AI chat widget
    setShowAIChat(true);
  };

  const handleMoreLikeThis = () => {
    // Open AI chat for personalized recommendations
    setShowAIChat(true);
  };

  return (
    <div className={cn("min-h-screen", className)}>
      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />

      {/* Featured Listings - Mobile Optimized */}
      <section className="py-8 md:py-16 bg-background">
        <FeaturedCarousel
          type="mixed"
          title="Featured Opportunities"
          subtitle="Handpicked businesses and franchises for you"
          onViewAll={handleViewAllBusinesses}
          onMoreLikeThis={handleMoreLikeThis}
          className="space-y-6 md:space-y-4"
        />
      </section>

      {/* Platform Statistics - Mobile Optimized */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              Join India's largest marketplace for business acquisitions and
              franchise opportunities
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {platformStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6">
                    <IconComponent className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 md:mb-3 text-primary" />

                    <div className="text-xl md:text-2xl font-bold mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">AI-Powered Intelligence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI agents Ajay and Vijay provide personalized assistance
              throughout your business journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {aiFeatures.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow group"
              >
                <CardContent className="pt-6">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <div className="text-2xl mb-4 opacity-60">
                    {feature.illustration}
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={handleTryAINow}
              >
                🤖 Try AI Assistant Now
              </Button>
              <Link to="/businesses">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                >
                  🔍 Browse All Opportunities
                </Button>
              </Link>
            </div>
            <Button
              variant="ghost"
              className="gap-2"
              onClick={handleWatchAIDemo}
            >
              <PlayCircleIcon className="h-5 w-5" />
              See AI in Action
            </Button>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
              <p className="text-muted-foreground">
                Real stories from entrepreneurs who found their perfect business
                match
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleViewAllStories}
              className="gap-2"
            >
              View All Stories
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story) => (
              <Card
                key={story.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={story.image}
                      alt={story.buyerName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    />

                    <div>
                      <div className="font-semibold">{story.buyerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {story.businessName}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <Badge variant="secondary">{story.industry}</Badge>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      💰 {story.dealValue}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-blue-600 border-blue-600"
                    >
                      ⚡ {story.timeline}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic">
                    "{story.testimonial}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Business Categories */}
      <section className="py-8 md:py-16 bg-background">
        <FeaturedCarousel
          type="business"
          title="Top Business Categories"
          subtitle="Explore businesses across different industries"
          onViewAll={handleViewAllBusinesses}
          onMoreLikeThis={handleMoreLikeThis}
        />
      </section>

      {/* Franchise Opportunities */}
      <section className="py-8 md:py-16 bg-muted/30">
        <FeaturedCarousel
          type="franchise"
          title="Premium Franchise Opportunities"
          subtitle="High-ROI franchise opportunities with proven track records"
          onViewAll={handleViewAllFranchises}
          onMoreLikeThis={handleMoreLikeThis}
        />
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <TrustIndicators variant="full" />

          {/* Partner Logos */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-6">
              Trusted by Leading Financial Partners
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70 hover:opacity-100 transition-opacity">
              {partnerLogos.map((partner, index) => (
                <div 
                  key={index} 
                  className="group flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {partner.fallback.substring(0, 2)}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Perfect Business?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of successful entrepreneurs who found their dream
            business or franchise through BizSearch
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
              <CardContent className="p-0 text-center">
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="text-xl font-semibold mb-2">
                  I want to Buy a Business
                </h3>
                <p className="text-sm opacity-80 mb-4">
                  Find verified businesses ready for acquisition
                </p>
                <Link to="/businesses" className="w-full">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full gap-2"
                  >
                    Browse Businesses
                    <ArrowRightIcon className="h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
              <CardContent className="p-0 text-center">
                <div className="text-4xl mb-3">🤝</div>
                <h3 className="text-xl font-semibold mb-2">
                  I want to Sell a Business
                </h3>
                <p className="text-sm opacity-80 mb-4">
                  List your business and reach qualified buyers
                </p>
                <Link to="/add-business-listing" className="w-full">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full gap-2 bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    List My Business
                    <ArrowRightIcon className="h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Link to="/franchises">
              <Button
                variant="ghost"
                className="gap-2 text-white hover:bg-white/10"
              >
                Or explore franchise opportunities
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Chat Component - Controlled visibility */}
      {showAIChat && <AIChat />}

      {/* Footer */}
      <Footer />
    </div>
  );
}
