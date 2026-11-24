import { AppShell } from "@/components/sites/facta/app-shell";
import { RamaisView } from "@/components/sites/facta/ramais-view";

export const metadata = { title: "Buscar Colaborador" };

export default function ColaboradoresPage() {
  return (
    <AppShell variant="app">
      <RamaisView />
    </AppShell>
  );
}
