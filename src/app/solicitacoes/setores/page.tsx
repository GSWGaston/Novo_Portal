import { Suspense } from "react";
import { AppShell } from "@/components/sites/facta/app-shell";
import { TicketsView } from "@/components/sites/facta/tickets-view";

export const metadata = { title: "Solicitações dos Setores" };

export default function SetoresPage() {
  return (
    <AppShell variant="app">
      <Suspense>
        <TicketsView />
      </Suspense>
    </AppShell>
  );
}
