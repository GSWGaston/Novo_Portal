import { AppShell } from "@/components/sites/facta/app-shell";
import { PerfilView } from "@/components/sites/facta/perfil-view";

export const metadata = { title: "Editar perfil" };

export default function PerfilPage() {
  return (
    <AppShell variant="app">
      <PerfilView />
    </AppShell>
  );
}
