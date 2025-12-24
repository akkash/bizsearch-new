import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCategoryBySlug } from "@/data/categories";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  Send,
  CheckCircle,
  AlertCircle,
  Building2,
  Users,
  DollarSign,
  MapPin,
  FileText,
  Settings,
  Upload,
} from "lucide-react";
import {
  franchiseListingSchema,
  franchiseIndustryOptions,
  franchiseBusinessModelOptions,
  supportTypes,
  marketingSupportTypes,
  type FranchiseListingFormValues,
} from "@/polymet/data/franchise-listing-data";
import { FileUploader } from "@/polymet/components/file-uploader";
import { NDAModal } from "@/polymet/components/nda-modal";
import { AIAssistant } from "@/polymet/components/ai-assistant";
import { TerritoryMapper } from "@/polymet/components/territory-mapper";
import { ROICalculator } from "@/polymet/components/roi-calculator";
import { RoyaltyScheduler } from "@/polymet/components/royalty-scheduler";
import { InvestmentBreakdown } from "@/polymet/components/investment-breakdown";
import { WorkflowManager } from "@/polymet/components/workflow-manager";
import { TerritoryAvailability } from "@/polymet/components/territory-availability";
import { FranchiseMetrics } from "@/polymet/components/franchise-metrics";

interface FranchiseListingWizardProps {
  initialData?: Partial<FranchiseListingFormValues>;
  onSave?: (
    data: Partial<FranchiseListingFormValues>,
    isDraft: boolean
  ) => void;
  onSubmit?: (data: FranchiseListingFormValues) => void;
  onPreview?: (data: Partial<FranchiseListingFormValues>) => void;
  className?: string;
}

const steps = [
  {
    id: "brand-overview",
    title: "Brand Overview",
    description: "Basic brand information and outlet details",
    icon: Building2,
  },
  {
    id: "description",
    title: "Brand Description",
    description: "Detailed brand story and unique selling points",
    icon: FileText,
  },
  {
    id: "investment",
    title: "Investment & Financials",
    description: "Investment requirements and financial projections",
    icon: DollarSign,
  },
  {
    id: "support",
    title: "Support & Training",
    description: "Training programs and ongoing support details",
    icon: Users,
  },
  {
    id: "territory",
    title: "Territory & Requirements",
    description: "Available territories and demographic requirements",
    icon: MapPin,
  },
  {
    id: "franchisee-profile",
    title: "Franchisee Profile",
    description: "Ideal franchisee characteristics and requirements",
    icon: Users,
  },
  {
    id: "media",
    title: "Media & Documents",
    description: "Brand assets and legal documentation",
    icon: Upload,
  },
  {
    id: "contact",
    title: "Contact & Legal",
    description: "Contact information and legal details",
    icon: Settings,
  },
  {
    id: "publishing",
    title: "Publishing Settings",
    description: "Listing visibility and contact preferences",
    icon: Eye,
  },
];

export function FranchiseListingWizard({
  initialData,
  onSave,
  onSubmit,
  onPreview,
  className,
}: FranchiseListingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [ndaSigned, setNdaSigned] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const form = useForm<FranchiseListingFormValues>({
    resolver: zodResolver(franchiseListingSchema),
    defaultValues: initialData || {},
    mode: "onChange",
  });

  const {
    watch,
    formState: { errors, isValid },
  } = form;
  const watchedData = watch();

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSave && Object.keys(watchedData).length > 0) {
        onSave(watchedData, true);
        setLastSaved(new Date());
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [watchedData, onSave]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleSaveDraft = () => {
    if (onSave) {
      onSave(watchedData, true);
      setLastSaved(new Date());
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(watchedData);
    }
  };

  const handleSubmit = () => {
    if (isValid && onSubmit) {
      onSubmit(watchedData as FranchiseListingFormValues);
    }
  };

  const handleNDAAccept = (ndaData: any) => {
    setNdaSigned(true);
    setShowNDAModal(false);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case "brand-overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name *</Label>
                <Input
                  id="brandName"
                  {...form.register("brandOverview.brandName")}
                  placeholder="Enter your brand name"
                />

                {errors.brandOverview?.brandName && (
                  <p className="text-sm text-red-600">
                    {errors.brandOverview.brandName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Brand Tagline *</Label>
                <Input
                  id="tagline"
                  {...form.register("brandOverview.tagline")}
                  placeholder="Your brand's compelling tagline"
                />

                {errors.brandOverview?.tagline && (
                  <p className="text-sm text-red-600">
                    {errors.brandOverview.tagline.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry *</Label>
                <Controller
                  control={form.control}
                  name="brandOverview.industry"
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange([value]); // Store as array
                        form.setValue("brandOverview.subcategory", []); // Reset subcategory
                      }}
                      defaultValue={field.value?.[0]}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {franchiseIndustryOptions.map((industry) => (
                          <SelectItem key={industry.value} value={industry.value}>
                            {industry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.brandOverview?.industry && (
                  <p className="text-sm text-red-600">
                    {errors.brandOverview.industry.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Business Model *</Label>
                <Controller
                  control={form.control}
                  name="brandOverview.businessModel"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business model" />
                      </SelectTrigger>
                      <SelectContent>
                        {franchiseBusinessModelOptions.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.brandOverview?.businessModel && (
                  <p className="text-sm text-red-600">
                    {errors.brandOverview.businessModel.message}
                  </p>
                )}
              </div>
            </div>

            {/* Subcategories Section */}
            {watchedData.brandOverview?.industry?.[0] && (
              <div className="space-y-2">
                <Label>Subcategories *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border rounded-md bg-muted/20 max-h-48 overflow-y-auto">
                  {getCategoryBySlug(watchedData.brandOverview.industry[0])?.subcategories.map((sub) => (
                    <div key={sub.slug} className="flex items-center space-x-2">
                      <Controller
                        control={form.control}
                        name="brandOverview.subcategory"
                        render={({ field }) => {
                          const currentValues = field.value || [];
                          return (
                            <Checkbox
                              id={sub.slug}
                              checked={currentValues.includes(sub.slug)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...currentValues, sub.slug]);
                                } else {
                                  field.onChange(
                                    currentValues.filter((v) => v !== sub.slug)
                                  );
                                }
                              }}
                            />
                          );
                        }}
                      />
                      <Label htmlFor={sub.slug} className="text-sm font-normal cursor-pointer">
                        {sub.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.brandOverview?.subcategory && (
                  <p className="text-sm text-red-600">
                    {errors.brandOverview.subcategory.message}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearEstablished">Year Established *</Label>
                <Input
                  id="yearEstablished"
                  type="number"
                  {...form.register("brandOverview.yearEstablished", {
                    valueAsNumber: true,
                  })}
                  placeholder="2020"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalOutlets">Total Outlets *</Label>
                <Input
                  id="totalOutlets"
                  type="number"
                  {...form.register("brandOverview.totalOutlets", {
                    valueAsNumber: true,
                  })}
                  placeholder="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyOutlets">Company Outlets</Label>
                <Input
                  id="companyOutlets"
                  type="number"
                  {...form.register("brandOverview.companyOutlets", {
                    valueAsNumber: true,
                  })}
                  placeholder="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="franchiseOutlets">Franchise Outlets</Label>
                <Input
                  id="franchiseOutlets"
                  type="number"
                  {...form.register("brandOverview.franchiseOutlets", {
                    valueAsNumber: true,
                  })}
                  placeholder="40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                {...form.register("brandOverview.website")}
                placeholder="https://yourbrand.com"
              />
            </div>
          </div>
        );

      case "investment":
        return (
          <div className="space-y-6">
            {!ndaSigned && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />

                  <h3 className="font-medium text-yellow-800">
                    Financial Information Protected
                  </h3>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  This section contains sensitive financial information. Please
                  sign an NDA to proceed.
                </p>
                <Button
                  onClick={() => setShowNDAModal(true)}
                  variant="outline"
                  size="sm"
                >
                  Sign NDA to Continue
                </Button>
              </div>
            )}

            {ndaSigned && (
              <div className="space-y-8">
                {/* Basic Investment Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">
                    Basic Investment Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="franchiseFee">Franchise Fee (₹) *</Label>
                      <Input
                        id="franchiseFee"
                        type="number"
                        {...form.register("investment.franchiseFee", {
                          valueAsNumber: true,
                        })}
                        placeholder="800000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="liquidCapital">
                        Liquid Capital Required (₹) *
                      </Label>
                      <Input
                        id="liquidCapital"
                        type="number"
                        {...form.register("investment.liquidCapitalRequired", {
                          valueAsNumber: true,
                        })}
                        placeholder="1500000"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Total Investment Range (₹) *</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minInvestment">Minimum</Label>
                        <Input
                          id="minInvestment"
                          type="number"
                          {...form.register("investment.totalInvestment.min", {
                            valueAsNumber: true,
                          })}
                          placeholder="2500000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxInvestment">Maximum</Label>
                        <Input
                          id="maxInvestment"
                          type="number"
                          {...form.register("investment.totalInvestment.max", {
                            valueAsNumber: true,
                          })}
                          placeholder="4000000"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Royalty Structure */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">
                    Royalty & Fee Structure
                  </h4>
                  <RoyaltyScheduler
                    onScheduleChange={(schedule) => {
                      // Update form with royalty schedule
                      form.setValue("investment.royaltyStructure", schedule);
                    }}
                  />
                </div>

                {/* Investment Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">
                    Detailed Investment Breakdown
                  </h4>
                  <InvestmentBreakdown
                    franchiseFee={
                      watchedData.investment?.franchiseFee || 800000
                    }
                    onBreakdownChange={(breakdown, total) => {
                      form.setValue(
                        "investment.investmentBreakdown",
                        breakdown
                      );
                    }}
                  />
                </div>

                {/* ROI Projections */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">
                    ROI Projections & Analysis
                  </h4>
                  <ROICalculator
                    initialInvestment={
                      watchedData.investment?.totalInvestment?.min || 2500000
                    }
                    franchiseFee={
                      watchedData.investment?.franchiseFee || 800000
                    }
                    royaltyPercentage={6}
                    marketingFeePercentage={2}
                    industryType="food-beverage"
                    locationTier="tier2"
                    onROIChange={(roiData) => {
                      form.setValue("investment.roiProjections", {
                        scenarios: roiData,
                      });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case "support":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="trainingDuration">
                Initial Training Duration (Days) *
              </Label>
              <Input
                id="trainingDuration"
                type="number"
                {...form.register("support.initialTrainingDuration", {
                  valueAsNumber: true,
                })}
                placeholder="21"
              />
            </div>

            <div className="space-y-4">
              <Label>Ongoing Support Types *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {supportTypes.map((support) => (
                  <div key={support} className="flex items-center space-x-2">
                    <Checkbox id={support} />

                    <Label htmlFor={support} className="text-sm">
                      {support}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Marketing Support *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {marketingSupportTypes.map((support) => (
                  <div key={support} className="flex items-center space-x-2">
                    <Checkbox id={support} />

                    <Label htmlFor={support} className="text-sm">
                      {support}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualityAssurance">
                Quality Assurance Process *
              </Label>
              <Textarea
                id="qualityAssurance"
                {...form.register("support.qualityAssurance")}
                placeholder="Describe your quality assurance and monitoring processes..."
                rows={4}
              />
            </div>
          </div>
        );

      case "territory":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">
                Territory Selection & Management
              </h4>
              <TerritoryMapper
                onTerritoriesChange={(territories) => {
                  form.setValue("territory.selectedTerritories", territories);
                }}
                onProtectedTerritoryChange={(enabled) => {
                  form.setValue("territory.protectedTerritoryEnabled", enabled);
                }}
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">
                Multi-Unit Development Options
              </h4>
              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="multi-unit-enabled"
                    {...form.register("territory.multiUnitDevelopment.enabled")}
                  />

                  <Label htmlFor="multi-unit-enabled" className="font-medium">
                    Enable Multi-Unit Development Rights
                  </Label>
                </div>

                {watchedData.territory?.multiUnitDevelopment?.enabled && (
                  <div className="ml-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minimum-units">
                          Minimum Units Required
                        </Label>
                        <Input
                          id="minimum-units"
                          type="number"
                          {...form.register(
                            "territory.multiUnitDevelopment.minimumUnits",
                            {
                              valueAsNumber: true,
                            }
                          )}
                          placeholder="3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="development-timeline">
                          Development Timeline
                        </Label>
                        <Input
                          id="development-timeline"
                          {...form.register(
                            "territory.multiUnitDevelopment.developmentTimeline"
                          )}
                          placeholder="36 months"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="additional-incentives">
                        Additional Incentives
                      </Label>
                      <Textarea
                        id="additional-incentives"
                        {...form.register(
                          "territory.multiUnitDevelopment.additionalIncentives"
                        )}
                        placeholder="Describe any additional incentives for multi-unit developers..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="territory-size">
                  Territory Size Description *
                </Label>
                <Input
                  id="territory-size"
                  {...form.register("territory.territorySize")}
                  placeholder="e.g., 5km radius, City center, District-wide"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="population-requirement">
                  Minimum Population
                </Label>
                <Input
                  id="population-requirement"
                  type="number"
                  {...form.register("territory.populationRequirement", {
                    valueAsNumber: true,
                  })}
                  placeholder="100000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="demographic-profile">
                Target Demographic Profile *
              </Label>
              <Textarea
                id="demographic-profile"
                {...form.register("territory.demographicProfile")}
                placeholder="Describe the ideal demographic profile for this franchise..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="competition-analysis">
                Competition Analysis *
              </Label>
              <Textarea
                id="competition-analysis"
                {...form.register("territory.competitionAnalysis")}
                placeholder="Analyze the competitive landscape in target territories..."
                rows={3}
              />
            </div>
          </div>
        );

      case "publishing":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="listingTitle">Listing Title *</Label>
              <Input
                id="listingTitle"
                {...form.register("publishing.listingTitle")}
                placeholder="Profitable Food Franchise - Prime Locations Available"
              />
            </div>

            <div className="space-y-4">
              <Label>Listing Visibility *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    Public - Visible to all users
                  </SelectItem>
                  <SelectItem value="verified_only">
                    Verified Users Only
                  </SelectItem>
                  <SelectItem value="private">
                    Private - By invitation only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Listing Options</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="featured" />

                  <Label htmlFor="featured">
                    Featured Listing (+₹5,000/month)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="urgent" />

                  <Label htmlFor="urgent">
                    Urgent Listing Badge (+₹2,000/month)
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Contact Preferences</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="directContact" />

                  <Label htmlFor="directContact">
                    Allow direct contact from interested parties
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="requireNDA" />

                  <Label htmlFor="requireNDA">
                    Require NDA before sharing detailed information
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Legal Agreements *</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="termsAccepted" />

                  <Label htmlFor="termsAccepted">
                    I accept the Terms of Service and Privacy Policy
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="verificationConsent" />

                  <Label htmlFor="verificationConsent">
                    I consent to franchise verification process
                  </Label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Step content for {currentStepData.title} coming soon...
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Header */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl">
                Create Franchise Listing
              </CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {steps.length}:{" "}
                {currentStepData.title}
              </CardDescription>
            </div>
            {lastSaved && (
              <div className="text-sm text-muted-foreground">
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Step Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.has(index);
                const isCurrent = index === currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${isCurrent
                      ? "border-primary bg-primary/5"
                      : isCompleted
                        ? "border-green-200 bg-green-50"
                        : "border-muted hover:bg-muted"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-muted"
                          }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <currentStepData.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>{currentStepData.title}</CardTitle>
                  <CardDescription>
                    {currentStepData.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>{renderStepContent()}</CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>

              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button onClick={handleSubmit} disabled={!isValid}>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Listing
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        businessData={{
          name: watchedData.brandOverview?.brandName,
          industry: watchedData.brandOverview?.industry,
        }}
        className="fixed bottom-6 right-6"
      />

      {/* NDA Modal */}
      <NDAModal
        isOpen={showNDAModal}
        onClose={() => setShowNDAModal(false)}
        onAccept={handleNDAAccept}
        businessName={
          watchedData.brandOverview?.brandName || "Franchise Opportunity"
        }
        sellerName="Franchise Owner"
        documentsCount={5}
      />
    </div>
  );
}
