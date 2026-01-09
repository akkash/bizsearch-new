import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  AlertCircle,
  Home,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
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
// import { WizardStep } from "./wizard-step";

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
  // const isVerified = true; // Temporary bypass for debugging

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
    // TEMPORARILY SKIPPED: Phone Verification
    // TODO: Re-enable phone verification when SMS provider is configured
    // if (!isVerified) {
    //   const proceed = verifyPhone();
    //   if (!proceed) return;
    // }

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
        <Controller
          name="industry"
          control={form.control}
          render={({ field }) => (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {industryOptions.slice(0, 12).map((industry) => (
                <div key={industry.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={industry.value}
                    checked={field.value?.includes(industry.value)}
                    onCheckedChange={(checked) => {
                      const current = field.value || [];
                      const updated = checked
                        ? [...current, industry.value]
                        : current.filter((v: string) => v !== industry.value);
                      field.onChange(updated);
                    }}
                  />
                  <Label htmlFor={industry.value} className="text-sm">
                    {industry.label}
                  </Label>
                </div>
              ))}
            </div>
          )}
        />
        {form.formState.errors.industry && (
          <p className="text-sm text-red-600">
            {form.formState.errors.industry.message as string}
          </p>
        )}
      </div>

      {/* Subcategories Section */}
      {Array.isArray(form.watch("industry")) && form.watch("industry").length > 0 && (
        <div className="space-y-2">
          <Label>Subcategories *</Label>
          <Controller
            name="subcategory"
            control={form.control}
            render={({ field }) => (
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
                        checked={field.value?.includes(sub.slug)}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          const updated = checked
                            ? [...current, sub.slug]
                            : current.filter((v: string) => v !== sub.slug);
                          field.onChange(updated);
                        }}
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
            )}
          />
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
          <Controller
            name="businessType"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="businessType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset_sale">Asset Sale</SelectItem>
                  <SelectItem value="stock_sale">Stock Sale</SelectItem>
                  <SelectItem value="franchise">Franchise</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.businessType && (
            <p className="text-sm text-red-600">
              {form.formState.errors.businessType.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="establishedYear">Established Year *</Label>
          <Input
            id="establishedYear"
            type="number"
            {...form.register("establishedYear", { valueAsNumber: true })}
            placeholder="2020"
          />
          {form.formState.errors.establishedYear && (
            <p className="text-sm text-red-600">
              {form.formState.errors.establishedYear.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfEmployees">Number of Employees *</Label>
          <Input
            id="numberOfEmployees"
            type="number"
            {...form.register("numberOfEmployees", { valueAsNumber: true })}
            placeholder="10"
          />
          {form.formState.errors.numberOfEmployees && (
            <p className="text-sm text-red-600">
              {form.formState.errors.numberOfEmployees.message as string}
            </p>
          )}
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
        {form.formState.errors.fullAddress && (
          <p className="text-sm text-red-600">
            {form.formState.errors.fullAddress.message as string}
          </p>
        )}
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
        {form.formState.errors.longDescription && (
          <p className="text-sm text-red-600">
            {form.formState.errors.longDescription.message as string}
          </p>
        )}
      </div>

      {/* REASON FOR SALE - Critical Trust Signal */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
        <Label htmlFor="reasonForSale" className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          Why Are You Selling? *
        </Label>
        <Textarea
          id="reasonForSale"
          {...form.register("reasonForSale")}
          placeholder="Be honest about your reason for selling (e.g., retirement, relocating, health reasons, new venture). Buyers appreciate transparency."
          rows={3}
        />
        <p className="text-sm text-amber-700">
          This is one of the first things buyers look at. Honest, clear reasons build trust.
        </p>
        {form.formState.errors.reasonForSale && (
          <p className="text-sm text-red-600">
            {form.formState.errors.reasonForSale.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="businessModel">Business Model *</Label>
          <Controller
            name="businessModel"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="businessModel">
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
            )}
          />
          {form.formState.errors.businessModel && (
            <p className="text-sm text-red-600">
              {form.formState.errors.businessModel.message as string}
            </p>
          )}
        </div>

        {/* TRAINING PERIOD */}
        <div className="space-y-2">
          <Label htmlFor="trainingPeriod">Training/Transition Period</Label>
          <Controller
            name="trainingPeriod"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="trainingPeriod">
                  <SelectValue placeholder="Select training period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 week">1 Week</SelectItem>
                  <SelectItem value="2 weeks">2 Weeks</SelectItem>
                  <SelectItem value="1 month">1 Month</SelectItem>
                  <SelectItem value="2-3 months">2-3 Months</SelectItem>
                  <SelectItem value="Until comfortable">Until Buyer is Comfortable</SelectItem>
                  <SelectItem value="Negotiable">Negotiable</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            How long will you train the new owner?
          </p>
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
        {form.formState.errors.customerProfile && (
          <p className="text-sm text-red-600">
            {form.formState.errors.customerProfile.message as string}
          </p>
        )}
      </div>

      {/* GROWTH OPPORTUNITIES */}
      <div className="space-y-2">
        <Label htmlFor="growthOpportunities">Growth Opportunities (for new owner)</Label>
        <Textarea
          id="growthOpportunities"
          {...form.register("growthOpportunities")}
          placeholder="List untapped opportunities that a new owner could pursue, e.g.:\n• Expand to online sales\n• Add delivery service\n• Open new locations"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Each opportunity on a new line
        </p>
      </div>

      {/* LOCATION HIGHLIGHTS */}
      <div className="space-y-2">
        <Label htmlFor="locationHighlights">Location Highlights</Label>
        <Textarea
          id="locationHighlights"
          {...form.register("locationHighlights")}
          placeholder="What makes your location special? e.g.:\n• High foot traffic area\n• Near metro station\n• Ample parking available"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Each highlight on a new line
        </p>
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

      {/* LEASE DETAILS SECTION */}
      <div className="p-4 border rounded-lg space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Home className="w-4 h-4" />
          Lease & Property Details
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="leaseType">Property Type</Label>
            <Controller
              name="leaseDetails.type"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="leaseType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="leased">Leased</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.leaseDetails?.type && (
              <p className="text-sm text-red-600">
                {form.formState.errors.leaseDetails.type.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyRent">Monthly Rent (₹)</Label>
            <Input
              id="monthlyRent"
              type="number"
              {...form.register("leaseDetails.monthlyRent", { valueAsNumber: true })}
              placeholder="85000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leaseRemainingYears">Lease Remaining (Years)</Label>
            <Input
              id="leaseRemainingYears"
              type="number"
              {...form.register("leaseDetails.leaseRemainingYears", { valueAsNumber: true })}
              placeholder="3"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lockInPeriod">Lock-in Period</Label>
            <Input
              id="lockInPeriod"
              {...form.register("leaseDetails.lockInPeriod")}
              placeholder="e.g., 2 years"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="securityDeposit">Security Deposit (₹)</Label>
            <Input
              id="securityDeposit"
              type="number"
              {...form.register("leaseDetails.securityDeposit", { valueAsNumber: true })}
              placeholder="500000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leaseExpiry">Lease Expiry Date</Label>
            <Input
              id="leaseExpiry"
              type="date"
              {...form.register("leaseDetails.leaseExpiry")}
            />
          </div>
        </div>
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
          {form.formState.errors.askingPrice && (
            <p className="text-sm text-red-600">
              {form.formState.errors.askingPrice.message as string}
            </p>
          )}
        </div>

        {/* ANNUAL PROFIT - Key for SDE calculation */}
        <div className="space-y-2">
          <Label htmlFor="annualProfit">Annual Profit (₹)</Label>
          <Input
            id="annualProfit"
            type="number"
            {...form.register("annualProfit", { valueAsNumber: true })}
            placeholder="1200000"
          />
          <p className="text-xs text-muted-foreground">
            Used for payback period calculation (SDE)
          </p>
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
            {form.formState.errors.priceBreakdown?.assets && (
              <p className="text-sm text-red-600">
                {form.formState.errors.priceBreakdown.assets.message as string}
              </p>
            )}
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
            {form.formState.errors.priceBreakdown?.goodwill && (
              <p className="text-sm text-red-600">
                {form.formState.errors.priceBreakdown.goodwill.message as string}
              </p>
            )}
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
            {form.formState.errors.priceBreakdown?.workingCapital && (
              <p className="text-sm text-red-600">
                {form.formState.errors.priceBreakdown.workingCapital.message as string}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FINANCING INFORMATION */}
      <div className="p-4 border rounded-lg space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-blue-600" />
          Financing Options
        </h4>
        <div className="flex items-center space-x-2">
          <Controller
            name="financingAvailable"
            control={form.control}
            render={({ field }) => (
              <Checkbox
                id="financingAvailable"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="financingAvailable">
            Seller financing is available for this business *
          </Label>
        </div>
        {form.formState.errors.financingAvailable && (
          <p className="text-sm text-red-600">
            {form.formState.errors.financingAvailable.message as string}
          </p>
        )}

        {form.watch("financingAvailable") && (
          <div className="space-y-2 mt-4">
            <Label htmlFor="financingDetails">Financing Details</Label>
            <Textarea
              id="financingDetails"
              {...form.register("financingDetails")}
              placeholder="Describe available terms, down payment required, interest rate, etc."
              rows={3}
            />
          </div>
        )}
      </div>

      {/* YEAR-OVER-YEAR GROWTH */}
      <div className="p-4 border rounded-lg space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          Year-over-Year Growth
        </h4>
        <p className="text-sm text-muted-foreground">
          Show buyers your growth trajectory - this significantly impacts valuation
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="revenueGrowthYoY">Revenue Growth (%)</Label>
            <Input
              id="revenueGrowthYoY"
              type="number"
              {...form.register("revenueGrowthYoY", { valueAsNumber: true })}
              placeholder="15"
            />
            <p className="text-xs text-muted-foreground">
              Enter negative values for decline (e.g., -10)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profitGrowthYoY">Profit Growth (%)</Label>
            <Input
              id="profitGrowthYoY"
              type="number"
              {...form.register("profitGrowthYoY", { valueAsNumber: true })}
              placeholder="20"
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
          <Controller
            name="assetsIncluded"
            control={form.control}
            render={({ field }) => (
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
                      checked={field.value?.includes(asset.value)}
                      onCheckedChange={(checked) => {
                        const current = field.value || [];
                        const updated = checked
                          ? [...current, asset.value]
                          : current.filter((v: string) => v !== asset.value);
                        field.onChange(updated);
                      }}
                    />
                    <Label htmlFor={asset.value} className="text-sm">
                      {asset.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          />
          {form.formState.errors.assetsIncluded && (
            <p className="text-sm text-red-600 mt-2">
              {form.formState.errors.assetsIncluded.message as string}
            </p>
          )}
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

  const renderMediaStep = (form: any) => (
    <div className="space-y-6">
      <FileUploader
        accept="image/*"
        maxFiles={10}
        files={formData.media?.businessPhotos || []}
        onFilesChange={(files) => {
          form.setValue("businessPhotos", files, { shouldValidate: true });
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
      {form.formState.errors.businessPhotos && (
        <p className="text-sm text-red-600">
          {form.formState.errors.businessPhotos.message as string}
        </p>
      )}

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
          form.setValue("documents", documentsWithMeta, { shouldValidate: true });
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
          {form.formState.errors.sellerDisplayName && (
            <p className="text-sm text-red-600">
              {form.formState.errors.sellerDisplayName.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email Address *</Label>
          <Input
            id="contactEmail"
            type="email"
            {...form.register("contactEmail")}
            placeholder="your.email@example.com"
          />
          {form.formState.errors.contactEmail && (
            <p className="text-sm text-red-600">
              {form.formState.errors.contactEmail.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">Phone Number *</Label>
          <Input
            id="contactPhone"
            {...form.register("contactPhone")}
            placeholder="+91 98765 43210"
          />
          {form.formState.errors.contactPhone && (
            <p className="text-sm text-red-600">
              {form.formState.errors.contactPhone.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredContactMethod">
            Preferred Contact Method *
          </Label>
          <Controller
            name="preferredContactMethod"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="preferredContactMethod">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="platform">Platform Messages</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.preferredContactMethod && (
            <p className="text-sm text-red-600">
              {form.formState.errors.preferredContactMethod.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Controller
            name="enablePublicContact"
            control={form.control}
            render={({ field }) => (
              <Checkbox
                id="enablePublicContact"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />

          <Label htmlFor="enablePublicContact">
            Allow public contact (buyers can contact you directly)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Controller
            name="verificationConsent"
            control={form.control}
            render={({ field }) => (
              <Checkbox
                id="verificationConsent"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />

          <Label htmlFor="verificationConsent">
            I confirm that I have the right to sell this business and all
            information provided is accurate *
          </Label>
        </div>
        {form.formState.errors.verificationConsent && (
          <p className="text-sm text-red-600">
            {form.formState.errors.verificationConsent.message as string}
          </p>
        )}
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
          <Controller
            name="visibility"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="visibility">
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
            )}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Controller
            name="featuredListing"
            control={form.control}
            render={({ field }) => (
              <Checkbox
                id="featuredListing"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
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

interface WizardStepProps {
  step: Step;
  defaultValues: any;
  onAutoSave: (data: any) => void;
  onNext: (data: any) => void;
  onPrevious: () => void;
  onPreview: (data: any) => void;
  isLastStep: boolean;
  isFirstStep: boolean;
  isAutoSaving: boolean;
  renderContent: (form: any) => React.ReactNode;
}

function WizardStep({
  step,
  defaultValues,
  onAutoSave,
  onNext,
  onPrevious,
  onPreview,
  isLastStep,
  isFirstStep,
  renderContent,
}: WizardStepProps) {
  const form = useForm({
    resolver: zodResolver(step.schema),
    defaultValues,
    mode: "onChange",
  });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save logic with debounce
  useEffect(() => {
    const subscription = form.watch(() => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        onAutoSave(form.getValues());
      }, 2000);
    });
    return () => {
      subscription.unsubscribe();
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [form, onAutoSave]);

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      onNext(form.getValues());
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {step.icon}
          {step.title}
        </CardTitle>
        <p className="text-muted-foreground">{step.description}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {renderContent(form)}

          {/* Navigation Buttons inside the form context */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isFirstStep}
              type="button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {isLastStep ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      form.trigger().then((valid) => {
                        if (valid) onPreview(form.getValues());
                      });
                    }}
                    type="button"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={handleSubmit} type="button">
                    Publish Listing
                  </Button>
                </>
              ) : (
                <Button onClick={handleSubmit} type="button">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
