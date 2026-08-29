import { RefreshCw } from "lucide-react";

export function LoadingScreen() {
  return (
    <main className="center-screen">
      <RefreshCw className="spin" size={28} />
    </main>
  );
}
