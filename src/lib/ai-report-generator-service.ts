import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

export interface ReportSection {
  title: string;
  content: string;
  subsections?: ReportSection[];
  charts?: Array<{
    type: 'bar' | 'line' | 'pie';
    data: any;
    title: string;
  }>;
}

export interface Report {
  reportId: string;
  reportType: 'valuation' | 'due-diligence' | 'market-analysis' | 'territory-analysis' | 'comprehensive';
  title: string;
  subtitle?: string;
  generatedDate: string;
  businessName?: string;
  sections: ReportSection[];
  executiveSummary: string;
  recommendations: string[];
  disclaimer: string;
  metadata?: Record<string, any>;
}

export class AIReportGeneratorService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Generate comprehensive business valuation report
   */
  static async generateValuationReport(businessData: {
    name: string;
    industry: string;
    revenue?: number;
    profit?: number;
    assets?: number;
    liabilities?: number;
    employees?: number;
    establishedYear?: number;
    location?: string;
  }): Promise<Report> {
    const sections: ReportSection[] = [
      {
        title: 'Business Overview',
        content: this.generateBusinessOverview(businessData),
      },
      {
        title: 'Financial Analysis',
        content: await this.generateFinancialAnalysis(businessData),
      },
      {
        title: 'Valuation Methods',
        content: await this.generateValuationMethods(businessData),
        subsections: [
          {
            title: 'Asset-Based Valuation',
            content: this.calculateAssetBasedValuation(businessData),
          },
          {
            title: 'Revenue Multiple Method',
            content: this.calculateRevenueMultiple(businessData),
          },
          {
            title: 'EBITDA Multiple Method',
            content: this.calculateEBITDAMultiple(businessData),
          },
        ],
      },
      {
        title: 'Market Comparison',
        content: await this.generateMarketComparison(businessData),
      },
      {
        title: 'Risk Assessment',
        content: await this.generateRiskAssessment(businessData),
      },
    ];

    const executiveSummary = await this.generateExecutiveSummary(businessData, 'valuation');

    return {
      reportId: `REP_${Date.now()}`,
      reportType: 'valuation',
      title: `Business Valuation Report: ${businessData.name}`,
      subtitle: `${businessData.industry} | ${businessData.location || 'India'}`,
      generatedDate: new Date().toISOString(),
      businessName: businessData.name,
      sections,
      executiveSummary,
      recommendations: await this.generateRecommendations(businessData, 'valuation'),
      disclaimer: this.getStandardDisclaimer(),
      metadata: { businessData },
    };
  }

  /**
   * Generate due diligence report
   */
  static async generateDueDiligenceReport(
    businessData: any,
    dueDiligenceData: any
  ): Promise<Report> {
    const sections: ReportSection[] = [
      {
        title: 'Executive Overview',
        content: `Due diligence analysis for ${businessData.name}, a ${businessData.industry} business.`,
      },
      {
        title: 'Financial Due Diligence',
        content: dueDiligenceData.financialAnalysis?.findings?.join('\n') || 'Financial analysis pending.',
      },
      {
        title: 'Legal Due Diligence',
        content: dueDiligenceData.legalAnalysis?.findings?.join('\n') || 'Legal analysis pending.',
      },
      {
        title: 'Operational Due Diligence',
        content: dueDiligenceData.operationalAnalysis?.findings?.join('\n') || 'Operational analysis pending.',
      },
      {
        title: 'Risk Analysis',
        content: `Overall Risk Score: ${dueDiligenceData.overallRiskScore}/100

Critical Issues:
${dueDiligenceData.criticalIssues?.map((i: string) => `• ${i}`).join('\n') || 'None identified'}`,
      },
      {
        title: 'Due Diligence Checklist',
        content: this.generateChecklistSection(dueDiligenceData.checklist || []),
      },
    ];

    return {
      reportId: `DD_${Date.now()}`,
      reportType: 'due-diligence',
      title: `Due Diligence Report: ${businessData.name}`,
      generatedDate: new Date().toISOString(),
      businessName: businessData.name,
      sections,
      executiveSummary: `This report presents comprehensive due diligence findings for ${businessData.name}. Overall recommendation: ${dueDiligenceData.recommendation || 'Proceed with Caution'}.`,
      recommendations: dueDiligenceData.criticalIssues || [],
      disclaimer: this.getStandardDisclaimer(),
    };
  }

  /**
   * Generate market analysis report
   */
  static async generateMarketAnalysisReport(
    industry: string,
    location: string
  ): Promise<Report> {
    const marketData = await this.getMarketData(industry, location);

    const sections: ReportSection[] = [
      {
        title: 'Market Overview',
        content: marketData.overview,
      },
      {
        title: 'Industry Trends',
        content: marketData.trends,
      },
      {
        title: 'Competitive Landscape',
        content: marketData.competition,
      },
      {
        title: 'Growth Opportunities',
        content: marketData.opportunities,
      },
      {
        title: 'Market Risks',
        content: marketData.risks,
      },
    ];

    return {
      reportId: `MKT_${Date.now()}`,
      reportType: 'market-analysis',
      title: `Market Analysis: ${industry}`,
      subtitle: `${location}, India`,
      generatedDate: new Date().toISOString(),
      sections,
      executiveSummary: marketData.summary,
      recommendations: marketData.recommendations,
      disclaimer: this.getStandardDisclaimer(),
    };
  }

  /**
   * Export report to HTML format
   */
  static exportToHTML(report: Report): string {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .report-container {
      background: white;
      padding: 40px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #333;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #333;
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .subtitle {
      color: #666;
      font-size: 16px;
    }
    .meta {
      color: #999;
      font-size: 14px;
      margin-top: 10px;
    }
    .executive-summary {
      background: #f8f9fa;
      border-left: 4px solid #007bff;
      padding: 20px;
      margin: 30px 0;
    }
    .section {
      margin: 30px 0;
    }
    h2 {
      color: #444;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
      margin-top: 30px;
    }
    h3 {
      color: #666;
      margin-top: 20px;
    }
    .recommendations {
      background: #e7f3ff;
      border-left: 4px solid #0066cc;
      padding: 20px;
      margin: 20px 0;
    }
    .disclaimer {
      font-size: 12px;
      color: #999;
      border-top: 1px solid #ddd;
      padding-top: 20px;
      margin-top: 40px;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin: 5px 0;
    }
    @media print {
      body { background: white; }
      .report-container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <h1>${report.title}</h1>
      ${report.subtitle ? `<div class="subtitle">${report.subtitle}</div>` : ''}
      <div class="meta">Generated on ${new Date(report.generatedDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="meta">Report ID: ${report.reportId}</div>
    </div>

    <div class="executive-summary">
      <h2>Executive Summary</h2>
      <p>${report.executiveSummary}</p>
    </div>

    ${report.sections.map(section => `
      <div class="section">
        <h2>${section.title}</h2>
        <p>${section.content.replace(/\n/g, '<br>')}</p>
        ${section.subsections ? section.subsections.map(sub => `
          <h3>${sub.title}</h3>
          <p>${sub.content.replace(/\n/g, '<br>')}</p>
        `).join('') : ''}
      </div>
    `).join('')}

    ${report.recommendations.length > 0 ? `
      <div class="recommendations">
        <h2>Recommendations</h2>
        <ul>
          ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <div class="disclaimer">
      <strong>Disclaimer:</strong><br>
      ${report.disclaimer}
    </div>
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * Download report as PDF (triggers browser print with PDF option)
   */
  static async downloadAsPDF(report: Report, filename?: string): Promise<void> {
    const html = this.exportToHTML(report);
    
    // Create a blob from HTML
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window for printing
    const printWindow = window.open(url, '_blank');
    
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
  }

  /**
   * Download report as HTML file
   */
  static downloadAsHTML(report: Report, filename?: string): void {
    const html = this.exportToHTML(report);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `${report.reportType}_report_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Helper methods

  private static generateBusinessOverview(businessData: any): string {
    return `${businessData.name} is a ${businessData.industry} business located in ${businessData.location || 'India'}. ${businessData.establishedYear ? `Established in ${businessData.establishedYear}, the company has been operating for ${new Date().getFullYear() - businessData.establishedYear} years.` : ''} ${businessData.employees ? `The business employs ${businessData.employees} people.` : ''}`;
  }

  private static async generateFinancialAnalysis(businessData: any): Promise<string> {
    const revenue = businessData.revenue || 0;
    const profit = businessData.profit || 0;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0;

    return `Financial Performance:

• Annual Revenue: ₹${revenue.toLocaleString()}
• Net Profit: ₹${profit.toLocaleString()}
• Profit Margin: ${profitMargin}%
• Total Assets: ₹${(businessData.assets || 0).toLocaleString()}
• Total Liabilities: ₹${(businessData.liabilities || 0).toLocaleString()}`;
  }

  private static async generateValuationMethods(businessData: any): Promise<string> {
    return `This valuation employs three widely-accepted methods:

1. Asset-Based Valuation: Calculates net asset value
2. Revenue Multiple Method: Industry-standard revenue multiples
3. EBITDA Multiple Method: Earnings-based valuation

Each method provides a different perspective on business value.`;
  }

  private static calculateAssetBasedValuation(businessData: any): string {
    const assets = businessData.assets || 0;
    const liabilities = businessData.liabilities || 0;
    const netAssets = assets - liabilities;

    return `Net Asset Value: ₹${netAssets.toLocaleString()}\n\nThis represents the business value based on tangible assets minus liabilities.`;
  }

  private static calculateRevenueMultiple(businessData: any): string {
    const revenue = businessData.revenue || 0;
    const multiple = 2.5; // Industry average
    const valuation = revenue * multiple;

    return `Revenue: ₹${revenue.toLocaleString()}\nTypical Multiple: ${multiple}x\nEstimated Value: ₹${valuation.toLocaleString()}`;
  }

  private static calculateEBITDAMultiple(businessData: any): string {
    const profit = businessData.profit || 0;
    const multiple = 5; // Industry average
    const valuation = profit * multiple;

    return `EBITDA (approx.): ₹${profit.toLocaleString()}\nTypical Multiple: ${multiple}x\nEstimated Value: ₹${valuation.toLocaleString()}`;
  }

  private static async generateMarketComparison(businessData: any): Promise<string> {
    return `Comparable businesses in the ${businessData.industry} sector typically trade at 2-4x revenue multiples. Based on market conditions in ${businessData.location || 'India'}, this business shows competitive positioning.`;
  }

  private static async generateRiskAssessment(businessData: any): Promise<string> {
    const age = businessData.establishedYear ? new Date().getFullYear() - businessData.establishedYear : 0;
    const riskLevel = age < 2 ? 'High' : age < 5 ? 'Medium' : 'Low';

    return `Business Age Risk: ${riskLevel}\n${age < 2 ? 'Young business with limited track record' : age < 5 ? 'Established business with moderate history' : 'Well-established business with proven track record'}`;
  }

  private static async generateExecutiveSummary(businessData: any, reportType: string): Promise<string> {
    const prompt = `Generate a professional 2-3 sentence executive summary for a ${reportType} report on ${businessData.name}, a ${businessData.industry} business with ₹${(businessData.revenue || 0).toLocaleString()} in revenue.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch {
      return `This ${reportType} report analyzes ${businessData.name}, providing comprehensive insights into its financial performance, market position, and growth potential.`;
    }
  }

  private static async generateRecommendations(businessData: any, reportType: string): Promise<string[]> {
    return [
      'Conduct thorough financial audit',
      'Verify all legal documentation',
      'Interview key employees and management',
      'Review customer contracts and relationships',
      'Assess competitive landscape',
    ];
  }

  private static generateChecklistSection(checklist: any[]): string {
    if (!checklist || checklist.length === 0) {
      return 'Due diligence checklist not available.';
    }

    return checklist.map(item => 
      `${item.completed ? '✓' : '○'} ${item.item} - ${item.status}`
    ).join('\n');
  }

  private static async getMarketData(industry: string, location: string): Promise<any> {
    // This would call market data APIs in production
    return {
      overview: `The ${industry} market in ${location} shows steady growth with increasing consumer demand.`,
      trends: `Key trends include digital transformation, sustainability focus, and changing consumer preferences.`,
      competition: `Competitive landscape features both established players and emerging startups.`,
      opportunities: `Growth opportunities exist in underserved segments and digital channels.`,
      risks: `Market risks include regulatory changes, economic volatility, and technological disruption.`,
      summary: `The ${industry} sector in ${location} presents attractive opportunities with manageable risks.`,
      recommendations: [
        'Focus on digital marketing',
        'Invest in technology infrastructure',
        'Build strong customer relationships',
      ],
    };
  }

  private static getStandardDisclaimer(): string {
    return `This report has been prepared for informational purposes only. The analysis and recommendations contained herein are based on information provided and publicly available data. This report should not be considered as financial, legal, or investment advice. Readers should conduct their own due diligence and consult with qualified professionals before making any business decisions. BizSearch and its AI analysis tools provide estimates and opinions that may not reflect actual market conditions or future performance.`;
  }
}
