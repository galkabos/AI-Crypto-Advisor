export function getDisplayableInsight(content: string) {
  const trimmed = content.trim();

  if (
    !trimmed ||
    /^\s*(user\s*)?safety\s*:/i.test(trimmed) ||
    (/safety\s*:\s*(safe|unsafe|unknown|blocked)/i.test(trimmed) && trimmed.length < 200)
  ) {
    return "AI insight is temporarily unavailable. Refresh the dashboard to try again.";
  }

  return trimmed;
}
