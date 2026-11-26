import { AppShell } from "@/components/sites/facta/app-shell";
import { rhMenus } from "@/components/sites/facta/meu-rh-data";
import { MeuRhDados } from "@/components/sites/facta/meu-rh-dados";

export const metadata = { title: "Meus Dados — RH" };

export default function Page() {
  return (
    <AppShell variant="app" menus={rhMenus}>
      <MeuRhDados />
    </AppShell>
  );
}
