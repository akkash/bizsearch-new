import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Settings,
    Building2,
    Mail,
    DollarSign,
    Bell,
    Shield,
    Palette,
    Save,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminSettings() {
    const [settings, setSettings] = useState({
        // General Settings
        platformName: 'BizSearch',
        supportEmail: 'support@bizsearch.com',
        contactPhone: '+91 98765 43210',

        // Listing Settings  
        listingApprovalRequired: true,
        maxImagesPerListing: 10,
        listingFee: 0,
        featuredListingFee: 999,

        // Notification Settings
        emailNotifications: true,
        smsNotifications: false,
        newListingAlerts: true,
        newUserAlerts: true,

        // Security Settings
        requireEmailVerification: true,
        requirePhoneVerification: false,
        maxLoginAttempts: 5,
        sessionTimeout: 30,

        // Feature Flags
        enableFranchiseMap: true,
        enableAIMatching: true,
        enableFraudDetection: true,
        maintenanceMode: false,
    });

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        // In production, save to database
        toast.success('Settings saved successfully');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Platform Settings</h1>
                    <p className="text-muted-foreground">Configure platform behavior and features</p>
                </div>
                <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="listings">Listings</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>

                {/* General Settings */}
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
                                        value={settings.platformName}
                                        onChange={(e) => handleChange('platformName', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Support Email</Label>
                                    <Input
                                        type="email"
                                        value={settings.supportEmail}
                                        onChange={(e) => handleChange('supportEmail', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contact Phone</Label>
                                    <Input
                                        value={settings.contactPhone}
                                        onChange={(e) => handleChange('contactPhone', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Listing Settings */}
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
                                    checked={settings.listingApprovalRequired}
                                    onCheckedChange={(v) => handleChange('listingApprovalRequired', v)}
                                />
                            </div>
                            <Separator />
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Max Images Per Listing</Label>
                                    <Input
                                        type="number"
                                        value={settings.maxImagesPerListing}
                                        onChange={(e) => handleChange('maxImagesPerListing', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Basic Listing Fee (₹)</Label>
                                    <Input
                                        type="number"
                                        value={settings.listingFee}
                                        onChange={(e) => handleChange('listingFee', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Featured Listing Fee (₹)</Label>
                                    <Input
                                        type="number"
                                        value={settings.featuredListingFee}
                                        onChange={(e) => handleChange('featuredListingFee', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notification Settings */}
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
                            <div className="space-y-4">
                                {[
                                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                                    { key: 'newListingAlerts', label: 'New Listing Alerts', desc: 'Alert when new listings are submitted' },
                                    { key: 'newUserAlerts', label: 'New User Alerts', desc: 'Alert when new users sign up' },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>{item.label}</Label>
                                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                                        </div>
                                        <Switch
                                            checked={settings[item.key as keyof typeof settings] as boolean}
                                            onCheckedChange={(v) => handleChange(item.key, v)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
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
                                        checked={settings.requireEmailVerification}
                                        onCheckedChange={(v) => handleChange('requireEmailVerification', v)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Require Phone Verification</Label>
                                        <p className="text-sm text-muted-foreground">Users must verify phone number</p>
                                    </div>
                                    <Switch
                                        checked={settings.requirePhoneVerification}
                                        onCheckedChange={(v) => handleChange('requirePhoneVerification', v)}
                                    />
                                </div>
                            </div>
                            <Separator />
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Max Login Attempts</Label>
                                    <Input
                                        type="number"
                                        value={settings.maxLoginAttempts}
                                        onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Session Timeout (days)</Label>
                                    <Input
                                        type="number"
                                        value={settings.sessionTimeout}
                                        onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Feature Flags */}
                <TabsContent value="features" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Feature Flags
                            </CardTitle>
                            <CardDescription>Enable or disable platform features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { key: 'enableFranchiseMap', label: 'Franchise Map', desc: 'Enable the interactive franchise map discovery', active: true },
                                { key: 'enableAIMatching', label: 'AI Matching', desc: 'Enable AI-powered business/franchise matching', active: true },
                                { key: 'enableFraudDetection', label: 'Fraud Detection', desc: 'Enable AI fraud detection system', active: true },
                                { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Put platform in maintenance mode', active: false, danger: true },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Label>{item.label}</Label>
                                            {item.danger && <Badge variant="destructive" className="text-xs">Caution</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                    <Switch
                                        checked={settings[item.key as keyof typeof settings] as boolean}
                                        onCheckedChange={(v) => handleChange(item.key, v)}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
