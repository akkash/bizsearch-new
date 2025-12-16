import { useState, useCallback } from 'react';
import { GeminiService } from '@/lib/gemini-service';

export interface UseAIOptions {
  agent?: 'ajay' | 'vijay';
  context?: any;
}

export function useAI(options: UseAIOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string, chatHistory: any[] = []) => {
      setLoading(true);
      setError(null);

      try {
        const response = await GeminiService.sendMessage(
          message,
          options.agent || 'ajay',
          options.context,
          chatHistory
        );
        return response;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to get AI response';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [options.agent, options.context]
  );

  const generateValuation = useCallback(async (businessData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await GeminiService.generateValuation(businessData);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate valuation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateFranchiseROI = useCallback(async (franchiseData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await GeminiService.generateFranchiseROI(franchiseData);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate ROI analysis';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateMarketAnalysis = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await GeminiService.generateMarketAnalysis(data);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate market analysis';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateDueDiligenceChecklist = useCallback(async (businessData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await GeminiService.generateDueDiligenceChecklist(businessData);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate checklist';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    sendMessage,
    generateValuation,
    generateFranchiseROI,
    generateMarketAnalysis,
    generateDueDiligenceChecklist,
  };
}
