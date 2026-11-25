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

export type MenuItem = { label: string; href?: string; items?: MenuItem[] };

const soon = (label: string): MenuItem => ({ label, href: "#" });

export const navMenus: MenuItem[] = [
  { label: "Dashboard", href: "/solicitacoes" },
  {
    label: "Solicitações",
    items: [
      { label: "Nova solicitação", href: "/solicitacoes/nova" },
      { label: "Pendentes do setor", href: "/solicitacoes/setores" },
      { label: "Minhas solicitações", href: "/solicitacoes/minhas" },
      { label: "Histórico", href: "/solicitacoes/historico" },
    ],
  },
  { label: "Relatórios", items: [soon("Satisfação"), soon("Estatísticas")] },
  {
    label: "Diversos",
    items: [
      { label: "Reservas de Salas", href: "/diversos/reservas" },
      { label: "Buscar Colaborador", href: "/diversos/colaboradores" },
      { label: "Calendário de Compromissos", href: "/diversos/calendario" },
      { label: "Relação de Aniversários", href: "/diversos/aniversarios" },
      soon("Apoio Facta"),
      { label: "Políticas SEGINFO", href: "/diversos/politicas" },
      { label: "Atas de Reunião", href: "/diversos/atas" },
      soon("Projetos"),
      soon("Organograma Funcional"),
    ],
  },
  {
    label: "Recursos Humanos",
    items: [
      soon("T&D"),
      soon("Folha Ponto"),
      { label: "Biblioteca", items: [soon("Livros"), soon("Peça um livro")] },
      soon("Documentos Institucionais"),
      { label: "Programas Institucionais", items: ["Convênios", "Cidadania Empresarial", "Facta em Foco", "Facta Forma", "Feito para você"].map(soon) },
      { label: "Formulário de Feedback", items: ["Solicitar Feedback Lojas", "Consultar Feedback Lojas", "Consultar Feedback Operacional/Adm"].map(soon) },
      soon("Cartilha de Conduta Profissional Facta"),
      soon("Declaração de Ciência e Concordância (Entrega de Atestado)"),
    ],
  },
  { label: "Ajuda", items: [soon("FAQ"), { label: "Cadastro", items: [soon("FAQ")] }, soon("Banco de Idéias")] },
  { label: "Código de Ética e Conduta", items: [soon("Facta Intermediação de Negócios")] },
  { label: "Repositório", items: [soon("Pesquisa")] },
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
  priority: "Urgente",
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

export type Priority = "Baixa" | "Média" | "Alta" | "Urgente";
export type Status = "Em desenvolvimento" | "Pendente validação" | "Aguardando solicitante" | "Concluído – confirmação";

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
  const priority: Priority = i % 10 === 3 ? "Urgente" : i % 11 === 4 ? "Alta" : i % 5 === 2 ? "Média" : "Baixa";
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

/* ---------- Minhas solicitações e histórico (dados fictícios) ---------- */

const reasonsPool = ["Computador e periféricos", "Materiais de expediente", "Impressoras", "Acesso a sistemas", "E-mail – Caixa cheia", "Equipamento – Monitor"];
const areasPool = ["Área de Suprimentos", "Administrativo – Compras", "Suporte Informática"];
const ownersPool = ["Atendente Exemplo", "Responsável Exemplo Dois", "Responsável Exemplo Três"];
const pad2 = (n: number) => String(n).padStart(2, "0");

function makeTicket(i: number, base: number, over: Partial<Ticket>): Ticket {
  const day = 22 - (i % 20);
  const month = 11 - Math.floor(i / 20);
  const y = 2026;
  const stamp = (d: number, h: number, m: number) => `${pad2(Math.max(1, d))}/${pad2(Math.max(1, month))}/${y} ${pad2(h)}:${pad2(m)}`;
  const reason = reasonsPool[i % reasonsPool.length];
  return {
    code: base + i,
    title: reason,
    subtitle: ["Instalação", "Substituição", "Configuração", "Verificação"][i % 4],
    priority: i % 17 === 3 ? "Urgente" : i % 9 === 4 ? "Alta" : i % 4 === 1 ? "Média" : "Baixa",
    status: "Concluído – confirmação",
    origin: areasPool[i % areasPool.length],
    requester: currentUser.name,
    owner: ownersPool[i % ownersPool.length],
    uf: "RS",
    updated: stamp(day, 9 + (i % 8), (i * 11) % 60),
    opened: stamp(day - 2, 8 + (i % 6), (i * 17) % 60),
    days: 1 + (i * 2) % 14,
    firstMessage: "Preciso de ajuda com este item. Quando seria possível o atendimento?",
    lastMessage: "Atendimento concluído e confirmado pelo solicitante.",
    ...over,
  };
}

/** Chamados que o próprio usuário abriu. */
export const myRequests: Ticket[] = Array.from({ length: 36 }, (_, i) =>
  makeTicket(i, 1000101, i < 4 ? { status: "Em desenvolvimento", lastMessage: "O equipamento foi encaminhado e está em atendimento." } : i < 7 ? { status: "Aguardando solicitante", lastMessage: "Aguardando seu retorno para continuar o atendimento." } : i < 9 ? { status: "Pendente validação", lastMessage: "Atendimento concluído. Valide para encerrar o chamado." } : {}),
);

/** Chamados já encerrados que o usuário atendeu (somam-se aos que ele ainda atende em `tickets`). */
export const closedByMe: Ticket[] = Array.from({ length: 14 }, (_, i) =>
  makeTicket(i, 1000051, { requester: people[i % people.length], owner: currentUser.name, origin: origins[i % origins.length], uf: ufs[i % ufs.length] }),
);

/* ---------- Histórico do chamado (dados fictícios) ---------- */

export type HistoryEntry = {
  id: string;
  user: string;
  date: string;
  time: string;
  text: string;
  status: string;
  /** mensagem automática do sistema (ícone de engrenagem) */
  auto?: boolean;
};

export const initials = (name: string) =>
  name
    .split(" ")
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

/** Login no estilo do portal: primeiro nome + iniciais, em maiúsculas. */
export const loginOf = (name: string) => {
  const [first, ...rest] = name.split(" ");
  return (first + rest.map((p) => p[0] ?? "").join("")).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
};

export function historyFor(t: Ticket): HistoryEntry[] {
  const date = t.opened.slice(0, 10);
  const h0 = Number(t.opened.slice(11, 13));
  const at = (h: number, m: number, s: number) => [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
  const support = t.owner || "Atendente Exemplo";
  const status = t.status.toUpperCase();
  const e = (id: number, user: string, h: number, m: number, text: string, st: string, auto = false): HistoryEntry => ({ id: String(id), user, date, time: at(h, m, 7 + id), text, status: st, auto });
  return [
    e(1, loginOf(t.requester), h0, 5, t.firstMessage, "PENDENTE"),
    e(2, loginOf(support), h0 + 1, 12, "Encaminhando chamado ao atendimento.\n\nAnalisando o equipamento para dar sequência.", status),
    e(3, loginOf(t.requester), h0 + 2, 30, "Prezados, algum retorno? Preciso usar essa máquina com urgência.", status),
    e(4, loginOf(support), h0 + 3, 26, `ACOMPANHAMENTO INTERNO\nChamado visualizado por ${support.toUpperCase()} e não efetuado nenhum registro.`, status, true),
    { id: "5", user: loginOf(support), date: t.updated.slice(0, 10), time: `${t.updated.slice(11)}:00`, text: t.lastMessage, status },
  ];
}
