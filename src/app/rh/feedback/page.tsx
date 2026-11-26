import { AppShell } from "@/components/sites/facta/app-shell";
import { FeedbackList } from "@/components/sites/facta/feedback-view";

export const metadata = { title: "Feedback" };

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ tipo?: string; salvo?: string }> }) {
  const { tipo, salvo } = await searchParams;
  return (
    <AppShell variant="app">
      <FeedbackList key={salvo ?? ""} initialTipo={tipo === "adm" ? "adm" : "lojas"} saved={salvo} />
    </AppShell>
  );
}
