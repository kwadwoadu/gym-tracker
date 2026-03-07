/**
 * Shared AI API client for SetFlow
 * Server-side only - uses OpenAI API
 */

import OpenAI from "openai";

let client: OpenAI | null = null;

export function getAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export interface AIRequestOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

const DEFAULT_MODEL = "gpt-4o";

/**
 * Send a structured JSON request to OpenAI and parse the response
 */
export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  options: AIRequestOptions = {}
): Promise<T> {
  const ai = getAIClient();
  const { maxTokens = 4096, temperature = 0.7, model = DEFAULT_MODEL } = options;

  const response = await ai.chat.completions.create({
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("No text content in AI response");
  }

  // Parse JSON from response - handle markdown code blocks
  let jsonText = text;
  const jsonMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  }

  try {
    return JSON.parse(jsonText) as T;
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${jsonText.slice(0, 200)}`);
  }
}
