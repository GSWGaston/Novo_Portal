import { AppShell } from "@/components/sites/facta/app-shell";
import { FeedbackForm } from "@/components/sites/facta/feedback-view";

export const metadata = { title: "Novo feedback" };

export default async function NovoFeedbackPage({ searchParams }: { searchParams: Promise<{ tipo?: string; id?: string }> }) {
  const { tipo, id } = await searchParams;
  return (
    <AppShell variant="app">
      <FeedbackForm tipo={tipo === "adm" ? "adm" : "lojas"} id={id ? Number(id) : undefined} />
    </AppShell>
  );
}
