import React from "react";
import {
  Shield,
  CheckCircle,
  Award,
  Lock,
  Phone,
  Clock,
  FileCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      label: "Identity Verified",
      description: "When a user completes identity verification",
      color: "bg-green-500",
    },
    {
      icon: FileCheck,
      label: "Documentation Reviewed",
      description: "When franchisor documents have been reviewed",
      color: "bg-blue-500",
    },
    {
      icon: Lock,
      label: "Secure Platform",
      description: "Encrypted connections and protected account data",
      color: "bg-purple-500",
    },
    {
      icon: Award,
      label: "Transparent Listings",
      description: "Investment and requirement details shown clearly",
      color: "bg-orange-500",
    },
  ];

  const trustFeatures = [
    {
      icon: Phone,
      title: "Support available",
      description: "Contact our team through the help center",
    },
    {
      icon: Clock,
      title: "Listing moderation",
      description: "Franchise listings can be reviewed before publication",
    },
    {
      icon: Shield,
      title: "Explainable matching",
      description: "Match scores include reasons — not unexplained AI ratings",
    },
    {
      icon: Lock,
      title: "Privacy protected",
      description: "Your enquiry and profile data stay on the platform",
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
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`space-y-6 ${className}`}>
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
      </div>
    );
  }

  return (
    <section className={`py-12 bg-muted/30 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Trust through transparency</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Verification badges reflect completed checks. We do not display
            fabricated statistics, reviews, or success rates.
          </p>
        </div>

        <div className="space-y-12">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-white dark:bg-card rounded-lg"
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

          <div className="text-center">
            <div className="flex justify-center items-center gap-8 opacity-80">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                <span className="text-sm font-medium">HTTPS secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
