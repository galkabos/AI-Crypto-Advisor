import { Sparkles } from "lucide-react";
import { type FormEvent, useState } from "react";
import { apiRequest } from "../api";
import type { OptionsPayload, SessionPayload } from "../types";
import { toggleListValue } from "../utils/preferences";
import { PreferenceGroup } from "./PreferenceGroup";

type OnboardingViewProps = {
  options: OptionsPayload;
  onSession: (session: SessionPayload) => void;
};

export function OnboardingView({ options, onSession }: OnboardingViewProps) {
  const [assets, setAssets] = useState<string[]>(["bitcoin", "ethereum"]);
  const [investorType, setInvestorType] = useState("hodler");
  const [contentTypes, setContentTypes] = useState<string[]>(["market-news", "charts"]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const session = await apiRequest<SessionPayload>("/api/onboarding", {
        method: "POST",
        json: {
          assets,
          investorType,
          contentTypes
        }
      });
      onSession(session);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save preferences.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="onboarding-shell">
      <form className="onboarding-panel" onSubmit={handleSubmit}>
        <div className="section-heading">
          <Sparkles size={24} />
          <div>
            <h1>Set your dashboard</h1>
            <p>Your choices shape prices, news, and the AI insight prompt.</p>
          </div>
        </div>

        <PreferenceGroup title="Crypto assets">
          <div className="chip-grid">
            {options.assets.map((asset) => (
              <button
                type="button"
                key={asset.id}
                className={assets.includes(asset.id) ? "chip selected" : "chip"}
                onClick={() => setAssets(toggleListValue(assets, asset.id))}
              >
                <span>{asset.symbol}</span>
                {asset.name}
              </button>
            ))}
          </div>
        </PreferenceGroup>

        <PreferenceGroup title="Investor type">
          <div className="chip-grid">
            {options.investorTypes.map((type) => (
              <button
                type="button"
                key={type.id}
                className={investorType === type.id ? "chip selected" : "chip"}
                onClick={() => setInvestorType(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </PreferenceGroup>

        <PreferenceGroup title="Content">
          <div className="chip-grid">
            {options.contentTypes.map((type) => (
              <button
                type="button"
                key={type.id}
                className={contentTypes.includes(type.id) ? "chip selected" : "chip"}
                onClick={() => setContentTypes(toggleListValue(contentTypes, type.id))}
              >
                {type.label}
              </button>
            ))}
          </div>
        </PreferenceGroup>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-button" disabled={submitting}>
          {submitting ? "Saving..." : "Open dashboard"}
        </button>
      </form>
    </main>
  );
}
