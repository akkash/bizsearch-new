/**
 * Business-sale matchmaker. Do not import from franchise routes
 * (/match, /franchises, enquire, applications). Franchise matching
 * lives in FranchiseeMatcher + AIFranchiseeMatcherService.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Target, TrendingUp, AlertCircle, CheckCircle, X } from 'lucide-react';
import { AIMatchmakerService, type UserPreferences, type BusinessMatch } from '@/lib/ai-matchmaker-service';
import { BusinessCard } from '@/polymet/components/business-card';
import { cn } from '@/lib/utils';

interface AIBusinessMatchmakerProps {
  userId?: string;
  onClose?: () => void;
  className?: string;
}

export function AIBusinessMatchmaker({ onClose, className }: AIBusinessMatchmakerProps) {
  const [step, setStep] = useState<'preferences' | 'results'>('preferences');
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<BusinessMatch[]>([]);

  // Preference form state
  const [budget, setBudget] = useState<[number, number]>([1000000, 10000000]); // 10L to 1Cr
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [investmentGoal, setInvestmentGoal] = useState('');
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [timeCommitment, setTimeCommitment] = useState<'part-time' | 'full-time'>('full-time');

  const industries = [
    'Food & Beverage',
    'Technology',
    'Retail',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Services',
    'E-commerce',
  ];

  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Pune',
    'Ahmedabad',
    'Kolkata',
  ];

  const handleFindMatches = async () => {
    setIsLoading(true);

    try {
      const preferences: UserPreferences = {
        budget: { min: budget[0], max: budget[1] },
        industries: selectedIndustries.length > 0 ? selectedIndustries : undefined,
        locations: selectedLocations.length > 0 ? selectedLocations : undefined,
        investmentGoals: investmentGoal || undefined,
        riskTolerance,
        timeCommitment,
      };

      const results = await AIMatchmakerService.findMatches(preferences);
      setMatches(results);
      setStep('results');
    } catch (error) {
      console.error('Matchmaker error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString()}`;
  };

  return (
    <div className={cn('w-full', className)}>
      {step === 'preferences' ? (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-growth-green" />
                  Business matchmaker
                </CardTitle>
                <CardDescription>
                  Set budget, industry, and location preferences to rank matching listings
                </CardDescription>
              </div>
              {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Budget Range */}
            <div className="space-y-3">
              <Label>Budget Range</Label>
              <div className="px-2">
                <Slider
                  value={budget}
                  onValueChange={(value) => setBudget(value as [number, number])}
                  min={500000}
                  max={50000000}
                  step={500000}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatCurrency(budget[0])}</span>
                <span>{formatCurrency(budget[1])}</span>
              </div>
            </div>

            {/* Industries */}
            <div className="space-y-3">
              <Label>Preferred Industries (Select multiple)</Label>
              <div className="flex flex-wrap gap-2">
                {industries.map(industry => (
                  <Badge
                    key={industry}
                    variant={selectedIndustries.includes(industry) ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleIndustry(industry)}
                  >
                    {industry}
                    {selectedIndustries.includes(industry) && (
                      <CheckCircle className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-3">
              <Label>Preferred Locations (Select multiple)</Label>
              <div className="flex flex-wrap gap-2">
                {cities.map(city => (
                  <Badge
                    key={city}
                    variant={selectedLocations.includes(city) ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleLocation(city)}
                  >
                    {city}
                    {selectedLocations.includes(city) && (
                      <CheckCircle className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Risk Tolerance */}
            <div className="space-y-3">
              <Label>Risk Tolerance</Label>
              <Select
                value={riskTolerance}
                onValueChange={(value: 'low' | 'medium' | 'high') => setRiskTolerance(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Stable, established businesses</SelectItem>
                  <SelectItem value="medium">Medium - Balanced risk-reward</SelectItem>
                  <SelectItem value="high">High - Growth potential, higher risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Commitment */}
            <div className="space-y-3">
              <Label>Time Commitment</Label>
              <Select
                value={timeCommitment}
                onValueChange={(value: 'part-time' | 'full-time') => setTimeCommitment(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="part-time">Part-time / Passive Income</SelectItem>
                  <SelectItem value="full-time">Full-time Involvement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Investment Goal */}
            <div className="space-y-3">
              <Label>Investment Goal (Optional)</Label>
              <Input
                placeholder="e.g., Passive income, Quick growth, Long-term stability"
                value={investmentGoal}
                onChange={(e) => setInvestmentGoal(e.target.value)}
              />
            </div>

            {/* Find Matches Button */}
            <Button
              onClick={handleFindMatches}
              disabled={isLoading}
              className="w-full bg-growth-green hover:bg-growth-green-dark text-white"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding matches...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Find matching businesses
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Results Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-growth-green" />
                    {matches.length} matches found
                  </CardTitle>
                  <CardDescription>
                    Ranked by preference compatibility score
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setStep('preferences')}>
                  Refine Search
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Match Results */}
          {matches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No matches found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your preferences to see more results
                </p>
                <Button onClick={() => setStep('preferences')}>
                  Update Preferences
                </Button>
              </CardContent>
            </Card>
          ) : (
            matches.map((match, index) => (
              <Card key={match.businessId} className="overflow-hidden border border-border">
                <div className="bg-muted/40 p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      #{index + 1} · Match score {match.matchScore}%
                    </Badge>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-2 w-8 rounded-full',
                            i < Math.round(match.matchScore / 20)
                              ? 'bg-growth-green'
                              : 'bg-border'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Match Reasons */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-growth-green mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Why this matches</p>
                        <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                          {match.matchReasons.map((reason, i) => (
                            <li key={i}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {match.concerns.length > 0 && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Points to consider</p>
                          <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                            {match.concerns.map((concern, i) => (
                              <li key={i}>• {concern}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Recommendation */}
                    <div className="bg-card border border-border rounded-lg p-3 mt-3">
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-growth-green mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            Analyst note
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {match.aiRecommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Card */}
                <CardContent className="p-4">
                  <BusinessCard business={match.business} />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
