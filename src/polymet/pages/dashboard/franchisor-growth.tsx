import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  InquiryService,
  type FranchiseGrowthMetrics,
} from '@/lib/inquiry-service';
import { MapPin, ArrowRight, Loader2 } from 'lucide-react';

const PIPELINE_STAGES: Array<{
  key: keyof FranchiseGrowthMetrics['pipeline'];
  label: string;
  href: string;
}> = [
  { key: 'new', label: 'New', href: '/pipeline' },
  { key: 'qualified', label: 'Qualified', href: '/pipeline' },
  { key: 'meeting', label: 'Meeting', href: '/pipeline' },
  { key: 'application', label: 'Application', href: '/franchisor/applications' },
  { key: 'approved', label: 'Approved', href: '/franchisor/applications' },
];

interface FranchisorGrowthDashboardProps {
  userId: string;
}

export function FranchisorGrowthDashboard({ userId }: FranchisorGrowthDashboardProps) {
  const [metrics, setMetrics] = useState<FranchiseGrowthMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await InquiryService.getFranchiseGrowthMetrics(userId);
        if (!cancelled) setMetrics(data);
      } catch (error) {
        console.error('Failed to load franchise growth metrics:', error);
        if (!cancelled) setMetrics(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-growth-green" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No details found in the table.
        </CardContent>
      </Card>
    );
  }

  const kpis = [
    { label: 'Qualified opportunities', value: metrics.qualifiedOpportunities },
    { label: 'New this week', value: metrics.newThisWeek },
    { label: 'Meetings', value: metrics.meetings },
    { label: 'Applications', value: metrics.applications },
    { label: 'Approved', value: metrics.approved },
    { label: 'Territories filled', value: metrics.territoriesFilled },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Franchise Growth</h2>
          <p className="text-sm text-muted-foreground">
            Qualified franchisee demand across your brands
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/franchisor/applications">Applications</Link>
          </Button>
          <Button asChild className="bg-growth-green hover:bg-growth-green/90 text-white">
            <Link to="/pipeline">
              Open pipeline
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold font-mono tabular-nums">
                {kpi.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {kpi.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {PIPELINE_STAGES.map((stage) => (
              <Link
                key={stage.key}
                to={stage.href}
                className="rounded-md border border-border px-3 py-3 hover:bg-secondary/50 transition-colors"
              >
                <div className="text-2xl font-bold font-mono tabular-nums">
                  {metrics.pipeline[stage.key]}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stage.label}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-growth-green" />
            Location demand
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.locationDemand.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No details found in the table.
            </p>
          ) : (
            <ul className="space-y-2">
              {metrics.locationDemand.map((row) => (
                <li
                  key={row.location}
                  className="flex items-center justify-between text-sm border-b border-border/60 last:border-0 pb-2 last:pb-0"
                >
                  <span className="font-medium">{row.location}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {row.count} {row.count === 1 ? 'prospect' : 'prospects'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
