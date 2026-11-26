import { AppShell } from "@/components/sites/facta/app-shell";
import { TdView } from "@/components/sites/facta/td-view";

export const metadata = { title: "T&D — Treinamento e Desenvolvimento" };

export default function TdPage() {
  return (
    <AppShell variant="app">
      <TdView />
    </AppShell>
  );
}
