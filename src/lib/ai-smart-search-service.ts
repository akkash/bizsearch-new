import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

export interface SearchIntent {
  industries?: string[];
  locations?: string[];
  priceRange?: { min?: number; max?: number };
  revenueRange?: { min?: number; max?: number };
  businessType?: string;
  keywords?: string[];
  investmentGoal?: string;
}

export interface SmartSearchResult {
  businesses: any[];
  searchIntent: SearchIntent;
  totalResults: number;
  suggestions: string[];
}

export class AISmartSearchService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Parse natural language query into structured search parameters
   */
  static async parseSearchQuery(query: string): Promise<SearchIntent> {
    const prompt = `Parse this natural language business search query into structured search parameters:

Query: "${query}"

Extract and return ONLY a JSON object (no markdown, no code blocks) with these fields:
{
  "industries": [<array of industry names if mentioned>],
  "locations": [<array of cities/states if mentioned>],
  "priceRange": {"min": <number or null>, "max": <number or null>},
  "revenueRange": {"min": <number or null>, "max": <number or null>},
  "businessType": "<type if mentioned like restaurant, retail, manufacturing, etc>",
  "keywords": [<array of relevant keywords>],
  "investmentGoal": "<buyer's goal if implied like passive income, growth, etc>"
}

Examples:
- "coffee shop in Mumbai under 50 lakhs" → {"industries":["food & beverage","cafe"],"locations":["Mumbai"],"priceRange":{"max":5000000},"businessType":"cafe","keywords":["coffee","shop"]}
- "profitable tech startup Bangalore" → {"industries":["technology","software"],"locations":["Bangalore"],"businessType":"startup","keywords":["tech","profitable"]}
- "franchise opportunities with passive income" → {"businessType":"franchise","investmentGoal":"passive income","keywords":["franchise"]}

Convert lakhs/crores to numbers (1 lakh = 100000, 1 crore = 10000000).
Return ONLY the JSON:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const intent = JSON.parse(cleanText);
      return intent;
    } catch (error) {
      console.error('Query parsing error:', error);
      // Fallback to basic keyword extraction
      return this.basicParse(query);
    }
  }

  /**
   * Fallback basic query parsing
   */
  private static basicParse(query: string): SearchIntent {
    const lowerQuery = query.toLowerCase();
    const intent: SearchIntent = {
      keywords: query.split(' ').filter(w => w.length > 3),
    };

    // Extract price
    const lakhMatch = query.match(/(\d+)\s*(?:lakh|lac)/i);
    const croreMatch = query.match(/(\d+)\s*crore/i);
    
    if (lakhMatch) {
      const lakhs = parseInt(lakhMatch[1]);
      if (lowerQuery.includes('under') || lowerQuery.includes('below')) {
        intent.priceRange = { max: lakhs * 100000 };
      }
    }
    if (croreMatch) {
      const crores = parseInt(croreMatch[1]);
      if (lowerQuery.includes('under') || lowerQuery.includes('below')) {
        intent.priceRange = { max: crores * 10000000 };
      }
    }

    // Common industry keywords
    const industries = [
      'restaurant', 'cafe', 'food', 'retail', 'shop', 'store',
      'tech', 'software', 'saas', 'manufacturing', 'franchise',
      'hotel', 'gym', 'fitness', 'education', 'school'
    ];
    
    const foundIndustries = industries.filter(ind => lowerQuery.includes(ind));
    if (foundIndustries.length > 0) {
      intent.industries = foundIndustries;
    }

    // Common cities
    const cities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
      'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'
    ];
    
    const foundCities = cities.filter(city => 
      query.toLowerCase().includes(city.toLowerCase())
    );
    if (foundCities.length > 0) {
      intent.locations = foundCities;
    }

    return intent;
  }

  /**
   * Perform smart search with AI-enhanced results
   */
  static async smartSearch(query: string): Promise<SmartSearchResult> {
    try {
      // Parse the query
      const intent = await this.parseSearchQuery(query);

      // Build database query
      let dbQuery = supabase
        .from('businesses')
        .select('*')
        .eq('status', 'active');

      // Apply filters from intent
      if (intent.industries && intent.industries.length > 0) {
        const industryFilters = intent.industries.map(ind =>
          `industry.ilike.%${ind}%`
        ).join(',');
        dbQuery = dbQuery.or(industryFilters);
      }

      if (intent.locations && intent.locations.length > 0) {
        const locationFilters = intent.locations.map(loc =>
          `city.ilike.%${loc}%,state.ilike.%${loc}%`
        ).join(',');
        dbQuery = dbQuery.or(locationFilters);
      }

      if (intent.priceRange) {
        if (intent.priceRange.min) {
          dbQuery = dbQuery.gte('price', intent.priceRange.min);
        }
        if (intent.priceRange.max) {
          dbQuery = dbQuery.lte('price', intent.priceRange.max);
        }
      }

      if (intent.revenueRange) {
        if (intent.revenueRange.min) {
          dbQuery = dbQuery.gte('revenue', intent.revenueRange.min);
        }
        if (intent.revenueRange.max) {
          dbQuery = dbQuery.lte('revenue', intent.revenueRange.max);
        }
      }

      // Add keyword search
      if (intent.keywords && intent.keywords.length > 0) {
        const keywordFilter = intent.keywords.map(kw =>
          `name.ilike.%${kw}%,description.ilike.%${kw}%`
        ).join(',');
        dbQuery = dbQuery.or(keywordFilter);
      }

      const { data: businesses, error } = await dbQuery
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Generate search suggestions
      const suggestions = await this.generateSuggestions(query, intent);

      return {
        businesses: businesses || [],
        searchIntent: intent,
        totalResults: businesses?.length || 0,
        suggestions,
      };
    } catch (error) {
      console.error('Smart search error:', error);
      throw error;
    }
  }

  /**
   * Generate search suggestions based on query
   */
  private static async generateSuggestions(
    originalQuery: string,
    intent: SearchIntent
  ): Promise<string[]> {
    const prompt = `Given this business search query: "${originalQuery}"

Generate 3-5 related search suggestions that might help the user find better matches.

Suggestions should:
- Be more specific or explore related options
- Include location variations if applicable
- Suggest price range adjustments
- Explore similar industries
- Be natural language queries

Provide ONLY the suggestions, one per line:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      return text.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
        .slice(0, 5);
    } catch (error) {
      console.error('Suggestion generation error:', error);
      
      // Fallback suggestions
      const suggestions: string[] = [];
      
      if (intent.industries && intent.industries[0]) {
        suggestions.push(`Successful ${intent.industries[0]} businesses for sale`);
      }
      if (intent.locations && intent.locations[0]) {
        suggestions.push(`High-profit businesses in ${intent.locations[0]}`);
      }
      if (intent.priceRange?.max) {
        suggestions.push(`Businesses under ₹${(intent.priceRange.max / 100000)} lakhs`);
      }
      
      return suggestions;
    }
  }

  /**
   * Get autocomplete suggestions for search
   */
  static async getAutocompleteSuggestions(partial: string): Promise<string[]> {
    if (partial.length < 3) return [];

    try {
      // Get businesses matching the partial query
      const { data: businesses } = await supabase
        .from('businesses')
        .select('name, industry, city')
        .or(`name.ilike.%${partial}%,industry.ilike.%${partial}%,city.ilike.%${partial}%`)
        .limit(10);

      if (!businesses) return [];

      // Extract unique suggestions
      const suggestions = new Set<string>();
      
      businesses.forEach(b => {
        if (b.name?.toLowerCase().includes(partial.toLowerCase())) {
          suggestions.add(b.name);
        }
        if (b.industry?.toLowerCase().includes(partial.toLowerCase())) {
          suggestions.add(`${b.industry} businesses`);
        }
        if (b.city?.toLowerCase().includes(partial.toLowerCase())) {
          suggestions.add(`Businesses in ${b.city}`);
        }
      });

      return Array.from(suggestions).slice(0, 5);
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }

  /**
   * Explain search results to user
   */
  static async explainResults(
    query: string,
    intent: SearchIntent,
    resultCount: number
  ): Promise<string> {
    const prompt = `Explain to the user what businesses you're showing them based on their search.

Original Query: "${query}"
Extracted Intent: ${JSON.stringify(intent)}
Results Found: ${resultCount}

Write a friendly 1-2 sentence explanation of what we found and why.

Examples:
- "I found 12 cafes and restaurants in Mumbai within your budget of ₹50 lakhs."
- "Here are 8 profitable tech startups in Bangalore that match your criteria."
- "Showing you 15 franchise opportunities focused on passive income."

Write ONLY the explanation:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      return `Found ${resultCount} businesses matching "${query}"`;
    }
  }
}
