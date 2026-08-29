import { LogOut, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api";
import type { DashboardPayload, OptionsPayload, SectionKey, SessionPayload } from "../../types";
import { getDisplayableInsight } from "../../utils/insight";
import { buildPreferenceLabels } from "../../utils/preferences";
import { AiInsightSection } from "./AiInsightSection";
import { CoinPricesSection } from "./CoinPricesSection";
import { CryptoMemeSection } from "./CryptoMemeSection";
import { MarketNewsSection } from "./MarketNewsSection";

type DashboardViewProps = {
  session: SessionPayload;
  options: OptionsPayload;
  onSession: (session: SessionPayload | null) => void;
};

export function DashboardView({ session, options, onSession }: DashboardViewProps) {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const preferences = session.preferences!;

  const labels = useMemo(() => buildPreferenceLabels(options, preferences), [options, preferences]);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const payload = await apiRequest<DashboardPayload>("/api/dashboard");
      setDashboard(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function handleLogout() {
    await apiRequest<void>("/api/auth/logout", { method: "POST" });
    onSession(null);
  }

  async function handleVote(
    section: SectionKey,
    contentId: string,
    vote: 1 | -1,
    contentSnapshot: Record<string, unknown>
  ) {
    await apiRequest("/api/votes", {
      method: "POST",
      json: { section, contentId, vote, contentSnapshot }
    });

    setDashboard((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        sections: {
          coinPrices:
            current.sections.coinPrices.contentId === contentId
              ? { ...current.sections.coinPrices, userVote: vote }
              : current.sections.coinPrices,
          marketNews:
            current.sections.marketNews.contentId === contentId
              ? { ...current.sections.marketNews, userVote: vote }
              : current.sections.marketNews,
          aiInsight:
            current.sections.aiInsight.contentId === contentId
              ? { ...current.sections.aiInsight, userVote: vote }
              : current.sections.aiInsight,
          cryptoMeme:
            current.sections.cryptoMeme.contentId === contentId
              ? { ...current.sections.cryptoMeme, userVote: vote }
              : current.sections.cryptoMeme
        }
      };
    });
  }

  const insightText = getDisplayableInsight(dashboard?.sections.aiInsight.insight.content ?? "");
  const providerResponseHidden =
    Boolean(dashboard) && insightText !== dashboard?.sections.aiInsight.insight.content;

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Welcome, {session.user.name}</p>
          <h1>Daily crypto dashboard</h1>
        </div>
        <div className="header-actions">
          <button className="icon-text-button" onClick={loadDashboard} title="Refresh dashboard">
            <RefreshCw size={18} className={loading ? "spin" : ""} />
            Refresh
          </button>
          <button className="icon-button" onClick={handleLogout} title="Logout" aria-label="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="preference-strip" aria-label="Saved preferences">
        <span>{labels.assets}</span>
        <span>{labels.investorType}</span>
        <span>{labels.contentTypes}</span>
      </section>

      {error ? <p className="error-text">{error}</p> : null}

      {loading && !dashboard ? (
        <section className="center-card">
          <RefreshCw className="spin" size={28} />
        </section>
      ) : null}

      {dashboard ? (
        <section className="dashboard-grid">
          <CoinPricesSection
            generatedAt={dashboard.generatedAt}
            section={dashboard.sections.coinPrices}
            onVote={handleVote}
          />
          <MarketNewsSection
            generatedAt={dashboard.generatedAt}
            section={dashboard.sections.marketNews}
            onVote={handleVote}
          />
          <AiInsightSection
            generatedAt={dashboard.generatedAt}
            section={dashboard.sections.aiInsight}
            insightText={insightText}
            providerResponseHidden={providerResponseHidden}
            onVote={handleVote}
          />
          <CryptoMemeSection
            generatedAt={dashboard.generatedAt}
            section={dashboard.sections.cryptoMeme}
            onVote={handleVote}
          />
        </section>
      ) : null}
    </main>
  );
}
