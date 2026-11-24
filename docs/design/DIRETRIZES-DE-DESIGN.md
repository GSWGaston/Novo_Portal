# Diretrizes de design — Portal Interno da Facta

Documento de referência para qualquer IA ou pessoa que for criar ou alterar telas deste projeto.
Leia inteiro antes de escrever UI. Quando algo aqui conflitar com um hábito seu, siga o documento.

Origem: redesenho das telas de Login, Painel de acesso, Dashboard de Solicitações, lista "Pendentes no setor" e tela do Chamado (ver `docs/redesign/Redesenho-Portal-Facta.pdf`).

---

## 1. Princípios

1. **É uma ferramenta de trabalho (modo "Operate").** As telas internas servem para concluir tarefas rápido. Clareza, consistência e densidade estável vêm antes de expressão. O login e o painel de acesso são as únicas telas de "entrada", com mais personalidade.
2. **Uma família visual só.** Todas as telas parecem do mesmo produto: mesmos tokens, mesmos componentes, mesma tipografia. Nunca invente um estilo novo para uma página nova.
3. **Cor significa algo.** Azul = ação e marca. Azul-marinho = estrutura (cabeçalho, barras, selo "Sistema"). Vermelho/âmbar/verde = urgência/atenção/ok. Violeta = pessoa (usuário). Nada de cor decorativa.
4. **Hierarquia por peso e espaço, não por barulho.** Poucas âncoras fortes (título da página, números do resumo); o resto em peso médio. Sem gradientes decorativos, sem barras laterais coloridas em caixas.
5. **Movimento só para explicar.** Animação ajuda a entender uma mudança (uma linha que muda de lugar, um registro novo). Nunca decorativa, sempre com alternativa para "reduzir movimento".
6. **Funciona para todos.** Teclado, toque, leitor de tela e contraste AA são requisito, não extra.
7. **Honestidade.** Se algo ainda não existe, diga ("Em breve") e desative; nunca deixe um botão que parece funcionar e não faz nada.

---

## 2. Tokens

Todos definidos em `src/app/globals.css` (bloco `@theme inline`). **Use os tokens, não hex soltos.**

### Cores

| Token (classe Tailwind) | Hex | Papel |
|---|---|---|
| `ink` | `#0b1f4d` | Texto principal |
| `ink-soft` | `#4b5b7c` | Texto secundário, rótulos, metadados (6,8:1 sobre branco) |
| `ink-mute` | `#66738f` | Ícones discretos (pin não fixado) |
| `navy` | `#052a66` | Estrutura: cabeçalho, barra de busca da lista, cabeçalho de painéis laterais, tag "Sistema" |
| `brand` | `#0b5fe0` | Ação principal, links, foco, seleção |
| `brand-dark` | `#0847b0` | Hover do botão principal |
| `brand-soft` | `#e8f0ff` | Fundo de hover, selos azuis, ícones em quadrado |
| `surface` | `#f3f7ff` | Fundo da página, cabeçalhos de tabela, campos de leitura |
| `line` | `#e1e9f6` | Bordas e divisórias |
| `danger` / `danger-soft` / `danger-ink` | `#e5391f` / `#fdeceb` / `#b3200f` | Urgente, erro, prioridade Alta |
| `warn` / `warn-soft` / `warn-ink` | `#f08a00` / `#fff3df` / `#8f5200` | Atenção, prioridade Média, "Pendente validação", item fixado |
| `ok` / `ok-soft` / `ok-ink` | `#17a05d` / `#e4f7ec` / `#0c6e3d` | Sucesso, prioridade Baixa, variação positiva |
| `user` | `#6a3fc9` | Tag de usuário (pessoa) |

**Regra de contraste:** a cor "cheia" (`danger`, `warn`, `ok`) serve para ícones, pontos e preenchimentos. **Texto** sobre fundo suave usa sempre a variante `-ink` (`text-danger-ink` sobre `bg-danger-soft`). Texto pequeno precisa de 4,5:1; ícones e controles, 3:1.

Sombra de cartão: `shadow-card`. Fundo do app: gradiente radial muito suave em azul claro sobre `surface`.

### Tipografia

- Fonte: **Plus Jakarta Sans** (pesos 400–800), carregada com `next/font/google` em `layout.tsx`. Idioma `pt-BR`.
- Escala fixa (não crie tamanhos novos):

| Papel | Tamanho | Peso |
|---|---|---|
| Metadado, rótulo pequeno, cabeçalho de tabela | 12px | 600–700 (cabeçalho de tabela: caixa-alta, `tracking-wider`) |
| Interface e texto secundário (tabelas, botões menores, campos) | 14px | 400–700 |
| Corpo, botões principais, campos grandes | 16px | 400–700 |
| Subtítulo forte (ex.: código do chamado em lista curta) | 18px | 700 |
| Título de seção/cartão (h2) | 20px | 700 |
| Título de página (h1) nas telas internas | 32px | 800, `leading-none`, `tracking-tight` |
| Número de destaque (KPI) | 40px | 800 |
| Display (só login/portal) | 34–44px | 800 |

- **Peso 800 só em títulos de página e números de destaque.** O resto que precisa de ênfase usa 700.
- Títulos com `text-wrap: balance`, parágrafos com `pretty` (já global). Tabelas e números com algarismos tabulares (já global em `table`; use a classe `.tabular` em outros números alinhados).
- Corpo nunca abaixo de 14px; metadado nunca abaixo de 12px.

### Espaçamento e grade

- Escala base de 4px. Espaços recorrentes: 12 (`gap-3`), 16 (`gap-4`), 24 (`gap-6`).
- Conteúdo interno: largura máxima **1720px**, `px-4` no celular e `md:px-8` acima. Entre blocos de uma página: `space-y-6` / `gap-6`.
- Cabeçalho de cartão: `px-6 py-4` com `border-b border-line`. Corpo de cartão: `p-5` ou `p-6`.
- Cantos: cartões `rounded-3xl`; campos, botões e blocos internos `rounded-xl`/`rounded-2xl`; selos `rounded-full`.
- Proximidade antes de contêiner: agrupe por espaço; só crie caixa quando houver grupo distinto. Nunca coloque cartão dentro de cartão.

---

## 3. Componentes (padrões a reutilizar)

Os componentes ficam em `src/components/sites/facta/`.

- **Cabeçalho (`app-header.tsx`):** faixa em gradiente azul-marinho→azul, `h-[68px]` nas telas internas (variante `app`, com menu) e `h-[76px]` no painel (variante `portal`). Itens do menu 14px, o ativo em `bg-brand`. Busca, notificações (selo vermelho com contagem) e menu do usuário à direita. Abaixo de 1024px o menu vira uma faixa rolável.
- **Casca (`app-shell.tsx`):** cabeçalho + conteúdo + rodapé. Telas internas: `<AppShell variant="app">`.
- **Cartão:** `rounded-3xl border border-white bg-white/90 shadow-card`. Seções do dashboard usam `overflow-hidden` com cabeçalho `border-b`.
- **Painel lateral escuro (`Side` em `ticket-detail.tsx`):** título em faixa `bg-navy` com ícone, corpo claro. Para blocos de apoio ao lado de um conteúdo principal.
- **Botão principal:** `h-11` ou `h-12`, `rounded-xl bg-brand text-white font-bold hover:bg-brand-dark`. **Secundário:** `border border-line bg-white font-bold hover:bg-brand-soft`. **Desativado:** `disabled:opacity-60` e `cursor-not-allowed`, com `title` explicando.
- **Campos:** `h-11 rounded-xl border-line bg-white px-3 text-[14px]`, foco `focus:border-brand focus:ring-4 focus:ring-brand/15`. Rótulo sempre visível acima; placeholder é exemplo, não rótulo.
- **Selos (pílulas):** `rounded-full px-3 py-1 text-[14px] font-bold`, fundo `-soft` + texto `-ink` + ícone/ponto na cor cheia. Já existem `StatusPill` e `PriorityPill` (exportados de `tickets-view.tsx`): reutilize.
- **Tags de autoria (histórico):** pessoa = fundo `user` + texto branco + ícone de pessoa; sistema = fundo `navy` + texto branco + ícone de engrenagem + rótulo "SISTEMA".
- **Tabela de dados:** cabeçalho `bg-surface` com texto 12–14px; linhas com `border-b border-line` ou zebra `even:bg-surface/60`; células sem quebra de linha (`whitespace-nowrap`), `px-2.5`; colunas secundárias vão como segunda linha menor dentro da mesma célula (ex.: origem sob o solicitante). Coluna de ações na esquerda.
- **Lista de chamados:** busca + "Busca exata" (botão que alterna, `aria-pressed`) + "Filtros" na barra azul-marinho; filtros comuns à vista e o resto atrás de "Mais filtros"; chips dos filtros aplicados com "Limpar todos"; paginação no rodapé.
- **Item fixado:** fundo `warn-soft` a 50% + faixa de 3px interna à esquerda; sobe para o topo da lista. Alça de arrastar flutua à esquerda só ao passar o mouse (sempre visível em toque).
- **Popup (aviso urgente):** `role="dialog"`, foco entra no botão "Entendi", Tab preso dentro, Esc/X/clique fora fecham, foco volta a quem abriu. Depois de dispensado, vira banner na página.
- **Aviso trivial:** banner inline no painel, sem popup.
- **Toast:** canto inferior direito, `bg-navy`, `role="status"`, some em 3s.
- **Estado vazio:** título curto + dica de recuperação + botão de ação ("Limpar busca e filtros").
- **Controle indisponível:** cartão ou botão com borda tracejada/desativado e o texto "Em breve".

---

## 4. Padrões de tela

- **Tela de lista/operação:** migalhas de pão → título (h1 32px com ícone) → bloco único com barra de ferramentas + tabela + rodapé.
- **Dashboard:** título + seletores à direita → linha de 4 números de resumo → blocos de atenção (urgentes, sem interação) → análise (Top 5) + atalhos em lista compacta.
- **Detalhe com histórico:** cabeçalho do registro (ícone, título, selos de status/prioridade, linha de metadados) → coluna principal (histórico em tabela + resposta) + coluna lateral de 380px (Gerenciar primeiro, depois contexto).
- **Tela de entrada (login/painel):** só aqui há mais respiro e personalidade (cartão branco grande, fundo azul com personagem, cartões de sistema coloridos).
- Menu superior fixo igual em todas as telas internas: Dashboard, Solicitações, Relatórios, Diversos, Recursos Humanos, Ajuda, Código de Ética e Conduta, Repositório.

---

## 5. Interação, movimento e acessibilidade

- **Teclado:** todo controle é alcançável e tem foco visível. Itens reordenáveis aceitam ↑ ↓; mudanças dinâmicas são anunciadas em uma região `aria-live`.
- **Toque:** a variante `coarse:` (definida em `globals.css`, mídia `pointer: coarse`) aumenta alvos para **44px** (`coarse:size-11`, `coarse:h-11`). Em mouse, alvos podem ter 32–40px. Controles que só aparecem no hover precisam de equivalente em toque.
- **Arrastar:** use eventos de ponteiro com captura, `touch-action: none` na alça, cancele em `pointercancel`/`lostpointercapture`/blur e role a página quando o dedo chega a 96px da borda.
- **Movimento:** durações 150–300ms, curva `cubic-bezier(0.16, 1, 0.3, 1)`. Já existem: deslize de linhas ao reordenar (260ms), abertura do popup (`facta-pop`), destaque de registro novo (`facta-flash`, 1,6s). Hover **não** move o próprio elemento (só sombra/cor). Sempre inclua `motion-reduce:` ou verifique `prefers-reduced-motion`.
- **Contraste:** AA em todo texto e controle (ver seção de cores).
- **Semântica:** títulos em ordem, `th scope="col"` com `aria-sort`, botões de ícone com `aria-label`, formulários com rótulo.

---

## 6. Texto (pt-BR)

- Português do Brasil, direto, verbo + objeto no botão ("Enviar resposta", "Salvar alterações", "Limpar busca e filtros").
- Termos do produto: **Solicitações** é o módulo; cada item é um **chamado**; ver "Pendentes no setor". Mantenha o mesmo nome para o mesmo conceito.
- Erros dizem o que falta e como corrigir ("Informe seu usuário."), sem culpar a pessoa.
- Números com plural correto ("1 chamado encontrado", "N chamados encontrados"), nunca "(s)".
- Funcionalidade ausente: "Em breve", desativada e com dica.
- Todos os dados de exemplo são fictícios (nomes como "Solicitante Exemplo Um", logins gerados a partir do nome).

---

## 7. Convenções de código

- Next.js 16 (App Router), React 19, TypeScript estrito (sem `any`), Tailwind v4 com tokens em `@theme inline`, ícones `lucide-react` em traço único, utilitário `cn()` de `@/lib/utils`.
- **Leia `node_modules/next/dist/docs/` antes de usar APIs do Next:** esta versão tem mudanças (ex.: `params` é `Promise` em rotas dinâmicas).
- Componentes de cliente com `useSearchParams` ficam dentro de `<Suspense>`.
- Estilo por classes utilitárias; estilos inline só para valores dinâmicos. Componentes em PascalCase, exports nomeados.
- Cores/tamanhos via tokens e escala acima; evite valores arbitrários (`text-[17px]`, hex) fora dos já existentes.
- Verificação antes de entregar: `npm run check` (lint + typecheck + build), conferir no navegador em 1440px e 375px (sem rolagem horizontal) e com teclado.
- Dados de exemplo e lógica de demonstração ficam em `data.ts`; não há backend nem autenticação real.

### Armadilhas conhecidas

- Servidor de desenvolvimento (Turbopack) às vezes não gera classes novas: limpe `.next` e reinicie. Se a fonte do Google falhar ao reiniciar, rode `npm run dev` pelo terminal (com rede).
- O erro de classe com espaço faltando em strings de `cn()` já aconteceu duas vezes: confira espaços entre classes.
- Larguras: a tabela de chamados precisa de ~1220px; abaixo disso aparece rolagem horizontal (intencional).

---

## 8. Checklist para uma tela nova

1. A tela cabe no padrão de uma das seções 4? Reutilize a estrutura.
2. Só tokens de cor e escala de tipografia? Texto sobre fundo suave usa `-ink`?
3. Há título h1 32px com ícone, migalhas de pão e `space-y-6`?
4. Estados cobertos: vazio, sem resultado, carregando, erro, desativado ("Em breve")?
5. Teclado e foco visível; alvos de 44px em toque (`coarse:`); `aria-label` nos botões de ícone?
6. Movimento só quando explica algo e com versão reduzida?
7. Texto em pt-BR consistente com os termos acima?
8. `npm run check` passa; 1440px e 375px sem rolagem horizontal inesperada.
