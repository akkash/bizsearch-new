import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { FranchiseService } from "@/lib/franchise-service";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedListings } from "@/contexts/SavedListingsContext";
import { useFranchiseCompare } from "@/hooks/use-franchise-compare";
import type { Franchise } from "@/types/listings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  FileTextIcon,
  GitCompareArrows,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InquiryDialog } from "@/components/inquiry-dialog";
import { FranchiseBentoView } from "@/components/franchise-bento-view";
import { ComparisonFeature } from "@/polymet/components/comparison-feature";

interface FranchiseDetailProps {
  className?: string;
}

export function FranchiseDetail({ className }: FranchiseDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isListingSaved, toggleSave } = useSavedListings();
  const { compareIds, toggleCompare, removeCompare, isCompared, maxCompare } = useFranchiseCompare();
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showComparePanel, setShowComparePanel] = useState(false);
  const [compareFranchises, setCompareFranchises] = useState<Franchise[]>([]);

  useEffect(() => {
    const fetchFranchise = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const result = await FranchiseService.getPublicFranchiseByIdOrSlug(id, user?.id);
        if (result) {
          setFranchise(result);
          FranchiseService.incrementViews(result.id).catch(console.error);
        } else {
          setFranchise(null);
        }
      } catch (error) {
        console.error("Error fetching franchise:", error);
        setFranchise(null);
      }
      setLoading(false);
    };
    fetchFranchise();
  }, [id, user?.id]);

  useEffect(() => {
    if (searchParams.get("contact") === "true" && !loading && franchise) {
      setShowContactForm(true);
    }
  }, [searchParams, loading, franchise]);

  useEffect(() => {
    const loadCompareFranchises = async () => {
      if (compareIds.length === 0) {
        setCompareFranchises([]);
        return;
      }
      try {
        const loaded = await Promise.all(
          compareIds.map(async (compareId) => {
            try {
              return await FranchiseService.getPublicFranchiseByIdOrSlug(compareId);
            } catch {
              return null;
            }
          })
        );
        setCompareFranchises(loaded.filter(Boolean) as Franchise[]);
      } catch (error) {
        console.error("Error loading compare franchises:", error);
      }
    };
    loadCompareFranchises();
  }, [compareIds]);

  const brandName = franchise?.brandName || franchise?.brand_name || "Franchise";
  const logo = franchise?.logo || franchise?.logo_url;
  const identifier = franchise?.slug || franchise?.id || id;
  const isSaved = franchise ? isListingSaved("franchise", franchise.id) : false;
  const compared = franchise ? isCompared(franchise.id) : false;

  const handleSave = async () => {
    if (!franchise) return;
    if (!user) {
      toast.info("Sign in to save franchises");
      navigate("/login");
      return;
    }
    await toggleSave("franchise", franchise.id);
    toast.success(isSaved ? "Removed from saved list" : "Franchise saved");
  };

  const handleCompare = () => {
    if (!franchise) return;
    if (compared) {
      removeCompare(franchise.id);
      toast.success("Removed from comparison");
      return;
    }
    const added = toggleCompare(franchise.id);
    if (!added) {
      toast.error(`You can compare up to ${maxCompare} franchises at a time`);
      return;
    }
    toast.success("Added to comparison");
  };

  const handleShare = async () => {
    if (!franchise) return;
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: brandName,
        text: franchise.description,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const handleApply = () => {
    if (!franchise) return;
    if (!user) {
      toast.info("Sign in to apply for this franchise");
      navigate(`/login?redirect=/franchise/${identifier}/apply`);
      return;
    }
    navigate(`/franchise/${identifier}/apply`);
  };

  const compareItems = [
    ...(franchise && compared ? [{ id: franchise.id, type: "franchise" as const, data: franchise }] : []),
    ...compareFranchises
      .filter((f) => f.id !== franchise?.id)
      .map((f) => ({ id: f.id, type: "franchise" as const, data: f })),
  ].slice(0, maxCompare);

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
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Franchise Not Found</h2>
          <p className="text-muted-foreground">
            This franchise may be unavailable or no longer published.
          </p>
          <Button onClick={() => navigate("/franchises")}>Browse Franchises</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="bg-white dark:bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => navigate("/franchises")}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="flex items-center gap-3 min-w-0">
                {logo ? (
                  <img src={logo} alt={brandName} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {brandName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold truncate">{brandName}</h1>
                  <p className="text-sm text-muted-foreground truncate">
                    {franchise.industry}
                    {franchise.establishedYear || franchise.established_year
                      ? ` • Est. ${franchise.establishedYear || franchise.established_year}`
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/franchise/${identifier}/locations`)}
              >
                <MapPinIcon className="h-4 w-4 mr-2" />
                Locations
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <HeartIcon className={cn("h-4 w-4 mr-2", isSaved && "fill-current text-red-500")} />
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompare}
                className={cn(compared && "border-growth-green text-growth-green")}
              >
                <GitCompareArrows className="h-4 w-4 mr-2" />
                {compared ? "In Compare" : "Compare"}
              </Button>
              {compareIds.length > 0 && (
                <Button size="sm" variant="secondary" onClick={() => setShowComparePanel(true)}>
                  View Compare ({compareIds.length})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleShare}>
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowContactForm(true)}>
                Request Information
              </Button>
              <Button size="sm" className="bg-growth-green hover:bg-growth-green/90" onClick={handleApply}>
                <FileTextIcon className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <FranchiseBentoView franchise={franchise} />

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center pb-8">
          <Button
            size="lg"
            className="bg-growth-green hover:bg-growth-green/90"
            onClick={() => setShowContactForm(true)}
          >
            Request Franchise Information
          </Button>
          <Button size="lg" variant="outline" onClick={handleApply}>
            Start Application
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <Link to="/franchises">Browse More Franchises</Link>
          </Button>
        </div>
      </div>

      <InquiryDialog
        open={showContactForm}
        onOpenChange={setShowContactForm}
        listingId={franchise.id}
        listingType="franchise"
        listingName={brandName}
        ownerId={franchise.franchisorId || franchise.franchisor_id || franchise.owner_id || ""}
        askingPrice={franchise.investmentMin || franchise.total_investment_min}
      />

      {showComparePanel && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="container mx-auto max-w-6xl py-8">
            <ComparisonFeature
              items={compareItems}
              onRemoveItem={(itemId) => {
                removeCompare(itemId);
                if (itemId === franchise.id) {
                  setShowComparePanel(false);
                }
              }}
              onAddMore={() => {
                setShowComparePanel(false);
                navigate("/franchises");
              }}
              className="bg-background"
            />
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowComparePanel(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
