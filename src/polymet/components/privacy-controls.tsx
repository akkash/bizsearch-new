import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Users,
  UserCheck,
  Settings,
  AlertTriangle,
  Info,
  Download,
  Trash2,
} from "lucide-react";

interface PrivacySettings {
  profileVisibility: "public" | "verified-only" | "private";
  contactInfo: "public" | "verified-only" | "private";
  businessDetails: "public" | "nda-required" | "private";
  financialInfo: "nda-required" | "private";
  documentAccess: "team-only" | "nda-required" | "private";
  searchable: boolean;
  showInDirectory: boolean;
  allowDirectMessages: boolean;
  requireNDAForContact: boolean;
  dataRetention: "1-year" | "3-years" | "indefinite";
}

interface PrivacyControlsProps {
  settings?: PrivacySettings;
  onSettingsChange?: (settings: PrivacySettings) => void;
  className?: string;
}

const defaultSettings: PrivacySettings = {
  profileVisibility: "public",
  contactInfo: "verified-only",
  businessDetails: "nda-required",
  financialInfo: "private",
  documentAccess: "nda-required",
  searchable: true,
  showInDirectory: true,
  allowDirectMessages: true,
  requireNDAForContact: false,
  dataRetention: "3-years",
};

const visibilityOptions = [
  {
    value: "public",
    label: "Public",
    description: "Visible to everyone",
    icon: Globe,
    color: "text-green-600",
  },
  {
    value: "verified-only",
    label: "Verified Users Only",
    description: "Only verified BizSearch users",
    icon: UserCheck,
    color: "text-blue-600",
  },
  {
    value: "nda-required",
    label: "NDA Required",
    description: "Requires signed NDA",
    icon: Lock,
    color: "text-orange-600",
  },
  {
    value: "private",
    label: "Private",
    description: "Only you and your team",
    icon: EyeOff,
    color: "text-red-600",
  },
];

export function PrivacyControls({
  settings = defaultSettings,
  onSettingsChange,
  className = "",
}: PrivacyControlsProps) {
  const [localSettings, setLocalSettings] = useState<PrivacySettings>(settings);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateSetting = (key: keyof PrivacySettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const getVisibilityOption = (value: string) => {
    return visibilityOptions.find((option) => option.value === value);
  };

  const VisibilitySelector = ({
    label,
    description,
    value,
    onChange,
    options = visibilityOptions,
  }: {
    label: string;
    description: string;
    value: string;
    onChange: (value: string) => void;
    options?: typeof visibilityOptions;
  }) => {
    const currentOption = getVisibilityOption(value);
    const IconComponent = currentOption?.icon || Eye;

    return (
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <IconComponent className={`w-4 h-4 ${currentOption?.color}`} />

              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => {
              const OptionIcon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <OptionIcon className={`w-4 h-4 ${option.color}`} />

                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Profile Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <VisibilitySelector
            label="Profile Visibility"
            description="Who can see your profile information"
            value={localSettings.profileVisibility}
            onChange={(value) => updateSetting("profileVisibility", value)}
            options={visibilityOptions.filter(
              (o) => o.value !== "nda-required"
            )}
          />

          <VisibilitySelector
            label="Contact Information"
            description="Who can see your email and phone number"
            value={localSettings.contactInfo}
            onChange={(value) => updateSetting("contactInfo", value)}
            options={visibilityOptions.filter(
              (o) => o.value !== "nda-required"
            )}
          />

          <VisibilitySelector
            label="Business Details"
            description="Who can see detailed business information"
            value={localSettings.businessDetails}
            onChange={(value) => updateSetting("businessDetails", value)}
          />

          <VisibilitySelector
            label="Financial Information"
            description="Who can see revenue, profit, and financial data"
            value={localSettings.financialInfo}
            onChange={(value) => updateSetting("financialInfo", value)}
            options={visibilityOptions.filter(
              (o) => o.value !== "public" && o.value !== "verified-only"
            )}
          />

          <VisibilitySelector
            label="Document Access"
            description="Who can access your uploaded documents"
            value={localSettings.documentAccess}
            onChange={(value) => updateSetting("documentAccess", value)}
            options={[
              {
                value: "team-only",
                label: "Team Only",
                description: "Only team members",
                icon: Users,
                color: "text-purple-600",
              },
              ...visibilityOptions.filter(
                (o) => o.value === "nda-required" || o.value === "private"
              ),
            ]}
          />
        </CardContent>
      </Card>

      {/* Discovery Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Discovery & Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Searchable Profile</Label>
              <p className="text-xs text-muted-foreground">
                Allow your profile to appear in search results
              </p>
            </div>
            <Switch
              checked={localSettings.searchable}
              onCheckedChange={(checked) =>
                updateSetting("searchable", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Show in Directory</Label>
              <p className="text-xs text-muted-foreground">
                Include your profile in the public directory
              </p>
            </div>
            <Switch
              checked={localSettings.showInDirectory}
              onCheckedChange={(checked) =>
                updateSetting("showInDirectory", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">
                Allow Direct Messages
              </Label>
              <p className="text-xs text-muted-foreground">
                Let other users send you direct messages
              </p>
            </div>
            <Switch
              checked={localSettings.allowDirectMessages}
              onCheckedChange={(checked) =>
                updateSetting("allowDirectMessages", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">
                Require NDA for Contact
              </Label>
              <p className="text-xs text-muted-foreground">
                Require NDA signature before sharing contact details
              </p>
            </div>
            <Switch
              checked={localSettings.requireNDAForContact}
              onCheckedChange={(checked) =>
                updateSetting("requireNDAForContact", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium">Data Retention Period</Label>
            <p className="text-xs text-muted-foreground mb-3">
              How long to keep your data after account deletion
            </p>
            <Select
              value={localSettings.dataRetention}
              onValueChange={(value) => updateSetting("dataRetention", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-year">1 Year</SelectItem>
                <SelectItem value="3-years">3 Years</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>

            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. All your data, listings, and
                    documents will be permanently deleted.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive">Delete Account</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Summary */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />

            <div>
              <h4 className="font-medium text-blue-900 mb-2">
                Privacy Summary
              </h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Profile:{" "}
                    {
                      getVisibilityOption(localSettings.profileVisibility)
                        ?.label
                    }
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Contact:{" "}
                    {getVisibilityOption(localSettings.contactInfo)?.label}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Business:{" "}
                    {getVisibilityOption(localSettings.businessDetails)?.label}
                  </Badge>
                </div>
                <p className="text-xs">
                  Your privacy settings determine who can see different parts of
                  your profile. More restrictive settings provide better privacy
                  but may limit discovery.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
