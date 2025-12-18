import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Calculator,
    TrendingUp,
    DollarSign,
    Building2,
    Info,
    Download,
    BarChart3,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface ValuationInputs {
    annualRevenue: number;
    netProfit: number;
    growthRate: number;
    assetValue: number;
    liabilities: number;
    yearsInBusiness: number;
    industry: string;
    employees: number;
}

const industryMultipliers: Record<string, { low: number; mid: number; high: number }> = {
    technology: { low: 3.0, mid: 4.5, high: 6.0 },
    retail: { low: 1.5, mid: 2.5, high: 3.5 },
    manufacturing: { low: 2.0, mid: 3.0, high: 4.0 },
    food_beverage: { low: 1.5, mid: 2.5, high: 3.5 },
    healthcare: { low: 2.5, mid: 4.0, high: 5.5 },
    services: { low: 2.0, mid: 3.0, high: 4.5 },
    education: { low: 2.0, mid: 3.5, high: 5.0 },
    real_estate: { low: 1.5, mid: 2.5, high: 3.5 },
    other: { low: 2.0, mid: 3.0, high: 4.0 },
};

export function BusinessValuationPage() {
    const [inputs, setInputs] = useState<ValuationInputs>({
        annualRevenue: 5000000,
        netProfit: 1000000,
        growthRate: 15,
        assetValue: 2000000,
        liabilities: 500000,
        yearsInBusiness: 5,
        industry: 'services',
        employees: 10,
    });

    const [showResults, setShowResults] = useState(false);

    const handleChange = (field: keyof ValuationInputs, value: number | string) => {
        setInputs(prev => ({ ...prev, [field]: value }));
        setShowResults(false);
    };

    const calculateValuation = () => {
        const multiplier = industryMultipliers[inputs.industry] || industryMultipliers.other;

        // SDE (Seller's Discretionary Earnings) method
        const sdeMultiplierLow = multiplier.low;
        const sdeMultiplierMid = multiplier.mid;
        const sdeMultiplierHigh = multiplier.high;

        // Adjust for growth rate
        const growthAdjustment = 1 + (inputs.growthRate - 10) / 100;

        // Adjust for years in business
        const stabilityAdjustment = Math.min(1 + (inputs.yearsInBusiness - 3) * 0.05, 1.25);

        // Calculate base valuations
        const sdeLow = inputs.netProfit * sdeMultiplierLow * growthAdjustment * stabilityAdjustment;
        const sdeMid = inputs.netProfit * sdeMultiplierMid * growthAdjustment * stabilityAdjustment;
        const sdeHigh = inputs.netProfit * sdeMultiplierHigh * growthAdjustment * stabilityAdjustment;

        // Revenue multiple method (backup)
        const revenueMultiple = inputs.annualRevenue * 0.5;

        // Asset-based valuation
        const assetBased = inputs.assetValue - inputs.liabilities;

        return {
            low: Math.max(sdeLow, assetBased),
            mid: sdeMid,
            high: sdeHigh,
            revenueMultiple,
            assetBased,
            sdeRange: { low: sdeLow, mid: sdeMid, high: sdeHigh },
        };
    };

    const valuation = calculateValuation();

    const formatCurrency = (value: number) => {
        if (value >= 10000000) {
            return `₹${(value / 10000000).toFixed(2)} Cr`;
        } else if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)} L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    return (
        <div className="container max-w-5xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Calculator className="h-8 w-8 text-primary" />
                    Business Valuation Calculator
                </h1>
                <p className="text-muted-foreground mt-2">
                    Estimate your business's value using industry-standard methods
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                        <CardDescription>Enter your business details for an accurate valuation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    Annual Revenue
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Total revenue for the last fiscal year</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                    <Input
                                        type="number"
                                        value={inputs.annualRevenue}
                                        onChange={(e) => handleChange('annualRevenue', Number(e.target.value))}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    Net Profit (SDE)
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Seller's Discretionary Earnings including owner salary</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                    <Input
                                        type="number"
                                        value={inputs.netProfit}
                                        onChange={(e) => handleChange('netProfit', Number(e.target.value))}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Annual Growth Rate (%)</Label>
                                <Input
                                    type="number"
                                    value={inputs.growthRate}
                                    onChange={(e) => handleChange('growthRate', Number(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Industry</Label>
                                <Select value={inputs.industry} onValueChange={(v) => handleChange('industry', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="retail">Retail</SelectItem>
                                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                        <SelectItem value="food_beverage">Food & Beverage</SelectItem>
                                        <SelectItem value="healthcare">Healthcare</SelectItem>
                                        <SelectItem value="services">Services</SelectItem>
                                        <SelectItem value="education">Education</SelectItem>
                                        <SelectItem value="real_estate">Real Estate</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Asset Value</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                    <Input
                                        type="number"
                                        value={inputs.assetValue}
                                        onChange={(e) => handleChange('assetValue', Number(e.target.value))}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Total Liabilities</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                    <Input
                                        type="number"
                                        value={inputs.liabilities}
                                        onChange={(e) => handleChange('liabilities', Number(e.target.value))}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Years in Business</Label>
                                <Input
                                    type="number"
                                    value={inputs.yearsInBusiness}
                                    onChange={(e) => handleChange('yearsInBusiness', Number(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Number of Employees</Label>
                                <Input
                                    type="number"
                                    value={inputs.employees}
                                    onChange={(e) => handleChange('employees', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <Button onClick={() => setShowResults(true)} className="w-full">
                            <Calculator className="h-4 w-4 mr-2" />
                            Calculate Valuation
                        </Button>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                Estimated Valuation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center mb-6">
                                <p className="text-sm text-muted-foreground">Estimated Range</p>
                                <div className="flex items-baseline justify-center gap-2 mt-2">
                                    <span className="text-2xl font-bold text-primary">
                                        {formatCurrency(valuation.low)}
                                    </span>
                                    <span className="text-muted-foreground">to</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {formatCurrency(valuation.high)}
                                    </span>
                                </div>
                                <p className="text-lg font-medium text-muted-foreground mt-2">
                                    Mid: {formatCurrency(valuation.mid)}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">SDE Multiple Method</span>
                                        <span className="font-semibold">{formatCurrency(valuation.sdeRange.mid)}</span>
                                    </div>
                                    <Progress value={60} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Based on {industryMultipliers[inputs.industry]?.mid || 3}x profit multiple
                                    </p>
                                </div>

                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Revenue Multiple</span>
                                        <span className="font-semibold">{formatCurrency(valuation.revenueMultiple)}</span>
                                    </div>
                                    <Progress value={40} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Based on 0.5x annual revenue
                                    </p>
                                </div>

                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Asset-Based</span>
                                        <span className="font-semibold">{formatCurrency(valuation.assetBased)}</span>
                                    </div>
                                    <Progress value={30} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Assets minus liabilities
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Disclaimer</p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        This is an estimate for informational purposes only. For an accurate valuation,
                                        please consult with a professional business appraiser or M&A advisor.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Valuation Report (PDF)
                    </Button>
                </div>
            </div>
        </div>
    );
}
