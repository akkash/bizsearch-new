import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  DollarSign,
  Users,
  Calendar,
  Award,
  FileText,
  Save,
  AlertCircle,
} from "lucide-react";
import { type UserProfile } from "@/polymet/data/profile-data";

// Base schema for all roles
const baseSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters"),
  avatar: z.string().url("Must be a valid URL").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Must be a valid email address"),
  location: z.object({
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
  }),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z
    .string()
    .url("Must be a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  isPublic: z.boolean(),
});

// Role-specific schemas
const sellerSchema = baseSchema.extend({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  foundedYear: z.number().min(1900).max(new Date().getFullYear()),
  employees: z.number().min(1, "Must have at least 1 employee"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  keyProducts: z.array(z.string()).min(1, "At least one product is required"),
  certifications: z.array(z.string()).optional(),
  privateInfo: z.object({
    askingPrice: z.number().min(1, "Asking price is required"),
    monthlyRevenue: z.number().min(0),
    monthlyProfit: z.number().min(0),
    reasonForSale: z.string().min(10, "Reason for sale is required"),
  }),
});

const buyerSchema = baseSchema.extend({
  firmName: z.string().min(1, "Firm name is required"),
  buyerType: z.enum(["individual", "corporate", "pe_fund", "strategic"]),
  investmentRange: z.object({
    min: z.number().min(1, "Minimum investment is required"),
    max: z.number().min(1, "Maximum investment is required"),
  }),
  preferredIndustries: z
    .array(z.string())
    .min(1, "Select at least one industry"),
  preferredLocations: z
    .array(z.string())
    .min(1, "Select at least one location"),
  investmentCriteria: z
    .string()
    .min(50, "Investment criteria must be detailed"),
  experience: z.string().min(20, "Experience description is required"),
  privateInfo: z.object({
    availableFunds: z.number().min(1, "Available funds is required"),
    previousAcquisitions: z.number().min(0),
    timeframe: z.string().min(1, "Investment timeframe is required"),
  }),
});

const franchisorSchema = baseSchema.extend({
  brandName: z.string().min(1, "Brand name is required"),
  industry: z.string().min(1, "Industry is required"),
  foundedYear: z.number().min(1900).max(new Date().getFullYear()),
  totalOutlets: z.number().min(1, "Must have at least 1 outlet"),
  businessModel: z.string().min(1, "Business model is required"),
  franchiseFee: z.number().min(1, "Franchise fee is required"),
  royaltyPercentage: z.number().min(0).max(100, "Royalty cannot exceed 100%"),
  investmentMin: z.number().min(1, "Minimum investment is required"),
  investmentMax: z.number().min(1, "Maximum investment is required"),
  description: z
    .string()
    .min(100, "Description must be at least 100 characters"),
  support: z.object({
    training: z.string().min(1, "Training details required"),
    marketing: z.string().min(1, "Marketing support details required"),
    operations: z.string().min(1, "Operations support details required"),
  }),
});

const getSchemaForRole = (role: UserProfile["role"]) => {
  switch (role) {
    case "seller":
      return sellerSchema;
    case "buyer":
      return buyerSchema;
    case "franchisor":
      return franchisorSchema;
    case "franchisee":
      return baseSchema; // Simplified for now
    case "advisor":
      return baseSchema; // Simplified for now
    default:
      return baseSchema;
  }
};

interface ProfileFormProps {
  profile: UserProfile;
  onSubmit?: (data: any) => void;
  className?: string;
}

const industryOptions = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Manufacturing",
  "Food & Beverage",
  "Education",
  "Real Estate",
  "Automotive",
  "Other",
];

const locationOptions = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
];

export function ProfileForm({
  profile,
  onSubmit,
  className = "",
}: ProfileFormProps) {
  const schema = getSchemaForRole(profile.role);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: profile,
  });

  const handleSubmit = (data: any) => {
    console.log("Form submitted:", data);
    onSubmit?.(data);
  };

  const renderRoleSpecificFields = () => {
    switch (profile.role) {
      case "seller":
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industryOptions.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="foundedYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Founded Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2020"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your business, products, and services..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Information
                  <Badge variant="secondary">NDA Protected</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="privateInfo.askingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asking Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50000000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="privateInfo.monthlyRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Revenue (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1000000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="privateInfo.monthlyProfit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Profit (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="300000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="privateInfo.reasonForSale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Sale</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Why are you selling this business?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </>
        );

      case "buyer":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Investment Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="firmName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firm/Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your investment firm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyer Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select buyer type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual">
                          Individual Investor
                        </SelectItem>
                        <SelectItem value="corporate">
                          Corporate Buyer
                        </SelectItem>
                        <SelectItem value="pe_fund">PE/VC Fund</SelectItem>
                        <SelectItem value="strategic">
                          Strategic Buyer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="investmentRange.min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Investment (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1000000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investmentRange.max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Investment (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100000000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        );

      case "franchisor":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Franchise Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="brandName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your franchise brand" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="franchiseFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Franchise Fee (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="500000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="royaltyPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Royalty (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalOutlets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Outlets</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={`space-y-6 ${className}`}
      >
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description about yourself and your professional
                    background
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="location.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Mumbai" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Maharashtra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="India" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Make profile public</FormLabel>
                    <FormDescription>
                      Allow your profile to be discovered by other users
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Role-specific fields */}
        {renderRoleSpecificFields()}

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Profile
          </Button>
        </div>
      </form>
    </Form>
  );
}
