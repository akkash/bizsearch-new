import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { franchisesData } from "@/polymet/data/franchises-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  AlertTriangleIcon,
  DownloadIcon,
  PlayCircleIcon,
  CheckCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FranchiseDetailProps {
  className?: string;
}

export function FranchiseDetail({ className }: FranchiseDetailProps) {
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Find franchise by ID (in real app, this would be an API call)
  const franchise =
    franchisesData.find((f) => f.id === id) || franchisesData[0];

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
                onClick={
                  () =>
                    console.warn(
                      "Prevented function call: `window.history.back()`"
                    ) /*TODO: Do not use window.history for navigation. Use react-router instead.*/
                }
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Franchises
              </Button>
              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-3">
                <img
                  src={franchise.logo}
                  alt={franchise.brandName}
                  className="w-10 h-10 rounded-lg object-cover"
                />

                <div>
                  <h1 className="text-xl font-bold">{franchise.brandName}</h1>
                  <p className="text-sm text-muted-foreground">
                    {franchise.industry} • Est. {franchise.establishedYear}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                Request Info
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Brand Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img
                    src={images[selectedImage]}
                    alt={franchise.brandName}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/70 text-white">
                      {selectedImage + 1} / {images.length}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Button size="sm" variant="secondary" className="gap-2">
                      <PlayCircleIcon className="h-4 w-4" />
                      Watch Video
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          "flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2",
                          selectedImage === index
                            ? "border-primary"
                            : "border-muted"
                        )}
                      >
                        <img
                          src={image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Franchise Details */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="investment">Investment</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
                <TabsTrigger value="territory">Territory</TabsTrigger>
                <TabsTrigger value="projections">ROI</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Brand Story</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {franchise.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                      <div className="text-center">
                        <CalendarIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />

                        <div className="text-sm font-medium">Established</div>
                        <div className="text-lg font-bold">2015</div>
                      </div>
                      <div className="text-center">
                        <BuildingIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />

                        <div className="text-sm font-medium">Outlets</div>
                        <div className="text-lg font-bold">
                          {franchise.outlets}
                        </div>
                      </div>
                      <div className="text-center">
                        <TrendingUpIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />

                        <div className="text-sm font-medium">Expected ROI</div>
                        <div className="text-lg font-bold text-green-600">
                          25-35%
                        </div>
                      </div>
                      <div className="text-center">
                        <IndianRupeeIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />

                        <div className="text-sm font-medium">Royalty</div>
                        <div className="text-lg font-bold">
                          {franchise.royaltyPercentage}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Competitive Advantages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(franchise.competitiveEdge || []).map(
                        (advantage, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />

                            <span className="text-sm">{advantage}</span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Franchise Model</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <BuildingIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Business Format</h4>
                        <p className="text-sm text-muted-foreground">
                          Complete business system with proven operations
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <UsersIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <h4 className="font-semibold mb-2">
                          Training & Support
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Comprehensive training and ongoing support
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <TrendingUpIcon className="h-8 w-8 text-purple-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Growth Potential</h4>
                        <p className="text-sm text-muted-foreground">
                          Scalable business with expansion opportunities
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="investment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {investmentBreakdown.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{item.item}</span>
                            <span className="font-bold">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />

                          <div className="text-right text-sm text-muted-foreground">
                            {item.percentage}% of total investment
                          </div>
                        </div>
                      ))}
                      <Separator />

                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Investment</span>
                        <span className="text-primary">
                          {formatCurrency(totalInvestment)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ongoing Fees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {franchise.royaltyPercentage}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Royalty Fee
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Monthly on gross revenue
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          2%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Marketing Fee
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          National advertising fund
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          1%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Technology Fee
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          POS & software systems
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="support" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Training & Support Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {supportServices.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />

                            <div>
                              <div className="font-medium">
                                {service.service}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {service.duration}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary">Included</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ongoing Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">
                          Operational Support
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Regular business reviews</li>
                          <li>• Performance monitoring</li>
                          <li>• Operational guidance</li>
                          <li>• Quality assurance</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">
                          Marketing Support
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li>• National advertising campaigns</li>
                          <li>• Local marketing materials</li>
                          <li>• Digital marketing support</li>
                          <li>• Brand guidelines</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="territory" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Territory Availability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">City</th>
                            <th className="text-center py-2">Status</th>
                            <th className="text-right py-2">Population</th>
                            <th className="text-right py-2">Competition</th>
                          </tr>
                        </thead>
                        <tbody>
                          {territoryInfo.map((territory, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2 font-medium">
                                {territory.city}
                              </td>
                              <td className="text-center py-2">
                                <Badge
                                  variant={
                                    territory.status === "Available"
                                      ? "default"
                                      : territory.status === "Limited"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  {territory.status}
                                </Badge>
                              </td>
                              <td className="text-right py-2">
                                {territory.population}
                              </td>
                              <td className="text-right py-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    territory.competition === "Low"
                                      ? "text-green-600"
                                      : territory.competition === "Medium"
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }
                                >
                                  {territory.competition}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Territory Rights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Exclusive Rights</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Protected territory radius</li>
                          <li>• Population-based exclusivity</li>
                          <li>• Non-compete protection</li>
                          <li>• Expansion opportunities</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">
                          Multi-Unit Development
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Area development agreements</li>
                          <li>• Reduced franchise fees</li>
                          <li>• Accelerated growth plans</li>
                          <li>• Regional master franchise</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projections" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>5-Year ROI Projections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Year</th>
                            <th className="text-right py-2">Revenue</th>
                            <th className="text-right py-2">Profit</th>
                            <th className="text-right py-2">ROI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roiProjections.map((projection, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2 font-medium">
                                {typeof projection.year === "string"
                                  ? projection.year
                                  : `Year ${projection.year}`}
                              </td>
                              <td className="text-right py-2">
                                {formatCurrency(
                                  typeof projection.revenue === "number"
                                    ? projection.revenue
                                    : projection.revenue
                                )}
                              </td>
                              <td className="text-right py-2 text-green-600">
                                {formatCurrency(
                                  typeof projection.profit === "number"
                                    ? projection.profit
                                    : projection.profit
                                )}
                              </td>
                              <td className="text-right py-2 font-bold">
                                {typeof projection.roi === "string"
                                  ? projection.roi
                                  : `${projection.roi}%`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Break-Even Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          18
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Months to Break-Even
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          25%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Average Profit Margin
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          3.2x
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Investment Multiple
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(totalInvestment)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Investment
                  </div>
                </div>
                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Franchise Fee</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(franchise.franchiseFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Royalty</span>
                    <span className="text-sm font-medium">
                      {franchise.royaltyPercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Expected ROI</span>
                    <span className="text-sm font-medium text-green-600">
                      25-35%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Payback Period</span>
                    <span className="text-sm font-medium">18 months</span>
                  </div>
                </div>
                <Button className="w-full" onClick={handleContact}>
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Request Information
                </Button>
              </CardContent>
            </Card>

            {/* Verification Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Verification & Awards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {franchise.badges.map((badge, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="w-full justify-start"
                    >
                      <ShieldCheckIcon className="h-3 w-3 mr-2" />

                      {badge}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Total Outlets</span>
                  <span className="font-medium">{franchise.outlets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Countries</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-medium text-green-600">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg. Rating</span>
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 fill-current text-yellow-500" />

                    <span className="font-medium">4.7</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Franchise Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-muted-foreground" />

                  <span className="text-sm">+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-muted-foreground" />

                  <span className="text-sm">Mumbai, Maharashtra</span>
                </div>
                <Button variant="outline" className="w-full">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download Brochure
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Form Dialog */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Franchise Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+91 98765 43210" />
            </div>
            <div>
              <Label htmlFor="investment">Available Investment</Label>
              <Input id="investment" placeholder="₹25,00,000" />
            </div>
            <div>
              <Label htmlFor="location">Preferred Location</Label>
              <Input id="location" placeholder="Mumbai, Delhi, Bangalore..." />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="I'm interested in learning more about this franchise opportunity..."
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Send Request</Button>
              <Button
                variant="outline"
                onClick={() => setShowContactForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
