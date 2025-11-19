import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Users,
  DollarSign,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  FileText,
  Lightbulb,
} from "lucide-react";
import { FranchiseListingWizard } from "@/polymet/components/franchise-listing-wizard";
import {
  mockFranchiseListing,
  type FranchiseListingFormValues,
} from "@/polymet/data/franchise-listing-data";
import { useAuth } from "@/contexts/AuthContext";
import { FranchiseService, type FranchiseCreateInput } from "@/lib/franchise-service";

interface AddFranchiseListingPageProps {
  className?: string;
}

export function AddFranchiseListingPage({
  className,
}: AddFranchiseListingPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
  const [currentDraft, setCurrentDraft] =
    useState<Partial<FranchiseListingFormValues> | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/add-franchise-listing');
    }
  }, [user, navigate]);

  // Load saved drafts on component mount
  useEffect(() => {
    // In a real app, this would load from localStorage or API
    const drafts = [
      {
        id: "draft-1",
        brandName: "FreshBite Café",
        lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        completionPercentage: 65,
        data: mockFranchiseListing,
      },
    ];

    setSavedDrafts(drafts);
  }, []);

  const handleStartNew = () => {
    setCurrentDraft(null);
    setShowWizard(true);
  };

  const handleContinueDraft = (draft: any) => {
    setCurrentDraft(draft.data);
    setShowWizard(true);
  };

  const handleSave = (
    data: Partial<FranchiseListingFormValues>,
    isDraft: boolean
  ) => {
    console.log("Saving franchise listing:", { data, isDraft });

    // Update current draft
    if (isDraft) {
      const updatedDraft = {
        id: "current-draft",
        brandName: data.brandOverview?.brandName || "Untitled Franchise",
        lastModified: new Date(),
        completionPercentage: calculateCompletionPercentage(data),
        data,
      };

      setSavedDrafts((prev) => {
        const filtered = prev.filter((d) => d.id !== "current-draft");
        return [updatedDraft, ...filtered];
      });
    }
  };

  const handleSubmit = async (data: FranchiseListingFormValues) => {
    if (!user) {
      alert("You must be logged in to submit a listing.");
      return;
    }

    try {
      console.log("Submitting franchise listing:", data);

      // Transform form data to database format
      const franchiseInput: FranchiseCreateInput = {
        brand_name: data.brandOverview?.brandName || '',
        industry: data.brandOverview?.industry?.[0] || '',
        description: data.description?.brandDescription || '',
        franchise_fee: data.investment?.franchiseFee || 0,
        total_investment_min: data.investment?.totalInvestment?.min,
        total_investment_max: data.investment?.totalInvestment?.max,
        royalty_percentage: data.investment?.royaltyStructure?.baseTiers?.[0]?.percentage || 0,
        marketing_fee_percentage: data.investment?.marketingFee?.value || 0,
        established_year: data.brandOverview?.yearEstablished,
        total_outlets: data.brandOverview?.totalOutlets,
        company_owned_outlets: data.brandOverview?.companyOutlets,
        franchise_outlets: data.brandOverview?.franchiseOutlets,
        headquarters_state: data.contact?.companyAddress?.state,
        headquarters_city: data.contact?.companyAddress?.city,
        headquarters_country: data.contact?.companyAddress?.country || 'India',
        tagline: data.brandOverview?.tagline,
        brand_story: data.description?.brandDescription,
        operating_locations: data.brandOverview?.territories || [],
        expansion_territories: data.territory?.selectedTerritories?.map(t => t.name) || [],
        support_provided: data.support?.ongoingSupport || [],
        training_provided: true,
        training_duration_days: data.support?.initialTrainingDuration,
        marketing_support: (data.support?.marketingSupport?.length || 0) > 0,
        minimum_net_worth: data.investment?.liquidCapitalRequired,
        minimum_liquid_capital: data.investment?.liquidCapitalRequired,
        experience_required: data.franchiseeProfile?.experienceRequired,
        average_unit_revenue: data.investment?.totalInvestment?.min,
        average_unit_profit: data.investment?.averageROI,
        payback_period_months: data.investment?.breakEvenPeriod,
        expected_roi_percentage: data.investment?.averageROI,
        space_required_sqft: data.territory?.populationRequirement,
        images: data.media?.outletPhotos?.map(p => p.url) || [],
        logo_url: data.media?.brandLogo?.[0]?.url,
        contact_email: data.contact?.primaryContact?.email,
        contact_phone: data.contact?.primaryContact?.phone,
        contact_person: data.contact?.primaryContact?.name,
        website: data.brandOverview?.website,
        highlights: data.description?.uniqueSellingPoints || [],
      };

      // Create franchise listing
      const response = await FranchiseService.createFranchise(user.id, franchiseInput);

      console.log('✅ Franchise listing created:', response);

      alert(
        "Franchise listing submitted successfully! Your listing is now under review. You'll be notified once it's approved."
      );

      // Redirect to profile
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting franchise listing:', error);
      alert(`Failed to submit franchise listing: ${error.message || 'Please try again.'}`);
    }
  };

  const handlePreview = (data: Partial<FranchiseListingFormValues>) => {
    console.log("Previewing franchise listing:", data);
    alert("Preview functionality - would show franchise listing preview");
  };

  const calculateCompletionPercentage = (
    data: Partial<FranchiseListingFormValues>
  ): number => {
    const sections = [
      data.brandOverview,
      data.description,
      data.investment,
      data.support,
      data.territory,
      data.franchiseeProfile,
      data.media,
      data.contact,
      data.publishing,
    ];

    const completedSections = sections.filter(
      (section) => section && Object.keys(section).length > 0
    ).length;

    return Math.round((completedSections / sections.length) * 100);
  };

  if (showWizard) {
    return (
      <div className="container mx-auto px-4 py-8">
        <FranchiseListingWizard
          initialData={currentDraft || undefined}
          onSave={handleSave}
          onSubmit={handleSubmit}
          onPreview={handlePreview}
        />
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          List Your <span className="text-primary">Franchise Opportunity</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Connect with qualified franchisees and expand your brand across India.
          Our AI-powered platform helps you find the right partners for
          sustainable growth.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center">
          <CardHeader>
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />

            <CardTitle>Qualified Franchisees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Access our network of verified, investment-ready franchisees
              actively seeking opportunities in your industry.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />

            <CardTitle>Secure Process</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              NDA protection, verified inquiries, and secure document sharing
              ensure your sensitive information stays protected.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />

            <CardTitle>AI-Powered Matching</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our AI analyzes franchisee profiles and investment capacity to
              connect you with the most suitable candidates.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Saved Drafts */}
      {savedDrafts.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Saved Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{draft.brandName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Last modified: {draft.lastModified.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${draft.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {draft.completionPercentage}% complete
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => handleContinueDraft(draft)}>
                    Continue
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Action */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Create a comprehensive franchise listing in just a few steps. Our
            guided wizard makes it easy to showcase your opportunity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">What You'll Need</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Brand information and history</li>
                <li>• Investment and fee structure</li>
                <li>• Support and training details</li>
                <li>• Territory availability</li>
                <li>• Financial documents (FDD)</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Estimated Time</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />

                <span>15-30 minutes</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Save your progress anytime and continue later
              </p>
            </div>
          </div>

          <Button size="lg" onClick={handleStartNew} className="px-8">
            <Building2 className="h-5 w-5 mr-2" />
            Create Franchise Listing
          </Button>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />

              <span>Free to list</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />

              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />

              <span>24/7 support</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Overview */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: 1,
              title: "Create Listing",
              description:
                "Fill out our comprehensive franchise listing form with your brand details.",
              icon: FileText,
            },
            {
              step: 2,
              title: "Review & Verify",
              description:
                "Our team reviews your listing and verifies the information for accuracy.",
              icon: Shield,
            },
            {
              step: 3,
              title: "Get Matched",
              description:
                "AI matches your opportunity with qualified franchisees in your target markets.",
              icon: Users,
            },
            {
              step: 4,
              title: "Connect & Grow",
              description:
                "Connect with interested franchisees and grow your brand network.",
              icon: Building2,
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <item.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center">
                  {item.step}
                </Badge>
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            {
              question: "How much does it cost to list my franchise?",
              answer:
                "Basic listings are completely free. We offer premium features like featured placement and enhanced visibility for additional fees.",
            },
            {
              question: "How long does the approval process take?",
              answer:
                "Most franchise listings are reviewed and approved within 24-48 hours. Complex listings may take up to 5 business days.",
            },
            {
              question: "What documents do I need to provide?",
              answer:
                "You'll need your Franchise Disclosure Document (FDD), financial statements, brand assets, and legal registration documents.",
            },
            {
              question: "How do you verify franchisee qualifications?",
              answer:
                "We verify financial capacity, background checks, and industry experience to ensure only qualified candidates contact you.",
            },
          ].map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
