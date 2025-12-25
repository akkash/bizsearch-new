import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  CheckCircle,
  Circle,
  Save,
  Eye,
  MapPin,
  DollarSign,
  FileText,
  Camera,
  User,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getBusinessCategoryBySlug } from "@/data/categories";
import {
  businessListingSchema,
  businessOverviewSchema,
  descriptionSchema,
  financialsSchema,
  assetsSchema,
  mediaSchema,
  contactSchema,
  publishSchema,
  industryOptions,
  businessModelOptions,
  type BusinessListingFormValues,
} from "@/polymet/data/listing-data";
import { FileUploader } from "@/polymet/components/file-uploader";
import { NDAModal } from "@/polymet/components/nda-modal";
import { usePhoneVerification } from "@/hooks/use-phone-verification";
import { PhoneVerificationModal } from "@/polymet/components/phone-verification-modal";
import { WizardStep } from "./wizard-step";

export interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  schema: any;
  required: boolean;
}

interface ListingWizardProps {
  initialData?: Partial<BusinessListingFormValues>;
  onSave?: (data: Partial<BusinessListingFormValues>, isDraft: boolean) => void;
  onSubmit?: (data: BusinessListingFormValues) => void;
  onPreview?: (data: Partial<BusinessListingFormValues>) => void;
  className?: string;
}

const steps: Step[] = [
  {
    id: "overview",
    title: "Business Overview",
    description: "Basic information about your business",
    icon: <FileText className="w-4 h-4" />,

    schema: businessOverviewSchema,
    required: true,
  },
  {
    id: "description",
    title: "Description & Operations",
    description: "Detailed business description and operations",
    icon: <FileText className="w-4 h-4" />,

    schema: descriptionSchema,
    required: true,
  },
  {
    id: "financials",
    title: "Financials",
    description: "Financial information and pricing",
    icon: <DollarSign className="w-4 h-4" />,

    schema: financialsSchema,
    required: true,
  },
  {
    id: "assets",
    title: "Assets & Inventory",
    description: "Business assets and inventory details",
    icon: <FileText className="w-4 h-4" />,

    schema: assetsSchema,
    required: false,
  },
  {
    id: "media",
    title: "Media & Documents",
    description: "Photos, videos, and documents",
    icon: <Camera className="w-4 h-4" />,

    schema: mediaSchema,
    required: true,
  },
  {
    id: "contact",
    title: "Contact & Verification",
    description: "Contact information and verification",
    icon: <User className="w-4 h-4" />,

    schema: contactSchema,
    required: true,
  },
  {
    id: "publish",
    title: "Preview & Publish",
    description: "Review and publish your listing",
    icon: <Eye className="w-4 h-4" />,

    schema: publishSchema,
    required: true,
  },
];

export function ListingWizard({
  initialData = {},
  onSave,
  onSubmit,
  onPreview,
  className,
}: ListingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [formData, setFormData] =
    useState<Partial<BusinessListingFormValues>>(initialData);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Phone Verification
  const { isVerified, verifyPhone, isOpen: isPhoneModalOpen, setIsOpen: setIsPhoneModalOpen, onVerificationComplete } = usePhoneVerification();

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleStepNext = (stepData: any) => {
    const updatedFormData = {
      ...formData,
      [currentStepData.id]: stepData
    };
    setFormData(updatedFormData);
    setCompletedSteps(prev => new Set([...prev, currentStep]));

    // Autosave on next
    onSave?.(updatedFormData, true);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmitFinal(updatedFormData);
    }
  };

  const handleSubmitFinal = (finalData: Partial<BusinessListingFormValues>) => {
    // Gate: Phone Verification
    if (!isVerified) {
      const proceed = verifyPhone();
      if (!proceed) return;
    }

    try {
      const validated = businessListingSchema.parse(finalData);
      onSubmit?.(validated);
    } catch (e) {
      console.error("Final validation error", e);
    }
  };

  const handleStepAutoSave = (stepData: any) => {
    setIsAutoSaving(true);
    const updatedFormData = {
      ...formData,
      [currentStepData.id]: stepData,
    };
    setFormData(updatedFormData);
    onSave?.(updatedFormData, true);
    setTimeout(() => setIsAutoSaving(false), 1000);
  };

  const handleStepPreview = (stepData: any) => {
    onPreview?.({ ...formData, [currentStepData.id]: stepData });
  };

  const renderStepContent = (form: any) => {
    switch (currentStepData.id) {
      case "overview":
        return renderOverviewStep(form);
      case "description":
        return renderDescriptionStep(form);
      case "financials":
        return renderFinancialsStep(form);
      case "assets":
        return renderAssetsStep(form);
      case "media":
        return renderMediaStep(form);
      case "contact":
        return renderContactStep(form);
      case "publish":
        return renderPublishStep(form);
      default:
        return null;
    }
  };

  const renderOverviewStep = (form: any) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            {...form.register("businessName")}
            placeholder="Enter your business name"
          />

          {form.formState.errors.businessName && (
            <p className="text-sm text-red-600">
              {form.formState.errors.businessName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            {...form.register("tagline")}
            placeholder="Brief tagline for your business"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Industry *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {industryOptions.slice(0, 12).map((industry) => (
            <div key={industry.value} className="flex items-center space-x-2">
              <Checkbox
                id={industry.value}
                {...form.register("industry")}
                value={industry.value}
              />

              <Label htmlFor={industry.value} className="text-sm">
                {industry.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Subcategories Section */}
      {form.watch("industry")?.length > 0 && (
        <div className="space-y-2">
          <Label>Subcategories *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border rounded-md bg-muted/20 max-h-48 overflow-y-auto">
            {form
              .watch("industry")
              .flatMap(
                (slug: string) =>
                  getBusinessCategoryBySlug(slug)?.subcategories || []
              )
              .map((sub: { slug: string; name: string }) => (
                <div key={sub.slug} className="flex items-center space-x-2">
                  <Checkbox
                    id={sub.slug}
                    {...form.register("subcategory")}
                    value={sub.slug}
                  />
                  <Label
                    htmlFor={sub.slug}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {sub.name}
                  </Label>
                </div>
              ))}
          </div>
          {form.formState.errors.subcategory && (
            <p className="text-sm text-red-600">
              {form.formState.errors.subcategory.message as string}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="businessType">Business Type *</Label>
          <Select {...form.register("businessType")}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asset_sale">Asset Sale</SelectItem>
              <SelectItem value="stock_sale">Stock Sale</SelectItem>
              <SelectItem value="franchise">Franchise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="establishedYear">Established Year *</Label>
          <Input
            id="establishedYear"
            type="number"
            {...form.register("establishedYear", { valueAsNumber: true })}
            placeholder="2020"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfEmployees">Number of Employees *</Label>
          <Input
            id="numberOfEmployees"
            type="number"
            {...form.register("numberOfEmployees", { valueAsNumber: true })}
            placeholder="10"
          />
        </div>
      </div>

      {/* Location Fields - Required by schema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            {...form.register("country")}
            placeholder="India"
            defaultValue="India"
          />
          {form.formState.errors.country && (
            <p className="text-sm text-red-600">
              {form.formState.errors.country.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            {...form.register("state")}
            placeholder="Maharashtra"
          />
          {form.formState.errors.state && (
            <p className="text-sm text-red-600">
              {form.formState.errors.state.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            {...form.register("city")}
            placeholder="Mumbai"
          />
          {form.formState.errors.city && (
            <p className="text-sm text-red-600">
              {form.formState.errors.city.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsInOperation">Years in Operation *</Label>
        <Input
          id="yearsInOperation"
          type="number"
          {...form.register("yearsInOperation", { valueAsNumber: true })}
          placeholder="5"
        />
        {form.formState.errors.yearsInOperation && (
          <p className="text-sm text-red-600">
            {form.formState.errors.yearsInOperation.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullAddress">Full Business Address *</Label>
        <Textarea
          id="fullAddress"
          {...form.register("fullAddress")}
          placeholder="Enter complete business address (e.g., Shop 15, Linking Road, Bandra West, Mumbai 400050)"
          rows={3}
        />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />

          <span>We'll use this to show your business location on the map</span>
        </div>
      </div>
    </div>
  );

  const renderDescriptionStep = (form: any) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="longDescription">Business Description *</Label>
        <Textarea
          id="longDescription"
          {...form.register("longDescription")}
          placeholder="Provide a detailed description of your business, its operations, and what makes it unique..."
          rows={6}
        />

        <p className="text-sm text-muted-foreground">
          Minimum 150 characters. Be specific about your business model, target
          customers, and competitive advantages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="businessModel">Business Model *</Label>
          <Select {...form.register("businessModel")}>
            <SelectTrigger>
              <SelectValue placeholder="Select business model" />
            </SelectTrigger>
            <SelectContent>
              {businessModelOptions.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerProfile">
          Customer Profile & Demographics *
        </Label>
        <Textarea
          id="customerProfile"
          {...form.register("customerProfile")}
          placeholder="Describe your typical customers, their demographics, and buying patterns..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplierRelationships">Supplier Relationships</Label>
        <Textarea
          id="supplierRelationships"
          {...form.register("supplierRelationships")}
          placeholder="Describe key supplier relationships, contracts, and dependencies..."
          rows={3}
        />
      </div>
    </div>
  );

  const renderFinancialsStep = (form: any) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Financial Information</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAIAssistant(!showAIAssistant)}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI Valuation Help
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="askingPrice">Asking Price (₹) *</Label>
          <Input
            id="askingPrice"
            type="number"
            {...form.register("askingPrice", { valueAsNumber: true })}
            placeholder="2500000"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Price Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assets">Assets (₹)</Label>
            <Input
              id="assets"
              type="number"
              {...form.register("priceBreakdown.assets", {
                valueAsNumber: true,
              })}
              placeholder="800000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goodwill">Goodwill (₹)</Label>
            <Input
              id="goodwill"
              type="number"
              {...form.register("priceBreakdown.goodwill", {
                valueAsNumber: true,
              })}
              placeholder="1200000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workingCapital">Working Capital (₹)</Label>
            <Input
              id="workingCapital"
              type="number"
              {...form.register("priceBreakdown.workingCapital", {
                valueAsNumber: true,
              })}
              placeholder="500000"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-amber-600" />

          <span className="font-medium text-amber-800">
            NDA Protected Information
          </span>
        </div>
        <p className="text-sm text-amber-700">
          Financial details will be protected by NDA and only shown to verified
          buyers who sign confidentiality agreements.
        </p>
      </div>

      {/* AI Assistant (TODO: Implement AIAssistant component) */}
      {/* {showAIAssistant && (
        <AIAssistant
          businessData={{
            name: form.watch("businessName"),
            industry: form.watch("industry"),
            location: form.watch("city"),
          }}
          onApplySuggestion={(suggestion: any) => {
            console.log("Applied AI suggestion:", suggestion);
          }}
        />
      )} */}
    </div>
  );

  const renderAssetsStep = (form: any) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Assets Included in Sale</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { value: "equipment", label: "Equipment" },
            { value: "inventory", label: "Inventory" },
            { value: "intellectual_property", label: "Intellectual Property" },
            { value: "customer_lists", label: "Customer Lists" },
            { value: "brand", label: "Brand & Trademarks" },
            { value: "real_estate", label: "Real Estate" },
          ].map((asset) => (
            <div key={asset.value} className="flex items-center space-x-2">
              <Checkbox
                id={asset.value}
                {...form.register("assetsIncluded")}
                value={asset.value}
              />

              <Label htmlFor={asset.value} className="text-sm">
                {asset.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="equipmentDetails">Equipment Details</Label>
        <Textarea
          id="equipmentDetails"
          {...form.register("equipmentDetails")}
          placeholder="List major equipment, machinery, and their condition..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="inventoryValue">Inventory Value (₹)</Label>
          <Input
            id="inventoryValue"
            type="number"
            {...form.register("inventoryValue", { valueAsNumber: true })}
            placeholder="150000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inventorySnapshotDate">Inventory Snapshot Date</Label>
          <Input
            id="inventorySnapshotDate"
            type="date"
            {...form.register("inventorySnapshotDate")}
          />
        </div>
      </div>
    </div>
  );

  const renderMediaStep = (_form: any) => (
    <div className="space-y-6">
      <FileUploader
        accept="image/*"
        maxFiles={10}
        files={formData.media?.businessPhotos || []}
        onFilesChange={(files) => {
          const updatedFormData = {
            ...formData,
            media: {
              ...(formData.media || { documents: [] }),
              businessPhotos: files,
            },
          };
          setFormData(updatedFormData);
        }}
        label="Business Photos"
        description="Upload high-quality photos of your business. First photo will be the main image."
        required={true}
      />

      <FileUploader
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        maxFiles={20}
        files={formData.media?.documents || []}
        onFilesChange={(files) => {
          const documentsWithMeta = files.map((f) => ({
            ...f,
            documentType: "other" as const,
            confidentiality: "nda_required" as const,
          }));
          const updatedFormData = {
            ...formData,
            media: {
              ...(formData.media || { businessPhotos: [] }),
              documents: documentsWithMeta,
            },
          };
          setFormData(updatedFormData);
        }}
        label="Business Documents"
        description="Upload financial statements, legal documents, etc. These will be NDA-protected."
        showPreview={false}
      />
    </div>
  );

  const renderContactStep = (form: any) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sellerDisplayName">Display Name *</Label>
          <Input
            id="sellerDisplayName"
            {...form.register("sellerDisplayName")}
            placeholder="Your name as it will appear to buyers"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email Address *</Label>
          <Input
            id="contactEmail"
            type="email"
            {...form.register("contactEmail")}
            placeholder="your.email@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">Phone Number *</Label>
          <Input
            id="contactPhone"
            {...form.register("contactPhone")}
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredContactMethod">
            Preferred Contact Method *
          </Label>
          <Select {...form.register("preferredContactMethod")}>
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="platform">Platform Messages</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enablePublicContact"
            {...form.register("enablePublicContact")}
          />

          <Label htmlFor="enablePublicContact">
            Allow public contact (buyers can contact you directly)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="verificationConsent"
            {...form.register("verificationConsent")}
          />

          <Label htmlFor="verificationConsent">
            I confirm that I have the right to sell this business and all
            information provided is accurate *
          </Label>
        </div>
      </div>
    </div>
  );

  const renderPublishStep = (form: any) => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Ready to Publish?</h3>
        <p className="text-muted-foreground">
          Review your listing and choose how you'd like to publish it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Business:</span>
              <p>{formData.overview?.businessName || "Not specified"}</p>
            </div>
            <div>
              <span className="font-medium">Industry:</span>
              <p>
                {formData.overview?.industry?.join(", ") || "Not specified"}
              </p>
            </div>
            <div>
              <span className="font-medium">Location:</span>
              <p>{formData.overview?.city || "Not specified"}</p>
            </div>
            <div>
              <span className="font-medium">Asking Price:</span>
              <p>
                ₹
                {formData.financials?.askingPrice?.toLocaleString() ||
                  "Not specified"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h4 className="font-medium">Publishing Options</h4>

        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility *</Label>
          <Select {...form.register("visibility")}>
            <SelectTrigger>
              <SelectValue placeholder="Choose visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                Public - Visible to all users
              </SelectItem>
              <SelectItem value="private">
                Private - Only you can see it
              </SelectItem>
              <SelectItem value="link_only">
                Link Only - Accessible via direct link
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="featuredListing"
            {...form.register("featuredListing")}
          />

          <Label htmlFor="featuredListing">
            Make this a featured listing (+₹2,999/month)
          </Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("max-w-6xl mx-auto", className)}>
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Add Business Listing</h1>
          <div className="flex items-center gap-2">
            {isAutoSaving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Save className="w-4 h-4 animate-pulse" />
                Saving...
              </div>
            )}
            <Badge variant="secondary">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
        </div>

        <Progress value={progress} className="mb-4" />

        {/* Step Navigation */}
        <div className="flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : completedSteps.has(index)
                    ? "bg-green-100 text-green-800"
                    : "bg-muted/50 text-muted-foreground"
              )}
            >
              {completedSteps.has(index) ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{step.title}</span>
              <span className="sm:hidden">{index + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Step */}
      <WizardStep
        key={currentStepData.id}
        step={currentStepData}
        defaultValues={formData[currentStepData.id as keyof BusinessListingFormValues] || {}}
        onNext={handleStepNext}
        onPrevious={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
        onAutoSave={handleStepAutoSave}
        onPreview={handleStepPreview}
        isLastStep={currentStep === steps.length - 1}
        isFirstStep={currentStep === 0}
        isAutoSaving={isAutoSaving}
        renderContent={renderStepContent}
      />

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onOpenChange={setIsPhoneModalOpen}
        onVerified={onVerificationComplete}
      />

      {/* NDA Modal */}
      <NDAModal
        isOpen={showNDAModal}
        onClose={() => setShowNDAModal(false)}
        onAccept={() => setShowNDAModal(false)}
        businessName={formData.overview?.businessName || "Your Business"}
        sellerName={formData.contact?.sellerDisplayName || "Business Owner"}
        documentsCount={formData.media?.documents?.length || 0}
      />
    </div>
  );
}
