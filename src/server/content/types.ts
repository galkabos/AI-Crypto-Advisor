import type { AssetId } from "../domain.js";

export type SourceName = "coingecko" | "marketaux" | "openrouter" | "fallback";

export type PriceItem = {
  id: AssetId;
  symbol: string;
  name: string;
  usd: number;
  change24h: number;
  marketCap: number;
  lastUpdatedAt: string;
};

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string | null;
  publishedAt: string;
  relatedAssets: AssetId[];
};

export type AiInsight = {
  content: string;
  source: SourceName;
  fallbackReason?: string;
};

export type CryptoMeme = {
  id: string;
  headline: string;
  punchline: string;
};

export type DashboardPayload = {
  generatedAt: string;
  sections: {
    coinPrices: {
      section: "coin-prices";
      title: string;
      contentId: string;
      source: SourceName;
      items: PriceItem[];
      userVote?: 1 | -1;
    };
    marketNews: {
      section: "market-news";
      title: string;
      contentId: string;
      source: SourceName;
      items: NewsItem[];
      userVote?: 1 | -1;
    };
    aiInsight: {
      section: "ai-insight";
      title: string;
      contentId: string;
      insight: AiInsight;
      userVote?: 1 | -1;
    };
    cryptoMeme: {
      section: "crypto-meme";
      title: string;
      contentId: string;
      item: CryptoMeme;
      userVote?: 1 | -1;
    };
  };
};
