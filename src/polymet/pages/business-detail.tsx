import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BusinessService } from "@/lib/business-service";
import { MessagingService } from "@/lib/messaging-service";
import { useAuth } from "@/contexts/AuthContext";
import type { Business } from "@/polymet/data/businesses-data";
import { toast } from "sonner";
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
  FileTextIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  DownloadIcon,
  MessageSquareIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIInsights } from "@/polymet/components/ai-insights";

interface BusinessDetailProps {
  className?: string;
}

export function BusinessDetail({ className }: BusinessDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [startingConversation, setStartingConversation] = useState(false);

  // Fetch business from Supabase
  useEffect(() => {
    const fetchBusiness = async () => {
      if (!id) return;
      setLoading(true);
      const result = await BusinessService.getBusinessById(id);
      if (result && !Array.isArray(result)) {
        setBusiness(result as Business);
      }
      setLoading(false);
    };
    fetchBusiness();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Business Not Found</h2>
          <p className="text-muted-foreground">The business you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  const financialData = business.financials || [
    {
      year: 2023,
      revenue: business.revenue ?? 0,
      profit: (business.revenue ?? 0) * 0.15,
      expenses: (business.revenue ?? 0) * 0.85,
    },
    {
      year: 2022,
      revenue: (business.revenue ?? 0) * 0.9,
      profit: (business.revenue ?? 0) * 0.9 * 0.12,
      expenses: (business.revenue ?? 0) * 0.9 * 0.88,
    },
    {
      year: 2021,
      revenue: (business.revenue ?? 0) * 0.8,
      profit: (business.revenue ?? 0) * 0.8 * 0.1,
      expenses: (business.revenue ?? 0) * 0.8 * 0.9,
    },
  ];

  const assets = [
    {
      type: "Equipment & Machinery",
      value: business.price * 0.4,
      description: "Manufacturing equipment, computers, furniture",
    },
    {
      type: "Inventory",
      value: business.price * 0.2,
      description: "Raw materials, finished goods, supplies",
    },
    {
      type: "Real Estate",
      value: business.price * 0.3,
      description: "Office space, warehouse, retail locations",
    },
    {
      type: "Intangible Assets",
      value: business.price * 0.1,
      description: "Brand value, patents, customer database",
    },
  ];

  const documents = [
    { name: "Financial Statements (3 years)", type: "PDF", protected: false },
    { name: "Tax Returns", type: "PDF", protected: true },
    { name: "Asset Inventory", type: "Excel", protected: false },
    { name: "Customer Contracts", type: "PDF", protected: true },
    { name: "Employee Records", type: "PDF", protected: true },
    { name: "Legal Documents", type: "PDF", protected: true },
  ];

  const images =
    business.images && business.images.length > 0
      ? business.images
      : [
        business.logo ||
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop",
      ];

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: business.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleContact = () => {
    setShowContactForm(true);
  };

  const handleMessage = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/business/${id}` } });
      return;
    }
    if (!business?.seller_id && !business?.owner_id) {
      toast.error('Unable to message seller');
      return;
    }
    setStartingConversation(true);
    try {
      const sellerId = business.seller_id || business.owner_id;
      const conversationId = await MessagingService.getOrCreateConversation(
        user.id,
        sellerId!,
        business.id,
        'business'
      );
      if (conversationId) {
        navigate(`/messages?conversation=${conversationId}`);
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setStartingConversation(false);
    }
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
                Back to Listings
              </Button>
              <Separator orientation="vertical" className="h-6" />

              <div>
                <h1 className="text-xl font-bold">{business.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {business.industry} • {business.location}
                </p>
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
              <Button variant="outline" size="sm" onClick={handleMessage} disabled={startingConversation}>
                <MessageSquareIcon className="h-4 w-4 mr-2" />
                {startingConversation ? 'Starting...' : 'Message'}
              </Button>
              <Button onClick={handleContact}>
                <PhoneIcon className="h-4 w-4 mr-2" />
                Contact Seller
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img
                    src={images[selectedImage]}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/70 text-white">
                      {selectedImage + 1} / {images.length}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((image: any, index: number) => (
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

            {/* Business Details */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="operations">Operations</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Description</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {business.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                      <div className="text-center">
                        <CalendarIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />

                        <div className="text-sm font-medium">Established</div>
                        <div className="text-lg font-bold">
                          {business.establishedYear}
                        </div>
                      </div>
                      <div className="text-center">
                        <UsersIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />

                        <div className="text-sm font-medium">Employees</div>
                        <div className="text-lg font-bold">
                          {business.employees}
                        </div>
                      </div>
                      <div className="text-center">
                        <TrendingUpIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />

                        <div className="text-sm font-medium">
                          Annual Revenue
                        </div>
                        <div className="text-lg font-bold">
                          {business.revenue ? formatCurrency(business.revenue) : 'N/A'}
                        </div>
                      </div>
                      <div className="text-center">
                        <IndianRupeeIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />

                        <div className="text-sm font-medium">Asking Price</div>
                        <div className="text-lg font-bold">
                          {formatCurrency(business.price)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Strengths</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Established customer base</li>
                          <li>• Strong market position</li>
                          <li>• Experienced team</li>
                          <li>• Growth potential</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Opportunities</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Digital transformation</li>
                          <li>• Market expansion</li>
                          <li>• Product diversification</li>
                          <li>• Operational efficiency</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <AIInsights
                  type="business"
                  businessId={business.id}
                  businessName={business.name}
                  price={business.price}
                  revenue={business.revenue}
                  industry={business.industry}
                  location={business.location}
                />
              </TabsContent>

              <TabsContent value="financials" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Performance (Last 3 Years)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Year</th>
                            <th className="text-right py-2">Revenue</th>
                            <th className="text-right py-2">Profit</th>
                            <th className="text-right py-2">Expenses</th>
                            <th className="text-right py-2">Margin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financialData.map((year) => (
                            <tr key={year.year} className="border-b">
                              <td className="py-2 font-medium">{year.year}</td>
                              <td className="text-right py-2">
                                {year.revenue ? formatCurrency(year.revenue) : 'N/A'}
                              </td>
                              <td className="text-right py-2 text-green-600">
                                {year.profit ? formatCurrency(year.profit) : 'N/A'}
                              </td>
                              <td className="text-right py-2">
                                {year.expenses ? formatCurrency(year.expenses) : 'N/A'}
                              </td>
                              <td className="text-right py-2">
                                {year.revenue ? ((year.profit / year.revenue) * 100).toFixed(1) : '0.0'}%
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
                    <CardTitle>Financial Ratios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          15%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Profit Margin
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          2.5x
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Revenue Multiple
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          18%
                        </div>
                        <div className="text-sm text-muted-foreground">ROI</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          6.7x
                        </div>
                        <div className="text-sm text-muted-foreground">
                          EBITDA Multiple
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assets" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assets.map((asset, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold">{asset.type}</h4>
                            <p className="text-sm text-muted-foreground">
                              {asset.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {formatCurrency(asset.value)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {((asset.value / business.price) * 100).toFixed(
                                1
                              )}
                              %
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="operations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Operational Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Business Hours</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Monday - Friday</span>
                            <span>9:00 AM - 6:00 PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Saturday</span>
                            <span>9:00 AM - 2:00 PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sunday</span>
                            <span>Closed</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Key Customers</h4>
                        <div className="space-y-2 text-sm">
                          <div>• Enterprise clients (60%)</div>
                          <div>• SME businesses (30%)</div>
                          <div>• Individual customers (10%)</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3">Reason for Sale</h4>
                      <p className="text-muted-foreground">
                        Owner retiring after 15 successful years. Looking for
                        the right buyer to continue the legacy and grow the
                        business further.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileTextIcon className="h-5 w-5" />
                      Available Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileTextIcon className="h-5 w-5 text-muted-foreground" />

                            <div>
                              <div className="font-medium">{doc.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {doc.type}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.protected && (
                              <Badge variant="outline" className="text-xs">
                                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                                NDA Required
                              </Badge>
                            )}
                            <Button size="sm" variant="outline">
                              <DownloadIcon className="h-4 w-4 mr-1" />

                              {doc.protected ? "Request" : "Download"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangleIcon className="h-5 w-5 text-amber-500 mt-0.5" />

                        <div className="text-sm">
                          <div className="font-medium">Document Access</div>
                          <div className="text-muted-foreground">
                            Some documents require signing an NDA. Contact the
                            seller to request access to protected documents.
                          </div>
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
            {/* Price & Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(business.price)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Asking Price
                  </div>
                </div>
                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Annual Revenue</span>
                    <span className="text-sm font-medium">
                      {business.revenue ? formatCurrency(business.revenue) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Revenue Multiple</span>
                    <span className="text-sm font-medium">2.5x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Expected ROI</span>
                    <span className="text-sm font-medium text-green-600">
                      18%
                    </span>
                  </div>
                </div>
                <Button className="w-full" onClick={handleContact}>
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Contact Seller
                </Button>
              </CardContent>
            </Card>

            {/* Verification Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {business.badges && business.badges.map((badge: any, index: number) => (
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

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm font-medium">{business.location}</div>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPinIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />

                      <div className="text-sm text-muted-foreground">
                        Interactive Map
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Form Dialog */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Seller</DialogTitle>
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
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="I'm interested in learning more about this business..."
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Send Message</Button>
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
