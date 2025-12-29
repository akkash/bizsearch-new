import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Scale,
    Users,
    Shield,
    AlertTriangle,
    CreditCard,
    Ban,
    Gavel,
    Globe,
    Calendar,
    CheckCircle,
    ArrowRight,
    Mail,
    BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";

export function TermsOfServicePage({ className }: { className?: string }) {
    const lastUpdated = "December 29, 2024";

    const highlights = [
        {
            icon: Scale,
            title: "Fair Terms",
            description: "Clear and balanced terms that protect both users and BizSearch",
        },
        {
            icon: Shield,
            title: "User Protection",
            description: "We prioritize your safety with verified listings and fraud prevention",
        },
        {
            icon: Users,
            title: "Community Standards",
            description: "Rules that ensure a trustworthy marketplace for everyone",
        },
        {
            icon: Gavel,
            title: "Dispute Resolution",
            description: "Fair processes to resolve any issues that may arise",
        },
    ];

    const sections = [
        {
            id: "acceptance",
            title: "1. Acceptance of Terms",
            icon: FileText,
            content: [
                {
                    subtitle: "Agreement",
                    items: [
                        "By accessing or using BizSearch, you agree to be bound by these Terms of Service",
                        "If you do not agree to these terms, you may not access or use our services",
                        "These terms apply to all users including buyers, sellers, franchisors, and franchisees",
                        "We may update these terms from time to time with notice to users",
                    ],
                },
                {
                    subtitle: "Eligibility",
                    items: [
                        "You must be at least 18 years old to use our services",
                        "You must have the legal capacity to enter into binding contracts",
                        "Business entities must be properly registered and authorized",
                        "You must provide accurate and complete information during registration",
                    ],
                },
            ],
        },
        {
            id: "services",
            title: "2. Our Services",
            icon: Globe,
            content: [
                {
                    subtitle: "What We Provide",
                    items: [
                        "A platform to list and discover businesses for sale",
                        "Franchise opportunity listings and matching services",
                        "AI-powered tools for business valuation and due diligence",
                        "Communication tools to connect buyers, sellers, and franchisors",
                        "Advisory services and expert consultation (premium feature)",
                    ],
                },
                {
                    subtitle: "Service Limitations",
                    items: [
                        "We are a platform provider, not a party to any transaction",
                        "We do not guarantee the success of any business transaction",
                        "Availability of services may vary by region",
                        "Some features require subscription or payment",
                    ],
                },
            ],
        },
        {
            id: "user-responsibilities",
            title: "3. User Responsibilities",
            icon: Users,
            content: [
                {
                    subtitle: "Account Security",
                    items: [
                        "Maintain the confidentiality of your account credentials",
                        "Immediately notify us of any unauthorized access",
                        "You are responsible for all activities under your account",
                        "Do not share your account with others",
                    ],
                },
                {
                    subtitle: "Content Guidelines",
                    items: [
                        "Provide accurate and truthful information in listings",
                        "Do not post misleading or false business information",
                        "Respect intellectual property rights of others",
                        "Maintain professional and respectful communication",
                    ],
                },
            ],
        },
        {
            id: "listing-policies",
            title: "4. Listing Policies",
            icon: BookOpen,
            content: [
                {
                    subtitle: "Listing Requirements",
                    items: [
                        "All listings must represent genuine business opportunities",
                        "Provide complete and accurate business information",
                        "Include relevant financial data and documentation",
                        "Update listings promptly when information changes",
                    ],
                },
                {
                    subtitle: "Verification Process",
                    items: [
                        "All listings undergo verification by our team",
                        "We may request additional documentation for verification",
                        "Listings may be suspended pending verification",
                        "False or fraudulent listings will be immediately removed",
                    ],
                },
            ],
        },
        {
            id: "payments",
            title: "5. Payments & Fees",
            icon: CreditCard,
            content: [
                {
                    subtitle: "Fee Structure",
                    items: [
                        "Basic listing is free for sellers",
                        "Premium features and enhanced visibility require subscription",
                        "Success fees may apply upon completion of transactions",
                        "All fees are clearly disclosed before purchase",
                    ],
                },
                {
                    subtitle: "Payment Terms",
                    items: [
                        "Payments are processed through secure third-party providers",
                        "Subscriptions auto-renew unless cancelled",
                        "Refunds are subject to our Refund Policy",
                        "All prices are in Indian Rupees (INR) unless otherwise stated",
                    ],
                },
            ],
        },
        {
            id: "prohibited",
            title: "6. Prohibited Activities",
            icon: Ban,
            content: [
                {
                    subtitle: "You May Not",
                    items: [
                        "Post fraudulent or misleading business listings",
                        "Use the platform for money laundering or illegal activities",
                        "Harass, threaten, or abuse other users",
                        "Attempt to manipulate reviews or ratings",
                        "Scrape or harvest data from our platform",
                        "Circumvent platform fees by transacting off-platform",
                    ],
                },
                {
                    subtitle: "Consequences",
                    items: [
                        "Violation of these rules may result in account suspension",
                        "Severe violations may lead to permanent ban",
                        "We may report illegal activities to authorities",
                        "You may be liable for damages caused by violations",
                    ],
                },
            ],
        },
        {
            id: "liability",
            title: "7. Limitation of Liability",
            icon: AlertTriangle,
            content: [
                {
                    subtitle: "Disclaimers",
                    items: [
                        "BizSearch is not responsible for user-generated content",
                        "We do not guarantee the accuracy of listing information",
                        "Investment decisions are solely the user's responsibility",
                        "We are not liable for losses from platform use or transactions",
                    ],
                },
                {
                    subtitle: "Indemnification",
                    items: [
                        "You agree to indemnify BizSearch for claims arising from your use",
                        "This includes claims from other users or third parties",
                        "Covers legal fees and expenses related to such claims",
                    ],
                },
            ],
        },
        {
            id: "disputes",
            title: "8. Dispute Resolution",
            icon: Gavel,
            content: [
                {
                    subtitle: "Resolution Process",
                    items: [
                        "Disputes should first be raised with our support team",
                        "We will attempt to mediate between parties",
                        "Unresolved disputes may proceed to arbitration",
                        "Arbitration will be conducted in Mumbai, India",
                    ],
                },
                {
                    subtitle: "Governing Law",
                    items: [
                        "These terms are governed by the laws of India",
                        "Exclusive jurisdiction lies with courts in Mumbai",
                        "Indian arbitration laws apply to dispute resolution",
                    ],
                },
            ],
        },
        {
            id: "termination",
            title: "9. Termination",
            icon: Scale,
            content: [
                {
                    subtitle: "Your Rights",
                    items: [
                        "You may close your account at any time",
                        "Active subscriptions will continue until end of billing period",
                        "Your data will be handled as per our Privacy Policy",
                    ],
                },
                {
                    subtitle: "Our Rights",
                    items: [
                        "We may suspend or terminate accounts for violations",
                        "We may discontinue services with reasonable notice",
                        "Provisions regarding liability and disputes survive termination",
                    ],
                },
            ],
        },
        {
            id: "changes",
            title: "10. Changes to Terms",
            icon: Calendar,
            content: [
                {
                    subtitle: "Updates",
                    items: [
                        "We may modify these terms at any time",
                        "Material changes will be communicated via email or platform notice",
                        "Continued use after changes constitutes acceptance",
                        "Previous versions are available upon request",
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
                            <FileText className="w-4 h-4 mr-2" />
                            Legal Agreement
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Terms of
                            <span className="bg-gradient-to-r from-primary via-primary to-growth-green bg-clip-text text-transparent">
                                {" "}Service
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed max-w-3xl mx-auto">
                            These terms govern your use of BizSearch. Please read them carefully
                            before using our platform. By using our services, you agree to be
                            bound by these terms.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Last Updated: {lastUpdated}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Terms Highlights */}
            <section className="py-12 border-b">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {highlights.map((highlight, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <highlight.icon className="h-5 w-5 text-primary" />
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {sections.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-background"
                                >
                                    <section.icon className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{section.title.split(". ")[1]}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Terms Sections */}
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
                            Have Questions About These Terms?
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            If you have any questions about these Terms of Service,
                            please don't hesitate to reach out to our legal team.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild>
                                <a href="mailto:legal@bizsearch.in">
                                    <Mail className="w-4 h-4 mr-2" />
                                    legal@bizsearch.in
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
                                <Link to="/privacy">Privacy Policy</Link>
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
