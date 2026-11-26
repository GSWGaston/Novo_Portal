"use client";

import { ShieldCheck } from "lucide-react";
import { DocLibrary, type DocGroup } from "./doc-library";

const groups: DocGroup[] = [
  {
    title: "Segurança cibernética",
    items: ["Política de Segurança Cibernética Facta", "Política de Segurança Cibernética Financeira", "Política de Segurança Cibernética Seguradora"],
  },
  {
    title: "Acessos e senhas",
    items: [
      "Política Geral de Revisão de Acesso",
      "Política de Revisão de Contas Privilegiadas e Administrativas",
      "Política de Criação de Acessos",
      "Política de Revogação de Acessos",
      "Política de Gestão de Contas Genéricas",
      "Política de Gestão de Acessos Facta Financeira",
      "Política de Criação de Senha",
      "Política de Criação de Senha Facta Financeira",
    ],
  },
  {
    title: "Mudanças e backup",
    items: ["Política de Gestão de Mudanças Facta", "Política de Gestão de Mudanças Facta Financeira", "Política de Backup Facta", "Política de Backup Facta Financeira"],
  },
  {
    title: "Incidentes e continuidade",
    items: [
      "Política de Gestão de Resposta a Incidentes Críticos",
      "Plano de Resposta a Incidentes Críticos",
      "Política de Gestão de Vulnerabilidades",
      "Política PCN - Plano de Continuidade de Negócios",
    ],
  },
  { title: "Infraestrutura e conduta", items: ["Política de Uso de Firewall", "Código de Ética e Conduta"] },
];

export function PoliticasView() {
  return (
    <DocLibrary
      trail={[{ label: "Dashboard", href: "/" }, { label: "Documentos" }, { label: "Políticas SEGINFO" }]}
      title="Políticas SEGINFO"
      icon={<ShieldCheck className="size-8 text-brand" strokeWidth={1.8} />}
      intro="Políticas de segurança da informação. Escolha um documento para baixar em PDF."
      searchLabel="Buscar política"
      groups={groups}
    />
  );
}
