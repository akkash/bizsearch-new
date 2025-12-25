import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/use-profile-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    TrendingUp,
    Plus,
    Eye,
    Settings
} from 'lucide-react';
import { BusinessCard } from '@/polymet/components/business-card';
import { FranchiseCard } from '@/polymet/components/franchise-card';
import type { Business, Franchise } from '@/types/listings';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    // Fetch own data
    const {
        profile,
        listings,
        stats,
        loading
    } = useProfileData(user?.id);

    const [activeTab, setActiveTab] = useState("overview");

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) return null;

    const isSeller = profile.role === 'seller' || profile.roles?.some(r => r.role === 'seller');
    const isFranchisor = profile.role === 'franchisor' || profile.roles?.some(r => r.role === 'franchisor');
    const isBuyer = profile.role === 'buyer' || profile.roles?.some(r => r.role === 'buyer');

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, {profile.display_name}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/profile/${profile.id}`)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Public Profile
                    </Button>
                    {(isSeller || isFranchisor) && (
                        <Button onClick={() => navigate('/create-listing')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Listing
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                <Eye className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.views}</div>
                                <div className="text-sm text-muted-foreground">Total Views</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.inquiries}</div>
                                <div className="text-sm text-muted-foreground">Inquiries Received</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.connections}</div>
                                <div className="text-sm text-muted-foreground">Connections Made</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="listings" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        My Listings
                        <Badge variant="secondary" className="ml-2">{listings.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="inquiries" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Inquiries
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    {/* Fallback to Listings view if they have listings, else simple welcome */}
                    {listings.length > 0 ? (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Your Active Listings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {listings.map(item => {
                                    if ('price' in item) {
                                        return <BusinessCard key={item.id} business={item as Business} onViewDetails={() => navigate(`/business/${item.id}`)} onEdit={() => navigate(`/business/edit/${item.id}`)} />;
                                    } else {
                                        return <FranchiseCard key={item.id} franchise={item as Franchise} onViewDetails={() => navigate(`/franchise/${item.id}`)} />;
                                    }
                                })}
                            </div>
                        </div>
                    ) : (
                        <Card className="bg-muted/50 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-4 bg-background rounded-full mb-4">
                                    <Plus className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No Active Listings</h3>
                                <p className="text-muted-foreground max-w-sm mb-6">
                                    {isBuyer
                                        ? "You haven't set up your Investment Mandate yet. Creating one helps sellers find you."
                                        : "Create your first business listing to start getting inquiries."}
                                </p>
                                {isBuyer ? (
                                    <Button onClick={() => navigate('/buyer/mandate')}>Setup Investment Mandate</Button>
                                ) : (
                                    <Button onClick={() => navigate('/create-listing')}>Create Listing</Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="listings">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map(item => {
                            if ('price' in item) {
                                return <BusinessCard key={item.id} business={item as Business} onViewDetails={() => navigate(`/business/${item.id}`)} />;
                            } else {
                                return <FranchiseCard key={item.id} franchise={item as Franchise} onViewDetails={() => navigate(`/franchise/${item.id}`)} />;
                            }
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="inquiries">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Inquiry Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 space-y-4">
                                <div className="p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
                                    <h3 className="font-medium mb-2">Coming Soon</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Inquiry management will allow you to:
                                    </p>
                                    <ul className="text-sm text-muted-foreground text-left space-y-2">
                                        <li>• View and respond to buyer inquiries</li>
                                        <li>• Track inquiry status (new, responded, negotiating)</li>
                                        <li>• Schedule calls and meetings</li>
                                        <li>• Share documents securely via NDA</li>
                                    </ul>
                                </div>
                                <Button variant="outline" onClick={() => navigate('/messages')}>
                                    View Messages Instead
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            Use "Edit Profile" to change settings for now.
                            <div className="mt-4">
                                <Button variant="outline" onClick={() => navigate('/profile/edit')}>Go to Profile Settings</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
