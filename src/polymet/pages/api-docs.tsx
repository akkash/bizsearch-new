import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/page-hero';
import { Copy, Check, ExternalLink, Zap, Database, Shield, Search } from 'lucide-react';

export function ApiDocsPage() {
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const baseUrl = 'https://your-project.supabase.co/functions/v1/api-v1';

    const endpoints = [
        {
            method: 'GET',
            path: '/businesses',
            description: 'List all active business listings with filters and pagination',
            params: [
                { name: 'page', type: 'integer', default: '1', description: 'Page number' },
                { name: 'limit', type: 'integer', default: '20', description: 'Results per page (max 100)' },
                { name: 'industry', type: 'string', description: 'Filter by industry' },
                { name: 'location', type: 'string', description: 'Search in city or state' },
                { name: 'min_price', type: 'integer', description: 'Minimum asking price' },
                { name: 'max_price', type: 'integer', description: 'Maximum asking price' },
                { name: 'verification_status', type: 'string', description: 'verified, pending, or unverified' },
                { name: 'search', type: 'string', description: 'Search in name and description' },
            ],
        },
        {
            method: 'GET',
            path: '/businesses/:id',
            description: 'Get a specific business by UUID or slug',
            params: [],
        },
        {
            method: 'GET',
            path: '/franchises',
            description: 'List all active franchise opportunities',
            params: [
                { name: 'page', type: 'integer', default: '1', description: 'Page number' },
                { name: 'limit', type: 'integer', default: '20', description: 'Results per page (max 100)' },
                { name: 'industry', type: 'string', description: 'Filter by industry' },
                { name: 'min_investment', type: 'integer', description: 'Minimum investment amount' },
                { name: 'max_investment', type: 'integer', description: 'Maximum investment amount' },
                { name: 'verification_status', type: 'string', description: 'verified, pending, or unverified' },
                { name: 'search', type: 'string', description: 'Search in brand name and description' },
            ],
        },
        {
            method: 'GET',
            path: '/franchises/:id',
            description: 'Get a specific franchise by UUID or slug',
            params: [],
        },
        {
            method: 'GET',
            path: '/search',
            description: 'Unified search across businesses and franchises',
            params: [
                { name: 'search', type: 'string', required: true, description: 'Search query (required)' },
                { name: 'limit', type: 'integer', default: '10', description: 'Max results per type' },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <PageHero
                eyebrow="API v1.0"
                title="BizSearch API"
                description="Access business and franchise data programmatically. Build integrations and custom applications."
            />

            <div className="container mx-auto px-4 py-10">
                <div className="grid md:grid-cols-4 gap-4 mb-10">
                    {[
                        { icon: Zap, title: 'Fast', desc: 'Edge-deployed globally' },
                        { icon: Database, title: 'Rich Data', desc: 'Complete listing details' },
                        { icon: Shield, title: 'Verified', desc: 'Trust scores included' },
                        { icon: Search, title: 'Searchable', desc: 'Powerful filtering' },
                    ].map((feature) => (
                        <Card key={feature.title} className="border-border bg-card">
                            <CardContent className="pt-6 text-center">
                                <feature.icon className="h-8 w-8 text-growth-green mx-auto mb-3" />
                                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="border-border bg-card mb-8">
                    <CardHeader>
                        <CardTitle>Base URL</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 p-3 bg-muted rounded-lg text-growth-green font-mono text-sm overflow-x-auto">
                                {baseUrl}
                            </code>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(baseUrl, 'base')}
                            >
                                {copied === 'base' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <h2 className="text-2xl font-bold text-foreground mb-6">Endpoints</h2>

                <div className="space-y-6">
                    {endpoints.map((endpoint) => (
                        <Card key={endpoint.path} className="border-border bg-card">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <Badge
                                        className={
                                            endpoint.method === 'GET'
                                                ? 'bg-growth-green/15 text-growth-green border-growth-green/30'
                                                : 'bg-primary/10 text-primary border-primary/30'
                                        }
                                        variant="outline"
                                    >
                                        {endpoint.method}
                                    </Badge>
                                    <code className="text-lg text-foreground font-mono">{endpoint.path}</code>
                                </div>
                                <CardDescription>
                                    {endpoint.description}
                                </CardDescription>
                            </CardHeader>

                            {endpoint.params.length > 0 && (
                                <CardContent>
                                    <div className="text-sm text-muted-foreground mb-2">Query Parameters:</div>
                                    <div className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-muted-foreground text-left">
                                                    <th className="pb-2">Name</th>
                                                    <th className="pb-2">Type</th>
                                                    <th className="pb-2">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {endpoint.params.map((param: any) => (
                                                    <tr key={param.name} className="border-t border-border">
                                                        <td className="py-2">
                                                            <code className="text-primary">{param.name}</code>
                                                            {param.required && <span className="text-destructive ml-1">*</span>}
                                                        </td>
                                                        <td className="py-2 text-muted-foreground">{param.type}</td>
                                                        <td className="py-2 text-muted-foreground">
                                                            {param.description}
                                                            {param.default && (
                                                                <span className="text-muted-foreground/80"> (default: {param.default})</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>

                <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">Example Response</h2>
                <Card className="border-border bg-card">
                    <CardContent className="pt-6">
                        <pre className="bg-muted border border-border rounded-lg p-4 overflow-x-auto text-sm text-foreground font-mono">
                            {`{
  "data": [
    {
      "id": "uuid-here",
      "slug": "cafe-business-mumbai",
      "name": "Premium Cafe Business",
      "industry": "Food & Beverage",
      "location": "Mumbai, Maharashtra",
      "price": 5000000,
      "verification_status": "verified",
      "verified_at": "2024-01-15T10:30:00Z",
      "data_completeness_score": 85
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  },
  "meta": {
    "timestamp": "2024-01-20T12:00:00Z"
  }
}`}
                        </pre>
                    </CardContent>
                </Card>

                <div className="mt-12 text-center">
                    <Button asChild className="gap-2 bg-growth-green hover:bg-growth-green/90 text-white">
                        <a href="/api/openapi.json" target="_blank">
                            <ExternalLink className="h-4 w-4" />
                            Download OpenAPI Spec
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
