import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Users,
    Search,
    MapPin,
    Star,
    Award,
    Building2,
    MessageSquare,
    Phone,
    CheckCircle,
    TrendingUp,
    Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Advisor {
    id: string;
    name: string;
    avatar_url: string | null;
    title: string;
    company: string | null;
    location: string;
    specializations: string[];
    deals_closed: number;
    total_value: number;
    rating: number;
    reviews: number;
    verified: boolean;
    featured: boolean;
    years_experience: number;
    bio: string;
}

export function AdvisorDirectoryPage() {
    const [advisors, setAdvisors] = useState<Advisor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');
    const [specialtyFilter, setSpecialtyFilter] = useState('all');

    useEffect(() => {
        loadAdvisors();
    }, []);

    const loadAdvisors = async () => {
        setLoading(true);
        try {
            // Fetch from advisor_profiles joined with profiles
            const { data, error } = await supabase
                .from('advisor_profiles')
                .select(`
                    id,
                    title,
                    company,
                    location,
                    specializations,
                    deals_closed,
                    total_value,
                    rating,
                    reviews_count,
                    verified,
                    featured,
                    years_experience,
                    bio,
                    profile:profiles(display_name, avatar_url)
                `)
                .order('featured', { ascending: false })
                .order('rating', { ascending: false });

            if (error) throw error;

            const formattedAdvisors: Advisor[] = (data || []).map((a: any) => ({
                id: a.id,
                name: a.profile?.display_name || 'Unknown Advisor',
                avatar_url: a.profile?.avatar_url,
                title: a.title || 'Business Advisor',
                company: a.company,
                location: a.location || 'India',
                specializations: a.specializations || [],
                deals_closed: a.deals_closed || 0,
                total_value: a.total_value || 0,
                rating: parseFloat(a.rating) || 0,
                reviews: a.reviews_count || 0,
                verified: a.verified || false,
                featured: a.featured || false,
                years_experience: a.years_experience || 0,
                bio: a.bio || '',
            }));

            setAdvisors(formattedAdvisors);
        } catch (error) {
            console.error('Error loading advisors:', error);
            // Fallback to empty array
            setAdvisors([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(0)} Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(0)} L`;
        return `₹${value.toLocaleString()}`;
    };

    const filteredAdvisors = advisors.filter(advisor => {
        const matchesSearch = advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            advisor.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesLocation = locationFilter === 'all' || advisor.location.includes(locationFilter);
        const matchesSpecialty = specialtyFilter === 'all' || advisor.specializations.includes(specialtyFilter);
        return matchesSearch && matchesLocation && matchesSpecialty;
    });

    const featuredAdvisors = filteredAdvisors.filter(a => a.featured);
    const otherAdvisors = filteredAdvisors.filter(a => !a.featured);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Find a Business Advisor</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Connect with verified brokers and advisors to help you buy, sell, or invest in businesses and franchises
                </p>
            </div>

            {/* Filters */}
            <Card className="mb-8">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or specialty..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Locations</SelectItem>
                                <SelectItem value="Mumbai">Mumbai</SelectItem>
                                <SelectItem value="Delhi">Delhi NCR</SelectItem>
                                <SelectItem value="Bangalore">Bangalore</SelectItem>
                                <SelectItem value="Pune">Pune</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Specialty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Specialties</SelectItem>
                                <SelectItem value="Technology">Technology</SelectItem>
                                <SelectItem value="Franchises">Franchises</SelectItem>
                                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                <SelectItem value="Retail">Retail</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Featured Advisors */}
            {featuredAdvisors.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        Featured Advisors
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {featuredAdvisors.map((advisor) => (
                            <Card key={advisor.id} className="overflow-hidden border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={advisor.avatar_url || ''} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                                                {advisor.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                                        {advisor.name}
                                                        {advisor.verified && (
                                                            <CheckCircle className="h-4 w-4 text-blue-500" />
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">{advisor.title}</p>
                                                    {advisor.company && (
                                                        <p className="text-sm text-muted-foreground">{advisor.company}</p>
                                                    )}
                                                </div>
                                                <Badge className="bg-yellow-100 text-yellow-800">
                                                    <Award className="h-3 w-3 mr-1" />
                                                    Featured
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-4 mt-3 text-sm">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    {advisor.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    {advisor.rating} ({advisor.reviews})
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {advisor.specializations.map((spec, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {spec}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-6 mt-4 text-sm">
                                                <div>
                                                    <p className="font-semibold text-primary">{advisor.deals_closed}</p>
                                                    <p className="text-xs text-muted-foreground">Deals Closed</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{formatCurrency(advisor.total_value)}</p>
                                                    <p className="text-xs text-muted-foreground">Total Value</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{advisor.years_experience} yrs</p>
                                                    <p className="text-xs text-muted-foreground">Experience</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <Button size="sm">
                                                    <MessageSquare className="h-4 w-4 mr-1" />
                                                    Contact
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    View Profile
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* All Advisors */}
            <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    All Advisors ({otherAdvisors.length})
                </h2>
                <div className="space-y-4">
                    {otherAdvisors.map((advisor) => (
                        <Card key={advisor.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-14 w-14">
                                        <AvatarImage src={advisor.avatar_url || ''} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                            {advisor.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold flex items-center gap-2">
                                                    {advisor.name}
                                                    {advisor.verified && (
                                                        <CheckCircle className="h-4 w-4 text-blue-500" />
                                                    )}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {advisor.title} {advisor.company && `at ${advisor.company}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm">
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                <span className="font-medium">{advisor.rating}</span>
                                                <span className="text-muted-foreground">({advisor.reviews})</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {advisor.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <TrendingUp className="h-4 w-4" />
                                                {advisor.deals_closed} deals
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Building2 className="h-4 w-4" />
                                                {formatCurrency(advisor.total_value)} value
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {advisor.specializations.map((spec, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
                                                    {spec}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                            <Phone className="h-4 w-4 mr-1" />
                                            Call
                                        </Button>
                                        <Button size="sm">
                                            <MessageSquare className="h-4 w-4 mr-1" />
                                            Message
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {filteredAdvisors.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="font-medium text-lg mb-2">No Advisors Found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
