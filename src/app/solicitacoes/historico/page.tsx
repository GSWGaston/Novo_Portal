import { AppShell } from "@/components/sites/facta/app-shell";
import { HistoricoView } from "@/components/sites/facta/historico-view";

export const metadata = { title: "Histórico" };

export default function HistoricoPage() {
  return (
    <AppShell variant="app">
      <HistoricoView />
    </AppShell>
  );
}
