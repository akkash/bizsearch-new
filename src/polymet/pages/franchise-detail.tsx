import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  FileTextIcon,
  GitCompareArrows,
  Download,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InquiryDialog } from "@/components/inquiry-dialog";
import { FranchiseBentoView } from "@/components/franchise-bento-view";
import { ComparisonFeature } from "@/polymet/components/comparison-feature";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  findStoreFormat,
  getFranchiseInvestmentRange,
  getStoreFormatsFromFranchise,
} from "@/lib/store-formats";

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
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFranchise = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const result = await FranchiseService.getPublicFranchiseByIdOrSlug(id, user?.id);
        if (result) {
          setFranchise(result);
          const formats = getStoreFormatsFromFranchise(result);
          setSelectedFormatId(formats[0]?.id ?? null);
          FranchiseService.incrementViews(result.id).catch(console.error);
        } else {
          setFranchise(null);
          setSelectedFormatId(null);
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

  const handleEnquire = () => {
    if (!franchise) return;
    if (!user) {
      toast.info("Sign in to enquire about this franchise");
      navigate(`/login?redirect=/franchise/${identifier}?contact=true`);
      return;
    }
    setShowContactForm(true);
  };

  const handleApply = () => {
    if (!franchise) return;
    if (!user) {
      toast.info("Sign in to apply for this franchise");
      navigate(`/login?redirect=/franchise/${identifier}/apply`);
      return;
    }
    const params = new URLSearchParams();
    if (selectedFormatId) params.set('formatId', selectedFormatId);
    const qs = params.toString();
    navigate(`/franchise/${identifier}/apply${qs ? `?${qs}` : ''}`);
  };

  const handlePitchDeck = () => {
    if (!franchise) return;
    const docs = Array.isArray(franchise.documents) ? franchise.documents : [];
    const url = docs
      .map((doc) => (typeof doc === "string" ? doc : (doc as { url?: string })?.url))
      .find((item) => typeof item === "string" && item.length > 0);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    toast.info("Pitch deck not provided on this listing");
    setShowContactForm(true);
  };

  const formats = franchise ? getStoreFormatsFromFranchise(franchise) : [];
  const selectedFormat = findStoreFormat(formats, selectedFormatId);
  const investRange = franchise
    ? getFranchiseInvestmentRange(franchise)
    : { min: null, max: null };
  const enquireAskingPrice =
    selectedFormat?.investmentMin ??
    investRange.min ??
    franchise?.investmentMin ??
    franchise?.total_investment_min;

  const compareItems = [
    ...(franchise && compared ? [{ id: franchise.id, type: "franchise" as const, data: franchise }] : []),
    ...compareFranchises
      .filter((f) => f.id !== franchise?.id)
      .map((f) => ({ id: f.id, type: "franchise" as const, data: f })),
  ].slice(0, maxCompare);

  if (loading) {
    return (
      <div className="min-h-[50vh] bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading franchise details...</p>
        </div>
      </div>
    );
  }

  if (!franchise) {
    return (
      <div className="min-h-[50vh] bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight">
            No details found in the table.
          </h2>
          <p className="text-muted-foreground">
            This franchise may be unpublished or the link is incorrect.
          </p>
          <Button onClick={() => navigate("/franchises")}>Browse Franchises</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-background overflow-x-hidden", className)}>
      <div className="bg-background/95 backdrop-blur-md border-b border-border sticky top-16 md:top-20 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => navigate("/franchises")}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="flex items-center gap-3 min-w-0">
                {logo ? (
                  <img src={logo} alt={`${brandName} logo`} className="w-12 h-12 object-contain rounded-lg border border-border bg-white dark:bg-card p-1" />
                ) : (
                  <div className="w-12 h-12 rounded-lg border border-border listing-hero-pattern flex items-center justify-center">
                    <FileTextIcon className="h-5 w-5 text-growth-green" />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight truncate">{brandName}</h1>
                  <p className="text-sm text-muted-foreground truncate">
                    {franchise.industry}
                    {franchise.establishedYear || franchise.established_year
                      ? ` • Est. ${franchise.establishedYear || franchise.established_year}`
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            <TooltipProvider delayDuration={200}>
              <div className="flex flex-wrap items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleSave} aria-label={isSaved ? "Saved" : "Save"}>
                      <HeartIcon className={cn("h-4 w-4", isSaved && "fill-current text-red-500")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isSaved ? "Saved" : "Save"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn("h-9 w-9", compared && "border-growth-green text-growth-green")}
                      onClick={handleCompare}
                      aria-label={compared ? "In compare" : "Compare"}
                    >
                      <GitCompareArrows className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{compared ? "In compare" : "Compare"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleShare} aria-label="Share">
                      <ShareIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>
                {compareIds.length > 0 && (
                  <Button size="sm" variant="secondary" onClick={() => setShowComparePanel(true)}>
                    Compare ({compareIds.length})
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handlePitchDeck}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Pitch Deck
                </Button>
                <Button variant="outline" size="sm" onClick={handleEnquire}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enquire
                </Button>
                <Button size="sm" onClick={handleApply}>
                  Apply for Franchise
                </Button>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-20 p-3 md:hidden border-t border-border bg-background/95">
        <div className="flex gap-2">
          <Button className="flex-1" variant="outline" onClick={handleEnquire}>
            Enquire
          </Button>
          <Button className="flex-1" variant="secondary" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <FranchiseBentoView
          franchise={franchise}
          selectedFormatId={selectedFormatId}
          onFormatChange={setSelectedFormatId}
        />
      </div>

      <InquiryDialog
        open={showContactForm}
        onOpenChange={setShowContactForm}
        listingId={franchise.id}
        listingType="franchise"
        listingName={brandName}
        ownerId={franchise.franchisorId || franchise.franchisor_id || franchise.owner_id || ""}
        askingPrice={enquireAskingPrice ?? undefined}
        storeFormats={formats}
        initialFormatId={selectedFormatId}
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
