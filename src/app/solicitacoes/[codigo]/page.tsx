import { notFound } from "next/navigation";
import { AppShell } from "@/components/sites/facta/app-shell";
import { tickets } from "@/components/sites/facta/data";
import { TicketDetail } from "@/components/sites/facta/ticket-detail";

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  return { title: `Chamado #${codigo}` };
}

export default async function ChamadoPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const ticket = tickets.find((t) => String(t.code) === codigo);
  if (!ticket) notFound();
  return (
    <AppShell variant="app">
      <TicketDetail ticket={ticket} />
    </AppShell>
  );
}
