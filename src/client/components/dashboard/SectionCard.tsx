import type { ReactNode } from "react";
import type { SectionKey } from "../../types";
import { VoteControls, type VoteHandler } from "./VoteControls";

type SectionCardProps = {
  icon: ReactNode;
  title: string;
  section: SectionKey;
  contentId: string;
  contentSnapshot: Record<string, unknown>;
  userVote?: 1 | -1;
  onVote: VoteHandler;
  footer?: ReactNode;
  children: ReactNode;
};

export function SectionCard({
  icon,
  title,
  section,
  contentId,
  contentSnapshot,
  userVote,
  onVote,
  footer,
  children
}: SectionCardProps) {
  return (
    <article className="dashboard-card">
      <div className="card-header">
        <div className="card-title">
          {icon}
          <h2>{title}</h2>
        </div>
      </div>
      <div className="card-content">{children}</div>
      {footer ? <div className="card-footer">{footer}</div> : null}
      <VoteControls
        section={section}
        contentId={contentId}
        contentSnapshot={contentSnapshot}
        userVote={userVote}
        onVote={onVote}
      />
    </article>
  );
}

export type { VoteHandler };
