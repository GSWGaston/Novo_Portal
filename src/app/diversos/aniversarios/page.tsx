import { AniversariosView } from "@/components/sites/facta/aniversarios-view";
import { AppShell } from "@/components/sites/facta/app-shell";

export const metadata = { title: "Relação de Aniversários" };

export default function AniversariosPage() {
  return (
    <AppShell variant="app">
      <AniversariosView />
    </AppShell>
  );
}
