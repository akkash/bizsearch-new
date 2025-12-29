import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    HelpCircle,
    Search,
    Building2,
    Users,
    CreditCard,
    Shield,
    MessageCircle,
    Phone,
    Mail,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    BookOpen,
    FileText,
    Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export function HelpCenterPage({ className }: { className?: string }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const categories = [
        {
            icon: Building2,
            title: "Buying a Business",
            description: "Guide to finding and purchasing businesses",
            articles: 12,
            link: "#buying",
        },
        {
            icon: FileText,
            title: "Selling Your Business",
            description: "How to list and sell your business",
            articles: 10,
            link: "#selling",
        },
        {
            icon: Sparkles,
            title: "Franchise Opportunities",
            description: "Explore and apply for franchises",
            articles: 8,
            link: "#franchise",
        },
        {
            icon: Users,
            title: "Account & Profile",
            description: "Manage your account settings",
            articles: 15,
            link: "#account",
        },
        {
            icon: CreditCard,
            title: "Payments & Billing",
            description: "Subscriptions, invoices, and refunds",
            articles: 9,
            link: "#payments",
        },
        {
            icon: Shield,
            title: "Safety & Security",
            description: "Protect your account and data",
            articles: 7,
            link: "#security",
        },
    ];

    const faqs = [
        {
            question: "How do I create an account on BizSearch?",
            answer: "Creating an account is simple. Click the 'Sign Up' button at the top right of any page. You can sign up using your email address or through Google/LinkedIn. After verifying your email, complete your profile to get personalized recommendations.",
            category: "account",
        },
        {
            question: "How do I list my business for sale?",
            answer: "To list your business: 1) Log into your account, 2) Click 'List Your Business' in the navigation, 3) Fill out the business details form including financials, operations, and photos, 4) Submit for verification. Our team will review and approve your listing within 2-3 business days.",
            category: "selling",
        },
        {
            question: "Are the business listings verified?",
            answer: "Yes, all listings go through our verification process. We verify business registration, ownership documents, and basic financial information. Look for the 'Verified' badge on listings. However, we recommend conducting your own due diligence before any transaction.",
            category: "buying",
        },
        {
            question: "How does the AI matchmaker work?",
            answer: "Our AI matchmaker analyzes your preferences, budget, location, and interests to recommend businesses that fit your criteria. The more you interact with listings (save, inquire, view), the better our recommendations become. You can also set specific filters in your profile.",
            category: "buying",
        },
        {
            question: "What are the fees for listing a business?",
            answer: "Basic listings are free. Premium features include: Featured Listings (₹4,999/month), Boost Visibility (₹1,999/week), and Priority Support (₹999/month). We also charge a success fee of 1-3% upon successful sale, depending on the transaction value.",
            category: "payments",
        },
        {
            question: "How do I apply for a franchise?",
            answer: "Browse our franchise listings and click 'Apply Now' on any opportunity that interests you. Fill out the application form with your details and investment capacity. The franchisor will review your application and contact you directly if you meet their criteria.",
            category: "franchise",
        },
        {
            question: "Can I cancel my subscription?",
            answer: "Yes, you can cancel your subscription anytime from Account Settings > Billing. Your subscription will remain active until the end of the current billing period. No charges will be applied after cancellation. Refunds are available within 7 days of purchase for unused services.",
            category: "payments",
        },
        {
            question: "How do I contact a seller?",
            answer: "On any listing page, click 'Contact Seller' or 'Send Inquiry'. You can send a message directly through our platform. Premium members can also see seller contact details directly. All communications are logged for your security.",
            category: "buying",
        },
        {
            question: "What if I suspect a fraudulent listing?",
            answer: "Report suspicious listings immediately using the 'Report' button on the listing page, or email trust@bizsearch.in. Our Trust & Safety team investigates all reports within 24 hours. Never share sensitive information or make payments outside the platform.",
            category: "security",
        },
        {
            question: "How do I reset my password?",
            answer: "Click 'Login', then 'Forgot Password'. Enter your registered email address, and we'll send a password reset link. The link expires in 1 hour. If you don't receive the email, check your spam folder or contact support.",
            category: "account",
        },
    ];

    const filteredFaqs = searchQuery
        ? faqs.filter(
            (faq) =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : faqs;

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
                            <HelpCircle className="w-4 h-4 mr-2" />
                            24/7 Support Available
                        </Badge>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Help
                            <span className="bg-gradient-to-r from-primary via-primary to-growth-green bg-clip-text text-transparent">
                                {" "}Center
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                            Find answers to your questions, learn how to use BizSearch,
                            and get the support you need to succeed in your business journey.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search for help articles, FAQs, or topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 h-14 text-lg rounded-xl border-2 focus:border-primary"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Help Categories */}
            <section className="py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <Badge variant="secondary" className="mb-4">
                            <BookOpen className="w-3 h-3 mr-1" />
                            Browse Topics
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            How Can We Help You?
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Browse our help categories or use the search above to find what you need
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category, index) => (
                            <Card
                                key={index}
                                className="hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer"
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <category.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{category.title}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {category.articles} articles
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-gradient-to-br from-muted/30 via-muted/50 to-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <Badge variant="secondary" className="mb-4">
                                <HelpCircle className="w-3 h-3 mr-1" />
                                FAQ
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Quick answers to the most common questions
                            </p>
                        </div>

                        <div className="space-y-4">
                            {filteredFaqs.map((faq, index) => (
                                <Card
                                    key={index}
                                    className={`cursor-pointer transition-all ${expandedFaq === index ? "shadow-lg" : "hover:shadow-md"
                                        }`}
                                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                >
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground">
                                                    {faq.question}
                                                </h3>
                                                {expandedFaq === index && (
                                                    <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                                                        {faq.answer}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                                {expandedFaq === index ? (
                                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredFaqs.length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="font-semibold text-foreground mb-2">No results found</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Try a different search term or browse our help categories above
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </section>

            {/* Contact Support Section */}
            <section className="py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <Badge variant="secondary" className="mb-4">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Still Need Help?
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                Contact Our Support Team
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Our friendly support team is here to help you 24/7
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-1">
                                <CardContent className="pt-8 pb-6">
                                    <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Get instant answers from our AI assistant or human agent
                                    </p>
                                    <Badge variant="outline" className="mb-4">
                                        Available 24/7
                                    </Badge>
                                    <Button className="w-full">Start Chat</Button>
                                </CardContent>
                            </Card>

                            <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-1">
                                <CardContent className="pt-8 pb-6">
                                    <div className="w-14 h-14 rounded-xl bg-growth-green/10 flex items-center justify-center mx-auto mb-4">
                                        <Mail className="h-7 w-7 text-growth-green" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">Email Support</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Send us a detailed message and we'll respond within 24 hours
                                    </p>
                                    <Badge variant="outline" className="mb-4">
                                        Response in 24h
                                    </Badge>
                                    <Button variant="outline" className="w-full" asChild>
                                        <a href="mailto:support@bizsearch.in">
                                            support@bizsearch.in
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="text-center hover:shadow-xl transition-all hover:-translate-y-1">
                                <CardContent className="pt-8 pb-6">
                                    <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
                                        <Phone className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Speak directly with our support team for urgent matters
                                    </p>
                                    <Badge variant="outline" className="mb-4">
                                        Mon-Sat, 9AM-7PM
                                    </Badge>
                                    <Button variant="outline" className="w-full" asChild>
                                        <a href="tel:+919876543210">
                                            +91 98765 43210
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Links */}
            <section className="py-12 border-t bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-lg font-semibold mb-4 text-center">Quick Links</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link to="/contact">Contact Us</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link to="/terms">Terms of Service</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link to="/privacy">Privacy Policy</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link to="/refund-policy">Refund Policy</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
