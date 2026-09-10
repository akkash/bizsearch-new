import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import { AdminService, type FraudAlert } from '@/lib/admin-service';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export function AdminFraudAlerts() {
    const [alerts, setAlerts] = useState<FraudAlert[]>([]);
    const [resolvedToday, setResolvedToday] = useState(0);
    const [listingTypes, setListingTypes] = useState<Record<string, 'business' | 'franchise'>>({});
    const [loading, setLoading] = useState(true);
    const [actingId, setActingId] = useState<string | null>(null);

    const loadAlerts = useCallback(async () => {
        setLoading(true);
        try {
            const [pending, resolved] = await Promise.all([
                AdminService.getPendingFraudAlerts(),
                AdminService.getFraudAlertsResolvedToday(),
            ]);
            setAlerts(pending);
            setResolvedToday(resolved);

            const listingAlerts = pending.filter((a) => a.type === 'listing');
            const typeMap: Record<string, 'business' | 'franchise'> = {};
            await Promise.all(
                listingAlerts.map(async (alert) => {
                    const listingType = await AdminService.resolveListingType(alert.entity_id);
                    if (listingType) typeMap[alert.entity_id] = listingType;
                })
            );
            setListingTypes(typeMap);
        } catch (error) {
            console.error('Error loading alerts:', error);
            toast.error('Failed to load fraud alerts');
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAlerts();
    }, [loadAlerts]);

    const handleResolve = async (alertId: string, status: 'reviewed' | 'dismissed' | 'confirmed') => {
        setActingId(alertId);
        try {
            await AdminService.resolveFraudAlert(alertId, status);
            toast.success(
                status === 'dismissed' ? 'Alert dismissed' : status === 'confirmed' ? 'Alert confirmed' : 'Alert resolved'
            );
            await loadAlerts();
        } catch (error) {
            console.error('Fraud alert action failed:', error);
            toast.error('Failed to update alert');
        } finally {
            setActingId(null);
        }
    };

    const getRiskColor = (score: number) => {
        if (score >= 80) return 'bg-red-100 text-red-800';
        if (score >= 60) return 'bg-orange-100 text-orange-800';
        if (score >= 40) return 'bg-yellow-100 text-yellow-800';
        return 'bg-secondary text-foreground';
    };

    const getEntityLink = (alert: FraudAlert) => {
        if (alert.type === 'user') return `/admin/users/${alert.entity_id}`;
        if (alert.type === 'listing') {
            const listingType = listingTypes[alert.entity_id];
            if (listingType) return `/admin/listings/${listingType}/${alert.entity_id}`;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Fraud Detection</h1>
                    <p className="text-muted-foreground">Review AI-flagged suspicious activities</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadAlerts}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-red-100 text-red-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{alerts.length}</p>
                                <p className="text-sm text-muted-foreground">Pending Alerts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-secondary text-foreground">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{resolvedToday}</p>
                                <p className="text-sm text-muted-foreground">Resolved Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-growth-green/10 text-growth-green">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">AI</p>
                                <p className="text-sm text-muted-foreground">Detection Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        Flagged Items
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {alerts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No details found in the table.</p>
                            <p className="text-sm mt-1">AI monitoring is active and watching for suspicious activity</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {alerts.map((alert) => {
                                const entityLink = getEntityLink(alert);
                                return (
                                    <div
                                        key={alert.id}
                                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                                    <span className="font-semibold">{alert.entity_name}</span>
                                                    <Badge variant="outline" className="capitalize">
                                                        {alert.type}
                                                    </Badge>
                                                    <Badge className={getRiskColor(alert.risk_score)}>
                                                        Risk: {alert.risk_score}%
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{alert.reason}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {entityLink && (
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link to={entityLink}>
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Review
                                                        </Link>
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-foreground"
                                                    disabled={actingId === alert.id}
                                                    onClick={() => handleResolve(alert.id, 'reviewed')}
                                                    title="Resolve"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600"
                                                    disabled={actingId === alert.id}
                                                    onClick={() => handleResolve(alert.id, 'dismissed')}
                                                    title="Dismiss"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
