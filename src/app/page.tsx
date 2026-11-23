import Link from "next/link";
import { Clock } from "@/components/sites/facta/clock";
import { portalApps } from "@/components/sites/facta/data";
import { SiteShell } from "@/components/sites/facta/site-shell";

export default function Home() {
  return (
    <SiteShell footer="© 2018 . Todos os direitos reservados. Facta Empréstimos">
      <div className="flex min-h-[80px] items-center justify-between rounded-[4px] bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
        <h1 className="text-[18px] font-normal text-[#4c5961]">Usuário Demo, bem vindo(a)!</h1>
        <Clock />
      </div>

      <div className="mt-[30px] space-y-[14px] rounded-[4px] bg-white p-[17.5px] text-[16px] leading-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
        <p>
          A equipe da <strong className="font-semibold text-[#4c5961]">Programação</strong>, está sempre em busca de novas tecnologias para fazer o seu dia mais produtivo na empresa.
        </p>
        <p>
          Diante desse compromisso que temos com você, estudamos e aperfeiçoamos três sistemas em um, ou seja, com um acesso, você tem a possibilidade de acessar três sistemas da empresa.
        </p>
        <p>Confira abaixo, quais foram eles:</p>
      </div>

      <div className="mt-[30px] grid grid-cols-1 gap-x-[30px] sm:grid-cols-2 lg:grid-cols-3">
        {portalApps.map((app) => (
          <Link
            key={app.title}
            href={app.href}
            className="group mb-[30px] block overflow-hidden rounded-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
            style={{ backgroundColor: app.color }}
          >
            <div className="flex h-[209px] items-start justify-center pt-[25px] text-white">
              <i className={`fa ${app.icon}`} style={{ fontSize: 150 }} />
            </div>
            <div className="bg-[#f7f7f7] px-[17.5px] pb-[30px] pt-[29px] text-center">
              <h3 className="text-[21px] font-normal leading-[30px] text-black">{app.title}</h3>
            </div>
            <div className="h-[10px] bg-[#e0e0e0]">
              <div
                className="h-full origin-left"
                style={{
                  background: app.gradient ?? app.color,
                  animation: app.gradient ? "facta-bar-in 1.2s ease-out both" : undefined,
                }}
              />
            </div>
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
