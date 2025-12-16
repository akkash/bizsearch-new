import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

export interface ListingOptimization {
  optimizedTitle?: string;
  optimizedDescription?: string;
  suggestedTagline?: string;
  highlightedStrengths?: string[];
  suggestedImprovements?: string[];
  keywordSuggestions?: string[];
  pricingRecommendation?: {
    suggestedPrice?: number;
    reasoning?: string;
  };
}

export class AIListingOptimizerService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Generate an optimized business listing description
   */
  static async optimizeDescription(businessData: {
    name: string;
    industry: string;
    description?: string;
    revenue?: number;
    employees?: number;
    established_year?: number;
    location?: string;
    highlights?: string[];
    unique_selling_points?: string;
  }): Promise<string> {
    const prompt = `As a professional business listing copywriter, create a compelling, SEO-optimized business description that attracts serious buyers.

BUSINESS INFORMATION:
- Name: ${businessData.name}
- Industry: ${businessData.industry}
- Current Description: ${businessData.description || 'Not provided'}
- Revenue: ${businessData.revenue ? `₹${businessData.revenue.toLocaleString()}` : 'Not disclosed'}
- Employees: ${businessData.employees || 'Not specified'}
- Established: ${businessData.established_year || 'Not specified'}
- Location: ${businessData.location || 'Not specified'}
- Key Highlights: ${businessData.highlights?.join(', ') || 'None provided'}
- Unique Selling Points: ${businessData.unique_selling_points || 'None provided'}

Create a compelling business description that:
1. Opens with an attention-grabbing first sentence
2. Highlights the business's unique value proposition
3. Includes specific metrics and achievements (growth, revenue, customer base)
4. Describes the target market and customer demographics
5. Mentions key assets (equipment, location, inventory, intellectual property)
6. Explains growth opportunities
7. Addresses why the owner is selling (if appropriate)
8. Uses powerful, benefit-focused language
9. Is 200-300 words
10. Includes relevant keywords for SEO

Write ONLY the optimized description without any introduction or labels:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Description optimization error:', error);
      throw new Error('Failed to optimize description');
    }
  }

  /**
   * Generate a catchy business tagline
   */
  static async generateTagline(businessData: {
    name: string;
    industry: string;
    description?: string;
    unique_selling_points?: string;
  }): Promise<string[]> {
    const prompt = `Generate 5 catchy, memorable taglines for this business listing:

Business: ${businessData.name}
Industry: ${businessData.industry}
Description: ${businessData.description?.substring(0, 200) || 'N/A'}
USP: ${businessData.unique_selling_points || 'N/A'}

Requirements:
- 5-10 words each
- Memorable and attention-grabbing
- Highlight key benefits or uniqueness
- Professional yet engaging
- Action-oriented when appropriate

Provide ONLY the 5 taglines, one per line, without numbering:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      return text.split('\n').filter(line => line.trim().length > 0).map(line => 
        line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim()
      );
    } catch (error) {
      console.error('Tagline generation error:', error);
      throw new Error('Failed to generate taglines');
    }
  }

  /**
   * Get comprehensive listing optimization suggestions
   */
  static async getOptimizationSuggestions(businessData: {
    name: string;
    industry: string;
    description?: string;
    price?: number;
    revenue?: number;
    profit?: number;
    employees?: number;
    established_year?: number;
    location?: string;
    images?: string[];
    highlights?: string[];
  }): Promise<ListingOptimization> {
    const prompt = `As a business listing optimization expert, analyze this business listing and provide specific improvement suggestions:

CURRENT LISTING:
- Name: ${businessData.name}
- Industry: ${businessData.industry}
- Description: ${businessData.description?.substring(0, 300) || 'Not provided'}
- Asking Price: ${businessData.price ? `₹${businessData.price.toLocaleString()}` : 'Not specified'}
- Annual Revenue: ${businessData.revenue ? `₹${businessData.revenue.toLocaleString()}` : 'Not disclosed'}
- Annual Profit: ${businessData.profit ? `₹${businessData.profit.toLocaleString()}` : 'Not disclosed'}
- Employees: ${businessData.employees || 'Not specified'}
- Established: ${businessData.established_year || 'Not specified'}
- Location: ${businessData.location || 'Not specified'}
- Images: ${businessData.images?.length || 0} photos
- Highlights: ${businessData.highlights?.join(', ') || 'None'}

Provide analysis in this EXACT JSON format (no markdown, no code blocks):
{
  "optimizedTitle": "<improved business name/title>",
  "suggestedTagline": "<catchy 5-8 word tagline>",
  "highlightedStrengths": ["strength 1", "strength 2", "strength 3"],
  "suggestedImprovements": ["improvement 1", "improvement 2", "improvement 3"],
  "keywordSuggestions": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "pricingRecommendation": {
    "suggestedPrice": <number or null>,
    "reasoning": "<one sentence explanation>"
  }
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const optimization = JSON.parse(cleanText);
      return optimization;
    } catch (error) {
      console.error('Optimization suggestions error:', error);
      // Return default suggestions
      return {
        suggestedImprovements: [
          'Add high-quality photos of your business location and operations',
          'Include specific financial metrics (revenue, profit margin, growth rate)',
          'Highlight unique selling points and competitive advantages',
        ],
        keywordSuggestions: [businessData.industry, businessData.location || 'business'],
      };
    }
  }

  /**
   * Generate SEO-friendly keywords
   */
  static async generateKeywords(businessData: {
    name: string;
    industry: string;
    description?: string;
    location?: string;
  }): Promise<string[]> {
    const prompt = `Generate 10-15 SEO-optimized keywords for this business listing:

Business: ${businessData.name}
Industry: ${businessData.industry}
Description: ${businessData.description?.substring(0, 200) || 'N/A'}
Location: ${businessData.location || 'India'}

Include:
- Industry-specific terms
- Location-based keywords
- Business model keywords
- Buyer intent keywords

Provide ONLY the keywords, comma-separated:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      return text.split(',').map(k => k.trim()).filter(k => k.length > 0);
    } catch (error) {
      console.error('Keyword generation error:', error);
      return [businessData.industry, businessData.location || 'business', 'for sale'];
    }
  }

  /**
   * Analyze and improve business highlights
   */
  static async optimizeHighlights(
    currentHighlights: string[],
    businessData: {
      industry: string;
      revenue?: number;
      employees?: number;
      established_year?: number;
    }
  ): Promise<string[]> {
    const prompt = `Improve these business listing highlights to be more compelling and specific:

Current Highlights:
${currentHighlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Business Context:
- Industry: ${businessData.industry}
- Revenue: ${businessData.revenue ? `₹${businessData.revenue.toLocaleString()}` : 'N/A'}
- Employees: ${businessData.employees || 'N/A'}
- Years in Business: ${businessData.established_year ? new Date().getFullYear() - businessData.established_year : 'N/A'}

Create 5-7 improved highlights that:
- Start with action words or numbers
- Are specific and measurable
- Highlight unique advantages
- Are buyer-focused (benefits, not just features)

Provide ONLY the highlights, one per line:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      return text.split('\n').filter(line => line.trim().length > 0).map(line =>
        line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').replace(/^•\s*/, '').trim()
      );
    } catch (error) {
      console.error('Highlights optimization error:', error);
      return currentHighlights;
    }
  }

  /**
   * Generate pricing recommendation based on business data
   */
  static async suggestPricing(businessData: {
    industry: string;
    revenue?: number;
    profit?: number;
    assets?: number;
    established_year?: number;
    location?: string;
    employees?: number;
  }): Promise<{
    suggestedPrice: number;
    priceRange: { min: number; max: number };
    reasoning: string;
    marketComparison: string;
  }> {
    const prompt = `As a business valuation expert, suggest an appropriate asking price for this business:

BUSINESS DATA:
- Industry: ${businessData.industry}
- Annual Revenue: ${businessData.revenue ? `₹${businessData.revenue.toLocaleString()}` : 'Not provided'}
- Annual Profit: ${businessData.profit ? `₹${businessData.profit.toLocaleString()}` : 'Not provided'}
- Assets: ${businessData.assets ? `₹${businessData.assets.toLocaleString()}` : 'Not provided'}
- Years in Business: ${businessData.established_year ? new Date().getFullYear() - businessData.established_year : 'Unknown'}
- Location: ${businessData.location || 'India'}
- Employees: ${businessData.employees || 'Not specified'}

Provide pricing recommendation in this EXACT JSON format:
{
  "suggestedPrice": <number>,
  "priceRange": {"min": <number>, "max": <number>},
  "reasoning": "<one paragraph explanation>",
  "marketComparison": "<how this compares to market multiples>"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Pricing suggestion error:', error);
      
      // Fallback: Use simple multiples
      const revenue = businessData.revenue || 0;
      const profit = businessData.profit || revenue * 0.15; // Assume 15% margin if not provided
      
      const suggested = profit * 3; // 3x profit multiple
      
      return {
        suggestedPrice: Math.round(suggested),
        priceRange: {
          min: Math.round(suggested * 0.8),
          max: Math.round(suggested * 1.2),
        },
        reasoning: 'Based on industry-standard profit multiples',
        marketComparison: 'Typical range for similar businesses',
      };
    }
  }
}
