import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessService } from "@/lib/business-service";
import { FranchiseService } from "@/lib/franchise-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Store,
  Briefcase,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Helper function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

interface MyListingsPageProps {
  className?: string;
}

const statusConfig = {
  draft: {
    label: "Draft",
    icon: Edit,
    color: "text-gray-500 bg-gray-100",
  },
  pending_review: {
    label: "Under Review",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-100",
  },
  active: {
    label: "Active",
    icon: CheckCircle,
    color: "text-green-600 bg-green-100",
  },
  inactive: {
    label: "Inactive",
    icon: AlertCircle,
    color: "text-gray-600 bg-gray-100",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-600 bg-red-100",
  },
  sold: {
    label: "Sold",
    icon: CheckCircle,
    color: "text-blue-600 bg-blue-100",
  },
};

export function MyListingsPage({ className }: MyListingsPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/my-listings');
      return;
    }

    loadListings();
  }, [user, navigate]);

  const loadListings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [businessData, franchiseData] = await Promise.all([
        BusinessService.getUserBusinesses(user.id),
        FranchiseService.getUserFranchises(user.id),
      ]);
      
      setBusinesses(businessData || []);
      setFranchises(franchiseData || []);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant="secondary" className={cn("gap-1", config.color)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const BusinessCard = ({ business }: { business: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{business.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {business.city}, {business.state}
            </p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(business.price)}
            </p>
          </div>
          <StatusBadge status={business.status} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground mb-3">
          <div>
            <div className="text-xs">Industry</div>
            <div className="font-medium text-foreground">{business.industry}</div>
          </div>
          <div>
            <div className="text-xs">Views</div>
            <div className="font-medium text-foreground">{business.views_count || 0}</div>
          </div>
          <div>
            <div className="text-xs">Inquiries</div>
            <div className="font-medium text-foreground">{business.inquiries_count || 0}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/business/${business.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </Link>
          <Button variant="outline" size="sm" disabled>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const FranchiseCard = ({ franchise }: { franchise: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{franchise.brand_name}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {franchise.headquarters_city}, {franchise.headquarters_state}
            </p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(franchise.franchise_fee)}
            </p>
          </div>
          <StatusBadge status={franchise.status} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground mb-3">
          <div>
            <div className="text-xs">Industry</div>
            <div className="font-medium text-foreground">{franchise.industry}</div>
          </div>
          <div>
            <div className="text-xs">Views</div>
            <div className="font-medium text-foreground">{franchise.views_count || 0}</div>
          </div>
          <div>
            <div className="text-xs">Applications</div>
            <div className="font-medium text-foreground">{franchise.applications_count || 0}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/franchise/${franchise.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </Link>
          <Button variant="outline" size="sm" disabled>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn("container mx-auto px-4 py-8", className)}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your listings...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalListings = businesses.length + franchises.length;

  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Listings</h1>
        <p className="text-muted-foreground">
          Manage your business and franchise listings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Listings</p>
                <p className="text-2xl font-bold">{totalListings}</p>
              </div>
              <Store className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Businesses</p>
                <p className="text-2xl font-bold">{businesses.length}</p>
              </div>
              <Store className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Franchises</p>
                <p className="text-2xl font-bold">{franchises.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {businesses.filter(b => b.status === 'active').length + 
                   franchises.filter(f => f.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings */}
      {totalListings === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by creating your first business or franchise listing
              </p>
              <div className="flex gap-3 justify-center">
                <Link to="/add-business-listing">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    List a Business
                  </Button>
                </Link>
                <Link to="/add-franchise-listing">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    List a Franchise
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All ({totalListings})
            </TabsTrigger>
            <TabsTrigger value="businesses">
              Businesses ({businesses.length})
            </TabsTrigger>
            <TabsTrigger value="franchises">
              Franchises ({franchises.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))}
              {franchises.map(franchise => (
                <FranchiseCard key={franchise.id} franchise={franchise} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="businesses" className="space-y-4">
            {businesses.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No business listings yet</p>
                  <Link to="/add-business-listing">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Business Listing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map(business => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="franchises" className="space-y-4">
            {franchises.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No franchise listings yet</p>
                  <Link to="/add-franchise-listing">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Franchise Listing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {franchises.map(franchise => (
                  <FranchiseCard key={franchise.id} franchise={franchise} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
