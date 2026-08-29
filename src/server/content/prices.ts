import { getAsset, type AssetId, type Preferences } from "../domain.js";
import { fetchJson } from "./http.js";
import type { PriceItem } from "./types.js";

const fallbackPrices: Record<AssetId, Omit<PriceItem, "id" | "symbol" | "name">> = {
  bitcoin: { usd: 64250, change24h: 1.8, marketCap: 1260000000000, lastUpdatedAt: "Static fallback" },
  ethereum: { usd: 3150, change24h: 0.9, marketCap: 378000000000, lastUpdatedAt: "Static fallback" },
  solana: { usd: 145, change24h: 2.4, marketCap: 68000000000, lastUpdatedAt: "Static fallback" },
  ripple: { usd: 0.58, change24h: -0.6, marketCap: 32000000000, lastUpdatedAt: "Static fallback" },
  cardano: { usd: 0.44, change24h: 0.4, marketCap: 15500000000, lastUpdatedAt: "Static fallback" },
  dogecoin: { usd: 0.12, change24h: 3.1, marketCap: 17500000000, lastUpdatedAt: "Static fallback" },
  polkadot: { usd: 6.25, change24h: -1.2, marketCap: 8700000000, lastUpdatedAt: "Static fallback" },
  chainlink: { usd: 14.8, change24h: 1.1, marketCap: 9000000000, lastUpdatedAt: "Static fallback" }
};

export async function getCoinPrices(preferences: Preferences) {
  const ids = preferences.assets;
  const url = new URL("https://api.coingecko.com/api/v3/simple/price");
  url.searchParams.set("ids", ids.join(","));
  url.searchParams.set("vs_currencies", "usd");
  url.searchParams.set("include_24hr_change", "true");
  url.searchParams.set("include_market_cap", "true");
  url.searchParams.set("include_last_updated_at", "true");

  try {
    const json = (await fetchJson(url.toString())) as Record<string, Record<string, number>>;
    const items = ids.map((assetId) => {
      const asset = getAsset(assetId);
      const apiItem = json[assetId];

      if (!apiItem) {
        return fallbackPriceItem(assetId);
      }

      return {
        id: assetId,
        symbol: asset.symbol,
        name: asset.name,
        usd: Number(apiItem.usd ?? fallbackPrices[assetId].usd),
        change24h: Number(apiItem.usd_24h_change ?? 0),
        marketCap: Number(apiItem.usd_market_cap ?? 0),
        lastUpdatedAt: apiItem.last_updated_at
          ? new Date(apiItem.last_updated_at * 1000).toISOString()
          : "Unknown"
      };
    });

    return { source: "coingecko" as const, items };
  } catch {
    return {
      source: "fallback" as const,
      items: ids.map(fallbackPriceItem)
    };
  }
}

function fallbackPriceItem(assetId: AssetId): PriceItem {
  const asset = getAsset(assetId);
  const fallback = fallbackPrices[assetId];

  return {
    id: assetId,
    symbol: asset.symbol,
    name: asset.name,
    ...fallback
  };
}
