import { createHash } from "node:crypto";
import type { Preferences } from "../domain.js";
import type { AiInsight, CryptoMeme } from "./types.js";

export function dashboardContentIds(preferences: Preferences, meme: CryptoMeme, insight: AiInsight) {
  const dateKey = new Date().toISOString().slice(0, 10);
  const assetsKey = preferences.assets.join("-");
  const insightKey = contentFingerprint(insight.content);

  return {
    coinPrices: `coin-prices:${assetsKey}:${dateKey}`,
    marketNews: `market-news:${assetsKey}:${dateKey}`,
    aiInsight: `ai-insight:${assetsKey}:${preferences.investorType}:${preferences.contentTypes.join("-")}:${dateKey}:${insightKey}`,
    cryptoMeme: `crypto-meme:${meme.id}`
  };
}

function contentFingerprint(content: string) {
  return createHash("sha256").update(content.trim()).digest("hex").slice(0, 12);
}
