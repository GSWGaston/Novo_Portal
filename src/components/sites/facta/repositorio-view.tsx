"use client";

import { Library } from "lucide-react";
import { DocLibrary, type DocGroup } from "./doc-library";

// Itens visíveis no repositório do portal original (strings = PDF).
const groups: DocGroup[] = [
  {
    title: "Advice [Compliance Solutions] - Operacional",
    items: [
      { name: "Fluxograma: Envio de Movimentações Financeiras Facta > Advice [E-Guardian]", type: "img" },
      { name: "Fluxo de envios Facta > Advice (resumido)", type: "img" },
      "Envio de movimentações financeiras (Facta > Advice) via Gestão web Facta",
    ],
  },
  {
    title: "Cadastro Agenciador Digital",
    items: [
      "Solução de problemas: Duplicidade de assinaturas",
      "Solução de problemas: Bloqueio de requisições (assinatura eletrônica) - D4Sign",
      "Filtros para controle de etapas (vídeo)",
      "Orientações - Não deletar código de parceiro no Sistema Hórus",
    ],
  },
];

export function RepositorioView() {
  return (
    <DocLibrary
      trail={[{ label: "Dashboard", href: "/" }, { label: "Ajuda" }, { label: "Repositório" }]}
      title="Repositório"
      icon={<Library className="size-8 text-brand" strokeWidth={1.8} />}
      intro="Fluxos, manuais e orientações dos sistemas. Busque pelo título ou filtre por assunto."
      searchLabel="Buscar documento"
      groups={groups}
      categoryFilter
    />
  );
}
