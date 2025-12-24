import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

import {
    FileText,
    Wand2,
    Download,
    Copy,
    Loader2,
    CheckCircle,
    TrendingUp,
    BarChart3,
    DollarSign,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type ReportType = 'valuation' | 'market_analysis' | 'due_diligence' | 'comparison';

interface ReportSection {
    title: string;
    content: string;
    status: 'pending' | 'generating' | 'complete';
}

const reportTypes = [
    { id: 'valuation', label: 'Business Valuation Report', icon: DollarSign },
    { id: 'market_analysis', label: 'Market Analysis Report', icon: TrendingUp },
    { id: 'due_diligence', label: 'Due Diligence Summary', icon: CheckCircle },
    { id: 'comparison', label: 'Comparison Report', icon: BarChart3 },
];

export function ReportGeneratorPage() {
    useAuth();
    const [reportType, setReportType] = useState<ReportType>('valuation');
    const [businessName, setBusinessName] = useState('');
    const [businessDetails, setBusinessDetails] = useState('');
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [reportSections, setReportSections] = useState<ReportSection[]>([]);
    const [generatedReport, setGeneratedReport] = useState<string>('');

    const getReportSections = (type: ReportType): string[] => {
        switch (type) {
            case 'valuation':
                return ['Executive Summary', 'Business Overview', 'Financial Analysis', 'Valuation Methods', 'Market Comparison', 'Conclusion'];
            case 'market_analysis':
                return ['Market Overview', 'Industry Trends', 'Competitive Landscape', 'Growth Opportunities', 'Risk Assessment', 'Recommendations'];
            case 'due_diligence':
                return ['Business Background', 'Legal Review', 'Financial Verification', 'Operational Assessment', 'Key Risks', 'Summary'];
            case 'comparison':
                return ['Overview', 'Financial Comparison', 'Market Position', 'Strengths & Weaknesses', 'Investment Potential', 'Recommendation'];
            default:
                return [];
        }
    };

    const handleGenerate = async () => {
        if (!businessName.trim()) {
            toast.error('Please enter a business name');
            return;
        }

        setGenerating(true);
        setProgress(0);
        setGeneratedReport('');

        const sections = getReportSections(reportType);
        const newSections = sections.map(title => ({ title, content: '', status: 'pending' as const }));
        setReportSections(newSections);

        // Simulate AI generation with progressive updates
        let fullReport = `# ${reportTypes.find(r => r.id === reportType)?.label}\n\n`;
        fullReport += `**Business:** ${businessName}\n\n`;
        fullReport += `**Generated:** ${new Date().toLocaleDateString()}\n\n---\n\n`;

        for (let i = 0; i < sections.length; i++) {
            setReportSections(prev =>
                prev.map((s, idx) => idx === i ? { ...s, status: 'generating' } : s)
            );

            await new Promise(resolve => setTimeout(resolve, 800));

            const sectionContent = generateMockContent(sections[i], businessName, reportType);
            fullReport += `## ${sections[i]}\n\n${sectionContent}\n\n`;

            setReportSections(prev =>
                prev.map((s, idx) => idx === i ? { ...s, content: sectionContent, status: 'complete' } : s)
            );

            setProgress(((i + 1) / sections.length) * 100);
        }

        setGeneratedReport(fullReport);
        setGenerating(false);
        toast.success('Report generated successfully');
    };

    const generateMockContent = (section: string, name: string, type: ReportType): string => {
        const templates: Record<string, string> = {
            'Executive Summary': `This report provides a comprehensive analysis of **${name}**. Based on our assessment using multiple valuation methodologies, the estimated fair market value ranges from ₹X Cr to ₹Y Cr. Key value drivers include strong market position, consistent revenue growth, and experienced management team.`,
            'Business Overview': `**${name}** operates in the [Industry] sector with a focus on [Products/Services]. The company was established in [Year] and has grown to employ approximately [X] people across [locations]. The business model demonstrates strong unit economics with recurring revenue streams.`,
            'Financial Analysis': `Revenue has grown at a CAGR of X% over the past 3 years. EBITDA margins have improved from X% to Y%, indicating operational efficiency gains. Working capital requirements are well-managed with healthy cash flow generation.`,
            'Valuation Methods': `We applied three valuation approaches:\n\n1. **DCF Analysis:** ₹X Cr (based on 5-year projections)\n2. **Comparable Company Analysis:** ₹Y Cr (based on peer multiples)\n3. **Precedent Transactions:** ₹Z Cr (based on similar deals)\n\nWeighted average valuation: ₹W Cr`,
            'Market Overview': `The target market for **${name}** is estimated at ₹X Cr and growing at Y% annually. Key growth drivers include increasing consumer demand, digital transformation, and expanding middle class.`,
            'Competitive Landscape': `The competitive environment includes X major players and numerous regional competitors. **${name}** differentiates through [key differentiators]. Market share is estimated at X%.`,
            'Key Risks': `1. **Market Risk:** Competitive pressure from larger players\n2. **Regulatory Risk:** Potential changes in industry regulations\n3. **Operational Risk:** Dependence on key personnel\n4. **Financial Risk:** Sensitivity to economic cycles`,
            'Recommendations': `Based on our analysis, we recommend:\n\n1. Proceed with further due diligence\n2. Negotiate within the valuation range of ₹X-Y Cr\n3. Include key management retention provisions\n4. Structure deal with appropriate earn-out provisions`,
        };

        return templates[section] || `Analysis for ${section} section of **${name}** goes here. This section covers key aspects relevant to the ${type.replace('_', ' ')} assessment.`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedReport);
        toast.success('Report copied to clipboard');
    };

    const downloadReport = () => {
        const blob = new Blob([generatedReport], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${businessName.replace(/\s+/g, '_')}_${reportType}_report.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Report downloaded');
    };

    return (
        <div className="container max-w-5xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    AI Report Generator
                </h1>
                <p className="text-muted-foreground">Generate professional reports using AI</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Report Configuration</CardTitle>
                        <CardDescription>Select report type and enter business details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Report Type</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {reportTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <Button
                                            key={type.id}
                                            variant={reportType === type.id ? 'default' : 'outline'}
                                            className="h-auto py-3 justify-start"
                                            onClick={() => setReportType(type.id as ReportType)}
                                        >
                                            <Icon className="h-4 w-4 mr-2" />
                                            <span className="text-sm">{type.label}</span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Business Name *</Label>
                            <Input
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="Enter business name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Additional Details (Optional)</Label>
                            <Textarea
                                value={businessDetails}
                                onChange={(e) => setBusinessDetails(e.target.value)}
                                placeholder="Add any specific details, financials, or context..."
                                rows={4}
                            />
                        </div>

                        <Button
                            onClick={handleGenerate}
                            className="w-full"
                            disabled={generating || !businessName.trim()}
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="h-4 w-4 mr-2" />
                                    Generate Report
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Progress / Output Section */}
                <div className="space-y-6">
                    {/* Generation Progress */}
                    {(generating || reportSections.length > 0) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Generation Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Progress value={progress} className="mb-4" />
                                <div className="space-y-2">
                                    {reportSections.map((section, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            {section.status === 'pending' && (
                                                <div className="h-4 w-4 rounded-full border-2 border-muted" />
                                            )}
                                            {section.status === 'generating' && (
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            )}
                                            {section.status === 'complete' && (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            )}
                                            <span className={section.status === 'complete' ? 'text-muted-foreground' : ''}>
                                                {section.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Generated Report */}
                    {generatedReport && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Generated Report</CardTitle>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={copyToClipboard}>
                                            <Copy className="h-4 w-4 mr-1" />
                                            Copy
                                        </Button>
                                        <Button size="sm" onClick={downloadReport}>
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="max-h-96 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                                    <pre className="whitespace-pre-wrap text-sm font-mono">
                                        {generatedReport}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!generating && reportSections.length === 0 && (
                        <Card className="h-full flex items-center justify-center min-h-[300px]">
                            <CardContent className="text-center">
                                <Wand2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">
                                    Configure your report settings and click generate to create an AI-powered report
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
