import React from "react";
import { HeroSection } from "@/polymet/components/hero-section";
import { FeaturedCarousel } from "@/polymet/components/featured-carousel";
import { TrustIndicators } from "@/polymet/components/trust-indicators";
import { AIChat } from "@/polymet/components/ai-chat";
import { LiveMetricsDashboard } from "@/components/live-metrics-dashboard";
import { TrustBadgesSection } from "@/components/trust-badges-section";
import { SuccessStoriesCarousel } from "@/components/success-stories-carousel";
import { SmartSearchBar } from "@/components/smart-search-bar";
import { AIBusinessMatchmaker } from "@/components/ai-business-matchmaker";
import { DueDiligenceDashboard } from "@/components/due-diligence-dashboard";
import { DocumentAnalyzer } from "@/components/document-analyzer";
import { BuyerQualifierDashboard } from "@/components/buyer-qualifier-dashboard";
import { FranchiseeMatcher } from "@/components/franchisee-matcher";
import { TerritoryAnalyzer } from "@/components/territory-analyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightIcon,
  TrendingUpIcon,
  UsersIcon,
  ShieldCheckIcon,
  StarIcon,
  PlayCircleIcon,
  Building2,
  Sparkles,
  Target,
  Zap,
  Shield,
  BarChart3,
  CheckCircle,
  Upload,
  FileText,
  MapPin,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileNudgeBanner } from "@/components/profile/ProfileNudgeBanner";

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
  { label: "Active Listings", value: "3,850+", icon: TrendingUpIcon },
  { label: "Successful Deals", value: "1,290+", icon: ShieldCheckIcon },
  { label: "Verified Sellers", value: "2,100+", icon: UsersIcon },
  { label: "Customer Rating", value: "4.7/5", icon: StarIcon },
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
  const [showMatchmaker, setShowMatchmaker] = React.useState(false);
  const [showDueDiligence, setShowDueDiligence] = React.useState(false);
  const [showDocAnalyzer, setShowDocAnalyzer] = React.useState(false);
  const [showBuyerQualifier, setShowBuyerQualifier] = React.useState(false);
  const [showFranchiseeMatcher, setShowFranchiseeMatcher] = React.useState(false);
  const [showTerritoryAnalyzer, setShowTerritoryAnalyzer] = React.useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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

      {/* Live Metrics Dashboard Strip */}
      <LiveMetricsDashboard />

      {/* Profile Completion Nudge for logged-in users */}
      {user && (
        <div className="container mx-auto px-4 mt-6">
          <ProfileNudgeBanner variant="banner" />
        </div>
      )}

      {/* NEW: AI-Powered Features Highlight */}
      <section className="py-12 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-indigo-950/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              Smart Discovery Tools
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Find the Right Business, Faster
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our tools help you search, filter, and shortlist opportunities that match your budget and goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Smart Search */}
            <Card className="hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Smart Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Use natural language to find businesses. Try "coffee shop in Mumbai under 50 lakhs"
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const searchElement = document.querySelector('[data-smart-search]');
                    searchElement?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Try Smart Search
                </Button>
              </CardContent>
            </Card>

            {/* AI Matchmaker */}
            <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-3">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">AI Matchmaker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get personalized business recommendations based on your budget, skills, and goals
                </p>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowMatchmaker(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Find My Match
                </Button>
              </CardContent>
            </Card>

            {/* AI Chatbot */}
            <Card className="hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Ask an Expert</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get instant answers about business valuations, acquisitions, and franchise opportunities
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAIChat(true)}
                >
                  Chat with AI Advisor
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Smart Search Bar */}
          <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur" data-smart-search>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Try Smart Search Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SmartSearchBar
                onSearch={(query, intent) => {
                  console.log('Smart search:', query, intent);
                  // Navigate to business listings with search results
                  navigate('/businesses', { state: { searchQuery: query, searchIntent: intent } });
                }}
                placeholder="Try: 'profitable restaurant Mumbai under 1 crore' or 'tech startup Bangalore'"
              />
            </CardContent>
          </Card>
        </div>
      </section>

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

      {/* NEW: Phase 2 AI Features - Decision Support */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              <Shield className="h-3 w-3 mr-1" />
              Due Diligence Tools
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Evaluate Opportunities with Confidence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Tools to assess risk, verify documents, and make informed decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Valuation Advisor */}
            <Card className="hover:shadow-2xl transition-all hover:-translate-y-1 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">AI Valuation Advisor</CardTitle>
                <CardDescription>
                  Get instant business valuations using multiple methods (DCF, EBITDA, asset-based)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Revenue & profit multiples
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Market comparables analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Fair price recommendations
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAIChat(true)}
                >
                  Try Valuation Tool
                </Button>
              </CardContent>
            </Card>

            {/* Due Diligence Assistant */}
            <Card className="hover:shadow-2xl transition-all hover:-translate-y-1 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-3">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">Due Diligence Assistant</CardTitle>
                <CardDescription>
                  Comprehensive risk assessment and due diligence checklist generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Financial, legal & operational analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Risk scoring & red flag detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Custom checklist creation
                  </li>
                </ul>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowDueDiligence(true)}
                >
                  Start Due Diligence
                </Button>
              </CardContent>
            </Card>

            {/* Document Analyzer */}
            <Card className="hover:shadow-2xl transition-all hover:-translate-y-1 border-pink-200 dark:border-pink-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900 flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <CardTitle className="text-xl">Document Analyzer</CardTitle>
                <CardDescription>
                  Upload and analyze financial statements, contracts, and legal documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Auto data extraction from PDFs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Red flag identification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Document authenticity check
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowDocAnalyzer(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Fraud Detection Badge */}
          <Card className="mt-8 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                    AI Fraud Detection Active
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    All listings are automatically scanned for suspicious activity, unrealistic claims, and fraud patterns.
                    Your safety is our priority.
                  </p>
                </div>
                <Badge variant="destructive">LIVE</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* NEW: Seller & Franchisor Tools */}
      <section className="py-16 bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 dark:from-green-950/20 dark:via-teal-950/20 dark:to-emerald-950/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">
              <Flame className="h-3 w-3 mr-1" />
              For Sellers & Franchisors
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Qualify Buyers & Analyze Markets with AI
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Advanced tools to identify serious buyers and find the best locations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Buyer Qualifier */}
            <Card className="hover:shadow-2xl transition-all hover:-translate-y-1 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-3">
                  <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl">AI Buyer Qualifier</CardTitle>
                <CardDescription>
                  Score and prioritize buyer inquiries - identify hot leads instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Financial capacity scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Experience & seriousness analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Deal close probability
                  </li>
                </ul>
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() => user ? setShowBuyerQualifier(true) : navigate('/signin')}
                >
                  Qualify Buyers
                </Button>
              </CardContent>
            </Card>

            {/* Franchisee Matcher */}
            <Card className="hover:shadow-2xl transition-all hover:-translate-y-1 border-teal-200 dark:border-teal-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900 flex items-center justify-center mb-3">
                  <Target className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle className="text-xl">Franchisee Matcher</CardTitle>
                <CardDescription>
                  Find franchisees that perfectly match your brand requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Financial & experience fit scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Personality compatibility
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Success probability prediction
                  </li>
                </ul>
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => setShowFranchiseeMatcher(true)}
                >
                  Find Franchisees
                </Button>
              </CardContent>
            </Card>

            {/* Territory Analyzer */}
            <Card className="hover:shadow-2xl transition-all hover:-translate-y-1 border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-3">
                  <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-xl">Territory Analyzer</CardTitle>
                <CardDescription>
                  AI-powered location analysis for franchise expansion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Demographics & economics scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Competition & market analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    ROI & break-even projections
                  </li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowTerritoryAnalyzer(true)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Analyze Territory
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
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
            <h2 className="text-3xl font-bold mb-4">Smart Tools for Smart Decisions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get personalized recommendations and insights to help you find the right opportunity
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

      {/* Trust Badges & Partners */}
      <TrustBadgesSection />

      {/* Success Stories Carousel */}
      <SuccessStoriesCarousel />

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

      {/* AI Matchmaker Modal */}
      {showMatchmaker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AIBusinessMatchmaker onClose={() => setShowMatchmaker(false)} />
          </div>
        </div>
      )}

      {/* Due Diligence Dashboard Modal */}
      {showDueDiligence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <DueDiligenceDashboard
              businessData={{
                name: 'Sample Business',
                industry: 'Technology',
                price: 5000000,
                revenue: 10000000,
                profit: 2000000,
                employees: 25,
                established_year: 2018,
                location: 'Mumbai, Maharashtra',
              }}
              onClose={() => setShowDueDiligence(false)}
            />
          </div>
        </div>
      )}

      {/* Document Analyzer Modal */}
      {showDocAnalyzer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <DocumentAnalyzer onClose={() => setShowDocAnalyzer(false)} />
          </div>
        </div>
      )}

      {/* Buyer Qualifier Dashboard Modal */}
      {showBuyerQualifier && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <BuyerQualifierDashboard
              sellerId={user.id}
              onClose={() => setShowBuyerQualifier(false)}
            />
          </div>
        </div>
      )}

      {/* Franchisee Matcher Modal */}
      {showFranchiseeMatcher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <FranchiseeMatcher onClose={() => setShowFranchiseeMatcher(false)} />
          </div>
        </div>
      )}

      {/* Territory Analyzer Modal */}
      {showTerritoryAnalyzer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <TerritoryAnalyzer onClose={() => setShowTerritoryAnalyzer(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
