import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiService } from './gemini-service';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

export interface DueDiligenceReport {
  overallRiskScore: number; // 0-100, higher = more risky
  recommendation: 'Proceed' | 'Proceed with Caution' | 'High Risk' | 'Do Not Proceed';
  criticalIssues: string[];
  warnings: string[];
  positiveFactors: string[];
  financialAnalysis: {
    score: number;
    findings: string[];
    redFlags: string[];
  };
  legalAnalysis: {
    score: number;
    findings: string[];
    redFlags: string[];
  };
  operationalAnalysis: {
    score: number;
    findings: string[];
    redFlags: string[];
  };
  marketAnalysis: {
    score: number;
    findings: string[];
    opportunities: string[];
  };
  checklist: DueDiligenceChecklistItem[];
}

export interface DueDiligenceChecklistItem {
  category: string;
  item: string;
  priority: 'Critical' | 'Important' | 'Recommended';
  completed?: boolean;
  notes?: string;
}

export class AIDueDiligenceService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Generate comprehensive due diligence report
   */
  static async generateDueDiligenceReport(businessData: {
    name: string;
    industry: string;
    price: number;
    revenue?: number;
    profit?: number;
    employees?: number;
    established_year?: number;
    location?: string;
    description?: string;
    financial_highlights?: string;
    legal_status?: string;
    assets?: number;
    liabilities?: number;
  }): Promise<DueDiligenceReport> {
    const prompt = `As a senior M&A advisor, conduct a comprehensive due diligence analysis for this business acquisition:

BUSINESS DETAILS:
- Name: ${businessData.name}
- Industry: ${businessData.industry}
- Asking Price: ₹${businessData.price.toLocaleString()}
- Annual Revenue: ${businessData.revenue ? `₹${businessData.revenue.toLocaleString()}` : 'Not disclosed'}
- Annual Profit: ${businessData.profit ? `₹${businessData.profit.toLocaleString()}` : 'Not disclosed'}
- Employees: ${businessData.employees || 'Not specified'}
- Years in Business: ${businessData.established_year ? new Date().getFullYear() - businessData.established_year : 'Unknown'}
- Location: ${businessData.location || 'Not specified'}
- Assets: ${businessData.assets ? `₹${businessData.assets.toLocaleString()}` : 'Not disclosed'}
- Liabilities: ${businessData.liabilities ? `₹${businessData.liabilities.toLocaleString()}` : 'Not disclosed'}
- Description: ${businessData.description?.substring(0, 500)}

Provide a detailed due diligence report in this EXACT JSON format (no markdown):
{
  "overallRiskScore": <number 0-100>,
  "recommendation": "<Proceed|Proceed with Caution|High Risk|Do Not Proceed>",
  "criticalIssues": ["issue 1", "issue 2"],
  "warnings": ["warning 1", "warning 2", "warning 3"],
  "positiveFactors": ["factor 1", "factor 2", "factor 3"],
  "financialAnalysis": {
    "score": <number 0-100>,
    "findings": ["finding 1", "finding 2", "finding 3"],
    "redFlags": ["flag 1", "flag 2"]
  },
  "legalAnalysis": {
    "score": <number 0-100>,
    "findings": ["finding 1", "finding 2"],
    "redFlags": ["flag 1"]
  },
  "operationalAnalysis": {
    "score": <number 0-100>,
    "findings": ["finding 1", "finding 2"],
    "redFlags": ["flag 1"]
  },
  "marketAnalysis": {
    "score": <number 0-100>,
    "findings": ["finding 1", "finding 2"],
    "opportunities": ["opportunity 1", "opportunity 2"]
  }
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const analysis = JSON.parse(text);
      
      // Generate checklist
      const checklistText = await GeminiService.generateDueDiligenceChecklist({
        industry: businessData.industry,
        transactionSize: businessData.price,
      });
      
      const checklist = this.parseChecklistText(checklistText);
      
      return {
        ...analysis,
        checklist,
      };
    } catch (error) {
      console.error('Due diligence generation error:', error);
      return this.generateBasicReport(businessData);
    }
  }

  /**
   * Parse checklist text into structured items
   */
  private static parseChecklistText(text: string): DueDiligenceChecklistItem[] {
    const items: DueDiligenceChecklistItem[] = [];
    const lines = text.split('\n');
    let currentCategory = 'General';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Detect category headers
      if (trimmed.match(/^\d+\.\s+[A-Z]/)) {
        currentCategory = trimmed.replace(/^\d+\.\s+/, '').replace(/:$/, '');
        continue;
      }
      
      // Detect checklist items
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\)/)) {
        const item = trimmed.replace(/^[-•]\s*/, '').replace(/^\d+\)\s*/, '');
        
        let priority: 'Critical' | 'Important' | 'Recommended' = 'Recommended';
        if (item.toLowerCase().includes('critical') || item.toLowerCase().includes('must')) {
          priority = 'Critical';
        } else if (item.toLowerCase().includes('important') || item.toLowerCase().includes('should')) {
          priority = 'Important';
        }
        
        items.push({
          category: currentCategory,
          item: item.replace(/\(Critical\)/gi, '').replace(/\(Important\)/gi, '').trim(),
          priority,
          completed: false,
        });
      }
    }
    
    return items;
  }

  /**
   * Fallback basic report generation
   */
  private static generateBasicReport(businessData: any): DueDiligenceReport {
    const priceToRevenue = businessData.revenue ? businessData.price / businessData.revenue : 0;
    const profitMargin = (businessData.revenue && businessData.profit) 
      ? (businessData.profit / businessData.revenue) * 100 
      : 0;
    
    const overallRiskScore = priceToRevenue > 5 ? 70 : priceToRevenue > 3 ? 50 : 30;
    
    return {
      overallRiskScore,
      recommendation: overallRiskScore > 60 ? 'Proceed with Caution' : 'Proceed',
      criticalIssues: priceToRevenue > 5 ? ['High price-to-revenue ratio'] : [],
      warnings: [
        'Request complete financial statements for last 3 years',
        'Verify all legal licenses and permits',
        'Conduct customer concentration analysis',
      ],
      positiveFactors: [
        businessData.established_year && new Date().getFullYear() - businessData.established_year > 5 
          ? 'Established business with proven track record' 
          : 'Business opportunity in growing market',
        profitMargin > 15 ? 'Healthy profit margins' : 'Revenue generating business',
      ],
      financialAnalysis: {
        score: profitMargin > 15 ? 75 : 60,
        findings: [
          `Price-to-revenue multiple: ${priceToRevenue.toFixed(2)}x`,
          profitMargin > 0 ? `Profit margin: ${profitMargin.toFixed(1)}%` : 'Profit data needed',
        ],
        redFlags: priceToRevenue > 5 ? ['Valuation appears high'] : [],
      },
      legalAnalysis: {
        score: 70,
        findings: ['Legal verification required', 'Check for pending litigation'],
        redFlags: [],
      },
      operationalAnalysis: {
        score: 70,
        findings: ['Operational assessment needed', 'Review customer contracts'],
        redFlags: [],
      },
      marketAnalysis: {
        score: 75,
        findings: [`${businessData.industry} industry analysis needed`],
        opportunities: ['Market expansion potential', 'Digital transformation opportunities'],
      },
      checklist: [
        { category: 'Financial', item: 'Review 3 years of tax returns', priority: 'Critical', completed: false },
        { category: 'Financial', item: 'Analyze profit & loss statements', priority: 'Critical', completed: false },
        { category: 'Financial', item: 'Verify accounts receivable/payable', priority: 'Important', completed: false },
        { category: 'Legal', item: 'Verify business licenses', priority: 'Critical', completed: false },
        { category: 'Legal', item: 'Check for litigation history', priority: 'Important', completed: false },
        { category: 'Operational', item: 'Interview key employees', priority: 'Important', completed: false },
        { category: 'Operational', item: 'Review supplier contracts', priority: 'Recommended', completed: false },
        { category: 'Market', item: 'Analyze competitive landscape', priority: 'Important', completed: false },
      ],
    };
  }

  /**
   * Analyze specific due diligence area
   */
  static async analyzeSpecificArea(
    area: 'financial' | 'legal' | 'operational' | 'market',
    businessData: any,
    documents?: string[]
  ): Promise<{ score: number; findings: string[]; recommendations: string[] }> {
    const prompts = {
      financial: `Conduct detailed financial due diligence for ${businessData.name}. Revenue: ₹${businessData.revenue?.toLocaleString()}, Profit: ₹${businessData.profit?.toLocaleString()}.`,
      legal: `Conduct legal due diligence for ${businessData.name} in ${businessData.industry} industry, located in ${businessData.location}.`,
      operational: `Analyze operational aspects of ${businessData.name}. Employees: ${businessData.employees}, Years: ${businessData.established_year ? new Date().getFullYear() - businessData.established_year : 'Unknown'}.`,
      market: `Analyze market position for ${businessData.name} in ${businessData.industry} industry in ${businessData.location}.`,
    };

    const prompt = `${prompts[area]}

Provide analysis in this JSON format:
{
  "score": <number 0-100>,
  "findings": ["finding 1", "finding 2", "finding 3"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      return {
        score: 70,
        findings: [`Detailed ${area} analysis required`, 'Request additional documentation'],
        recommendations: [`Engage ${area} specialist`, 'Conduct thorough review'],
      };
    }
  }

  /**
   * Generate risk assessment summary
   */
  static async generateRiskAssessment(businessData: any): Promise<{
    riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
    riskScore: number;
    keyRisks: { risk: string; impact: string; mitigation: string }[];
  }> {
    const prompt = `Assess investment risks for acquiring ${businessData.name}:

Price: ₹${businessData.price?.toLocaleString()}
Revenue: ₹${businessData.revenue?.toLocaleString() || 'Not disclosed'}
Industry: ${businessData.industry}
Location: ${businessData.location}

Provide risk assessment in JSON:
{
  "riskLevel": "<Low|Medium|High|Very High>",
  "riskScore": <number 0-100>,
  "keyRisks": [
    {"risk": "Risk description", "impact": "Impact description", "mitigation": "Mitigation strategy"}
  ]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      return {
        riskLevel: 'Medium',
        riskScore: 50,
        keyRisks: [
          {
            risk: 'Financial verification needed',
            impact: 'Cannot fully assess financial health',
            mitigation: 'Request 3 years of audited financials',
          },
        ],
      };
    }
  }
}
