import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
  Scale,
  Briefcase,
  BarChart3,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { AIDueDiligenceService, type DueDiligenceReport } from '@/lib/ai-due-diligence-service';
import { cn } from '@/lib/utils';

interface DueDiligenceDashboardProps {
  businessData: any;
  onClose?: () => void;
  className?: string;
}

export function DueDiligenceDashboard({
  businessData,
  className,
}: DueDiligenceDashboardProps) {
  const [report, setReport] = useState<DueDiligenceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const dueDiligenceReport = await AIDueDiligenceService.generateDueDiligenceReport(businessData);
      setReport(dueDiligenceReport);
    } catch (error) {
      console.error('Error generating due diligence report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 25) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getRiskIcon = (score: number) => {
    if (score >= 75) return <XCircle className="h-5 w-5" />;
    if (score >= 50) return <AlertTriangle className="h-5 w-5" />;
    if (score >= 25) return <AlertCircle className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  return (
    <div className={cn('w-full', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Due Diligence Report
              </CardTitle>
              <CardDescription>
                AI-powered comprehensive analysis for {businessData.name}
              </CardDescription>
            </div>
            {!report && (
              <Button onClick={generateReport} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        {report && (
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="legal">Legal</TabsTrigger>
                <TabsTrigger value="operational">Operational</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                {/* Overall Risk Score */}
                <Card className={cn('border-2', getRiskColor(report.overallRiskScore))}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getRiskIcon(report.overallRiskScore)}
                        <h3 className="font-semibold">Overall Risk Assessment</h3>
                      </div>
                      <Badge variant={report.overallRiskScore >= 50 ? 'destructive' : 'default'}>
                        {report.recommendation}
                      </Badge>
                    </div>
                    <Progress value={100 - report.overallRiskScore} className="h-3" />
                    <p className="text-sm mt-2">
                      Risk Score: {report.overallRiskScore}/100 (Lower is better)
                    </p>
                  </CardContent>
                </Card>

                {/* Critical Issues */}
                {report.criticalIssues.length > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-red-800 flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Critical Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {report.criticalIssues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Warnings */}
                {report.warnings.length > 0 && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                      <CardTitle className="text-orange-800 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {report.warnings.map((warning, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-orange-700">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Positive Factors */}
                {report.positiveFactors.length > 0 && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-green-800 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Positive Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {report.positiveFactors.map((factor, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <AnalysisScoreCard
                    title="Financial"
                    score={report.financialAnalysis.score}
                    icon={<BarChart3 className="h-5 w-5" />}
                  />
                  <AnalysisScoreCard
                    title="Legal"
                    score={report.legalAnalysis.score}
                    icon={<Scale className="h-5 w-5" />}
                  />
                  <AnalysisScoreCard
                    title="Operational"
                    score={report.operationalAnalysis.score}
                    icon={<Briefcase className="h-5 w-5" />}
                  />
                  <AnalysisScoreCard
                    title="Market"
                    score={report.marketAnalysis.score}
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                </div>
              </TabsContent>

              {/* Financial Tab */}
              <TabsContent value="financial">
                <AnalysisDetailCard
                  title="Financial Due Diligence"
                  score={report.financialAnalysis.score}
                  findings={report.financialAnalysis.findings}
                  redFlags={report.financialAnalysis.redFlags}
                  icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
                />
              </TabsContent>

              {/* Legal Tab */}
              <TabsContent value="legal">
                <AnalysisDetailCard
                  title="Legal Due Diligence"
                  score={report.legalAnalysis.score}
                  findings={report.legalAnalysis.findings}
                  redFlags={report.legalAnalysis.redFlags}
                  icon={<Scale className="h-6 w-6 text-purple-600" />}
                />
              </TabsContent>

              {/* Operational Tab */}
              <TabsContent value="operational">
                <AnalysisDetailCard
                  title="Operational Due Diligence"
                  score={report.operationalAnalysis.score}
                  findings={report.operationalAnalysis.findings}
                  redFlags={report.operationalAnalysis.redFlags}
                  icon={<Briefcase className="h-6 w-6 text-green-600" />}
                />
              </TabsContent>

              {/* Checklist Tab */}
              <TabsContent value="checklist">
                <ChecklistSection checklist={report.checklist} />
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
              <Button variant="outline" className="flex-1">
                <FileText className="mr-2 h-4 w-4" />
                Share with Advisor
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Helper Components
function AnalysisScoreCard({ title, score, icon }: { title: string; score: number; icon: React.ReactNode }) {
  const getColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <div className={getColor(score)}>{icon}</div>
          <h4 className="font-medium text-sm">{title}</h4>
        </div>
        <div className={cn('text-2xl font-bold', getColor(score))}>
          {score}
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalysisDetailCard({
  title,
  score,
  findings,
  redFlags,
  icon,
}: {
  title: string;
  score: number;
  findings: string[];
  redFlags: string[];
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <div className="mt-4">
          <Progress value={score} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">Score: {score}/100</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Key Findings:</h4>
          <ul className="space-y-2">
            {findings.map((finding, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                {finding}
              </li>
            ))}
          </ul>
        </div>

        {redFlags.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-red-600">Red Flags:</h4>
            <ul className="space-y-2">
              {redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChecklistSection({ checklist }: { checklist: any[] }) {
  const [items, setItems] = useState(checklist);

  const toggleItem = (index: number) => {
    const updated = [...items];
    updated[index].completed = !updated[index].completed;
    setItems(updated);
  };

  const categories = [...new Set(items.map(item => item.category))];

  return (
    <div className="space-y-4">
      {categories.map(category => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {items
                .filter(item => item.category === category)
                .map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => {
                        const globalIndex = items.findIndex(
                          it => it.category === item.category && it.item === item.item
                        );
                        toggleItem(globalIndex);
                      }}
                    />
                    <div className="flex-1">
                      <p className={cn('text-sm', item.completed && 'line-through text-muted-foreground')}>
                        {item.item}
                      </p>
                      <Badge
                        variant={
                          item.priority === 'Critical'
                            ? 'destructive'
                            : item.priority === 'Important'
                              ? 'default'
                              : 'secondary'
                        }
                        className="text-xs mt-1"
                      >
                        {item.priority}
                      </Badge>
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
