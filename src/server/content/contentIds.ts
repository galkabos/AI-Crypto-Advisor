import type { Preferences } from "../domain.js";
import type { CryptoMeme } from "./types.js";

export function dashboardContentIds(preferences: Preferences, meme: CryptoMeme) {
  const dateKey = new Date().toISOString().slice(0, 10);
  const assetsKey = preferences.assets.join("-");

  return {
    coinPrices: `coin-prices:${assetsKey}:${dateKey}`,
    marketNews: `market-news:${assetsKey}:${dateKey}`,
    aiInsight: `ai-insight:${assetsKey}:${preferences.investorType}:${preferences.contentTypes.join("-")}:${dateKey}`,
    cryptoMeme: `crypto-meme:${meme.id}`
  };
}
