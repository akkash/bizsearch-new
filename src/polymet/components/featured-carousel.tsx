import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
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
    business: "Verified businesses ready for acquisition",
    franchise: "Franchise opportunities from active listings",
  };

  if (loading) {
    return (
      <section className={className}>
        <div className="container mx-auto px-4">
          <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-96 max-w-full bg-muted rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-border overflow-hidden">
                <div className="h-36 bg-muted animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 bg-muted rounded animate-pulse" />
                    <div className="h-10 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={className}>
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            {title || defaultTitles[type]}
          </h2>
          <p className="text-muted-foreground mb-6">
            {subtitle || defaultSubtitles[type]}
          </p>
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-foreground font-medium mb-1">
              No {type === "franchise" ? "franchises" : "businesses"} match all your filters.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Browse the full catalog or try a broader search.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {onViewAll && (
                <Button onClick={onViewAll} className="bg-growth-green hover:bg-growth-green/90 text-white">
                  Browse all {type === "franchise" ? "franchises" : "businesses"}
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate("/smart-search")}>
                Try smart search
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
              {title || defaultTitles[type]}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              {subtitle || defaultSubtitles[type]}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="hidden md:flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                disabled={items.length <= itemsPerView}
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                disabled={items.length <= itemsPerView}
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {onViewAll && (
              <Button variant="outline" onClick={onViewAll} className="hidden md:flex">
                View all
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

        {onViewAll && (
          <div className="flex justify-center mt-6 md:hidden">
            <Button variant="outline" onClick={onViewAll}>
              View all {type === "franchise" ? "franchises" : "businesses"}
              <Eye className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
