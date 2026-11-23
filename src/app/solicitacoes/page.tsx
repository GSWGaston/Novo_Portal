import { attentionTickets, stats } from "@/components/sites/facta/data";
import { PieChart } from "@/components/sites/facta/pie-chart";
import { ScopeToggle } from "@/components/sites/facta/scope-toggle";
import { PageTitle, SiteShell } from "@/components/sites/facta/site-shell";

const open = stats[0].value;

export default function SolicitacoesDashboard() {
  return (
    <SiteShell menu>
      <PageTitle title="Dashboard" trail={["Dashboard"]} />

      <div className="mt-[30px] inline-flex items-center gap-2 rounded-[3px] border border-[#e1e5e8] bg-white px-[14px] py-[5px] text-[12.5px] text-[#4c5961]">
        <i className="fa fa-bullhorn text-[#1e9ff2]" />
        Atualizações em produção
        <span className="text-[#98a6ad]">· 20/10/2026 08:34</span>
      </div>

      <section className="mt-[12px] rounded-[4px] bg-white p-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
        <div className="flex justify-end pb-[12px] pt-[8px]">
          <ScopeToggle />
        </div>

        <div className="grid grid-cols-1 gap-x-[30px] lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-x-[30px] md:grid-cols-2">
              <article className="relative flex h-[300px] flex-col rounded-[4px] bg-[#313d4f] p-6 text-white">
                <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/60">Meus chamados urgentes</h2>
                <div className="mt-4 flex items-center gap-2 text-[20px] font-semibold">
                  nº 1000123
                  <span className="rounded-[3px] bg-[#ff4961] px-[6px] py-px text-[11px] font-medium">Alta</span>
                </div>
                <p className="mt-3 text-[13px] leading-[1.5]">
                  Computador apresentando lentidão ao abrir o sistema. Solicito verificação do equipamento e atualização do acesso.
                </p>
                <p className="mt-3 text-[11px] text-white/60">
                  COMPUTADOR – LENTIDÃO · aberto em 13/07/2023 · 850 dia(s) útil(eis) em aberto
                </p>
                <span className="absolute bottom-[22px] left-6 h-[7px] w-[7px] rounded-full bg-white" />
              </article>

              <article className="flex h-[300px] flex-col overflow-hidden rounded-[4px] border border-[#e1e5e8] bg-white">
                <header className="flex items-center justify-between border-b border-[#f0d6d6] bg-[#fff1f1] px-[18px] py-[14px]">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#c0392b]">Atenção necessária</p>
                    <h2 className="mt-[2px] text-[16px] font-semibold leading-tight text-[#313d4f]">
                      Meus chamados sem interação há mais de 7 dias
                    </h2>
                  </div>
                  <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#dc3545] text-[14px] font-semibold text-white">
                    {attentionTickets.length}
                  </span>
                </header>
                <ul className="min-h-0 flex-1 overflow-y-auto px-[18px]">
                  {attentionTickets.map((t) => (
                    <li key={t.code} className="border-b border-[#eef0f1] py-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-[#313d4f]">nº {t.code}</span>
                        <span className="rounded-full bg-[#fde8e8] px-2 py-px text-[10px] font-medium text-[#c0392b]">{t.days} dias</span>
                      </div>
                      <p className="mt-[2px] text-[10px] font-semibold text-[#4c5961]">{t.status}</p>
                      <p className="text-[10px] text-[#98a6ad]">
                        {t.reason} · Última interação em {t.last}
                      </p>
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <article className="mt-[21px] overflow-hidden rounded-[4px] border border-[#e1e5e8] bg-white">
              <div className="border-b border-[#e1e5e8]">
                <span className="inline-flex items-center gap-1.5 bg-[#3b8cf5] px-[15px] py-[8px] text-[11px] font-medium text-white">
                  <i className="fa fa-bar-chart" /> Top 10 motivos em aberto
                </span>
              </div>
              <div className="relative px-2 py-3">
                <i className="absolute right-[28px] top-[14px] text-[18px] leading-none text-[#555]">≡</i>
                <PieChart />
              </div>
            </article>

            <article className="mt-[21px] rounded-[4px] bg-[#e05355] px-[18px] py-[18px] text-white">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide">
                  <i className="fa fa-flag-o" /> Concluídos no dia
                </h2>
                <span className="text-[18px] font-semibold">0 DE {open}</span>
              </div>
              <div className="mt-[10px] h-[7px] rounded-full bg-white/30" />
              <p className="mt-[9px] text-[10px]">0% dos atendimentos foram concluídos hoje!</p>
            </article>
          </div>

          <aside className="mt-[21px] space-y-[21px] lg:mt-0">
            <div className="h-[148px] rounded-[4px] bg-[#313d4f] p-4 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-[43px] w-[43px] items-center justify-center rounded-[4px] bg-white/20">
                  <i className="fa fa-user text-[22px]" />
                </span>
                <div>
                  <p className="text-[15px] font-semibold uppercase leading-tight">Usuário Demo</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/70">Você</p>
                </div>
              </div>
              <div className="mt-[18px] flex items-end justify-between border-t border-white/15 pt-[14px]">
                <p className="text-[10px] font-medium uppercase leading-[1.3] tracking-wider">
                  Chamados
                  <br />
                  em aberto
                </p>
                <span className="text-[30px] font-semibold leading-none">{open}</span>
              </div>
            </div>

            {stats.map((s) => (
              <div key={s.key} className="h-[151px] rounded-[4px] p-4 text-white" style={{ backgroundColor: s.color }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-[43px] w-[43px] items-center justify-center rounded-[4px] bg-white/25">
                    <i className={`fa ${s.icon} text-[22px]`} />
                  </span>
                  <div>
                    <p className="text-[26px] font-semibold leading-none">{s.value}</p>
                    <p className="mt-[2px] text-[11px] font-medium uppercase tracking-wider">{s.label}</p>
                  </div>
                </div>
                <div className="mt-[18px] flex items-start justify-between border-t border-white/25 pt-[10px] text-[10px] uppercase tracking-wide">
                  <p className="font-medium leading-[1.3]">
                    Maior tempo
                    <br />
                    de espera
                  </p>
                  <p className="text-right text-[12px] normal-case leading-[1.3]">
                    nº {s.ticket}
                    <br />
                    {s.days} dias
                  </p>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
