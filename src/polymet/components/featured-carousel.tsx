import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  Shield,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BusinessCard } from "@/polymet/components/business-card";
import { FranchiseCard } from "@/polymet/components/franchise-card";
import {
  getFeaturedBusinesses,
  getTrendingBusinesses,
} from "@/polymet/data/businesses-data";
import {
  getFeaturedFranchises,
  getTrendingFranchises,
} from "@/polymet/data/franchises-data";

interface FeaturedCarouselProps {
  type?: "business" | "franchise" | "mixed";
  title?: string;
  subtitle?: string;
  onViewAll?: () => void;
  onMoreLikeThis?: (id: string, type: "business" | "franchise") => void;
  className?: string;
}

export function FeaturedCarousel({
  type = "mixed",
  title,
  subtitle,
  onViewAll,
  onMoreLikeThis,
  className,
}: FeaturedCarouselProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Get data based on type
  const getCarouselData = () => {
    switch (type) {
      case "business":
        return [...getFeaturedBusinesses(), ...getTrendingBusinesses()].slice(
          0,
          8
        );
      case "franchise":
        return [...getFeaturedFranchises(), ...getTrendingFranchises()].slice(
          0,
          8
        );
      case "mixed":
      default:
        return [
          ...getFeaturedBusinesses().slice(0, 3),
          ...getFeaturedFranchises().slice(0, 3),
          ...getTrendingBusinesses().slice(0, 2),
        ];
    }
  };

  const items = getCarouselData();
  const itemsPerView = window.innerWidth < 768 ? 1 : 3; // 1 on mobile, 3 on desktop
  const maxIndex = Math.max(0, items.length - itemsPerView);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, maxIndex]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const defaultTitles = {
    business: "Featured Businesses",
    franchise: "Top Franchise Opportunities",
    mixed: "Featured Opportunities",
  };

  const defaultSubtitles = {
    business: "Discover verified businesses ready for acquisition",
    franchise: "Explore profitable franchise opportunities",
    mixed: "Handpicked businesses and franchises for you",
  };

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {title || defaultTitles[type]}
            </h2>
            <p className="text-muted-foreground">
              {subtitle || defaultSubtitles[type]}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {/* Navigation Dots - Desktop Only */}
            <div className="hidden md:flex gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons - Desktop Only */}
            <div className="hidden md:flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                disabled={items.length <= itemsPerView}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                disabled={items.length <= itemsPerView}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {onViewAll && (
              <Button onClick={onViewAll} className="hidden md:flex">
                View All
                <Eye className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Carousel - Mobile-First Design */}
        <div className="relative">
          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden">
            <div
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitScrollbar: { display: "none" },
              }}
            >
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex-shrink-0 w-80 snap-start"
                >
                  {"brandName" in item ? (
                    <FranchiseCard
                      franchise={item}
                      onSave={(id) => console.log("Save franchise:", id)}
                      onShare={(id) => console.log("Share franchise:", id)}
                      onContact={(id) => console.log("Contact franchise:", id)}
                      onViewDetails={(id) => navigate(`/franchise/${id}`)}
                      onMoreLikeThis={(id) => onMoreLikeThis?.(id, "franchise")}
                    />
                  ) : (
                    <BusinessCard
                      business={item}
                      onSave={(id) => console.log("Save business:", id)}
                      onShare={(id) => console.log("Share business:", id)}
                      onContact={(id) => console.log("Contact business:", id)}
                      onViewDetails={(id) => navigate(`/business/${id}`)}
                      onMoreLikeThis={(id) => onMoreLikeThis?.(id, "business")}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Carousel with Navigation */}
          <div className="hidden md:block overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                width: `${(items.length / itemsPerView) * 100}%`,
              }}
            >
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / items.length}%` }}
                >
                  {"brandName" in item ? (
                    <FranchiseCard
                      franchise={item}
                      onSave={(id) => console.log("Save franchise:", id)}
                      onShare={(id) => console.log("Share franchise:", id)}
                      onContact={(id) => console.log("Contact franchise:", id)}
                      onViewDetails={(id) => navigate(`/franchise/${id}`)}
                      onMoreLikeThis={(id) => onMoreLikeThis?.(id, "franchise")}
                    />
                  ) : (
                    <BusinessCard
                      business={item}
                      onSave={(id) => console.log("Save business:", id)}
                      onShare={(id) => console.log("Share business:", id)}
                      onContact={(id) => console.log("Contact business:", id)}
                      onViewDetails={(id) => navigate(`/business/${id}`)}
                      onMoreLikeThis={(id) => onMoreLikeThis?.(id, "business")}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View All Button */}
        {onViewAll && (
          <div className="flex justify-center mt-8 md:hidden">
            <Button onClick={onViewAll}>
              View All Opportunities
              <Eye className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Auto-play Control - Desktop Only */}
        <div className="hidden md:flex justify-center mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isAutoPlaying ? "Pause" : "Play"} Auto-scroll
          </Button>
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="md:hidden flex justify-center mt-4">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span>👈</span> Swipe to see more opportunities <span>👉</span>
          </p>
        </div>
      </div>
    </section>
  );
}
