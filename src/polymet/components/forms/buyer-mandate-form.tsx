import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, Briefcase, DollarSign, Target, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { industryOptions } from "@/polymet/data/listing-data";

// Schema matching buyer_details table
const buyerMandateSchema = z.object({
    buyer_type: z.enum(["individual", "private-equity", "venture-capital", "strategic", "corporate"], {
        required_error: "Please select a buyer type",
    }),
    firm_name: z.string().optional(),
    investment_min: z.number().min(0, "Minimum investment must be positive"),
    investment_max: z.number().min(0, "Maximum investment must be positive"),
    preferred_industries: z.array(z.string()).min(1, "Select at least one industry"),
    preferred_locations: z.array(z.string()).optional(), // Store as array of strings (State/City)
    investment_criteria: z.string().min(20, "Please provide more detail about your investment criteria"),
    financing_preference: z.enum(["cash", "sba-loan", "seller-financing", "mixed"], {
        required_error: "Please select a financing preference",
    }),
    timeline: z.string().optional(),
    experience: z.string().optional(),
});

type BuyerMandateFormValues = z.infer<typeof buyerMandateSchema>;

export function BuyerMandateForm() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const form = useForm<BuyerMandateFormValues>({
        resolver: zodResolver(buyerMandateSchema),
        defaultValues: {
            buyer_type: "individual",
            firm_name: "",
            investment_min: 1000000,
            investment_max: 10000000,
            preferred_industries: [],
            preferred_locations: [],
            investment_criteria: "",
            financing_preference: "cash",
            timeline: "Immediately",
            experience: "",
        },
    });

    // Fetch existing buyer details
    useEffect(() => {
        async function fetchBuyerDetails() {
            if (!user?.id) return;

            try {
                const { data, error } = await supabase
                    .from('buyer_details')
                    .select('*')
                    .eq('profile_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                    console.error('Error fetching buyer details:', error);
                    toast.error("Failed to load your mandate.");
                }

                if (data) {
                    form.reset({
                        buyer_type: data.buyer_type || "individual",
                        firm_name: data.firm_name || "",
                        investment_min: Number(data.investment_min) || 0,
                        investment_max: Number(data.investment_max) || 0,
                        preferred_industries: data.preferred_industries || [],
                        preferred_locations: data.preferred_locations || [],
                        investment_criteria: data.investment_criteria || "",
                        financing_preference: data.financing_preference || "cash",
                        timeline: data.timeline || "",
                        experience: data.experience || "",
                    });
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchBuyerDetails();
    }, [user?.id, form]);

    const onSubmit = async (data: BuyerMandateFormValues) => {
        if (!user?.id) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('buyer_details')
                .upsert({
                    profile_id: user.id,
                    ...data,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            toast.success("Investment mandate updated successfully! Relevant deals will be matched to you.");
        } catch (error) {
            console.error("Error saving mandate:", error);
            toast.error("Failed to save investment mandate.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="w-6 h-6 text-primary" />
                    Investment Mandate
                </CardTitle>
                <CardDescription>
                    Define your acquisition criteria. This serves as your "Buyer Profile" and helps sellers match with you.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Buyer Identity */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <User className="w-4 h-4" /> Buyer Identity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Buyer Type</Label>
                                <Select
                                    onValueChange={(val) => form.setValue("buyer_type", val as any)}
                                    defaultValue={form.watch("buyer_type")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual">Individual / Entrepreneur</SelectItem>
                                        <SelectItem value="private-equity">Private Equity Group</SelectItem>
                                        <SelectItem value="venture-capital">Venture Capital</SelectItem>
                                        <SelectItem value="strategic">Strategic Buyer (Corporate)</SelectItem>
                                        <SelectItem value="corporate">Family Office</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.buyer_type && <p className="text-red-500 text-sm">{form.formState.errors.buyer_type.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Firm / Company Name (Optional)</Label>
                                <Input {...form.register("firm_name")} placeholder="e.g. Acme Holdings" />
                            </div>
                        </div>
                    </div>

                    {/* Investment Capability */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Deal Size & Financing
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Investment (₹)</Label>
                                <Input
                                    type="number"
                                    {...form.register("investment_min", { valueAsNumber: true })}
                                />
                                {form.formState.errors.investment_min && <p className="text-red-500 text-sm">{form.formState.errors.investment_min.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Max Investment (₹)</Label>
                                <Input
                                    type="number"
                                    {...form.register("investment_max", { valueAsNumber: true })}
                                />
                                {form.formState.errors.investment_max && <p className="text-red-500 text-sm">{form.formState.errors.investment_max.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Financing Preference</Label>
                                <Select
                                    onValueChange={(val) => form.setValue("financing_preference", val as any)}
                                    defaultValue={form.watch("financing_preference")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="How will you fund this?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">All Cash / Proof of Funds</SelectItem>
                                        <SelectItem value="sba-loan">Bank Loan / Debt</SelectItem>
                                        <SelectItem value="seller-financing">Seller Financing Required</SelectItem>
                                        <SelectItem value="mixed">Mix of Cash & Debt</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Acquisition Preferences
                        </h3>

                        <div className="space-y-2">
                            <Label className="mb-2 block">Preferred Industries</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 h-40 overflow-y-auto border p-2 rounded-md">
                                {industryOptions.map((ind) => (
                                    <div key={ind.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`ind-${ind.value}`}
                                            checked={form.watch("preferred_industries")?.includes(ind.value)}
                                            onCheckedChange={(checked) => {
                                                const current = form.watch("preferred_industries") || [];
                                                if (checked) form.setValue("preferred_industries", [...current, ind.value]);
                                                else form.setValue("preferred_industries", current.filter(v => v !== ind.value));
                                            }}
                                        />
                                        <Label htmlFor={`ind-${ind.value}`} className="cursor-pointer font-normal text-sm">{ind.label}</Label>
                                    </div>
                                ))}
                            </div>
                            {form.formState.errors.preferred_industries && <p className="text-red-500 text-sm">{form.formState.errors.preferred_industries.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Investment Criteria</Label>
                            <Textarea
                                {...form.register("investment_criteria")}
                                placeholder="Describe what you are looking for. E.g. 'Looking for SaaS businesses with $1M ARR and low churn' or 'Manufacturing plants in Gujarat'."
                                className="min-h-[100px]"
                            />
                            {form.formState.errors.investment_criteria && <p className="text-red-500 text-sm">{form.formState.errors.investment_criteria.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Timeline</Label>
                            <Select
                                onValueChange={(val) => form.setValue("timeline", val)}
                                defaultValue={form.watch("timeline")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="When are you looking to buy?" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Immediately">Immediately</SelectItem>
                                    <SelectItem value="1-3 Months">1-3 Months</SelectItem>
                                    <SelectItem value="3-6 Months">3-6 Months</SelectItem>
                                    <SelectItem value="Exploring">Just Exploring</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Relevant Experience (Optional)</Label>
                            <Textarea
                                {...form.register("experience")}
                                placeholder="Briefly describe your background or previous acquisitions."
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={saving} className="w-full md:w-auto">
                        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Mandate...</> : <><Save className="w-4 h-4 mr-2" /> Save Investment Mandate</>}
                    </Button>

                </form>
            </CardContent>
        </Card>
    );
}
