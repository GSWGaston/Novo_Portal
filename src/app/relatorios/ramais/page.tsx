import { redirect } from "next/navigation";

/** Endereço antigo: a tela agora é "Colaboradores". */
export default function RamaisPage() {
  redirect("/diversos/colaboradores");
}
