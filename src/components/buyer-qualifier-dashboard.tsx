import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  AlertCircle,
  CheckCircle2,
  X,
  Flame,
  ThermometerSun,
  Snowflake,
  Mail,
  Calendar
} from 'lucide-react';
import { AIBuyerQualifierService, type BuyerQualification } from '@/lib/ai-buyer-qualifier-service';
import { cn } from '@/lib/utils';

interface BuyerQualifierDashboardProps {
  sellerId: string;
  onClose?: () => void;
  className?: string;
}

export function BuyerQualifierDashboard({ sellerId, onClose, className }: BuyerQualifierDashboardProps) {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<BuyerQualification | null>(null);

  useEffect(() => {
    loadInsights();
  }, [sellerId]);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const data = await AIBuyerQualifierService.getBuyerInsights(sellerId);
      setInsights(data);
    } catch (error) {
      console.error('Error loading buyer insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLeadIcon = (level: string) => {
    switch (level) {
      case 'Hot Lead':
        return <Flame className="h-5 w-5 text-red-500" />;
      case 'Warm Lead':
        return <ThermometerSun className="h-5 w-5 text-orange-500" />;
      case 'Cold Lead':
        return <Snowflake className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getLeadColor = (level: string) => {
    switch (level) {
      case 'Hot Lead':
        return 'bg-red-50 border-red-200 dark:bg-red-950/20';
      case 'Warm Lead':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-950/20';
      case 'Cold Lead':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/20';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Analyzing your leads...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('w-full max-w-6xl mx-auto', className)}>
      {onClose && (
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6" />
            AI Buyer Qualification Dashboard
          </CardTitle>
          <CardDescription>
            AI-powered lead scoring and prioritization for your listings
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Inquiries</div>
                <div className="text-2xl font-bold">{insights?.totalInquiries || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200 dark:bg-red-950/20">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Flame className="h-4 w-4" />
                  Hot Leads
                </div>
                <div className="text-2xl font-bold text-red-600">{insights?.hotLeads || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200 dark:bg-orange-950/20">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <ThermometerSun className="h-4 w-4" />
                  Warm Leads
                </div>
                <div className="text-2xl font-bold text-orange-600">{insights?.warmLeads || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Snowflake className="h-4 w-4" />
                  Cold Leads
                </div>
                <div className="text-2xl font-bold text-blue-600">{insights?.coldLeads || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Average Score */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Average Lead Quality Score</span>
                <span className="text-xl font-bold">{insights?.averageQualificationScore || 0}/100</span>
              </div>
              <Progress value={insights?.averageQualificationScore || 0} className="h-2" />
            </CardContent>
          </Card>

          {/* Top Leads List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Top Qualified Leads</h3>
            <div className="space-y-3">
              {insights?.topLeads?.map((lead: BuyerQualification, index: number) => (
                <Card
                  key={lead.leadId}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-lg',
                    getLeadColor(lead.qualificationLevel),
                    selectedLead?.leadId === lead.leadId && 'ring-2 ring-primary'
                  )}
                  onClick={() => setSelectedLead(selectedLead?.leadId === lead.leadId ? null : lead)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getLeadIcon(lead.qualificationLevel)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">Lead #{index + 1}</span>
                            <Badge variant={lead.priorityRank === 'High' ? 'destructive' : 'secondary'}>
                              {lead.priorityRank} Priority
                            </Badge>
                            <Badge variant="outline">{lead.qualificationLevel}</Badge>
                          </div>

                          {/* Score Breakdown */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            <div className="text-xs">
                              <div className="text-muted-foreground">Financial</div>
                              <div className="font-semibold">{lead.financialScore}/100</div>
                            </div>
                            <div className="text-xs">
                              <div className="text-muted-foreground">Experience</div>
                              <div className="font-semibold">{lead.experienceScore}/100</div>
                            </div>
                            <div className="text-xs">
                              <div className="text-muted-foreground">Seriousness</div>
                              <div className="font-semibold">{lead.seriousnessScore}/100</div>
                            </div>
                            <div className="text-xs">
                              <div className="text-muted-foreground">Overall</div>
                              <div className="font-bold text-primary">{lead.overallScore}/100</div>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {selectedLead?.leadId === lead.leadId && (
                            <div className="mt-4 pt-4 border-t space-y-3">
                              {/* Strengths */}
                              <div>
                                <div className="text-sm font-semibold mb-2 flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  Strengths
                                </div>
                                <ul className="space-y-1">
                                  {lead.strengths.map((strength, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="text-green-600">•</span>
                                      <span>{strength}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Concerns */}
                              {lead.concerns.length > 0 && (
                                <div>
                                  <div className="text-sm font-semibold mb-2 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                    Concerns
                                  </div>
                                  <ul className="space-y-1">
                                    {lead.concerns.map((concern, i) => (
                                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="text-orange-600">•</span>
                                        <span>{concern}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Recommendation */}
                              <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                                <div className="text-sm font-semibold mb-1">AI Recommendation</div>
                                <p className="text-sm text-muted-foreground">{lead.recommendedAction}</p>
                              </div>

                              {/* Next Steps */}
                              <div>
                                <div className="text-sm font-semibold mb-2">Next Steps</div>
                                <ol className="space-y-1">
                                  {lead.nextSteps.map((step, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="font-semibold">{i + 1}.</span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>

                              {/* Close Probability */}
                              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-semibold">Estimated Close Probability</span>
                                  <span className="text-lg font-bold text-blue-600">{lead.estimatedCloseProbability}%</span>
                                </div>
                                <Progress value={lead.estimatedCloseProbability} className="h-2" />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <Button size="sm" className="flex-1">
                                  <Mail className="h-4 w-4 mr-2" />
                                  Contact Lead
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Schedule Call
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Score</div>
                        <div className="text-2xl font-bold">{lead.overallScore}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!insights?.topLeads || insights.topLeads.length === 0) && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No buyer inquiries yet. Start promoting your listings to attract qualified buyers!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
