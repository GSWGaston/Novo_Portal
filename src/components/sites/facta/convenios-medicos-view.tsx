"use client";

import { BookOpenText, CalendarClock, Download, HandCoins, HeartPulse, Info, Smile, Stethoscope, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Select } from "./select";
import { cn } from "@/lib/utils";
import { PdfReader } from "./pdf-reader";

const DIR = "/sites/facta/docs/planos/";

type Faixa = [string, string];
type Tabela = { plano: string; faixas: Faixa[] };
type Plano = {
  name: string;
  kind: string;
  color: string;
  tags: string[];
  resumo: string;
  fatos: { label: string; value: string }[];
  tabelas?: Tabela[];
  file: string;
  /** Arquivos Word não abrem no leitor; só baixar. */
  word?: boolean;
};

const IDADES = ["0 a 18", "19 a 23", "24 a 28", "29 a 33", "34 a 38", "39 a 43", "44 a 48", "49 a 53", "54 a 58", "59 ou mais"];
const tabela = (plano: string, valores: string[]): Tabela => ({ plano, faixas: IDADES.map((idade, i) => [idade, `R$ ${valores[i]}`]) });

// Mensalidades 2025-2026 (documentos da Unimed por empresa, atualizados em 27/10/2026).
const UNIFACIL = tabela("Unifácil · ambulatorial", ["111,87", "128,65", "147,88", "170,43", "195,67", "227,01", "274,67", "357,09", "482,09", "670,47"]);
const UNIPART = tabela("Unipart · semiprivativo", ["528,90", "608,21", "699,20", "804,46", "925,06", "1.073,11", "1.298,46", "1.688,22", "2.279,03", "3.169,71"]);
const UNIPART_AGIL = tabela("Unipart · semiprivativo", ["459,90", "528,90", "608,01", "699,58", "804,38", "933,18", "1.129,13", "1.468,06", "1.981,83", "2.756,37"]);
const UNIMAX_SEMI = tabela("Unimax · semiprivativo", ["620,36", "713,43", "820,11", "943,58", "1.085,02", "1.258,73", "1.523,00", "1.980,19", "2.673,14", "3.717,85"]);
const UNIMAX_PRIV = tabela("Unimax · privativo", ["1.074,05", "1.235,15", "1.419,88", "1.633,63", "1.878,51", "2.179,23", "2.636,77", "3.428,35", "4.628,07", "6.436,76"]);
// Doctor Clin Flex Just Ambulatorial, reajuste com vigência em maio/2026.
const DC_AMB: Tabela = {
  plano: "Flex Just Ambulatorial",
  faixas: [["0 a 18", "R$ 108,40"], ["19 a 43", "R$ 126,50"], ["44 a 53", "R$ 198,75"], ["54 a 58", "R$ 291,11"], ["59 ou mais", "R$ 361,40"]],
};

const UNIMED = "#00995d";
const DOCTOR = "#0a7f8c";
const ODONTO = "#2e9b4f";

const unifacilTxt = "Unifácil: só consultas e exames, atendimento nos núcleos Unifácil da região.";
const unipartTxt = "Unipart: cobertura nacional, com internação em quarto compartilhado.";
const unimaxTxt = "Unimax: o mais completo, rede nacional e transporte aeromédico.";

const grupos: { title: string; icon: typeof HeartPulse; intro: string; items: Plano[] }[] = [
  {
    title: "Unimed · mensalidades por empresa",
    icon: HeartPulse,
    intro: "Cada empresa do grupo tem os seus planos e valores. Confira a sua empresa de contratação antes de pedir o plano.",
    items: [
      {
        name: "Facta Financeira S.A.",
        kind: "Unimed · 3 planos",
        color: UNIMED,
        tags: ["Unifácil", "Unipart", "Unimax"],
        resumo: `${unifacilTxt} ${unipartTxt} ${unimaxTxt}`,
        fatos: [
          { label: "Mensalidade", value: "a partir de R$ 111,87, conforme o plano e a idade" },
          { label: "Unimax", value: "em quarto semiprivativo ou privativo" },
          { label: "Odonto Mais", value: "+ R$ 29,90 por mês (opcional)" },
        ],
        tabelas: [UNIFACIL, UNIPART, UNIMAX_SEMI, UNIMAX_PRIV],
        file: "unimed-facta-financeira.docx",
        word: true,
      },
      {
        name: "Facta Matriz e Região Metropolitana",
        kind: "Unimed · 3 planos (Facta Intermediação)",
        color: UNIMED,
        tags: ["Unifácil", "Unipart", "Unimax"],
        resumo: `${unifacilTxt} ${unipartTxt} ${unimaxTxt}`,
        fatos: [
          { label: "Mensalidade", value: "a partir de R$ 111,87, conforme o plano e a idade" },
          { label: "Unimax", value: "só em quarto privativo" },
          { label: "Odonto Mais", value: "+ R$ 29,90 por mês (opcional)" },
        ],
        tabelas: [UNIFACIL, UNIPART, UNIMAX_PRIV],
        file: "unimed-facta-intermediacao.docx",
        word: true,
      },
      {
        name: "Praticall Central de Atendimento",
        kind: "Unimed · 2 planos",
        color: UNIMED,
        tags: ["Unifácil", "Unipart"],
        resumo: `${unifacilTxt} ${unipartTxt}`,
        fatos: [{ label: "Mensalidade", value: "a partir de R$ 111,87, conforme o plano e a idade" }],
        tabelas: [UNIFACIL, UNIPART],
        file: "unimed-praticall.docx",
        word: true,
      },
      {
        name: "ER Serviços de Cobrança",
        kind: "Unimed · Unifácil",
        color: UNIMED,
        tags: ["Ambulatorial", "Coparticipação"],
        resumo: "Plano local e econômico: consultas e exames nos núcleos Unifácil, com agendamento por telefone, app ou site. Não cobre internação.",
        fatos: [
          { label: "Mensalidade", value: "a partir de R$ 111,87, conforme a idade" },
          { label: "Agendamento", value: "4020-3113, das 7h às 22h, ou app Unimed POA" },
        ],
        tabelas: [UNIFACIL],
        file: "unimed-er-servicos.docx",
        word: true,
      },
      {
        name: "Ágil Promotora e Assessoria",
        kind: "Unimed · Unipart",
        color: UNIMED,
        tags: ["Nacional", "Ambulatorial e hospitalar"],
        resumo: "Cobertura em todo o Brasil, com consultas, exames e internação em quarto compartilhado. Exames nos serviços próprios da Unimed têm coparticipação menor.",
        fatos: [{ label: "Mensalidade", value: "a partir de R$ 459,90, conforme a idade" }],
        tabelas: [UNIPART_AGIL],
        file: "unimed-agil-promotora.docx",
        word: true,
      },
    ],
  },
  {
    title: "Unimed · guias e odonto",
    icon: Smile,
    intro: "Como usar o aplicativo da Unimed e o plano odontológico ligado a ela.",
    items: [
      {
        name: "Manual do app Unimed POA",
        kind: "Guia de uso · 38 páginas",
        color: UNIMED,
        tags: ["Aplicativo", "Passo a passo"],
        resumo: "Ensina a baixar e se cadastrar no app, usar o cartão virtual e buscar médicos no guia da Unimed POA e do Brasil.",
        fatos: [
          { label: "Cartão virtual", value: "gere o token na hora do atendimento; ele vale por 30 minutos" },
          { label: "No app", value: "agendar consulta, resultados de exames, autorizações e extrato de coparticipação" },
          { label: "MédicOnline", value: "consulta por vídeo, sem sair de casa" },
        ],
        file: "manual-app-unimed.pdf",
      },
      {
        name: "Odonto QualiMais",
        kind: "Plano odontológico · Uniodonto",
        color: ODONTO,
        tags: ["Nacional", "Sem coparticipação"],
        resumo: "Plano odontológico para clientes Unimed, atendido pela Uniodonto. Cobre prevenção, restaurações, canal, gengiva, raio X, urgências, cirurgias simples e odontopediatria.",
        fatos: [
          { label: "Como achar um dentista", value: "uniodontopoa.com.br/cliente-unimed, opção QualiMais" },
          { label: "Central", value: "Porto Alegre (51) 3302-4000" },
        ],
        file: "odonto-qualimais.pdf",
      },
    ],
  },
  {
    title: "Doctor Clin",
    icon: Stethoscope,
    intro: "Planos regionais com 20 unidades próprias na Grande Porto Alegre e Vale do Sinos. Coparticipações descontadas em folha.",
    items: [
      {
        name: "Flex Just Hospitalar",
        kind: "Doctor Clin · plano completo",
        color: DOCTOR,
        tags: ["Ambulatorial", "Hospitalar", "Odontologia"],
        resumo: "Consultas, exames, internação em quarto semiprivativo e dentista incluído. Consultas e pronto atendimento sem carência.",
        fatos: [
          { label: "Consulta", value: "R$ 36,29 (Rede Max: R$ 60,00)" },
          { label: "Exames", value: "30% de coparticipação" },
          { label: "Internação", value: "180 dias de carência; parto, 300 dias" },
          { label: "Taxa de adesão", value: "R$ 20,05" },
        ],
        file: "doctorclin-flex-hospitalar.pdf",
      },
      {
        name: "Flex Just Hospitalar · carências",
        kind: "Doctor Clin · tabela detalhada",
        color: DOCTOR,
        tags: ["Carências", "Coparticipações"],
        resumo: "Lista completa de prazos e valores do plano hospitalar, item a item: consultas, terapias, exames, procedimentos, internações e odontologia.",
        fatos: [
          { label: "Sem carência", value: "consultas, pronto atendimento e exames simples" },
          { label: "Cirurgia acima de R$ 8.144,03", value: "coparticipação de R$ 4.071,19" },
          { label: "Doença preexistente", value: "24 meses para procedimentos de alto custo" },
        ],
        file: "doctorclin-carencias-hospitalar.pdf",
      },
      {
        name: "Flex Just Ambulatorial",
        kind: "Doctor Clin · sem internação",
        color: DOCTOR,
        tags: ["Ambulatorial", "Odontologia"],
        resumo: "Consultas, exames, terapias e dentista, sem cobertura de internação. Exames sem coparticipação.",
        fatos: [
          { label: "Mensalidade", value: "a partir de R$ 108,40, conforme a idade" },
          { label: "Consulta", value: "R$ 27,52 (Rede Max: R$ 60,00)" },
          { label: "Exames", value: "sem coparticipação" },
          { label: "Taxa de adesão", value: "R$ 23,03" },
        ],
        tabelas: [DC_AMB],
        file: "doctorclin-flex-ambulatorial.pdf",
      },
      {
        name: "Flex Just Ambulatorial · carências",
        kind: "Doctor Clin · tabela detalhada",
        color: DOCTOR,
        tags: ["Carências", "Mensalidades"],
        resumo: "Prazos e coparticipações do plano ambulatorial, mais a tabela de mensalidades reajustada em maio de 2026.",
        fatos: [
          { label: "Exames", value: "simples sem carência; médios 90 dias; complexos 180 dias" },
          { label: "Psicologia e terapias", value: "180 dias, R$ 60,00 por sessão" },
          { label: "Fisioterapia", value: "90 dias, sem limite de sessões" },
        ],
        file: "doctorclin-carencias-ambulatorial.pdf",
      },
      {
        name: "Hospital Doctor Clin",
        kind: "Hospital próprio · Porto Alegre",
        color: DOCTOR,
        tags: ["Pronto atendimento 24h", "Internação"],
        resumo: "Hospital da Doctor Clin no centro de Porto Alegre, com pronto atendimento, cirurgias de baixa e média complexidade, internação e exames de imagem.",
        fatos: [
          { label: "Pronto atendimento", value: "clínico 24h; pediatria das 8h às 20h; trauma de segunda a sexta, das 8h às 18h" },
          { label: "SAC", value: "0800 541 3584" },
        ],
        file: "hospital-doctorclin.pdf",
      },
      {
        name: "Como agendar o dentista",
        kind: "Doctor Odonto · passo a passo",
        color: ODONTO,
        tags: ["Odontologia", "Passo a passo"],
        resumo: "A Doctor Clin não marca a consulta odontológica: você acha o dentista no guia do app ou site e liga direto para a clínica.",
        fatos: [
          { label: "No app", value: "Guia Médico e Odontológico › tipo de prestador “Odontologia”" },
          { label: "Setor de odonto", value: "(51) 3584-0333" },
        ],
        file: "doctorclin-odonto-agendar.pdf",
      },
      {
        name: "Especialidades do odonto",
        kind: "Doctor Odonto · o que cada área faz",
        color: ODONTO,
        tags: ["Odontologia"],
        resumo: "Todo tratamento começa com o clínico geral, que encaminha para a especialidade certa: gengiva, canal, cirurgia, odontopediatria, prótese ou radiologia.",
        fatos: [{ label: "Dúvidas", value: "(51) 3584-0300" }],
        file: "doctorclin-odonto-especialidades.pdf",
      },
    ],
  },
];

const unimedRegras = [
  { icon: HandCoins, title: "A empresa ajuda a pagar", text: "R$ 50,00 por mês para o titular. Cai para R$ 35,00 com 1 falta ou atestado no mês, e não há ajuda com mais de 1. Dependentes não recebem ajuda." },
  { icon: Users, title: "Quem pode entrar", text: "Filhos, cônjuge ou companheiro(a) e filhos sob guarda. Pais, irmãos e outros parentes não podem." },
  { icon: CalendarClock, title: "Prazo para entrar ou sair", text: "Todo dia 10 do mês. A carência pode começar só dois meses depois, então peça com antecedência." },
];

/** Faixa da tabela em que a idade cai ("19 a 43", "59 ou mais"). */
const faixaDa = (t: Tabela, idade: number | null) =>
  idade === null ? "" : (t.faixas.find(([f]) => { const [a, b] = f.match(/\d+/g)!.map(Number); return idade >= a && (f.includes("mais") || idade <= (b ?? a)); })?.[0] ?? "");

function Simulador({ tabelas, idade }: { tabelas: Tabela[]; idade: number | null }) {
  const [plano, setPlano] = useState(tabelas[0].plano);
  const [faixa, setFaixa] = useState<string | null>(null);
  const t = tabelas.find((x) => x.plano === plano) ?? tabelas[0];
  const auto = faixaDa(t, idade);
  // a faixa escolhida à mão só vale se existir na tabela deste plano
  const atual = faixa && t.faixas.some(([f]) => f === faixa) ? faixa : auto;
  const valor = t.faixas.find(([f]) => f === atual)?.[1];
  return (
    <div className="mt-auto pt-4">
      <div className="rounded-2xl border border-line p-4">
        <p className="text-[14px] font-bold">Quanto você pagaria</p>
        <div className="mt-3 grid gap-2">
          {tabelas.length > 1 ? (
            <Select value={plano} onChange={setPlano} options={tabelas.map((x) => x.plano)} aria-label="Plano" />
          ) : (
            <p className="flex h-11 items-center text-[14px] font-semibold text-ink-soft">{t.plano}</p>
          )}
          <Select value={atual} onChange={setFaixa} options={t.faixas.map(([f]) => ({ value: f, label: `${f} anos${f === auto ? " (você)" : ""}` }))} placeholder="Idade" searchable={false} aria-label="Faixa de idade" />
        </div>
        <div className="mt-3 flex min-h-9 flex-wrap items-center gap-2" aria-live="polite">
          {valor ? (
            <>
              <span className="tabular rounded-full bg-ok-soft px-3 py-1 text-[16px] font-extrabold text-ok-ink">{valor}<span className="text-[12px] font-bold"> /mês</span></span>
              <span className="text-[12px] text-ink-soft">{atual === auto ? "na sua faixa de idade" : `faixa de ${atual} anos`}</span>
            </>
          ) : (
            <p className="text-[12px] text-ink-soft">
              Escolha a faixa de idade, ou <Link href="/perfil" className="font-bold text-brand underline underline-offset-2">informe sua idade no perfil</Link> para ver o seu valor direto.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const initials = (name: string) => name.replace(/[^A-Za-zÀ-ú ]/g, " ").split(/\s+/).filter((w) => w.length > 1).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

function Card({ p, onRead, idade }: { p: Plano; onRead: (p: Plano) => void; idade: number | null }) {
  const icon = "flex size-10 coarse:size-11 items-center justify-center rounded-xl border border-[#c9d5ea] dark:border-line bg-paper text-ink-soft hover:bg-brand-soft hover:text-brand";
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-paper bg-paper shadow-card">
      <div className="h-1.5" style={{ background: p.color }} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start gap-3">
          <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-[16px] font-extrabold text-white" style={{ background: p.color }}>
            {initials(p.name)}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[18px] font-bold leading-tight">{p.name}</h3>
            <p className="text-[14px] text-ink-soft">{p.kind}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            {p.word ? (
              <span title="Documento Word: baixe para abrir" className={cn(icon, "cursor-not-allowed opacity-40 hover:bg-paper hover:text-ink-soft")}>
                <BookOpenText className="size-4" aria-hidden />
                <span className="sr-only">Leitura indisponível para arquivo Word</span>
              </span>
            ) : (
              <button type="button" onClick={() => onRead(p)} aria-label={`Ler documento: ${p.name}`} title="Ler documento" className={icon}>
                <BookOpenText className="size-4" />
              </button>
            )}
            <a href={DIR + p.file} download aria-label={`Baixar ${p.word ? "Word" : "PDF"}: ${p.name}`} title={`Baixar ${p.word ? "Word" : "PDF"}`} className={icon}>
              <Download className="size-4" />
            </a>
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Características">
          {p.tags.map((t) => (
            <li key={t} className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[12px] font-bold text-brand">{t}</li>
          ))}
        </ul>

        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{p.resumo}</p>

        <dl className="mt-4 space-y-2 rounded-2xl bg-brand-soft/60 p-4 text-[14px]">
          {p.fatos.map((f) => (
            <div key={f.label}>
              <dt className="font-bold text-navy">{f.label}</dt>
              <dd className="text-ink-soft">{f.value}</dd>
            </div>
          ))}
        </dl>

        {p.tabelas && <Simulador tabelas={p.tabelas} idade={idade} />}
      </div>
    </article>
  );
}

/** Aba "Médico" da tela de Convênios. */
export function ConveniosMedicos() {
  const [reading, setReading] = useState<Plano | null>(null);
  const [idade, setIdade] = useState<number | null>(null);
  // a idade vem do Editar perfil (guardado no navegador)
  useEffect(() => {
    try {
      const n = Number((JSON.parse(localStorage.getItem("facta-perfil") ?? "{}") as { idade?: string }).idade);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (n > 0) setIdade(n);
    } catch {
      /* sem idade salva */
    }
  }, []);
  return (
    <div className="space-y-8">

      <section aria-labelledby="regras" className="rounded-3xl border border-paper bg-paper/90 p-6 shadow-card">
        <h2 id="regras" className="flex items-center gap-2.5 text-[20px] font-bold">
          <Info className="size-5 text-brand" /> Antes de escolher um plano Unimed
        </h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {unimedRegras.map((r) => (
            <li key={r.title} className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand"><r.icon className="size-5" /></span>
              <div className="text-[14px]">
                <p className="font-bold">{r.title}</p>
                <p className="text-ink-soft">{r.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-line pt-4 text-[14px] text-ink-soft">
          Carências da Unimed: urgência em 24h · consultas e exames simples em 30 dias · psiquiatria, terapias e exames complementares em 60 dias · internação em 120 dias · cirurgias cardíacas, quimioterapia e próteses em 180 dias · parto em 300 dias. Coparticipações podem ser cobradas em até 180 dias.
        </p>
        <Link href="/solicitacoes/nova" className="mt-4 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-[14px] font-bold text-white hover:bg-brand-dark">
          Pedir plano ao RH
        </Link>
        <span className="ml-3 text-[14px] text-ink-soft">assunto “RH – Plano de Saúde”</span>
      </section>

      {grupos.map((g) => (
        <section key={g.title} aria-labelledby={`cm-${g.title}`}>
          <h2 id={`cm-${g.title}`} className="flex items-center gap-2.5 text-[20px] font-bold">
            <g.icon className="size-5 text-brand" /> {g.title}
            <span className="rounded-md bg-brand-soft px-2 py-0.5 text-[14px] font-bold text-brand">{g.items.length}</span>
          </h2>
          <p className="mb-4 mt-1 text-[14px] text-ink-soft">{g.intro}</p>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {g.items.map((p) => (
              <li key={p.file}><Card p={p} onRead={setReading} idade={idade} /></li>
            ))}
          </ul>
        </section>
      ))}

      {reading && <PdfReader src={DIR + reading.file} title={reading.name} onClose={() => setReading(null)} />}
    </div>
  );
}
