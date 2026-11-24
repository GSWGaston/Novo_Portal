"use client";

import { Check, ExternalLink, FilePlus2, Paperclip, Plus, Save, Undo2, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Select } from "./select";
import { Breadcrumb } from "./dashboard-view";
import { currentUser } from "./data";

const card = "rounded-3xl border border-white bg-white/90 shadow-card";
const control =
  "h-11 w-full rounded-xl border bg-white px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-soft";

const requesterOptions = [`15166 - ${currentUser.name.toUpperCase()}`];
const forOptions = ["Para mim", "Para outro colaborador"];
const reasons = ["Acesso a sistemas", "Equipamentos (hardware)", "E-mails e contas", "Impressoras", "Outros"];
const areas = ["Loja", "Matriz", "Call Matriz", "Call Vigário"] as const;
const stores: Record<string, string> = {
  "Loja São José": "SC",
  "Loja Santa Rosa": "RS",
  "Loja Curitiba Centro": "PR",
  "Loja Vitória": "ES",
};

type Errors = Partial<Record<"requester" | "target" | "reason" | "area" | "store" | "uf", string>>;

function Field({ id, label, required, error, hint, className, children }: { id: string; label: string; required?: boolean; error?: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-[14px] font-semibold">
        {label}
        {required && <span aria-hidden className="ml-0.5 text-danger-ink">*</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-[12px] text-ink-soft">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-[14px] font-medium text-danger-ink">{error}</p>}
    </div>
  );
}

function SelectBox({ id, value, onChange, options, error, disabled }: { id: string; value: string; onChange: (v: string) => void; options: string[]; error?: string; disabled?: boolean }) {
  return (
    <Select
      id={id}
      value={value}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-err` : undefined}
      onChange={onChange}
      options={[{ value: "", label: "Selecione" }, ...options]}
      className={cn(error && "border-danger", disabled && "bg-surface opacity-70")}
    />
  );
}

export function NewRequestForm() {
  const [requester, setRequester] = useState(requesterOptions[0]);
  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("");
  const [area, setArea] = useState<string>("");
  const [store, setStore] = useState("");
  const [uf, setUf] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);

  const isStore = area === "Loja";
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const added = Array.from(list); // copia antes de limpar o input
    setFiles((f) => [...f, ...added]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!requester) next.requester = "Informe o solicitante.";
    if (!target) next.target = "Informe para quem é a solicitação.";
    if (!reason) next.reason = "Escolha o motivo.";
    if (!area) next.area = "Escolha a área de atendimento.";
    if (isStore && !store) next.store = "Escolha a loja.";
    if (isStore && !uf.trim()) next.uf = "Informe a UF.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      form.current?.querySelector<HTMLElement>(first === "area" ? "input[name=area]" : `#${first}`)?.focus();
      return;
    }
    setSent(true);
    window.scrollTo({ top: 0 });
  };

  const reset = () => {
    setTarget(""); setReason(""); setArea(""); setStore(""); setUf(""); setTitle(""); setDescription(""); setFiles([]); setErrors({}); setSent(false);
  };
  const clear = (k: keyof Errors) => setErrors((er) => ({ ...er, [k]: undefined }));
  const failed = Object.values(errors).filter(Boolean).length;

  if (sent) {
    return (
      <div className="space-y-6">
        <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Solicitações", href: "/solicitacoes" }, { label: "Nova solicitação" }]} />
        <section className={cn(card, "mx-auto max-w-[640px] p-8 text-center")} role="status">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ok-soft text-ok-ink">
            <Check className="size-7" />
          </span>
          <h1 className="mt-4 text-[32px] font-extrabold leading-none tracking-tight">Solicitação registrada</h1>
          <p className="mx-auto mt-3 max-w-[460px] text-[16px] text-ink-soft">
            O chamado <b className="text-ink">#1000233</b> foi aberto para o setor de Suporte Informática. Esta é uma demonstração: nada foi enviado.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/solicitacoes/setores" className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-[14px] font-bold text-white hover:bg-brand-dark">
              <ExternalLink className="size-4" /> Ver pendentes no setor
            </Link>
            <button type="button" onClick={reset} className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-5 text-[14px] font-bold hover:bg-brand-soft">
              <Plus className="size-4" /> Abrir outra solicitação
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <form ref={form} noValidate onSubmit={submit} className="space-y-6">
      <div>
        <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Solicitações", href: "/solicitacoes" }, { label: "Nova solicitação" }]} />
        <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
          <FilePlus2 className="size-8 text-brand" strokeWidth={1.8} /> Nova solicitação
        </h1>
        <p className="mt-2 text-[16px] text-ink-soft">Descreva o que você precisa. Os campos com * são obrigatórios.</p>
      </div>

      {failed > 0 && (
        <p role="alert" className="rounded-2xl border border-danger/25 bg-danger-soft/60 px-5 py-3 text-[14px] font-medium text-danger-ink">
          {failed === 1 ? "Há 1 campo para corrigir." : `Há ${failed} campos para corrigir.`}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <section className={cn(card, "overflow-hidden")}>
          <h2 className="border-b border-line px-6 py-4 text-[20px] font-bold">Dados da solicitação</h2>
          <div className="grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2">
            <Field id="requester" label="Solicitante" required error={errors.requester} className="sm:col-span-2">
              <SelectBox id="requester" value={requester} options={requesterOptions} error={errors.requester} onChange={(v) => { setRequester(v); clear("requester"); }} />
            </Field>
            <Field id="target" label="Solicitar para" required error={errors.target}>
              <SelectBox id="target" value={target} options={forOptions} error={errors.target} onChange={(v) => { setTarget(v); clear("target"); }} />
            </Field>
            <Field id="reason" label="Motivo" required error={errors.reason}>
              <SelectBox id="reason" value={reason} options={reasons} error={errors.reason} onChange={(v) => { setReason(v); clear("reason"); }} />
            </Field>

            <fieldset className="sm:col-span-2" aria-describedby={errors.area ? "area-err" : undefined}>
              <legend className="mb-1 text-[14px] font-semibold">
                Área para atendimento<span aria-hidden className="ml-0.5 text-danger-ink">*</span>
              </legend>
              <div className="flex flex-wrap gap-3">
                {areas.map((a) => (
                  <label key={a} className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-4 text-[14px] font-semibold transition-colors hover:bg-brand-soft has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand motion-reduce:transition-none">
                    <input
                      type="radio"
                      name="area"
                      value={a}
                      checked={area === a}
                      onChange={() => {
                        setArea(a);
                        clear("area");
                        if (a !== "Loja") { setStore(""); setUf(""); clear("store"); clear("uf"); }
                      }}
                      className="size-4 accent-brand"
                    />
                    {a}
                  </label>
                ))}
              </div>
              {errors.area && <p id="area-err" className="mt-1 text-[14px] font-medium text-danger-ink">{errors.area}</p>}
            </fieldset>

            <Field id="store" label="Loja" required={isStore} error={errors.store} hint="Somente para atendimentos de loja.">
              <SelectBox
                id="store"
                value={store}
                disabled={!isStore}
                options={Object.keys(stores)}
                error={errors.store}
                onChange={(v) => { setStore(v); setUf(stores[v] ?? ""); clear("store"); clear("uf"); }}
              />
            </Field>
            <Field id="uf" label="UF" required={isStore} error={errors.uf}>
              <input id="uf" value={uf} disabled={!isStore} maxLength={2} aria-invalid={!!errors.uf} onChange={(e) => { setUf(e.target.value.toUpperCase()); clear("uf"); }} className={cn(control, "uppercase", errors.uf ? "border-danger" : "border-line")} />
            </Field>

            <Field id="ip" label="IP">
              <input id="ip" value="10.0.0.00" readOnly className={cn(control, "border-line bg-surface text-ink-soft")} />
            </Field>
            <Field id="ramal" label="Ramal">
              <input id="ramal" value="0000" readOnly className={cn(control, "border-line bg-surface text-ink-soft")} />
            </Field>
          </div>
        </section>

        <section className={cn(card, "flex flex-col overflow-hidden")}>
          <h2 className="border-b border-line px-6 py-4 text-[20px] font-bold">Complementos</h2>
          <div className="flex flex-1 flex-col gap-5 p-6">
            <Field id="title" label="Título" hint="Resumo curto do chamado, em poucas palavras.">
              <input id="title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Computador lento ao abrir o sistema" className={cn(control, "border-line")} />
              <p className="mt-1 text-right text-[12px] text-ink-soft">{title.length}/120</p>
            </Field>

            <div className="flex flex-1 flex-col">
              <p className="mb-1 text-[14px] font-semibold">Anexos</p>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                className={cn("flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center transition-colors motion-reduce:transition-none", dragOver ? "border-brand bg-brand-soft" : "border-line bg-surface/60")}
              >
                <Upload className="size-6 text-ink-soft" />
                <p className="text-[14px] text-ink-soft">Arraste arquivos aqui ou</p>
                <button type="button" onClick={() => fileInput.current?.click()} className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[14px] font-bold hover:bg-brand-soft">
                  <Paperclip className="size-4" /> Selecionar arquivos
                </button>
                <input ref={fileInput} type="file" multiple className="sr-only" tabIndex={-1} aria-label="Selecionar arquivos" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              </div>
              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2 text-[14px]">
                      <Paperclip className="size-4 shrink-0 text-ink-soft" />
                      <span className="min-w-0 flex-1 truncate">{f.name}</span>
                      <span className="text-[12px] text-ink-soft">{f.size < 1048576 ? `${Math.max(1, Math.round(f.size / 1024))} KB` : `${(f.size / 1048576).toFixed(1)} MB`}</span>
                      <button type="button" aria-label={`Remover ${f.name}`} onClick={() => setFiles((l) => l.filter((_, j) => j !== i))} className="flex size-8 coarse:size-11 items-center justify-center rounded-lg hover:bg-brand-soft">
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className={cn(card, "overflow-hidden")}>
        <h2 className="border-b border-line px-6 py-4 text-[20px] font-bold">Descrição</h2>
        <div className="p-6">
          <label htmlFor="description" className="sr-only">Descrição da solicitação</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={8} placeholder="Descreva a solicitação: o que acontece, desde quando e o que já foi tentado." className="w-full resize-y rounded-2xl border border-line bg-white p-4 text-[16px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15" />
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <Link href="/solicitacoes" className="flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-6 text-[16px] font-bold hover:bg-brand-soft">
          <Undo2 className="size-4" /> Voltar
        </Link>
        <button type="submit" className="flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-[16px] font-bold text-white transition-colors hover:bg-brand-dark motion-reduce:transition-none">
          <Save className="size-4" /> Salvar solicitação
        </button>
      </div>
    </form>
  );
}
