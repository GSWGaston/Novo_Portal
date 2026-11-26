import { AppShell } from "@/components/sites/facta/app-shell";
import { IdeiasView } from "@/components/sites/facta/ideias-view";

export const metadata = { title: "Banco de Ideias" };

export default function IdeiasPage() {
  return (
    <AppShell variant="app">
      <IdeiasView />
    </AppShell>
  );
}
