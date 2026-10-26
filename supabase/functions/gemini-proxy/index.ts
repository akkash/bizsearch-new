import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_PROMPT_LENGTH = 32000;
const MAX_HISTORY_MESSAGES = 20;
const COMMAND_CODE_CHAT_URL = "https://api.commandcode.ai/provider/v1/chat/completions";
const DEFAULT_MODEL = "deepseek/deepseek-v4-flash-fast";

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
    const cmdApiKey = Deno.env.get("CMD_API_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !cmdApiKey) {
      return jsonResponse({ error: "Server configuration error" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const featureFlag =
      typeof body.featureFlag === "string" ? body.featureFlag : "ai_features";
    const { data: flags } = await supabase
      .from("feature_flags")
      .select("key, enabled")
      .in("key", ["ai_features", featureFlag]);
    const flagMap = new Map((flags || []).map((row) => [row.key, row.enabled]));
    if (flagMap.get("ai_features") === false || flagMap.get(featureFlag) === false) {
      return jsonResponse({ error: "This AI feature is turned off." }, 403);
    }

    if (user) {
      const { data: quotaOk, error: quotaError } = await supabase.rpc(
        "consume_gemini_quota",
        { p_max: 20 }
      );
      if (quotaError) {
        console.error("Command Code quota check failed:", quotaError);
      } else if (quotaOk === false) {
        return jsonResponse({ error: "Daily AI limit reached. Try again tomorrow." }, 429);
      }
    }

    const action = body.action as string;
    const modelName = resolveModel(typeof body.model === "string" ? body.model : DEFAULT_MODEL);
    const generationConfig = body.generationConfig ?? {};
    const temperature = Number(generationConfig.temperature ?? 0.2);
    const maxTokens = Number(generationConfig.maxOutputTokens ?? 2048);

    if (action === "generateContent") {
      const prompt = sanitizeText(body.prompt);
      if (!prompt) {
        return jsonResponse({ error: "Prompt is required" }, 400);
      }

      const jsonMode = body.responseFormat === "json";
      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [];
      if (jsonMode) {
        messages.push({
          role: "system",
          content: "Return only a valid JSON object. No markdown fences. No thinking. No prose.",
        });
      }
      messages.push({ role: "user", content: prompt });

      const text = await commandCodeChat(
        cmdApiKey,
        modelName,
        messages,
        temperature,
        maxTokens,
        jsonMode
      );

      return jsonResponse({ text });
    }

    if (action === "chat") {
      if (!user) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      const message = sanitizeText(body.message);
      if (!message) {
        return jsonResponse({ error: "Message is required" }, 400);
      }

      const systemPrompt = sanitizeText(body.systemPrompt ?? "");
      const history = normalizeHistory(body.history);
      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      for (const entry of history) {
        messages.push({
          role: entry.role === "model" ? "assistant" : "user",
          content: entry.parts,
        });
      }
      messages.push({ role: "user", content: message });

      const text = await commandCodeChat(cmdApiKey, modelName, messages, temperature, maxTokens);
      return jsonResponse({ text });
    }

    return jsonResponse({ error: "Invalid action" }, 400);
  } catch (error) {
    console.error("Command Code proxy error:", error);
    return jsonResponse({ error: "AI service error" }, 500);
  }
});

function resolveModel(name: string): string {
  const trimmed = name.trim();
  if (
    !trimmed ||
    trimmed === "gemini-pro" ||
    trimmed.startsWith("gemini-1.") ||
    trimmed.startsWith("gemini-2.")
  ) {
    return DEFAULT_MODEL;
  }
  return trimmed;
}

async function commandCodeChat(
  apiKey: string,
  model: string,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  temperature: number,
  maxTokens: number,
  jsonMode = false
): Promise<string> {
  const payload = await requestCommandCode(apiKey, {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
  });

  const text = extractMessageText(payload);
  if (!text) {
    throw new Error("Command Code returned an empty response.");
  }
  return text;
}

async function requestCommandCode(
  apiKey: string,
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const send = async (payload: Record<string, unknown>) => {
    const response = await fetch(COMMAND_CODE_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "BizSearch/1.0 (commandcode-provider)",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  };

  let result = await send(body);
  if (
    !result.ok &&
    body.response_format &&
    (result.status === 400 || result.status === 422)
  ) {
    const { response_format: _ignored, ...withoutFormat } = body;
    result = await send(withoutFormat);
  }
  if (!result.ok) {
    const message =
      (result.data as { error?: { message?: string }; message?: string })?.error?.message ||
      (result.data as { message?: string })?.message ||
      `Command Code HTTP ${result.status}`;
    throw new Error(message);
  }
  return result.data as Record<string, unknown>;
}

function extractMessageText(payload: Record<string, unknown>): string {
  const choices = payload?.choices;
  const message = Array.isArray(choices) ? (choices[0] as { message?: Record<string, unknown> })?.message || {} : {};
  const chunks: string[] = [];
  const push = (value: unknown) => {
    if (typeof value === "string" && value.trim()) chunks.push(value.trim());
  };
  const content = message.content;
  if (typeof content === "string") {
    push(content);
  } else if (Array.isArray(content)) {
    for (const part of content) {
      if (typeof part === "string") push(part);
      else if (part && typeof part === "object") {
        push((part as { text?: unknown }).text);
        push((part as { content?: unknown }).content);
      }
    }
  }
  if (chunks.length) return chunks.join("\n");
  push(message.reasoning);
  push(message.reasoning_content);
  return chunks.join("\n");
}

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
