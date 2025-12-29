import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    RefreshCcw,
    Clock,
    CheckCircle,
    XCircle,
    CreditCard,
    AlertTriangle,
    HelpCircle,
    Calendar,
    ArrowRight,
    Mail,
    DollarSign,
    FileText,
    Shield,
} from "lucide-react";
import { Link } from "react-router-dom";

export function RefundPolicyPage({ className }: { className?: string }) {
    const lastUpdated = "December 29, 2024";

    const highlights = [
        {
            icon: Clock,
            title: "7-Day Window",
            description: "Request refunds within 7 days of purchase for eligible items",
        },
        {
            icon: RefreshCcw,
            title: "Easy Process",
            description: "Simple online refund request with quick processing",
        },
        {
            icon: CreditCard,
            title: "Original Method",
            description: "Refunds are credited back to your original payment method",
        },
        {
            icon: Shield,
            title: "Fair Policy",
            description: "Transparent terms with clear eligibility criteria",
        },
    ];

    const refundableItems = [
        "Premium subscription fees (within 7 days of purchase, if unused)",
        "Featured listing payments (if listing not yet published)",
        "Boost packages (if not yet activated)",
        "Advisory consultation fees (if cancelled 24+ hours before appointment)",
        "Report generation fees (if report not yet delivered)",
    ];

    const nonRefundableItems = [
        "Success fees or commission on completed transactions",
        "Subscription fees after 7 days or after using premium features",
        "Featured listings once published and live on platform",
        "Advisory consultations cancelled within 24 hours of appointment",
        "Background verification and due diligence service fees once initiated",
        "Any fees for services already rendered or consumed",
    ];

    const refundProcess = [
        {
            step: 1,
            title: "Submit Request",
            description: "Log into your account and navigate to My Orders/Subscriptions. Click 'Request Refund' on the eligible item.",
        },
        {
            step: 2,
            title: "Provide Details",
            description: "Fill in the refund request form with the reason for your request and any relevant details.",
        },
        {
            step: 3,
            title: "Review",
            description: "Our team will review your request within 2-3 business days and may contact you for additional information.",
        },
        {
            step: 4,
            title: "Processing",
            description: "If approved, the refund will be initiated within 5-7 business days to your original payment method.",
        },
        {
            step: 5,
            title: "Confirmation",
            description: "You'll receive an email confirmation once the refund has been processed.",
        },
    ];

    const sections = [
        {
            id: "eligibility",
            title: "1. Refund Eligibility",
            icon: CheckCircle,
            content: [
                {
                    subtitle: "Eligible for Refund",
                    items: refundableItems,
                    type: "eligible",
                },
                {
                    subtitle: "Not Eligible for Refund",
                    items: nonRefundableItems,
                    type: "not-eligible",
                },
            ],
        },
        {
            id: "timeframes",
            title: "2. Refund Timeframes",
            icon: Clock,
            content: [
                {
                    subtitle: "Processing Times",
                    items: [
                        "Refund request review: 2-3 business days",
                        "Refund initiation (after approval): 5-7 business days",
                        "Credit to your account: Depends on your bank (typically 5-10 business days)",
                        "Total time from request to credit: 12-20 business days",
                    ],
                },
                {
                    subtitle: "Request Window",
                    items: [
                        "Standard purchases: Within 7 days of purchase",
                        "Subscription cancellation: Before the next billing cycle",
                        "Advisory services: At least 24 hours before appointment",
                    ],
                },
            ],
        },
        {
            id: "process",
            title: "3. How to Request a Refund",
            icon: FileText,
            content: [
                {
                    subtitle: "Online Request",
                    items: [
                        "Log into your BizSearch account",
                        "Go to 'My Account' → 'Billing & Payments'",
                        "Find the transaction and click 'Request Refund'",
                        "Fill in the required details and submit",
                    ],
                },
                {
                    subtitle: "Email Request",
                    items: [
                        "Send email to refunds@bizsearch.in",
                        "Include your registered email and transaction ID",
                        "Provide reason for refund request",
                        "Attach any supporting documentation",
                    ],
                },
            ],
        },
        {
            id: "subscription",
            title: "4. Subscription Refunds",
            icon: RefreshCcw,
            content: [
                {
                    subtitle: "Monthly Subscriptions",
                    items: [
                        "Full refund available within 7 days if premium features not used",
                        "Prorated refunds not available after 7-day window",
                        "Cancel anytime to prevent future charges",
                        "Access continues until end of current billing period",
                    ],
                },
                {
                    subtitle: "Annual Subscriptions",
                    items: [
                        "Full refund within 14 days if premium features not used",
                        "After 14 days, prorated refund may be available (minus 2 months penalty)",
                        "Contact support for annual subscription refund requests",
                    ],
                },
            ],
        },
        {
            id: "payment-methods",
            title: "5. Refund Payment Methods",
            icon: CreditCard,
            content: [
                {
                    subtitle: "Where Refunds Go",
                    items: [
                        "Credit/Debit Cards: Refunded to the same card used for purchase",
                        "UPI: Refunded to the same UPI ID",
                        "Net Banking: Refunded to the same bank account",
                        "Wallet: Refunded to the same wallet",
                    ],
                },
                {
                    subtitle: "Important Notes",
                    items: [
                        "Refunds cannot be transferred to a different payment method",
                        "If original payment method is no longer valid, contact support",
                        "International transactions may take additional 3-5 days",
                    ],
                },
            ],
        },
        {
            id: "cancellation",
            title: "6. Cancellation Policy",
            icon: XCircle,
            content: [
                {
                    subtitle: "How to Cancel",
                    items: [
                        "Subscriptions can be cancelled from your account settings",
                        "Listings can be deactivated from your listing dashboard",
                        "Advisory appointments via the booking confirmation email",
                        "Contact support for any other cancellation needs",
                    ],
                },
                {
                    subtitle: "After Cancellation",
                    items: [
                        "Subscription access continues until end of billing period",
                        "No new charges will be applied",
                        "Your data remains accessible for 30 days",
                        "Listings are immediately deactivated upon cancellation",
                    ],
                },
            ],
        },
        {
            id: "disputes",
            title: "7. Disputes & Chargebacks",
            icon: AlertTriangle,
            content: [
                {
                    subtitle: "Before Filing a Chargeback",
                    items: [
                        "Please contact our support team first",
                        "We resolve most issues within 24-48 hours",
                        "Chargebacks may result in account suspension",
                        "Additional fees may apply for invalid chargebacks",
                    ],
                },
                {
                    subtitle: "Dispute Resolution",
                    items: [
                        "Email support@bizsearch.in with your concern",
                        "Include transaction details and issue description",
                        "Our team will investigate and respond within 48 hours",
                        "Escalation to management available if needed",
                    ],
                },
            ],
        },
        {
            id: "exceptions",
            title: "8. Special Circumstances",
            icon: HelpCircle,
            content: [
                {
                    subtitle: "Exceptions May Apply",
                    items: [
                        "Technical issues preventing service delivery",
                        "Duplicate charges or billing errors",
                        "Service not as described (with documentation)",
                        "Extenuating circumstances (case-by-case basis)",
                    ],
                },
                {
                    subtitle: "How to Request Exception",
                    items: [
                        "Contact support with detailed explanation",
                        "Provide all relevant documentation",
                        "Cases are reviewed by our management team",
                        "Decision communicated within 5 business days",
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
                            <DollarSign className="w-4 h-4 mr-2" />
                            Money Back Guarantee
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Refund
                            <span className="bg-gradient-to-r from-primary via-primary to-growth-green bg-clip-text text-transparent">
                                {" "}Policy
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed max-w-3xl mx-auto">
                            We want you to be completely satisfied with your BizSearch experience.
                            If you're not happy with a purchase, we're here to help with our
                            straightforward refund process.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Last Updated: {lastUpdated}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Refund Highlights */}
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

            {/* Refund Process Steps */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <Badge variant="secondary" className="mb-4">
                                <RefreshCcw className="w-3 h-3 mr-1" />
                                Simple Process
                            </Badge>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                                How Refunds Work
                            </h2>
                            <p className="text-muted-foreground">
                                Our straightforward 5-step refund process
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {refundProcess.map((step, index) => (
                                <div key={index} className="relative">
                                    <Card className="h-full text-center hover:shadow-lg transition-all hover:-translate-y-1">
                                        <CardContent className="pt-6">
                                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-3 font-bold">
                                                {step.step}
                                            </div>
                                            <h3 className="font-semibold mb-2">{step.title}</h3>
                                            <p className="text-xs text-muted-foreground">{step.description}</p>
                                        </CardContent>
                                    </Card>
                                    {index < refundProcess.length - 1 && (
                                        <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
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
                                                        {'type' in contentBlock && contentBlock.type === 'not-eligible' ? (
                                                            <XCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                                                        ) : (
                                                            <CheckCircle className="h-4 w-4 text-growth-green mt-1 flex-shrink-0" />
                                                        )}
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
                            Need Help?
                        </Badge>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                            Questions About Refunds?
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Our support team is here to help you with any refund-related questions
                            or to assist with your refund request.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild>
                                <a href="mailto:refunds@bizsearch.in">
                                    <Mail className="w-4 h-4 mr-2" />
                                    refunds@bizsearch.in
                                </a>
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/contact">
                                    Contact Support
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
                                <Link to="/cookies">Cookie Policy</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
