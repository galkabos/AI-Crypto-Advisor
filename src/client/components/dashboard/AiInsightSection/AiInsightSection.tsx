import { Sparkles } from "lucide-react";
import type { DashboardPayload } from "../../../types";
import {
  getAiInsightStatus,
  getAttributionStatus,
  getNoticeStatus
} from "../../../utils/contentStatus";
import { buildAiInsightSnapshot } from "../../../utils/voteSnapshots";
import { ContentStatusText } from "../ContentStatusText/ContentStatusText";
import { SectionCard, type VoteHandler } from "../SectionCard/SectionCard";
import "./AiInsightSection.css";

type AiInsightSectionProps = {
  generatedAt: string;
  section: DashboardPayload["sections"]["aiInsight"];
  insightText: string;
  providerResponseHidden: boolean;
  onVote: VoteHandler;
};

export function AiInsightSection({
  generatedAt,
  section,
  insightText,
  providerResponseHidden,
  onVote
}: AiInsightSectionProps) {
  const status = getAiInsightStatus(section.insight.source, providerResponseHidden);
  const notice = getNoticeStatus(status);
  const attribution = getAttributionStatus(status);

  return (
    <SectionCard
      icon={<Sparkles size={20} />}
      title={section.title}
      section={section.section}
      contentId={section.contentId}
      contentSnapshot={buildAiInsightSnapshot(
        generatedAt,
        section,
        insightText,
        notice?.text
      )}
      userVote={section.userVote}
      onVote={onVote}
      footer={attribution ? <ContentStatusText status={attribution} /> : undefined}
    >
      <ContentStatusText status={notice} />
      <p className="insight-text">{insightText}</p>
    </SectionCard>
  );
}
