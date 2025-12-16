import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, TrendingUp, Users, Building, AlertCircle, X } from 'lucide-react';
import { AITerritoryAnalyzerService, type TerritoryAnalysis } from '@/lib/ai-territory-analyzer-service';
import { cn } from '@/lib/utils';

interface TerritoryAnalyzerProps {
  franchiseBrand?: string;
  franchiseIndustry?: string;
  onClose?: () => void;
  className?: string;
}

export function TerritoryAnalyzer({ franchiseBrand, franchiseIndustry, onClose, className }: TerritoryAnalyzerProps) {
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState(franchiseIndustry || '');
  const [brand, setBrand] = useState(franchiseBrand || '');
  const [analysis, setAnalysis] = useState<TerritoryAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!location || !industry) return;

    setIsLoading(true);
    try {
      const result = await AITerritoryAnalyzerService.analyzeTerritory(location, industry, brand);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing territory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getViabilityColor = (level: string) => {
    switch (level) {
      case 'Excellent':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'Good':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'Fair':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      default:
        return 'bg-red-50 border-red-200 text-red-700';
    }
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
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
            <MapPin className="h-6 w-6" />
            AI Territory Analyzer
          </CardTitle>
          <CardDescription>
            Analyze franchise viability with AI-powered demographic and market insights
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Location (City, State)</Label>
              <Input
                placeholder="e.g., Mumbai, Maharashtra"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <Label>Industry</Label>
              <Input
                placeholder="e.g., Food & Beverage"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div>
              <Label>Brand (Optional)</Label>
              <Input
                placeholder="e.g., Subway"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleAnalyze} disabled={isLoading || !location || !industry} className="w-full">
            {isLoading ? 'Analyzing Territory...' : 'Analyze Territory'}
          </Button>

          {/* Results */}
          {analysis && (
            <div className="space-y-4 mt-6">
              {/* Viability Score */}
              <Card className={cn('border-2', getViabilityColor(analysis.viabilityLevel))}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">{analysis.viabilityScore}/100</div>
                    <Badge className={getViabilityColor(analysis.viabilityLevel)}>
                      {analysis.viabilityLevel} Viability
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">{analysis.location}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2">Demographics</div>
                    <Progress value={analysis.demographicScore} className="h-2 mb-1" />
                    <div className="text-lg font-bold">{analysis.demographicScore}/100</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2">Economics</div>
                    <Progress value={analysis.economicScore} className="h-2 mb-1" />
                    <div className="text-lg font-bold">{analysis.economicScore}/100</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2">Competition</div>
                    <Progress value={analysis.competitionScore} className="h-2 mb-1" />
                    <div className="text-lg font-bold">{analysis.competitionScore}/100</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2">Market Potential</div>
                    <Progress value={analysis.marketPotentialScore} className="h-2 mb-1" />
                    <div className="text-lg font-bold">{analysis.marketPotentialScore}/100</div>
                  </CardContent>
                </Card>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <Users className="h-5 w-5 text-muted-foreground mb-2" />
                    <div className="text-xs text-muted-foreground">Population</div>
                    <div className="font-semibold">{analysis.demographics.population.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <TrendingUp className="h-5 w-5 text-muted-foreground mb-2" />
                    <div className="text-xs text-muted-foreground">Median Income</div>
                    <div className="font-semibold">₹{analysis.demographics.medianIncome.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <Building className="h-5 w-5 text-muted-foreground mb-2" />
                    <div className="text-xs text-muted-foreground">Direct Competitors</div>
                    <div className="font-semibold">{analysis.competitionAnalysis.directCompetitors}</div>
                  </CardContent>
                </Card>
              </div>

              {/* ROI & Break-even */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Estimated ROI</div>
                      <div className="text-2xl font-bold text-blue-600">{analysis.estimatedROI}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Break-even</div>
                      <div className="text-2xl font-bold text-blue-600">{analysis.breakEvenMonths} months</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Opportunities & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.opportunities.map((opp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-600">✓</span>
                          <span>{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.risks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-orange-600">!</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="font-semibold">{i + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
