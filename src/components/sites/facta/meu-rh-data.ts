import { currentUser, type MenuItem } from "./data";

/* Sistema RH (card "RH" da home): menu próprio, sem Dashboard. Todos os dados são fictícios. */

export const rhMenus: MenuItem[] = [
  { label: "Meus Dados", href: "/meu-rh/dados" },
  { label: "Comprovantes", href: "/meu-rh/comprovantes" },
  { label: "Oportunidades Facta", href: "/meu-rh/oportunidades" },
  { label: "CIPA", href: "/meu-rh/cipa" },
];

/** Dados que vêm da folha e o colaborador só consulta. */
export const cadastro = {
  codigo: "15166",
  nome: currentUser.name,
  prorrogacaoExperiencia: "03/07/2023",
  tipo: "Empregado",
  primeiroEmprego: "Não",
  cargo: "Técnico em TI Júnior",
  dataInicial: "06/03/2023",
  situacao: "Ativo",
  admissao: "03/07/2023",
  centroCustos: "Informática",
  empresa: "Facta Matriz",
  nascimento: "01/01/2000",
  cpf: "000.000.000-00",
  rg: "0000000000",
  pis: "000.00000.00-0",
  carteira: "0000000",
  serie: "0000",
  demissao: "",
};

export const beneficios = {
  planoSaude: "Unimed Unifácil",
  valeTransporte: 0,
  valeRefeicao: 630,
  dependentes: 0,
  filhos: 0,
};

export const UFS = ["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"];

/* ---------- comprovantes ---------- */

export type TipoComprovante = "Contracheque" | "13º" | "DIRF";
export type Comprovante = { id: string; tipo: TipoComprovante; mes: number; ano: number; label: string };

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
export const nomeMes = (m: number) => MESES[m - 1];

/** Desde a admissão (07/2023) até o último mês fechado (10/2026). Mais recente primeiro. */
export const comprovantes: Comprovante[] = (() => {
  const out: Comprovante[] = [];
  for (let ano = 2023; ano <= 2026; ano++) {
    for (let mes = ano === 2023 ? 7 : 1; mes <= (ano === 2026 ? 10 : 12); mes++) {
      out.push({ id: `cc-${ano}-${mes}`, tipo: "Contracheque", mes, ano, label: `Contracheque de ${nomeMes(mes)}` });
      if (mes === 11) out.push({ id: `13a-${ano}`, tipo: "13º", mes, ano, label: "13º salário: 1ª parcela" });
      if (mes === 12) out.push({ id: `13b-${ano}`, tipo: "13º", mes, ano, label: "13º salário: 2ª parcela" });
    }
    // a DIRF de um ano sai em fevereiro do ano seguinte
    if (ano < 2026) out.push({ id: `dirf-${ano}`, tipo: "DIRF", mes: 2, ano: ano + 1, label: `Informe de rendimentos ${ano}` });
  }
  return out.sort((a, b) => b.ano - a.ano || b.mes - a.mes || a.tipo.localeCompare(b.tipo));
})();

/* ---------- oportunidades ---------- */

export type Vaga = { id: number; titulo: string; area: string; local: string; modelo: string; aberta: string; ate: string; resumo: string; requisitos: string[] };
export const vagas: Vaga[] = [
  {
    id: 1,
    titulo: "Analista de Suporte Pleno",
    area: "Informática",
    local: "Matriz · Porto Alegre/RS",
    modelo: "Presencial",
    aberta: "10/11/2026",
    ate: "05/12/2026",
    resumo: "Atendimento de chamados de segundo nível, gestão de estações de trabalho e apoio às lojas.",
    requisitos: ["Experiência com suporte a usuários", "Conhecimento em Windows e redes", "Curso técnico ou superior em andamento na área"],
  },
  {
    id: 2,
    titulo: "Coordenador(a) de Loja",
    area: "Comercial",
    local: "Loja Centro · Porto Alegre/RS",
    modelo: "Presencial",
    aberta: "18/11/2026",
    ate: "12/12/2026",
    resumo: "Liderança da equipe da loja, acompanhamento de metas e atendimento a clientes.",
    requisitos: ["Experiência com vendas de crédito consignado", "Vivência em liderança de equipe"],
  },
];

/* ---------- CIPA ---------- */

export const cipaVotacao = { inicio: "28/07/2026 às 10:15", fim: "30/07/2026 às 18:00" };
export type Candidato = { posicao?: string; codigo: string; nome: string; setor: string; admissao: string; votos: number };
// nomes fictícios; a estrutura (eleitos, suplentes e demais) segue o resultado do portal
export const cipaResultados: Record<number, Candidato[]> = {
  2026: [
    { posicao: "1º eleito", codigo: "12229", nome: "Ana Exemplo Alves", setor: "14 - Recursos Humanos", admissao: "03/01/2022", votos: 38 },
    { posicao: "2º eleito", codigo: "14201", nome: "Bruna Exemplo Pereira", setor: "5 - Cadastros e Logins", admissao: "15/09/2023", votos: 35 },
    { posicao: "3º eleito", codigo: "4482", nome: "Carla Exemplo Ramos", setor: "14 - Recursos Humanos", admissao: "15/01/2015", votos: 21 },
    { posicao: "1º suplente", codigo: "14638", nome: "Daniela Exemplo Silva", setor: "367 - Demandas Regulatórias", admissao: "26/11/2024", votos: 9 },
    { posicao: "2º suplente", codigo: "6851", nome: "Eduardo Exemplo Souza", setor: "258 - Administrativo/Agentes", admissao: "19/02/2018", votos: 7 },
    { codigo: "16290", nome: "Fernanda Exemplo Lima", setor: "309 - Administrativo", admissao: "13/03/2024", votos: 6 },
    { codigo: "358", nome: "Gustavo Exemplo Costa", setor: "367 - Demandas Regulatórias", admissao: "17/09/2015", votos: 3 },
  ],
  2025: [
    { posicao: "1º eleito", codigo: "9921", nome: "Helena Exemplo Prado", setor: "7 - Financeiro", admissao: "02/05/2019", votos: 41 },
    { posicao: "2º eleito", codigo: "12229", nome: "Ana Exemplo Alves", setor: "14 - Recursos Humanos", admissao: "03/01/2022", votos: 29 },
    { posicao: "3º eleito", codigo: "7710", nome: "Igor Exemplo Rocha", setor: "2 - Informática", admissao: "11/08/2017", votos: 18 },
    { posicao: "1º suplente", codigo: "15002", nome: "Júlia Exemplo Martins", setor: "309 - Administrativo", admissao: "20/02/2024", votos: 10 },
    { posicao: "2º suplente", codigo: "4482", nome: "Carla Exemplo Ramos", setor: "14 - Recursos Humanos", admissao: "15/01/2015", votos: 8 },
  ],
  2024: [
    { posicao: "1º eleito", codigo: "4482", nome: "Carla Exemplo Ramos", setor: "14 - Recursos Humanos", admissao: "15/01/2015", votos: 33 },
    { posicao: "2º eleito", codigo: "9921", nome: "Helena Exemplo Prado", setor: "7 - Financeiro", admissao: "02/05/2019", votos: 30 },
    { posicao: "3º eleito", codigo: "6851", nome: "Eduardo Exemplo Souza", setor: "258 - Administrativo/Agentes", admissao: "19/02/2018", votos: 17 },
    { posicao: "1º suplente", codigo: "358", nome: "Gustavo Exemplo Costa", setor: "367 - Demandas Regulatórias", admissao: "17/09/2015", votos: 11 },
  ],
};

/** Contracheques e 13º precisam de assinatura eletrônica; a DIRF não. Na demonstração, só o último contracheque está pendente. */
export const precisaAssinar = (c: Comprovante) => c.tipo !== "DIRF";
export const PENDENTES_INICIAIS = ["cc-2026-10"];
