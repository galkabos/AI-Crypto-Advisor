import type { DashboardPayload } from "../types";

export type ContentStatus = {
  kind: "attribution" | "notice";
  text: string;
};

type CoinPriceSource = DashboardPayload["sections"]["coinPrices"]["source"];
type MarketNewsSource = DashboardPayload["sections"]["marketNews"]["source"];
type AiInsightSource = DashboardPayload["sections"]["aiInsight"]["insight"]["source"];

export function getCoinPricesStatus(source: CoinPriceSource): ContentStatus {
  if (source === "fallback") {
    return {
      kind: "notice",
      text: "Live prices unavailable. Showing saved prices. Refresh to try again."
    };
  }

  return {
    kind: "attribution",
    text: "Data by CoinGecko"
  };
}

export function getMarketNewsStatus(source: MarketNewsSource): ContentStatus {
  if (source === "fallback") {
    return {
      kind: "notice",
      text: "Live news unavailable. Showing saved content. Refresh to try again."
    };
  }

  return {
    kind: "attribution",
    text: "News via Marketaux"
  };
}

export function getAiInsightStatus(
  source: AiInsightSource,
  providerResponseHidden: boolean
): ContentStatus | null {
  if (providerResponseHidden) {
    return null;
  }

  if (source === "fallback") {
    return {
      kind: "notice",
      text: "Live AI insight unavailable. Showing a saved personalized insight. Refresh to try again."
    };
  }

  return {
    kind: "attribution",
    text: "AI-generated insight"
  };
}

export function getAttributionStatus(status: ContentStatus | null): ContentStatus | null {
  return status?.kind === "attribution" ? status : null;
}

export function getNoticeStatus(status: ContentStatus | null): ContentStatus | null {
  return status?.kind === "notice" ? status : null;
}
