import { AppShell } from "@/components/sites/facta/app-shell";
import { EmFocoView } from "@/components/sites/facta/em-foco-view";

export const metadata = { title: "Facta em Foco" };

export default function FactaEmFocoPage() {
  return (
    <AppShell variant="app">
      <EmFocoView />
    </AppShell>
  );
}
