import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Building2,
    Eye,
    CheckCircle,
    XCircle,
    Loader2,
    ExternalLink,
} from 'lucide-react';
import { AdminService, type AdminUser } from '@/lib/admin-service';
import { format } from 'date-fns';

const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    seller: 'bg-blue-100 text-blue-800',
    buyer: 'bg-green-100 text-green-800',
    franchisor: 'bg-purple-100 text-purple-800',
    franchisee: 'bg-orange-100 text-orange-800',
    advisor: 'bg-teal-100 text-teal-800',
    broker: 'bg-indigo-100 text-indigo-800',
};

export function AdminUserDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<AdminUser | null>(null);
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [franchises, setFranchises] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (!id) return;
            try {
                const [userData, bizData, franData] = await Promise.all([
                    AdminService.getUserById(id),
                    AdminService.getUserBusinesses(id),
                    AdminService.getUserFranchises(id),
                ]);
                setUser(userData);
                setBusinesses(bizData);
                setFranchises(franData);
            } catch (error) {
                console.error('Error loading user:', error);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">User not found</p>
                <Button variant="link" onClick={() => navigate('/admin/users')}>
                    Back to Users
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/users')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">User Details</h1>
                    <p className="text-muted-foreground">View and manage user information</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Card */}
                <Card className="lg:col-span-1">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <Avatar className="h-24 w-24 mx-auto mb-4">
                                <AvatarImage src={user.avatar_url || ''} />
                                <AvatarFallback className="text-2xl">
                                    {user.display_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-semibold">{user.display_name || 'No name'}</h2>
                            <Badge className={`mt-2 ${roleColors[user.role] || ''}`}>{user.role}</Badge>
                            {user.verified && (
                                <div className="flex items-center justify-center gap-1 mt-2 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm">Verified</span>
                                </div>
                            )}
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{user.phone}</span>
                                </div>
                            )}
                            {(user.city || user.state) && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{[user.city, user.state].filter(Boolean).join(', ')}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                                </span>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-2">
                            <Button variant="outline" className="w-full">
                                <Shield className="h-4 w-4 mr-2" />
                                Change Role
                            </Button>
                            <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                                Ban User
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Listings */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>User Listings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="businesses">
                            <TabsList>
                                <TabsTrigger value="businesses">
                                    Businesses ({businesses.length})
                                </TabsTrigger>
                                <TabsTrigger value="franchises">
                                    Franchises ({franchises.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="businesses" className="mt-4">
                                {businesses.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No businesses</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {businesses.map((biz) => (
                                            <div
                                                key={biz.id}
                                                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium">{biz.name}</p>
                                                    <p className="text-sm text-muted-foreground">{biz.industry}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge
                                                        variant={biz.status === 'active' ? 'default' : 'secondary'}
                                                    >
                                                        {biz.status}
                                                    </Badge>
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link to={`/business/${biz.slug || biz.id}`}>
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="franchises" className="mt-4">
                                {franchises.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No franchises</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {franchises.map((fran) => (
                                            <div
                                                key={fran.id}
                                                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium">{fran.brand_name}</p>
                                                    <p className="text-sm text-muted-foreground">{fran.industry}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge
                                                        variant={fran.status === 'active' ? 'default' : 'secondary'}
                                                    >
                                                        {fran.status}
                                                    </Badge>
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link to={`/franchise/${fran.slug || fran.id}`}>
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
