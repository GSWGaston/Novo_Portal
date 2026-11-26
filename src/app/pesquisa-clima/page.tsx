import { AppShell } from "@/components/sites/facta/app-shell";
import { PesquisaClimaView } from "@/components/sites/facta/pesquisa-clima-view";

export const metadata = { title: "Pesquisa de Clima 2026" };

export default function PesquisaClimaPage() {
  return (
    <AppShell variant="portal">
      <PesquisaClimaView />
    </AppShell>
  );
}
