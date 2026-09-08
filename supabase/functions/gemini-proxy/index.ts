import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.24.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_PROMPT_LENGTH = 32000;
const MAX_HISTORY_MESSAGES = 20;

interface ChatMessage {
  role: "user" | "model";
  parts: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const googleApiKey = Deno.env.get("GOOGLE_AI_API_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !googleApiKey) {
      return jsonResponse({ error: "Server configuration error" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const action = body.action as string;
    const modelName = typeof body.model === "string" ? body.model : "gemini-pro";
    const generationConfig = body.generationConfig ?? {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    };

    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    if (action === "generateContent") {
      const prompt = sanitizeText(body.prompt);
      if (!prompt) {
        return jsonResponse({ error: "Prompt is required" }, 400);
      }

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });

      return jsonResponse({ text: result.response.text() });
    }

    if (action === "chat") {
      const message = sanitizeText(body.message);
      if (!message) {
        return jsonResponse({ error: "Message is required" }, 400);
      }

      const systemPrompt = sanitizeText(body.systemPrompt ?? "");
      const history = normalizeHistory(body.history);

      const chat = model.startChat({
        history: history.map((entry) => ({
          role: entry.role,
          parts: [{ text: entry.parts }],
        })),
        generationConfig,
      });

      const fullMessage =
        history.length === 0 && systemPrompt
          ? `${systemPrompt}\n\nUser: ${message}`
          : message;

      const result = await chat.sendMessage(fullMessage);
      return jsonResponse({ text: result.response.text() });
    }

    return jsonResponse({ error: "Invalid action" }, 400);
  } catch (error) {
    console.error("Gemini proxy error:", error);
    return jsonResponse({ error: "AI service error" }, 500);
  }
});

function sanitizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_PROMPT_LENGTH);
}

function normalizeHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (entry): entry is ChatMessage =>
        typeof entry === "object" &&
        entry !== null &&
        (entry.role === "user" || entry.role === "model") &&
        typeof entry.parts === "string"
    )
    .slice(-MAX_HISTORY_MESSAGES);
}

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
