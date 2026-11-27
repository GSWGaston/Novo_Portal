import { redirect } from "next/navigation";

/** Os convênios médicos agora são a aba "Médico" da tela de Convênios. */
export default function ConveniosMedicosPage() {
  redirect("/rh/convenios?tipo=medico");
}
