import { useState, useEffect } from "react";
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
  CheckCircle,
  AlertCircle,
  Building2,
  DollarSign,
  Settings,
  Upload,
  User,
  FileText,
  MapPin,
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
import { ROICalculator } from "@/polymet/components/roi-calculator";
import { RoyaltyScheduler } from "@/polymet/components/royalty-scheduler";
import { InvestmentBreakdown } from "@/polymet/components/investment-breakdown";
import { StickyActionBar } from "@/polymet/components/sticky-action-bar";
import { cn } from "@/lib/utils";

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

// Consolidated 4-chapter structure (combining previous 9 steps)
const steps = [
  {
    id: "identity",
    title: "Brand Identity",
    description: "Brand overview, description, and unique selling points",
    icon: Building2,
  },
  {
    id: "financials",
    title: "Financials & Legal",
    description: "Investment requirements, projections, and legal details",
    icon: DollarSign,
  },
  {
    id: "operations",
    title: "Operations",
    description: "Support, training, territory, and franchisee requirements",
    icon: Settings,
  },
  {
    id: "assets",
    title: "Media & Publishing",
    description: "Brand assets, documents, and listing settings",
    icon: Upload,
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
      case "identity":
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

            {/* Countries Operating */}
            <div className="space-y-2">
              <Label htmlFor="countriesOperating">Countries Operating In</Label>
              <Input
                id="countriesOperating"
                type="number"
                {...form.register("brandOverview.countriesOperating", {
                  valueAsNumber: true,
                })}
                placeholder="1"
              />
            </div>

            <Separator className="my-6" />

            {/* Brand Description Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Brand Description
              </h4>

              <div className="space-y-2">
                <Label htmlFor="brandDescription">Brand Description *</Label>
                <Textarea
                  id="brandDescription"
                  {...form.register("description.brandDescription")}
                  placeholder="Describe your brand's story, history, and what makes it unique..."
                  rows={4}
                />
                {errors.description?.brandDescription && (
                  <p className="text-sm text-red-600">
                    {errors.description.brandDescription.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetMarket">Target Market *</Label>
                <Textarea
                  id="targetMarket"
                  {...form.register("description.targetMarket")}
                  placeholder="Describe your ideal customer demographics, preferences, and buying behavior..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="growthPotential">Growth Potential *</Label>
                <Textarea
                  id="growthPotential"
                  {...form.register("description.growthPotential")}
                  placeholder="Describe the market opportunity and expected growth trajectory..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mission">Mission Statement</Label>
                  <Textarea
                    id="mission"
                    {...form.register("description.mission")}
                    placeholder="Your brand's mission and purpose..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founderBio">Founder Bio</Label>
                  <Textarea
                    id="founderBio"
                    {...form.register("description.founderBio")}
                    placeholder="Brief background of the founder(s)..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Unique Selling Points */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Unique Selling Points *</h4>
              <p className="text-sm text-muted-foreground">Add at least 3 key differentiators</p>
              <Controller
                control={form.control}
                name="description.uniqueSellingPoints"
                render={({ field }) => {
                  const usps = field.value || ['', '', ''];
                  return (
                    <div className="space-y-2">
                      {usps.map((usp: string, index: number) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={usp}
                            onChange={(e) => {
                              const newUsps = [...usps];
                              newUsps[index] = e.target.value;
                              field.onChange(newUsps);
                            }}
                            placeholder={`Selling point ${index + 1}`}
                          />
                          {index >= 3 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                field.onChange(usps.filter((_: string, i: number) => i !== index));
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => field.onChange([...usps, ''])}
                      >
                        + Add More
                      </Button>
                    </div>
                  );
                }}
              />
            </div>

            {/* Competitive Advantages */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Competitive Advantages *</h4>
              <Controller
                control={form.control}
                name="description.competitiveAdvantages"
                render={({ field }) => {
                  const advantages = field.value || ['', ''];
                  return (
                    <div className="space-y-2">
                      {advantages.map((adv: string, index: number) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={adv}
                            onChange={(e) => {
                              const newAdvs = [...advantages];
                              newAdvs[index] = e.target.value;
                              field.onChange(newAdvs);
                            }}
                            placeholder={`Advantage ${index + 1}`}
                          />
                          {index >= 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                field.onChange(advantages.filter((_: string, i: number) => i !== index));
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => field.onChange([...advantages, ''])}
                      >
                        + Add More
                      </Button>
                    </div>
                  );
                }}
              />
            </div>

            <Separator className="my-6" />

            {/* Operating Territories */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Operating Territories *</h4>
              <p className="text-sm text-muted-foreground">Select states/regions where you currently operate</p>
              <Controller
                control={form.control}
                name="brandOverview.territories"
                render={({ field }) => {
                  const territories = field.value || [];
                  const indianStates = [
                    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
                    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
                    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
                    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
                    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Pan India'
                  ];
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 border rounded-md bg-muted/20 max-h-48 overflow-y-auto">
                      {indianStates.map((state) => (
                        <div key={state} className="flex items-center space-x-2">
                          <Checkbox
                            id={`territory-${state}`}
                            checked={territories.includes(state)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...territories, state]);
                              } else {
                                field.onChange(territories.filter((t: string) => t !== state));
                              }
                            }}
                          />
                          <Label htmlFor={`territory-${state}`} className="text-sm font-normal cursor-pointer">
                            {state}
                          </Label>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
            </div>
          </div>
        );

      case "financials":
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

                {/* Store Formats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">
                      Store Formats & Space Requirements
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentFormats = watchedData.investment?.storeFormats || [];
                        form.setValue("investment.storeFormats", [
                          ...currentFormats,
                          {
                            id: `format-${Date.now()}`,
                            name: "",
                            minSqft: 0,
                            maxSqft: 0,
                            investmentMin: 0,
                            investmentMax: 0,
                            description: "",
                          },
                        ]);
                      }}
                    >
                      + Add Format
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Define different store formats your franchise supports (e.g., Kiosk, Express, Standard, Flagship)
                  </p>

                  <div className="space-y-4">
                    {(watchedData.investment?.storeFormats || []).map((format, index) => (
                      <Card key={format?.id || index} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <Label>Format {index + 1}</Label>
                          </div>
                          {(watchedData.investment?.storeFormats?.length || 0) > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => {
                                const currentFormats = watchedData.investment?.storeFormats || [];
                                form.setValue(
                                  "investment.storeFormats",
                                  currentFormats.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`format-name-${index}`}>Format Name *</Label>
                            <Controller
                              control={form.control}
                              name={`investment.storeFormats.${index}.name`}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select format type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Kiosk">Kiosk (Mall/Airport)</SelectItem>
                                    <SelectItem value="Express">Express (Quick Service)</SelectItem>
                                    <SelectItem value="Standard">Standard (Full Service)</SelectItem>
                                    <SelectItem value="Flagship">Flagship (Premium)</SelectItem>
                                    <SelectItem value="Drive-Through">Drive-Through</SelectItem>
                                    <SelectItem value="Cloud Kitchen">Cloud Kitchen</SelectItem>
                                    <SelectItem value="Custom">Custom</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Space Required (sqft) *</Label>
                            <div className="flex gap-2 items-center">
                              <Input
                                type="number"
                                placeholder="Min"
                                {...form.register(`investment.storeFormats.${index}.minSqft`, { valueAsNumber: true })}
                              />
                              <span className="text-muted-foreground">to</span>
                              <Input
                                type="number"
                                placeholder="Max"
                                {...form.register(`investment.storeFormats.${index}.maxSqft`, { valueAsNumber: true })}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Investment Range (₹)</Label>
                            <div className="flex gap-2 items-center">
                              <Input
                                type="number"
                                placeholder="Min"
                                {...form.register(`investment.storeFormats.${index}.investmentMin`, { valueAsNumber: true })}
                              />
                              <span className="text-muted-foreground">to</span>
                              <Input
                                type="number"
                                placeholder="Max"
                                {...form.register(`investment.storeFormats.${index}.investmentMax`, { valueAsNumber: true })}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`format-desc-${index}`}>Description</Label>
                            <Input
                              id={`format-desc-${index}`}
                              placeholder="Brief description of this format"
                              {...form.register(`investment.storeFormats.${index}.description`)}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "operations":
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

            {/* Franchisee Requirements Section */}
            <Separator className="my-4" />
            <div className="space-y-6">
              <h4 className="font-semibold text-lg">Franchisee Requirements</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumNetWorth">
                    Minimum Net Worth Required (₹)
                  </Label>
                  <Input
                    id="minimumNetWorth"
                    type="number"
                    {...form.register("franchiseeProfile.minimumNetWorth", {
                      valueAsNumber: true,
                    })}
                    placeholder="5000000"
                  />
                  <p className="text-xs text-muted-foreground">
                    The minimum net worth a franchisee should have
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceRequired">Experience Required *</Label>
                  <Controller
                    control={form.control}
                    name="franchiseeProfile.experienceRequired"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No prior experience needed</SelectItem>
                          <SelectItem value="any_business">Any business experience</SelectItem>
                          <SelectItem value="industry_specific">Industry-specific experience</SelectItem>
                          <SelectItem value="management">Management experience required</SelectItem>
                          <SelectItem value="franchise_owner">Prior franchise ownership</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idealCandidateProfile">Ideal Candidate Profile *</Label>
                <Textarea
                  id="idealCandidateProfile"
                  {...form.register("franchiseeProfile.idealCandidateProfile")}
                  placeholder="Describe the ideal franchisee candidate - their background, skills, personality traits, and what makes them successful in your system..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeCommitment">Time Commitment *</Label>
                <Controller
                  control={form.control}
                  name="franchiseeProfile.timeCommitment"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time commitment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time_owner">Full-time owner-operator</SelectItem>
                        <SelectItem value="semi_absentee">Semi-absentee (20-30 hrs/week)</SelectItem>
                        <SelectItem value="absentee">Absentee ownership possible</SelectItem>
                        <SelectItem value="flexible">Flexible arrangement</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-4">
                <Label>Skills Required *</Label>
                <p className="text-sm text-muted-foreground">Select at least 3 key skills</p>
                <Controller
                  control={form.control}
                  name="franchiseeProfile.skillsRequired"
                  render={({ field }) => {
                    const skills = field.value || [];
                    const availableSkills = [
                      'Sales & Marketing', 'Customer Service', 'Team Management',
                      'Financial Management', 'Operations', 'Networking',
                      'Leadership', 'Problem Solving', 'Communication',
                      'Technical Skills', 'Negotiation', 'Strategic Planning'
                    ];
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {availableSkills.map((skill) => (
                          <div key={skill} className="flex items-center space-x-2">
                            <Checkbox
                              id={`skill-${skill}`}
                              checked={skills.includes(skill)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...skills, skill]);
                                } else {
                                  field.onChange(skills.filter((s: string) => s !== skill));
                                }
                              }}
                            />
                            <Label htmlFor={`skill-${skill}`} className="text-sm font-normal cursor-pointer">
                              {skill}
                            </Label>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
              </div>

              <div className="space-y-4">
                <Label>Background Preferences</Label>
                <p className="text-sm text-muted-foreground">Preferred professional backgrounds</p>
                <Controller
                  control={form.control}
                  name="franchiseeProfile.backgroundPreferences"
                  render={({ field }) => {
                    const backgrounds = field.value || [];
                    const availableBackgrounds = [
                      'Corporate Executive', 'Entrepreneur', 'Retail Experience',
                      'Food & Beverage', 'Healthcare', 'Education',
                      'Military/Veterans', 'Professional Services', 'Sales Background'
                    ];
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableBackgrounds.map((bg) => (
                          <div key={bg} className="flex items-center space-x-2">
                            <Checkbox
                              id={`bg-${bg}`}
                              checked={backgrounds.includes(bg)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...backgrounds, bg]);
                                } else {
                                  field.onChange(backgrounds.filter((b: string) => b !== bg));
                                }
                              }}
                            />
                            <Label htmlFor={`bg-${bg}`} className="text-sm font-normal cursor-pointer">
                              {bg}
                            </Label>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
              </div>
            </div>
          </div>
        );


      case "assets":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Visual Assets
                </CardTitle>
                <CardDescription>
                  High-quality visuals significantly increase engagement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Brand Logo *</Label>
                    <Controller
                      name="media.brandLogo"
                      control={form.control}
                      render={({ field }) => (
                        <FileUploader
                          files={(field.value || []).map((f: any) => ({
                            ...f,
                            filename: f.name,
                          }))}
                          onFilesChange={(files) =>
                            field.onChange(
                              files.map((f) => ({ ...f, name: f.filename }))
                            )
                          }
                          maxFiles={1}
                          maxSize={5 * 1024 * 1024}
                          accept="image/*"
                        />
                      )}
                    />
                    {form.formState.errors.media?.brandLogo && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.media.brandLogo.message}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2 block">Outlet Photos *</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload at least 3 photos of existing outlets (interior/exterior)
                    </p>
                    <Controller
                      name="media.outletPhotos"
                      control={form.control}
                      render={({ field }) => (
                        <FileUploader
                          files={(field.value || []).map((f: any) => ({
                            ...f,
                            filename: f.name,
                          }))}
                          onFilesChange={(files) =>
                            field.onChange(
                              files.map((f) => ({ ...f, name: f.filename }))
                            )
                          }
                          maxFiles={10}
                          maxSize={5 * 1024 * 1024}
                          accept="image/*"
                        />
                      )}
                    />
                    {form.formState.errors.media?.outletPhotos && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.media.outletPhotos.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Marketing Materials</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Brochures, presentations, or menu cards
                    </p>
                    <Controller
                      name="media.marketingMaterials"
                      control={form.control}
                      render={({ field }) => (
                        <FileUploader
                          files={(field.value || []).map((f: any) => ({
                            ...f,
                            filename: f.name,
                          }))}
                          onFilesChange={(files) =>
                            field.onChange(
                              files.map((f) => ({ ...f, name: f.filename }))
                            )
                          }
                          maxFiles={5}
                          maxSize={10 * 1024 * 1024}
                          accept="application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        />
                      )}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2 block">
                      Franchise Disclosure Document (FDD) *
                    </Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Required for verification
                    </p>
                    <Controller
                      name="media.franchiseDisclosureDocument"
                      control={form.control}
                      render={({ field }) => (
                        <FileUploader
                          files={(field.value || []).map((f: any) => ({
                            ...f,
                            filename: f.name,
                          }))}
                          onFilesChange={(files) =>
                            field.onChange(
                              files.map((f) => ({ ...f, name: f.filename }))
                            )
                          }
                          maxFiles={1}
                          maxSize={10 * 1024 * 1024}
                          accept="application/pdf"
                        />
                      )}
                    />
                    {form.formState.errors.media?.franchiseDisclosureDocument && (
                      <p className="text-sm text-destructive mt-1">
                        {
                          form.formState.errors.media.franchiseDisclosureDocument
                            .message
                        }
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2 block">Financial Statements</Label>
                    <Controller
                      name="media.financialStatements"
                      control={form.control}
                      render={({ field }) => (
                        <FileUploader
                          files={(field.value || []).map((f: any) => ({
                            ...f,
                            filename: f.name,
                          }))}
                          onFilesChange={(files) =>
                            field.onChange(
                              files.map((f) => ({ ...f, name: f.filename }))
                            )
                          }
                          maxFiles={3}
                          maxSize={10 * 1024 * 1024}
                          accept="application/pdf"
                        />
                      )}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2 block">Promotional Videos</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload franchise overview videos, training clips, or promotional content
                    </p>
                    <Controller
                      name="media.videos"
                      control={form.control}
                      render={({ field }) => (
                        <FileUploader
                          files={(field.value || []).map((f: any) => ({
                            ...f,
                            filename: f.name,
                          }))}
                          onFilesChange={(files) =>
                            field.onChange(
                              files.map((f) => ({ ...f, name: f.filename }))
                            )
                          }
                          maxFiles={5}
                          maxSize={100 * 1024 * 1024}
                          accept="video/mp4,video/webm,video/quicktime"
                        />
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );


      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Primary Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Conatct Name *</Label>
                    <Input
                      id="contactName"
                      placeholder="e.g. John Doe"
                      {...form.register("contact.primaryContact.name")}
                    />
                    {form.formState.errors.contact?.primaryContact?.name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.contact.primaryContact.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactTitle">Title/Designation *</Label>
                    <Input
                      id="contactTitle"
                      placeholder="e.g. Franchise Development Manager"
                      {...form.register("contact.primaryContact.title")}
                    />
                    {form.formState.errors.contact?.primaryContact?.title && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.contact.primaryContact.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email Address *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="e.g. franchise@brand.com"
                      {...form.register("contact.primaryContact.email")}
                    />
                    {form.formState.errors.contact?.primaryContact?.email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.contact.primaryContact.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      placeholder="e.g. +91 98765 43210"
                      {...form.register("contact.primaryContact.phone")}
                    />
                    {form.formState.errors.contact?.primaryContact?.phone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.contact.primaryContact.phone.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Company Headquarters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Textarea
                    id="streetAddress"
                    placeholder="Enter full street address"
                    className="min-h-[80px]"
                    {...form.register("contact.companyAddress.street")}
                  />
                  {form.formState.errors.contact?.companyAddress?.street && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.contact.companyAddress.street.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      {...form.register("contact.companyAddress.city")}
                    />
                    {form.formState.errors.contact?.companyAddress?.city && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.contact.companyAddress.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      {...form.register("contact.companyAddress.state")}
                    />
                    {form.formState.errors.contact?.companyAddress?.state && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.contact.companyAddress.state.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip/Postal Code *</Label>
                    <Input
                      id="zipCode"
                      placeholder="Zip Code"
                      {...form.register("contact.companyAddress.zipCode")}
                    />
                    {form.formState.errors.contact?.companyAddress?.zipCode && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.contact.companyAddress.zipCode.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      defaultValue="India"
                      {...form.register("contact.companyAddress.country")}
                    />
                    {form.formState.errors.contact?.companyAddress?.country && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.contact.companyAddress.country.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Legal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="legalStructure">Legal Entity Structre *</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("contact.legalStructure", value)
                      }
                      defaultValue={form.watch("contact.legalStructure")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select structure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Private Limited">Private Limited</SelectItem>
                        <SelectItem value="Public Limited">Public Limited</SelectItem>
                        <SelectItem value="LLP">LLP</SelectItem>
                        <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="Partnership">Partnership</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.contact?.legalStructure && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.contact.legalStructure.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Company Registration Number *</Label>
                    <Input
                      id="registrationNumber"
                      placeholder="CIN / Registration No."
                      {...form.register("contact.registrationNumber")}
                    />
                    {form.formState.errors.contact?.registrationNumber && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.contact.registrationNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="franchiseRegistration">Franchise Registration Number (if applicable)</Label>
                    <Input
                      id="franchiseRegistration"
                      placeholder="Franchise Reg No."
                      {...form.register("contact.franchiseRegistration")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
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
        {/* Chapter-Based Step Navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Progress</CardTitle>
                <Badge variant="secondary" className="font-mono">
                  {Math.round(progress)}%
                </Badge>
              </div>
              <Progress value={progress} className="h-2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = completedSteps.has(index);
                const isCurrent = index === currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
                      isCurrent
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : isCompleted
                          ? "border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800"
                          : "border-muted hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-colors flex-shrink-0",
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-muted"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isCurrent ? (
                        <div className="h-4 w-4 rounded-full bg-primary-foreground/30 animate-pulse" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{step.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {step.description}
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
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

          {/* Action Buttons - Now using StickyActionBar */}
        </div>
      </div>

      {/* Sticky Action Bar */}
      <StickyActionBar
        onSaveDraft={handleSaveDraft}
        onNext={handleNext}
        onPrevious={handlePrevious}
        nextStepName={steps[currentStep + 1]?.title || "Submit"}
        currentStepIndex={currentStep}
        totalSteps={steps.length}
        isFirstStep={currentStep === 0}
        isLastStep={currentStep === steps.length - 1}
        isSaving={false}
        lastSaved={lastSaved}
        isValid={isValid}
        onSubmit={handleSubmit}
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
