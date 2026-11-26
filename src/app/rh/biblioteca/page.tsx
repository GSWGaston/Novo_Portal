import { AppShell } from "@/components/sites/facta/app-shell";
import { BibliotecaView } from "@/components/sites/facta/biblioteca-view";

export const metadata = { title: "Biblioteca" };

export default function BibliotecaPage() {
  return (
    <AppShell variant="app">
      <BibliotecaView />
    </AppShell>
  );
}
