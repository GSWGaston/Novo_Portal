"use client";

import { FolderOpen } from "lucide-react";
import { DocLibrary, type DocGroup, type DocType } from "./doc-library";

const d = (name: string, type: DocType) => ({ name, type });
const word = (name: string) => d(name, "doc");
// 20, 40 e 80 dias de cada formulário de avaliação (Word)
const periodos = (base: string) => [20, 40, 80].map((n) => word(`${base} - ${n} dias`));

// Lista do portal original, com a acentuação corrigida (lá vários nomes aparecem como "avalia??o").
const groups: DocGroup[] = [
  {
    title: "Avaliações 20/40/80 - Lojas",
    items: [
      ...periodos("Supervisor (autoavaliação)"),
      ...periodos("Supervisor (avaliação do gestor)"),
      ...periodos("Consultor (autoavaliação)"),
      ...periodos("Consultor (avaliação do gestor)"),
    ],
  },
  {
    title: "Avaliações 20/40/80 - ADM, Operacional, RH e Comercial",
    items: [...periodos("Colaborador (autoavaliação)"), ...periodos("Colaborador (avaliação do gestor)")],
  },
  { title: "Biblioteca", items: ["Termo de Compromisso e Responsabilidade BIF"] },
  {
    title: "Documentos Admissionais",
    items: ["Cadastro colaborador", "Checklist Admissão", word("Modelo de Abertura de Conta Santander"), d("Checklist Estágio 28 fev", "xls")],
  },
  {
    title: "Documentos de Acompanhamento e Desenvolvimento",
    items: [
      "Políticas de pontuação de feedback",
      word("Formulário de Feedback - Exclusivo Produção Própria"),
      word("Formulário de Feedback - Exclusivo Prestador de Serviços"),
      word("Formulário de Feedback - Exclusivo Área Comercial"),
      "Formulário de Feedback - Exclusivo Área Comercial",
      word("Formulário de Feedback - Exclusivo Área Administrativa e Operacional"),
    ],
  },
  { title: "Documentos de Seleção", items: ["Ficha de entrevista - Estágio", "Ficha de entrevista"] },
  {
    title: "Geral",
    items: [
      d("Apresentação Trabalho Temporário Explorer", "ppt"),
      "Informativo Temporários",
      "Informativo Temporários (2)",
      "Informativo Temporários_Okê",
      "Pesquisa de Clima Organizacional 2018",
      "Termo de Compromisso e Responsabilidade BIF",
      "Orientações Medida Provisória 936",
      word("Declaração biometria - Acesso ao Prédio"),
      word("Férias retorno de licença"),
      "Manual do Ponto",
      d("Somos Lugares Incríveis 2026 (Certificado Clima Organizacional)", "img"),
      "Política de Uso do Celular Versão Rede",
      word("Termo de ciência e concordância - Política Uso do Celular"),
    ],
  },
  {
    title: "Materiais Gestão",
    items: [
      word("Recibo limpeza - Lojas Ágil"),
      word("Recibo limpeza - Lojas Facta"),
      "Instrução solicitação limpeza",
      "Sugestões entrevista",
      word("Termo de campanha"),
      "Exercícios integração",
      "Política caixa lojas",
      d("Planilha de prestação de contas caixa", "xls"),
      d("Solicitação de pagamento", "xls"),
      word("Ficha de entrevista"),
    ],
  },

];

export function DocumentosView() {
  return (
    <DocLibrary
      trail={[{ label: "Dashboard", href: "/" }, { label: "Documentos" }, { label: "Documentos Institucionais" }]}
      title="Documentos Institucionais"
      icon={<FolderOpen className="size-8 text-brand" strokeWidth={1.8} />}
      intro="Formulários, termos e materiais do RH. Escolha um documento para baixar."
      searchLabel="Buscar documento"
      groups={groups}
      categoryFilter
    />
  );
}
