import type { DashboardPayload } from "../types";

type CoinPricesSection = DashboardPayload["sections"]["coinPrices"];
type MarketNewsSection = DashboardPayload["sections"]["marketNews"];
type AiInsightSection = DashboardPayload["sections"]["aiInsight"];
type CryptoMemeSection = DashboardPayload["sections"]["cryptoMeme"];

export function buildCoinPricesSnapshot(
  generatedAt: string,
  section: CoinPricesSection
): Record<string, unknown> {
  return {
    generatedAt,
    section: section.section,
    title: section.title,
    source: section.source,
    contentId: section.contentId,
    items: section.items
  };
}

export function buildMarketNewsSnapshot(
  generatedAt: string,
  section: MarketNewsSection
): Record<string, unknown> {
  return {
    generatedAt,
    section: section.section,
    title: section.title,
    source: section.source,
    contentId: section.contentId,
    items: section.items
  };
}

export function buildAiInsightSnapshot(
  generatedAt: string,
  section: AiInsightSection,
  insightText: string,
  fallbackNote?: string
): Record<string, unknown> {
  return {
    generatedAt,
    section: section.section,
    title: section.title,
    source: section.insight.source,
    contentId: section.contentId,
    content: insightText,
    fallbackReason: fallbackNote
  };
}

export function buildMemeSnapshot(
  generatedAt: string,
  section: CryptoMemeSection
): Record<string, unknown> {
  return {
    generatedAt,
    section: section.section,
    title: section.title,
    source: "static",
    contentId: section.contentId,
    item: section.item
  };
}
