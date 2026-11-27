"use client";

import { Camera, Eye, EyeOff, Home, KeyRound, LifeBuoy, Phone, UserPen } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { currentUser } from "./data";
import { Select } from "./select";
import { useStored } from "./use-stored";

/* ---------- dados (demonstração, ficam no localStorage) ---------- */

type Perfil = {
  email: string;
  celular: string;
  emNome: string;
  emRelacao: string;
  emTel1: string;
  emTel2: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  pcd: string;
  ramal: string;
  /** usada para mostrar a mensalidade dos convênios médicos */
  idade?: string;
  foto: string;
  etnia: string;
  estadoCivil: string;
};

// nome, cargo e setor vêm do cadastro do RH: o colaborador só vê
const FIXOS = { nome: currentUser.name, cargo: "Técnico em TI Júnior", setor: "Informática" };
const vazio = (): Perfil => ({
  email: "", celular: "", emNome: "", emRelacao: "", emTel1: "", emTel2: "",
  cep: "", endereco: "", numero: "", complemento: "", bairro: "", pcd: "Não", ramal: "", foto: "", etnia: "", estadoCivil: "",
});
const RELACOES = ["Mãe", "Pai", "Cônjuge", "Companheiro(a)", "Filho(a)", "Irmão(ã)", "Amigo(a)", "Outro"];
const ETNIAS = ["Branca", "Preta", "Parda", "Amarela", "Indígena", "Prefiro não informar"];
const ESTADOS = ["Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)", "Viúvo(a)"];

const digits = (v: string) => v.replace(/\D/g, "");
const maskFone = (v: string) => {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
const maskCep = (v: string) => {
  const d = digits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

/* ---------- peças ---------- */

const control = "h-11 w-full rounded-xl border bg-paper px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";
const label = "mb-1 block text-[14px] font-semibold";
const card = "rounded-3xl border border-paper bg-paper/90 p-5 shadow-card md:p-7";
const Req = () => <span aria-hidden className="ml-0.5 text-danger-ink">*</span>;
const Err = ({ m }: { m?: string }) => (m ? <p className="mt-1 text-[14px] font-medium text-danger-ink">{m}</p> : null);
type Errors = Partial<Record<"idade" | "email" | "celular" | "emTel1" | "emTel2" | "cep" | "etnia" | "estadoCivil" | "senhaAtual" | "senhaNova", string>>;

function Section({ icon: Icon, title, children }: { icon: typeof Phone; title: string; children: React.ReactNode }) {
  return (
    <section className={card} aria-labelledby={`pf-${title}`}>
      <h2 id={`pf-${title}`} className="flex items-center gap-2.5 text-[18px] font-bold">
        <Icon className="size-5 text-brand" /> {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ id, title, value, onChange, err, req, ...rest }: { id: string; title: string; value: string; onChange: (v: string) => void; err?: string; req?: boolean } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id">) {
  return (
    <div>
      <label htmlFor={id} className={label}>{title}{req && <Req />}</label>
      <input id={id} value={value} aria-invalid={!!err} onChange={(e) => onChange(e.target.value)} className={cn(control, err ? "border-danger" : "border-line")} {...rest} />
      <Err m={err} />
    </div>
  );
}

function Senha({ id, title, value, onChange, err, autoComplete }: { id: string; title: string; value: string; onChange: (v: string) => void; err?: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={label}>{title}</label>
      <div className={cn("flex h-11 items-center rounded-xl border bg-paper focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15", err ? "border-danger" : "border-line")}>
        <input id={id} type={show ? "text" : "password"} autoComplete={autoComplete} value={value} aria-invalid={!!err} onChange={(e) => onChange(e.target.value)} className="h-full min-w-0 flex-1 bg-transparent px-3 text-[14px] outline-none" />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Ocultar senha" : "Mostrar senha"} className="flex size-11 items-center justify-center text-ink-soft hover:text-brand">
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <Err m={err} />
    </div>
  );
}

/* ---------- tela ---------- */

export function PerfilView() {
  const [saved, setSaved, loaded] = useStored<Perfil>("facta-perfil", vazio);
  const [p, setP] = useState<Perfil | null>(null);
  const [senha, setSenha] = useState({ atual: "", nova: "" });
  const [err, setErr] = useState<Errors>({});
  const [toast, setToast] = useState("");
  const top = useRef<HTMLParagraphElement>(null);
  const f = p ?? saved; // edita uma cópia; só grava ao salvar
  const set = <K extends keyof Perfil>(k: K, v: Perfil[K]) => {
    setP({ ...f, [k]: v });
    setErr((e) => ({ ...e, [k]: undefined }));
  };

  const pickFoto = (file?: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setToast("A foto precisa ter até 2 MB."), window.setTimeout(() => setToast(""), 3000);
    const r = new FileReader();
    r.onload = () => set("foto", String(r.result));
    r.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const fone = (v: string) => (v && digits(v).length < 10 ? "Telefone incompleto." : undefined);
    const next: Errors = {
      idade: f.idade && (Number(f.idade) < 14 || Number(f.idade) > 99) ? "Idade entre 14 e 99." : undefined,
      email: f.email && !/^\S+@\S+\.\S+$/.test(f.email) ? "E-mail inválido." : undefined,
      celular: fone(f.celular),
      emTel1: fone(f.emTel1),
      emTel2: fone(f.emTel2),
      cep: f.cep && digits(f.cep).length !== 8 ? "CEP incompleto." : undefined,
      etnia: f.etnia ? undefined : "Escolha uma opção.",
      estadoCivil: f.estadoCivil ? undefined : "Escolha uma opção.",
      senhaAtual: senha.nova && !senha.atual ? "Informe a senha atual para trocar." : undefined,
      senhaNova: senha.nova && senha.nova.length < 8 ? "A nova senha precisa ter ao menos 8 caracteres." : senha.atual && !senha.nova ? "Informe a nova senha." : undefined,
    };
    setErr(next);
    if (Object.values(next).some(Boolean)) return top.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setSaved(f);
    setP(null);
    const trocou = !!senha.nova;
    setSenha({ atual: "", nova: "" });
    setToast(trocou ? "Perfil e senha atualizados." : "Perfil atualizado.");
    window.setTimeout(() => setToast(""), 3000);
  };
  const errCount = Object.values(err).filter(Boolean).length;
  const dirty = p !== null || !!senha.atual || !!senha.nova;

  if (!loaded) return <p className="py-10 text-center text-[14px] text-ink-soft">Carregando…</p>;

  return (
    <form noValidate onSubmit={submit} className="mx-auto max-w-[960px] space-y-6 pb-24">
      <div>
        <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Editar perfil" }]} />
        <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
          <UserPen className="size-8 text-brand" strokeWidth={1.8} /> Editar perfil
        </h1>
        <p className="mt-2 text-[16px] text-ink-soft">Mantenha seus dados de contato atualizados. Os campos com * são obrigatórios.</p>
      </div>

      <p ref={top} role="alert" className={cn("rounded-xl bg-danger-soft px-4 py-3 text-[14px] font-semibold text-danger-ink", !errCount && "hidden")}>
        {errCount === 1 ? "Há 1 campo para corrigir." : `Há ${errCount} campos para corrigir.`}
      </p>

      {/* identificação */}
      <section className={cn(card, "flex flex-col gap-6 sm:flex-row sm:items-center")}>
        <div className="relative mx-auto shrink-0 sm:mx-0">
          <span className="flex size-28 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-[32px] font-extrabold text-brand ring-4 ring-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {f.foto ? <img src={f.foto} alt="Sua foto de perfil" className="size-full object-cover" /> : currentUser.initials}
          </span>
          <label className="absolute -bottom-1 -right-1 flex size-11 cursor-pointer items-center justify-center rounded-full bg-brand text-white shadow-md hover:bg-brand-dark focus-within:ring-4 focus-within:ring-brand/30">
            <Camera className="size-5" />
            <span className="sr-only">Trocar foto de perfil</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickFoto(e.target.files?.[0])} />
          </label>
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-[22px] font-extrabold leading-tight">{FIXOS.nome}</p>
          <p className="mt-1 text-[16px] font-semibold text-brand">{FIXOS.cargo}</p>
          <p className="text-[14px] text-ink-soft">{FIXOS.setor}</p>
          <p className="mt-3 text-[12px] text-ink-soft">Nome, cargo e setor são atualizados pelo RH. Foto em JPG ou PNG, até 2 MB.</p>
          {f.foto && (
            <button type="button" onClick={() => set("foto", "")} className="mt-2 text-[14px] font-bold text-danger-ink hover:underline">Remover foto</button>
          )}
        </div>
        <div className="flex gap-3 sm:w-[296px]">
          <div className="w-[140px]">
            <Field id="pf-idade" title="Idade" value={f.idade ?? ""} onChange={(v) => set("idade", digits(v).slice(0, 2))} err={err.idade} inputMode="numeric" placeholder="00" />
          </div>
          <div className="w-[140px]">
          <Field id="pf-ramal" title="Ramal" value={f.ramal} onChange={(v) => set("ramal", digits(v).slice(0, 5))} inputMode="numeric" placeholder="0000" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section icon={Phone} title="Contato">
          <div className="space-y-4">
            <Field id="pf-email" title="E-mail pessoal" type="email" autoComplete="email" value={f.email} onChange={(v) => set("email", v)} err={err.email} placeholder="nome@exemplo.com" />
            <Field id="pf-cel" title="Celular" type="tel" autoComplete="tel" value={f.celular} onChange={(v) => set("celular", maskFone(v))} err={err.celular} placeholder="(00) 00000-0000" />
          </div>
        </Section>

        <Section icon={LifeBuoy} title="Contato de emergência">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field id="pf-emnome" title="Nome" value={f.emNome} onChange={(v) => set("emNome", v)} maxLength={80} />
            </div>
            <div className="sm:col-span-2">
              <span id="pf-rel" className={label}>Relação</span>
              <Select aria-labelledby="pf-rel" value={f.emRelacao} onChange={(v) => set("emRelacao", v)} options={RELACOES} placeholder="- Selecione -" searchable={false} />
            </div>
            <Field id="pf-tel1" title="Telefone principal" type="tel" value={f.emTel1} onChange={(v) => set("emTel1", maskFone(v))} err={err.emTel1} placeholder="(00) 00000-0000" />
            <Field id="pf-tel2" title="Telefone alternativo" type="tel" value={f.emTel2} onChange={(v) => set("emTel2", maskFone(v))} err={err.emTel2} placeholder="(00) 00000-0000" />
          </div>
        </Section>
      </div>

      <Section icon={Home} title="Endereço">
        <div className="grid gap-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <Field id="pf-cep" title="CEP" inputMode="numeric" autoComplete="postal-code" value={f.cep} onChange={(v) => set("cep", maskCep(v))} err={err.cep} placeholder="00000-000" />
          </div>
          <div className="sm:col-span-4">
            <Field id="pf-end" title="Endereço" autoComplete="address-line1" value={f.endereco} onChange={(v) => set("endereco", v)} maxLength={120} />
          </div>
          <div className="sm:col-span-2">
            <Field id="pf-num" title="Número" value={f.numero} onChange={(v) => set("numero", v)} maxLength={10} />
          </div>
          <div className="sm:col-span-2">
            <Field id="pf-comp" title="Complemento" value={f.complemento} onChange={(v) => set("complemento", v)} maxLength={60} />
          </div>
          <div className="sm:col-span-2">
            <Field id="pf-bairro" title="Bairro" value={f.bairro} onChange={(v) => set("bairro", v)} maxLength={60} />
          </div>
        </div>
      </Section>

      <Section icon={UserPen} title="Informações pessoais">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <span id="pf-pcd" className={label}>Pessoa com deficiência?</span>
            <Select aria-labelledby="pf-pcd" value={f.pcd} onChange={(v) => set("pcd", v)} options={["Não", "Sim", "Prefiro não informar"]} searchable={false} />
          </div>
          <div>
            <span id="pf-etnia" className={label}>Etnia<Req /></span>
            <Select aria-labelledby="pf-etnia" aria-invalid={!!err.etnia} value={f.etnia} onChange={(v) => set("etnia", v)} options={ETNIAS} placeholder="- Selecione -" searchable={false} className={cn(err.etnia && "border-danger")} />
            <Err m={err.etnia} />
          </div>
          <div>
            <span id="pf-civil" className={label}>Estado civil<Req /></span>
            <Select aria-labelledby="pf-civil" aria-invalid={!!err.estadoCivil} value={f.estadoCivil} onChange={(v) => set("estadoCivil", v)} options={ESTADOS} placeholder="- Selecione -" searchable={false} className={cn(err.estadoCivil && "border-danger")} />
            <Err m={err.estadoCivil} />
          </div>
        </div>
      </Section>

      <Section icon={KeyRound} title="Alterar senha">
        <p className="-mt-2 mb-4 text-[14px] text-ink-soft">Deixe em branco para manter a senha atual.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Senha id="pf-s1" title="Senha atual" autoComplete="current-password" value={senha.atual} onChange={(v) => (setSenha({ ...senha, atual: v }), setErr((e) => ({ ...e, senhaAtual: undefined, senhaNova: undefined })))} err={err.senhaAtual} />
          <Senha id="pf-s2" title="Nova senha" autoComplete="new-password" value={senha.nova} onChange={(v) => (setSenha({ ...senha, nova: v }), setErr((e) => ({ ...e, senhaAtual: undefined, senhaNova: undefined })))} err={err.senhaNova} />
        </div>
      </Section>

      {/* barra de ações fixa no rodapé */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[960px] items-center justify-end gap-3 px-4 py-3">
          {dirty && <span className="mr-auto text-[14px] font-semibold text-warn-ink">Alterações não salvas</span>}
          <button type="button" disabled={!dirty} onClick={() => (setP(null), setSenha({ atual: "", nova: "" }), setErr({}))} className="h-11 rounded-xl border border-line bg-paper px-5 text-[16px] font-bold hover:bg-surface disabled:opacity-50">Descartar</button>
          <button type="submit" className="h-11 rounded-xl bg-brand px-6 text-[16px] font-bold text-white transition hover:bg-brand-dark">Salvar</button>
        </div>
      </div>

      <p role="status" aria-live="polite" className={cn("fixed bottom-20 right-6 z-[70] rounded-xl bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-opacity motion-reduce:transition-none", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>
    </form>
  );
}
