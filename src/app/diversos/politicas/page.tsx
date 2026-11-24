import { AppShell } from "@/components/sites/facta/app-shell";
import { PoliticasView } from "@/components/sites/facta/politicas-view";

export const metadata = { title: "Políticas SEGINFO" };

export default function PoliticasPage() {
  return (
    <AppShell variant="app">
      <PoliticasView />
    </AppShell>
  );
}
