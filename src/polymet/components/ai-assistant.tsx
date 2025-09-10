import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  FileText,
  Lightbulb,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AISuggestion {
  type: "valuation" | "description" | "comparable" | "improvement";
  title: string;
  content: string;
  confidence: number;
  action?: string;
}

interface AIAssistantProps {
  businessData?: {
    name?: string;
    industry?: string[];
    location?: string;
    revenue?: number;
    employees?: number;
    description?: string;
  };
  onApplySuggestion?: (suggestion: AISuggestion) => void;
  className?: string;
}

export function AIAssistant({
  businessData = {},
  onApplySuggestion,
  className,
}: AIAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<"suggestions" | "chat">(
    "suggestions"
  );
  const [chatMessage, setChatMessage] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateSuggestions = async () => {
    setIsLoading(true);

    // Simulate AI API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockSuggestions: AISuggestion[] = [
      {
        type: "valuation",
        title: "Suggested Asking Price",
        content: `Based on similar ${businessData.industry?.[0] || "food & beverage"} businesses in ${businessData.location || "Mumbai"}, the recommended asking price range is ₹22-28 lakhs. This factors in your revenue of ₹${(businessData.revenue || 4200000).toLocaleString()}, location premium, and current market conditions.`,
        confidence: 87,
        action: "Apply Price Range",
      },
      {
        type: "description",
        title: "Enhanced Description",
        content: `${businessData.name || "Your business"} stands out in the competitive ${businessData.industry?.[0] || "food service"} market with its prime location and established customer base. Key selling points include: proven revenue track record, loyal customer following, streamlined operations, and growth potential through extended hours and delivery services.`,
        confidence: 92,
        action: "Use Description",
      },
      {
        type: "comparable",
        title: "Market Comparables",
        content: `Similar businesses recently sold: "Bandra Bistro" (₹24L, 2023), "Express Cafe Chain" (₹31L, 2024), "Mumbai Food Corner" (₹19L, 2023). Your business shows competitive metrics with higher foot traffic and better profit margins than average.`,
        confidence: 78,
        action: "View Details",
      },
      {
        type: "improvement",
        title: "Listing Optimization",
        content: `To increase buyer interest: Add photos of peak hours showing customer flow, highlight your social media following (if any), mention any unique recipes or supplier relationships, and consider offering seller financing to attract more buyers.`,
        confidence: 85,
        action: "Apply Tips",
      },
    ];

    setSuggestions(mockSuggestions);
    setIsLoading(false);
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-green-600 bg-green-100";
    if (confidence >= 70) return "text-blue-600 bg-blue-100";
    return "text-orange-600 bg-orange-100";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "valuation":
        return <DollarSign className="w-4 h-4" />;

      case "description":
        return <FileText className="w-4 h-4" />;

      case "comparable":
        return <TrendingUp className="w-4 h-4" />;

      case "improvement":
        return <Lightbulb className="w-4 h-4" />;

      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Assistant
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "suggestions" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("suggestions")}
          >
            Suggestions
          </Button>
          <Button
            variant={activeTab === "chat" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("chat")}
          >
            Chat
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeTab === "suggestions" && (
          <>
            {/* Generate Button */}
            <Button
              onClick={generateSuggestions}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Your Business...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Suggestions
                </>
              )}
            </Button>

            {/* Business Context */}
            {Object.keys(businessData).length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <h4 className="font-medium mb-2">Analysis Context:</h4>
                <div className="space-y-1 text-muted-foreground">
                  {businessData.name && <p>Business: {businessData.name}</p>}
                  {businessData.industry && (
                    <p>Industry: {businessData.industry.join(", ")}</p>
                  )}
                  {businessData.location && (
                    <p>Location: {businessData.location}</p>
                  )}
                  {businessData.revenue && (
                    <p>Revenue: ₹{businessData.revenue.toLocaleString()}</p>
                  )}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">AI Recommendations</h4>
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(suggestion.type)}
                          <h5 className="font-medium">{suggestion.title}</h5>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            getConfidenceColor(suggestion.confidence)
                          )}
                        >
                          {suggestion.confidence}% confidence
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {suggestion.content}
                      </p>

                      <div className="flex gap-2">
                        {suggestion.action && (
                          <Button
                            size="sm"
                            onClick={() => onApplySuggestion?.(suggestion)}
                          >
                            {suggestion.action}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCopy(suggestion.content, `${index}`)
                          }
                        >
                          {copiedId === `${index}` ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "chat" && (
          <div className="space-y-4">
            <div className="h-64 border rounded-lg p-3 bg-muted/30 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                  </div>
                  <div className="bg-white rounded-lg p-3 text-sm">
                    <p>
                      Hi! I'm your AI assistant. I can help you with business
                      valuation, description writing, market analysis, and
                      listing optimization. What would you like to know?
                    </p>
                  </div>
                </div>

                {/* Example chat messages would appear here */}
                <div className="text-center text-xs text-muted-foreground py-4">
                  Start a conversation by typing below...
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Ask me about pricing, market trends, or how to improve your listing..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                rows={2}
                className="resize-none"
              />

              <Button
                onClick={() => {
                  // Handle chat message
                  console.log("Chat message:", chatMessage);
                  setChatMessage("");
                }}
                disabled={!chatMessage.trim()}
              >
                Send
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              💡 Try asking: "What's my business worth?", "How can I improve my
              listing?", "Show me comparable sales"
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
