import { AppShell } from "@/components/sites/facta/app-shell";
import { ReservasView } from "@/components/sites/facta/reservas-view";

export const metadata = { title: "Reservas de Salas" };

export default function ReservasPage() {
  return (
    <AppShell variant="app">
      <ReservasView />
    </AppShell>
  );
}
