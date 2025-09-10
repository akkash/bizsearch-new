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
  Building,
  Users,
  Headphones,
  Send,
  CheckCircle,
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
    // Simulate form submission
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
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed responses to your queries",
      value: "support@bizsearch.in",
      action: "Send Email",
      available: "24/7 Response",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Instant support through our AI chat",
      value: "Available on website",
      action: "Start Chat",
      available: "24/7 Available",
    },
    {
      icon: Headphones,
      title: "Video Consultation",
      description: "Schedule a personalized consultation",
      value: "Book appointment",
      action: "Schedule Call",
      available: "Mon-Fri, 10 AM - 6 PM",
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

  return (
    <div className={`min-h-screen ${className}`}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">
              💬 24/7 Expert Support Available
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Get in Touch with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Our Experts
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Whether you're looking to buy a business, sell your company, or
              explore franchise opportunities, our team of specialists is here
              to guide you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
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
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <method.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />

                  <CardTitle className="text-lg">{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="font-medium text-foreground">{method.value}</p>
                  <Badge variant="secondary" className="text-xs">
                    {method.available}
                  </Badge>
                  <Button size="sm" className="w-full">
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Specialists */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24
                    hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />

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
                            <SelectTrigger>
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
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Talk to Our Specialists
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Get personalized guidance from our industry experts
                </p>
              </div>

              {specialists.map((specialist, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={specialist.image}
                        alt={specialist.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />

                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {specialist.name}
                        </h4>
                        <p className="text-sm text-blue-600 font-medium">
                          {specialist.role}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          {specialist.expertise}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />

                            <span className="text-muted-foreground">
                              {specialist.phone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />

                            <span className="text-muted-foreground">
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Office Locations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Visit us at any of our offices across India for in-person
              consultations
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offices.map((office, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
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
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {office.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />

                    <span className="text-sm text-muted-foreground">
                      {office.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />

                    <span className="text-sm text-muted-foreground">
                      {office.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />

                    <span className="text-sm text-muted-foreground">
                      Mon-Sat, 9:00 AM - 7:00 PM
                    </span>
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
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Quick answers to common questions about our services
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-foreground mb-2">
                    How do I list my business?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Contact our team for a free consultation. We'll help you
                    prepare and list your business with complete documentation.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-foreground mb-2">
                    Are all listings verified?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, every business and franchise opportunity undergoes
                    thorough verification by our expert team before listing.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-foreground mb-2">
                    What are your service charges?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Our pricing is transparent and success-based. Contact us for
                    detailed information about our fee structure.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-foreground mb-2">
                    Do you provide financing assistance?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    We have partnerships with leading financial institutions to
                    help you secure funding for your business acquisition.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
