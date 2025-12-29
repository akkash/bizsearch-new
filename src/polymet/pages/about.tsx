import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Users,
  Shield,
  TrendingUp,
  Award,
  Globe,
  CheckCircle,
  Star,
  Building,
  Handshake,
  Sparkles,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

export function AboutPage({ className }: { className?: string }) {
  const teamMembers = [
    {
      name: "Ajay Kumar",
      role: "Business Acquisition Specialist",
      image: "https://github.com/yusufhilmi.png",
      experience: "8+ years",
      expertise: ["Business Valuation", "Due Diligence", "Market Analysis"],
    },
    {
      name: "Vijay Sharma",
      role: "Franchise Development Expert",
      image: "https://github.com/kdrnp.png",
      experience: "10+ years",
      expertise: ["Franchise Models", "ROI Analysis", "Territory Planning"],
    },
    {
      name: "Priya Patel",
      role: "Technology Lead",
      image: "https://github.com/yahyabedirhan.png",
      experience: "6+ years",
      expertise: ["AI/ML", "Platform Development", "Data Analytics"],
    },
    {
      name: "Rahul Singh",
      role: "Market Research Director",
      image: "https://github.com/denizbuyuktas.png",
      experience: "12+ years",
      expertise: [
        "Market Intelligence",
        "Industry Analysis",
        "Trend Forecasting",
      ],
    },
  ];

  const achievements = [
    { number: "15,000+", label: "Businesses Listed", icon: Building },
    { number: "50,000+", label: "Registered Users", icon: Users },
    { number: "1,00,000+", label: "Successful Matches", icon: Handshake },
    { number: "500+", label: "Cities Covered", icon: MapPin },
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Listings",
      description:
        "Every business and franchise opportunity is thoroughly verified by our expert team",
    },
    {
      icon: Target,
      title: "AI-Powered Matching",
      description:
        "Advanced algorithms match you with opportunities that fit your criteria perfectly",
    },
    {
      icon: Users,
      title: "Expert Guidance",
      description:
        "Get personalized advice from industry specialists throughout your journey",
    },
    {
      icon: Globe,
      title: "Pan-India Coverage",
      description:
        "Access opportunities across all major cities and emerging markets in India",
    },
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "Every listing is verified. No hidden information.",
    },
    {
      icon: Sparkles,
      title: "Innovation",
      description: "AI-powered tools for smarter business decisions.",
    },
    {
      icon: Users,
      title: "Customer First",
      description: "Your success is our primary goal.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Industry-leading standards in every interaction.",
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
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Business Discovery Platform
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Transforming Business
              <span className="bg-gradient-to-r from-primary via-primary to-growth-green bg-clip-text text-transparent">
                {" "}Discovery
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              BizSearch is India's most trusted platform for business
              acquisitions and franchise opportunities. We leverage cutting-edge
              AI technology to connect entrepreneurs with their perfect business
              match.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/businesses">
                  Explore Opportunities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/add-business-listing">
                  List Your Business
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-8 border-y bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <achievement.icon className="h-5 w-5 text-primary" />
                  <span className="text-2xl md:text-3xl font-bold text-foreground">
                    {achievement.number}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{achievement.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                Our Mission
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Democratizing Business Ownership
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                We believe that with the right guidance and technology, anyone can build a
                successful business. Our mission is to make quality business opportunities
                accessible to every entrepreneur in India.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-growth-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-growth-green" />
                  </div>
                  <p className="text-muted-foreground">
                    Transparent and verified business listings
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-growth-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-growth-green" />
                  </div>
                  <p className="text-muted-foreground">
                    Expert guidance throughout the acquisition process
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-growth-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-growth-green" />
                  </div>
                  <p className="text-muted-foreground">
                    AI-powered recommendations for better matches
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {values.map((value, index) => (
                <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <value.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 bg-gradient-to-br from-muted/30 via-muted/50 to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Star className="w-3 h-3 mr-1" />
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose BizSearch?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We combine technology, expertise, and trust to deliver the best
              business discovery experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-xl transition-all hover:-translate-y-1 bg-background"
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Our Team
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Expert Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Industry veterans with decades of combined experience in business
              acquisitions and franchise development
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-xl transition-all hover:-translate-y-1 group"
              >
                <CardHeader className="pb-2">
                  <div className="relative mx-auto mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-primary/20 group-hover:border-primary/40 transition-colors"
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {member.experience}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-sm font-medium text-primary">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {member.expertise.map((skill, skillIndex) => (
                      <Badge
                        key={skillIndex}
                        variant="outline"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-growth-green" />
              <span className="text-sm font-medium">Verified Listings</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5 text-growth-green" />
              <span className="text-sm font-medium">Secure Transactions</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Award className="h-5 w-5 text-growth-green" />
              <span className="text-sm font-medium">Safe Payments</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-5 w-5 text-growth-green" />
              <span className="text-sm font-medium">Trusted Platform</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-5 w-5 text-growth-green" />
              <span className="text-sm font-medium">Made with ❤️ in India</span>
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
            Ready to Find Your Perfect Business Opportunity?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of successful entrepreneurs who found their ideal
            business through BizSearch
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Link to="/businesses">
                Start Your Search
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              <Link to="/contact">
                Talk to an Expert
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="h-4 w-4" />
              <span className="text-sm">+91 98765 43210</span>
            </a>
            <a href="mailto:contact@bizsearch.in" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
              <span className="text-sm">contact@bizsearch.in</span>
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Mumbai, Maharashtra, India</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
