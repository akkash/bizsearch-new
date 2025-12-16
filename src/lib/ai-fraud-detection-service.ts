import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

export interface FraudAnalysis {
  fraudRiskScore: number; // 0-100, higher = more suspicious
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  isSuspicious: boolean;
  redFlags: {
    type: 'financial' | 'behavioral' | 'content' | 'pattern';
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
  }[];
  recommendation: string;
  confidence: number;
}

export class AIFraudDetectionService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Analyze business listing for potential fraud
   */
  static async analyzeListing(listingData: {
    name: string;
    description: string;
    price: number;
    revenue?: number;
    profit?: number;
    established_year?: number;
    contact_email?: string;
    contact_phone?: string;
    images?: string[];
    seller_id: string;
  }): Promise<FraudAnalysis> {
    // Check for obvious red flags
    const basicRedFlags = this.checkBasicRedFlags(listingData);

    // Use AI for deep analysis
    const prompt = `Analyze this business listing for potential fraud indicators:

Business Name: ${listingData.name}
Description: ${listingData.description}
Asking Price: ₹${listingData.price.toLocaleString()}
Annual Revenue: ${listingData.revenue ? `₹${listingData.revenue.toLocaleString()}` : 'Not disclosed'}
Annual Profit: ${listingData.profit ? `₹${listingData.profit.toLocaleString()}` : 'Not disclosed'}
Years in Business: ${listingData.established_year ? new Date().getFullYear() - listingData.established_year : 'Not specified'}
Images: ${listingData.images?.length || 0} photos
Contact: ${listingData.contact_email || 'N/A'}

Look for:
1. Unrealistic financial claims
2. Too-good-to-be-true pricing
3. Vague or generic descriptions
4. Inconsistent information
5. Suspicious language patterns
6. Missing critical details

Provide analysis in JSON format (no markdown):
{
  "fraudRiskScore": <number 0-100>,
  "riskLevel": "<Low|Medium|High|Critical>",
  "isSuspicious": <boolean>,
  "redFlags": [
    {
      "type": "<financial|behavioral|content|pattern>",
      "description": "Description of red flag",
      "severity": "<Low|Medium|High|Critical>"
    }
  ],
  "recommendation": "Action recommendation",
  "confidence": <number 0-100>
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const aiAnalysis = JSON.parse(text);

      // Combine AI analysis with basic red flags
      return {
        ...aiAnalysis,
        redFlags: [...basicRedFlags, ...aiAnalysis.redFlags],
        fraudRiskScore: Math.max(
          aiAnalysis.fraudRiskScore,
          basicRedFlags.length > 0 ? 60 : 0
        ),
      };
    } catch (error) {
      console.error('Fraud detection error:', error);
      return this.generateBasicAnalysis(listingData, basicRedFlags);
    }
  }

  /**
   * Check for basic red flags
   */
  private static checkBasicRedFlags(listing: any): FraudAnalysis['redFlags'] {
    const redFlags: FraudAnalysis['redFlags'] = [];

    // Check price-to-revenue ratio
    if (listing.revenue && listing.price) {
      const ratio = listing.price / listing.revenue;
      if (ratio > 10) {
        redFlags.push({
          type: 'financial',
          description: `Price-to-revenue ratio is extremely high (${ratio.toFixed(1)}x). Typical ratios are 1-5x.`,
          severity: 'High',
        });
      }
      if (ratio < 0.5) {
        redFlags.push({
          type: 'financial',
          description: `Price seems too low compared to revenue. May be misrepresented.`,
          severity: 'Medium',
        });
      }
    }

    // Check profit margin
    if (listing.revenue && listing.profit) {
      const margin = (listing.profit / listing.revenue) * 100;
      if (margin > 50) {
        redFlags.push({
          type: 'financial',
          description: `Profit margin of ${margin.toFixed(1)}% is unusually high. Verify financial claims.`,
          severity: 'High',
        });
      }
      if (margin < 0) {
        redFlags.push({
          type: 'financial',
          description: 'Business is reporting losses. Understand the reason before proceeding.',
          severity: 'Medium',
        });
      }
    }

    // Check for missing critical information
    if (!listing.contact_email && !listing.contact_phone) {
      redFlags.push({
        type: 'content',
        description: 'No contact information provided. This is highly suspicious.',
        severity: 'Critical',
      });
    }

    if (!listing.images || listing.images.length === 0) {
      redFlags.push({
        type: 'content',
        description: 'No photos provided. Legitimate listings usually include photos.',
        severity: 'Medium',
      });
    }

    // Check description length
    if (listing.description && listing.description.length < 100) {
      redFlags.push({
        type: 'content',
        description: 'Very short description. Legitimate listings provide detailed information.',
        severity: 'Low',
      });
    }

    // Check for too many capital letters (SPAM indicator)
    if (listing.description) {
      const caps = (listing.description.match(/[A-Z]/g) || []).length;
      const total = listing.description.length;
      if (caps / total > 0.3) {
        redFlags.push({
          type: 'pattern',
          description: 'Excessive use of capital letters (spam indicator).',
          severity: 'Medium',
        });
      }
    }

    return redFlags;
  }

  /**
   * Generate basic fraud analysis
   */
  private static generateBasicAnalysis(
    listing: any,
    redFlags: FraudAnalysis['redFlags']
  ): FraudAnalysis {
    const criticalCount = redFlags.filter(f => f.severity === 'Critical').length;
    const highCount = redFlags.filter(f => f.severity === 'High').length;

    const fraudRiskScore = Math.min(100, redFlags.length * 15 + criticalCount * 30);
    
    let riskLevel: FraudAnalysis['riskLevel'] = 'Low';
    if (fraudRiskScore >= 75 || criticalCount > 0) riskLevel = 'Critical';
    else if (fraudRiskScore >= 50 || highCount > 0) riskLevel = 'High';
    else if (fraudRiskScore >= 30) riskLevel = 'Medium';

    return {
      fraudRiskScore,
      riskLevel,
      isSuspicious: fraudRiskScore >= 50,
      redFlags,
      recommendation: fraudRiskScore >= 75
        ? 'Do not proceed. This listing shows multiple critical fraud indicators.'
        : fraudRiskScore >= 50
        ? 'Proceed with extreme caution. Verify all claims before contacting seller.'
        : fraudRiskScore >= 30
        ? 'Some concerns identified. Request additional verification documents.'
        : 'No major concerns detected. Conduct standard due diligence.',
      confidence: 75,
    };
  }

  /**
   * Analyze seller credibility
   */
  static async analyzeSellerCredibility(sellerId: string): Promise<{
    credibilityScore: number;
    findings: string[];
    warnings: string[];
  }> {
    try {
      // Get seller's listings count
      const { data: listings, error: listingsError } = await supabase
        .from('businesses')
        .select('id, created_at, price, status')
        .eq('seller_id', sellerId);

      if (listingsError) throw listingsError;

      // Get seller profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sellerId)
        .single();

      if (profileError) throw profileError;

      const findings: string[] = [];
      const warnings: string[] = [];
      let score = 50; // Start at neutral

      // Check account age
      const accountAge = profile.created_at
        ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      if (accountAge > 180) {
        score += 20;
        findings.push(`Account age: ${Math.floor(accountAge / 30)} months (established user)`);
      } else if (accountAge < 30) {
        score -= 15;
        warnings.push('New account (less than 1 month old)');
      }

      // Check number of active listings
      const activeListings = listings?.filter(l => l.status === 'active').length || 0;
      if (activeListings > 5) {
        warnings.push(`${activeListings} active listings. May be a broker or dealer.`);
      } else if (activeListings === 1) {
        score += 10;
        findings.push('Single active listing (typical for individual seller)');
      }

      // Check if profile is complete
      if (profile.display_name && profile.email) {
        score += 10;
        findings.push('Complete profile information');
      }

      // Check for verified badge (if exists in your schema)
      if (profile.verified) {
        score += 20;
        findings.push('Verified account');
      }

      return {
        credibilityScore: Math.min(100, Math.max(0, score)),
        findings,
        warnings,
      };
    } catch (error) {
      return {
        credibilityScore: 50,
        findings: ['Unable to verify seller information'],
        warnings: ['Seller verification failed. Proceed with caution.'],
      };
    }
  }

  /**
   * Detect duplicate or copied listings
   */
  static async detectDuplicateListing(listingData: {
    name: string;
    description: string;
  }): Promise<{
    isDuplicate: boolean;
    similarListings: any[];
    similarityScore: number;
  }> {
    try {
      // Search for similar listings
      const { data: similarListings, error } = await supabase
        .from('businesses')
        .select('id, name, description, price')
        .neq('name', listingData.name)
        .limit(20);

      if (error) throw error;

      // Use AI to check for content similarity
      if (similarListings && similarListings.length > 0) {
        const prompt = `Compare this listing with others to detect plagiarism:

NEW LISTING:
Name: ${listingData.name}
Description: ${listingData.description.substring(0, 500)}

EXISTING LISTINGS:
${similarListings.slice(0, 5).map((l, i) => `
${i + 1}. ${l.name}
${l.description?.substring(0, 300)}
`).join('\n')}

Return JSON:
{
  "isDuplicate": <boolean>,
  "similarityScore": <number 0-100>,
  "matchedListingIndex": <number or null>
}`;

        try {
          const result = await this.model.generateContent(prompt);
          const response = await result.response;
          const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const analysis = JSON.parse(text);

          return {
            isDuplicate: analysis.isDuplicate,
            similarListings: analysis.matchedListingIndex !== null
              ? [similarListings[analysis.matchedListingIndex]]
              : [],
            similarityScore: analysis.similarityScore,
          };
        } catch (aiError) {
          return { isDuplicate: false, similarListings: [], similarityScore: 0 };
        }
      }

      return { isDuplicate: false, similarListings: [], similarityScore: 0 };
    } catch (error) {
      return { isDuplicate: false, similarListings: [], similarityScore: 0 };
    }
  }

  /**
   * Verify contact information
   */
  static async verifyContactInfo(email?: string, phone?: string): Promise<{
    emailValid: boolean;
    phoneValid: boolean;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    let emailValid = true;
    let phoneValid = true;

    // Basic email validation
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      emailValid = emailRegex.test(email);
      
      if (!emailValid) {
        warnings.push('Email format appears invalid');
      }
      
      // Check for disposable email domains
      const disposableDomains = ['tempmail', 'guerrillamail', '10minutemail', 'throwaway'];
      if (disposableDomains.some(domain => email.toLowerCase().includes(domain))) {
        warnings.push('Disposable email detected (red flag)');
        emailValid = false;
      }
    }

    // Basic phone validation (Indian numbers)
    if (phone) {
      const phoneDigits = phone.replace(/\D/g, '');
      phoneValid = phoneDigits.length >= 10 && phoneDigits.length <= 13;
      
      if (!phoneValid) {
        warnings.push('Phone number format appears invalid');
      }
    }

    return { emailValid, phoneValid, warnings };
  }
}
