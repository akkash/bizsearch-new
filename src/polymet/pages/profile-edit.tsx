import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Save,
  User,
  Shield,
  Settings,
  Eye,
  AlertTriangle,
  Loader2,
  Building2,
  Store,
  Briefcase,
  Users,
  CheckCircle2,
  Camera,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ProfileForm } from "@/polymet/components/profile-form";
import { PrivacyControls } from "@/polymet/components/privacy-controls";
import { ProfileCompletenessCard } from "@/components/profile/ProfileCompletenessCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { UserRole } from "@/types/auth.types";

interface ProfileEditPageProps {
  className?: string;
}

export function ProfileEditPage({ className = "" }: ProfileEditPageProps) {
  const navigate = useNavigate();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Get profile from AuthContext (real database data)
  const { user, profile, loading, updateProfile, refreshProfile } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // No profile found
  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground">
            Please complete your profile setup first.
          </p>
          <Button onClick={() => navigate("/profile/setup")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Setup Profile
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }
    navigate("/profile");
  };

  const handleProfileSubmit = async (data: any) => {
    console.log("Profile data submitted:", data);
    try {
      const { error } = await updateProfile(data);
      if (error) throw error;
      setHasUnsavedChanges(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handlePrivacyChange = (settings: any) => {
    console.log("Privacy settings changed:", settings);
    setHasUnsavedChanges(true);
  };

  // Map database profile to display values
  const displayName = profile.display_name || (profile as any).full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;
  const verificationStatus = (profile as any).verification_tier || 'unverified';

  // Get user roles from profile.roles array or fallback to single role
  const getUserRoles = (): UserRole[] => {
    const roles = (profile as any)?.roles?.map((r: any) => r.role);
    return roles?.length ? roles : [profile.role];
  };

  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(getUserRoles());
  const [savingRoles, setSavingRoles] = useState(false);

  // Sync selectedRoles when profile.roles changes (e.g., after refreshProfile)
  useEffect(() => {
    const roles = getUserRoles();
    setSelectedRoles(roles);
  }, [(profile as any)?.roles]);

  const roleOptions: { value: UserRole; label: string; description: string; icon: any; color: string }[] = [
    { value: 'buyer', label: 'Business Buyer', description: 'Looking to acquire a business', icon: User, color: 'text-indigo-600' },
    { value: 'seller', label: 'Business Seller', description: 'Looking to sell your business', icon: Building2, color: 'text-green-600' },
    { value: 'franchisor', label: 'Franchisor', description: 'Offering franchise opportunities', icon: Store, color: 'text-orange-600' },
    { value: 'franchisee', label: 'Franchisee', description: 'Looking for franchise opportunities', icon: Store, color: 'text-amber-600' },
    { value: 'advisor', label: 'Advisor / Broker', description: 'Business broker or consultant', icon: Briefcase, color: 'text-blue-600' },
  ];

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(prev => {
      const isSelected = prev.includes(role);
      if (isSelected && prev.length === 1) {
        toast.warning('You must have at least one role selected');
        return prev;
      }
      setHasUnsavedChanges(true);
      return isSelected ? prev.filter(r => r !== role) : [...prev, role];
    });
  };

  const handleSaveRoles = async () => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }
    setSavingRoles(true);
    try {
      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('profile_roles')
        .delete()
        .eq('profile_id', user.id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      // Insert new roles
      const roleInserts = selectedRoles.map((role, index) => ({
        profile_id: user.id,
        role: role,
        is_primary: index === 0,
      }));

      const { error: insertError } = await supabase
        .from('profile_roles')
        .insert(roleInserts);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      // Update primary role in profiles table
      await updateProfile({ role: selectedRoles[0] as any });

      // Refresh profile to reload roles data
      await refreshProfile();

      toast.success('Roles updated successfully!');
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error('Error saving roles:', error);
      toast.error(`Failed to save roles: ${error?.message || 'Unknown error'}`);
    } finally {
      setSavingRoles(false);
    }
  };

  return (
    <div className={`container mx-auto px-4 py-8 space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">
              Update your profile information and privacy settings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800"
            >
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={() => navigate("/profile")}>
            <Eye className="w-4 h-4 mr-2" />
            Preview Profile
          </Button>
        </div>
      </div>

      {/* User Info Card with Avatar Upload */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {/* Avatar with upload overlay */}
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      toast.info('Avatar upload coming soon!');
                    }
                  }}
                />
              </label>
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-lg">{displayName}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {getUserRoles().map((role: string) => (
                  <Badge key={role} variant="secondary" className="capitalize">
                    {role}
                  </Badge>
                ))}
                {verificationStatus !== "unverified" && (
                  <Badge
                    variant={
                      verificationStatus === "verified"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      verificationStatus === "verified"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {verificationStatus}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completeness - shown if not 100% */}
      <ProfileCompletenessCard showIfComplete={false} />

      {/* Edit Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Roles</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Update your personal and professional information.
              </p>
            </CardHeader>
            <CardContent>
              <ProfileForm
                profile={profile}
                onSubmit={handleProfileSubmit}
                onCancel={() => navigate("/profile")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Roles</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select all the roles that apply to you. You can have multiple roles.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {roleOptions.map((role) => {
                  const isSelected = selectedRoles.includes(role.value);
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
                      <role.icon className={`h-5 w-5 ${isSelected ? role.color : 'text-muted-foreground'}`} />
                      <div className="flex-1">
                        <div className="font-medium">{role.label}</div>
                        <div className="text-sm text-muted-foreground">{role.description}</div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className={`h-5 w-5 ${role.color}`} />
                      )}
                    </label>
                  );
                })}
              </div>
              {selectedRoles.length > 1 && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {selectedRoles.length} roles selected
                </p>
              )}
              <Button
                onClick={handleSaveRoles}
                disabled={savingRoles}
                className="mt-4"
              >
                {savingRoles ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Save Roles</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Visibility Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Control who can see your profile information and how you can be
                contacted.
              </p>
            </CardHeader>
            <CardContent>
              <PrivacyControls onSettingsChange={handlePrivacyChange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your account preferences and security settings.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Preferences */}
              <div className="space-y-4">
                <h4 className="font-medium">Email Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">New Messages</div>
                      <div className="text-xs text-muted-foreground">
                        Get notified when someone sends you a message
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Profile Views</div>
                      <div className="text-xs text-muted-foreground">
                        Get notified when someone views your profile
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">New Opportunities</div>
                      <div className="text-xs text-muted-foreground">
                        Get notified about relevant business opportunities
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Marketing Emails</div>
                      <div className="text-xs text-muted-foreground">
                        Receive newsletters and promotional content
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="space-y-4 pt-6 border-t">
                <h4 className="font-medium">Security</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Enable Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Download Account Data
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="space-y-4 pt-6 border-t border-red-200">
                <h4 className="font-medium text-red-600">Danger Zone</h4>
                <div className="p-4 border border-red-200 rounded-lg bg-red-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-red-900">
                        Delete Account
                      </div>
                      <div className="text-xs text-red-700">
                        Permanently delete your account and all data
                      </div>
                    </div>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />

            <div>
              <div className="font-medium text-yellow-900">Unsaved Changes</div>
              <div className="text-sm text-yellow-700">
                Don't forget to save your changes
              </div>
            </div>
            <Button size="sm" onClick={() => setHasUnsavedChanges(false)}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
