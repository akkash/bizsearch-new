import { useState, useEffect } from "react";
import {
  ArrowRight,
  Shield,
  Users,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Building2,
  Store,
  Coffee,
  HeartPulse,
  GraduationCap,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/polymet/components/search-bar";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onSearch?: (
    query: string,
    type: "business" | "franchise",
    filters: any
  ) => void;
  className?: string;
}

export function HeroSection({ onSearch, className }: HeroSectionProps) {
  const [currentSearchType, setCurrentSearchType] = useState<
    "business" | "franchise"
  >("business");
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  // Animate through stats
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (
    query: string,
    type: "business" | "franchise",
    filters: any
  ) => {
    setCurrentSearchType(type);
    if (onSearch) {
      onSearch(query, type, filters);
    }
  };

  // Live stats with trust signals
  const stats = [
    { label: "Active Buyers", value: "8,400+", icon: Users, color: "text-blue-400" },
    { label: "Live Listings", value: "3,850+", icon: Building2, color: "text-emerald-400" },
    { label: "Verified Sellers", value: "2,100+", icon: CheckCircle2, color: "text-green-400" },
    { label: "Deals Completed", value: "₹850Cr+", icon: TrendingUp, color: "text-amber-400" },
  ];

  // Quick filter chips for common searches
  const quickFilters = [
    { label: "Restaurants", icon: Coffee, href: "/businesses?category=restaurants" },
    { label: "Retail Shops", icon: Store, href: "/businesses?category=retail-shops" },
    { label: "Healthcare", icon: HeartPulse, href: "/businesses?category=healthcare" },
    { label: "Education", icon: GraduationCap, href: "/businesses?category=education" },
    { label: "Manufacturing", icon: Wrench, href: "/businesses?category=manufacturing" },
  ];

  return (
    <section className={cn("relative overflow-hidden", className)}>
      {/* Dynamic Background with Abstract Data Visualization */}
      <div className="absolute inset-0 bg-gradient-to-br from-trust-blue via-[hsl(213,55%,18%)] to-[hsl(213,60%,12%)] dark:from-[hsl(213,40%,8%)] dark:via-[hsl(213,45%,6%)] dark:to-[hsl(213,50%,4%)]">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-growth-green/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Trust Badge */}
          <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm px-4 py-1.5">
            <Shield className="h-3.5 w-3.5 mr-2" />
            India's Most Trusted Business Marketplace
            <Sparkles className="h-3.5 w-3.5 ml-2 text-amber-400" />
          </Badge>

          {/* Benefit-Driven Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Find Your Perfect
            <span className="block mt-2 bg-gradient-to-r from-growth-green via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Business Opportunity
            </span>
          </h1>

          {/* Value Proposition Subheading */}
          <p className="text-lg md:text-xl lg:text-2xl text-blue-100/90 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Explore franchise opportunities. Browse verified businesses for sale.
            <span className="block mt-2 text-growth-green font-medium">Connect directly with serious buyers and sellers.</span>
          </p>

          {/* Unified Search Bar */}
          <div className="mb-8 relative z-20 max-w-4xl mx-auto">
            <SearchBar
              onSearch={handleSearchSubmit}
              onSearchTypeChange={setCurrentSearchType}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/20 border border-white/10"
            />
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <span className="text-blue-200/70 text-sm mr-2 self-center">Popular:</span>
            {quickFilters.map((filter) => (
              <Link
                key={filter.label}
                to={filter.href}
                className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-sm font-medium transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/10"
              >
                <filter.icon className="h-4 w-4 text-growth-green group-hover:scale-110 transition-transform" />
                {filter.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/franchises">
              <Button
                size="lg"
                className="bg-growth-green hover:bg-growth-green/90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-growth-green/25 w-full sm:w-auto transition-all hover:scale-105"
              >
                Explore Franchises
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/businesses">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/50 text-white bg-transparent hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl w-full sm:w-auto backdrop-blur-sm transition-all hover:scale-105"
              >
                Browse Businesses
              </Button>
            </Link>
          </div>

          {/* Live Stats - Trust Signals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const isActive = index === activeStatIndex;
              return (
                <div
                  key={index}
                  className={cn(
                    "text-center p-4 rounded-2xl transition-all duration-500",
                    isActive ? "bg-white/10 scale-105" : "bg-transparent"
                  )}
                >
                  <div className="flex justify-center mb-3">
                    <div className={cn(
                      "p-3 rounded-xl backdrop-blur-sm transition-all",
                      isActive ? "bg-white/20" : "bg-white/10"
                    )}>
                      <Icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1 font-mono">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-blue-200/80 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Smooth Wave Transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-16 md:h-24"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            className="fill-background"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            className="fill-background"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
