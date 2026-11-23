// Dados fictícios: o portal real mostra chamados e nomes de funcionários, que não são copiados.

export type PortalApp = {
  title: string;
  icon: string;
  color: string;
  gradient?: string;
  href: string;
};

export const portalApps: PortalApp[] = [
  { title: "Agenda Comercial", icon: "fa-calendar", color: "#ff002e", gradient: "linear-gradient(230deg, #ffd6db, #ff4961)", href: "#" },
  { title: "Solicitações", icon: "fa-cogs", color: "#1e9ff2", gradient: "linear-gradient(230deg, #bce2fb, #1e9ff2)", href: "/solicitacoes" },
  { title: "Prospecção Ativa de Clientes", icon: "fa-headphones", color: "#28d094", gradient: "linear-gradient(230deg, #bff1df, #28d094)", href: "#" },
  { title: "RH", icon: "fa-users", color: "#9c27b0", href: "#" },
  { title: "CIPA 2026", icon: "fa-line-chart", color: "#ff9149", href: "#" },
  { title: "Pesquisa de Clima 2023", icon: "fa-line-chart", color: "#666ee8", href: "#" },
  { title: "Avaliação de Desempenho", icon: "fa-bar-chart", color: "#00bcd4", href: "#" },
  { title: "Pesquisa FIA", icon: "fa-bar-chart", color: "#00bcd4", href: "#" },
  { title: "Resultados Pesquisa de Clima GPTW", icon: "fa-line-chart", color: "#666ee8", href: "#" },
];

export type NavMenu = { label: string; icon?: string; href?: string; items?: { label: string; href: string }[] };

export const navMenus: NavMenu[] = [
  { label: "Dashboard", icon: "fa-dashboard", href: "/solicitacoes" },
  {
    label: "Solicitações",
    icon: "fa-th",
    items: [
      { label: "Nova Solicitação", href: "#" },
      { label: "Pendentes do Setor", href: "/solicitacoes/setores" },
      { label: "Meus Atendimentos", href: "#" },
      { label: "Minhas Solicitações", href: "#" },
      { label: "Diário de Solicitações", href: "#" },
    ],
  },
  { label: "Relatórios", icon: "fa-th", items: [{ label: "Satisfação", href: "#" }, { label: "Estatísticas", href: "#" }, { label: "Ramais", href: "#" }] },
  { label: "Diversos", icon: "fa-th", items: [] },
  { label: "Recursos Humanos", icon: "fa-th", items: [] },
  { label: "Ajuda", icon: "fa-th", items: [] },
  { label: "Código de Ética e Conduta", icon: "fa-th", items: [] },
  { label: "Repositório", icon: "fa-th", items: [] },
];

export const reasons = [
  { label: "COMPUTADOR – MANUTENÇÃO", value: 62, color: "#7cb5ec" },
  { label: "COMPUTADOR – LENTIDÃO", value: 28, color: "#434348" },
  { label: "COMPUTADOR – NOVO", value: 4, color: "#90ed7d" },
  { label: "MONITOR – MANUTENÇÃO", value: 2, color: "#f7a35c" },
  { label: "TELEFONIA – OUTROS ASSUNTOS", value: 1, color: "#8085e9" },
  { label: "WINDOWS – TROCA DE VERSÃO", value: 1, color: "#f15c80" },
];

export const attentionTickets = [
  { code: 1000101, status: "AGUARDANDO SOLICITANTE", reason: "COMPUTADOR – LENTIDÃO", last: "05/07/2023", days: 1200 },
  { code: 1000102, status: "AGUARDANDO SOLICITANTE", reason: "COMPUTADOR – LENTIDÃO", last: "06/07/2023", days: 1199 },
  { code: 1000103, status: "AGUARDANDO SOLICITANTE", reason: "COMPUTADOR – MANUTENÇÃO", last: "14/07/2023", days: 1191 },
  { code: 1000104, status: "AGUARDANDO SOLICITANTE", reason: "COMPUTADOR – MANUTENÇÃO", last: "15/07/2023", days: 1190 },
];

export const stats = [
  { key: "open", label: "EM ABERTO", icon: "fa-folder-open-o", color: "#ffa31a", value: 96, ticket: 1000090, days: 410 },
  { key: "pending", label: "PENDENTE", icon: "fa-thumbs-o-down", color: "#b0587f", value: 4, ticket: 1000091, days: 120 },
  { key: "dev", label: "EM DESENVOLVIMENTO", icon: "fa-exchange", color: "#4a8bc9", value: 2, ticket: 1000092, days: 35 },
  { key: "done", label: "CONCLUÍDO", icon: "fa-thumbs-o-up", color: "#4d8a31", value: 1500, ticket: 1000093, days: 180 },
];

export type SectorTicket = {
  code: number;
  priority: "Baixa" | "Média";
  reason: string;
  subreason: string;
  uf: string;
  origin: string;
  requester: string;
  owner: string;
  requested: string;
  updated: string;
  days: number;
  status: string;
};

export const sectorTickets: SectorTicket[] = [
  { code: 1000201, priority: "Baixa", reason: "COMPUTADOR – MANUTENÇÃO", subreason: "", uf: "RS", origin: "ADMINISTRATIVO", requester: "SOLICITANTE EXEMPLO UM", owner: "USUÁRIO DEMO", requested: "18/11/2026 08:57:05", updated: "23/11/2026 13:57:17", days: 4, status: "EM DESENVOLVIMENTO" },
  { code: 1000202, priority: "Baixa", reason: "COMPUTADOR – MANUTENÇÃO", subreason: "SUBSTITUICAO POR DEFEITO", uf: "RS", origin: "FINANCEIRO", requester: "SOLICITANTE EXEMPLO DOIS", owner: "USUÁRIO DEMO", requested: "29/10/2026 09:43:36", updated: "23/11/2026 13:53:46", days: 17, status: "EM DESENVOLVIMENTO" },
  { code: 1000203, priority: "Baixa", reason: "COMPUTADOR – MANUTENÇÃO", subreason: "LENTIDÃO", uf: "RS", origin: "APOIO JURIDICO", requester: "SOLICITANTE EXEMPLO TRÊS", owner: "", requested: "11/11/2026 08:58:06", updated: "23/11/2026 13:46:49", days: 9, status: "PENDENTE VALIDAÇÃO" },
  { code: 1000204, priority: "Baixa", reason: "COMPUTADOR – MANUTENÇÃO", subreason: "MANUTENÇÃO", uf: "RS", origin: "LOJA CENTRO/RS", requester: "SOLICITANTE EXEMPLO QUATRO DA SILVA", owner: "", requested: "23/11/2026 10:11:07", updated: "23/11/2026 13:04:26", days: 1, status: "PENDENTE VALIDAÇÃO" },
  { code: 1000205, priority: "Baixa", reason: "COMPUTADOR – LENTIDÃO", subreason: "LENTIDÃO", uf: "ES", origin: "LOJA VILA – ES", requester: "SOLICITANTE EXEMPLO CINCO", owner: "", requested: "23/11/2026 08:55:11", updated: "23/11/2026 12:41:27", days: 1, status: "PENDENTE VALIDAÇÃO" },
  { code: 1000206, priority: "Média", reason: "COMPUTADOR – MANUTENÇÃO", subreason: "AUMENTO", uf: "RS", origin: "DEMANDAS REGULATÓRIAS", requester: "SOLICITANTE EXEMPLO SEIS", owner: "", requested: "19/11/2026 08:06:53", updated: "23/11/2026 12:37:22", days: 3, status: "PENDENTE VALIDAÇÃO" },
  { code: 1000207, priority: "Baixa", reason: "COMPUTADOR – MANUTENÇÃO", subreason: "NOVO", uf: "RS", origin: "MONITORIA E ANALISE DE DESEMPENHO", requester: "SOLICITANTE EXEMPLO SETE", owner: "ATENDENTE EXEMPLO", requested: "19/11/2026 09:18:06", updated: "23/11/2026 12:28:39", days: 3, status: "EM DESENVOLVIMENTO" },
  { code: 1000208, priority: "Baixa", reason: "COMPUTADOR – LENTIDÃO", subreason: "CRIAÇÃO STATUS ANÁLISE", uf: "RS", origin: "CONTROLADORIA", requester: "SOLICITANTE EXEMPLO OITO", owner: "", requested: "17/11/2026 11:23:58", updated: "23/11/2026 12:22:10", days: 5, status: "PENDENTE VALIDAÇÃO" },
];
