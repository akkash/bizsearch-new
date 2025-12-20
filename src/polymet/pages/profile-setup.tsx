import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Building2, Store, Briefcase, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { UserRole } from '@/types/auth.types';

const roles: { value: UserRole; label: string; description: string; icon: any }[] = [
    {
        value: 'buyer',
        label: 'Buyer',
        description: 'Looking to buy a business or franchise',
        icon: User,
    },
    {
        value: 'seller',
        label: 'Seller',
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
        value: 'advisor',
        label: 'Advisor',
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
        role: UserRole;
        phone: string;
    }>({
        display_name: profile?.display_name || user?.email?.split('@')[0] || '',
        role: profile?.role || 'buyer',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.display_name.trim()) {
            toast.error('Please enter your name');
            return;
        }

        setSaving(true);
        try {
            // Upload avatar if selected
            if (avatarFile) {
                const { error: avatarError } = await uploadAvatar(avatarFile);
                if (avatarError) {
                    console.error('Avatar upload error:', avatarError);
                    // Continue anyway, avatar is optional
                }
            }

            // Update profile
            const { error } = await updateProfile({
                display_name: formData.display_name.trim(),
                role: formData.role as any,
                phone: formData.phone || null,
            });

            if (error) {
                throw error;
            }

            // Refresh profile to clear profileMissing flag
            await refreshProfile();

            toast.success('Profile completed successfully!');

            // Navigate to appropriate page based on role
            switch (formData.role) {
                case 'seller':
                    navigate('/my-listings');
                    break;
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

                        {/* Role Selection */}
                        <div className="space-y-3">
                            <Label>I am a... *</Label>
                            <RadioGroup
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                                className="grid gap-3"
                            >
                                {roles.map((role) => (
                                    <label
                                        key={role.value}
                                        className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${formData.role === role.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-muted hover:border-primary/50'
                                            }`}
                                    >
                                        <RadioGroupItem value={role.value} id={role.value} />
                                        <role.icon className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <div className="font-medium">{role.label}</div>
                                            <div className="text-sm text-muted-foreground">{role.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </RadioGroup>
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
