import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Shield,
    Lock,
    Eye,
    FileText,
    UserCheck,
    Database,
    Globe,
    Bell,
    Mail,
    Calendar,
    CheckCircle,
    ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export function PrivacyPolicyPage({ className }: { className?: string }) {
    const lastUpdated = "December 29, 2024";

    const highlights = [
        {
            icon: Lock,
            title: "Data Encryption",
            description: "All data is encrypted in transit and at rest using industry-standard protocols",
        },
        {
            icon: UserCheck,
            title: "User Control",
            description: "You have full control over your personal data and can request deletion anytime",
        },
        {
            icon: Eye,
            title: "Transparency",
            description: "We clearly explain what data we collect and how it's used",
        },
        {
            icon: Shield,
            title: "No Data Selling",
            description: "We never sell your personal information to third parties",
        },
    ];

    const sections = [
        {
            id: "information-collected",
            title: "1. Information We Collect",
            icon: Database,
            content: [
                {
                    subtitle: "Personal Information",
                    items: [
                        "Name, email address, and phone number when you create an account",
                        "Business information when listing a business or applying for franchises",
                        "Financial information for transaction processing",
                        "Communication preferences and inquiry history",
                    ],
                },
                {
                    subtitle: "Automatically Collected Information",
                    items: [
                        "Device information (browser type, operating system)",
                        "IP address and approximate location",
                        "Usage data and browsing patterns on our platform",
                        "Cookies and similar tracking technologies",
                    ],
                },
            ],
        },
        {
            id: "how-we-use",
            title: "2. How We Use Your Information",
            icon: FileText,
            content: [
                {
                    subtitle: "Primary Uses",
                    items: [
                        "To provide and improve our business matching services",
                        "To process transactions and manage your account",
                        "To connect buyers with sellers and franchisors",
                        "To send important updates about listings and opportunities",
                    ],
                },
                {
                    subtitle: "Secondary Uses",
                    items: [
                        "To personalize your experience with AI-powered recommendations",
                        "To analyze platform usage and improve our services",
                        "To prevent fraud and ensure platform security",
                        "To comply with legal obligations",
                    ],
                },
            ],
        },
        {
            id: "data-sharing",
            title: "3. Information Sharing",
            icon: Globe,
            content: [
                {
                    subtitle: "When We Share",
                    items: [
                        "With other users when you express interest in a listing (with your consent)",
                        "With service providers who help us operate our platform",
                        "With financial partners for loan/financing applications",
                        "When required by law or to protect our rights",
                    ],
                },
                {
                    subtitle: "We Never",
                    items: [
                        "Sell your personal data to third parties",
                        "Share your information for marketing purposes without consent",
                        "Disclose confidential business information to competitors",
                        "Transfer data to countries without adequate privacy protections",
                    ],
                },
            ],
        },
        {
            id: "data-security",
            title: "4. Data Security",
            icon: Lock,
            content: [
                {
                    subtitle: "Security Measures",
                    items: [
                        "256-bit SSL encryption for all data transmission",
                        "Secure data centers with 24/7 monitoring",
                        "Regular security audits and penetration testing",
                        "Multi-factor authentication for account access",
                    ],
                },
                {
                    subtitle: "Access Controls",
                    items: [
                        "Strict employee access policies",
                        "Role-based access to sensitive information",
                        "Comprehensive audit logging",
                        "Incident response procedures",
                    ],
                },
            ],
        },
        {
            id: "your-rights",
            title: "5. Your Rights",
            icon: UserCheck,
            content: [
                {
                    subtitle: "You Have the Right To",
                    items: [
                        "Access your personal data and request a copy",
                        "Correct inaccurate or incomplete information",
                        "Delete your account and associated data",
                        "Opt-out of marketing communications",
                        "Restrict processing of your data in certain circumstances",
                        "Data portability - receive your data in a structured format",
                    ],
                },
            ],
        },
        {
            id: "cookies",
            title: "6. Cookies & Tracking",
            icon: Eye,
            content: [
                {
                    subtitle: "Types of Cookies We Use",
                    items: [
                        "Essential cookies - Required for platform functionality",
                        "Analytics cookies - Help us understand how you use our site",
                        "Preference cookies - Remember your settings and choices",
                        "Marketing cookies - Used to show relevant advertisements (with consent)",
                    ],
                },
                {
                    subtitle: "Managing Cookies",
                    items: [
                        "You can control cookies through your browser settings",
                        "Disabling certain cookies may affect platform functionality",
                        "We provide a cookie consent banner for transparency",
                    ],
                },
            ],
        },
        {
            id: "retention",
            title: "7. Data Retention",
            icon: Calendar,
            content: [
                {
                    subtitle: "Retention Periods",
                    items: [
                        "Active account data - Retained while your account is active",
                        "Transaction records - 7 years (legal requirement)",
                        "Communication history - 3 years after last interaction",
                        "Anonymous analytics data - Indefinitely",
                    ],
                },
                {
                    subtitle: "After Account Deletion",
                    items: [
                        "Personal data is deleted within 30 days",
                        "Some data may be retained for legal compliance",
                        "Anonymized data may be kept for statistical purposes",
                    ],
                },
            ],
        },
        {
            id: "updates",
            title: "8. Policy Updates",
            icon: Bell,
            content: [
                {
                    subtitle: "How We Notify You",
                    items: [
                        "Email notification for significant changes",
                        "Banner notification on the platform",
                        "Updated 'Last Modified' date on this page",
                        "30-day notice period before major changes take effect",
                    ],
                },
            ],
        },
    ];

    return (
        <div className={`min-h-screen ${className}`}>
            {/* Hero Section with Gradient */}
            <section className="relative overflow-hidden bg-gradient-to-br from-trust-blue/5 via-growth-green/5 to-trust-blue/10 dark:from-trust-blue/10 dark:via-growth-green/5 dark:to-trust-blue/5 py-16 md:py-24">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse" />
                    <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-growth-green/10 blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <Badge variant="secondary" className="mb-6 px-4 py-2">
                            <Shield className="w-4 h-4 mr-2" />
                            Your Privacy Matters
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Privacy
                            <span className="bg-gradient-to-r from-primary via-primary to-growth-green bg-clip-text text-transparent">
                                {" "}Policy
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed max-w-3xl mx-auto">
                            At BizSearch, we're committed to protecting your privacy and being
                            transparent about how we handle your data. This policy explains our
                            practices in plain language.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Last Updated: {lastUpdated}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Privacy Highlights */}
            <section className="py-12 border-b">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {highlights.map((highlight, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-growth-green/10 flex items-center justify-center flex-shrink-0">
                                    <highlight.icon className="h-5 w-5 text-growth-green" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">{highlight.title}</h3>
                                    <p className="text-sm text-muted-foreground">{highlight.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Table of Contents */}
            <section className="py-12 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-lg font-semibold mb-4">Quick Navigation</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {sections.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-background"
                                >
                                    <section.icon className="w-4 h-4" />
                                    <span>{section.title.split(". ")[1]}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Policy Sections */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {sections.map((section) => (
                            <Card key={section.id} id={section.id} className="scroll-mt-24">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <section.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <CardTitle className="text-xl md:text-2xl">{section.title}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {section.content.map((contentBlock, idx) => (
                                        <div key={idx}>
                                            <h4 className="font-semibold text-foreground mb-3">
                                                {contentBlock.subtitle}
                                            </h4>
                                            <ul className="space-y-2">
                                                {contentBlock.items.map((item, itemIdx) => (
                                                    <li key={itemIdx} className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-growth-green mt-1 flex-shrink-0" />
                                                        <span className="text-muted-foreground text-sm">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-gradient-to-br from-muted/30 via-muted/50 to-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <Badge variant="secondary" className="mb-4">
                            <Mail className="w-3 h-3 mr-1" />
                            Questions?
                        </Badge>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                            Have Privacy Concerns?
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            If you have any questions about this Privacy Policy or our data practices,
                            please don't hesitate to reach out to our Privacy team.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild>
                                <a href="mailto:privacy@bizsearch.in">
                                    <Mail className="w-4 h-4 mr-2" />
                                    privacy@bizsearch.in
                                </a>
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/contact">
                                    Contact Us
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Links */}
            <section className="py-12 border-t">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-center">Related Policies</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link to="/terms">Terms of Service</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link to="/cookies">Cookie Policy</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link to="/refund">Refund Policy</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
