// Todos os dados são fictícios; o usuário real vem da sessão quando houver backend.

export const currentUser = { name: "Usuário Demo", first: "Usuário", initials: "UD" };

export type PortalApp = {
  title: string;
  description: string;
  icon: "calendar" | "cogs" | "headset" | "users" | "trend" | "bars";
  tone: "red" | "blue" | "green" | "purple" | "orange" | "indigo" | "cyan" | "violet";
  href: string;
};

export const portalApps: PortalApp[] = [
  { title: "Agenda Comercial", description: "Compromissos, visitas e agenda da equipe comercial.", icon: "calendar", tone: "red", href: "#" },
  { title: "Solicitações", description: "Abertura e acompanhamento de chamados internos.", icon: "cogs", tone: "blue", href: "/solicitacoes" },
  { title: "Prospecção Ativa de Clientes", description: "Gestão e acompanhamento de prospecções.", icon: "headset", tone: "green", href: "#" },
  { title: "RH", description: "Serviços, documentos e solicitações de Recursos Humanos.", icon: "users", tone: "purple", href: "#" },
  { title: "CIPA 2026", description: "Informações, documentos e ações da CIPA.", icon: "trend", tone: "orange", href: "#" },
  { title: "Pesquisa de Clima 2023", description: "Resultados e análises da pesquisa de clima.", icon: "trend", tone: "indigo", href: "#" },
  { title: "Avaliação de Desempenho", description: "Acompanhamento de metas e avaliações.", icon: "bars", tone: "cyan", href: "#" },
  { title: "Pesquisa FIA", description: "Participação e resultados da Pesquisa FIA.", icon: "bars", tone: "cyan", href: "#" },
  { title: "Resultados Pesquisa de Clima GPTW", description: "Resultados e indicadores da pesquisa GPTW.", icon: "trend", tone: "violet", href: "#" },
];

export type Announcement = {
  id: string;
  /** "urgent" abre como popup; "info" fica integrado na página. */
  level: "urgent" | "info";
  tag: string;
  title: string;
  text: string;
  highlight?: string;
  facts?: { label: string; value: string }[];
};

export const announcements: Announcement[] = [
  {
    id: "doacao-sangue",
    level: "urgent",
    tag: "Comunicado urgente",
    title: "Doação de Sangue",
    text: "A Facta, em parceria com o Hemocentro/RS, realizará uma ação de doação de sangue para nossos colaboradores. Sua solidariedade pode salvar vidas!",
    highlight: "Hoje é o último dia para as inscrições! Inscrições até às 12h00.",
    facts: [
      { label: "Data da doação", value: "24/11" },
      { label: "Horários", value: "09h00 e 14h00" },
      { label: "Local", value: "Recepção do RH" },
    ],
  },
  {
    id: "manutencao-portal",
    level: "info",
    tag: "Comunicado interno",
    title: "Nova versão do portal",
    text: "O portal ganhou um visual novo. Se algo não estiver onde você esperava, abra um chamado em Solicitações.",
    facts: [{ label: "Versão", value: "v2.4.0" }],
  },
];

export const navMenus: { label: string; href?: string; items?: { label: string; href: string }[] }[] = [
  { label: "Dashboard", href: "/solicitacoes" },
  {
    label: "Solicitações",
    items: [
      { label: "Nova solicitação", href: "#" },
      { label: "Pendentes do setor", href: "/solicitacoes/setores" },
      { label: "Meus atendimentos", href: "#" },
      { label: "Minhas solicitações", href: "#" },
      { label: "Diário de solicitações", href: "#" },
    ],
  },
  { label: "Relatórios", items: [{ label: "Satisfação", href: "#" }, { label: "Estatísticas", href: "#" }, { label: "Ramais", href: "#" }] },
  { label: "Diversos", items: [] },
  { label: "Recursos Humanos", items: [] },
  { label: "Ajuda", items: [] },
  { label: "Código de Ética e Conduta", href: "#" },
  { label: "Repositório", items: [] },
];

export const notifications = [
  { id: 1, title: "Chamado #1000201 foi atualizado", when: "há 5 min" },
  { id: 2, title: "Chamado #1000202 aguarda sua validação", when: "há 1 h" },
  { id: 3, title: "Nova versão do portal disponível", when: "ontem" },
];

/* ---------- Dashboard ---------- */

export type Scope = "individual" | "setor";

export const dashboardByScope: Record<
  Scope,
  { open: number; pending: number; dev: number; done: number; deltas: [number, number, number, number]; reasons: { label: string; value: number }[] }
> = {
  individual: {
    open: 140, pending: 32, dev: 28, done: 96, deltas: [12, -18, -7, 20],
    reasons: [
      { label: "Acesso a sistemas", value: 42 },
      { label: "Equipamentos (hardware)", value: 28 },
      { label: "E-mails e contas", value: 18 },
      { label: "Impressoras", value: 12 },
      { label: "Outros", value: 8 },
    ],
  },
  setor: {
    open: 412, pending: 87, dev: 64, done: 305, deltas: [5, -9, 3, 14],
    reasons: [
      { label: "Acesso a sistemas", value: 120 },
      { label: "Equipamentos (hardware)", value: 96 },
      { label: "E-mails e contas", value: 71 },
      { label: "Impressoras", value: 44 },
      { label: "Outros", value: 31 },
    ],
  },
};

export const urgentTicket = {
  code: 1000123,
  priority: "Alta",
  text: "Computador da loja apresentando lentidão ao abrir o sistema. Solicita verificação do equipamento e atualização da ferramenta de acesso remoto.",
  sector: "Suporte Informática",
  opened: "13/07/2023 (850 dias)",
};

export const idleTickets = [
  { code: 1000101, text: "Aguardando retorno do solicitante", days: 8 },
  { code: 1000102, text: "Aguardando retorno do solicitante", days: 9 },
  { code: 1000103, text: "Aguardando retorno do solicitante", days: 12 },
];

/* ---------- Chamados do setor ---------- */

export type Priority = "Baixa" | "Média" | "Alta";
export type Status = "Em desenvolvimento" | "Pendente validação";

export type Ticket = {
  code: number;
  title: string;
  subtitle: string;
  priority: Priority;
  status: Status;
  origin: string;
  requester: string;
  owner: string;
  uf: string;
  updated: string;
  opened: string;
  days: number;
  firstMessage: string;
  lastMessage: string;
};

const titles = [
  ["Computador – Manutenção", "Formatação do computador"],
  ["Computador – Manutenção", "Instalação de software de controle"],
  ["Computador – Lentidão", "Lentidão no sistema"],
  ["Computador – Manutenção", "Monitoria e análise de desempenho"],
  ["Computador – Manutenção", "Substituição de periférico"],
  ["Computador – Manutenção", "Instalação de impressora de rede"],
  ["Acesso a sistemas", "Liberação de acesso"],
  ["E-mail – Caixa cheia", "Aumento de caixa"],
] as const;
const origins = ["Facta Financeira", "Apoio Jurídico", "Loja São José – SC", "Administrativo", "Loja Santa Rosa", "Recursos Humanos", "Informática", "Controladoria"];
const people = ["Solicitante Exemplo Um", "Solicitante Exemplo Dois", "Solicitante Exemplo Três", "Solicitante Exemplo Quatro", "Solicitante Exemplo Cinco", "Solicitante Exemplo Seis"];
const ufs = ["RS", "RS", "SC", "RS", "PR", "ES", "RS", "RJ"];

export const tickets: Ticket[] = Array.from({ length: 32 }, (_, i) => {
  const [title, subtitle] = titles[i % titles.length];
  const status: Status = i % 3 === 0 ? "Em desenvolvimento" : "Pendente validação";
  const priority: Priority = i % 11 === 4 ? "Alta" : i % 5 === 2 ? "Média" : "Baixa";
  const day = 23 - (i % 12);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    code: 1000201 + i,
    title,
    subtitle,
    priority,
    status,
    origin: origins[i % origins.length],
    requester: people[i % people.length],
    owner: status === "Em desenvolvimento" ? currentUser.name : i % 4 === 1 ? "Atendente Exemplo" : "",
    uf: ufs[i % ufs.length],
    updated: `${pad(day)}/11/2026 ${pad(8 + (i % 9))}:${pad((i * 7) % 60)}`,
    opened: `${pad(Math.max(1, day - 4 - (i % 5)))}/11/2026 ${pad(8 + (i % 6))}:${pad((i * 13) % 60)}`,
    days: 1 + (i * 3) % 19,
    firstMessage: "Boa tarde! Preciso de ajuda com este equipamento, quando seria possível o atendimento?",
    lastMessage:
      status === "Em desenvolvimento"
        ? "O equipamento foi encaminhado e está em processo de atendimento. Previsão de conclusão: hoje, até o final do dia."
        : "Atendimento concluído. Aguardando a validação do solicitante para encerrar o chamado.",
  };
});

/* ---------- Histórico do chamado (dados fictícios) ---------- */

export type HistoryEntry = {
  id: string;
  kind: "message" | "note" | "system";
  author: string;
  role: "Solicitante" | "Suporte" | "Sistema";
  when: string;
  text: string;
};

const initials = (name: string) =>
  name
    .split(" ")
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
export { initials };

export function historyFor(t: Ticket): HistoryEntry[] {
  const day = t.opened.slice(0, 10);
  const hour = (h: number, m: number) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const h0 = Number(t.opened.slice(11, 13));
  const support = t.owner || "Atendente Exemplo";
  const list: HistoryEntry[] = [
    { id: "1", kind: "message", author: t.requester, role: "Solicitante", when: `${day} às ${hour(h0, 5)}`, text: t.firstMessage },
    { id: "2", kind: "system", author: "Sistema", role: "Sistema", when: `${day} às ${hour(h0, 6)}`, text: `Chamado aberto por ${t.requester} via Portal, com prioridade ${t.priority}.` },
    { id: "3", kind: "note", author: support, role: "Suporte", when: `${day} às ${hour(h0 + 1, 12)}`, text: "Acompanhamento interno: chamado visualizado e equipamento verificado remotamente. Aguardando janela de atendimento." },
    { id: "4", kind: "message", author: support, role: "Suporte", when: `${day} às ${hour(h0 + 2, 30)}`, text: "Olá! Analisamos o caso e vamos dar sequência ao atendimento. Retornamos em breve com novidades." },
    { id: "5", kind: "message", author: support, role: "Suporte", when: t.updated.replace(" ", " às "), text: t.lastMessage },
  ];
  if (t.status === "Pendente validação") {
    list.push({ id: "6", kind: "system", author: "Sistema", role: "Sistema", when: t.updated.replace(" ", " às "), text: "Status do chamado alterado para: Pendente validação." });
  }
  return list;
}
