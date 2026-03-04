/**
 * Shared AI API client for SetFlow
 * Server-side only - uses Anthropic Claude API
 */

import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAIClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export interface AIRequestOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

/**
 * Send a structured JSON request to Claude and parse the response
 */
export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  options: AIRequestOptions = {}
): Promise<T> {
  const ai = getAIClient();
  const { maxTokens = 4096, temperature = 0.7, model = DEFAULT_MODEL } = options;

  const response = await ai.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  // Extract text content
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in AI response");
  }

  // Parse JSON from response - handle markdown code blocks
  let jsonText = textBlock.text.trim();
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
