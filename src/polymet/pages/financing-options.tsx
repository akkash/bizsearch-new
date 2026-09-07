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
    Calculator,
    ArrowRight,
    CheckCircle,
    ExternalLink,
    Phone,
    FileText,
} from 'lucide-react';
import { PageHero } from '@/components/page-hero';

const financingPartners = [
    {
        id: 1,
        name: 'HDFC Bank',
        type: 'Bank Loan',
        interestRate: '10.5% - 12.5%',
        maxAmount: '₹2 Crores',
        tenure: 'Up to 7 years',
        features: ['No collateral up to ₹50L', 'Quick approval', 'Flexible EMI'],
    },
    {
        id: 2,
        name: 'ICICI Bank',
        type: 'Bank Loan',
        interestRate: '11% - 13%',
        maxAmount: '₹1.5 Crores',
        tenure: 'Up to 5 years',
        features: ['Doorstep service', 'Online tracking', 'Part-prepayment allowed'],
    },
    {
        id: 3,
        name: 'Bajaj Finserv',
        type: 'NBFC',
        interestRate: '12% - 16%',
        maxAmount: '₹75 Lakhs',
        tenure: 'Up to 5 years',
        features: ['Minimal documentation', '48-hour disbursal', 'No hidden charges'],
    },
    {
        id: 4,
        name: 'Tata Capital',
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
        const emi =
            (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
            (Math.pow(1 + monthlyRate, tenure) - 1);
        return Math.round(emi);
    };

    const totalAmount = calculateEMI() * tenure;
    const totalInterest = totalAmount - loanAmount;

    return (
        <div className="min-h-screen bg-background">
            <PageHero
                eyebrow="Financing"
                title="Financing options"
                description="Partner lenders, an EMI calculator, and government scheme summaries for franchise and business buyers."
            />

            <div className="container max-w-6xl mx-auto py-8 px-4">
                <Tabs defaultValue="partners">
                    <TabsList className="mb-6">
                        <TabsTrigger value="partners" className="gap-2">
                            <Building className="h-4 w-4" />
                            Partners
                        </TabsTrigger>
                        <TabsTrigger value="calculator" className="gap-2">
                            <Calculator className="h-4 w-4" />
                            EMI calculator
                        </TabsTrigger>
                        <TabsTrigger value="schemes" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Government schemes
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="partners">
                        <div className="grid gap-4 md:grid-cols-2">
                            {financingPartners.map((partner) => (
                                <Card key={partner.id} className="border-border">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                                                <Building className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{partner.name}</CardTitle>
                                                <Badge variant="outline">{partner.type}</Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                            <div>
                                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                                    Interest rate
                                                </p>
                                                <p className="font-semibold font-mono tabular-nums text-growth-green">
                                                    {partner.interestRate}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                                    Max amount
                                                </p>
                                                <p className="font-semibold font-mono tabular-nums">
                                                    {partner.maxAmount}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                                    Tenure
                                                </p>
                                                <p className="font-semibold">{partner.tenure}</p>
                                            </div>
                                        </div>
                                        <Separator className="my-4" />
                                        <div className="space-y-2 mb-4">
                                            {partner.features.map((feature) => (
                                                <div key={feature} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-growth-green" />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button className="flex-1">
                                                Apply now
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

                        <Card className="mt-6 border-border bg-card">
                            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="p-2.5 bg-primary/10 rounded-md">
                                    <CreditCard className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">Need help choosing?</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Contact us and we’ll point you to listed partners that fit your investment range.
                                    </p>
                                </div>
                                <Button variant="outline">Talk to us</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="calculator">
                        <div className="grid gap-4 lg:grid-cols-2">
                            <Card className="border-border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Calculator className="h-5 w-5" />
                                        EMI calculator
                                    </CardTitle>
                                    <CardDescription>Estimate monthly payments</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label>Loan amount</Label>
                                            <span className="text-sm font-mono tabular-nums">
                                                ₹{(loanAmount / 100000).toFixed(1)}L
                                            </span>
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
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label>Interest rate (%)</Label>
                                            <span className="text-sm font-mono tabular-nums">{interestRate}%</span>
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
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label>Tenure (months)</Label>
                                            <span className="text-sm font-mono tabular-nums">
                                                {tenure} mo
                                            </span>
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
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border">
                                <CardHeader>
                                    <CardTitle className="text-lg">EMI breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-6">
                                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                            Monthly EMI
                                        </p>
                                        <p className="text-3xl font-bold font-mono tabular-nums">
                                            ₹{calculateEMI().toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between p-3 bg-secondary/50 rounded-md">
                                            <span className="text-muted-foreground">Principal</span>
                                            <span className="font-mono tabular-nums font-semibold">
                                                ₹{loanAmount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-secondary/50 rounded-md">
                                            <span className="text-muted-foreground">Total interest</span>
                                            <span className="font-mono tabular-nums font-semibold">
                                                ₹{totalInterest.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between p-3 border border-border rounded-md">
                                            <span className="font-medium">Total payable</span>
                                            <span className="font-mono tabular-nums font-bold">
                                                ₹{totalAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-4">
                                        Illustrative only. Actual EMI depends on lender terms and eligibility.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="schemes">
                        <div className="space-y-4">
                            <Card className="border-border bg-muted/30">
                                <CardContent className="p-5">
                                    <h3 className="font-semibold mb-1">Government-backed schemes</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Summaries of common schemes. Confirm eligibility and terms with the administering agency or lender.
                                    </p>
                                </CardContent>
                            </Card>

                            <div className="grid gap-4 md:grid-cols-3">
                                {governmentSchemes.map((scheme) => (
                                    <Card key={scheme.name} className="border-border">
                                        <CardHeader>
                                            <Badge variant="outline" className="w-fit mb-2">
                                                {scheme.name}
                                            </Badge>
                                            <CardTitle className="text-base">{scheme.fullName}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                                        Benefit
                                                    </p>
                                                    <p className="font-medium">{scheme.subsidy}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                                        Max loan
                                                    </p>
                                                    <p className="font-medium font-mono tabular-nums">
                                                        {scheme.maxLoan}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                                        Eligibility
                                                    </p>
                                                    <p className="font-medium">{scheme.eligibility}</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" className="w-full mt-4">
                                                Learn more
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
        </div>
    );
}
