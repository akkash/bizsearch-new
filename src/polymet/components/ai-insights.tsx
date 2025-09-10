import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Download,
  MessageCircle,
} from "lucide-react";

interface AIInsightsProps {
  type: "business" | "franchise";
  businessId: string;
  businessName: string;
  price: number;
  revenue?: number;
  industry: string;
  location: string;
  className?: string;
}

export function AIInsights({
  type,
  businessId,
  businessName,
  price,
  revenue,
  industry,
  location,
  className,
}: AIInsightsProps) {
  // Mock AI analysis - in real app, this would come from AI service
  const generateInsights = () => {
    const priceToRevenueRatio = revenue ? price / revenue : 0;
    const isHighPotential =
      priceToRevenueRatio < 3 && revenue && revenue > 5000000;
    const isOverpriced = priceToRevenueRatio > 5;

    return {
      overallScore: isHighPotential ? 85 : isOverpriced ? 45 : 70,
      recommendation: isHighPotential
        ? "High Potential"
        : isOverpriced
          ? "Proceed with Caution"
          : "Good Opportunity",
      keyInsights: [
        {
          type: isHighPotential
            ? "positive"
            : isOverpriced
              ? "warning"
              : "neutral",
          title: "Valuation Analysis",
          description: isHighPotential
            ? "Excellent price-to-revenue ratio indicates strong value proposition"
            : isOverpriced
              ? "Price appears high relative to current revenue streams"
              : "Fair valuation based on current market conditions",
        },
        {
          type: industry === "Technology" ? "positive" : "neutral",
          title: "Market Opportunity",
          description:
            industry === "Technology"
              ? "Tech sector showing strong growth potential in current market"
              : `${industry} sector maintains stable demand in ${location} market`,
        },
        {
          type:
            location.includes("Mumbai") || location.includes("Bangalore")
              ? "positive"
              : "neutral",
          title: "Location Advantage",
          description:
            location.includes("Mumbai") || location.includes("Bangalore")
              ? "Prime location with excellent business ecosystem and talent pool"
              : "Strategic location with good market access and infrastructure",
        },
      ],

      riskFactors: [
        "Market competition analysis needed",
        "Due diligence on financial statements required",
        "Regulatory compliance verification pending",
      ],

      opportunities: [
        "Digital transformation potential",
        "Market expansion possibilities",
        "Operational efficiency improvements",
      ],
    };
  };

  const insights = generateInsights();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation === "High Potential") return "bg-green-500";
    if (recommendation === "Proceed with Caution") return "bg-red-500";
    return "bg-blue-500";
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />

          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Analysis
          </span>
          <Badge variant="secondary" className="ml-auto">
            Powered by AI
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div>
            <div className="text-sm text-muted-foreground">
              AI Opportunity Score
            </div>
            <div
              className={`text-2xl font-bold ${getScoreColor(insights.overallScore).split(" ")[0]}`}
            >
              {insights.overallScore}/100
            </div>
          </div>
          <Badge className={getRecommendationColor(insights.recommendation)}>
            {insights.recommendation}
          </Badge>
        </div>

        {/* Key Insights */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" />
            Key Insights
          </h4>
          {insights.keyInsights.map((insight, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/30">
              {insight.type === "positive" ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : insight.type === "warning" ? (
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              ) : (
                <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-medium text-sm">{insight.title}</div>
                <div className="text-sm text-muted-foreground">
                  {insight.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Risk Factors */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Risk Factors to Consider
          </h4>
          <div className="space-y-2">
            {insights.riskFactors.map((risk, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0" />

                <span className="text-muted-foreground">{risk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Growth Opportunities
          </h4>
          <div className="space-y-2">
            {insights.opportunities.map((opportunity, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />

                <span className="text-muted-foreground">{opportunity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download AI Report
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask AI Advisor
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <strong>Disclaimer:</strong> AI analysis is based on available data
          and market trends. Please conduct thorough due diligence and consult
          with financial advisors before making investment decisions.
        </div>
      </CardContent>
    </Card>
  );
}
