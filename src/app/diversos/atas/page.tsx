import { AppShell } from "@/components/sites/facta/app-shell";
import { AtasView } from "@/components/sites/facta/atas-view";

export const metadata = { title: "Atas de Reunião" };

export default function AtasPage() {
  return (
    <AppShell variant="app">
      <AtasView />
    </AppShell>
  );
}
