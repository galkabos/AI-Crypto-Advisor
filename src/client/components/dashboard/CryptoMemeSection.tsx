import { BarChart3, Laugh } from "lucide-react";
import type { DashboardPayload } from "../../types";
import { buildMemeSnapshot } from "../../utils/voteSnapshots";
import { SectionCard, type VoteHandler } from "./SectionCard";

type CryptoMemeSectionProps = {
  generatedAt: string;
  section: DashboardPayload["sections"]["cryptoMeme"];
  onVote: VoteHandler;
};

export function CryptoMemeSection({ generatedAt, section, onVote }: CryptoMemeSectionProps) {
  return (
    <SectionCard
      icon={<Laugh size={20} />}
      title={section.title}
      section={section.section}
      contentId={section.contentId}
      contentSnapshot={buildMemeSnapshot(generatedAt, section)}
      userVote={section.userVote}
      onVote={onVote}
    >
      <div className="meme-poster">
        <BarChart3 size={36} />
        <strong>{section.item.headline}</strong>
        <span>{section.item.punchline}</span>
      </div>
    </SectionCard>
  );
}
