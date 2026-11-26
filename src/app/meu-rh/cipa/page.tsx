import { AppShell } from "@/components/sites/facta/app-shell";
import { rhMenus } from "@/components/sites/facta/meu-rh-data";
import { MeuRhCipa } from "@/components/sites/facta/meu-rh-cipa";

export const metadata = { title: "CIPA — RH" };

export default function Page() {
  return (
    <AppShell variant="app" menus={rhMenus}>
      <MeuRhCipa />
    </AppShell>
  );
}
