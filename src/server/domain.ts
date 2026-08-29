export const ASSET_OPTIONS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", newsSymbol: "CC:BTC" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", newsSymbol: "CC:ETH" },
  { id: "solana", symbol: "SOL", name: "Solana", newsSymbol: "CC:SOL" },
  { id: "ripple", symbol: "XRP", name: "XRP", newsSymbol: "CC:XRP" },
  { id: "cardano", symbol: "ADA", name: "Cardano", newsSymbol: "CC:ADA" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", newsSymbol: "CC:DOGE" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", newsSymbol: "CC:DOT" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", newsSymbol: "CC:LINK" }
] as const;

export const INVESTOR_TYPES = [
  { id: "hodler", label: "HODLer" },
  { id: "day-trader", label: "Day Trader" },
  { id: "nft-collector", label: "NFT Collector" },
  { id: "defi-explorer", label: "DeFi Explorer" }
] as const;

export const CONTENT_TYPES = [
  { id: "market-news", label: "Market News" },
  { id: "charts", label: "Charts" },
  { id: "social", label: "Social" },
  { id: "fun", label: "Fun" }
] as const;

export const SECTION_KEYS = [
  "market-news",
  "coin-prices",
  "ai-insight",
  "crypto-meme"
] as const;

export type AssetId = (typeof ASSET_OPTIONS)[number]["id"];
export type InvestorType = (typeof INVESTOR_TYPES)[number]["id"];
export type ContentType = (typeof CONTENT_TYPES)[number]["id"];
export type SectionKey = (typeof SECTION_KEYS)[number];

export type Preferences = {
  assets: AssetId[];
  investorType: InvestorType;
  contentTypes: ContentType[];
};

const assetIds = new Set(ASSET_OPTIONS.map((asset) => asset.id));
const investorTypeIds = new Set(INVESTOR_TYPES.map((type) => type.id));
const contentTypeIds = new Set(CONTENT_TYPES.map((type) => type.id));
const sectionKeyIds = new Set<string>(SECTION_KEYS);

export function isSectionKey(value: unknown): value is SectionKey {
  return typeof value === "string" && sectionKeyIds.has(value);
}

export function parsePreferences(input: unknown): Preferences {
  if (!input || typeof input !== "object") {
    throw new Error("Preferences are required.");
  }

  const body = input as Record<string, unknown>;
  const assets = uniqueStrings(body.assets).filter((asset): asset is AssetId =>
    assetIds.has(asset as AssetId)
  );
  const contentTypes = uniqueStrings(body.contentTypes).filter((type): type is ContentType =>
    contentTypeIds.has(type as ContentType)
  );
  const investorType = body.investorType;

  if (assets.length === 0) {
    throw new Error("Choose at least one crypto asset.");
  }

  if (typeof investorType !== "string" || !investorTypeIds.has(investorType as InvestorType)) {
    throw new Error("Choose an investor type.");
  }

  if (contentTypes.length === 0) {
    throw new Error("Choose at least one content type.");
  }

  return {
    assets,
    investorType: investorType as InvestorType,
    contentTypes
  };
}

export function getAsset(assetId: AssetId) {
  return ASSET_OPTIONS.find((asset) => asset.id === assetId) ?? ASSET_OPTIONS[0];
}

export function getAssetLabels(assetIdsToLabel: AssetId[]) {
  return assetIdsToLabel.map((assetId) => getAsset(assetId).name);
}

export function getInvestorLabel(investorType: InvestorType) {
  return INVESTOR_TYPES.find((type) => type.id === investorType)?.label ?? investorType;
}

export function getContentTypeLabels(contentTypes: ContentType[]) {
  return contentTypes.map(
    (contentType) => CONTENT_TYPES.find((type) => type.id === contentType)?.label ?? contentType
  );
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((item): item is string => typeof item === "string"))];
}
