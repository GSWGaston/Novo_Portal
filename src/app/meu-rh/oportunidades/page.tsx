import { AppShell } from "@/components/sites/facta/app-shell";
import { rhMenus } from "@/components/sites/facta/meu-rh-data";
import { MeuRhOportunidades } from "@/components/sites/facta/meu-rh-oportunidades";

export const metadata = { title: "Oportunidades Facta — RH" };

export default function Page() {
  return (
    <AppShell variant="app" menus={rhMenus}>
      <MeuRhOportunidades />
    </AppShell>
  );
}
