import {
  getAssetLabels,
  getContentTypeLabels,
  getInvestorLabel,
  type Preferences
} from "../domain.js";
import { fetchJson } from "./http.js";
import type { AiInsight } from "./types.js";

const defaultOpenRouterModel = "minimax/minimax-m3:free";
const openRouterRetryModels = [
  defaultOpenRouterModel,
  "nvidia/nemotron-3.5-lightning:free",
  "minimax/minimax-m3:free",
  "z-ai/glm-5.2:free",
  "google/gemma-4-31b-it:free"
];

export async function getAiInsight(preferences: Preferences): Promise<AiInsight> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (!apiKey) {
    return {
      content: buildFallbackInsight(preferences),
      source: "fallback",
      fallbackReason: "Live AI insight unavailable. Showing a saved personalized insight."
    };
  }

  const prompt = buildOpenRouterPrompt(preferences);
  const configuredModel = process.env.OPENROUTER_MODEL || defaultOpenRouterModel;
  const modelsToTry = [...new Set([configuredModel, ...openRouterRetryModels])];

  for (const model of modelsToTry) {
    try {
      const content = await requestOpenRouterInsight(apiKey, model, prompt);
      return { content, source: "openrouter" };
    } catch {
      // Try the next configured model before using the local insight.
    }
  }

  return {
    content: buildFallbackInsight(preferences),
    source: "fallback",
    fallbackReason: "Live AI insight unavailable. Showing a saved personalized insight."
  };
}

function buildOpenRouterPrompt(preferences: Preferences) {
  const assets = getAssetLabels(preferences.assets).join(", ");
  const investorType = getInvestorLabel(preferences.investorType);
  const contentTypes = getContentTypeLabels(preferences.contentTypes).join(", ");

  return [
    `Selected crypto assets: ${assets}.`,
    `Investor type: ${investorType}.`,
    `Preferred content types: ${contentTypes}.`,
    "Write one dashboard insight for today in 90-130 words.",
    "Make it practical, personalized, and risk-aware.",
    "Do not invent exact prices, support levels, resistance levels, dates, or breaking news unless they were provided.",
    "Return only the final insight text. Do not include reasoning, markdown headings, bullet points, or buy/sell instructions."
  ].join(" ");
}

function buildFallbackInsight(preferences: Preferences) {
  const assets = getAssetLabels(preferences.assets).join(", ");
  const investorType = getInvestorLabel(preferences.investorType);
  const contentTypes = getContentTypeLabels(preferences.contentTypes).join(", ");
  const chartsPreference = preferences.contentTypes.includes("charts")
    ? "Pair headlines with price structure and volume before reacting."
    : "Use price movement as context, not as the whole thesis.";
  const funPreference = preferences.contentTypes.includes("fun")
    ? "Keep the tone light, but separate entertainment from conviction."
    : "Focus on signal quality and avoid noisy social momentum.";

  return `${investorType} view for ${assets}: prioritize the assets you selected and look for confirmation across ${contentTypes}. ${chartsPreference} ${funPreference} This fallback insight is educational only and appears when OpenRouter is not configured or unavailable.`;
}

async function requestOpenRouterInsight(apiKey: string, model: string, prompt: string) {
  const json = (await fetchJson(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.PUBLIC_SITE_URL ?? "http://localhost:5173",
        "X-Title": "AI Crypto Advisor"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You write concise final-answer-only crypto dashboard insights. Never reveal chain of thought, safety labels, or classification output. Do not provide financial advice."
          },
          { role: "user", content: prompt }
        ],
        reasoning: {
          effort: "none",
          exclude: true
        },
        temperature: 0.6,
        max_tokens: 500
      })
    },
    30000
  )) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };

  const content = extractOpenRouterContent(json.choices?.[0]?.message?.content);
  const invalidReason = getInvalidInsightReason(content);

  if (invalidReason) {
    throw new Error(invalidReason);
  }

  return content;
}

function extractOpenRouterContent(content: unknown) {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      if (!part || typeof part !== "object") {
        return "";
      }

      const record = part as Record<string, unknown>;
      return typeof record.text === "string" ? record.text : "";
    })
    .join("")
    .trim();
}

function getInvalidInsightReason(content: string) {
  if (!content) {
    return "OpenRouter returned an empty insight.";
  }

  if (/^\s*(user\s*)?safety\s*:/i.test(content) || /^\s*safe\s*$/i.test(content)) {
    return "OpenRouter returned a safety classification instead of an insight.";
  }

  if (/safety\s*:\s*(safe|unsafe|unknown|blocked)/i.test(content) && content.length < 200) {
    return "OpenRouter returned safety metadata instead of an insight.";
  }

  if (/thinking process|chain of thought|analy[sz]e user request|analysis:/i.test(content)) {
    return "OpenRouter returned reasoning text instead of a final insight.";
  }

  if (content.length < 120) {
    return "OpenRouter returned a response that was too short to be a useful insight.";
  }

  return "";
}
