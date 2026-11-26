import { AppShell } from "@/components/sites/facta/app-shell";
import { rhMenus } from "@/components/sites/facta/meu-rh-data";
import { MeuRhComprovantes } from "@/components/sites/facta/meu-rh-comprovantes";

export const metadata = { title: "Comprovantes — RH" };

export default function Page() {
  return (
    <AppShell variant="app" menus={rhMenus}>
      <MeuRhComprovantes />
    </AppShell>
  );
}
