import { AppShell } from "@/components/sites/facta/app-shell";
import { FaqView } from "@/components/sites/facta/faq-view";

export const metadata = { title: "Perguntas frequentes" };

export default function FaqPage() {
  return (
    <AppShell variant="app">
      <FaqView />
    </AppShell>
  );
}
