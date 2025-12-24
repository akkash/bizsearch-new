import { useState } from "react";
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
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GeminiService } from "@/lib/gemini-service";

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
    setSuggestions([]);

    try {
      // Generate real AI suggestions based on business data
      const suggestions: AISuggestion[] = [];

      // 1. Business Valuation
      if (businessData.revenue || businessData.employees) {
        const valuationResponse = await GeminiService.generateValuation({
          revenue: businessData.revenue,
          industry: businessData.industry?.[0],
          location: businessData.location,
          yearEstablished: 2018,
        });

        suggestions.push({
          type: "valuation",
          title: "AI Business Valuation",
          content: valuationResponse.substring(0, 300) + '...',
          confidence: 85,
          action: "View Full Analysis",
        });
      }

      // 2. Market Analysis
      if (businessData.industry) {
        const marketResponse = await GeminiService.generateMarketAnalysis({
          industry: businessData.industry?.[0] || 'general',
          location: businessData.location || 'India',
          businessType: 'for sale',
        });

        suggestions.push({
          type: "comparable",
          title: "Market Analysis",
          content: marketResponse.substring(0, 250) + '...',
          confidence: 78,
          action: "View Full Report",
        });
      }

      // 3. Due Diligence Checklist
      const dueDiligenceResponse = await GeminiService.generateDueDiligenceChecklist({
        industry: businessData.industry?.[0],
        businessType: 'acquisition',
        transactionSize: businessData.revenue,
      });

      suggestions.push({
        type: "improvement",
        title: "Due Diligence Checklist",
        content: dueDiligenceResponse.substring(0, 250) + '...',
        confidence: 92,
        action: "View Checklist",
      });

      setSuggestions(suggestions);
    } catch (error: any) {
      console.error('AI Suggestion Error:', error);

      // Fallback to basic suggestion if AI fails
      setSuggestions([{
        type: "improvement",
        title: "AI Service Unavailable",
        content: `Unable to generate AI suggestions: ${error.message}. Please check your API key configuration or try again later.`,
        confidence: 0,
      }]);
    } finally {
      setIsLoading(false);
    }
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
