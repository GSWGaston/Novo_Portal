"use client";

import { Check, CheckCircle2, ClipboardList, Send } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { Select } from "./select";
import { useStored } from "./use-stored";

/* ---------- perguntas (as 48 do portal atual; as opções de resposta foram definidas aqui) ---------- */

const CONCORDA = ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"];
const AVALIA = ["Muito ruim", "Ruim", "Regular", "Boa", "Excelente"];
const FREQ = ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"];
const CONFIANCA = ["Muito baixa", "Baixa", "Média", "Alta", "Muito alta"];
const SATISFACAO = ["Muito insatisfeito", "Insatisfeito", "Neutro", "Satisfeito", "Muito satisfeito"];
const NAO_INFORMAR = "Prefiro não informar";
const SETORES = ["Administrativo", "Comercial", "Financeiro", "Jurídico", "Lojas", "Marketing", "Operacional", "Recursos Humanos", "Tecnologia"];

type Q =
  | { n: number; q: string; kind: "select"; options: string[] }
  | { n: number; q: string; kind: "scale"; options: string[] }
  | { n: number; q: string; kind: "multi"; options: string[]; max: number }
  | { n: number; q: string; kind: "text"; max: number; optional: true };

const s = (n: number, q: string, options: string[]): Q => ({ n, q, kind: "select", options });
const l = (n: number, q: string, options = CONCORDA): Q => ({ n, q, kind: "scale", options });

const SECOES: { titulo: string; perguntas: Q[] }[] = [
  {
    titulo: "Sobre você",
    perguntas: [
      s(1, "Qual sua área de atuação?", ["Matriz", "Loja", "Home office", "Externo"]),
      s(2, "Qual o nível do seu cargo atual?", ["Estágio ou aprendiz", "Operacional", "Técnico ou analista", "Coordenação ou supervisão", "Gerência", "Diretoria"]),
      s(3, "Qual a sua idade?", ["Até 20 anos", "21 a 25 anos", "26 a 30 anos", "31 a 40 anos", "41 a 50 anos", "Mais de 50 anos"]),
      s(4, "Qual é a sua nacionalidade?", ["Brasileira", "Outra"]),
      s(5, "Como você define sua etnia?", ["Branca", "Preta", "Parda", "Amarela", "Indígena", NAO_INFORMAR]),
      s(6, "Há quanto tempo você trabalha na empresa?", ["Menos de 6 meses", "6 meses a 1 ano", "1 a 2 anos", "2 a 5 anos", "5 a 10 anos", "Mais de 10 anos"]),
      s(7, "Em qual região você trabalha?", ["Sul", "Sudeste", "Centro-Oeste", "Nordeste", "Norte"]),
      s(8, "Qual seu gênero biológico?", ["Feminino", "Masculino", "Intersexo", NAO_INFORMAR]),
      s(9, "Qual a sua identidade de gênero?", ["Mulher cisgênero", "Homem cisgênero", "Mulher transgênero", "Homem transgênero", "Não binário", "Outra", NAO_INFORMAR]),
      s(10, "Qual a sua orientação sexual?", ["Heterossexual", "Homossexual", "Bissexual", "Pansexual", "Assexual", "Outra", NAO_INFORMAR]),
      s(11, "Qual a sua área de atuação na empresa?", SETORES),
      s(12, "Qual seu nível de escolaridade?", ["Fundamental", "Médio", "Técnico", "Superior incompleto", "Superior completo", "Pós-graduação"]),
    ],
  },
  {
    titulo: "Diversidade e inclusão",
    perguntas: [
      l(13, "Você considera que os colaboradores(as) aqui são bem tratados independentemente de sua cor ou etnia?"),
      l(14, "Você considera que os colaboradores(as) aqui são bem tratados independentemente de seu gênero?"),
      l(15, "Você considera que os colaboradores(as) aqui são bem tratados independentemente de sua orientação sexual?"),
      l(16, "Você acredita que as pessoas aqui têm vontade de vir para o trabalho?"),
    ],
  },
  {
    titulo: "Comunicação e liderança",
    perguntas: [
      l(17, "Como você avalia a comunicação entre a sua equipe?", AVALIA),
      l(18, "Como você avalia a comunicação do seu gestor com a equipe?", AVALIA),
      l(19, "Você se sente confortável em conversar com o seu gestor?"),
      l(20, "Seu gestor deixa claro as suas expectativas sobre você?"),
      l(21, "Você considera que a sua gestão sabe coordenar pessoas e distribuir tarefas adequadamente?"),
      l(22, "Você considera seu gestor acessível para conversar e buscar apoio?"),
      s(23, "Indique a quantidade de feedbacks que você teve com seu gestor imediato nos últimos 12 meses.", ["Nenhum", "1 ou 2", "3 a 5", "6 ou mais"]),
      l(24, "Como você avalia a comunicação com outros setores da empresa?", AVALIA),
      l(25, "Qual seu nível de confiança na alta liderança da empresa?", CONFIANCA),
    ],
  },
  {
    titulo: "Cultura e crescimento",
    perguntas: [
      l(26, "Você se identifica com os valores da empresa?"),
      l(27, "A cultura organizacional facilita o relacionamento entre os colaboradores?"),
      l(28, "Você enxerga oportunidades de crescimento de carreira na empresa?"),
      l(29, "Você se sente reconhecido pelo seu trabalho?"),
      l(30, "Com que frequência são comemorados eventos especiais no seu setor?", FREQ),
      l(31, "Você se sentiu bem-vindo(a) quando entrou na Facta?"),
      l(32, "A quantidade de treinamentos que você recebeu e/ou recebe é adequada para a execução da sua atividade?"),
      l(33, "Você indicaria um amigo e/ou familiar para trabalhar na Facta?"),
    ],
  },
  {
    titulo: "Motivação e ambiente",
    perguntas: [
      l(34, "Você confia na empresa?"),
      l(35, "Você tem paixão em trabalhar na Facta?"),
      l(36, "Você considera que salário é um fator motivacional?"),
      l(37, "Você considera que benefícios (VT, VR, VA, Gympass, plano de saúde) são fatores motivacionais?"),
      l(38, "Como você avalia o seu ambiente de trabalho (iluminação, ventilação, espaço)?", AVALIA),
      l(39, "Como você avalia os recursos (materiais, equipamentos, mobília)?", AVALIA),
      l(40, "Você pretende trabalhar na Facta por muito tempo?"),
      l(41, "Você acredita que, quando as pessoas mudam de função ou de área, a empresa faz com que se sintam bem recebidas?"),
      l(42, "Você acredita que este é um lugar fisicamente seguro para trabalhar?"),
      l(43, "Nossas instalações contribuem para um bom ambiente de trabalho?"),
      l(44, "Você considera que este é um lugar psicológica e emocionalmente saudável para trabalhar?"),
    ],
  },
  {
    titulo: "Programas e motivação",
    perguntas: [
      {
        n: 45, q: "Quais destes programas proporcionados pela empresa você considera mais importantes para você?", kind: "multi", max: 5,
        options: ["Acompanhamento Funcional", "Avaliação de Desempenho", "Biblioteca", "Cidadania Empresarial", "Convênio com Universidades", "Facta em Foco", "Games Corporativos (ex.: Copa e Olimpíadas Facta)", "Gestão de Talentos", "Integração Institucional", "Pesquisa de Clima", "Rumo ao Sucesso", "Nenhuma opção"],
      },
      {
        n: 46, q: "Para você, quais fatores mais o motivam e influenciam em trabalhar na Facta?", kind: "multi", max: 5,
        options: ["Oportunidade de crescimento", "Treinamentos realizados", "Estabilidade", "Benefícios", "Clima organizacional", "Imagem da empresa", "Instalações físicas", "Ser reconhecido e valorizado pelo trabalho executado", "Gosta da atividade que exerce"],
      },
    ],
  },
  {
    titulo: "Para encerrar",
    perguntas: [
      l(47, "No geral, gostaríamos de saber qual seu nível de satisfação em trabalhar na Facta.", SATISFACAO),
      { n: 48, q: "Deixe aqui suas considerações e sugestões.", kind: "text", max: 500, optional: true },
    ],
  },
];
const TODAS = SECOES.flatMap((x) => x.perguntas);
const OBRIGATORIAS = TODAS.filter((q) => q.kind !== "text");

type Respostas = Record<number, string | string[]>;
const respondida = (q: Q, r: Respostas) => {
  const v = r[q.n];
  if (q.kind === "multi") return Array.isArray(v) && v.length > 0;
  return typeof v === "string" && v.trim() !== "" && (q.n !== 4 || v !== "Outra" || !!(r[0] as string)?.trim());
};

/* ---------- peças ---------- */

function Scale({ q, value, onChange, invalid }: { q: Q & { kind: "scale" }; value?: string; onChange: (v: string) => void; invalid: boolean }) {
  return (
    <div role="radiogroup" aria-labelledby={`q${q.n}`} className="grid grid-cols-1 gap-1 rounded-2xl bg-surface p-1 sm:grid-cols-5">
      {q.options.map((o, i) => (
        <label key={o} className={cn("flex min-h-11 cursor-pointer items-center justify-center rounded-xl px-2 py-1.5 text-center text-[13px] font-semibold leading-tight transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/30 motion-reduce:transition-none", value === o ? (i < 2 ? "bg-warn text-white" : i === 2 ? "bg-ink-soft text-white" : "bg-brand text-white") : cn("text-ink-soft hover:bg-paper", invalid && "text-danger-ink"))}>
          <input type="radio" name={`q${q.n}`} value={o} checked={value === o} onChange={() => onChange(o)} className="sr-only" />
          {o}
        </label>
      ))}
    </div>
  );
}

function Multi({ q, value = [], onChange }: { q: Q & { kind: "multi" }; value?: string[]; onChange: (v: string[]) => void }) {
  const nenhuma = "Nenhuma opção";
  const toggle = (o: string) => {
    if (value.includes(o)) return onChange(value.filter((x) => x !== o));
    if (o === nenhuma) return onChange([nenhuma]);
    const base = value.filter((x) => x !== nenhuma);
    if (base.length >= q.max) return;
    onChange([...base, o]);
  };
  return (
    <div>
      <p className="mb-2 text-[13px] text-ink-soft">Marque até {q.max} opções. <span className="font-semibold tabular text-ink">{value.length} de {q.max}</span></p>
      <div role="group" aria-labelledby={`q${q.n}`} className="flex flex-wrap gap-2">
        {q.options.map((o) => {
          const on = value.includes(o);
          const full = !on && o !== nenhuma && value.filter((x) => x !== nenhuma).length >= q.max;
          return (
            <button key={o} type="button" aria-pressed={on} disabled={full} onClick={() => toggle(o)} className={cn("flex min-h-10 coarse:min-h-11 items-center gap-1.5 rounded-full border px-4 py-1.5 text-left text-[14px] font-semibold transition-colors disabled:opacity-40 motion-reduce:transition-none", on ? "border-brand bg-brand text-white" : "border-line bg-paper text-ink-soft hover:border-brand hover:text-ink")}>
              {on && <Check className="size-4" />} {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- tela ---------- */

export function PesquisaClimaView() {
  const [enviada, setEnviada, loaded] = useStored<string>("facta-pesquisa-clima-2026", () => "");
  const [r, setR] = useState<Respostas>({});
  const [faltando, setFaltando] = useState<number[]>([]);
  const refs = useRef<Record<number, HTMLElement | null>>({});
  const set = (n: number, v: string | string[]) => {
    setR((o) => ({ ...o, [n]: v }));
    setFaltando((f) => f.filter((x) => x !== n));
  };
  const feitas = OBRIGATORIAS.filter((q) => respondida(q, r)).length;
  const pct = Math.round((feitas / OBRIGATORIAS.length) * 100);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const miss = OBRIGATORIAS.filter((q) => !respondida(q, r)).map((q) => q.n);
    setFaltando(miss);
    if (miss.length) return refs.current[miss[0]]?.scrollIntoView({ behavior: "smooth", block: "center" });
    setEnviada(new Date().toLocaleDateString("pt-BR"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!loaded) return <p className="py-10 text-center text-[14px] text-ink-soft">Carregando…</p>;

  const header = (
    <div>
      <Breadcrumb trail={[{ label: "Início", href: "/" }, { label: "Pesquisa de Clima 2026" }]} />
      <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
        <ClipboardList className="size-8 text-brand" strokeWidth={1.8} /> Pesquisa de Clima 2026
      </h1>
    </div>
  );

  if (enviada) {
    return (
      <div className="mx-auto max-w-[880px] space-y-6 py-6">
        {header}
        <section className="rounded-3xl border border-paper bg-paper/90 p-10 text-center shadow-card">
          <CheckCircle2 className="mx-auto size-14 text-ok" />
          <h2 className="mt-4 text-[24px] font-extrabold">Obrigado por participar!</h2>
          <p className="mx-auto mt-2 max-w-[480px] text-[16px] text-ink-soft">Suas respostas foram enviadas em {enviada}. Elas ajudam a Facta a melhorar o dia a dia de todos.</p>
          <Link href="/" className="mt-6 inline-flex h-12 items-center rounded-xl bg-brand px-6 text-[16px] font-bold text-white hover:bg-brand-dark">Voltar ao início</Link>
        </section>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="mx-auto max-w-[880px] space-y-6 pb-10">
      {header}
      <p className="text-[16px] text-ink-soft">São {TODAS.length} perguntas e leva cerca de 10 minutos. Responda com sinceridade: não existem respostas certas ou erradas.</p>

      {/* progresso fixo no topo enquanto rola */}
      <div className="sticky top-0 z-30 -mx-4 bg-surface/90 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex items-center justify-between text-[14px] font-semibold">
          <span>{feitas} de {OBRIGATORIAS.length} respondidas</span>
          <span className="tabular text-brand">{pct}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-line" role="progressbar" aria-label="Progresso da pesquisa" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-brand transition-[width] motion-reduce:transition-none" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {faltando.length > 0 && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-[14px] font-semibold text-danger-ink">
          {faltando.length === 1 ? "Falta responder 1 pergunta" : `Faltam responder ${faltando.length} perguntas`} (marcadas em vermelho).
        </p>
      )}

      {SECOES.map((sec) => (
        <section key={sec.titulo} className="rounded-3xl border border-paper bg-paper/90 p-5 shadow-card md:p-7" aria-labelledby={`sec-${sec.titulo}`}>
          <h2 id={`sec-${sec.titulo}`} className="text-[20px] font-bold">{sec.titulo}</h2>
          <ol className="mt-4 divide-y divide-line">
            {sec.perguntas.map((q) => {
              const bad = faltando.includes(q.n);
              return (
                <li key={q.n} ref={(el) => { refs.current[q.n] = el; }} className="py-5 first:pt-1 last:pb-0">
                  <p id={`q${q.n}`} className={cn("mb-3 flex gap-2 text-[16px] font-bold leading-snug", bad && "text-danger-ink")}>
                    <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] tabular", bad ? "bg-danger-soft" : respondida(q, r) ? "bg-ok-soft text-ok-ink" : "bg-brand-soft text-brand")}>{q.n}</span>
                    <span className="pt-0.5">{q.q}{q.kind === "text" && <span className="ml-1 font-medium text-ink-soft">(opcional)</span>}</span>
                  </p>
                  {q.kind === "select" && (
                    <div className="max-w-[420px] pl-9">
                      <Select aria-labelledby={`q${q.n}`} aria-invalid={bad} value={(r[q.n] as string) ?? ""} onChange={(v) => set(q.n, v)} options={q.options} placeholder="Selecione…" searchable={false} className={cn(bad && "border-danger")} />
                      {q.n === 4 && r[4] === "Outra" && (
                        <input aria-label="Qual nacionalidade?" placeholder="Qual nacionalidade?" maxLength={60} value={(r[0] as string) ?? ""} onChange={(e) => set(0, e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-line bg-paper px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15" />
                      )}
                    </div>
                  )}
                  {q.kind === "scale" && <div className="pl-9"><Scale q={q} value={r[q.n] as string} onChange={(v) => set(q.n, v)} invalid={bad} /></div>}
                  {q.kind === "multi" && <div className="pl-9"><Multi q={q} value={r[q.n] as string[]} onChange={(v) => set(q.n, v)} /></div>}
                  {q.kind === "text" && (
                    <div className="pl-9">
                      <textarea aria-labelledby={`q${q.n}`} rows={4} maxLength={q.max} value={(r[q.n] as string) ?? ""} onChange={(e) => set(q.n, e.target.value)} placeholder="Digite aqui suas considerações e sugestões…" className="w-full resize-y rounded-xl border border-line bg-paper px-3 py-2.5 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15" />
                      <p className="mt-1 text-right text-[13px] text-ink-soft tabular">{q.max - (((r[q.n] as string) ?? "").length)} caracteres restantes</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <div className="flex justify-end">
        <button type="submit" className="flex h-12 items-center gap-2 rounded-xl bg-brand px-7 text-[16px] font-bold text-white transition hover:bg-brand-dark">
          <Send className="size-5" /> Enviar respostas
        </button>
      </div>
    </form>
  );
}
