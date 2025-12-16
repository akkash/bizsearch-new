import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Paperclip,
  User,
  Bot,
  Building2,
  Briefcase,
  FileText,
  TrendingUp,
  BarChart3,
  Calculator,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeminiService, type ChatMessage as GeminiChatMessage } from "@/lib/gemini-service";

interface Message {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp: Date;
  agent?: "ajay" | "vijay";
  suggestions?: string[];
  attachments?: string[];
}

interface AIChatProps {
  className?: string;
}

const agents = {
  ajay: {
    name: "Ajay Kumar",
    role: "Business Acquisition Specialist",
    avatar: "https://github.com/yusufhilmi.png",
    expertise: [
      "Business Valuation",
      "Due Diligence",
      "Negotiation",
      "Market Analysis",
    ],

    description: "Expert in business acquisitions with 8+ years experience",
  },
  vijay: {
    name: "Vijay Sharma",
    role: "Franchise Development Expert",
    avatar: "https://github.com/kdrnp.png",
    expertise: [
      "Franchise Models",
      "ROI Analysis",
      "Brand Evaluation",
      "Territory Planning",
    ],

    description:
      "Franchise specialist helping entrepreneurs find the right opportunities",
  },
};

const quickActions = {
  ajay: [
    { icon: BarChart3, label: "Business Valuation", action: "valuation" },
    { icon: FileText, label: "Due Diligence", action: "due-diligence" },
    { icon: TrendingUp, label: "Market Analysis", action: "market-analysis" },
    { icon: Calculator, label: "ROI Calculator", action: "roi-calculator" },
  ],

  vijay: [
    { icon: Building2, label: "Franchise Comparison", action: "comparison" },
    {
      icon: Calculator,
      label: "Investment Calculator",
      action: "investment-calc",
    },
    { icon: TrendingUp, label: "ROI Projections", action: "roi-projections" },
    { icon: FileText, label: "Franchise Guide", action: "guide" },
  ],
};

export function AIChat({ className }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<"ajay" | "vijay" | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAgentSelect = (agent: "ajay" | "vijay") => {
    setSelectedAgent(agent);
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: "agent",
      content: `Hi! I'm ${agents[agent].name}, your ${agents[agent].role}. ${agents[agent].description}. How can I help you today?`,
      timestamp: new Date(),
      agent,
      suggestions:
        agent === "ajay"
          ? [
              "Find businesses under ₹50L",
              "Help with due diligence",
              "Business valuation",
              "Market analysis",
            ]
          : [
              "Show franchise opportunities",
              "Calculate ROI",
              "Compare franchises",
              "Investment planning",
            ],
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedAgent || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Convert messages to Gemini format
      const chatHistory: GeminiChatMessage[] = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'model',
        parts: msg.content,
        timestamp: msg.timestamp,
      }));

      // Call real AI service
      const aiResponse = await GeminiService.sendMessage(
        inputValue,
        selectedAgent,
        {},
        chatHistory
      );

      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: aiResponse,
        timestamp: new Date(),
        agent: selectedAgent,
        suggestions: generateSuggestions(inputValue, selectedAgent),
      };
      
      setMessages((prev) => [...prev, agentResponse]);
    } catch (error: any) {
      console.error('AI Error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: `I apologize, but I'm having trouble connecting to the AI service. ${error.message || 'Please try again.'}`,
        timestamp: new Date(),
        agent: selectedAgent,
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateResponse = (input: string, agent: "ajay" | "vijay") => {
    const lowerInput = input.toLowerCase();

    if (agent === "ajay") {
      if (lowerInput.includes("valuation") || lowerInput.includes("price")) {
        return "I can help you with business valuation. Based on the business details, I'll analyze revenue multiples, asset values, and market comparables to provide an accurate valuation range.";
      }
      if (lowerInput.includes("due diligence")) {
        return "Due diligence is crucial for any acquisition. I'll guide you through financial audits, legal compliance checks, operational assessments, and market position analysis.";
      }
      return "I understand you're interested in business acquisition. Let me help you find the right opportunity and guide you through the entire process from evaluation to closing.";
    } else {
      if (lowerInput.includes("roi") || lowerInput.includes("return")) {
        return "ROI analysis is key for franchise success. I'll help you calculate projected returns based on investment, operational costs, and revenue projections for different franchise models.";
      }
      if (
        lowerInput.includes("franchise") ||
        lowerInput.includes("opportunity")
      ) {
        return "Great! I can show you franchise opportunities that match your investment range and interests. What industry are you most interested in, and what's your investment budget?";
      }
      return "I'm here to help you find the perfect franchise opportunity. Let me understand your requirements and show you options that align with your goals and budget.";
    }
  };

  const generateSuggestions = (input: string, agent: "ajay" | "vijay") => {
    if (agent === "ajay") {
      return [
        "Show similar businesses",
        "Schedule due diligence",
        "Get market report",
        "Calculate financing options",
      ];
    } else {
      return [
        "Compare with other franchises",
        "Show ROI breakdown",
        "Find similar opportunities",
        "Get investment guide",
      ];
    }
  };

  const handleQuickAction = async (action: string) => {
    const actionMessages = {
      valuation:
        "I need help with business valuation for a potential acquisition",
      "due-diligence": "Can you guide me through the due diligence process?",
      "market-analysis": "I'd like a market analysis for this business sector",
      "roi-calculator": "Help me calculate ROI for this business opportunity",
      comparison: "I want to compare different franchise opportunities",
      "investment-calc": "Help me calculate total investment required",
      "roi-projections": "Show me ROI projections for this franchise",
      guide: "I need a comprehensive franchise investment guide",
    };

    const message = actionMessages[action as keyof typeof actionMessages] || "";
    if (message) {
      setInputValue(message);
      // Auto-send the message
      setTimeout(() => {
        const sendButton = document.querySelector('[data-send-button="true"]') as HTMLButtonElement;
        sendButton?.click();
      }, 100);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 md:bottom-6 right-4 md:right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 bg-primary hover:bg-primary/90 ${className}`}
        size="icon"
      >
        <div className="relative">
          <MessageCircle className="h-6 w-6 text-white" />

          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </div>
      </Button>
    );
  }

  return (
    <Card
      className={`fixed bottom-24 md:bottom-6 right-4 md:right-6 w-[calc(100vw-2rem)] md:w-96 h-[calc(100vh-8rem)] md:h-[600px] shadow-xl z-50 flex flex-col ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI Assistant</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {selectedAgent && (
          <div className="flex items-center gap-3 mt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={agents[selectedAgent].avatar} />

              <AvatarFallback>
                {agents[selectedAgent].name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">
                {agents[selectedAgent].name}
              </div>
              <div className="text-xs text-muted-foreground">
                {agents[selectedAgent].role}
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {!selectedAgent ? (
          <div className="p-4 space-y-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Choose Your AI Assistant</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select the specialist who can best help you
              </p>
            </div>

            <div className="space-y-3">
              <Card
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleAgentSelect("ajay")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar>
                      <AvatarImage src={agents.ajay.avatar} />

                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{agents.ajay.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {agents.ajay.role}
                      </div>
                    </div>
                    <Building2 className="h-5 w-5 text-blue-500 ml-auto" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {agents.ajay.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {agents.ajay.expertise.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleAgentSelect("vijay")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar>
                      <AvatarImage src={agents.vijay.avatar} />

                      <AvatarFallback>V</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{agents.vijay.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {agents.vijay.role}
                      </div>
                    </div>
                    <Briefcase className="h-5 w-5 text-green-500 ml-auto" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {agents.vijay.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {agents.vijay.expertise.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="p-3 border-b">
              <div className="text-xs font-medium mb-2">Quick Actions</div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions[selectedAgent].map((action) => (
                  <Button
                    key={action.action}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs justify-start"
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <action.icon className="h-3 w-3 mr-1" />

                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}
                    >
                      <div
                        className={`flex items-start gap-2 ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <Avatar className="h-6 w-6">
                          {message.type === "user" ? (
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          ) : (
                            <AvatarImage src={agents[message.agent!].avatar} />
                          )}
                        </Avatar>
                        <div
                          className={`rounded-lg p-3 ${
                            message.type === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>

                      {message.suggestions && (
                        <div className="mt-2 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs justify-start w-full"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={agents[selectedAgent].avatar} />
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />

                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  data-send-button="true"
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
