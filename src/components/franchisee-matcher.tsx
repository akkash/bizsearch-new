import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  X,
  LogIn,
} from 'lucide-react';
import { AIFranchiseeMatcherService, type FranchiseeProfile } from '@/lib/ai-franchisee-matcher-service';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface FranchiseeMatcherProps {
  onClose?: () => void;
  className?: string;
}

export function FranchiseeMatcher({ onClose, className }: FranchiseeMatcherProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'profile' | 'results'>('profile');
  const [profileData, setProfileData] = useState<Partial<FranchiseeProfile>>({});
  const [matches, setMatches] = useState<Awaited<ReturnType<typeof AIFranchiseeMatcherService.findBestMatches>>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setProfileData((prev) => ({
      ...prev,
      budget: {
        min: profile.investment_min ?? prev.budget?.min ?? 0,
        max: profile.investment_max ?? prev.budget?.max ?? 0,
      },
      industries: profile.preferred_industries ?? prev.industries,
      preferredLocations: profile.city && profile.state ? [`${profile.city}, ${profile.state}`] : prev.preferredLocations,
      liquidCapital: profile.liquid_capital ?? prev.liquidCapital,
      netWorth: profile.net_worth ?? prev.netWorth,
    }));
  }, [profile]);

  const handleFindMatches = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const franchiseeProfile: FranchiseeProfile = {
        userId: user.id,
        budget: {
          min: Number(profileData.budget?.min) || 0,
          max: Number(profileData.budget?.max) || 0,
        },
        industries: profileData.industries,
        preferredLocations: profileData.preferredLocations,
        liquidCapital: Number(profileData.liquidCapital) || 0,
        netWorth: Number(profileData.netWorth) || 0,
        managementExperience: Number(profileData.managementExperience) || 0,
        timeCommitment: profileData.timeCommitment || 'full-time',
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
    return 'text-muted-foreground bg-muted border-border';
  };

  if (!user) {
    return (
      <div className={cn('w-full max-w-4xl mx-auto', className)}>
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Target className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold">Sign in for personalized matches</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Complete onboarding and sign in to match franchises against your saved preferences.
            </p>
            <Button asChild>
              <Link to="/login?redirect=/franchises">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Franchise Matcher
          </CardTitle>
          <CardDescription>
            Find active franchise opportunities that match your saved preferences
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
                    value={profileData.budget?.min || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      budget: { ...profileData.budget, min: Number(e.target.value), max: profileData.budget?.max || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label>Budget Range (Max)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000000"
                    value={profileData.budget?.max || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      budget: { ...profileData.budget, max: Number(e.target.value), min: profileData.budget?.min || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label>Liquid Capital Available</Label>
                  <Input
                    type="number"
                    placeholder="Cash available"
                    value={profileData.liquidCapital || ''}
                    onChange={(e) => setProfileData({ ...profileData, liquidCapital: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Net Worth</Label>
                  <Input
                    type="number"
                    placeholder="Total assets - liabilities"
                    value={profileData.netWorth || ''}
                    onChange={(e) => setProfileData({ ...profileData, netWorth: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Management Experience (years)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    value={profileData.managementExperience || ''}
                    onChange={(e) => setProfileData({ ...profileData, managementExperience: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Time Commitment</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={profileData.timeCommitment || 'full-time'}
                    onChange={(e) => setProfileData({ ...profileData, timeCommitment: e.target.value as FranchiseeProfile['timeCommitment'] })}
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
                {isLoading ? 'Finding Matches...' : 'Find Matching Franchises'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {matches.length > 0 ? `Top ${matches.length} Matches` : 'No Matches Found'}
                </h3>
                <Button variant="outline" size="sm" onClick={() => setStep('profile')}>
                  Refine Search
                </Button>
              </div>

              {matches.map((match, index) => (
                <Card key={`${match.franchise.franchiseId}-${index}`} className={cn('border-2', getMatchColor(match.matchScore))}>
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
                        <div className="text-xs text-muted-foreground">Budget Fit</div>
                        <Progress value={match.financialFitScore} className="h-1.5 mt-1" />
                        <div className="text-xs font-semibold mt-1">{match.financialFitScore}/100</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Experience Fit</div>
                        <Progress value={match.experienceFitScore} className="h-1.5 mt-1" />
                        <div className="text-xs font-semibold mt-1">{match.experienceFitScore}/100</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Commitment Fit</div>
                        <Progress value={match.commitmentFitScore} className="h-1.5 mt-1" />
                        <div className="text-xs font-semibold mt-1">{match.commitmentFitScore}/100</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Match Level</div>
                        <Badge variant="outline" className="mt-1">{match.matchLevel}</Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          Investment: ₹{match.franchise.totalInvestment.min.toLocaleString()} - ₹{match.franchise.totalInvestment.max.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {(match.strengths.length > 0 || match.concerns.length > 0) && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        {match.strengths.slice(0, 4).map((strength, i) => (
                          <div key={`s-${i}`} className="text-xs flex items-start gap-1">
                            <span className="text-green-600">✓</span>
                            <span>{strength}</span>
                          </div>
                        ))}
                        {match.concerns.slice(0, 2).map((concern, i) => (
                          <div key={`c-${i}`} className="text-xs flex items-start gap-1">
                            <span className="text-amber-600">△</span>
                            <span>{concern}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      className="w-full mt-3"
                      size="sm"
                      onClick={() => navigate(`/franchise/${match.franchise.franchiseId}`)}
                    >
                      View Franchise Details
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {matches.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No active franchises match your criteria. Try adjusting your budget or preferences.</p>
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
