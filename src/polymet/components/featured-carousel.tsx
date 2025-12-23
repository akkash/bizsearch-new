import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessCard } from "@/polymet/components/business-card";
import { FranchiseCard } from "@/polymet/components/franchise-card";
import { BusinessService } from "@/lib/business-service";
import { FranchiseService } from "@/lib/franchise-service";

interface FeaturedCarouselProps {
  type: "business" | "franchise";
  title?: string;
  subtitle?: string;
  onViewAll?: () => void;
  onMoreLikeThis?: (id: string, type: "business" | "franchise") => void;
  className?: string;
}

export function FeaturedCarousel({
  type,
  title,
  subtitle,
  onViewAll,
  onMoreLikeThis,
  className,
}: FeaturedCarouselProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (type === "franchise") {
          const data = await FranchiseService.getFeaturedFranchises(8);
          setItems(data || []);
        } else {
          const data = await BusinessService.getFeaturedBusinesses(8);
          setItems(data || []);
        }
      } catch (error) {
        console.error("Error fetching featured items:", error);
        setItems([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [type]);

  const itemsPerView = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3;
  const maxIndex = Math.max(0, items.length - itemsPerView);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, maxIndex, items.length]);

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

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      goToNext();
    }
    if (touchStart - touchEnd < -75) {
      goToPrevious();
    }
  };

  const defaultTitles = {
    business: "Featured Businesses For Sale",
    franchise: "Featured Franchises",
  };

  const defaultSubtitles = {
    business: "Discover verified businesses ready for acquisition",
    franchise: "Explore profitable franchise opportunities",
  };

  if (loading) {
    return (
      <section className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading {type === "franchise" ? "franchises" : "businesses"}...</p>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2">{title || defaultTitles[type]}</h2>
          <p className="text-muted-foreground mb-8">{subtitle || defaultSubtitles[type]}</p>
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No featured {type === "franchise" ? "franchises" : "businesses"} available at the moment.</p>
            {onViewAll && (
              <Button onClick={onViewAll} className="mt-4">
                Browse All {type === "franchise" ? "Franchises" : "Businesses"}
              </Button>
            )}
          </div>
        </div>
      </section>
    );
  }

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
                  className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? "bg-primary" : "bg-muted"
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

        {/* Carousel */}
        <div className="relative">
          {/* Mobile: Touch-enabled Horizontal Scroll */}
          <div className="md:hidden">
            <div
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex-shrink-0 w-80 snap-start"
                >
                  {type === "franchise" ? (
                    <FranchiseCard
                      franchise={item}
                      onSave={(id) => console.log("Save franchise:", id)}
                      onShare={(id) => console.log("Share franchise:", id)}
                      onContact={() => navigate(`/franchise/${item.slug || item.id}?contact=true`)}
                      onViewDetails={() => navigate(`/franchise/${item.slug || item.id}`)}
                      onMoreLikeThis={(id) => onMoreLikeThis?.(id, "franchise")}
                    />
                  ) : (
                    <BusinessCard
                      business={item}
                      onSave={(id) => console.log("Save business:", id)}
                      onShare={(id) => console.log("Share business:", id)}
                      onContact={() => navigate(`/business/${item.slug || item.id}?contact=true`)}
                      onViewDetails={() => navigate(`/business/${item.slug || item.id}`)}
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
                  {type === "franchise" ? (
                    <FranchiseCard
                      franchise={item}
                      onSave={(id) => console.log("Save franchise:", id)}
                      onShare={(id) => console.log("Share franchise:", id)}
                      onContact={() => navigate(`/franchise/${item.slug || item.id}?contact=true`)}
                      onViewDetails={() => navigate(`/franchise/${item.slug || item.id}`)}
                      onMoreLikeThis={(id) => onMoreLikeThis?.(id, "franchise")}
                    />
                  ) : (
                    <BusinessCard
                      business={item}
                      onSave={(id) => console.log("Save business:", id)}
                      onShare={(id) => console.log("Share business:", id)}
                      onContact={() => navigate(`/business/${item.slug || item.id}?contact=true`)}
                      onViewDetails={() => navigate(`/business/${item.slug || item.id}`)}
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
              View All {type === "franchise" ? "Franchises" : "Businesses"}
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

        {/* Mobile Navigation Dots */}
        <div className="md:hidden flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.min(items.length, 5) }).map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${index === currentIndex % Math.min(items.length, 5)
                ? "bg-primary w-8"
                : "bg-muted w-2"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
