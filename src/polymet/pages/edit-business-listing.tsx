import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ListingWizard } from "@/polymet/components/listing-wizard";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessService } from "@/lib/business-service";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { BusinessListingFormValues } from "@/polymet/data/listing-data";

export function EditBusinessListingPage() {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState<Partial<BusinessListingFormValues>>({});

    useEffect(() => {
        async function fetchListing() {
            if (!businessId || !user) return;

            try {
                const business = await BusinessService.getBusinessById(businessId);

                if (!business) {
                    toast.error("Listing not found");
                    navigate("/dashboard");
                    return;
                }

                if (business.seller_id !== user.id) {
                    toast.error("You don't have permission to edit this listing");
                    navigate("/dashboard");
                    return;
                }

                // Transform simplified Business object back to Form Values
                // Note: This is a simplified transformation. In a real app, you'd map every field carefully.
                const formData: Partial<BusinessListingFormValues> = {
                    overview: {
                        businessName: business.name,
                        tagline: business.tagline || "",
                        industry: [business.industry], // Assuming single industry for now
                        subcategory: [], // Default empty array
                        businessType: business.business_type as any || 'asset_sale',
                        establishedYear: business.established_year,
                        numberOfEmployees: business.employees,
                        city: business.city,
                        state: business.state,
                        country: "India", // Default or fetch if available
                        yearsInOperation: business.established_year ? new Date().getFullYear() - business.established_year : 0,
                        fullAddress: business.location, // Approximate
                    },
                    description: {
                        longDescription: business.description,
                        businessModel: business.business_model as any || 'b2b',
                        customerProfile: "", // Needs to be in DB
                    },
                    financials: {
                        askingPrice: business.price,
                        revenue: { year1: business.revenue || 0, year2: 0, year3: 0 },
                        monthlyCashFlow: business.monthly_profit || 0,
                        priceBreakdown: { assets: 0, goodwill: 0, workingCapital: 0 }, // Defaults
                        financingAvailable: false,
                    },
                    contact: {
                        contactEmail: business.contact_email || user.email || "",
                        contactPhone: business.contact_phone || "",
                        preferredContactMethod: "email",
                        sellerDisplayName: "",
                        enablePublicContact: true,
                        verificationConsent: true,
                    },
                    // Logic to populate other fields would go here
                };

                setInitialData(formData);
            } catch (error) {
                console.error("Error fetching listing:", error);
                toast.error("Failed to load listing details");
            } finally {
                setLoading(false);
            }
        }

        fetchListing();
    }, [businessId, user, navigate]);

    const handleUpdate = async (data: BusinessListingFormValues) => {
        if (!businessId || !user) return;

        try {
            // Map form data back to update input
            await BusinessService.updateBusiness(businessId, {
                name: data.overview.businessName,
                industry: data.overview.industry[0],
                description: data.description.longDescription,
                city: data.overview.city,
                state: data.overview.state,
                price: data.financials.askingPrice,
                revenue: data.financials?.revenue?.year1 || 0,
                monthly_profit: data.financials.monthlyCashFlow,
                employees: data.overview.numberOfEmployees,
                tagline: data.overview.tagline,
                business_model: data.description.businessModel,
                contact_email: data.contact.contactEmail,
                contact_phone: data.contact.contactPhone,
                // Add other fields as necessary
            });

            toast.success("Listing updated successfully!");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error updating listing:", error);
            toast.error("Failed to update listing");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold">Edit Listing</h1>
                <p className="text-muted-foreground">Update your business details</p>
            </div>

            <ListingWizard
                initialData={initialData}
                onSubmit={handleUpdate}
                // In edit mode, we might disable draft saving or handle it differently
                onSave={() => { }}
            />
        </div>
    );
}
