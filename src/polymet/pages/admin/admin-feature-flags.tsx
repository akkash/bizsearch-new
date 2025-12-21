import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Flag,
    Search,
    RefreshCw,
    Shield,
    Brain,
    Map,
    Zap,
    Settings,
    FlaskConical,
    AlertTriangle,
    Check,
    X,
    Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import type { FeatureFlag } from '@/lib/feature-flags-service';

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
    core: { label: 'Core Features', icon: Zap, color: 'bg-blue-100 text-blue-700' },
    ai_features: { label: 'AI Features', icon: Brain, color: 'bg-purple-100 text-purple-700' },
    maps: { label: 'Maps & Location', icon: Map, color: 'bg-green-100 text-green-700' },
    security: { label: 'Security', icon: Shield, color: 'bg-red-100 text-red-700' },
    beta: { label: 'Beta Features', icon: FlaskConical, color: 'bg-orange-100 text-orange-700' },
    system: { label: 'System', icon: Settings, color: 'bg-gray-100 text-gray-700' },
};

export function AdminFeatureFlags() {
    const { flags, loading, setEnabled, refreshFlags } = useFeatureFlags();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [updating, setUpdating] = useState<string | null>(null);

    // Filter flags based on search and category
    const filteredFlags = flags.filter(flag => {
        const matchesSearch =
            flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            flag.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            flag.key.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || flag.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Group flags by category
    const groupedFlags = filteredFlags.reduce((acc, flag) => {
        const category = flag.category || 'core';
        if (!acc[category]) acc[category] = [];
        acc[category].push(flag);
        return acc;
    }, {} as Record<string, FeatureFlag[]>);

    const handleToggle = async (key: string, enabled: boolean) => {
        setUpdating(key);
        try {
            await setEnabled(key, enabled);
            toast.success(`${enabled ? 'Enabled' : 'Disabled'} feature: ${key}`);
        } catch (error) {
            toast.error('Failed to update feature flag');
        } finally {
            setUpdating(null);
        }
    };

    const handleRefresh = async () => {
        try {
            await refreshFlags();
            toast.success('Feature flags refreshed');
        } catch (error) {
            toast.error('Failed to refresh feature flags');
        }
    };

    // Count flags by status
    const enabledCount = flags.filter(f => f.enabled).length;
    const disabledCount = flags.filter(f => !f.enabled).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Flag className="h-6 w-6" />
                        Feature Flags
                    </h1>
                    <p className="text-muted-foreground">
                        Toggle platform features on/off for controlled rollouts
                    </p>
                </div>
                <Button onClick={handleRefresh} variant="outline" disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-full">
                                <Check className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{enabledCount}</p>
                                <p className="text-sm text-muted-foreground">Enabled Features</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <X className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{disabledCount}</p>
                                <p className="text-sm text-muted-foreground">Disabled Features</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Flag className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{flags.length}</p>
                                <p className="text-sm text-muted-foreground">Total Features</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search features..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                            <TabsList className="grid grid-cols-4 md:grid-cols-7">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="core">Core</TabsTrigger>
                                <TabsTrigger value="ai_features">AI</TabsTrigger>
                                <TabsTrigger value="maps">Maps</TabsTrigger>
                                <TabsTrigger value="security">Security</TabsTrigger>
                                <TabsTrigger value="beta">Beta</TabsTrigger>
                                <TabsTrigger value="system">System</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>

            {/* Feature Flags List */}
            {loading ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">Loading feature flags...</p>
                    </CardContent>
                </Card>
            ) : filteredFlags.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Flag className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No features found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filter</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedFlags).map(([category, categoryFlags]) => {
                        const config = categoryConfig[category] || categoryConfig.core;
                        const CategoryIcon = config.icon;

                        return (
                            <Card key={category}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CategoryIcon className="h-5 w-5" />
                                        {config.label}
                                    </CardTitle>
                                    <CardDescription>
                                        {categoryFlags.filter(f => f.enabled).length} of {categoryFlags.length} features enabled
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {categoryFlags.map((flag, index) => (
                                        <div key={flag.key}>
                                            {index > 0 && <Separator className="my-4" />}
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium">{flag.name}</h4>
                                                        <Badge
                                                            variant={flag.enabled ? 'default' : 'secondary'}
                                                            className={flag.enabled ? 'bg-green-100 text-green-700' : ''}
                                                        >
                                                            {flag.enabled ? 'Enabled' : 'Disabled'}
                                                        </Badge>
                                                        {flag.category === 'system' && flag.key === 'maintenance_mode' && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                                Caution
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {flag.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                        <code className="bg-muted px-1.5 py-0.5 rounded">{flag.key}</code>
                                                        {flag.updated_at && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                Updated {new Date(flag.updated_at).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={flag.enabled}
                                                    onCheckedChange={(checked) => handleToggle(flag.key, checked)}
                                                    disabled={updating === flag.key}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AdminFeatureFlags;
