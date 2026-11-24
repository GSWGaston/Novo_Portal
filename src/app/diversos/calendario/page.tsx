import { AppShell } from "@/components/sites/facta/app-shell";
import { CalendarView } from "@/components/sites/facta/calendar-view";

export const metadata = { title: "Calendário de Compromissos" };

export default function CalendarioPage() {
  return (
    <AppShell variant="app">
      <CalendarView />
    </AppShell>
  );
}
