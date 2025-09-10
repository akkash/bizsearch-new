import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Save,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Upload,
  Eye,
} from "lucide-react";
import { ListingWizard } from "@/polymet/components/listing-wizard";
import { type BusinessListingFormValues } from "@/polymet/data/listing-data";

interface Draft {
  id: string;
  data: Partial<BusinessListingFormValues>;
  lastSaved: string;
  completionPercentage: number;
  status: "draft" | "submitted" | "published";
}

export function AddBusinessListingPage() {
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<Draft[]>([]);
  const [showDraftSelector, setShowDraftSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Load drafts from localStorage on component mount
  useEffect(() => {
    const loadDrafts = () => {
      try {
        const draftsJson = localStorage.getItem("bizsearch_listing_drafts");
        if (draftsJson) {
          const drafts = JSON.parse(draftsJson);
          setSavedDrafts(drafts);

          // Auto-load the most recent draft
          if (drafts.length > 0) {
            const mostRecent = drafts.sort(
              (a: Draft, b: Draft) =>
                new Date(b.lastSaved).getTime() -
                new Date(a.lastSaved).getTime()
            )[0];
            setCurrentDraft(mostRecent);
          }
        }
      } catch (error) {
        console.error("Error loading drafts:", error);
      }
    };

    loadDrafts();
  }, []);

  const calculateCompletionPercentage = (
    data: Partial<BusinessListingFormValues>
  ): number => {
    const sections = [
      "overview",
      "description",
      "financials",
      "assets",
      "media",
      "contact",
      "publish",
    ];

    const requiredSections = [
      "overview",
      "description",
      "financials",
      "media",
      "contact",
    ];

    let completedSections = 0;

    sections.forEach((section) => {
      const sectionData = data[section as keyof BusinessListingFormValues];
      if (sectionData && Object.keys(sectionData).length > 0) {
        completedSections++;
      }
    });

    return Math.round((completedSections / sections.length) * 100);
  };

  const saveDraft = (
    data: Partial<BusinessListingFormValues>,
    isDraft: boolean = true
  ) => {
    const draftId = currentDraft?.id || `draft_${Date.now()}`;
    const completionPercentage = calculateCompletionPercentage(data);

    const draft: Draft = {
      id: draftId,
      data,
      lastSaved: new Date().toISOString(),
      completionPercentage,
      status: isDraft ? "draft" : "submitted",
    };

    // Update current draft
    setCurrentDraft(draft);

    // Update saved drafts
    const updatedDrafts = savedDrafts.filter((d) => d.id !== draftId);
    updatedDrafts.push(draft);
    setSavedDrafts(updatedDrafts);

    // Save to localStorage
    try {
      localStorage.setItem(
        "bizsearch_listing_drafts",
        JSON.stringify(updatedDrafts)
      );
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const deleteDraft = (draftId: string) => {
    const updatedDrafts = savedDrafts.filter((d) => d.id !== draftId);
    setSavedDrafts(updatedDrafts);

    if (currentDraft?.id === draftId) {
      setCurrentDraft(null);
    }

    try {
      localStorage.setItem(
        "bizsearch_listing_drafts",
        JSON.stringify(updatedDrafts)
      );
    } catch (error) {
      console.error("Error deleting draft:", error);
    }
  };

  const loadDraft = (draft: Draft) => {
    setCurrentDraft(draft);
    setShowDraftSelector(false);
  };

  const handleSubmit = async (data: BusinessListingFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock API response
      const response = {
        listingId: `listing_${Date.now()}`,
        status: "submitted" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update draft status
      if (currentDraft) {
        const updatedDraft = {
          ...currentDraft,
          status: "submitted" as const,
          data,
        };
        setCurrentDraft(updatedDraft);

        const updatedDrafts = savedDrafts.map((d) =>
          d.id === currentDraft.id ? updatedDraft : d
        );
        setSavedDrafts(updatedDrafts);
        localStorage.setItem(
          "bizsearch_listing_drafts",
          JSON.stringify(updatedDrafts)
        );
      }

      setSubmitStatus({
        type: "success",
        message: `Listing submitted successfully! ID: ${response.listingId}`,
      });
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus({
        type: "error",
        message: "Failed to submit listing. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = (data: Partial<BusinessListingFormValues>) => {
    // In a real app, this would open a preview modal or navigate to preview page
    console.log("Preview data:", data);
    alert("Preview functionality - would show listing preview");
  };

  const createNewListing = () => {
    setCurrentDraft(null);
    setShowDraftSelector(false);
    setSubmitStatus({ type: null, message: "" });
  };

  if (showDraftSelector && savedDrafts.length > 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Choose a Draft</h1>
          <p className="text-muted-foreground">
            You have {savedDrafts.length} saved draft
            {savedDrafts.length !== 1 ? "s" : ""}. Choose one to continue or
            start a new listing.
          </p>
        </div>

        <div className="grid gap-4 mb-6">
          {savedDrafts.map((draft) => (
            <Card
              key={draft.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">
                        {draft.data.overview?.businessName ||
                          "Untitled Listing"}
                      </h3>
                      <Badge
                        variant={
                          draft.status === "published"
                            ? "default"
                            : draft.status === "submitted"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {draft.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />

                        {new Date(draft.lastSaved).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {draft.completionPercentage}% complete
                      </span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${draft.completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadDraft(draft)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Continue
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDraft(draft.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={createNewListing} variant="outline">
            Start New Listing
          </Button>
          <Button onClick={() => setShowDraftSelector(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Sell Your Business</h1>
            <p className="text-muted-foreground">
              Create a comprehensive listing to sell your business to qualified
              buyers
            </p>
          </div>

          <div className="flex gap-2">
            {savedDrafts.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowDraftSelector(true)}
              >
                <Save className="w-4 h-4 mr-2" />
                Saved Drafts ({savedDrafts.length})
              </Button>
            )}

            {currentDraft && (
              <Button variant="outline" onClick={createNewListing}>
                Start New
              </Button>
            )}
          </div>
        </div>

        {/* Current Draft Status */}
        {currentDraft && (
          <Alert className="mb-4">
            <Save className="w-4 h-4" />

            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  Draft saved • {currentDraft.completionPercentage}% complete •
                  Last saved {new Date(currentDraft.lastSaved).toLocaleString()}
                </span>
                <Badge
                  variant={
                    currentDraft.status === "published"
                      ? "default"
                      : currentDraft.status === "submitted"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {currentDraft.status}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Status */}
        {submitStatus.type && (
          <Alert
            className={`mb-4 ${
              submitStatus.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            {submitStatus.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertDescription
              className={
                submitStatus.type === "success"
                  ? "text-green-800"
                  : "text-red-800"
              }
            >
              {submitStatus.message}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Loading State */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 animate-pulse" />

              <span>Submitting your listing...</span>
            </div>
          </Card>
        </div>
      )}

      {/* Wizard Component */}
      <ListingWizard
        initialData={currentDraft?.data}
        onSave={saveDraft}
        onSubmit={handleSubmit}
        onPreview={handlePreview}
      />

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Listing Tips</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use high-quality photos</li>
                <li>• Be detailed in descriptions</li>
                <li>• Price competitively</li>
                <li>• Include all relevant documents</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Verification Process</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Submit complete information</li>
                <li>• Our team reviews within 24-48 hours</li>
                <li>• You'll receive approval notification</li>
                <li>• Listing goes live after approval</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Support</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Email: support@bizsearch.com</li>
                <li>• Phone: +91 98765 43210</li>
                <li>• Live chat available 9 AM - 6 PM</li>
                <li>• FAQ section in help center</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
