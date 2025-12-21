import { useState, useEffect } from "react";
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
  Loader2,
  Lock,
} from "lucide-react";
import { GeminiService } from "@/lib/gemini-service";
import { jsPDF } from "jspdf";
import { useFeatureFlag } from "@/contexts/FeatureFlagsContext";

interface AIInsightsProps {
  type: "business" | "franchise";
  businessId: string;
  businessName: string;
  price: number;
  revenue?: number;
  industry: string;
  location: string;
  className?: string;
  onOpenAIChat?: (context: AIInsightContext) => void;
}

interface AIInsightContext {
  businessName: string;
  type: "business" | "franchise";
  initialMessage: string;
}

interface AIAnalysisResult {
  overallScore: number;
  recommendation: string;
  keyInsights: Array<{
    type: "positive" | "warning" | "neutral";
    title: string;
    description: string;
  }>;
  riskFactors: string[];
  opportunities: string[];
  detailedAnalysis?: string;
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
  onOpenAIChat,
}: AIInsightsProps) {
  const [insights, setInsights] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Feature flag
  const isAIMatchingEnabled = useFeatureFlag('ai_matching');

  // Generate AI insights on component mount
  useEffect(() => {
    if (isAIMatchingEnabled) {
      generateAIInsights();
    } else {
      setLoading(false);
    }
  }, [businessId, price, revenue, industry, location, isAIMatchingEnabled]);

  // Show disabled state if feature flag is off
  if (!isAIMatchingEnabled) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400">AI Analysis</span>
            <Badge variant="secondary" className="ml-auto">
              Disabled
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 bg-muted rounded-full mb-3">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              AI Analysis is currently disabled.
              <br />
              <span className="text-xs">Contact admin to enable this feature.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const generateAIInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use real AI to generate insights
      const analysisPrompt = `Analyze this ${type === "business" ? "business" : "franchise"} opportunity and provide detailed investment insights:

Business Name: ${businessName}
Type: ${type === "business" ? "Business Acquisition" : "Franchise Opportunity"}
Asking Price: ₹${price.toLocaleString()}
Annual Revenue: ${revenue ? `₹${revenue.toLocaleString()}` : "Not disclosed"}
Industry: ${industry}
Location: ${location}

Provide a comprehensive analysis in the following JSON format:
{
  "overallScore": <number 0-100>,
  "recommendation": "<High Potential|Good Opportunity|Proceed with Caution|High Risk>",
  "keyInsights": [
    {
      "type": "<positive|warning|neutral>",
      "title": "<insight title>",
      "description": "<detailed description>"
    }
  ],
  "riskFactors": ["<risk 1>", "<risk 2>", "<risk 3>"],
  "opportunities": ["<opportunity 1>", "<opportunity 2>", "<opportunity 3>"]
}

Provide at least 3 key insights, 3-5 risk factors, and 3-5 opportunities. Focus on valuation, market potential, location advantages, and financial metrics.`;

      const aiResponse = await GeminiService.sendMessage(
        analysisPrompt,
        "ajay",
        {
          businessData: {
            name: businessName,
            price,
            revenue,
            industry,
            location,
          },
        },
        []
      );

      // Try to parse JSON from AI response
      let parsedInsights: AIAnalysisResult;
      try {
        // Extract JSON from response (AI might wrap it in markdown)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedInsights = JSON.parse(jsonMatch[0]);
          parsedInsights.detailedAnalysis = aiResponse;
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        // Fallback to basic analysis if JSON parsing fails
        parsedInsights = generateBasicInsights();
        parsedInsights.detailedAnalysis = aiResponse;
      }

      setInsights(parsedInsights);
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      setError(error.message || "Failed to generate AI insights");

      // Fallback to basic analysis
      setInsights(generateBasicInsights());
    } finally {
      setLoading(false);
    }
  };

  const generateBasicInsights = (): AIAnalysisResult => {
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

  const handleDownloadReport = async () => {
    if (!insights) return;

    setDownloadingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("AI Investment Analysis Report", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 15;

      // Business Details
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Business: ${businessName}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Type: ${type === "business" ? "Business Acquisition" : "Franchise Opportunity"}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Industry: ${industry}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Location: ${location}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Price: ₹${price.toLocaleString()}`, margin, yPosition);
      yPosition += 7;
      if (revenue) {
        doc.text(`Revenue: ₹${revenue.toLocaleString()}`, margin, yPosition);
        yPosition += 7;
      }
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 15;

      // Overall Score
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`AI Opportunity Score: ${insights.overallScore}/100`, margin, yPosition);
      yPosition += 7;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Recommendation: ${insights.recommendation}`, margin, yPosition);
      yPosition += 15;

      // Key Insights
      doc.setFont("helvetica", "bold");
      doc.text("Key Insights:", margin, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      insights.keyInsights.forEach((insight, index) => {
        const lines = doc.splitTextToSize(
          `${index + 1}. ${insight.title}: ${insight.description}`,
          pageWidth - 2 * margin
        );
        doc.text(lines, margin, yPosition);
        yPosition += lines.length * 5 + 3;

        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
      yPosition += 10;

      // Risk Factors
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text("Risk Factors:", margin, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      insights.riskFactors.forEach((risk, index) => {
        const lines = doc.splitTextToSize(
          `${index + 1}. ${risk}`,
          pageWidth - 2 * margin
        );
        doc.text(lines, margin, yPosition);
        yPosition += lines.length * 5 + 3;
      });
      yPosition += 10;

      // Opportunities
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text("Growth Opportunities:", margin, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      insights.opportunities.forEach((opportunity, index) => {
        const lines = doc.splitTextToSize(
          `${index + 1}. ${opportunity}`,
          pageWidth - 2 * margin
        );
        doc.text(lines, margin, yPosition);
        yPosition += lines.length * 5 + 3;
      });
      yPosition += 15;

      // Detailed Analysis
      if (insights.detailedAnalysis) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.text("Detailed AI Analysis:", margin, yPosition);
        yPosition += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const analysisLines = doc.splitTextToSize(
          insights.detailedAnalysis,
          pageWidth - 2 * margin
        );
        analysisLines.forEach((line: string) => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      const disclaimer = "Disclaimer: This AI-generated analysis is for informational purposes only. Please conduct thorough due diligence and consult with financial advisors before making investment decisions.";
      const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);
      doc.text(disclaimerLines, margin, doc.internal.pageSize.getHeight() - 20);

      // Save PDF
      doc.save(`AI-Analysis-${businessName.replace(/\s+/g, "-")}-${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleAskAIAdvisor = () => {
    const context: AIInsightContext = {
      businessName,
      type,
      initialMessage: `I'm interested in this ${type} opportunity: ${businessName}. Based on your AI analysis showing a score of ${insights?.overallScore}/100, can you provide more insights and help me evaluate this opportunity?`,
    };

    if (onOpenAIChat) {
      onOpenAIChat(context);
    } else {
      // Fallback: scroll to AI chat if it exists on page
      const aiChatButton = document.querySelector('[data-ai-chat]') as HTMLButtonElement;
      if (aiChatButton) {
        aiChatButton.click();
      } else {
        alert("AI Chat feature is available. Please use the AI chat button in the navigation.");
      }
    }
  };

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

  if (loading) {
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
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
            <p className="text-muted-foreground text-center">
              Generating AI insights...
              <br />
              <span className="text-xs">This may take a few moments</span>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !insights) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Analysis
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-600 mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              Unable to generate AI insights
              <br />
              <span className="text-xs text-red-600">{error}</span>
            </p>
            <Button onClick={generateAIInsights} variant="outline" size="sm">
              <Brain className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

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
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDownloadReport}
            disabled={downloadingPDF}
          >
            {downloadingPDF ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {downloadingPDF ? "Generating..." : "Download AI Report"}
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={handleAskAIAdvisor}
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
