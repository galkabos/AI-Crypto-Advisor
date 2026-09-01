import { RefreshCw } from "lucide-react";
import "./LoadingScreen.css";

export function LoadingScreen() {
  return (
    <main className="center-screen">
      <RefreshCw className="spin" size={28} />
    </main>
  );
}
