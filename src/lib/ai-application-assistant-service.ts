import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

export interface ApplicationField {
  fieldName: string;
  fieldType: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'textarea';
  label: string;
  required: boolean;
  currentValue?: any;
  suggestedValue?: any;
  confidence?: number; // 0-100
  source?: 'profile' | 'documents' | 'ai-inference';
  validationStatus?: 'valid' | 'invalid' | 'needs-review';
  validationMessage?: string;
  helpText?: string;
}

export interface ApplicationAssistance {
  applicationId: string;
  completionPercentage: number;
  fields: ApplicationField[];
  missingRequiredFields: string[];
  suggestions: {
    field: string;
    suggestion: string;
    reason: string;
  }[];
  warnings: string[];
  estimatedTimeToComplete: number; // minutes
  nextSteps: string[];
}

export interface DocumentDataExtraction {
  documentType: string;
  extractedFields: Record<string, any>;
  confidence: number;
  fieldsFound: string[];
  fieldsMissing: string[];
}

export class AIApplicationAssistantService {
  private static model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  /**
   * Auto-fill franchise application from profile and documents
   */
  static async autofillApplication(
    applicationTemplate: ApplicationField[],
    userProfile: Record<string, any>,
    documents?: { type: string; content: string }[]
  ): Promise<ApplicationAssistance> {
    const filledFields: ApplicationField[] = [];
    const missingRequiredFields: string[] = [];
    const suggestions: ApplicationAssistance['suggestions'] = [];
    const warnings: string[] = [];

    // Extract data from documents first
    let documentData: Record<string, any> = {};
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        const extracted = await this.extractDataFromDocument(doc.content, doc.type);
        documentData = { ...documentData, ...extracted.extractedFields };
      }
    }

    // Process each field
    for (const field of applicationTemplate) {
      const processedField = await this.processField(
        field,
        userProfile,
        documentData
      );
      filledFields.push(processedField);

      if (field.required && !processedField.suggestedValue && !processedField.currentValue) {
        missingRequiredFields.push(field.fieldName);
      }

      // Add suggestion if we have a recommended value
      if (processedField.suggestedValue && processedField.confidence && processedField.confidence >= 70) {
        suggestions.push({
          field: field.fieldName,
          suggestion: String(processedField.suggestedValue),
          reason: `Extracted from ${processedField.source || 'your profile'} with ${processedField.confidence}% confidence`,
        });
      }
    }

    // Calculate completion percentage
    const totalFields = applicationTemplate.length;
    const completedFields = filledFields.filter(f => f.currentValue || f.suggestedValue).length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    // Generate warnings
    if (missingRequiredFields.length > 0) {
      warnings.push(`${missingRequiredFields.length} required fields still need your input`);
    }

    const lowConfidenceFields = filledFields.filter(f => f.confidence && f.confidence < 70).length;
    if (lowConfidenceFields > 0) {
      warnings.push(`${lowConfidenceFields} fields need manual verification`);
    }

    // Estimate time to complete
    const estimatedTimeToComplete = Math.max(5, missingRequiredFields.length * 2);

    // Generate next steps
    const nextSteps = await this.generateNextSteps(
      completionPercentage,
      missingRequiredFields,
      suggestions
    );

    return {
      applicationId: `app_${Date.now()}`,
      completionPercentage,
      fields: filledFields,
      missingRequiredFields,
      suggestions,
      warnings,
      estimatedTimeToComplete,
      nextSteps,
    };
  }

  /**
   * Process a single field with AI assistance
   */
  private static async processField(
    field: ApplicationField,
    profile: Record<string, any>,
    documentData: Record<string, any>
  ): Promise<ApplicationField> {
    let suggestedValue: any = null;
    let confidence = 0;
    let source: ApplicationField['source'] = 'profile';

    // Try to find value in profile (direct match)
    const profileKey = this.findMatchingKey(field.fieldName, profile);
    if (profileKey && profile[profileKey]) {
      suggestedValue = profile[profileKey];
      confidence = 95;
      source = 'profile';
    }

    // Try to find in documents
    if (!suggestedValue) {
      const docKey = this.findMatchingKey(field.fieldName, documentData);
      if (docKey && documentData[docKey]) {
        suggestedValue = documentData[docKey];
        confidence = 80;
        source = 'documents';
      }
    }

    // Use AI to infer value if still not found
    if (!suggestedValue && field.required) {
      const inferredValue = await this.inferFieldValue(field, profile, documentData);
      if (inferredValue) {
        suggestedValue = inferredValue.value;
        confidence = inferredValue.confidence;
        source = 'ai-inference';
      }
    }

    // Validate the suggested value
    const validationResult = this.validateField(field, suggestedValue);

    return {
      ...field,
      suggestedValue,
      confidence,
      source,
      validationStatus: validationResult.isValid ? 'valid' : 'needs-review',
      validationMessage: validationResult.message,
      helpText: this.generateHelpText(field),
    };
  }

  /**
   * Find matching key in object (fuzzy matching)
   */
  private static findMatchingKey(fieldName: string, data: Record<string, any>): string | null {
    const normalizedField = fieldName.toLowerCase().replace(/[_\s-]/g, '');

    for (const key of Object.keys(data)) {
      const normalizedKey = key.toLowerCase().replace(/[_\s-]/g, '');
      if (normalizedKey === normalizedField || normalizedKey.includes(normalizedField) || normalizedField.includes(normalizedKey)) {
        return key;
      }
    }

    return null;
  }

  /**
   * Infer field value using AI
   */
  private static async inferFieldValue(
    field: ApplicationField,
    profile: Record<string, any>,
    documentData: Record<string, any>
  ): Promise<{ value: any; confidence: number } | null> {
    const prompt = `Infer the value for this franchise application field based on available data:

FIELD TO FILL:
- Name: ${field.fieldName}
- Label: ${field.label}
- Type: ${field.fieldType}
- Help Text: ${field.helpText || 'Not provided'}

AVAILABLE DATA:
Profile: ${JSON.stringify(profile, null, 2)}
Documents: ${JSON.stringify(documentData, null, 2)}

If you can reasonably infer a value, provide it in this EXACT JSON format (no markdown):
{
  "value": "<the inferred value>",
  "confidence": <0-100>,
  "reasoning": "<why you think this is the correct value>"
}

If you cannot infer a reasonable value, return:
{
  "value": null,
  "confidence": 0,
  "reasoning": "Insufficient data to infer value"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(text);

      if (parsed.value && parsed.confidence >= 50) {
        return { value: parsed.value, confidence: parsed.confidence };
      }
      return null;
    } catch (error) {
      console.error('Field inference error:', error);
      return null;
    }
  }

  /**
   * Extract data from document
   */
  private static async extractDataFromDocument(
    documentText: string,
    documentType: string
  ): Promise<DocumentDataExtraction> {
    const prompt = `Extract structured data from this ${documentType} document for franchise application:

DOCUMENT TEXT:
${documentText.substring(0, 3000)}

Extract any of these fields if present:
- full_name / name
- email
- phone / mobile
- address / current_address
- date_of_birth / dob
- education / highest_education
- work_experience / experience_years
- current_occupation / job_title
- annual_income / salary
- liquid_capital / savings
- net_worth / total_assets
- credit_score
- business_experience
- management_experience
- references

Return data in EXACT JSON format (no markdown):
{
  "extractedFields": {
    "<field_name>": "<value>",
    ...
  },
  "confidence": <0-100>,
  "fieldsFound": ["field1", "field2"],
  "fieldsMissing": ["field3", "field4"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(text);

      return {
        documentType,
        extractedFields: parsed.extractedFields || {},
        confidence: parsed.confidence || 0,
        fieldsFound: parsed.fieldsFound || [],
        fieldsMissing: parsed.fieldsMissing || [],
      };
    } catch (error) {
      console.error('Document extraction error:', error);
      return {
        documentType,
        extractedFields: {},
        confidence: 0,
        fieldsFound: [],
        fieldsMissing: [],
      };
    }
  }

  /**
   * Validate field value
   */
  private static validateField(
    field: ApplicationField,
    value: any
  ): { isValid: boolean; message?: string } {
    if (field.required && !value) {
      return { isValid: false, message: 'This field is required' };
    }

    if (!value) {
      return { isValid: true };
    }

    switch (field.fieldType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          return { isValid: false, message: 'Invalid email format' };
        }
        break;

      case 'phone':
        const phoneRegex = /^[0-9]{10}$/;
        const cleaned = String(value).replace(/\D/g, '');
        if (!phoneRegex.test(cleaned)) {
          return { isValid: false, message: 'Invalid phone number (should be 10 digits)' };
        }
        break;

      case 'number':
        if (isNaN(Number(value))) {
          return { isValid: false, message: 'Must be a valid number' };
        }
        break;

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return { isValid: false, message: 'Invalid date format' };
        }
        break;
    }

    return { isValid: true, message: 'Valid' };
  }

  /**
   * Generate help text for field
   */
  private static generateHelpText(field: ApplicationField): string {
    const helpTexts: Record<string, string> = {
      full_name: 'Enter your full legal name as it appears on official documents',
      email: 'Enter a valid email address for communication',
      phone: 'Enter your 10-digit mobile number',
      liquid_capital: 'Amount of cash and easily convertible assets you have available',
      net_worth: 'Total assets minus total liabilities',
      business_experience: 'Describe your previous business ownership or management experience',
      why_franchise: 'Explain why you want to become a franchisee and your goals',
    };

    return field.helpText || helpTexts[field.fieldName] || `Enter your ${field.label.toLowerCase()}`;
  }

  /**
   * Generate next steps for completing application
   */
  private static async generateNextSteps(
    completionPercentage: number,
    missingFields: string[],
    suggestions: ApplicationAssistance['suggestions']
  ): Promise<string[]> {
    if (completionPercentage >= 90) {
      return [
        'Review all filled information for accuracy',
        'Accept suggested values that look correct',
        'Submit your application',
      ];
    }

    if (completionPercentage >= 60) {
      return [
        `Fill in the ${missingFields.length} remaining required fields`,
        'Review AI-suggested values and accept if correct',
        'Upload any missing documents',
        'Save draft and continue later if needed',
      ];
    }

    return [
      'Complete your profile to enable auto-fill',
      'Upload relevant documents (resume, financial statements)',
      `Fill in the ${missingFields.length} required fields`,
      'Accept AI suggestions to speed up the process',
    ];
  }

  /**
   * Smart form validation with AI feedback
   */
  static async validateCompleteApplication(
    fields: ApplicationField[]
  ): Promise<{
    isValid: boolean;
    errors: Array<{ field: string; error: string }>;
    warnings: Array<{ field: string; warning: string }>;
    suggestions: Array<{ field: string; suggestion: string }>;
    overallFeedback: string;
  }> {
    const errors: Array<{ field: string; error: string }> = [];
    const warnings: Array<{ field: string; warning: string }> = [];
    const suggestions: Array<{ field: string; suggestion: string }> = [];

    // Check each field
    for (const field of fields) {
      const value = field.currentValue || field.suggestedValue;

      // Required field check
      if (field.required && !value) {
        errors.push({
          field: field.fieldName,
          error: `${field.label} is required`,
        });
        continue;
      }

      // Validation check
      if (field.validationStatus === 'invalid') {
        errors.push({
          field: field.fieldName,
          error: field.validationMessage || 'Invalid value',
        });
      }

      // Low confidence warning
      if (value && field.confidence && field.confidence < 70) {
        warnings.push({
          field: field.fieldName,
          warning: 'Please verify this value is correct',
        });
      }
    }

    // Use AI for overall application review
    const overallFeedback = await this.getAIApplicationFeedback(fields, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      overallFeedback,
    };
  }

  /**
   * Get AI feedback on overall application
   */
  private static async getAIApplicationFeedback(
    fields: ApplicationField[],
    errors: Array<{ field: string; error: string }>,
    warnings: Array<{ field: string; warning: string }>
  ): Promise<string> {
    const filledFields = fields.filter(f => f.currentValue || f.suggestedValue);
    const completionRate = (filledFields.length / fields.length) * 100;

    if (errors.length > 0) {
      return `Your application is ${Math.round(completionRate)}% complete, but ${errors.length} error(s) need to be fixed before submission.`;
    }

    if (warnings.length > 0) {
      return `Your application looks good! Please review ${warnings.length} field(s) marked for verification before final submission.`;
    }

    return `Excellent! Your application is ${Math.round(completionRate)}% complete and ready for submission. All fields have been validated.`;
  }
}
