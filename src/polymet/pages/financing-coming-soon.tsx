import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Wallet,
    TrendingUp,
    Shield,
    Clock,
    Bell,
    CheckCircle,
    Building2,
    CreditCard,
    PiggyBank,
    ArrowRight,
    Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHero } from '@/components/page-hero';
import { Link } from 'react-router-dom';

const upcomingFeatures = [
    {
        icon: Building2,
        title: 'Bank partnerships',
        description: 'Loan applications through partner banks and NBFCs',
    },
    {
        icon: CreditCard,
        title: 'Application tracking',
        description: 'Status updates for financing requests you submit',
    },
    {
        icon: PiggyBank,
        title: 'Government schemes',
        description: 'Links and summaries for PMEGP, Mudra, and Stand-Up India',
    },
    {
        icon: TrendingUp,
        title: 'EMI calculator',
        description: 'Estimate monthly payments for a given loan amount and tenure',
    },
    {
        icon: Shield,
        title: 'Secure handling',
        description: 'Encrypted transmission of financial details you share',
    },
    {
        icon: Wallet,
        title: 'Rate comparison',
        description: 'Compare partner interest ranges side by side when available',
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
        setIsSubscribed(true);
        toast.success("You're on the list. We'll notify you when financing tools launch.");
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-background">
            <PageHero
                eyebrow="Financing"
                title="Business financing tools are coming"
                description="We're building partner loan applications, scheme summaries, and an EMI calculator for franchise and business buyers."
            >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Clock className="w-4 h-4" />
                    <span>Target launch: Q4 2026</span>
                </div>

                {!isSubscribed ? (
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md">
                        <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-11"
                            />
                        </div>
                        <Button type="submit" className="h-11 px-6" disabled={isLoading}>
                            {isLoading ? (
                                'Subscribing…'
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Bell className="w-4 h-4" />
                                    Notify me
                                </span>
                            )}
                        </Button>
                    </form>
                ) : (
                    <Card className="max-w-md border-border">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-growth-green/15 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-growth-green" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">You're on the list</p>
                                    <p className="text-sm text-muted-foreground">
                                        We'll email {email} when this launches.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </PageHero>

            <div className="container max-w-6xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <h2 className="text-xl font-bold tracking-tight mb-1">Planned capabilities</h2>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        Partner financing, scheme references, and calculators — not live yet.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {upcomingFeatures.map((feature) => (
                        <Card key={feature.title} className="border-border">
                            <CardContent className="p-5">
                                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                                    <feature.icon className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-1">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="container max-w-6xl mx-auto px-4 pb-12">
                <Card className="border-border bg-card">
                    <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">
                                Explore current partner options
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Review listed partners and the EMI calculator while full financing tools are in progress.
                            </p>
                        </div>
                        <Button asChild>
                            <Link to="/financing">
                                Financing partners
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
