import { AppShell } from "@/components/sites/facta/app-shell";
import { MinhasView } from "@/components/sites/facta/minhas-view";

export const metadata = { title: "Minhas solicitações" };

export default function MinhasPage() {
  return (
    <AppShell variant="app">
      <MinhasView />
    </AppShell>
  );
}
