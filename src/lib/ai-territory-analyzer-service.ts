import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

export interface TerritoryAnalysis {
  location: string;
  city: string;
  state: string;
  viabilityScore: number; // 0-100
  viabilityLevel: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  demographicScore: number;
  economicScore: number;
  competitionScore: number;
  marketPotentialScore: number;
  demographics: {
    population: number;
    medianAge: number;
    medianIncome: number;
    householdSize: number;
    educationLevel: string;
    employmentRate: number;
  };
  economicIndicators: {
    gdpGrowth: number;
    unemploymentRate: number;
    businessGrowth: number;
    disposableIncome: number;
  };
  competitionAnalysis: {
    directCompetitors: number;
    indirectCompetitors: number;
    marketSaturation: 'Low' | 'Medium' | 'High';
    competitiveAdvantages: string[];
    competitiveChallenges: string[];
  };
  marketPotential: {
    estimatedCustomerBase: number;
    projectedRevenue: { year1: number; year3: number; year5: number };
    growthPotential: 'High' | 'Medium' | 'Low';
    seasonality: string;
  };
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  estimatedROI: number;
  breakEvenMonths: number;
}

export interface TerritoryComparison {
  territories: TerritoryAnalysis[];
  bestTerritory: TerritoryAnalysis;
  ranking: Array<{ location: string; score: number; reason: string }>;
  summary: string;
}

export class AITerritoryAnalyzerService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Analyze a territory for franchise viability
   */
  static async analyzeTerritory(
    location: string,
    franchiseIndustry: string,
    franchiseBrand?: string
  ): Promise<TerritoryAnalysis> {
    try {
      // Parse location
      const [city, state] = this.parseLocation(location);

      // Get AI analysis
      const aiAnalysis = await this.getAITerritoryAnalysis(city, state, franchiseIndustry, franchiseBrand);

      // Calculate scores
      const demographicScore = this.calculateDemographicScore(aiAnalysis.demographics);
      const economicScore = this.calculateEconomicScore(aiAnalysis.economicIndicators);
      const competitionScore = this.calculateCompetitionScore(aiAnalysis.competitionAnalysis);
      const marketPotentialScore = this.calculateMarketPotentialScore(aiAnalysis.marketPotential);

      // Overall viability score (weighted)
      const viabilityScore = Math.round(
        demographicScore * 0.25 +
        economicScore * 0.30 +
        competitionScore * 0.25 +
        marketPotentialScore * 0.20
      );

      const viabilityLevel = this.getViabilityLevel(viabilityScore);

      return {
        location,
        city,
        state,
        viabilityScore,
        viabilityLevel,
        demographicScore,
        economicScore,
        competitionScore,
        marketPotentialScore,
        ...aiAnalysis,
      };
    } catch (error) {
      console.error('Territory analysis error:', error);
      // Return fallback analysis
      return this.getFallbackAnalysis(location, franchiseIndustry);
    }
  }

  /**
   * Get AI-powered territory analysis
   */
  private static async getAITerritoryAnalysis(
    city: string,
    state: string,
    industry: string,
    brand?: string
  ): Promise<Omit<TerritoryAnalysis, 'location' | 'city' | 'state' | 'viabilityScore' | 'viabilityLevel' | 'demographicScore' | 'economicScore' | 'competitionScore' | 'marketPotentialScore'>> {
    const prompt = `As a franchise territory analyst, provide a comprehensive analysis for opening a ${brand || industry} franchise in ${city}, ${state}, India.

Analyze the following aspects and provide data in EXACT JSON format (no markdown):

{
  "demographics": {
    "population": <number>,
    "medianAge": <number>,
    "medianIncome": <number in rupees>,
    "householdSize": <number>,
    "educationLevel": "<description>",
    "employmentRate": <percentage as number>
  },
  "economicIndicators": {
    "gdpGrowth": <percentage as number>,
    "unemploymentRate": <percentage as number>,
    "businessGrowth": <percentage as number>,
    "disposableIncome": <number in rupees>
  },
  "competitionAnalysis": {
    "directCompetitors": <number>,
    "indirectCompetitors": <number>,
    "marketSaturation": "<Low|Medium|High>",
    "competitiveAdvantages": ["advantage 1", "advantage 2", "advantage 3"],
    "competitiveChallenges": ["challenge 1", "challenge 2"]
  },
  "marketPotential": {
    "estimatedCustomerBase": <number>,
    "projectedRevenue": {
      "year1": <number>,
      "year3": <number>,
      "year5": <number>
    },
    "growthPotential": "<High|Medium|Low>",
    "seasonality": "<description of seasonal patterns>"
  },
  "risks": ["risk 1", "risk 2", "risk 3"],
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "estimatedROI": <percentage as number>,
  "breakEvenMonths": <number>
}

Focus on Indian market data and conditions. Be realistic and data-driven.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error('AI territory analysis error:', error);
      throw error;
    }
  }

  /**
   * Calculate demographic score
   */
  private static calculateDemographicScore(demographics: TerritoryAnalysis['demographics']): number {
    let score = 0;

    // Population score (30 points)
    if (demographics.population >= 2000000) score += 30;
    else if (demographics.population >= 1000000) score += 25;
    else if (demographics.population >= 500000) score += 20;
    else if (demographics.population >= 200000) score += 15;
    else score += 10;

    // Median income score (30 points)
    if (demographics.medianIncome >= 600000) score += 30;
    else if (demographics.medianIncome >= 400000) score += 25;
    else if (demographics.medianIncome >= 300000) score += 20;
    else if (demographics.medianIncome >= 200000) score += 15;
    else score += 10;

    // Employment rate score (20 points)
    if (demographics.employmentRate >= 95) score += 20;
    else if (demographics.employmentRate >= 90) score += 15;
    else if (demographics.employmentRate >= 85) score += 10;
    else score += 5;

    // Education level (20 points)
    const eduLevel = demographics.educationLevel.toLowerCase();
    if (eduLevel.includes('high') || eduLevel.includes('graduate')) score += 20;
    else if (eduLevel.includes('college') || eduLevel.includes('bachelor')) score += 15;
    else score += 10;

    return Math.min(100, score);
  }

  /**
   * Calculate economic score
   */
  private static calculateEconomicScore(economic: TerritoryAnalysis['economicIndicators']): number {
    let score = 0;

    // GDP growth (30 points)
    if (economic.gdpGrowth >= 8) score += 30;
    else if (economic.gdpGrowth >= 6) score += 25;
    else if (economic.gdpGrowth >= 4) score += 20;
    else if (economic.gdpGrowth >= 2) score += 15;
    else score += 10;

    // Unemployment rate (25 points) - lower is better
    if (economic.unemploymentRate <= 3) score += 25;
    else if (economic.unemploymentRate <= 5) score += 20;
    else if (economic.unemploymentRate <= 7) score += 15;
    else if (economic.unemploymentRate <= 10) score += 10;
    else score += 5;

    // Business growth (25 points)
    if (economic.businessGrowth >= 15) score += 25;
    else if (economic.businessGrowth >= 10) score += 20;
    else if (economic.businessGrowth >= 5) score += 15;
    else score += 10;

    // Disposable income (20 points)
    if (economic.disposableIncome >= 200000) score += 20;
    else if (economic.disposableIncome >= 150000) score += 15;
    else if (economic.disposableIncome >= 100000) score += 10;
    else score += 5;

    return Math.min(100, score);
  }

  /**
   * Calculate competition score
   */
  private static calculateCompetitionScore(competition: TerritoryAnalysis['competitionAnalysis']): number {
    let score = 50; // Base score

    // Market saturation (40 points) - lower competition is better
    switch (competition.marketSaturation) {
      case 'Low':
        score += 40;
        break;
      case 'Medium':
        score += 25;
        break;
      case 'High':
        score += 10;
        break;
    }

    // Direct competitors (20 points) - fewer is better
    if (competition.directCompetitors <= 3) score += 20;
    else if (competition.directCompetitors <= 5) score += 15;
    else if (competition.directCompetitors <= 10) score += 10;
    else score += 5;

    // Competitive advantages (20 points)
    score += Math.min(20, competition.competitiveAdvantages.length * 5);

    // Competitive challenges penalty (up to -20 points)
    score -= Math.min(20, competition.competitiveChallenges.length * 5);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate market potential score
   */
  private static calculateMarketPotentialScore(market: TerritoryAnalysis['marketPotential']): number {
    let score = 0;

    // Growth potential (40 points)
    switch (market.growthPotential) {
      case 'High':
        score += 40;
        break;
      case 'Medium':
        score += 25;
        break;
      case 'Low':
        score += 15;
        break;
    }

    // Customer base (30 points)
    if (market.estimatedCustomerBase >= 100000) score += 30;
    else if (market.estimatedCustomerBase >= 50000) score += 25;
    else if (market.estimatedCustomerBase >= 25000) score += 20;
    else if (market.estimatedCustomerBase >= 10000) score += 15;
    else score += 10;

    // Revenue growth trajectory (30 points)
    const year1 = market.projectedRevenue.year1;
    const year5 = market.projectedRevenue.year5;
    if (year5 > 0 && year1 > 0) {
      const growthRate = ((year5 - year1) / year1) * 100;
      if (growthRate >= 150) score += 30;
      else if (growthRate >= 100) score += 25;
      else if (growthRate >= 50) score += 20;
      else score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Get viability level
   */
  private static getViabilityLevel(score: number): TerritoryAnalysis['viabilityLevel'] {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 45) return 'Fair';
    return 'Poor';
  }

  /**
   * Parse location string
   */
  private static parseLocation(location: string): [string, string] {
    const parts = location.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      return [parts[0], parts[1]];
    }
    return [location, 'India'];
  }

  /**
   * Compare multiple territories
   */
  static async compareTerritories(
    locations: string[],
    franchiseIndustry: string,
    franchiseBrand?: string
  ): Promise<TerritoryComparison> {
    const territories: TerritoryAnalysis[] = [];

    for (const location of locations) {
      const analysis = await this.analyzeTerritory(location, franchiseIndustry, franchiseBrand);
      territories.push(analysis);
    }

    // Sort by viability score
    territories.sort((a, b) => b.viabilityScore - a.viabilityScore);

    const bestTerritory = territories[0];

    const ranking = territories.map((t, index) => ({
      location: t.location,
      score: t.viabilityScore,
      reason: index === 0
        ? `Best choice: ${t.viabilityLevel} viability with ${t.estimatedROI}% estimated ROI`
        : `${t.viabilityLevel} viability, ranks #${index + 1} overall`,
    }));

    const summary = await this.generateComparisonSummary(territories, franchiseIndustry);

    return {
      territories,
      bestTerritory,
      ranking,
      summary,
    };
  }

  /**
   * Generate comparison summary using AI
   */
  private static async generateComparisonSummary(
    territories: TerritoryAnalysis[],
    industry: string
  ): Promise<string> {
    const prompt = `Summarize this territory comparison for a ${industry} franchise in 2-3 sentences:

${territories.map((t, i) => `
${i + 1}. ${t.location}: ${t.viabilityScore}/100 viability score
   - Demographics: ${t.demographicScore}/100
   - Economics: ${t.economicScore}/100
   - Competition: ${t.competitionScore}/100
   - Market Potential: ${t.marketPotentialScore}/100
`).join('\n')}

Provide ONLY the summary text (no JSON, no markdown):`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      return `Analyzed ${territories.length} territories for ${industry} franchise. ${territories[0].location} shows the strongest potential with a ${territories[0].viabilityScore}/100 viability score.`;
    }
  }

  /**
   * Fallback analysis when AI fails
   */
  private static getFallbackAnalysis(location: string, industry: string): TerritoryAnalysis {
    const [city, state] = this.parseLocation(location);

    return {
      location,
      city,
      state,
      viabilityScore: 65,
      viabilityLevel: 'Good',
      demographicScore: 65,
      economicScore: 70,
      competitionScore: 60,
      marketPotentialScore: 65,
      demographics: {
        population: 1000000,
        medianAge: 32,
        medianIncome: 400000,
        householdSize: 4,
        educationLevel: 'College educated',
        employmentRate: 92,
      },
      economicIndicators: {
        gdpGrowth: 6.5,
        unemploymentRate: 5.2,
        businessGrowth: 8,
        disposableIncome: 150000,
      },
      competitionAnalysis: {
        directCompetitors: 5,
        indirectCompetitors: 15,
        marketSaturation: 'Medium',
        competitiveAdvantages: [
          'Growing market',
          'Strong brand recognition potential',
        ],
        competitiveChallenges: [
          'Existing competition',
        ],
      },
      marketPotential: {
        estimatedCustomerBase: 50000,
        projectedRevenue: {
          year1: 5000000,
          year3: 8000000,
          year5: 12000000,
        },
        growthPotential: 'Medium',
        seasonality: 'Moderate seasonal variation',
      },
      risks: [
        'Market competition',
        'Economic fluctuations',
      ],
      opportunities: [
        'Growing demographics',
        'Increasing disposable income',
      ],
      recommendations: [
        `Conduct detailed market research in ${city}`,
        'Visit existing franchises in the area',
        'Analyze local consumer behavior',
      ],
      estimatedROI: 18,
      breakEvenMonths: 18,
    };
  }

  /**
   * Get territory recommendations for a franchise
   */
  static async getTopTerritories(
    franchiseIndustry: string,
    franchiseBrand: string,
    country: string = 'India',
    limit: number = 10
  ): Promise<TerritoryAnalysis[]> {
    // Major Indian cities for analysis
    const topCities = [
      'Mumbai, Maharashtra',
      'Delhi, NCR',
      'Bangalore, Karnataka',
      'Hyderabad, Telangana',
      'Chennai, Tamil Nadu',
      'Kolkata, West Bengal',
      'Pune, Maharashtra',
      'Ahmedabad, Gujarat',
      'Jaipur, Rajasthan',
      'Surat, Gujarat',
      'Lucknow, Uttar Pradesh',
      'Chandigarh, Punjab',
      'Indore, Madhya Pradesh',
      'Kochi, Kerala',
      'Coimbatore, Tamil Nadu',
    ];

    const territories: TerritoryAnalysis[] = [];

    for (const city of topCities.slice(0, limit)) {
      const analysis = await this.analyzeTerritory(city, franchiseIndustry, franchiseBrand);
      territories.push(analysis);
    }

    // Sort by viability score
    return territories.sort((a, b) => b.viabilityScore - a.viabilityScore);
  }
}
