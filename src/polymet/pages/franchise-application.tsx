import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface FranchiseInfo {
    id: string;
    brand_name: string;
    logo_url: string | null;
    investment_range_min: number;
    investment_range_max: number;
}

const steps = [
    { id: 1, name: 'Personal Information' },
    { id: 2, name: 'Financial Background' },
    { id: 3, name: 'Location Preferences' },
    { id: 4, name: 'Experience & Goals' },
    { id: 5, name: 'Review & Submit' },
];

export function FranchiseApplicationPage() {
    const { franchiseId } = useParams<{ franchiseId: string }>();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [franchise, setFranchise] = useState<FranchiseInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        // Personal Info
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',

        // Financial Background
        netWorth: '',
        liquidCapital: '',
        investmentTimeline: '',
        financingNeeded: false,
        creditScore: '',

        // Location Preferences
        preferredStates: [] as string[],
        preferredCities: '',
        openToRelocation: false,
        hasLocation: false,
        locationDetails: '',

        // Experience & Goals
        businessExperience: '',
        industryExperience: '',
        whyThisFranchise: '',
        goals: '',
        availability: '',

        // Agreements
        agreedToTerms: false,
        agreedToContact: false,
    });

    useEffect(() => {
        const loadFranchise = async () => {
            if (!franchiseId) return;
            const { data } = await supabase
                .from('franchises')
                .select('id, brand_name, logo_url, investment_range_min, investment_range_max')
                .eq('id', franchiseId)
                .single();

            if (data) {
                setFranchise(data);
            }
            setLoading(false);
        };

        loadFranchise();
    }, [franchiseId]);

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                fullName: profile.display_name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                city: profile.city || '',
                state: profile.state || '',
            }));
        }
    }, [profile]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!user || !franchiseId) return;

        setSubmitting(true);
        try {
            const { error } = await supabase.from('franchise_applications').insert({
                franchise_id: franchiseId,
                user_id: user.id,
                status: 'submitted',
                personal_info: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                },
                financial_info: {
                    netWorth: formData.netWorth,
                    liquidCapital: formData.liquidCapital,
                    investmentTimeline: formData.investmentTimeline,
                    financingNeeded: formData.financingNeeded,
                    creditScore: formData.creditScore,
                },
                location_preferences: {
                    preferredStates: formData.preferredStates,
                    preferredCities: formData.preferredCities,
                    openToRelocation: formData.openToRelocation,
                    hasLocation: formData.hasLocation,
                    locationDetails: formData.locationDetails,
                },
                experience_info: {
                    businessExperience: formData.businessExperience,
                    industryExperience: formData.industryExperience,
                    whyThisFranchise: formData.whyThisFranchise,
                    goals: formData.goals,
                    availability: formData.availability,
                },
            });

            if (error) throw error;

            toast.success('Application submitted successfully!');
            navigate('/my-applications');
        } catch (error) {
            console.error('Error submitting application:', error);
            toast.error('Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!franchise) {
        return (
            <div className="container max-w-4xl mx-auto py-12 text-center">
                <p className="text-muted-foreground">Franchise not found</p>
                <Button variant="link" onClick={() => navigate('/franchises')}>
                    Browse Franchises
                </Button>
            </div>
        );
    }

    const progress = (currentStep / steps.length) * 100;

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <div className="flex items-center gap-4 mb-4">
                    {franchise.logo_url ? (
                        <img src={franchise.logo_url} alt={franchise.brand_name} className="w-16 h-16 object-contain rounded-lg" />
                    ) : (
                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-primary" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold">Apply for {franchise.brand_name}</h1>
                        <p className="text-muted-foreground">
                            Investment: ₹{(franchise.investment_range_min / 100000).toFixed(0)}L - ₹{(franchise.investment_range_max / 100000).toFixed(0)}L
                        </p>
                    </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Step {currentStep} of {steps.length}</span>
                        <span>{steps[currentStep - 1].name}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Tell us about yourself</CardDescription>
                            </CardHeader>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Full Name *</Label>
                                    <Input
                                        value={formData.fullName}
                                        onChange={(e) => handleChange('fullName', e.target.value)}
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email *</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone *</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Address</Label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        placeholder="Street address"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>City *</Label>
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => handleChange('city', e.target.value)}
                                        placeholder="City"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>State *</Label>
                                    <Input
                                        value={formData.state}
                                        onChange={(e) => handleChange('state', e.target.value)}
                                        placeholder="State"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>PIN Code</Label>
                                    <Input
                                        value={formData.pincode}
                                        onChange={(e) => handleChange('pincode', e.target.value)}
                                        placeholder="PIN Code"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Financial Background */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Financial Background</CardTitle>
                                <CardDescription>Help us understand your financial readiness</CardDescription>
                            </CardHeader>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Net Worth (₹)</Label>
                                    <Select value={formData.netWorth} onValueChange={(v) => handleChange('netWorth', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10-25L">₹10-25 Lakhs</SelectItem>
                                            <SelectItem value="25-50L">₹25-50 Lakhs</SelectItem>
                                            <SelectItem value="50L-1Cr">₹50 Lakhs - 1 Crore</SelectItem>
                                            <SelectItem value="1-5Cr">₹1-5 Crores</SelectItem>
                                            <SelectItem value="5Cr+">₹5+ Crores</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Liquid Capital Available (₹)</Label>
                                    <Select value={formData.liquidCapital} onValueChange={(v) => handleChange('liquidCapital', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5-10L">₹5-10 Lakhs</SelectItem>
                                            <SelectItem value="10-25L">₹10-25 Lakhs</SelectItem>
                                            <SelectItem value="25-50L">₹25-50 Lakhs</SelectItem>
                                            <SelectItem value="50L-1Cr">₹50 Lakhs - 1 Crore</SelectItem>
                                            <SelectItem value="1Cr+">₹1+ Crore</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Investment Timeline</Label>
                                    <Select value={formData.investmentTimeline} onValueChange={(v) => handleChange('investmentTimeline', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="When do you plan to invest?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="immediate">Immediately</SelectItem>
                                            <SelectItem value="1-3months">1-3 Months</SelectItem>
                                            <SelectItem value="3-6months">3-6 Months</SelectItem>
                                            <SelectItem value="6-12months">6-12 Months</SelectItem>
                                            <SelectItem value="1year+">1+ Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Credit Score (Optional)</Label>
                                    <Select value={formData.creditScore} onValueChange={(v) => handleChange('creditScore', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="750+">Excellent (750+)</SelectItem>
                                            <SelectItem value="700-750">Good (700-750)</SelectItem>
                                            <SelectItem value="650-700">Fair (650-700)</SelectItem>
                                            <SelectItem value="below650">Below 650</SelectItem>
                                            <SelectItem value="unknown">Don't Know</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={formData.financingNeeded}
                                    onCheckedChange={(v) => handleChange('financingNeeded', v)}
                                />
                                <Label>I may need financing assistance</Label>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Location Preferences */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Location Preferences</CardTitle>
                                <CardDescription>Where would you like to operate?</CardDescription>
                            </CardHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Preferred Cities</Label>
                                    <Textarea
                                        value={formData.preferredCities}
                                        onChange={(e) => handleChange('preferredCities', e.target.value)}
                                        placeholder="List your preferred cities (e.g., Mumbai, Pune, Bangalore)"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={formData.openToRelocation}
                                        onCheckedChange={(v) => handleChange('openToRelocation', v)}
                                    />
                                    <Label>I'm open to relocating for the right opportunity</Label>
                                </div>
                                <Separator />
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={formData.hasLocation}
                                        onCheckedChange={(v) => handleChange('hasLocation', v)}
                                    />
                                    <Label>I already have a location in mind</Label>
                                </div>
                                {formData.hasLocation && (
                                    <div className="space-y-2">
                                        <Label>Location Details</Label>
                                        <Textarea
                                            value={formData.locationDetails}
                                            onChange={(e) => handleChange('locationDetails', e.target.value)}
                                            placeholder="Describe the location (address, size, current use, etc.)"
                                            rows={3}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Experience & Goals */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Experience & Goals</CardTitle>
                                <CardDescription>Tell us about your background and vision</CardDescription>
                            </CardHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Business Experience</Label>
                                    <Select value={formData.businessExperience} onValueChange={(v) => handleChange('businessExperience', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your experience level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No prior business ownership</SelectItem>
                                            <SelectItem value="1-3years">1-3 years</SelectItem>
                                            <SelectItem value="3-5years">3-5 years</SelectItem>
                                            <SelectItem value="5-10years">5-10 years</SelectItem>
                                            <SelectItem value="10+years">10+ years</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Industry Experience</Label>
                                    <Textarea
                                        value={formData.industryExperience}
                                        onChange={(e) => handleChange('industryExperience', e.target.value)}
                                        placeholder="Describe any relevant industry experience"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Why This Franchise?</Label>
                                    <Textarea
                                        value={formData.whyThisFranchise}
                                        onChange={(e) => handleChange('whyThisFranchise', e.target.value)}
                                        placeholder="What attracted you to this franchise opportunity?"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Your Goals</Label>
                                    <Textarea
                                        value={formData.goals}
                                        onChange={(e) => handleChange('goals', e.target.value)}
                                        placeholder="What do you hope to achieve as a franchisee?"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Availability</Label>
                                    <Select value={formData.availability} onValueChange={(v) => handleChange('availability', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="How will you be involved?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fulltime">Full-time owner-operator</SelectItem>
                                            <SelectItem value="parttime">Part-time with manager</SelectItem>
                                            <SelectItem value="investor">Investor/Semi-absentee</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review & Submit */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Review & Submit</CardTitle>
                                <CardDescription>Please review your application before submitting</CardDescription>
                            </CardHeader>

                            <div className="space-y-4">
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h3 className="font-medium mb-2">Personal Information</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {formData.fullName} • {formData.email} • {formData.phone}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {[formData.city, formData.state].filter(Boolean).join(', ')}
                                    </p>
                                </div>

                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h3 className="font-medium mb-2">Financial Background</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Net Worth: {formData.netWorth || 'Not specified'} •
                                        Liquid Capital: {formData.liquidCapital || 'Not specified'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Timeline: {formData.investmentTimeline || 'Not specified'}
                                        {formData.financingNeeded && ' • Financing assistance needed'}
                                    </p>
                                </div>

                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h3 className="font-medium mb-2">Location Preferences</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {formData.preferredCities || 'No specific cities mentioned'}
                                        {formData.openToRelocation && ' • Open to relocation'}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        checked={formData.agreedToTerms}
                                        onCheckedChange={(v) => handleChange('agreedToTerms', v)}
                                    />
                                    <Label className="text-sm">
                                        I agree to the <Link to="/terms" className="text-primary underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>
                                    </Label>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        checked={formData.agreedToContact}
                                        onCheckedChange={(v) => handleChange('agreedToContact', v)}
                                    />
                                    <Label className="text-sm">
                                        I consent to being contacted by {franchise.brand_name} regarding this application
                                    </Label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Previous
                        </Button>

                        {currentStep < steps.length ? (
                            <Button onClick={nextStep}>
                                Next
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={!formData.agreedToTerms || !formData.agreedToContact || submitting}
                            >
                                {submitting ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                Submit Application
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
