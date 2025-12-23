import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    Building2,
    Calendar,
    MessageSquare,
    Loader2,
    ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow, format } from 'date-fns';

interface Application {
    id: string;
    franchise_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    personal_info: any;
    franchise: {
        brand_name: string;
        logo_url: string | null;
        slug: string | null;
    };
}

const statusConfig: Record<string, { color: string; icon: any; label: string; progress: number }> = {
    submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Submitted', progress: 20 },
    under_review: { color: 'bg-yellow-100 text-yellow-800', icon: FileText, label: 'Under Review', progress: 40 },
    interview_scheduled: { color: 'bg-purple-100 text-purple-800', icon: Calendar, label: 'Interview Scheduled', progress: 60 },
    approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved', progress: 100 },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected', progress: 100 },
    withdrawn: { color: 'bg-gray-100 text-gray-600', icon: XCircle, label: 'Withdrawn', progress: 0 },
};

export function MyApplicationsPage() {
    const { user } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const loadApplications = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from('franchise_applications')
                .select(`
          id,
          franchise_id,
          status,
          created_at,
          updated_at,
          personal_info,
          franchise:franchises (
            brand_name,
            logo_url,
            slug
          )
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setApplications(data as unknown as Application[]);
            }
            setLoading(false);
        };

        loadApplications();
    }, [user]);

    const filteredApplications = applications.filter(app => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['submitted', 'under_review', 'interview_scheduled'].includes(app.status);
        if (filter === 'completed') return ['approved', 'rejected', 'withdrawn'].includes(app.status);
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-5xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">My Applications</h1>
                    <p className="text-muted-foreground">Track your franchise applications</p>
                </div>
                <Button asChild>
                    <Link to="/franchises">
                        <Building2 className="h-4 w-4 mr-2" />
                        Browse Franchises
                    </Link>
                </Button>
            </div>

            <Tabs value={filter} onValueChange={setFilter} className="mb-6">
                <TabsList>
                    <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
                    <TabsTrigger value="active">
                        Active ({applications.filter(a => ['submitted', 'under_review', 'interview_scheduled'].includes(a.status)).length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        Completed ({applications.filter(a => ['approved', 'rejected', 'withdrawn'].includes(a.status)).length})
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {filteredApplications.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="font-medium text-lg mb-2">No Applications Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            {filter === 'all'
                                ? "You haven't applied to any franchises yet"
                                : `No ${filter} applications`}
                        </p>
                        <Button asChild>
                            <Link to="/franchises">Explore Franchises</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredApplications.map((app) => {
                        const status = statusConfig[app.status] || statusConfig.submitted;
                        const StatusIcon = status.icon;

                        return (
                            <Card key={app.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Logo */}
                                        <div className="flex-shrink-0">
                                            {app.franchise?.logo_url ? (
                                                <img
                                                    src={app.franchise.logo_url}
                                                    alt={app.franchise.brand_name}
                                                    className="w-16 h-16 object-contain rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                                                    <Building2 className="h-8 w-8 text-primary" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{app.franchise?.brand_name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Applied {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                <Badge className={status.color}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {status.label}
                                                </Badge>
                                            </div>

                                            {/* Progress */}
                                            {!['approved', 'rejected', 'withdrawn'].includes(app.status) && (
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                        <span>Application Progress</span>
                                                        <span>{status.progress}%</span>
                                                    </div>
                                                    <Progress value={status.progress} className="h-1.5" />
                                                </div>
                                            )}

                                            {/* Timeline */}
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(app.created_at), 'MMM d, yyyy')}
                                                </span>
                                                {app.updated_at !== app.created_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        Updated {formatDistanceToNow(new Date(app.updated_at), { addSuffix: true })}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 mt-4">
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link to={`/my-applications/${app.id}`}>
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        View Details
                                                    </Link>
                                                </Button>
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link to={`/franchise/${app.franchise?.slug || app.franchise_id}`}>
                                                        <ExternalLink className="h-4 w-4 mr-1" />
                                                        View Franchise
                                                    </Link>
                                                </Button>
                                                {['submitted', 'under_review'].includes(app.status) && (
                                                    <Button size="sm" variant="ghost">
                                                        <MessageSquare className="h-4 w-4 mr-1" />
                                                        Contact
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
