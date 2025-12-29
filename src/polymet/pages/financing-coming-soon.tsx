import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Wallet,
    TrendingUp,
    Shield,
    Clock,
    Bell,
    CheckCircle,
    Sparkles,
    Building2,
    CreditCard,
    PiggyBank,
    ArrowRight,
    Mail,
} from 'lucide-react';
import { toast } from 'sonner';

const upcomingFeatures = [
    {
        icon: Building2,
        title: 'Bank Partnerships',
        description: 'Pre-approved loans from top banks like HDFC, ICICI, and SBI',
    },
    {
        icon: CreditCard,
        title: 'Quick Disbursement',
        description: 'Get funds in as little as 48 hours with minimal documentation',
    },
    {
        icon: PiggyBank,
        title: 'Government Schemes',
        description: 'Access to PMEGP, Mudra, and Stand-Up India schemes',
    },
    {
        icon: TrendingUp,
        title: 'EMI Calculator',
        description: 'Plan your finances with our smart EMI calculator',
    },
    {
        icon: Shield,
        title: 'Secure Process',
        description: 'Bank-grade security for all your financial data',
    },
    {
        icon: Wallet,
        title: 'Competitive Rates',
        description: 'Best-in-market interest rates starting from 10.5%',
    },
];

export function FinancingComingSoonPage() {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
        setIsSubscribed(true);
        toast.success('You\'re on the list! We\'ll notify you when financing is available.');
    };

    return (
        <div className="min-h-[calc(100vh-4rem)]">
            {/* Hero Section with Gradient Background */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-green-500/10">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse" />
                    <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-green-500/10 blur-3xl animate-pulse delay-1000" />
                    <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-yellow-500/10 blur-3xl animate-pulse delay-500" />
                </div>

                <div className="container max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        {/* Badge */}
                        <Badge className="mb-6 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Coming Soon
                        </Badge>

                        {/* Main Heading */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-green-600 bg-clip-text text-transparent">
                            Business Financing Made Simple
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            We're building India's most comprehensive financing platform for franchise and business buyers.
                            Get pre-approved loans, compare rates, and access government schemes — all in one place.
                        </p>

                        {/* Countdown / Launch Info */}
                        <div className="flex items-center justify-center gap-2 mb-10 text-muted-foreground">
                            <Clock className="w-5 h-5" />
                            <span className="text-lg">Launching Q4 2026</span>
                        </div>

                        {/* Email Subscription Form */}
                        {!isSubscribed ? (
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12"
                                    />
                                </div>
                                <Button type="submit" size="lg" className="h-12 px-8" disabled={isLoading}>
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Subscribing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Bell className="w-4 h-4" />
                                            Notify Me
                                        </span>
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <Card className="max-w-md mx-auto bg-green-50 border-green-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-green-800">You're on the list!</p>
                                            <p className="text-sm text-green-600">
                                                We'll notify you at {email} when we launch.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <p className="text-sm text-muted-foreground mt-4">
                            Join 500+ entrepreneurs already on the waitlist
                        </p>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container max-w-6xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">What's Coming</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        We're partnering with India's leading banks and NBFCs to bring you the best financing options
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {upcomingFeatures.map((feature, index) => (
                        <Card
                            key={index}
                            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-muted/50"
                        >
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="container max-w-6xl mx-auto px-4 pb-16">
                <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-green-500/10 border-primary/20">
                    <CardContent className="p-8 md:p-12 text-center">
                        <div className="max-w-2xl mx-auto">
                            <h3 className="text-2xl md:text-3xl font-bold mb-4">
                                Can't Wait? Explore Current Options
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                While we're building something amazing, you can still explore existing financing partners
                                and calculate your EMI with our current tools.
                            </p>
                            <Button asChild size="lg">
                                <a href="/financing">
                                    Explore Financing Partners
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
