import React from "react";
import {
  Shield,
  CheckCircle,
  Users,
  Star,
  Award,
  Lock,
  Phone,
  Clock,
  Globe,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TrustIndicatorsProps {
  variant?: "full" | "compact" | "minimal";
  className?: string;
}

export function TrustIndicators({
  variant = "full",
  className,
}: TrustIndicatorsProps) {
  const verificationBadges = [
    {
      icon: Shield,
      label: "Verified Platform",
      description: "All listings verified by our experts",
      color: "bg-green-500",
    },
    {
      icon: CheckCircle,
      label: "Document Verified",
      description: "Legal documents authenticated",
      color: "bg-blue-500",
    },
    {
      icon: Lock,
      label: "Secure Transactions",
      description: "Bank-grade security & escrow",
      color: "bg-purple-500",
    },
    {
      icon: Award,
      label: "Industry Recognition",
      description: "Trusted by leading brokers",
      color: "bg-orange-500",
    },
  ];

  const statistics = [
    {
      icon: Users,
      value: "25,000+",
      label: "Happy Customers",
      growth: "+15%",
      color: "text-blue-600",
    },
    {
      icon: CheckCircle,
      value: "95%",
      label: "Success Rate",
      growth: "+2%",
      color: "text-green-600",
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Customer Rating",
      growth: "★★★★★",
      color: "text-yellow-600",
    },
    {
      icon: Globe,
      value: "50+",
      label: "Cities Covered",
      growth: "+5 new",
      color: "text-purple-600",
    },
  ];

  const trustFeatures = [
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Round-the-clock customer assistance",
    },
    {
      icon: Clock,
      title: "Quick Response",
      description: "Average response time under 2 hours",
    },
    {
      icon: Shield,
      title: "Money Back Guarantee",
      description: "100% satisfaction guaranteed",
    },
    {
      icon: Lock,
      title: "Privacy Protected",
      description: "Your data is safe and secure",
    },
  ];

  const testimonials = [
    {
      name: "Rajesh Sharma",
      role: "Business Owner",
      avatar: "https://github.com/yusufhilmi.png",
      rating: 5,
      text: "Found my dream restaurant through BizSearch. The AI assistant made the process so smooth!",
    },
    {
      name: "Priya Nair",
      role: "Franchise Owner",
      avatar: "https://github.com/kdrnp.png",
      rating: 5,
      text: "Excellent platform with verified listings. Vijay helped me choose the perfect franchise opportunity.",
    },
    {
      name: "Amit Patil",
      role: "Investor",
      avatar: "https://github.com/yahyabedirhan.png",
      rating: 5,
      text: "Professional service and genuine listings. Highly recommend for serious business buyers.",
    },
  ];

  if (variant === "minimal") {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {verificationBadges.slice(0, 2).map((badge, index) => (
          <Badge key={index} className={`${badge.color} text-white`}>
            <badge.icon className="h-3 w-3 mr-1" />

            {badge.label}
          </Badge>
        ))}
        <div className="flex items-center text-sm text-muted-foreground">
          <Star className="h-4 w-4 text-yellow-500 mr-1" />
          4.9/5 (2,500+ reviews)
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Verification Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {verificationBadges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
            >
              <div className={`p-2 ${badge.color} rounded-full`}>
                <badge.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">{badge.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statistics.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className={`py-12 bg-muted/30 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose BizSearch?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            India's most trusted platform for business acquisitions and
            franchise opportunities, backed by industry-leading security and
            verification processes.
          </p>
        </div>

        <div className="space-y-12">
          {/* Verification Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {verificationBadges.map((badge, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div
                    className={`inline-flex p-4 ${badge.color} rounded-full mb-4`}
                  >
                    <badge.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{badge.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {badge.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center mb-8">
              Our Track Record
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statistics.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className={`p-3 bg-muted rounded-full`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium mb-1">{stat.label}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center">
                    <TrendingUp className="h-3 w-3 mr-1" />

                    {stat.growth}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-white rounded-lg"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Testimonials */}
          <div>
            <h3 className="text-2xl font-bold text-center mb-8">
              What Our Customers Say
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full"
                      />

                      <div>
                        <div className="font-medium">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex mb-3">
                      {Array.from({ length: testimonial.rating }).map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        )
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      "{testimonial.text}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Security Certifications */}
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-6">Trusted & Certified</h3>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6" />

                <span className="text-sm font-medium">SSL Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />

                <span className="text-sm font-medium">ISO Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-6 w-6" />

                <span className="text-sm font-medium">GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
