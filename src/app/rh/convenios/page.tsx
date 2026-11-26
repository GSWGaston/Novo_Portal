import { AppShell } from "@/components/sites/facta/app-shell";
import { ConveniosView } from "@/components/sites/facta/convenios-view";

export const metadata = { title: "Convênios" };

export default function ConveniosPage() {
  return (
    <AppShell variant="app">
      <ConveniosView />
    </AppShell>
  );
}
