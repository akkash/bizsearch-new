import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, MapPin, User, Loader2 } from 'lucide-react';
import type { OnboardingData } from '@/hooks/use-onboarding';

interface OnboardingStepEssentialsProps {
    data: OnboardingData;
    onUpdate: (updates: Partial<OnboardingData>) => void;
    onNext: () => void;
    onSkip: () => void;
    saving: boolean;
    error: string | null;
}

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
    'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const POPULAR_CITIES: Record<string, string[]> = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'],
    'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'],
    'Delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Saket'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
    'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'],
    'Uttar Pradesh': ['Lucknow', 'Noida', 'Ghaziabad', 'Kanpur', 'Agra', 'Varanasi'],
};

export function OnboardingStepEssentials({
    data,
    onUpdate,
    onNext,
    onSkip,
    saving,
    error,
}: OnboardingStepEssentialsProps) {
    const [localError, setLocalError] = useState<string | null>(null);

    const cities = data.state ? (POPULAR_CITIES[data.state] || []) : [];

    const handlePhoneChange = (value: string) => {
        // Only allow numbers and + sign
        const cleaned = value.replace(/[^\d+]/g, '');
        onUpdate({ phone: cleaned });
    };

    const validateAndNext = () => {
        setLocalError(null);

        // Validate phone
        if (!data.phone || data.phone.length < 10) {
            setLocalError('Please enter a valid phone number');
            return;
        }

        // Validate location
        if (!data.city || !data.state) {
            setLocalError('Please select your city and state');
            return;
        }

        onNext();
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Let's set up your profile</h2>
                <p className="text-muted-foreground mt-2">
                    Help us personalize your experience with a few details
                </p>
            </div>

            {(error || localError) && (
                <Alert variant="destructive">
                    <AlertDescription>{error || localError}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-6">
                {/* Phone Number */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Phone className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <Label htmlFor="phone" className="text-base font-medium">
                                        Phone Number
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        We'll use this for important updates and verification
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-20">
                                        <Input
                                            value="+91"
                                            disabled
                                            className="text-center bg-muted"
                                        />
                                    </div>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="9876543210"
                                        value={data.phone.replace('+91', '')}
                                        onChange={(e) => handlePhoneChange('+91' + e.target.value)}
                                        maxLength={10}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <MapPin className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <Label className="text-base font-medium">
                                        Your Location
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Helps us show relevant businesses and franchises near you
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="state" className="text-sm">State</Label>
                                        <Select
                                            value={data.state}
                                            onValueChange={(value) => {
                                                onUpdate({ state: value, city: '' });
                                            }}
                                        >
                                            <SelectTrigger id="state">
                                                <SelectValue placeholder="Select state" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {INDIAN_STATES.map((state) => (
                                                    <SelectItem key={state} value={state}>
                                                        {state}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="city" className="text-sm">City</Label>
                                        {cities.length > 0 ? (
                                            <Select
                                                value={data.city}
                                                onValueChange={(value) => onUpdate({ city: value })}
                                            >
                                                <SelectTrigger id="city">
                                                    <SelectValue placeholder="Select city" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {cities.map((city) => (
                                                        <SelectItem key={city} value={city}>
                                                            {city}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                id="city"
                                                placeholder="Enter city"
                                                value={data.city}
                                                onChange={(e) => onUpdate({ city: e.target.value })}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bio (optional) */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <User className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <Label htmlFor="bio" className="text-base font-medium">
                                        About You <span className="text-muted-foreground font-normal">(optional)</span>
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        A brief introduction helps others know who they're dealing with
                                    </p>
                                </div>
                                <Textarea
                                    id="bio"
                                    placeholder="I'm a business professional looking to..."
                                    value={data.bio}
                                    onChange={(e) => onUpdate({ bio: e.target.value })}
                                    rows={3}
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {data.bio.length}/500 characters
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
                <Button
                    variant="ghost"
                    onClick={onSkip}
                >
                    Skip for now
                </Button>
                <Button
                    onClick={validateAndNext}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Continue'
                    )}
                </Button>
            </div>
        </div>
    );
}
