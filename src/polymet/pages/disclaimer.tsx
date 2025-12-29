import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertTriangle,
    Info,
    Scale,
    Shield,
    FileWarning,
    TrendingUp,
    Users,
    Building2,
    Calendar,
    CheckCircle,
    ArrowRight,
    Mail,
    ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

export function DisclaimerPage({ className }: { className?: string }) {
    const lastUpdated = "December 29, 2024";

    const highlights = [
        {
            icon: Info,
            title: "Informational Only",
            description: "Content on BizSearch is for informational purposes only",
        },
        {
            icon: Scale,
            title: "No Legal Advice",
            description: "We do not provide legal, financial, or tax advice",
        },
        {
            icon: Shield,
            title: "User Responsibility",
            description: "Users are responsible for their own due diligence",
        },
        {
            icon: TrendingUp,
            title: "No Guarantees",
            description: "Past performance doesn't guarantee future results",
        },
    ];

    const sections = [
        {
            id: "general",
            title: "1. General Disclaimer",
            icon: AlertTriangle,
            content: [
                {
                    subtitle: "Platform Purpose",
                    items: [
                        "BizSearch is a marketplace platform that connects buyers, sellers, and franchise opportunities",
                        "All information provided on this platform is for general informational purposes only",
                        "BizSearch does not make any warranties about the completeness, reliability, or accuracy of information",
                        "Any action you take based on information on this platform is strictly at your own risk",
                    ],
                },
                {
                    subtitle: "Not Professional Advice",
                    items: [
                        "Content on BizSearch does not constitute professional advice of any kind",
                        "This includes but is not limited to legal, financial, tax, or business advice",
                        "Always consult with qualified professionals before making business decisions",
                        "BizSearch is not a licensed broker, advisor, or financial institution",
                    ],
                },
            ],
        },
        {
            id: "listings",
            title: "2. Listing Information",
            icon: Building2,
            content: [
                {
                    subtitle: "User-Generated Content",
                    items: [
                        "Business and franchise listings are created by users, not by BizSearch",
                        "While we verify listings, we cannot guarantee the accuracy of all information",
                        "Financial data, projections, and claims are provided by listing owners",
                        "Users should independently verify all information before making decisions",
                    ],
                },
                {
                    subtitle: "Verification Limitations",
                    items: [
                        "Our verification process checks basic business details and documentation",
                        "We do not conduct comprehensive audits of listed businesses",
                        "Verification does not constitute an endorsement or recommendation",
                        "Users must perform their own due diligence",
                    ],
                },
            ],
        },
        {
            id: "financial",
            title: "3. Financial Information",
            icon: TrendingUp,
            content: [
                {
                    subtitle: "Investment Risks",
                    items: [
                        "All business investments carry inherent risks including potential loss of capital",
                        "Past performance of a business does not guarantee future results",
                        "Financial projections are estimates only and may not be achieved",
                        "Market conditions, competition, and other factors can impact business performance",
                    ],
                },
                {
                    subtitle: "Valuation Disclaimer",
                    items: [
                        "AI-generated valuations are estimates based on available data and algorithms",
                        "Valuations should be used as starting points, not definitive prices",
                        "Professional appraisers should be consulted for formal valuations",
                        "Actual transaction values may differ significantly from estimates",
                    ],
                },
            ],
        },
        {
            id: "third-party",
            title: "4. Third-Party Content & Links",
            icon: ExternalLink,
            content: [
                {
                    subtitle: "External Links",
                    items: [
                        "Our platform may contain links to third-party websites and services",
                        "We have no control over the content or availability of external sites",
                        "Inclusion of links does not imply endorsement of the linked sites",
                        "Users access third-party sites at their own risk",
                    ],
                },
                {
                    subtitle: "Partner Services",
                    items: [
                        "We work with third-party partners for financing, legal, and other services",
                        "BizSearch is not responsible for services provided by partners",
                        "Users should review partner terms and conditions separately",
                        "Partner recommendations are not endorsements or guarantees",
                    ],
                },
            ],
        },
        {
            id: "ai-tools",
            title: "5. AI Tools & Recommendations",
            icon: Info,
            content: [
                {
                    subtitle: "AI-Powered Features",
                    items: [
                        "Our AI matchmaker and valuation tools use algorithms and machine learning",
                        "AI recommendations are based on available data and may not be perfect",
                        "AI should be used as a tool to assist, not replace, human judgment",
                        "Users should not rely solely on AI recommendations for major decisions",
                    ],
                },
                {
                    subtitle: "Data Limitations",
                    items: [
                        "AI accuracy depends on the quality and completeness of input data",
                        "Market conditions may change faster than AI models can adapt",
                        "AI cannot account for all factors that may affect business success",
                        "Always validate AI insights with professional advisors",
                    ],
                },
            ],
        },
        {
            id: "liability",
            title: "6. Limitation of Liability",
            icon: Scale,
            content: [
                {
                    subtitle: "Exclusion of Liability",
                    items: [
                        "BizSearch shall not be liable for any direct, indirect, or consequential damages",
                        "This includes damages arising from use of or inability to use our platform",
                        "We are not liable for decisions made based on platform information",
                        "Loss of profit, data, or business opportunities is not our responsibility",
                    ],
                },
                {
                    subtitle: "Maximum Liability",
                    items: [
                        "In any case, our maximum liability is limited to fees paid to us",
                        "This limitation applies to all claims, whether in contract or tort",
                        "Some jurisdictions may not allow these limitations",
                        "Applicable law will govern where limitations are restricted",
                    ],
                },
            ],
        },
        {
            id: "transactions",
            title: "7. Transaction Disclaimer",
            icon: Users,
            content: [
                {
                    subtitle: "Platform Role",
                    items: [
                        "BizSearch is a marketplace, not a party to any transaction",
                        "We facilitate connections but do not participate in negotiations",
                        "All transactions are between buyers and sellers directly",
                        "We are not responsible for the outcome of any transaction",
                    ],
                },
                {
                    subtitle: "Due Diligence",
                    items: [
                        "Users must conduct thorough due diligence before any transaction",
                        "This includes legal, financial, and operational verification",
                        "Engage qualified professionals (lawyers, accountants, etc.)",
                        "Never rely solely on information provided on the platform",
                    ],
                },
            ],
        },
        {
            id: "regulatory",
            title: "8. Regulatory Disclaimer",
            icon: FileWarning,
            content: [
                {
                    subtitle: "Compliance",
                    items: [
                        "Users are responsible for compliance with applicable laws and regulations",
                        "This includes FEMA, SEBI, and other regulatory requirements",
                        "Tax obligations are the sole responsibility of users",
                        "BizSearch does not provide guidance on regulatory compliance",
                    ],
                },
                {
                    subtitle: "Geographic Limitations",
                    items: [
                        "Services may not be available or appropriate in all locations",
                        "Users must ensure they can legally use our services in their jurisdiction",
                        "Cross-border transactions may have additional legal requirements",
                        "Consult local experts for jurisdiction-specific matters",
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
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Important Notice
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Legal
                            <span className="bg-gradient-to-r from-primary via-primary to-growth-green bg-clip-text text-transparent">
                                {" "}Disclaimer
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed max-w-3xl mx-auto">
                            Please read this disclaimer carefully before using BizSearch.
                            This page explains the limitations of our platform and the
                            responsibilities of users when using our services.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Last Updated: {lastUpdated}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Disclaimer Highlights */}
            <section className="py-12 border-b">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {highlights.map((highlight, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                    <highlight.icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
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

            {/* Important Notice Banner */}
            <section className="py-8 bg-orange-50 dark:bg-orange-950/20 border-b border-orange-200 dark:border-orange-800">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                                Important Notice
                            </h3>
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                BizSearch is an information platform only. We are not financial advisors,
                                legal consultants, or business brokers. All business decisions should be made
                                in consultation with qualified professionals. By using our platform, you
                                acknowledge that you understand and accept these limitations.
                            </p>
                        </div>
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
                                    <section.icon className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{section.title.split(". ")[1]}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Disclaimer Sections */}
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
                            Have Questions About This Disclaimer?
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            If you have any questions about this Disclaimer or need clarification
                            on any points, please don't hesitate to reach out.
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
                                <Link to="/terms">Terms of Service</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link to="/privacy">Privacy Policy</Link>
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
