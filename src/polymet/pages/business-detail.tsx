import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { BusinessService } from "@/lib/business-service";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import type { Business } from "@/types/listings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  TrendingUpIcon,
  IndianRupeeIcon,
  FileTextIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  DownloadIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIInsights } from "@/polymet/components/ai-insights";
import { InquiryDialog } from "@/components/inquiry-dialog";

import { BusinessBentoView } from "@/components/business-bento-view";
interface BusinessDetailProps {
  className?: string;
}

export function BusinessDetail({ className }: BusinessDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isListingSaved, toggleSave } = useSavedListings();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const isSaved = business ? isListingSaved('business', business.id) : false;

  // Fetch business from Supabase (supports both UUID and slug)
  useEffect(() => {
    const fetchBusiness = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const result = await BusinessService.getBusinessByIdOrSlug(id);
        if (result && !Array.isArray(result)) {
          setBusiness(result as Business);
        }
      } catch (error) {
        console.error('Error fetching business:', error);
      }
      setLoading(false);
    };
    fetchBusiness();
  }, [id]);

  // Auto-open contact dialog when ?contact=true is in URL
  useEffect(() => {
    if (searchParams.get('contact') === 'true' && !loading && business) {
      setShowContactForm(true);
    }
  }, [searchParams, loading, business]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Business Not Found</h2>
          <p className="text-muted-foreground">The business you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  const images =
    business.images && business.images.length > 0
      ? business.images
      : [
        business.logo ||
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop",
      ];

  const handleSave = async () => {
    if (!business) return;
    if (!user) {
      toast.info('Sign in to save businesses');
      navigate('/login');
      return;
    }
    const wasSaved = isSaved;
    await toggleSave('business', business.id);
    toast.success(wasSaved ? 'Removed from saved list' : 'Business saved');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: business.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleContact = () => {
    setShowContactForm(true);
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/businesses')}
                className="shrink-0"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="min-w-0 hidden sm:block">
                <h1 className="text-base font-semibold truncate">{business.name}</h1>
                <p className="text-xs text-muted-foreground truncate">
                  {business.industry} · {business.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleSave} className="hidden sm:inline-flex">
                <HeartIcon
                  className={cn(
                    "h-4 w-4 mr-2",
                    isSaved && "fill-current text-red-500"
                  )}
                />
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="hidden md:inline-flex">
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                size="sm"
                onClick={handleContact}
                className="bg-growth-green hover:bg-growth-green/90 text-white"
              >
                <PhoneIcon className="h-4 w-4 mr-2" />
                Contact Seller
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-20 p-3 md:hidden border-t border-border bg-background/95 backdrop-blur-md">
        <Button
          className="w-full bg-growth-green hover:bg-growth-green/90 text-white"
          onClick={handleContact}
        >
          Contact Seller
        </Button>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Business Detail - Bento View */}
        <BusinessBentoView business={business} />
      </div>

      {/* Contact Form Dialog - Production Ready */}
      <InquiryDialog
        open={showContactForm}
        onOpenChange={setShowContactForm}
        listingId={business.id}
        listingType="business"
        listingName={business.name}
        ownerId={business.seller_id || business.owner_id || ''}
        askingPrice={business.price}
      />
    </div>
  );
}
