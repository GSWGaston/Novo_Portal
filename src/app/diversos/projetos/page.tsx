import { AppShell } from "@/components/sites/facta/app-shell";
import { ProjetosView } from "@/components/sites/facta/projetos-view";

export const metadata = { title: "Projetos" };

export default function ProjetosPage() {
  return (
    <AppShell variant="app">
      <ProjetosView />
    </AppShell>
  );
}
