import { AppShell } from "@/components/sites/facta/app-shell";
import { DocumentosView } from "@/components/sites/facta/documentos-view";

export const metadata = { title: "Documentos Institucionais" };

export default function DocumentosPage() {
  return (
    <AppShell variant="app">
      <DocumentosView />
    </AppShell>
  );
}
