import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  TrendingUp,
  DollarSign,
  X
} from 'lucide-react';
import { AIFranchiseeMatcherService, type FranchiseeProfile } from '@/lib/ai-franchisee-matcher-service';
import { cn } from '@/lib/utils';

interface FranchiseeMatcherProps {
  onClose?: () => void;
  className?: string;
}

export function FranchiseeMatcher({ onClose, className }: FranchiseeMatcherProps) {
  const [step, setStep] = useState<'profile' | 'results'>('profile');
  const [profile, setProfile] = useState<Partial<FranchiseeProfile>>({});
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFindMatches = async () => {
    setIsLoading(true);
    try {
      const franchiseeProfile: FranchiseeProfile = {
        userId: 'current_user',
        budget: {
          min: Number(profile.budget?.min) || 0,
          max: Number(profile.budget?.max) || 0,
        },
        liquidCapital: Number(profile.liquidCapital) || 0,
        netWorth: Number(profile.netWorth) || 0,
        managementExperience: Number(profile.managementExperience) || 0,
        timeCommitment: profile.timeCommitment || 'full-time',
      };

      const results = await AIFranchiseeMatcherService.findBestMatches(franchiseeProfile, 10);
      setMatches(results);
      setStep('results');
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 65) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 45) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
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
            <Target className="h-6 w-6" />
            AI Franchisee Matcher
          </CardTitle>
          <CardDescription>
            Find franchise opportunities that match your profile and goals
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'profile' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Budget Range (Min)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1000000"
                    value={profile.budget?.min || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      budget: { ...profile.budget, min: Number(e.target.value), max: profile.budget?.max || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label>Budget Range (Max)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000000"
                    value={profile.budget?.max || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      budget: { ...profile.budget, max: Number(e.target.value), min: profile.budget?.min || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label>Liquid Capital Available</Label>
                  <Input
                    type="number"
                    placeholder="Cash available"
                    value={profile.liquidCapital || ''}
                    onChange={(e) => setProfile({ ...profile, liquidCapital: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Net Worth</Label>
                  <Input
                    type="number"
                    placeholder="Total assets - liabilities"
                    value={profile.netWorth || ''}
                    onChange={(e) => setProfile({ ...profile, netWorth: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Management Experience (years)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    value={profile.managementExperience || ''}
                    onChange={(e) => setProfile({ ...profile, managementExperience: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Time Commitment</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={profile.timeCommitment || 'full-time'}
                    onChange={(e) => setProfile({ ...profile, timeCommitment: e.target.value as any })}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="semi-absentee">Semi-absentee</option>
                    <option value="absentee">Absentee</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleFindMatches}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Finding Matches...' : 'Find My Perfect Franchise'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Top {matches.length} Franchise Matches</h3>
                <Button variant="outline" size="sm" onClick={() => setStep('profile')}>
                  Refine Search
                </Button>
              </div>

              {matches.map((match, index) => (
                <Card key={match.franchiseeId + index} className={cn('border-2', getMatchColor(match.matchScore))}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{match.franchise.brandName}</h4>
                        <p className="text-sm text-muted-foreground">{match.franchise.industry}</p>
                      </div>
                      <Badge className={getMatchColor(match.matchScore)}>
                        {match.matchScore}% Match
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Financial Fit</div>
                        <Progress value={match.financialFitScore} className="h-1.5 mt-1" />
                        <div className="text-xs font-semibold mt-1">{match.financialFitScore}/100</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Experience Fit</div>
                        <Progress value={match.experienceFitScore} className="h-1.5 mt-1" />
                        <div className="text-xs font-semibold mt-1">{match.experienceFitScore}/100</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Success Probability</div>
                        <Progress value={match.successProbability} className="h-1.5 mt-1" />
                        <div className="text-xs font-semibold mt-1">{match.successProbability}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Match Level</div>
                        <Badge variant="outline" className="mt-1">{match.matchLevel}</Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Investment: ₹{match.franchise.totalInvestment.min.toLocaleString()} - ₹{match.franchise.totalInvestment.max.toLocaleString()}</span>
                      </div>
                      {match.estimatedBreakEven && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Break-even: {match.estimatedBreakEven} months</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs font-semibold mb-1">Why this matches you:</div>
                      <ul className="text-xs space-y-1">
                        {match.strengths.slice(0, 3).map((strength: string, i: number) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-green-600">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full mt-3" size="sm">
                      View Franchise Details
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {matches.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No matches found. Try adjusting your criteria.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
