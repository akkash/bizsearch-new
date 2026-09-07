import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ChevronDown,
  ChevronUp,
  FileText,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { PageHero } from "@/components/page-hero";

export function HelpCenterPage({ className }: { className?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    {
      icon: Building2,
      title: "Buying a business",
      description: "Finding and purchasing businesses",
      link: "#buying",
    },
    {
      icon: FileText,
      title: "Selling your business",
      description: "How to list and sell",
      link: "#selling",
    },
    {
      icon: Store,
      title: "Franchise opportunities",
      description: "Explore and apply for franchises",
      link: "#franchise",
    },
    {
      icon: Users,
      title: "Account & profile",
      description: "Manage your account settings",
      link: "#account",
    },
    {
      icon: CreditCard,
      title: "Payments & billing",
      description: "Subscriptions, invoices, and refunds",
      link: "#payments",
    },
    {
      icon: Shield,
      title: "Safety & security",
      description: "Protect your account and data",
      link: "#security",
    },
  ];

  const faqs = [
    {
      question: "How do I create an account on BizSearch?",
      answer:
        "Click Sign Up at the top of any page. You can register with email or Google/LinkedIn. After verifying your email, complete your profile for better recommendations.",
      category: "account",
    },
    {
      question: "How do I list my business for sale?",
      answer:
        "Log in, open List Your Business, fill in details including financials and photos, then submit for review. Listings are typically reviewed within a few business days.",
      category: "selling",
    },
    {
      question: "Are the business listings verified?",
      answer:
        "Listings go through a verification process covering registration and basic documentation. Look for the Verified badge. Always conduct your own due diligence before any transaction.",
      category: "buying",
    },
    {
      question: "How does matching work?",
      answer:
        "Recommendations use your preferences, budget, location, and listing activity. You can also set filters on browse pages and in your profile.",
      category: "buying",
    },
    {
      question: "What are the fees for listing a business?",
      answer:
        "Basic listings are free. Paid options include featured placement and boosts. Success fees may apply on completed sales—see pricing or contact support for current rates.",
      category: "payments",
    },
    {
      question: "How do I apply for a franchise?",
      answer:
        "Open a franchise listing and use Apply Now. Submit your details and investment capacity. The franchisor reviews applications and contacts candidates who meet their criteria.",
      category: "franchise",
    },
    {
      question: "Can I cancel my subscription?",
      answer:
        "Yes, from Account Settings → Billing. Access continues until the end of the current billing period. See the refund policy for unused-service refunds.",
      category: "payments",
    },
    {
      question: "How do I contact a seller?",
      answer:
        "On a listing page, use Contact Seller or Send Inquiry. Messages go through the platform so conversations stay logged.",
      category: "buying",
    },
    {
      question: "What if I suspect a fraudulent listing?",
      answer:
        "Use Report on the listing page or email trust@bizsearch.in. Do not share sensitive information or pay outside the platform.",
      category: "security",
    },
    {
      question: "How do I reset my password?",
      answer:
        "On Login, choose Forgot Password and enter your email. Use the reset link within one hour. Check spam if it does not arrive.",
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
    <div className={`min-h-screen bg-background ${className ?? ""}`}>
      <PageHero
        eyebrow="Help"
        title="Help center"
        description="Answers about buying, selling, franchises, billing, and account security."
      >
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search FAQs…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </PageHero>

      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-semibold mb-4">Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <a key={category.title} href={category.link}>
                <Card className="border-border h-full hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <category.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{category.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently asked questions
            </h2>

            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => (
                <Card
                  key={faq.question}
                  className="border-border cursor-pointer"
                  onClick={() =>
                    setExpandedFaq(expandedFaq === index ? null : index)
                  }
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{faq.question}</h3>
                        {expandedFaq === index && (
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <Card className="border-border">
                <CardContent className="py-10 text-center">
                  <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium mb-1">No details found in the table.</h3>
                  <p className="text-sm text-muted-foreground">
                    Try another search term or browse topics above.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">Still need help?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-border">
                <CardContent className="pt-6 space-y-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Contact form</h3>
                  <p className="text-sm text-muted-foreground">
                    Send a detailed message through the contact page.
                  </p>
                  <Button className="w-full" asChild>
                    <Link to="/contact">Contact us</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6 space-y-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">
                    We aim to respond within one business day.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="mailto:support@bizsearch.in">support@bizsearch.in</a>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6 space-y-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Phone</h3>
                  <p className="text-sm text-muted-foreground">
                    Mon–Sat, 9 AM – 7 PM
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="tel:+919876543210">+91 98765 43210</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
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
      </section>
    </div>
  );
}
