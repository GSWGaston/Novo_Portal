import { AppShell } from "@/components/sites/facta/app-shell";
import { DashboardView } from "@/components/sites/facta/dashboard-view";

export const metadata = { title: "Dashboard — Solicitações" };

export default function SolicitacoesDashboard() {
  return (
    <AppShell variant="app">
      <DashboardView />
    </AppShell>
  );
}
