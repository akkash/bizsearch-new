import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Building2, Store, Briefcase, Camera, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { UserRole } from '@/types/auth.types';

const roles: { value: UserRole; label: string; description: string; icon: any }[] = [
    {
        value: 'buyer',
        label: 'Business Buyer',
        description: 'Looking to buy a business',
        icon: User,
    },
    {
        value: 'seller',
        label: 'Business Seller',
        description: 'Want to sell my business',
        icon: Building2,
    },
    {
        value: 'franchisor',
        label: 'Franchisor',
        description: 'Offering franchise opportunities',
        icon: Store,
    },
    {
        value: 'franchisee',
        label: 'Franchisee',
        description: 'Looking for franchise opportunities',
        icon: Store,
    },
    {
        value: 'advisor',
        label: 'Advisor / Broker',
        description: 'Business broker or consultant',
        icon: Briefcase,
    },
];

export function ProfileSetupPage() {
    const navigate = useNavigate();
    const { user, profile, updateProfile, uploadAvatar, refreshProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<{
        display_name: string;
        selectedRoles: UserRole[];
        phone: string;
    }>({
        display_name: profile?.display_name || user?.email?.split('@')[0] || '',
        selectedRoles: profile?.role ? [profile.role] : ['buyer'],
        phone: profile?.phone || '',
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const toggleRole = (role: UserRole) => {
        setFormData(prev => {
            const isSelected = prev.selectedRoles.includes(role);
            if (isSelected) {
                // Don't allow deselecting if it's the only role
                if (prev.selectedRoles.length === 1) {
                    toast.error('You must select at least one role');
                    return prev;
                }
                return { ...prev, selectedRoles: prev.selectedRoles.filter(r => r !== role) };
            } else {
                return { ...prev, selectedRoles: [...prev.selectedRoles, role] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.display_name.trim()) {
            toast.error('Please enter your name');
            return;
        }

        if (formData.selectedRoles.length === 0) {
            toast.error('Please select at least one role');
            return;
        }

        setSaving(true);
        try {
            // Upload avatar if selected
            if (avatarFile) {
                const { error: avatarError } = await uploadAvatar(avatarFile);
                if (avatarError) {
                    console.error('Avatar upload error:', avatarError);
                }
            }

            // Update main profile (use first selected role as primary)
            const primaryRole = formData.selectedRoles[0];
            const { error } = await updateProfile({
                display_name: formData.display_name.trim(),
                role: primaryRole as any,
                phone: formData.phone || null,
            });

            if (error) {
                throw error;
            }

            // Insert roles into profile_roles table
            if (user?.id) {
                // First, delete existing roles
                await supabase
                    .from('profile_roles')
                    .delete()
                    .eq('profile_id', user.id);

                // Insert new roles
                const roleInserts = formData.selectedRoles.map((role, index) => ({
                    profile_id: user.id,
                    role: role,
                    is_primary: index === 0, // First role is primary
                }));

                const { error: rolesError } = await supabase
                    .from('profile_roles')
                    .insert(roleInserts);

                if (rolesError) {
                    console.error('Error inserting roles:', rolesError);
                    // Continue anyway, main profile is saved
                }
            }

            // Refresh profile to get updated data
            await refreshProfile();

            toast.success('Profile completed successfully!');

            // Navigate based on primary role
            switch (primaryRole) {
                case 'seller':
                case 'franchisor':
                    navigate('/my-listings');
                    break;
                case 'advisor':
                    navigate('/advisor');
                    break;
                default:
                    navigate('/');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
                    <CardDescription>
                        Tell us a bit about yourself to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={avatarPreview || ''} />
                                    <AvatarFallback className="text-2xl">
                                        {formData.display_name.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                                >
                                    <Camera className="h-4 w-4" />
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            </div>
                            <p className="text-sm text-muted-foreground">Add a profile photo (optional)</p>
                        </div>

                        {/* Display Name */}
                        <div className="space-y-2">
                            <Label htmlFor="display_name">Your Name *</Label>
                            <Input
                                id="display_name"
                                value={formData.display_name}
                                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number (optional)</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        {/* Multi-Role Selection */}
                        <div className="space-y-3">
                            <Label>I am a... * <span className="text-sm font-normal text-muted-foreground">(select all that apply)</span></Label>
                            <div className="grid gap-3">
                                {roles.map((role) => {
                                    const isSelected = formData.selectedRoles.includes(role.value);
                                    return (
                                        <label
                                            key={role.value}
                                            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${isSelected
                                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                    : 'border-muted hover:border-primary/50'
                                                }`}
                                            onClick={() => toggleRole(role.value)}
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleRole(role.value)}
                                                className="pointer-events-none"
                                            />
                                            <role.icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <div className="flex-1">
                                                <div className="font-medium">{role.label}</div>
                                                <div className="text-sm text-muted-foreground">{role.description}</div>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                            {formData.selectedRoles.length > 1 && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    {formData.selectedRoles.length} roles selected
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" size="lg" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Complete Profile'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
