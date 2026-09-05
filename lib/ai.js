import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-3.7-flash";
const GROQ_MODEL = "llama-3.1-8b-instant";
const REQUEST_TIMEOUT_MS = 30_000;

export const OPENROUTER_MODELS = [
  "meta-llama/llama-3.1-8b-instruct",
  "qwen/qwen-2.5-72b-instruct",
  "google/gemini-2.5-pro",
];

export class AIProvidersUnavailableError extends Error {
  constructor() {
    super("All configured AI providers failed or are unavailable.");
    this.name = "AIProvidersUnavailableError";
  }
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function requireText(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Provider returned an empty response.");
  }

  return value.trim();
}

async function withTimeout(operation, providerName) {
  let timeout;
  try {
    return await Promise.race([
      operation(),
      new Promise((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`${providerName} request timed out.`)),
          REQUEST_TIMEOUT_MS
        );
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url, options, providerName) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const raw = await response.text();
    let data;

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error(`${providerName} returned malformed JSON.`);
    }

    if (!response.ok) {
      const detail = data?.error?.message || data?.message || `HTTP ${response.status}`;
      throw new Error(`${providerName} request failed: ${detail}`);
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`${providerName} request timed out.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function extractChatCompletionText(payload, providerName) {
  const content = payload?.choices?.[0]?.message?.content;
  const text = Array.isArray(content)
    ? content.map((part) => part?.text || "").join("")
    : content;

  try {
    return requireText(text);
  } catch {
    throw new Error(`${providerName} returned no completion text.`);
  }
}

async function generateWithGemini({ prompt, systemPrompt, maxTokens, schema }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const gemini = new GoogleGenAI({ apiKey });
  const config = {
    systemInstruction: systemPrompt,
    maxOutputTokens: maxTokens,
    temperature: 0.8,
  };

  if (schema) {
    config.responseMimeType = "application/json";
    config.responseSchema = schema;
  }

  const response = await withTimeout(
    () =>
      gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config,
      }),
    "Gemini"
  );

  return requireText(response?.text);
}

async function generateWithGroq({ prompt, systemPrompt, maxTokens, schema }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const body = {
    model: GROQ_MODEL,
    temperature: 0.8,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  };

  if (schema) {
    body.response_format = { type: "json_object" };
  }

  const payload = await fetchJson(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    "Groq"
  );

  return extractChatCompletionText(payload, "Groq");
}

function getOpenRouterReferer() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (configuredUrl?.startsWith("http")) return configuredUrl;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return null;
}

async function generateWithOpenRouter({ prompt, systemPrompt, maxTokens, model, schema }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Title": "Threadline",
  };
  const referer = getOpenRouterReferer();
  if (referer) headers["HTTP-Referer"] = referer;

  const body = {
    model,
    temperature: 0.8,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  };

  if (schema) {
    body.response_format = { type: "json_object" };
  }

  const payload = await fetchJson(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
    `OpenRouter ${model}`
  );

  return extractChatCompletionText(payload, `OpenRouter ${model}`);
}

function getFirstJsonValue(text) {
  const stripped = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(stripped);
  } catch {
    // Some models add a short sentence around an otherwise valid JSON object.
  }

  const start = stripped.search(/[\[{]/);
  if (start === -1) throw new Error("Response did not contain JSON.");

  const opening = stripped[start];
  const closing = opening === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < stripped.length; index += 1) {
    const character = stripped[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === opening) depth += 1;
    else if (character === closing) {
      depth -= 1;
      if (depth === 0) return JSON.parse(stripped.slice(start, index + 1));
    }
  }

  throw new Error("Response contained incomplete JSON.");
}

export function parseJsonResponse(text, validate) {
  const value = getFirstJsonValue(text);
  return validate(value);
}

export async function generateWithFallback({
  prompt,
  systemPrompt,
  maxTokens = 2500,
  schema,
  validateResponse = (text) => text,
}) {
  const attempt = async (label, generate) => {
    try {
      const text = await generate();
      if (text === null) {
        console.info(`[AI] ${label} skipped: API key is not configured.`);
        return null;
      }

      const result = validateResponse(text);
      console.info(`[AI] ${label} succeeded.`);
      return result;
    } catch (error) {
      console.error(`[AI] ${label} failed: ${getErrorMessage(error)}`);
      return null;
    }
  };

  const geminiResult = await attempt("Gemini", () =>
    generateWithGemini({ prompt, systemPrompt, maxTokens, schema })
  );
  if (geminiResult !== null) return geminiResult;

  const groqResult = await attempt("Groq", () =>
    generateWithGroq({ prompt, systemPrompt, maxTokens, schema })
  );
  if (groqResult !== null) return groqResult;

  for (const model of OPENROUTER_MODELS) {
    const result = await attempt(`OpenRouter ${model}`, () =>
      generateWithOpenRouter({ prompt, systemPrompt, maxTokens, model, schema })
    );
    if (result !== null) return result;
  }

  throw new AIProvidersUnavailableError();
}
