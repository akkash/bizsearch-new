import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { FranchiseService } from "@/lib/franchise-service";
import { useAuth } from "@/contexts/AuthContext";
import type { Franchise } from "@/types/listings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
  BuildingIcon,
  StarIcon,
  ShieldCheckIcon,
  DownloadIcon,
  PlayCircleIcon,
  CheckCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIInsights } from "@/polymet/components/ai-insights";
import { InquiryDialog } from "@/components/inquiry-dialog";

import { FranchiseBentoView } from "@/components/franchise-bento-view";
interface FranchiseDetailProps {
  className?: string;
}

export function FranchiseDetail({ className }: FranchiseDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

  // Fetch franchise from Supabase (supports both UUID and slug)
  useEffect(() => {
    const fetchFranchise = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const result = await FranchiseService.getFranchiseByIdOrSlug(id);
        if (result && !Array.isArray(result)) {
          setFranchise(result as Franchise);
        }
      } catch (error) {
        console.error('Error fetching franchise:', error);
      }
      setLoading(false);
    };
    fetchFranchise();
  }, [id]);

  // Auto-open contact dialog when ?contact=true is in URL
  useEffect(() => {
    if (searchParams.get('contact') === 'true' && !loading && franchise) {
      setShowContactForm(true);
    }
  }, [searchParams, loading, franchise]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading franchise details...</p>
        </div>
      </div>
    );
  }

  if (!franchise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Franchise Not Found</h2>
          <p className="text-muted-foreground">The franchise you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  const totalInvestment =
    franchise.investmentMax || franchise.investmentMin || 2000000;
  const investmentBreakdown = [
    { item: "Franchise Fee", amount: franchise.franchiseFee, percentage: 25 },
    {
      item: "Equipment & Setup",
      amount: totalInvestment * 0.4,
      percentage: 40,
    },
    {
      item: "Interior & Branding",
      amount: totalInvestment * 0.2,
      percentage: 20,
    },
    {
      item: "Working Capital",
      amount: totalInvestment * 0.15,
      percentage: 15,
    },
  ];

  const roiProjections = franchise.roiProjections || [
    {
      year: "Year 1",
      revenue: totalInvestment * 0.8,
      profit: totalInvestment * 0.1,
      roi: "10%",
    },
    {
      year: "Year 2",
      revenue: totalInvestment * 1.2,
      profit: totalInvestment * 0.18,
      roi: "18%",
    },
    {
      year: "Year 3",
      revenue: totalInvestment * 1.5,
      profit: totalInvestment * 0.25,
      roi: "25%",
    },
    {
      year: "Year 4",
      revenue: totalInvestment * 1.8,
      profit: totalInvestment * 0.32,
      roi: "32%",
    },
    {
      year: "Year 5",
      revenue: totalInvestment * 2.1,
      profit: totalInvestment * 0.38,
      roi: "38%",
    },
  ];

  const supportServices = [
    { service: "Initial Training", duration: "4-6 weeks", included: true },
    { service: "Site Selection", duration: "2-3 weeks", included: true },
    { service: "Store Setup", duration: "3-4 weeks", included: true },
    { service: "Marketing Launch", duration: "2 weeks", included: true },
    { service: "Ongoing Support", duration: "Continuous", included: true },
    { service: "Staff Training", duration: "1-2 weeks", included: true },
  ];

  const territoryInfo = [
    {
      city: "Mumbai",
      status: "Available",
      population: "12.4M",
      competition: "Medium",
    },
    {
      city: "Delhi",
      status: "Limited",
      population: "11.0M",
      competition: "High",
    },
    {
      city: "Bangalore",
      status: "Available",
      population: "8.4M",
      competition: "Low",
    },
    {
      city: "Chennai",
      status: "Available",
      population: "7.0M",
      competition: "Medium",
    },
    {
      city: "Kolkata",
      status: "Taken",
      population: "4.5M",
      competition: "Low",
    },
  ];

  const images = [
    franchise.logo,
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop",
  ];

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: franchise.brandName,
        text: franchise.description,
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
                onClick={() => navigate('/franchises')}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Franchises
              </Button>
              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-3">
                <img
                  src={franchise.logo}
                  alt={franchise.brandName}
                  className="w-12 h-12 rounded-lg object-cover"
                />

                <div>
                  <h1 className="text-2xl font-bold">{franchise.brandName}</h1>
                  <p className="text-sm text-muted-foreground">
                    {franchise.industry} • Est. {(franchise as any).established || (franchise as any).establishedYear || '2015'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/franchise/${franchise.slug || id}/locations`)}
              >
                <MapPinIcon className="h-4 w-4 mr-2" />
                View Locations
              </Button>
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
                Get Franchise Details
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Franchise Detail - Bento View */}
        <FranchiseBentoView franchise={franchise} />
      </div>

      {/* Contact Form Dialog - Production Ready */}
      <InquiryDialog
        open={showContactForm}
        onOpenChange={setShowContactForm}
        listingId={franchise.id}
        listingType="franchise"
        listingName={franchise.brandName || 'Franchise Opportunity'}
        ownerId={(franchise as any).franchisor_id || (franchise as any).owner_id || ''}
        askingPrice={franchise.investmentMin}
      />
    </div>
  );
}
