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
  DollarSign,
  X,
  Check,
  Minus,
} from 'lucide-react';
import { AIFranchiseeMatcherService, type FranchiseeProfile } from '@/lib/ai-franchisee-matcher-service';
import { FranchiseeIntentService } from '@/lib/franchisee-intent-service';
import { InquiryService } from '@/lib/inquiry-service';
import { VabgoSiteLink } from '@/components/vabgo-site-link';
import { VabgoSitePanel } from '@/components/vabgo-site-panel';
import { useAuth } from '@/contexts/AuthContext';
import type { ExtendedProfile } from '@/types/auth.types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { clearMatchDraft, readMatchDraft, saveMatchDraft } from '@/lib/intent-draft';
import { buildMatchFitChecks } from '@/lib/match-fit-checks';

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  return [];
}

function numOrNull(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

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
  const [enquiringId, setEnquiringId] = useState<string | null>(null);

  useEffect(() => {
    const draft = readMatchDraft();
    if (draft) {
      setProfileData((prev) => ({
        ...prev,
        budget: {
          min: draft.budgetMin ?? prev.budget?.min ?? 0,
          max: draft.budgetMax ?? prev.budget?.max ?? 0,
        },
        industries: draft.industries ?? prev.industries,
        preferredLocations: draft.preferredLocations ?? prev.preferredLocations,
        liquidCapital: draft.liquidCapital ?? prev.liquidCapital,
        netWorth: draft.netWorth ?? prev.netWorth,
        managementExperience: draft.managementExperience ?? prev.managementExperience,
        timeCommitment:
          (draft.timeCommitment as FranchiseeProfile['timeCommitment']) ||
          prev.timeCommitment,
        spaceAvailable: draft.spaceAvailable ?? prev.spaceAvailable,
        franchiseExperience: draft.franchiseExperience || prev.franchiseExperience,
      }));
    }

    if (!user) return;

    const loadIntent = async () => {
      const intent = await FranchiseeIntentService.get(user.id);
      const extended = profile as ExtendedProfile | null;
      const details = extended?.franchisee_details;

      const min =
        intent?.investmentBudgetMin ??
        numOrNull(details?.investment_budget_min) ??
        profile?.investment_min ??
        0;
      const max =
        intent?.investmentBudgetMax ??
        numOrNull(details?.investment_budget_max) ??
        profile?.investment_max ??
        0;
      const cities =
        intent?.preferredCities?.length
          ? intent.preferredCities
          : asStringArray(details?.preferred_cities).length
            ? asStringArray(details?.preferred_cities)
            : profile?.city && profile?.state
              ? [`${profile.city}, ${profile.state}`]
              : [];

      setProfileData((prev) => ({
        ...prev,
        budget: { min: min || 0, max: max || 0 },
        industries:
          intent?.preferredIndustries?.length
            ? intent.preferredIndustries
            : asStringArray(details?.preferred_industries).length
              ? asStringArray(details?.preferred_industries)
              : asStringArray(profile?.preferred_industries) || prev.industries,
        preferredLocations: cities.length ? cities : prev.preferredLocations,
        liquidCapital:
          intent?.liquidCapital ??
          numOrNull(details?.liquid_capital) ??
          prev.liquidCapital,
        netWorth:
          intent?.netWorth ??
          numOrNull(details?.net_worth) ??
          prev.netWorth,
        managementExperience:
          intent?.managementExperienceYears ??
          numOrNull(details?.management_experience_years) ??
          prev.managementExperience,
        timeCommitment:
          intent?.timeCommitment ||
          (details?.time_commitment as FranchiseeProfile['timeCommitment']) ||
          prev.timeCommitment ||
          'full-time',
        spaceAvailable:
          intent?.spaceAvailable ??
          numOrNull(details?.space_available) ??
          prev.spaceAvailable,
        franchiseExperience:
          intent?.franchiseExperience ||
          (typeof details?.franchise_experience === 'string'
            ? details.franchise_experience
            : prev.franchiseExperience),
      }));
    };

    loadIntent();
  }, [user, profile]);

  const buildMatcherProfile = (): FranchiseeProfile | null => {
    return {
      userId: user?.id || 'guest',
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
      spaceAvailable: Number(profileData.spaceAvailable) || undefined,
      franchiseExperience: profileData.franchiseExperience,
    };
  };

  const persistIntent = async (franchiseeProfile: FranchiseeProfile) => {
    if (!user) {
      saveMatchDraft({
        budgetMin: franchiseeProfile.budget?.min,
        budgetMax: franchiseeProfile.budget?.max,
        industries: franchiseeProfile.industries,
        preferredLocations: franchiseeProfile.preferredLocations,
        liquidCapital: franchiseeProfile.liquidCapital,
        netWorth: franchiseeProfile.netWorth,
        managementExperience: franchiseeProfile.managementExperience,
        timeCommitment: franchiseeProfile.timeCommitment,
        spaceAvailable: franchiseeProfile.spaceAvailable,
        franchiseExperience: franchiseeProfile.franchiseExperience,
      });
      return;
    }
    try {
      await FranchiseeIntentService.upsert(
        franchiseeProfile.userId,
        FranchiseeIntentService.fromMatcherProfile(franchiseeProfile)
      );
      clearMatchDraft();
    } catch (error) {
      console.warn('Could not persist franchisee intent:', error);
    }
  };

  const handleFindMatches = async () => {
    const franchiseeProfile = buildMatcherProfile();
    if (!franchiseeProfile) return;

    setIsLoading(true);
    try {
      await persistIntent(franchiseeProfile);
      const results = await AIFranchiseeMatcherService.findBestMatches(franchiseeProfile, 10);
      setMatches(results);
      setStep('results');
    } catch (error) {
      console.error('Error finding matches:', error);
      toast.error('Could not find matches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnquire = async (match: (typeof matches)[number]) => {
    const matcherProfile = buildMatcherProfile();
    if (!matcherProfile) return;
    if (!user) {
      saveMatchDraft({
        budgetMin: matcherProfile.budget?.min,
        budgetMax: matcherProfile.budget?.max,
        industries: matcherProfile.industries,
        preferredLocations: matcherProfile.preferredLocations,
        liquidCapital: matcherProfile.liquidCapital,
        netWorth: matcherProfile.netWorth,
        managementExperience: matcherProfile.managementExperience,
        timeCommitment: matcherProfile.timeCommitment,
        spaceAvailable: matcherProfile.spaceAvailable,
        franchiseExperience: matcherProfile.franchiseExperience,
        enquireFranchiseId: match.franchise.franchiseId,
      });
      navigate(
        `/signup?redirect=${encodeURIComponent(`/franchise/${match.franchise.franchiseId}?contact=true`)}`
      );
      return;
    }
    const email = profile?.email || user.email;
    if (!email) {
      toast.error('Add an email to your profile before sending an enquiry.');
      return;
    }

    setEnquiringId(match.franchise.franchiseId);
    try {
      await persistIntent(buildMatcherProfile()!);
      const inquiryId = await InquiryService.enquireFromMatch({
        senderId: user.id,
        listingId: match.franchise.franchiseId,
        contactEmail: email,
        contactPhone: profile?.phone || undefined,
        matchScore: match.matchScore,
        brandName: match.franchise.brandName,
      });
      toast.success(`Enquiry sent for ${match.franchise.brandName}`);
      navigate(`/my-enquiries?inquiry=${inquiryId}`);
    } catch (error) {
      console.error('Error creating match enquiry:', error);
      toast.error('Failed to send enquiry');
    } finally {
      setEnquiringId(null);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-growth-green bg-growth-green/10 border-growth-green';
    if (score >= 65) return 'text-trust-blue bg-trust-blue/10 border-trust-blue';
    if (score >= 45) return 'text-muted-foreground bg-muted border-border';
    return 'text-muted-foreground bg-muted border-border';
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
            Franchise Matcher
          </CardTitle>
          <CardDescription>
            Score public listings against budget, location, and experience. Sending a lead requires an account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!user && (
            <p className="text-sm text-muted-foreground mb-4 rounded-md border border-border p-3">
              Preview matches without an account. Sign in only when you send a qualified lead to the brand.
            </p>
          )}
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
                <div className="md:col-span-2">
                  <Label>Preferred cities</Label>
                  <Input
                    placeholder="Chennai, Bangalore, Coimbatore"
                    value={(profileData.preferredLocations || []).join(', ')}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        preferredLocations: e.target.value
                          .split(',')
                          .map((city) => city.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Space available (sq ft, optional)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 800"
                    value={profileData.spaceAvailable || ''}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        spaceAvailable: Number(e.target.value) || undefined,
                      })
                    }
                  />
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold">
                  {matches.length > 0 ? `Top ${matches.length} Matches` : 'No Matches Found'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep('profile')}>
                    Refine Search
                  </Button>
                </div>
              </div>

              <VabgoSitePanel
                intent={{
                  city: profileData.preferredLocations?.[0],
                  areaSqft: profileData.spaceAvailable ?? null,
                  listingType: 'Rent',
                  limit: 5,
                }}
                heading="Sites that match your location"
              />

              {matches.map((match, index) => (
                <Card key={`${match.franchise.franchiseId}-${index}`} className={cn(getMatchColor(match.matchScore))}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{match.franchise.brandName}</h4>
                        <p className="text-sm text-muted-foreground">{match.franchise.industry}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getMatchColor(match.matchScore)}>
                          {match.matchScore}% Match
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {match.matchLevel}
                        </p>
                      </div>
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
                        <div className="text-xs text-muted-foreground">Location Fit</div>
                        <Progress value={match.locationFitScore} className="h-1.5 mt-1" />
                        <div className="text-xs font-semibold mt-1">{match.locationFitScore}/100</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Commitment Fit</div>
                        <Progress value={match.commitmentFitScore} className="h-1.5 mt-1" />
                        <div className="text-xs font-semibold mt-1">{match.commitmentFitScore}/100</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-3 text-xs">
                      {buildMatchFitChecks(profileData, match).map((check) => (
                        <div key={check.label} className="flex items-start gap-1.5">
                          {check.pass === true ? (
                            <Check className="h-3.5 w-3.5 text-growth-green mt-0.5 shrink-0" />
                          ) : check.pass === false ? (
                            <X className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                          ) : (
                            <Minus className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                          )}
                          <span>
                            <span className="font-medium">{check.label}</span>{' '}
                            <span className="text-muted-foreground">{check.detail}</span>
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 text-sm mt-3">
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
                            <span className="text-foreground">✓</span>
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

                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      <Button
                        className="flex-1"
                        size="sm"
                        disabled={enquiringId === match.franchise.franchiseId}
                        onClick={() => handleEnquire(match)}
                      >
                        {enquiringId === match.franchise.franchiseId
                          ? 'Sending enquiry…'
                          : user
                            ? 'Enquire'
                            : 'Keep this fit and continue'}
                      </Button>
                      <Button
                        className="flex-1"
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/franchise/${match.franchise.franchiseId}`)}
                      >
                        View details
                      </Button>
                      <VabgoSiteLink
                        className="flex-1"
                        intent={{
                          city:
                            match.franchise.preferredCities?.[0] ||
                            profileData.preferredLocations?.[0],
                          propertyType: match.franchise.propertyType,
                          minAreaSqft: match.franchise.minAreaSqft,
                          maxAreaSqft: match.franchise.maxAreaSqft,
                          areaSqft: profileData.spaceAvailable ?? null,
                          listingType: 'Rent',
                        }}
                        label="Find a site"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {matches.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No franchises matched your profile. Try a wider budget or city.</p>
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
