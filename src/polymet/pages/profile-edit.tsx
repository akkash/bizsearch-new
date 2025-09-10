import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  X,
  User,
  Shield,
  Settings,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { ProfileForm } from "@/polymet/components/profile-form";
import { PrivacyControls } from "@/polymet/components/privacy-controls";
import {
  getCurrentUserProfile,
  getProfileById,
  type UserProfile,
} from "@/polymet/data/profile-data";

interface ProfileEditPageProps {
  className?: string;
}

export function ProfileEditPage({ className = "" }: ProfileEditPageProps) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Get profile data (current user or specific user)
  const profile = userId ? getProfileById(userId) : getCurrentUserProfile();
  const isOwnProfile = !userId || userId === getCurrentUserProfile().id;

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground">
            The requested profile could not be found.
          </p>
          <Button onClick={() => navigate("/profile")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  if (!isOwnProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />

          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You can only edit your own profile.
          </p>
          <Button onClick={() => navigate("/profile")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
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

  const handleProfileSubmit = (data: any) => {
    console.log("Profile data submitted:", data);
    setHasUnsavedChanges(false);
    // Here you would typically save to backend
    alert("Profile updated successfully!");
  };

  const handlePrivacyChange = (settings: any) => {
    console.log("Privacy settings changed:", settings);
    setHasUnsavedChanges(true);
  };

  const handleFormChange = () => {
    setHasUnsavedChanges(true);
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

      {/* Role Badge */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <img
              src={profile.avatar}
              alt={profile.displayName}
              className="w-12 h-12 rounded-full"
            />

            <div>
              <h3 className="font-semibold">{profile.displayName}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {profile.role}
                </Badge>
                <Badge
                  variant={
                    profile.verificationStatus === "verified"
                      ? "default"
                      : "secondary"
                  }
                  className={
                    profile.verificationStatus === "verified"
                      ? "bg-green-100 text-green-800"
                      : profile.verificationStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }
                >
                  {profile.verificationStatus}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile Information
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy Settings
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Account Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Update your personal and professional information. Fields marked
                with NDA protection are only visible to users who have signed an
                NDA.
              </p>
            </CardHeader>
            <CardContent>
              <ProfileForm profile={profile} onSubmit={handleProfileSubmit} />
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">New Messages</div>
                      <div className="text-xs text-muted-foreground">
                        Get notified when someone sends you a message
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Profile Views</div>
                      <div className="text-xs text-muted-foreground">
                        Get notified when someone views your profile
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">
                        New Opportunities
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Get notified about relevant business opportunities
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked />
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
