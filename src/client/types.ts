export type User = {
  id: string;
  name: string;
  email: string;
  onboardingCompleted: boolean;
};

export type AssetOption = {
  id: string;
  symbol: string;
  name: string;
  newsSymbol: string;
};

export type InvestorTypeOption = {
  id: string;
  label: string;
};

export type ContentTypeOption = {
  id: string;
  label: string;
};

export type Preferences = {
  assets: string[];
  investorType: string;
  contentTypes: string[];
};

export type OptionsPayload = {
  assets: AssetOption[];
  investorTypes: InvestorTypeOption[];
  contentTypes: ContentTypeOption[];
};

export type SessionPayload = {
  user: User;
  preferences: Preferences | null;
};

export type SectionKey = "market-news" | "coin-prices" | "ai-insight" | "crypto-meme";

export type PriceItem = {
  id: string;
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
  relatedAssets: string[];
};

export type DashboardPayload = {
  generatedAt: string;
  preferences: Preferences;
  sections: {
    coinPrices: {
      section: "coin-prices";
      title: string;
      contentId: string;
      source: "coingecko" | "fallback";
      items: PriceItem[];
      userVote?: 1 | -1;
    };
    marketNews: {
      section: "market-news";
      title: string;
      contentId: string;
      source: "marketaux" | "fallback";
      items: NewsItem[];
      userVote?: 1 | -1;
    };
    aiInsight: {
      section: "ai-insight";
      title: string;
      contentId: string;
      insight: {
        content: string;
        source: "openrouter" | "fallback";
        fallbackReason?: string;
      };
      userVote?: 1 | -1;
    };
    cryptoMeme: {
      section: "crypto-meme";
      title: string;
      contentId: string;
      item: {
        id: string;
        headline: string;
        punchline: string;
      };
      userVote?: 1 | -1;
    };
  };
};
