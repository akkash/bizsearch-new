import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Share2,
  Download,
  Edit,
  Globe,
  MapPin,
  DollarSign,
  Users,
  TrendingUp,
  Building2,
  Clock,
  Shield,
  CheckCircle,
  Star,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import type { FranchiseListingFormValues } from "@/polymet/data/franchise-listing-data";

interface FranchisePreviewProps {
  data: Partial<FranchiseListingFormValues>;
  onEdit?: (step: string) => void;
  onPublish?: () => void;
  onSaveDraft?: () => void;
  className?: string;
}

interface MetaPreview {
  title: string;
  description: string;
  image: string;
  url: string;
}

export function FranchisePreview({
  data,
  onEdit,
  onPublish,
  onSaveDraft,
  className,
}: FranchisePreviewProps) {
  const [activeTab, setActiveTab] = useState("listing");

  // Generate meta tags for social sharing
  const generateMeta = (): MetaPreview => {
    const brandName = data.brandOverview?.brandName || "Franchise Opportunity";
    const tagline = data.brandOverview?.tagline || "";
    const investment = data.investment?.totalInvestment;
    const roi = data.investment?.averageROI;

    const title = `${brandName} Franchise Opportunity | BizSearch`;
    const description = `${tagline} Investment: ₹${investment?.min ? (investment.min / 100000).toFixed(1) : "N/A"}L-${investment?.max ? (investment.max / 100000).toFixed(1) : "N/A"}L | ROI: ${roi || "N/A"}% | Available territories across India`;
    const image =
      data.media?.brandLogo?.[0]?.url || "/api/placeholder/1200/630";
    const url = `https://bizsearch.com/franchise/${brandName.toLowerCase().replace(/\s+/g, "-")}`;

    return { title, description, image, url };
  };

  const meta = generateMeta();

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const getCompletionPercentage = () => {
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

  const completionPercentage = getCompletionPercentage();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Preview Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Franchise Listing Preview
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {completionPercentage}% complete • Review your listing before
                publishing
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onSaveDraft}>
                Save Draft
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Preview
              </Button>
              <Button onClick={onPublish} disabled={completionPercentage < 80}>
                Publish Listing
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Preview Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="listing">Listing View</TabsTrigger>
          <TabsTrigger value="card">Card View</TabsTrigger>
          <TabsTrigger value="social">Social Preview</TabsTrigger>
          <TabsTrigger value="mobile">Mobile View</TabsTrigger>
        </TabsList>

        {/* Full Listing Preview */}
        <TabsContent value="listing" className="space-y-6">
          <Card>
            <CardContent className="p-8">
              {/* Hero Section */}
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">
                        {data.brandOverview?.brandName || "Franchise Name"}
                      </h1>
                      <Badge variant="secondary">Franchise Opportunity</Badge>
                      {data.publishing?.featuredListing && (
                        <Badge className="bg-yellow-500">Featured</Badge>
                      )}
                    </div>
                    <p className="text-xl text-muted-foreground mb-4">
                      {data.brandOverview?.tagline || "Brand tagline"}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />

                        <span>Est. {data.brandOverview?.yearEstablished}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />

                        <span>{data.brandOverview?.totalOutlets} outlets</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />

                        <span>{data.brandOverview?.industry?.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                  {data.media?.brandLogo?.[0] && (
                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                      <img
                        src={data.media.brandLogo[0].url}
                        alt="Brand Logo"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {data.investment?.totalInvestment
                        ? `${formatCurrency(data.investment.totalInvestment.min)}-${formatCurrency(data.investment.totalInvestment.max)}`
                        : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Investment Range
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {data.investment?.averageROI || "N/A"}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average ROI
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {data.investment?.breakEvenPeriod || "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Break-even (months)
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {data.territory?.selectedTerritories?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Available Territories
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Description */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">
                    About the Franchise
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {data.description?.brandDescription ||
                      "Brand description will appear here..."}
                  </p>
                </div>

                {/* USPs */}
                {data.description?.uniqueSellingPoints && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Unique Selling Points
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {data.description.uniqueSellingPoints.map(
                        (usp, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />

                            <span className="text-sm">{usp}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Investment Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Investment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Franchise Fee:</span>
                        <span className="font-medium">
                          {data.investment?.franchiseFee
                            ? formatCurrency(data.investment.franchiseFee)
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Liquid Capital:</span>
                        <span className="font-medium">
                          {data.investment?.liquidCapitalRequired
                            ? formatCurrency(
                                data.investment.liquidCapitalRequired
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Royalty:</span>
                        <span className="font-medium">
                          {data.investment?.royaltyStructure?.baseTiers?.[0]
                            ?.percentage || "N/A"}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Marketing Fee:</span>
                        <span className="font-medium">
                          {data.investment?.marketingFee?.value || "N/A"}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support & Training */}
                {data.support && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Support & Training
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Training Duration</h4>
                        <p className="text-sm text-muted-foreground">
                          {data.support.initialTrainingDuration} days
                          comprehensive training program
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Ongoing Support</h4>
                        <div className="flex flex-wrap gap-1">
                          {data.support.ongoingSupport
                            ?.slice(0, 3)
                            .map((support, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {support}
                              </Badge>
                            ))}
                          {data.support.ongoingSupport &&
                            data.support.ongoingSupport.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{data.support.ongoingSupport.length - 3} more
                              </Badge>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                {data.contact && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />

                          <span className="font-medium">
                            {data.contact.primaryContact?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />

                          <span className="text-sm">
                            {data.contact.primaryContact?.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />

                          <span className="text-sm">
                            {data.contact.primaryContact?.phone}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />

                          <div className="text-sm">
                            <div>{data.contact.companyAddress?.street}</div>
                            <div>
                              {data.contact.companyAddress?.city},{" "}
                              {data.contact.companyAddress?.state}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Card Preview */}
        <TabsContent value="card">
          <Card className="max-w-md mx-auto">
            <div className="relative">
              {data.media?.outletPhotos?.[0] && (
                <img
                  src={data.media.outletPhotos[0].url}
                  alt="Franchise"
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary">Franchise</Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Button size="sm" variant="secondary">
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {data.brandOverview?.brandName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {data.brandOverview?.tagline}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Investment:</span>
                  <span>
                    {data.investment?.totalInvestment
                      ? `${formatCurrency(data.investment.totalInvestment.min)}-${formatCurrency(data.investment.totalInvestment.max)}`
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">ROI:</span>
                  <span className="text-green-600">
                    {data.investment?.averageROI || "N/A"}%
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />

                  <span>
                    {data.territory?.selectedTerritories?.length || 0}{" "}
                    territories available
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    Contact
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Preview */}
        <TabsContent value="social" className="space-y-6">
          {/* Facebook Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Facebook Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden max-w-lg">
                <img
                  src={meta.image}
                  alt="Social preview"
                  className="w-full h-48 object-cover"
                />

                <div className="p-4 bg-gray-50">
                  <div className="text-xs text-gray-500 uppercase mb-1">
                    bizsearch.com
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{meta.title}</h3>
                  <p className="text-xs text-gray-600">{meta.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Twitter Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Twitter Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden max-w-lg">
                <img
                  src={meta.image}
                  alt="Social preview"
                  className="w-full h-40 object-cover"
                />

                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1">{meta.title}</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {meta.description}
                  </p>
                  <div className="text-xs text-gray-500">bizsearch.com</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LinkedIn Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">LinkedIn Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden max-w-lg">
                <img
                  src={meta.image}
                  alt="Social preview"
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  <h3 className="font-semibold mb-1">{meta.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {meta.description}
                  </p>
                  <div className="text-xs text-gray-500">bizsearch.com</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile Preview */}
        <TabsContent value="mobile">
          <div className="max-w-sm mx-auto">
            <div className="border rounded-lg overflow-hidden bg-white shadow-lg">
              {/* Mobile Header */}
              <div className="bg-primary text-primary-foreground p-4">
                <h2 className="font-semibold text-lg">
                  {data.brandOverview?.brandName}
                </h2>
                <p className="text-sm opacity-90">
                  {data.brandOverview?.tagline}
                </p>
              </div>

              {/* Mobile Content */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-muted rounded">
                    <div className="font-semibold text-sm">Investment</div>
                    <div className="text-xs text-muted-foreground">
                      {data.investment?.totalInvestment
                        ? `${formatCurrency(data.investment.totalInvestment.min)}-${formatCurrency(data.investment.totalInvestment.max)}`
                        : "N/A"}
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="font-semibold text-sm">ROI</div>
                    <div className="text-xs text-muted-foreground">
                      {data.investment?.averageROI || "N/A"}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Key Features</h3>
                  <div className="space-y-1">
                    {data.description?.uniqueSellingPoints
                      ?.slice(0, 3)
                      .map((usp, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="h-3 w-3 text-green-600" />

                          <span>{usp}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <Button className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Now
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Listing completion: {completionPercentage}%
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onEdit?.("overview")}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Listing
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={onPublish} disabled={completionPercentage < 80}>
                Publish Listing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
