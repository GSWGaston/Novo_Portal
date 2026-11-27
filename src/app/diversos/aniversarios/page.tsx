import { redirect } from "next/navigation";

/** A relação de aniversários agora fica em Colaboradores (filtro por mês). */
export default function AniversariosPage() {
  redirect("/diversos/colaboradores");
}
