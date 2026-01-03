import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { BusinessService } from "@/lib/business-service";
import { useAuth } from "@/contexts/AuthContext";
import type { Business } from "@/types/listings";
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
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

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

  const financialData = business.financials || [
    {
      year: 2023,
      revenue: business.revenue ?? 0,
      profit: (business.revenue ?? 0) * 0.15,
      expenses: (business.revenue ?? 0) * 0.85,
    },
    {
      year: 2022,
      revenue: (business.revenue ?? 0) * 0.9,
      profit: (business.revenue ?? 0) * 0.9 * 0.12,
      expenses: (business.revenue ?? 0) * 0.9 * 0.88,
    },
    {
      year: 2021,
      revenue: (business.revenue ?? 0) * 0.8,
      profit: (business.revenue ?? 0) * 0.8 * 0.1,
      expenses: (business.revenue ?? 0) * 0.8 * 0.9,
    },
  ];

  const assets = [
    {
      type: "Equipment & Machinery",
      value: business.price * 0.4,
      description: "Manufacturing equipment, computers, furniture",
    },
    {
      type: "Inventory",
      value: business.price * 0.2,
      description: "Raw materials, finished goods, supplies",
    },
    {
      type: "Real Estate",
      value: business.price * 0.3,
      description: "Office space, warehouse, retail locations",
    },
    {
      type: "Intangible Assets",
      value: business.price * 0.1,
      description: "Brand value, patents, customer database",
    },
  ];

  const documents = [
    { name: "Financial Statements (3 years)", type: "PDF", protected: false },
    { name: "Tax Returns", type: "PDF", protected: true },
    { name: "Asset Inventory", type: "Excel", protected: false },
    { name: "Customer Contracts", type: "PDF", protected: true },
    { name: "Employee Records", type: "PDF", protected: true },
    { name: "Legal Documents", type: "PDF", protected: true },
  ];

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

  const handleSave = () => {
    setIsSaved(!isSaved);
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
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/businesses')}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Listings
              </Button>
              <Separator orientation="vertical" className="h-6" />

              <div>
                <h1 className="text-xl font-bold">{business.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {business.industry} • {business.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <HeartIcon
                  className={cn(
                    "h-4 w-4 mr-2",
                    isSaved && "fill-current text-red-500"
                  )}
                />

                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleContact}>
                <PhoneIcon className="h-4 w-4 mr-2" />
                Contact Seller
              </Button>
            </div>
          </div>
        </div>
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
