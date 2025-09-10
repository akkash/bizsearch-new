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
} from "lucide-react";

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
    { number: "10,000+", label: "Businesses Listed", icon: Building },
    { number: "5,000+", label: "Successful Matches", icon: Handshake },
    { number: "₹500Cr+", label: "Deals Facilitated", icon: TrendingUp },
    { number: "95%", label: "Client Satisfaction", icon: Star },
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

  return (
    <div className={`min-h-screen ${className}`}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">
              🚀 AI-Powered Business Discovery Platform
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Transforming Business
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Discovery
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              BizSearch is India's most trusted platform for business
              acquisitions and franchise opportunities. We leverage cutting-edge
              AI technology to connect entrepreneurs with their perfect business
              match.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Explore Opportunities
              </Button>
              <Button size="lg" variant="outline">
                List Your Business
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                To democratize business ownership by making quality business
                opportunities accessible to every entrepreneur. We believe that
                with the right guidance and technology, anyone can build a
                successful business.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />

                  <p className="text-muted-foreground">
                    Transparent and verified business listings
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />

                  <p className="text-muted-foreground">
                    Expert guidance throughout the acquisition process
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />

                  <p className="text-muted-foreground">
                    AI-powered recommendations for better matches
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <achievement.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />

                    <div className="text-2xl font-bold text-foreground">
                      {achievement.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {achievement.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
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
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />

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

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
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
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                  />

                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-sm font-medium text-blue-600">
                    {member.role}
                  </CardDescription>
                  <Badge variant="secondary" className="text-xs">
                    {member.experience}
                  </Badge>
                </CardHeader>
                <CardContent>
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Perfect Business Opportunity?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful entrepreneurs who found their ideal
            business through BizSearch
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Start Your Search
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Talk to an Expert
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
