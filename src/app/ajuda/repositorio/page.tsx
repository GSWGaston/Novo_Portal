import { AppShell } from "@/components/sites/facta/app-shell";
import { RepositorioView } from "@/components/sites/facta/repositorio-view";

export const metadata = { title: "Repositório" };

export default function RepositorioPage() {
  return (
    <AppShell variant="app">
      <RepositorioView />
    </AppShell>
  );
}
