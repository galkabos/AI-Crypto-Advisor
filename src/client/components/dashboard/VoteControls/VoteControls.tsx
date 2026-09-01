import { ThumbsDown, ThumbsUp } from "lucide-react";
import type { SectionKey } from "../../../types";
import "./VoteControls.css";

export type VoteHandler = (
  section: SectionKey,
  contentId: string,
  vote: 1 | -1,
  contentSnapshot: Record<string, unknown>
) => void | Promise<void>;

type VoteControlsProps = {
  section: SectionKey;
  contentId: string;
  contentSnapshot: Record<string, unknown>;
  userVote?: 1 | -1;
  onVote: VoteHandler;
};

export function VoteControls({
  section,
  contentId,
  contentSnapshot,
  userVote,
  onVote
}: VoteControlsProps) {
  return (
    <div className="vote-controls" aria-label="Section feedback">
      <button
        className={userVote === 1 ? "vote-button active" : "vote-button"}
        onClick={() => onVote(section, contentId, 1, contentSnapshot)}
        title="Helpful"
        aria-label="Helpful"
      >
        <ThumbsUp size={17} />
      </button>
      <button
        className={userVote === -1 ? "vote-button active" : "vote-button"}
        onClick={() => onVote(section, contentId, -1, contentSnapshot)}
        title="Not helpful"
        aria-label="Not helpful"
      >
        <ThumbsDown size={17} />
      </button>
    </div>
  );
}
