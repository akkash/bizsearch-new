import { supabase } from './supabase';
import FeatureFlagsService from './feature-flags-service';

const GEMINI_PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-proxy`;

export interface GeminiChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface GeminiGenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

interface GeminiProxyResponse {
  text?: string;
  error?: string;
}

async function callGeminiProxy(body: Record<string, unknown>): Promise<string> {
  const featureFlag = typeof body.featureFlag === 'string' ? body.featureFlag : 'ai_features';
  if (!FeatureFlagsService.isEnabled('ai_features') || !FeatureFlagsService.isEnabled(featureFlag)) {
    throw new Error('This AI feature is turned off.');
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('You must be signed in to use AI features.');
  }

  const response = await fetch(GEMINI_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as GeminiProxyResponse;

  if (!response.ok) {
    console.error('Gemini proxy error:', payload.error || response.statusText);
    throw new Error(payload.error || 'AI service is temporarily unavailable.');
  }

  if (!payload.text) {
    throw new Error('AI service returned an empty response.');
  }

  return payload.text;
}

export async function generateGeminiContent(
  prompt: string,
  options?: {
    model?: string;
    generationConfig?: GeminiGenerationConfig;
    featureFlag?: string;
  }
): Promise<string> {
  return callGeminiProxy({
    action: 'generateContent',
    prompt,
    model: options?.model ?? 'gemini-pro',
    generationConfig: options?.generationConfig,
    featureFlag: options?.featureFlag ?? 'ai_matching',
  });
}

export async function sendGeminiChat(
  message: string,
  options?: {
    systemPrompt?: string;
    history?: GeminiChatMessage[];
    model?: string;
    generationConfig?: GeminiGenerationConfig;
    featureFlag?: string;
  }
): Promise<string> {
  return callGeminiProxy({
    action: 'chat',
    message,
    systemPrompt: options?.systemPrompt,
    history: options?.history ?? [],
    model: options?.model ?? 'gemini-pro',
    generationConfig: options?.generationConfig,
    featureFlag: options?.featureFlag ?? 'ai_chat_advisor',
  });
}
