import { Newspaper } from "lucide-react";
import type { DashboardPayload } from "../../types";
import {
  getAttributionStatus,
  getMarketNewsStatus,
  getNoticeStatus
} from "../../utils/contentStatus";
import { buildMarketNewsSnapshot } from "../../utils/voteSnapshots";
import { ContentStatusText } from "./ContentStatusText";
import { SectionCard, type VoteHandler } from "./SectionCard";

type MarketNewsSectionProps = {
  generatedAt: string;
  section: DashboardPayload["sections"]["marketNews"];
  onVote: VoteHandler;
};

export function MarketNewsSection({ generatedAt, section, onVote }: MarketNewsSectionProps) {
  const status = getMarketNewsStatus(section.source);
  const attribution = getAttributionStatus(status);
  const showArticleSource = section.source !== "fallback";

  return (
    <SectionCard
      icon={<Newspaper size={20} />}
      title={section.title}
      section={section.section}
      contentId={section.contentId}
      contentSnapshot={buildMarketNewsSnapshot(generatedAt, section)}
      userVote={section.userVote}
      onVote={onVote}
      footer={attribution ? <ContentStatusText status={attribution} /> : undefined}
    >
      <ContentStatusText status={getNoticeStatus(status)} />
      <div className="news-list">
        {section.items.map((item) => (
          <article className="news-row" key={item.id}>
            <div>
              {showArticleSource ? <span>{item.source}</span> : null}
              <strong>{item.title}</strong>
              <p>{item.summary}</p>
            </div>
            {item.url ? (
              <a href={item.url} target="_blank" rel="noreferrer">
                Read
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
