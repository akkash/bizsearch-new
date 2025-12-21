import React, { useState } from "react";
import {
  ArrowRight,
  Play,
  Shield,
  Users,
  TrendingUp,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/polymet/components/search-bar";
import { Link } from "react-router-dom";

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
  const handleBrowseBusinesses = () => {
    // This will be handled by Link component instead
    console.log("Browse businesses clicked");
  };

  const handleWatchDemo = () => {
    // In a real app, this would open a demo video modal
    alert("Demo video feature - would show platform demo video");
  };

  const handleSearchSubmit = (
    query: string,
    type: "business" | "franchise",
    filters: any
  ) => {
    setCurrentSearchType(type);
    if (onSearch) {
      onSearch(query, type, filters);
    } else {
      // Search functionality will be handled by the search component
      // Navigation will be handled by Link components
      console.log("Search submitted:", { query, type, filters });
    }
  };

  const stats = [
    { label: "Active Buyers", value: "8,400+", icon: Users, emoji: "👥" },
    { label: "Live Listings", value: "3,850+", icon: TrendingUp, emoji: "🏢" },
    { label: "Verified Sellers", value: "2,100+", icon: Star, emoji: "✓" },
    { label: "Deals Completed", value: "1,290+", icon: Shield, emoji: "💼" },
  ];

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
            }}
          ></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
            <Shield className="h-3 w-3 mr-1" />
            India's #1 Business Marketplace
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Business Opportunity
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Browse verified businesses for sale. Explore franchise opportunities.
            Connect directly with serious buyers and sellers.
          </p>

          {/* Search Bar */}
          <div className="mb-12 relative z-20">
            <SearchBar
              onSearch={handleSearchSubmit}
              onSearchTypeChange={setCurrentSearchType}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl"
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/businesses">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 w-full sm:w-auto"
              >
                Browse Businesses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/add-business-listing">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-3 w-full sm:w-auto"
              >
                <Play className="mr-2 h-5 w-5" />
                List Your Business
              </Button>
            </Link>
          </div>

          {/* Stats - Mobile Optimized */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                    <div className="text-2xl">{stat.emoji}</div>
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-blue-200 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-12 md:h-20"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            className="fill-background"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            className="fill-background"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            className="fill-background"
          ></path>
        </svg>
      </div>
    </section>
  );
}
