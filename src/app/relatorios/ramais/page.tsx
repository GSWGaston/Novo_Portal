import { redirect } from "next/navigation";

/** Endereço antigo: a tela agora é "Buscar Colaborador". */
export default function RamaisPage() {
  redirect("/diversos/colaboradores");
}
