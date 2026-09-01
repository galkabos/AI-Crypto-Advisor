import { BadgeDollarSign, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { apiRequest } from "../../api";
import type { SessionPayload } from "../../types";
import "./AuthView.css";

type AuthViewProps = {
  onSession: (session: SessionPayload) => void;
};

export function AuthView({ onSession }: AuthViewProps) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleModeChange(nextMode: "login" | "signup") {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    setPassword("");
    setError("");

    if (nextMode === "login") {
      setName("");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload =
        mode === "signup"
          ? { name, email, password }
          : {
              email,
              password
            };

      const session = await apiRequest<SessionPayload>(`/api/auth/${mode}`, {
        method: "POST",
        json: payload
      });

      onSession(session);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to continue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-aside">
        <BadgeDollarSign size={36} />
        <h1>AI Crypto Advisor</h1>
        <p>Personalized market context, prices, insight, and a little crypto humor in one daily dashboard.</p>
        <div className="trust-row">
          <ShieldCheck size={18} />
          <span>Feedback is stored for future recommendation improvements.</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="mode-switch" role="tablist" aria-label="Authentication mode">
          <button className={mode === "signup" ? "active" : ""} onClick={() => handleModeChange("signup")}>
            Sign up
          </button>
          <button className={mode === "login" ? "active" : ""} onClick={() => handleModeChange("login")}>
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          {mode === "signup" ? (
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            </label>
          ) : null}
          <label>
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button className="primary-button" disabled={submitting}>
            {submitting ? "Working..." : mode === "signup" ? "Create account" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
