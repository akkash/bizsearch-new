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
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Headphones,
  Send,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Building2,
  HelpCircle,
} from "lucide-react";

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

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our experts",
      value: "+91 98765 43210",
      action: "Call Now",
      available: "Mon-Sat, 9 AM - 7 PM",
      color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed responses to your queries",
      value: "support@bizsearch.in",
      action: "Send Email",
      available: "24/7 Response",
      color: "bg-growth-green/10 text-growth-green",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Instant support through our AI chat",
      value: "Available on website",
      action: "Start Chat",
      available: "24/7 Available",
      color: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    },
    {
      icon: Headphones,
      title: "Video Consultation",
      description: "Schedule a personalized consultation",
      value: "Book appointment",
      action: "Schedule Call",
      available: "Mon-Fri, 10 AM - 6 PM",
      color: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
    },
  ];

  const offices = [
    {
      city: "Mumbai",
      address:
        "Level 12, One World Centre, Tower 1, Jupiter Mill Compound, 841, Senapati Bapat Marg, Elphinstone Road, Mumbai - 400013",
      phone: "+91 98765 43210",
      email: "mumbai@bizsearch.in",
      type: "Headquarters",
    },
    {
      city: "Delhi",
      address:
        "3rd Floor, DLF Cyber City, Phase II, Sector 24, Gurugram, Haryana - 122002",
      phone: "+91 98765 43211",
      email: "delhi@bizsearch.in",
      type: "Regional Office",
    },
    {
      city: "Bangalore",
      address:
        "5th Floor, UB City Mall, Vittal Mallya Road, Ashok Nagar, Bengaluru, Karnataka - 560001",
      phone: "+91 98765 43212",
      email: "bangalore@bizsearch.in",
      type: "Regional Office",
    },
    {
      city: "Pune",
      address:
        "2nd Floor, Cerebrum IT Park, Kalyani Nagar, Pune, Maharashtra - 411014",
      phone: "+91 98765 43213",
      email: "pune@bizsearch.in",
      type: "Branch Office",
    },
  ];

  const specialists = [
    {
      name: "Ajay Kumar",
      role: "Business Acquisition Specialist",
      image: "https://github.com/yusufhilmi.png",
      expertise: "Business Valuation & Due Diligence",
      phone: "+91 98765 43220",
      email: "ajay@bizsearch.in",
    },
    {
      name: "Vijay Sharma",
      role: "Franchise Development Expert",
      image: "https://github.com/kdrnp.png",
      expertise: "Franchise Models & ROI Analysis",
      phone: "+91 98765 43221",
      email: "vijay@bizsearch.in",
    },
  ];

  const faqs = [
    {
      question: "How do I list my business?",
      answer: "Contact our team for a free consultation. We'll help you prepare and list your business with complete documentation.",
    },
    {
      question: "Are all listings verified?",
      answer: "Yes, every business and franchise opportunity undergoes thorough verification by our expert team before listing.",
    },
    {
      question: "What are your service charges?",
      answer: "Our pricing is transparent and success-based. Contact us for detailed information about our fee structure.",
    },
    {
      question: "Do you provide financing assistance?",
      answer: "We have partnerships with leading financial institutions to help you secure funding for your business acquisition.",
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
              <MessageCircle className="w-4 h-4 mr-2" />
              24/7 Expert Support Available
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Get in Touch with
              <span className="bg-gradient-to-r from-primary via-primary to-growth-green bg-clip-text text-transparent">
                {" "}Our Experts
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              Whether you're looking to buy a business, sell your company, or
              explore franchise opportunities, our team of specialists is here
              to guide you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Multiple Channels
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Multiple Ways to Reach Us
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the communication method that works best for you
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-xl transition-all hover:-translate-y-1 group"
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl ${method.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <method.icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-lg">{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="font-medium text-foreground">{method.value}</p>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {method.available}
                  </Badge>
                  <Button size="sm" className="w-full">
                    {method.action}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Specialists */}
      <section className="py-16 bg-gradient-to-br from-muted/30 via-muted/50 to-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Send className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                      <CardDescription>
                        We'll get back to you within 24 hours
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-growth-green/20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-growth-green" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-muted-foreground">
                        Thank you for reaching out. Our team will contact you
                        within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            placeholder="Enter your full name"
                            required
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            placeholder="Enter your email"
                            required
                            className="h-11"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            placeholder="+91 98765 43210"
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inquiry-type">Inquiry Type *</Label>
                          <Select
                            value={formData.inquiryType}
                            onValueChange={(value) =>
                              handleInputChange("inquiryType", value)
                            }
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select inquiry type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buy-business">
                                Buy a Business
                              </SelectItem>
                              <SelectItem value="sell-business">
                                Sell My Business
                              </SelectItem>
                              <SelectItem value="franchise-opportunity">
                                Franchise Opportunity
                              </SelectItem>
                              <SelectItem value="partnership">
                                Partnership
                              </SelectItem>
                              <SelectItem value="general">
                                General Inquiry
                              </SelectItem>
                              <SelectItem value="support">
                                Technical Support
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
                          placeholder="Brief subject of your inquiry"
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
                          placeholder="Please provide details about your inquiry..."
                          rows={5}
                          required
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Specialists */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-3">
                  Expert Team
                </Badge>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Talk to Our Specialists
                </h3>
                <p className="text-muted-foreground text-sm">
                  Get personalized guidance from our industry experts
                </p>
              </div>

              {specialists.map((specialist, index) => (
                <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1 group">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={specialist.image}
                          alt={specialist.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-colors"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-growth-green flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {specialist.name}
                        </h4>
                        <p className="text-sm text-primary font-medium">
                          {specialist.role}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          {specialist.expertise}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground text-xs">
                              {specialist.phone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground text-xs">
                              {specialist.email}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" className="w-full mt-3">
                          Schedule Call
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Building2 className="w-3 h-3 mr-1" />
              Our Offices
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Office Locations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Visit us at any of our offices across India for in-person
              consultations
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offices.map((office, index) => (
              <Card key={index} className="hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{office.city}</CardTitle>
                    <Badge
                      variant={
                        office.type === "Headquarters" ? "default" : "secondary"
                      }
                    >
                      {office.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {office.address}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{office.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{office.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Mon-Sat, 9:00 AM - 7:00 PM</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
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
                Quick answers to common questions about our services
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">
                          {faq.question}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-primary via-primary to-growth-green relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-2xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white blur-2xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Business Journey?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Connect with our experts today and take the first step towards your entrepreneurial success
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Live Chat
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
