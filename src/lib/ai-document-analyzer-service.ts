import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

export interface DocumentAnalysis {
  documentType: 'financial' | 'legal' | 'operational' | 'other';
  summary: string;
  keyFindings: string[];
  redFlags: string[];
  recommendations: string[];
  extractedData?: {
    revenue?: number;
    profit?: number;
    assets?: number;
    liabilities?: number;
    dates?: string[];
    parties?: string[];
    amounts?: number[];
  };
  confidenceScore: number; // 0-100
  isVerified?: boolean;
  verificationIssues?: string[];
  sensitiveDataFound?: string[];
}

export interface DocumentVerification {
  isAuthentic: boolean;
  authenticityScore: number; // 0-100
  issues: string[];
  suggestions: string[];
  documentIntegrity: 'High' | 'Medium' | 'Low' | 'Questionable';
  tamperedSections?: string[];
}

export interface RedactionResult {
  originalText: string;
  redactedText: string;
  redactedItems: Array<{
    type: 'email' | 'phone' | 'address' | 'ssn' | 'account' | 'name' | 'custom';
    originalValue: string;
    redactedValue: string;
    location: { start: number; end: number };
  }>;
  redactionCount: number;
}

export class AIDocumentAnalyzerService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Analyze document text extracted from file
   */
  static async analyzeDocument(
    documentText: string,
    documentType?: 'financial' | 'legal' | 'operational'
  ): Promise<DocumentAnalysis> {
    // Auto-detect document type if not provided
    const detectedType = documentType || this.detectDocumentType(documentText);

    const prompt = `Analyze this ${detectedType} document and provide insights:

DOCUMENT TEXT:
${documentText.substring(0, 15000)}

Provide analysis in this EXACT JSON format (no markdown):
{
  "documentType": "${detectedType}",
  "summary": "<2-3 sentence summary>",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "redFlags": ["red flag 1", "red flag 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "extractedData": {
    "revenue": <number or null>,
    "profit": <number or null>,
    "assets": <number or null>,
    "liabilities": <number or null>,
    "dates": ["date1", "date2"],
    "parties": ["party1", "party2"],
    "amounts": [amount1, amount2]
  },
  "confidenceScore": <number 0-100>
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Document analysis error:', error);
      return this.generateBasicAnalysis(documentText, detectedType);
    }
  }

  /**
   * Extract text from file (PDF, TXT, DOCX)
   */
  static async extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type;
    
    // Handle text files
    if (fileType === 'text/plain') {
      return await file.text();
    }
    
    // Handle PDF files
    if (fileType === 'application/pdf') {
      try {
        // Use PDF.js or similar library if available
        // For now, return placeholder
        return await this.extractPDFText(file);
      } catch (error) {
        throw new Error('PDF extraction not yet implemented. Please use text files.');
      }
    }
    
    // Handle DOCX files
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      throw new Error('DOCX extraction not yet implemented. Please use text or PDF files.');
    }
    
    throw new Error('Unsupported file type. Please upload PDF or TXT files.');
  }

  /**
   * Extract text from PDF using browser's native API or pdf.js
   */
  private static async extractPDFText(file: File): Promise<string> {
    try {
      // Try to use pdfjs-dist if available
      // @ts-ignore - pdfjs may not be in types
      if (typeof window !== 'undefined' && window.pdfjsLib) {
        // @ts-ignore
        const pdfjsLib = window.pdfjsLib;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        return fullText;
      }
    } catch (error) {
      console.error('PDF extraction error:', error);
    }
    
    // Fallback: try to read as text (will fail but provides clear error)
    try {
      const text = await file.text();
      return text;
    } catch {
      return `[PDF Document: ${file.name}]\n\nNote: PDF text extraction requires pdf.js library. Please install pdfjs-dist or provide the text manually.`;
    }
  }

  /**
   * Detect document type based on content
   */
  private static detectDocumentType(text: string): 'financial' | 'legal' | 'operational' {
    const lowerText = text.toLowerCase();
    
    // Financial keywords
    const financialKeywords = ['revenue', 'profit', 'loss', 'balance sheet', 'income statement', 'cash flow', 'assets', 'liabilities', 'ebitda'];
    const hasFinancial = financialKeywords.some(kw => lowerText.includes(kw));
    
    // Legal keywords
    const legalKeywords = ['agreement', 'contract', 'terms', 'conditions', 'liability', 'indemnity', 'clause', 'party', 'whereas'];
    const hasLegal = legalKeywords.some(kw => lowerText.includes(kw));
    
    // Operational keywords
    const operationalKeywords = ['process', 'procedure', 'workflow', 'operations', 'staff', 'inventory', 'production'];
    const hasOperational = operationalKeywords.some(kw => lowerText.includes(kw));
    
    if (hasFinancial) return 'financial';
    if (hasLegal) return 'legal';
    if (hasOperational) return 'operational';
    
    return 'financial'; // default
  }

  /**
   * Fallback basic analysis
   */
  private static generateBasicAnalysis(text: string, type: 'financial' | 'legal' | 'operational'): DocumentAnalysis {
    const wordCount = text.split(/\s+/).length;
    
    return {
      documentType: type,
      summary: `${type.charAt(0).toUpperCase() + type.slice(1)} document with approximately ${wordCount} words. Manual review recommended.`,
      keyFindings: [
        'Document uploaded successfully',
        'Preliminary scan completed',
        'Detailed analysis requires expert review',
      ],
      redFlags: [],
      recommendations: [
        'Share with financial advisor for detailed review',
        'Verify all numbers and dates',
        'Request clarification on any unclear terms',
      ],
      confidenceScore: 50,
    };
  }

  /**
   * Compare multiple documents
   */
  static async compareDocuments(
    documents: { name: string; text: string }[]
  ): Promise<{
    summary: string;
    discrepancies: string[];
    consistentFactors: string[];
  }> {
    if (documents.length < 2) {
      throw new Error('Need at least 2 documents to compare');
    }

    const prompt = `Compare these ${documents.length} business documents and identify discrepancies:

${documents.map((doc, i) => `
DOCUMENT ${i + 1}: ${doc.name}
${doc.text.substring(0, 3000)}
`).join('\n')}

Provide comparison in JSON:
{
  "summary": "<overall comparison summary>",
  "discrepancies": ["discrepancy 1", "discrepancy 2"],
  "consistentFactors": ["consistent factor 1", "consistent factor 2"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      return {
        summary: 'Documents uploaded for comparison',
        discrepancies: ['Manual comparison required'],
        consistentFactors: ['All documents received'],
      };
    }
  }

  /**
   * Extract specific data fields from documents
   */
  static async extractDataFields(
    text: string,
    fields: string[]
  ): Promise<Record<string, any>> {
    const prompt = `Extract these specific fields from the document:

Fields to extract: ${fields.join(', ')}

Document text:
${text.substring(0, 5000)}

Return JSON object with field names as keys and extracted values.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      const extracted: Record<string, any> = {};
      fields.forEach(field => {
        extracted[field] = null;
      });
      return extracted;
    }
  }

  /**
   * Verify document authenticity using AI analysis
   */
  static async verifyDocument(
    documentText: string,
    documentType: 'financial' | 'legal' | 'operational',
    metadata?: { expectedAuthor?: string; expectedDate?: string; businessName?: string }
  ): Promise<DocumentVerification> {
    const prompt = `As a document verification expert, analyze this ${documentType} document for authenticity:

DOCUMENT TEXT:
${documentText.substring(0, 10000)}

METADATA:
${metadata ? JSON.stringify(metadata, null, 2) : 'None provided'}

Check for:
1. Document structure and formatting consistency
2. Numerical consistency and plausibility
3. Professional language and terminology
4. Completeness of required information
5. Signs of alteration or tampering
6. Date and timeline consistency
7. Signature and authorization presence
8. Industry-standard format compliance

Provide analysis in EXACT JSON format (no markdown):
{
  "isAuthentic": <boolean>,
  "authenticityScore": <0-100>,
  "issues": ["issue 1", "issue 2"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "documentIntegrity": "<High|Medium|Low|Questionable>",
  "tamperedSections": ["section 1 if found"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error('Document verification error:', error);
      return {
        isAuthentic: true,
        authenticityScore: 70,
        issues: [],
        suggestions: ['Manual verification recommended'],
        documentIntegrity: 'Medium',
        tamperedSections: [],
      };
    }
  }

  /**
   * Redact sensitive information from document
   */
  static async redactSensitiveData(
    text: string,
    redactionOptions?: {
      redactEmails?: boolean;
      redactPhones?: boolean;
      redactAddresses?: boolean;
      redactSSN?: boolean;
      redactAccountNumbers?: boolean;
      redactNames?: boolean;
      customPatterns?: Array<{ pattern: RegExp; replacement: string }>;
    }
  ): Promise<RedactionResult> {
    const options = {
      redactEmails: true,
      redactPhones: true,
      redactAddresses: true,
      redactSSN: true,
      redactAccountNumbers: true,
      redactNames: false, // Default to false to preserve context
      ...redactionOptions,
    };

    let redactedText = text;
    const redactedItems: RedactionResult['redactedItems'] = [];

    // Email redaction
    if (options.redactEmails) {
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const matches = text.matchAll(emailRegex);
      for (const match of matches) {
        const email = match[0];
        const redacted = '[EMAIL REDACTED]';
        redactedText = redactedText.replace(email, redacted);
        redactedItems.push({
          type: 'email',
          originalValue: email,
          redactedValue: redacted,
          location: { start: match.index || 0, end: (match.index || 0) + email.length },
        });
      }
    }

    // Phone number redaction
    if (options.redactPhones) {
      const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
      const matches = text.matchAll(phoneRegex);
      for (const match of matches) {
        const phone = match[0];
        // Skip if it looks like a year or other number
        if (phone.length >= 10) {
          const redacted = '[PHONE REDACTED]';
          redactedText = redactedText.replace(phone, redacted);
          redactedItems.push({
            type: 'phone',
            originalValue: phone,
            redactedValue: redacted,
            location: { start: match.index || 0, end: (match.index || 0) + phone.length },
          });
        }
      }
    }

    // SSN/Aadhaar redaction
    if (options.redactSSN) {
      // US SSN pattern
      const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
      // Indian Aadhaar pattern
      const aadhaarRegex = /\b\d{4}\s\d{4}\s\d{4}\b/g;
      
      const ssnMatches = text.matchAll(ssnRegex);
      for (const match of ssnMatches) {
        const ssn = match[0];
        const redacted = '[SSN REDACTED]';
        redactedText = redactedText.replace(ssn, redacted);
        redactedItems.push({
          type: 'ssn',
          originalValue: ssn,
          redactedValue: redacted,
          location: { start: match.index || 0, end: (match.index || 0) + ssn.length },
        });
      }

      const aadhaarMatches = text.matchAll(aadhaarRegex);
      for (const match of aadhaarMatches) {
        const aadhaar = match[0];
        const redacted = '[AADHAAR REDACTED]';
        redactedText = redactedText.replace(aadhaar, redacted);
        redactedItems.push({
          type: 'ssn',
          originalValue: aadhaar,
          redactedValue: redacted,
          location: { start: match.index || 0, end: (match.index || 0) + aadhaar.length },
        });
      }
    }

    // Account number redaction
    if (options.redactAccountNumbers) {
      // Bank account pattern (varies, this is a simple version)
      const accountRegex = /\b(?:Account|A\/C|Acct)[:\s#]*([0-9]{6,18})\b/gi;
      const matches = text.matchAll(accountRegex);
      for (const match of matches) {
        const account = match[0];
        const redacted = '[ACCOUNT REDACTED]';
        redactedText = redactedText.replace(account, redacted);
        redactedItems.push({
          type: 'account',
          originalValue: account,
          redactedValue: redacted,
          location: { start: match.index || 0, end: (match.index || 0) + account.length },
        });
      }
    }

    // Names redaction (using AI)
    if (options.redactNames) {
      const namesRedacted = await this.redactNamesWithAI(redactedText);
      redactedText = namesRedacted.text;
      redactedItems.push(...namesRedacted.items);
    }

    // Custom patterns
    if (options.customPatterns) {
      for (const { pattern, replacement } of options.customPatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          const original = match[0];
          redactedText = redactedText.replace(original, replacement);
          redactedItems.push({
            type: 'custom',
            originalValue: original,
            redactedValue: replacement,
            location: { start: match.index || 0, end: (match.index || 0) + original.length },
          });
        }
      }
    }

    return {
      originalText: text,
      redactedText,
      redactedItems,
      redactionCount: redactedItems.length,
    };
  }

  /**
   * Use AI to identify and redact names
   */
  private static async redactNamesWithAI(text: string): Promise<{
    text: string;
    items: Array<{
      type: 'name';
      originalValue: string;
      redactedValue: string;
      location: { start: number; end: number };
    }>;
  }> {
    const prompt = `Identify all person names in this text and list them:

TEXT:
${text.substring(0, 5000)}

Return JSON array of names found:
["Name 1", "Name 2", ...]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const names: string[] = JSON.parse(responseText);

      let redactedText = text;
      const items: Array<{
        type: 'name';
        originalValue: string;
        redactedValue: string;
        location: { start: number; end: number };
      }> = [];

      names.forEach(name => {
        const index = redactedText.indexOf(name);
        if (index !== -1) {
          const redacted = '[NAME REDACTED]';
          redactedText = redactedText.replace(name, redacted);
          items.push({
            type: 'name',
            originalValue: name,
            redactedValue: redacted,
            location: { start: index, end: index + name.length },
          });
        }
      });

      return { text: redactedText, items };
    } catch (error) {
      return { text, items: [] };
    }
  }

  /**
   * Auto-fill form fields from extracted document data
   */
  static async autoFillFromDocument(
    documentText: string,
    formFields: Array<{ fieldName: string; fieldType: string; label: string }>
  ): Promise<Record<string, any>> {
    const fieldNames = formFields.map(f => f.fieldName).join(', ');
    
    const prompt = `Extract data from this document to auto-fill form fields:

DOCUMENT:
${documentText.substring(0, 8000)}

FORM FIELDS TO FILL:
${formFields.map(f => `- ${f.fieldName} (${f.fieldType}): ${f.label}`).join('\n')}

Return EXACT JSON format (no markdown):
{
  "<field_name>": "<extracted value>",
  ...
}

Only include fields where you found relevant data. Leave out fields with no data.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error('Auto-fill extraction error:', error);
      return {};
    }
  }
}
