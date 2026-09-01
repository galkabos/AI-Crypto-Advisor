import type { ContentStatus } from "../../../utils/contentStatus";
import "./ContentStatusText.css";

type ContentStatusTextProps = {
  status: ContentStatus | null;
};

export function ContentStatusText({ status }: ContentStatusTextProps) {
  if (!status) {
    return null;
  }

  return <p className={`content-status ${status.kind}`}>{status.text}</p>;
}
