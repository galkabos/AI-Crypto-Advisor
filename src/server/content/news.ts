import { ASSET_OPTIONS, getAsset, type AssetId, type Preferences } from "../domain.js";
import { fetchJson } from "./http.js";
import type { NewsItem } from "./types.js";

const marketNewsCache = new Map<string, { expiresAt: number; items: NewsItem[] }>();
const marketNewsCacheMs = 10 * 60 * 1000;

const fallbackNews: NewsItem[] = [
  {
    id: "fallback-bitcoin-etf-flows",
    title: "Bitcoin traders watch ETF flows and liquidity before the next move",
    summary: "A useful Bitcoin read is whether spot demand is confirming the latest price action.",
    source: "Static fallback",
    url: null,
    publishedAt: "Today",
    relatedAssets: ["bitcoin"]
  },
  {
    id: "fallback-ethereum-scaling",
    title: "Ethereum ecosystem focus stays on scaling costs and app activity",
    summary: "For ETH investors, network usage and layer-2 activity remain important signals.",
    source: "Static fallback",
    url: null,
    publishedAt: "Today",
    relatedAssets: ["ethereum"]
  },
  {
    id: "fallback-solana-activity",
    title: "Solana momentum depends on app usage, fees, and network reliability",
    summary: "SOL dashboards should balance strong activity with infrastructure risk checks.",
    source: "Static fallback",
    url: null,
    publishedAt: "Today",
    relatedAssets: ["solana"]
  },
  {
    id: "fallback-altcoin-risk",
    title: "Altcoin setups need liquidity, catalyst, and risk discipline",
    summary: "Smaller assets can move quickly, so position sizing and invalidation levels matter.",
    source: "Static fallback",
    url: null,
    publishedAt: "Today",
    relatedAssets: ["ripple", "cardano", "dogecoin", "polkadot", "chainlink"]
  },
  {
    id: "fallback-defi-security",
    title: "DeFi users keep security reviews high on the checklist",
    summary: "Protocol usage, audits, and exploit history are as important as headline yield.",
    source: "Static fallback",
    url: null,
    publishedAt: "Today",
    relatedAssets: ["ethereum", "solana", "chainlink"]
  }
];

export async function getMarketNews(preferences: Preferences) {
  const apiKey = process.env.MARKETAUX_API_KEY?.trim();
  const selectedAssets = new Set(preferences.assets);
  const cacheKey = preferences.assets.join(",");

  if (apiKey) {
    const cached = marketNewsCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return { source: "marketaux" as const, items: cached.items };
    }

    const symbols = preferences.assets.map((assetId) => getAsset(assetId).newsSymbol).join(",");
    const url = new URL("https://api.marketaux.com/v1/news/all");
    url.searchParams.set("api_token", apiKey);
    url.searchParams.set("symbols", symbols);
    url.searchParams.set("filter_entities", "true");
    url.searchParams.set("language", "en");
    url.searchParams.set("limit", "5");

    try {
      const json = (await fetchJson(url.toString())) as {
        data?: Array<Record<string, unknown>>;
      };
      const items = Array.isArray(json.data)
        ? json.data.slice(0, 5).map((item) => mapMarketauxItem(item, preferences.assets))
        : [];

      if (items.length > 0) {
        marketNewsCache.set(cacheKey, {
          expiresAt: Date.now() + marketNewsCacheMs,
          items
        });
        return { source: "marketaux" as const, items };
      }
    } catch {
      // Fall through to personalized static news.
    }
  }

  const relevantItems = fallbackNews.filter((item) =>
    item.relatedAssets.some((assetId) => selectedAssets.has(assetId))
  );

  return {
    source: "fallback" as const,
    items: (relevantItems.length > 0 ? relevantItems : fallbackNews).slice(0, 4)
  };
}

function mapMarketauxItem(item: Record<string, unknown>, selectedAssets: AssetId[]): NewsItem {
  const entities = Array.isArray(item.entities) ? item.entities : [];
  const relatedAssets = entities
    .map((entity) => {
      if (!entity || typeof entity !== "object") {
        return null;
      }

      const symbol = String((entity as Record<string, unknown>).symbol ?? "");
      return ASSET_OPTIONS.find((asset) => asset.newsSymbol === symbol)?.id ?? null;
    })
    .filter((assetId): assetId is AssetId => Boolean(assetId));

  return {
    id: String(item.uuid ?? item.url ?? item.title ?? "marketaux-news"),
    title: String(item.title ?? "Crypto market update"),
    summary: String(item.description ?? item.snippet ?? "Relevant market news for your selected assets."),
    source: typeof item.source === "string" ? item.source : "Marketaux",
    url: typeof item.url === "string" ? item.url : null,
    publishedAt: typeof item.published_at === "string" ? item.published_at : "Recent",
    relatedAssets: relatedAssets.length > 0 ? relatedAssets : selectedAssets
  };
}
