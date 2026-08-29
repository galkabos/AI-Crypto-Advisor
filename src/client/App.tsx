import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import { AuthView } from "./components/AuthView";
import { DashboardView } from "./components/dashboard/DashboardView";
import { LoadingScreen } from "./components/LoadingScreen";
import { OnboardingView } from "./components/OnboardingView";
import type { OptionsPayload, SessionPayload } from "./types";
import { defaultOptions } from "./utils/preferences";

export default function App() {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [options, setOptions] = useState<OptionsPayload>(defaultOptions);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    apiRequest<OptionsPayload>("/api/options")
      .then(setOptions)
      .catch(() => setOptions(defaultOptions));

    apiRequest<SessionPayload>("/api/me")
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoadingSession(false));
  }, []);

  if (loadingSession) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <AuthView onSession={setSession} />;
  }

  if (!session.preferences) {
    return <OnboardingView options={options} onSession={setSession} />;
  }

  return <DashboardView options={options} session={session} onSession={setSession} />;
}
