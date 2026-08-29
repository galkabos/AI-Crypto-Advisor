import { BadgeDollarSign } from "lucide-react";
import type { DashboardPayload } from "../../types";
import {
  getAttributionStatus,
  getCoinPricesStatus,
  getNoticeStatus
} from "../../utils/contentStatus";
import { compactFormatter, currencyFormatter } from "../../utils/formatters";
import { buildCoinPricesSnapshot } from "../../utils/voteSnapshots";
import { ContentStatusText } from "./ContentStatusText";
import { SectionCard, type VoteHandler } from "./SectionCard";

type CoinPricesSectionProps = {
  generatedAt: string;
  section: DashboardPayload["sections"]["coinPrices"];
  onVote: VoteHandler;
};

export function CoinPricesSection({ generatedAt, section, onVote }: CoinPricesSectionProps) {
  const status = getCoinPricesStatus(section.source);
  const attribution = getAttributionStatus(status);

  return (
    <SectionCard
      icon={<BadgeDollarSign size={20} />}
      title={section.title}
      section={section.section}
      contentId={section.contentId}
      contentSnapshot={buildCoinPricesSnapshot(generatedAt, section)}
      userVote={section.userVote}
      onVote={onVote}
      footer={attribution ? <ContentStatusText status={attribution} /> : undefined}
    >
      <ContentStatusText status={getNoticeStatus(status)} />
      <div className="price-list">
        {section.items.map((item) => (
          <div className="price-row" key={item.id}>
            <div>
              <strong>{item.symbol}</strong>
              <span>{item.name}</span>
            </div>
            <div className="price-values">
              <strong>{currencyFormatter.format(item.usd)}</strong>
              <span className={item.change24h >= 0 ? "positive" : "negative"}>
                {item.change24h >= 0 ? "+" : ""}
                {item.change24h.toFixed(2)}%
              </span>
            </div>
            <span className="market-cap">Cap {compactFormatter.format(item.marketCap)}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
