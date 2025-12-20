
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Briefcase,
    TrendingUp,
    Building2,
    Store,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import type { OnboardingData } from '@/hooks/use-onboarding';
import type { Profile } from '@/types/auth.types';
import { BUSINESS_INDUSTRIES, FRANCHISE_INDUSTRIES } from '@/data/categories';

interface OnboardingStepRoleProps {
    data: OnboardingData;
    profile: Profile | null;
    onUpdate: (updates: Partial<OnboardingData>) => void;
    onNext: () => void;
    onBack: () => void;
    saving: boolean;
    error: string | null;
}

// Use BUSINESS_INDUSTRIES for business buyers/sellers, FRANCHISE_INDUSTRIES for franchise roles

const BUYER_TYPES = [
    { value: 'individual', label: 'Individual Investor' },
    { value: 'corporate', label: 'Corporate Buyer' },
    { value: 'pe_fund', label: 'PE/VC Fund' },
    { value: 'strategic', label: 'Strategic Buyer' },
    { value: 'first_time', label: 'First-time Buyer' },
];

const INVESTMENT_RANGES = [
    { value: '500000', label: '₹5 Lakh' },
    { value: '1000000', label: '₹10 Lakh' },
    { value: '2500000', label: '₹25 Lakh' },
    { value: '5000000', label: '₹50 Lakh' },
    { value: '10000000', label: '₹1 Crore' },
    { value: '25000000', label: '₹2.5 Crore' },
    { value: '50000000', label: '₹5 Crore' },
    { value: '100000000', label: '₹10 Crore' },
    { value: '500000000', label: '₹50 Crore+' },
];

export function OnboardingStepRole({
    data,
    profile,
    onUpdate,
    onNext,
    onBack,
    saving,
    error,
}: OnboardingStepRoleProps) {
    const role = profile?.role || 'buyer';

    const updateRoleData = (key: string, value: any) => {
        onUpdate({
            roleData: { ...data.roleData, [key]: value }
        });
    };

    const getRoleIcon = () => {
        switch (role) {
            case 'buyer': return TrendingUp;
            case 'seller': return Building2;
            case 'franchisor': return Store;
            case 'franchisee': return Store;
            default: return Briefcase;
        }
    };

    const getRoleTitle = () => {
        switch (role) {
            case 'buyer': return 'Investment Preferences';
            case 'seller': return 'Business Details';
            case 'franchisor': return 'Franchise Information';
            case 'franchisee': return 'Franchisee Preferences';
            case 'advisor': return 'Professional Details';
            case 'broker': return 'Brokerage Details';
            default: return 'Additional Information';
        }
    };

    const RoleIcon = getRoleIcon();

    const renderBuyerFields = () => (
        <div className="space-y-4">
            <div>
                <Label htmlFor="buyer_type">What type of buyer are you?</Label>
                <Select
                    value={data.roleData.buyer_type || ''}
                    onValueChange={(value) => updateRoleData('buyer_type', value)}
                >
                    <SelectTrigger id="buyer_type">
                        <SelectValue placeholder="Select your buyer type" />
                    </SelectTrigger>
                    <SelectContent>
                        {BUYER_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="investment_min">Minimum Investment</Label>
                    <Select
                        value={data.roleData.investment_min?.toString() || ''}
                        onValueChange={(value) => updateRoleData('investment_min', parseInt(value))}
                    >
                        <SelectTrigger id="investment_min">
                            <SelectValue placeholder="Min budget" />
                        </SelectTrigger>
                        <SelectContent>
                            {INVESTMENT_RANGES.slice(0, -1).map((range) => (
                                <SelectItem key={range.value} value={range.value}>
                                    {range.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="investment_max">Maximum Investment</Label>
                    <Select
                        value={data.roleData.investment_max?.toString() || ''}
                        onValueChange={(value) => updateRoleData('investment_max', parseInt(value))}
                    >
                        <SelectTrigger id="investment_max">
                            <SelectValue placeholder="Max budget" />
                        </SelectTrigger>
                        <SelectContent>
                            {INVESTMENT_RANGES.map((range) => (
                                <SelectItem key={range.value} value={range.value}>
                                    {range.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label>Preferred Industries</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {[...BUSINESS_INDUSTRIES, ...FRANCHISE_INDUSTRIES.filter(f => !BUSINESS_INDUSTRIES.includes(f))].map((industry) => {
                        const selected = (data.roleData.preferred_industries || []).includes(industry);
                        return (
                            <Badge
                                key={industry}
                                variant={selected ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                    const current = data.roleData.preferred_industries || [];
                                    const updated = selected
                                        ? current.filter((i: string) => i !== industry)
                                        : [...current, industry];
                                    updateRoleData('preferred_industries', updated);
                                }}
                            >
                                {industry}
                            </Badge>
                        );
                    })}
                </div>
            </div>

            <div>
                <Label htmlFor="investment_criteria">What are you looking for?</Label>
                <Textarea
                    id="investment_criteria"
                    placeholder="Describe your ideal business acquisition (e.g., profitable SaaS with recurring revenue, established manufacturing unit, etc.)"
                    value={data.roleData.investment_criteria || ''}
                    onChange={(e) => updateRoleData('investment_criteria', e.target.value)}
                    rows={3}
                />
            </div>
        </div>
    );

    const renderSellerFields = () => (
        <div className="space-y-4">
            <div>
                <Label htmlFor="industry">Business Industry</Label>
                <Select
                    value={data.roleData.industry || ''}
                    onValueChange={(value) => updateRoleData('industry', value)}
                >
                    <SelectTrigger id="industry">
                        <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                        {BUSINESS_INDUSTRIES.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                                {industry}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="founded_year">Year Founded</Label>
                    <Input
                        id="founded_year"
                        type="number"
                        placeholder="e.g., 2015"
                        value={data.roleData.founded_year || ''}
                        onChange={(e) => updateRoleData('founded_year', parseInt(e.target.value))}
                        min={1900}
                        max={new Date().getFullYear()}
                    />
                </div>
                <div>
                    <Label htmlFor="employees">Number of Employees</Label>
                    <Input
                        id="employees"
                        type="number"
                        placeholder="e.g., 25"
                        value={data.roleData.employees || ''}
                        onChange={(e) => updateRoleData('employees', parseInt(e.target.value))}
                        min={1}
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="asking_price">Expected Valuation (₹)</Label>
                <Select
                    value={data.roleData.asking_price?.toString() || ''}
                    onValueChange={(value) => updateRoleData('asking_price', parseInt(value))}
                >
                    <SelectTrigger id="asking_price">
                        <SelectValue placeholder="Select expected valuation" />
                    </SelectTrigger>
                    <SelectContent>
                        {INVESTMENT_RANGES.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                                {range.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                    This is only visible to verified buyers who sign NDA
                </p>
            </div>
        </div>
    );

    const renderFranchisorFields = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="total_outlets">Total Outlets</Label>
                    <Input
                        id="total_outlets"
                        type="number"
                        placeholder="e.g., 50"
                        value={data.roleData.total_outlets || ''}
                        onChange={(e) => updateRoleData('total_outlets', parseInt(e.target.value))}
                        min={1}
                    />
                </div>
                <div>
                    <Label htmlFor="franchise_fee">Franchise Fee (₹)</Label>
                    <Input
                        id="franchise_fee"
                        type="number"
                        placeholder="e.g., 500000"
                        value={data.roleData.franchise_fee || ''}
                        onChange={(e) => updateRoleData('franchise_fee', parseInt(e.target.value))}
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="royalty_percentage">Royalty Percentage (%)</Label>
                <Input
                    id="royalty_percentage"
                    type="number"
                    placeholder="e.g., 5"
                    value={data.roleData.royalty_percentage || ''}
                    onChange={(e) => updateRoleData('royalty_percentage', parseFloat(e.target.value))}
                    min={0}
                    max={100}
                    step={0.5}
                />
            </div>
        </div>
    );

    const renderFranchiseeFields = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="investment_min">Budget Minimum</Label>
                    <Select
                        value={data.roleData.investment_min?.toString() || ''}
                        onValueChange={(value) => updateRoleData('investment_min', parseInt(value))}
                    >
                        <SelectTrigger id="investment_min">
                            <SelectValue placeholder="Min budget" />
                        </SelectTrigger>
                        <SelectContent>
                            {INVESTMENT_RANGES.slice(0, -1).map((range) => (
                                <SelectItem key={range.value} value={range.value}>
                                    {range.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="investment_max">Budget Maximum</Label>
                    <Select
                        value={data.roleData.investment_max?.toString() || ''}
                        onValueChange={(value) => updateRoleData('investment_max', parseInt(value))}
                    >
                        <SelectTrigger id="investment_max">
                            <SelectValue placeholder="Max budget" />
                        </SelectTrigger>
                        <SelectContent>
                            {INVESTMENT_RANGES.map((range) => (
                                <SelectItem key={range.value} value={range.value}>
                                    {range.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label>Preferred Industries</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {FRANCHISE_INDUSTRIES.map((industry) => {
                        const selected = (data.roleData.preferred_industries || []).includes(industry);
                        return (
                            <Badge
                                key={industry}
                                variant={selected ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                    const current = data.roleData.preferred_industries || [];
                                    const updated = selected
                                        ? current.filter((i: string) => i !== industry)
                                        : [...current, industry];
                                    updateRoleData('preferred_industries', updated);
                                }}
                            >
                                {industry}
                            </Badge>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderAdvisorBrokerFields = () => (
        <div className="space-y-4">
            <div>
                <Label htmlFor="linkedin_url">LinkedIn Profile URL</Label>
                <Input
                    id="linkedin_url"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={data.roleData.linkedin_url || ''}
                    onChange={(e) => updateRoleData('linkedin_url', e.target.value)}
                />
            </div>

            <div>
                <Label>Specializations</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {[...BUSINESS_INDUSTRIES, ...FRANCHISE_INDUSTRIES.filter(f => !BUSINESS_INDUSTRIES.includes(f))].map((industry) => {
                        const selected = (data.roleData.specializations || []).includes(industry);
                        return (
                            <Badge
                                key={industry}
                                variant={selected ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                    const current = data.roleData.specializations || [];
                                    const updated = selected
                                        ? current.filter((i: string) => i !== industry)
                                        : [...current, industry];
                                    updateRoleData('specializations', updated);
                                }}
                            >
                                {industry}
                            </Badge>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderFieldsByRole = () => {
        switch (role) {
            case 'buyer':
                return renderBuyerFields();
            case 'seller':
                return renderSellerFields();
            case 'franchisor':
                return renderFranchisorFields();
            case 'franchisee':
                return renderFranchiseeFields();
            case 'advisor':
            case 'broker':
                return renderAdvisorBrokerFields();
            default:
                return (
                    <p className="text-muted-foreground text-center py-8">
                        No additional information needed for your role.
                    </p>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Tell us more about your goals</h2>
                <p className="text-muted-foreground mt-2">
                    This helps us match you with the right opportunities
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <RoleIcon className="w-5 h-5 text-primary" />
                        </div>
                        {getRoleTitle()}
                        <Badge variant="secondary" className="ml-auto capitalize">
                            {role}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {renderFieldsByRole()}
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between pt-4">
                <Button
                    variant="ghost"
                    onClick={onBack}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Complete Setup'
                    )}
                </Button>
            </div>
        </div>
    );
}
