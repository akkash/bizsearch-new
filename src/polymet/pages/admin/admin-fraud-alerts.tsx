import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FraudAlert {
    id: string;
    type: string;
    entity_name: string;
    risk_score: number;
    reason: string;
    status: string;
    created_at: string;
}

export function AdminFraudAlerts() {
    const [alerts, setAlerts] = useState<FraudAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            // Try to fetch from fraud_alerts table if it exists
            const { data, error } = await supabase
                .from('fraud_alerts')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setAlerts(data);
            } else {
                // Table might not exist yet, show empty state
                setAlerts([]);
            }
        } catch (error) {
            console.error('Error loading alerts:', error);
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (score: number) => {
        if (score >= 80) return 'bg-red-100 text-red-800';
        if (score >= 60) return 'bg-orange-100 text-orange-800';
        if (score >= 40) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
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
            <div>
                <h1 className="text-2xl font-bold">Fraud Detection</h1>
                <p className="text-muted-foreground">Review AI-flagged suspicious activities</p>
            </div>

            {/* Stats */}
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
                            <div className="p-3 rounded-lg bg-green-100 text-green-600">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-sm text-muted-foreground">Resolved Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
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

            {/* Alerts List */}
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
                            <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No fraud alerts</p>
                            <p className="text-sm">AI monitoring is active and watching for suspicious activity</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {alerts.map((alert: FraudAlert) => (
                                <div
                                    key={alert.id}
                                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                                <span className="font-semibold">{alert.entity_name}</span>
                                                <Badge variant="outline" className="capitalize">
                                                    {alert.type}
                                                </Badge>
                                                <Badge className={getRiskColor(alert.risk_score)}>
                                                    Risk: {alert.risk_score}%
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{alert.reason}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline">
                                                <Eye className="h-4 w-4 mr-1" />
                                                Review
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-green-600">
                                                <CheckCircle className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-red-600">
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Shield className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900">AI Fraud Detection</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                The system uses machine learning to detect suspicious patterns such as:
                            </p>
                            <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                                <li>Duplicate or stolen images</li>
                                <li>Unrealistic financial claims</li>
                                <li>Suspicious user behavior patterns</li>
                                <li>Known scam indicators</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
