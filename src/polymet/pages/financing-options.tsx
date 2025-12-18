import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    CreditCard,
    Building,
    Percent,
    Calculator,
    ArrowRight,
    CheckCircle,
    ExternalLink,
    Phone,
    FileText,
} from 'lucide-react';

const financingPartners = [
    {
        id: 1,
        name: 'HDFC Bank',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg',
        type: 'Bank Loan',
        interestRate: '10.5% - 12.5%',
        maxAmount: '₹2 Crores',
        tenure: 'Up to 7 years',
        features: ['No collateral up to ₹50L', 'Quick approval', 'Flexible EMI'],
    },
    {
        id: 2,
        name: 'ICICI Bank',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg',
        type: 'Bank Loan',
        interestRate: '11% - 13%',
        maxAmount: '₹1.5 Crores',
        tenure: 'Up to 5 years',
        features: ['Doorstep service', 'Online tracking', 'Part-prepayment allowed'],
    },
    {
        id: 3,
        name: 'Bajaj Finserv',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Bajaj_Finserv_Logo.png',
        type: 'NBFC',
        interestRate: '12% - 16%',
        maxAmount: '₹75 Lakhs',
        tenure: 'Up to 5 years',
        features: ['Minimal documentation', '48-hour disbursal', 'No hidden charges'],
    },
    {
        id: 4,
        name: 'Tata Capital',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg',
        type: 'NBFC',
        interestRate: '11.5% - 14%',
        maxAmount: '₹1 Crore',
        tenure: 'Up to 6 years',
        features: ['Dedicated relationship manager', 'Working capital options', 'Balance transfer facility'],
    },
];

const governmentSchemes = [
    {
        name: 'PMEGP',
        fullName: 'Prime Minister Employment Generation Programme',
        subsidy: 'Up to 35% of project cost',
        eligibility: 'First-generation entrepreneurs',
        maxLoan: '₹25 Lakhs (Manufacturing)',
    },
    {
        name: 'Mudra Loan',
        fullName: 'Pradhan Mantri Mudra Yojana',
        subsidy: 'Low interest rates',
        eligibility: 'Small business owners',
        maxLoan: '₹10 Lakhs',
    },
    {
        name: 'Stand-Up India',
        fullName: 'Stand-Up India Scheme',
        subsidy: 'Composite loan with working capital',
        eligibility: 'SC/ST/Women entrepreneurs',
        maxLoan: '₹1 Crore',
    },
];

export function FinancingOptionsPage() {
    const [loanAmount, setLoanAmount] = useState(2500000);
    const [tenure, setTenure] = useState(60);
    const [interestRate, setInterestRate] = useState(12);

    const calculateEMI = () => {
        const principal = loanAmount;
        const monthlyRate = interestRate / 12 / 100;
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
        return Math.round(emi);
    };

    const totalAmount = calculateEMI() * tenure;
    const totalInterest = totalAmount - loanAmount;

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Financing Options</h1>
                <p className="text-muted-foreground mt-2">
                    Explore funding options to help you start your franchise journey
                </p>
            </div>

            <Tabs defaultValue="partners">
                <TabsList className="mb-6">
                    <TabsTrigger value="partners" className="gap-2">
                        <Building className="h-4 w-4" />
                        Financing Partners
                    </TabsTrigger>
                    <TabsTrigger value="calculator" className="gap-2">
                        <Calculator className="h-4 w-4" />
                        EMI Calculator
                    </TabsTrigger>
                    <TabsTrigger value="schemes" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Government Schemes
                    </TabsTrigger>
                </TabsList>

                {/* Financing Partners */}
                <TabsContent value="partners">
                    <div className="grid gap-6 md:grid-cols-2">
                        {financingPartners.map((partner) => (
                            <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center p-2">
                                                <Building className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{partner.name}</CardTitle>
                                                <Badge variant="outline">{partner.type}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Interest Rate</p>
                                            <p className="font-semibold text-green-600">{partner.interestRate}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Max Amount</p>
                                            <p className="font-semibold">{partner.maxAmount}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tenure</p>
                                            <p className="font-semibold">{partner.tenure}</p>
                                        </div>
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="space-y-2 mb-4">
                                        {partner.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button className="flex-1">
                                            Apply Now
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                        <Button variant="outline" size="icon">
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/20 rounded-lg">
                                    <CreditCard className="h-8 w-8 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">Need Help Choosing?</h3>
                                    <p className="text-muted-foreground">
                                        Our financing advisors can help you find the best option for your franchise investment
                                    </p>
                                </div>
                                <Button>
                                    Talk to an Advisor
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* EMI Calculator */}
                <TabsContent value="calculator">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5" />
                                    EMI Calculator
                                </CardTitle>
                                <CardDescription>
                                    Calculate your monthly payments
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Loan Amount</Label>
                                        <span className="text-sm font-medium">₹{(loanAmount / 100000).toFixed(1)} Lakhs</span>
                                    </div>
                                    <Input
                                        type="range"
                                        min="500000"
                                        max="20000000"
                                        step="100000"
                                        value={loanAmount}
                                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>₹5L</span>
                                        <span>₹2Cr</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Interest Rate (%)</Label>
                                        <span className="text-sm font-medium">{interestRate}%</span>
                                    </div>
                                    <Input
                                        type="range"
                                        min="8"
                                        max="20"
                                        step="0.5"
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>8%</span>
                                        <span>20%</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Tenure (Months)</Label>
                                        <span className="text-sm font-medium">{tenure} months ({(tenure / 12).toFixed(1)} years)</span>
                                    </div>
                                    <Input
                                        type="range"
                                        min="12"
                                        max="84"
                                        step="6"
                                        value={tenure}
                                        onChange={(e) => setTenure(Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>1 year</span>
                                        <span>7 years</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Your EMI Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center mb-8">
                                    <p className="text-sm text-muted-foreground">Monthly EMI</p>
                                    <p className="text-4xl font-bold text-primary">₹{calculateEMI().toLocaleString()}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between p-4 bg-muted/50 rounded-lg">
                                        <span className="text-muted-foreground">Principal Amount</span>
                                        <span className="font-semibold">₹{loanAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between p-4 bg-muted/50 rounded-lg">
                                        <span className="text-muted-foreground">Total Interest</span>
                                        <span className="font-semibold text-orange-600">₹{totalInterest.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between p-4 bg-primary/10 rounded-lg">
                                        <span className="font-medium">Total Amount Payable</span>
                                        <span className="font-bold text-primary">₹{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Button className="w-full mt-6">
                                    Get Pre-Approved
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Government Schemes */}
                <TabsContent value="schemes">
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-r from-orange-50 to-green-50 border-orange-200">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge className="bg-orange-500">Government</Badge>
                                    <h3 className="font-semibold">Government-Backed Financing Schemes</h3>
                                </div>
                                <p className="text-muted-foreground">
                                    Take advantage of special subsidies and low-interest loans designed to support entrepreneurs
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-3">
                            {governmentSchemes.map((scheme) => (
                                <Card key={scheme.name} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <Badge variant="outline" className="w-fit mb-2">{scheme.name}</Badge>
                                        <CardTitle className="text-lg">{scheme.fullName}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Subsidy/Benefit</p>
                                                <p className="font-medium text-green-600">{scheme.subsidy}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Max Loan</p>
                                                <p className="font-medium">{scheme.maxLoan}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Eligibility</p>
                                                <p className="font-medium">{scheme.eligibility}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full mt-4">
                                            Learn More
                                            <ExternalLink className="h-4 w-4 ml-2" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
