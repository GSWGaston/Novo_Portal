import { AppShell } from "@/components/sites/facta/app-shell";
import { NewRequestForm } from "@/components/sites/facta/new-request-form";

export const metadata = { title: "Nova solicitação" };

export default function NovaSolicitacaoPage() {
  return (
    <AppShell variant="app">
      <NewRequestForm />
    </AppShell>
  );
}
