import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";

export function ContactPage({ className }: { className?: string }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const faqs = [
    {
      question: "How do I list my business?",
      answer:
        "Contact our team for a consultation. We'll help you prepare and list your business with complete documentation.",
    },
    {
      question: "Are all listings verified?",
      answer:
        "Listings go through a verification process before publication. Always do your own due diligence before any transaction.",
    },
    {
      question: "What are your service charges?",
      answer:
        "Pricing depends on the service. Contact us for details about listing and success fees.",
    },
    {
      question: "Do you provide financing assistance?",
      answer:
        "We share partner financing options and tools. Eligibility and terms are set by the lenders.",
    },
  ];

  return (
    <div className={`min-h-screen bg-background ${className ?? ""}`}>
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        description="Questions about buying, selling, or franchising? Send a message and we’ll reply within one business day."
      />

      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Send a message
                  </CardTitle>
                  <CardDescription>
                    Fill in the form below. Required fields are marked with *.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 rounded-full bg-growth-green/15 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-6 w-6 text-growth-green" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">Message sent</h3>
                      <p className="text-sm text-muted-foreground">
                        Thanks for reaching out. We’ll contact you soon.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            placeholder="Your name"
                            required
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            placeholder="you@example.com"
                            required
                            className="h-11"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            placeholder="+91 …"
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inquiry-type">Inquiry type *</Label>
                          <Select
                            value={formData.inquiryType}
                            onValueChange={(value) =>
                              handleInputChange("inquiryType", value)
                            }
                          >
                            <SelectTrigger className="h-11" id="inquiry-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buy-business">
                                Buy a business
                              </SelectItem>
                              <SelectItem value="sell-business">
                                Sell my business
                              </SelectItem>
                              <SelectItem value="franchise-opportunity">
                                Franchise opportunity
                              </SelectItem>
                              <SelectItem value="partnership">
                                Partnership
                              </SelectItem>
                              <SelectItem value="general">
                                General inquiry
                              </SelectItem>
                              <SelectItem value="support">
                                Technical support
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) =>
                            handleInputChange("subject", e.target.value)
                          }
                          placeholder="Brief subject"
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) =>
                            handleInputChange("message", e.target.value)
                          }
                          placeholder="Details about your inquiry…"
                          rows={5}
                          required
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full sm:w-auto">
                        <Send className="h-4 w-4 mr-2" />
                        Send message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Direct contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a
                        href="tel:+919876543210"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        +91 98765 43210
                      </a>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Mon–Sat, 9 AM – 7 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href="mailto:support@bizsearch.in"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        support@bizsearch.in
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Office</p>
                      <p className="text-muted-foreground leading-relaxed">
                        Mumbai, Maharashtra, India
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Common questions
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-medium text-sm mb-1">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
