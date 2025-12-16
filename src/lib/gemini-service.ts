import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

// Agent personas and system prompts
const AGENT_PERSONAS = {
  ajay: {
    name: 'Ajay Kumar',
    role: 'Business Acquisition Specialist',
    systemPrompt: `You are Ajay Kumar, a Business Acquisition Specialist with 8+ years of experience in business acquisitions, valuations, and due diligence. Your expertise includes:
- Business valuation using multiple methods (DCF, comparable sales, asset-based)
- Due diligence processes (financial, legal, operational)
- Market analysis and competitive positioning
- Negotiation strategies and deal structuring
- ROI calculations and financial projections

You provide practical, actionable advice to buyers looking to acquire businesses. Be professional, knowledgeable, and helpful. When discussing valuations or financials, always remind users to consult with financial advisors for final decisions.

Format your responses clearly with bullet points and specific numbers when possible. If you need more information to provide accurate advice, ask clarifying questions.`,
  },
  vijay: {
    name: 'Vijay Sharma',
    role: 'Franchise Development Expert',
    systemPrompt: `You are Vijay Sharma, a Franchise Development Expert specializing in franchise models, territory planning, and franchisee success. Your expertise includes:
- Franchise business models and structures
- ROI analysis for franchise investments
- Territory planning and market assessment
- Franchise agreement evaluation
- Multi-unit development strategies
- Franchise compliance and legal considerations

You help aspiring franchisees evaluate opportunities and make informed decisions. Be encouraging yet realistic about franchise investments. Provide detailed analysis of costs, potential returns, and risks.

Format your responses clearly with specific numbers, timelines, and actionable steps. Always emphasize the importance of reviewing the Franchise Disclosure Document (FDD).`,
  },
};

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
  timestamp?: Date;
}

export interface ChatContext {
  businessData?: any;
  franchiseData?: any;
  userProfile?: any;
}

export class GeminiService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Send a message to Gemini AI with agent persona and context
   */
  static async sendMessage(
    message: string,
    agent: 'ajay' | 'vijay',
    context?: ChatContext,
    chatHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      const persona = AGENT_PERSONAS[agent];
      
      // Build context information
      let contextInfo = '';
      if (context?.businessData) {
        contextInfo += `\n\nBusiness Context:\n${JSON.stringify(context.businessData, null, 2)}`;
      }
      if (context?.franchiseData) {
        contextInfo += `\n\nFranchise Context:\n${JSON.stringify(context.franchiseData, null, 2)}`;
      }

      // Filter and convert chat history - ensure it starts with user message
      const history = chatHistory
        .filter(msg => msg.role === 'user' || msg.role === 'model')
        .map(msg => ({
          role: msg.role,
          parts: [{ text: msg.parts }],
        }));

      // If first message is not from user, remove it or start fresh
      if (history.length > 0 && history[0].role !== 'user') {
        history.shift();
      }

      // Create chat session with history
      const chat = this.model.startChat({
        history: history,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      // Send message with system prompt and context only on first message
      const fullPrompt = history.length === 0 
        ? `${persona.systemPrompt}${contextInfo}\n\nUser: ${message}`
        : message;

      const result = await chat.sendMessage(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      
      if (error.message?.includes('API key')) {
        throw new Error('Invalid API key. Please check your Google AI API key in environment variables.');
      }
      
      throw new Error(`AI service error: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate business valuation analysis
   */
  static async generateValuation(businessData: {
    revenue?: number;
    profit?: number;
    assets?: number;
    industry?: string;
    location?: string;
    yearEstablished?: number;
  }): Promise<string> {
    const prompt = `As a business valuation expert, provide a detailed valuation analysis for the following business:

Revenue: ${businessData.revenue ? `₹${businessData.revenue.toLocaleString()}` : 'Not provided'}
Annual Profit: ${businessData.profit ? `₹${businessData.profit.toLocaleString()}` : 'Not provided'}
Assets: ${businessData.assets ? `₹${businessData.assets.toLocaleString()}` : 'Not provided'}
Industry: ${businessData.industry || 'Not specified'}
Location: ${businessData.location || 'Not specified'}
Year Established: ${businessData.yearEstablished || 'Not specified'}

Provide:
1. Estimated valuation range using multiple methods (revenue multiple, EBITDA multiple, asset-based)
2. Key valuation factors and assumptions
3. Industry-specific considerations
4. Potential risks and red flags
5. Recommended due diligence steps

Format the response clearly with specific numbers in Indian Rupees (₹).`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Valuation generation error:', error);
      throw new Error('Failed to generate valuation analysis');
    }
  }

  /**
   * Generate franchise ROI analysis
   */
  static async generateFranchiseROI(franchiseData: {
    franchiseFee?: number;
    totalInvestment?: number;
    royaltyPercentage?: number;
    averageRevenue?: number;
    brandName?: string;
  }): Promise<string> {
    const prompt = `As a franchise investment expert, provide a detailed ROI analysis for the following franchise opportunity:

Brand: ${franchiseData.brandName || 'Franchise'}
Franchise Fee: ${franchiseData.franchiseFee ? `₹${franchiseData.franchiseFee.toLocaleString()}` : 'Not provided'}
Total Investment: ${franchiseData.totalInvestment ? `₹${franchiseData.totalInvestment.toLocaleString()}` : 'Not provided'}
Royalty: ${franchiseData.royaltyPercentage ? `${franchiseData.royaltyPercentage}%` : 'Not provided'}
Average Unit Revenue: ${franchiseData.averageRevenue ? `₹${franchiseData.averageRevenue.toLocaleString()}` : 'Not provided'}

Provide:
1. Estimated ROI and payback period
2. Year-by-year profit projections (first 5 years)
3. Break-even analysis
4. Cash flow considerations
5. Risk assessment
6. Comparison with industry benchmarks

Format the response with specific numbers in Indian Rupees (₹) and realistic timelines.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('ROI generation error:', error);
      throw new Error('Failed to generate ROI analysis');
    }
  }

  /**
   * Generate market analysis
   */
  static async generateMarketAnalysis(data: {
    industry?: string;
    location?: string;
    businessType?: string;
  }): Promise<string> {
    const prompt = `Provide a comprehensive market analysis for:

Industry: ${data.industry || 'Not specified'}
Location: ${data.location || 'India'}
Business Type: ${data.businessType || 'Not specified'}

Include:
1. Market size and growth trends in India
2. Competitive landscape
3. Target customer demographics
4. Entry barriers and opportunities
5. Regulatory considerations
6. Growth potential and risks
7. Key success factors

Provide specific insights relevant to the Indian market with data-driven recommendations.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Market analysis error:', error);
      throw new Error('Failed to generate market analysis');
    }
  }

  /**
   * Analyze uploaded business documents (placeholder for future file upload)
   */
  static async analyzeDocument(documentText: string, analysisType: 'financial' | 'legal' | 'operational'): Promise<string> {
    const prompts = {
      financial: 'Analyze this financial document and provide key insights, red flags, and recommendations:',
      legal: 'Review this legal document and highlight important clauses, risks, and compliance issues:',
      operational: 'Analyze this operational document and provide insights on efficiency, processes, and improvements:',
    };

    const prompt = `${prompts[analysisType]}\n\n${documentText.substring(0, 5000)}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Document analysis error:', error);
      throw new Error('Failed to analyze document');
    }
  }

  /**
   * Generate due diligence checklist
   */
  static async generateDueDiligenceChecklist(businessData: {
    industry?: string;
    businessType?: string;
    transactionSize?: number;
  }): Promise<string> {
    const prompt = `Create a comprehensive due diligence checklist for acquiring a business with these details:

Industry: ${businessData.industry || 'Not specified'}
Business Type: ${businessData.businessType || 'Not specified'}
Transaction Size: ${businessData.transactionSize ? `₹${businessData.transactionSize.toLocaleString()}` : 'Not specified'}

Provide a detailed checklist covering:
1. Financial due diligence items
2. Legal and compliance review
3. Operational assessment
4. Market and competitive analysis
5. Human resources review
6. Technology and IP audit
7. Environmental and regulatory compliance

Format as a structured checklist with priorities (Critical, Important, Recommended).`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Checklist generation error:', error);
      throw new Error('Failed to generate checklist');
    }
  }
}
