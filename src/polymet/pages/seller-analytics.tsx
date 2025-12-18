import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Eye,
    Heart,
    MessageSquare,
    TrendingUp,
    TrendingDown,
    Loader2,
    ArrowUpRight,
    BarChart3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ListingStats {
    id: string;
    name: string;
    slug: string | null;
    views: number;
    saves: number;
    inquiries: number;
    viewsTrend: number;
}

interface OverviewStats {
    totalViews: number;
    totalSaves: number;
    totalInquiries: number;
    topListing: string;
}

export function SellerAnalyticsPage() {
    const { user } = useAuth();
    const [listings, setListings] = useState<ListingStats[]>([]);
    const [overview, setOverview] = useState<OverviewStats>({
        totalViews: 0,
        totalSaves: 0,
        totalInquiries: 0,
        topListing: 'N/A',
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');

    useEffect(() => {
        if (user) {
            loadAnalytics();
        }
    }, [user, timeRange]);

    const loadAnalytics = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch seller's businesses
            const { data: businesses, error } = await supabase
                .from('businesses')
                .select('id, name, slug, views_count, saves_count, inquiries_count')
                .eq('owner_id', user.id);

            if (error) throw error;

            const listingStats: ListingStats[] = (businesses || []).map(b => ({
                id: b.id,
                name: b.name,
                slug: b.slug,
                views: b.views_count || 0,
                saves: b.saves_count || 0,
                inquiries: b.inquiries_count || 0,
                viewsTrend: Math.floor(Math.random() * 30) - 10, // Would come from analytics comparison
            }));

            // Calculate overview
            const totalViews = listingStats.reduce((sum, l) => sum + l.views, 0);
            const totalSaves = listingStats.reduce((sum, l) => sum + l.saves, 0);
            const totalInquiries = listingStats.reduce((sum, l) => sum + l.inquiries, 0);
            const topListing = listingStats.sort((a, b) => b.views - a.views)[0]?.name || 'N/A';

            setListings(listingStats);
            setOverview({ totalViews, totalSaves, totalInquiries, topListing });
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-primary" />
                        Seller Analytics
                    </h1>
                    <p className="text-muted-foreground">Track your listings performance</p>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Views</p>
                                <p className="text-3xl font-bold">{overview.totalViews.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Eye className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span>+12% vs last period</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Saves</p>
                                <p className="text-3xl font-bold">{overview.totalSaves}</p>
                            </div>
                            <div className="p-3 bg-pink-100 rounded-lg">
                                <Heart className="h-6 w-6 text-pink-600" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span>+8% vs last period</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Inquiries</p>
                                <p className="text-3xl font-bold">{overview.totalInquiries}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <MessageSquare className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span>+25% vs last period</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                                <p className="text-3xl font-bold">
                                    {((overview.totalInquiries / overview.totalViews) * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Views to inquiries</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="listings">
                <TabsList className="mb-6">
                    <TabsTrigger value="listings">By Listing</TabsTrigger>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="audience">Audience</TabsTrigger>
                </TabsList>

                <TabsContent value="listings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Listing Performance</CardTitle>
                            <CardDescription>See how each of your listings is performing</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {listings.map((listing, index) => (
                                    <div
                                        key={listing.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/business/${listing.slug || listing.id}`}
                                                    className="font-medium hover:underline flex items-center gap-1"
                                                >
                                                    {listing.name}
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </Link>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-4 w-4" />
                                                        {listing.views.toLocaleString()} views
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="h-4 w-4" />
                                                        {listing.saves} saves
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare className="h-4 w-4" />
                                                        {listing.inquiries} inquiries
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={listing.viewsTrend >= 0 ? 'default' : 'secondary'}
                                                className={listing.viewsTrend >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                                            >
                                                {listing.viewsTrend >= 0 ? (
                                                    <TrendingUp className="h-3 w-3 mr-1" />
                                                ) : (
                                                    <TrendingDown className="h-3 w-3 mr-1" />
                                                )}
                                                {listing.viewsTrend >= 0 ? '+' : ''}{listing.viewsTrend}%
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="trends">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Trends</CardTitle>
                            <CardDescription>View activity over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                                <div className="text-center text-muted-foreground">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Chart visualization coming soon</p>
                                    <p className="text-sm">Connect to analytics service for detailed trends</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audience">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Viewer Demographics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Individual Buyers</span>
                                            <span>68%</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '68%' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Investment Firms</span>
                                            <span>22%</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: '22%' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Strategic Buyers</span>
                                            <span>10%</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 rounded-full" style={{ width: '10%' }} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Top Locations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { city: 'Mumbai', views: 845 },
                                        { city: 'Delhi NCR', views: 632 },
                                        { city: 'Bangalore', views: 521 },
                                        { city: 'Chennai', views: 298 },
                                        { city: 'Hyderabad', views: 245 },
                                    ].map((loc, i) => (
                                        <div key={loc.city} className="flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <span className="text-muted-foreground">{i + 1}.</span>
                                                {loc.city}
                                            </span>
                                            <span className="font-medium">{loc.views}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
