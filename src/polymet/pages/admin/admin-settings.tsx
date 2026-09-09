import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Building2,
    Mail,
    DollarSign,
    Bell,
    Shield,
    Save,
    Loader2,
    Flag,
    ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminService } from '@/lib/admin-service';

type GeneralSettings = {
    platformName: string;
    supportEmail: string;
    contactPhone: string;
};

type ListingSettings = {
    listingApprovalRequired: boolean;
    maxImagesPerListing: number;
    listingFee: number;
    featuredListingFee: number;
};

type NotificationSettings = {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newListingAlerts: boolean;
    newUserAlerts: boolean;
};

type SecuritySettings = {
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
};

const DEFAULTS = {
    general: {
        platformName: 'BizSearch',
        supportEmail: 'support@bizsearch.com',
        contactPhone: '',
    } as GeneralSettings,
    listings: {
        listingApprovalRequired: true,
        maxImagesPerListing: 10,
        listingFee: 0,
        featuredListingFee: 999,
    } as ListingSettings,
    notifications: {
        emailNotifications: true,
        smsNotifications: false,
        newListingAlerts: true,
        newUserAlerts: true,
    } as NotificationSettings,
    security: {
        requireEmailVerification: true,
        requirePhoneVerification: false,
        maxLoginAttempts: 5,
        sessionTimeout: 30,
    } as SecuritySettings,
};

export function AdminSettings() {
    const [general, setGeneral] = useState<GeneralSettings>(DEFAULTS.general);
    const [listings, setListings] = useState<ListingSettings>(DEFAULTS.listings);
    const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULTS.notifications);
    const [security, setSecurity] = useState<SecuritySettings>(DEFAULTS.security);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        AdminService.getSettings()
            .then((map) => {
                if (map.general) setGeneral({ ...DEFAULTS.general, ...map.general } as GeneralSettings);
                if (map.listings) setListings({ ...DEFAULTS.listings, ...map.listings } as ListingSettings);
                if (map.notifications) setNotifications({ ...DEFAULTS.notifications, ...map.notifications } as NotificationSettings);
                if (map.security) setSecurity({ ...DEFAULTS.security, ...map.security } as SecuritySettings);
            })
            .catch((err) => {
                console.error('Failed to load settings:', err);
                toast.error('Failed to load settings');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all([
                AdminService.updateSettings('general', general),
                AdminService.updateSettings('listings', listings),
                AdminService.updateSettings('notifications', notifications),
                AdminService.updateSettings('security', security),
            ]);
            toast.success('Settings saved successfully');
        } catch (err) {
            console.error('Failed to save settings:', err);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Platform Settings</h1>
                    <p className="text-muted-foreground">Configure platform behavior and features</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="listings">Listings</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                General Settings
                            </CardTitle>
                            <CardDescription>Basic platform configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Platform Name</Label>
                                    <Input
                                        value={general.platformName}
                                        onChange={(e) => setGeneral((p) => ({ ...p, platformName: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Support Email</Label>
                                    <Input
                                        type="email"
                                        value={general.supportEmail}
                                        onChange={(e) => setGeneral((p) => ({ ...p, supportEmail: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contact Phone</Label>
                                    <Input
                                        value={general.contactPhone}
                                        onChange={(e) => setGeneral((p) => ({ ...p, contactPhone: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="listings" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Listing Settings
                            </CardTitle>
                            <CardDescription>Configure listing rules and pricing</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Require Approval for Listings</Label>
                                    <p className="text-sm text-muted-foreground">
                                        New listings must be approved before going live
                                    </p>
                                </div>
                                <Switch
                                    checked={listings.listingApprovalRequired}
                                    onCheckedChange={(v) => setListings((p) => ({ ...p, listingApprovalRequired: v }))}
                                />
                            </div>
                            <Separator />
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Max Images Per Listing</Label>
                                    <Input
                                        type="number"
                                        value={listings.maxImagesPerListing}
                                        onChange={(e) => setListings((p) => ({ ...p, maxImagesPerListing: parseInt(e.target.value, 10) || 0 }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Basic Listing Fee (₹)</Label>
                                    <Input
                                        type="number"
                                        value={listings.listingFee}
                                        onChange={(e) => setListings((p) => ({ ...p, listingFee: parseInt(e.target.value, 10) || 0 }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Featured Listing Fee (₹)</Label>
                                    <Input
                                        type="number"
                                        value={listings.featuredListingFee}
                                        onChange={(e) => setListings((p) => ({ ...p, featuredListingFee: parseInt(e.target.value, 10) || 0 }))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notification Settings
                            </CardTitle>
                            <CardDescription>Configure admin notifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive notifications via email' },
                                { key: 'smsNotifications' as const, label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                                { key: 'newListingAlerts' as const, label: 'New Listing Alerts', desc: 'Alert when new listings are submitted' },
                                { key: 'newUserAlerts' as const, label: 'New User Alerts', desc: 'Alert when new users sign up' },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>{item.label}</Label>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                    <Switch
                                        checked={notifications[item.key]}
                                        onCheckedChange={(v) => setNotifications((p) => ({ ...p, [item.key]: v }))}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Security Settings
                            </CardTitle>
                            <CardDescription>Configure security and authentication</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Require Email Verification</Label>
                                        <p className="text-sm text-muted-foreground">Users must verify email to use platform</p>
                                    </div>
                                    <Switch
                                        checked={security.requireEmailVerification}
                                        onCheckedChange={(v) => setSecurity((p) => ({ ...p, requireEmailVerification: v }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Require Phone Verification</Label>
                                        <p className="text-sm text-muted-foreground">Users must verify phone number</p>
                                    </div>
                                    <Switch
                                        checked={security.requirePhoneVerification}
                                        onCheckedChange={(v) => setSecurity((p) => ({ ...p, requirePhoneVerification: v }))}
                                    />
                                </div>
                            </div>
                            <Separator />
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Max Login Attempts</Label>
                                    <Input
                                        type="number"
                                        value={security.maxLoginAttempts}
                                        onChange={(e) => setSecurity((p) => ({ ...p, maxLoginAttempts: parseInt(e.target.value, 10) || 0 }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Session Timeout (days)</Label>
                                    <Input
                                        type="number"
                                        value={security.sessionTimeout}
                                        onChange={(e) => setSecurity((p) => ({ ...p, sessionTimeout: parseInt(e.target.value, 10) || 0 }))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Flag className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Feature Flags</p>
                                    <p className="text-sm text-muted-foreground">
                                        Toggle platform features in the dedicated feature flags panel
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" asChild>
                                <Link to="/admin/feature-flags">
                                    Manage Flags <ArrowRight className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
