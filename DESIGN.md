---
name: Portal Interno Facta
description: Portal interno claro e confiável, que resolve tarefas curtas do dia a dia com poucos cliques.
colors:
  brand-blue: "#0b5fe0"
  brand-blue-deep: "#0847b0"
  brand-blue-mist: "#e8f0ff"
  harbor-navy: "#052a66"
  ink: "#0b1f4d"
  ink-soft: "#4b5b7c"
  ink-mute: "#66738f"
  ice-surface: "#f3f7ff"
  hairline: "#e1e9f6"
  alert-red: "#e5391f"
  alert-red-wash: "#fdeceb"
  alert-red-ink: "#b3200f"
  amber: "#f08a00"
  amber-wash: "#fff3df"
  amber-ink: "#8f5200"
  go-green: "#17a05d"
  go-green-wash: "#e4f7ec"
  go-green-ink: "#0c6e3d"
  person-violet: "#6a3fc9"
typography:
  page-title:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.025em"
  section-title:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  interface:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
  label:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.05em"
  kpi:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 800
    lineHeight: 1
rounded:
  tag: "8px"
  control: "12px"
  card-inner: "16px"
  card: "24px"
  dialog: "28px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.brand-blue}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "{colors.brand-blue-deep}"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 20px"
  button-navy:
    backgroundColor: "{colors.harbor-navy}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 24px"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    typography: "{typography.interface}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 12px"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.card}"
    padding: "24px"
  card-inner:
    backgroundColor: "#ffffff"
    rounded: "{rounded.card-inner}"
    padding: "16px"
  tag-action:
    backgroundColor: "{colors.brand-blue-mist}"
    textColor: "{colors.brand-blue}"
    typography: "{typography.interface}"
    rounded: "{rounded.tag}"
    padding: "4px 10px"
  tag-neutral:
    backgroundColor: "{colors.ice-surface}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.interface}"
    rounded: "{rounded.tag}"
    padding: "4px 10px"
---

# Design System: Portal Interno Facta

## Overview

**Creative North Star: "O Balcão de Atendimento"**

O portal é o balcão de informações da empresa: tudo à mão, sem manual de instruções. O colaborador chega com uma tarefa curta (abrir um chamado, achar um ramal, reservar uma sala), e a tela mostra o que ele veio fazer sem passos extras. A atmosfera é clara e arejada: fundos brancos e azul-gelo, bastante espaço, poucos elementos competindo. O tom é confiável e corporativo, com o azul da marca como âncora e o azul-marinho na estrutura, sempre amigável e nunca burocrático.

A densidade é estável e deliberada: cartões compactos e listas enxutas, pensados para caber numa tela sem rolagem. A hierarquia vem de peso e de espaço, não de barulho. Só o título da página e os números de resumo usam peso 800; o resto fica em peso médio. A cor só aparece quando significa algo.

**Key Characteristics:**
- Fundo claro com gradiente radial muito suave em azul-gelo; cartões brancos com sombra difusa azulada.
- Azul para ação, azul-marinho para estrutura, vermelho/âmbar/verde para urgência, atenção e sucesso, violeta para pessoa.
- Uma só família tipográfica (Plus Jakarta Sans) numa escala fixa de poucos tamanhos.
- Componentes arredondados, calmos e previsíveis: o mesmo padrão para o mesmo tipo de coisa.
- Alvos de toque de 44px, foco visível e movimento sempre com alternativa de "reduzir movimento".

## Colors

Uma paleta de azuis institucionais sobre branco e azul-gelo, com três cores de estado e uma de identidade de pessoa. Os hex são normativos no frontmatter; aqui só o papel de cada um.

### Primary
- **Azul Facta** (`brand-blue`): ação principal, links, foco e seleção. Botão principal, aba ativa, dia de hoje no calendário, tags clicáveis (sobre o fundo suave).
- **Azul Facta Profundo** (`brand-blue-deep`): hover do botão principal.
- **Névoa Azul** (`brand-blue-mist`): fundo de hover, selos e contadores azuis, quadrados de ícone, tags de ação.

### Secondary
- **Azul Marinho do Porto** (`harbor-navy`): estrutura. Cabeçalho (em degradê até o azul vivo), barra de busca das listas, segmentos ativos de seletores, botão "Pesquisar", avisos temporários.

### Tertiary
- **Vermelho de Alerta** (`alert-red`): urgência e erro. Chamados urgentes, prioridade Alta, campos inválidos. Texto sobre o fundo suave usa `alert-red-ink`.
- **Âmbar** (`amber`): atenção. Prioridade Média, "Pendente validação", item fixado. Texto usa `amber-ink`.
- **Verde de Sucesso** (`go-green`): sucesso e variação positiva. Prioridade Baixa, concluído. Texto usa `go-green-ink`.
- **Violeta de Pessoa** (`person-violet`): cor de reserva do calendário ("Roxo"). A etiqueta de quem escreveu no histórico do chamado usa o fundo suave do âmbar (`amber-wash` com texto `amber-ink`), não o violeta.

### Neutral
- **Tinta** (`ink`): texto principal.
- **Tinta Suave** (`ink-soft`): texto secundário, rótulos e metadados (6,8:1 sobre branco).
- **Tinta Muda** (`ink-mute`): ícones discretos e dias de outros meses.
- **Superfície Gelo** (`ice-surface`): fundo da página, cabeçalhos de tabela, campos somente leitura, tags neutras.
- **Fio** (`hairline`): bordas e divisórias.

### Named Rules
**The Color Means Something Rule.** Cada cor carrega um significado fixo (ação, estrutura, urgência, atenção, sucesso, pessoa). Nenhuma cor é usada só para enfeitar.

**The Ink On Wash Rule.** A cor cheia (`alert-red`, `amber`, `go-green`) serve para ícones, pontos e preenchimentos. Texto sobre fundo suave usa sempre a variante `-ink`, para manter 4,5:1.

## Typography

**Display Font:** Plus Jakarta Sans (com `ui-sans-serif, system-ui, sans-serif` como reserva)
**Body Font:** Plus Jakarta Sans
**Label/Mono Font:** Plus Jakarta Sans; números em tabela usam algarismos tabulares.

**Character:** Uma sans geométrica e acolhedora, de formas abertas, que lê bem em tamanhos pequenos e em português. A hierarquia vem do peso, não de uma segunda família.

### Hierarchy
- **Page title** (800, 32px, 1, `-0.025em`): título de cada página interna; o único uso do peso 800 fora dos números de resumo.
- **Section title** (700, 20px, 1.25): título de cartão e de seção.
- **Body** (400–700, 16px, 1.5): texto corrido, botões principais, campos grandes, títulos de cartão pequeno.
- **Interface** (500–700, 14px, 1.4): tabelas, botões menores, campos, tags e texto secundário.
- **Label** (700, 12px, `0.05em`, caixa-alta quando é cabeçalho de tabela): metadados e cabeçalhos.
- **KPI** (800, 34px, 1): números do resumo do dashboard.

### Named Rules
**The Fixed Scale Rule.** Só existem os tamanhos 12, 14, 16, 18, 20 e 32 (mais 34 para o número de resumo e 44 na saudação da página inicial). Não crie tamanhos novos.

## Layout

Contêiner centralizado de até 1720px, com margem lateral de 16px no celular e 32px a partir do tablet. O ritmo vertical entre blocos é de 16px nas telas densas (dashboard) e 24px nas demais. Cartões usam 24px de padding interno (16px nos compactos).

Grades de cartões crescem de 1 coluna no celular para 2 no tablet e 3 a 4 em telas largas. Listas longas viram tabela no desktop e cartões no celular. Menus de navegação viram uma barra de chips com lista expansível abaixo de 1024px. As telas foram dimensionadas para caber sem rolagem em janelas de cerca de 900px de altura; o rodapé pode ficar abaixo da dobra.

## Elevation & Depth

Plano por padrão, com sombra suave só nos cartões. A profundidade vem de bordas finas e de uma sombra difusa azulada nos cartões principais; painéis que flutuam sobre o conteúdo (dropdown, calendário, menus) ganham uma sombra mais marcada, e o popup de comunicado tem a mais forte, com o fundo desfocado.

### Shadow Vocabulary
- **Cartão** (`box-shadow: 0 1px 2px rgba(11,31,77,0.04), 0 8px 24px -8px rgba(11,60,150,0.14)`): cartões principais de seção.
- **Cartão interno** (`shadow-sm`, sombra mínima do Tailwind): cartões pequenos dentro de uma seção.
- **Painel flutuante** (`0 12px 32px -8px rgba(11,31,77,0.25)`): dropdowns, seletor de data, submenus.
- **Menu superior** (`0 16px 40px -12px rgba(5,42,102,0.35)`): painéis dos menus da barra.
- **Popup** (`0 40px 100px -20px rgba(0,0,0,0.5)`): comunicados e modais.

### Named Rules
**The Quiet Surface Rule.** Um bloco em repouso tem borda fina e, no máximo, a sombra de cartão. Sombra mais forte só em algo que flutua sobre a página.

## Shapes

Cantos generosos e consistentes. Cartões de seção têm 24px de raio; cartões internos, 16px; campos e botões, 12px; tags e selos, 8px; contadores em pílula, totalmente redondos; modais, 28px. Bordas de 1px na cor `hairline`. Avatares e o botão de fechar são círculos. Não há recortes decorativos nem barras coloridas nas laterais dos blocos.

## Components

### Buttons
- **Shape:** cantos de 12px (`rounded-xl`), altura de 44px (48px nas ações principais de página), peso 700.
- **Primary:** fundo `brand-blue`, texto branco, 16px; hover em `brand-blue-deep`.
- **Secondary:** fundo branco, borda `hairline`, hover em `ice-surface`.
- **Navy:** fundo `harbor-navy`, texto branco; usado em "Pesquisar" e nos segmentos ativos.
- **Ghost de ação:** texto azul sobre fundo transparente, hover em `brand-blue-mist` (Editar, Hoje).
- **Danger ghost:** texto `alert-red-ink`, hover em `alert-red-wash` (Excluir, Cancelar).
- **Toque:** em telas de toque a altura sobe para 44px mínimos (variante `coarse`).

### Tags
- **Tag de ação:** fundo `brand-blue-mist`, texto azul, raio de 8px, ícone à esquerda; é um botão inteiro (ramal e e-mail copiam ao clicar).
- **Tag neutra:** fundo `ice-surface` com anel `hairline`, texto `ink-soft`; só informa (setor, "Sem ramal").
- **Selos de estado:** fundo suave com texto `-ink` (Ativa, Cancelada, prioridades).

### Cards / Containers
- **Corner Style:** 24px (seção) e 16px (interno).
- **Background:** branco a 90% sobre o fundo claro; interno em branco puro.
- **Shadow Strategy:** ver Elevation; interno só com sombra mínima.
- **Border:** `border-white` nos de seção, `hairline` nos internos.
- **Internal Padding:** 24px (seção) e 16px (interno).

### Inputs / Fields
- **Style:** altura de 44px, fundo branco, borda `hairline`, raio de 12px, texto de 14px.
- **Focus:** borda azul e anel difuso (`ring-4` em azul a 15%).
- **Error:** borda `alert-red` e mensagem logo abaixo em `alert-red-ink`, 14px.
- **Disabled/leitura:** fundo `ice-surface`.

### Dropdown e Data
Nunca nativos. O dropdown (`Select`) e o calendário (`DatePicker`) têm gatilho igual a um campo, seta que gira e painel claro flutuante; o dropdown ganha busca com mais de 6 opções. Teclado completo.

### Navigation
- **Barra superior:** degradê de `harbor-navy` a azul vivo, 68px; itens em branco a 80%, 14px, peso 600; ativo em `brand-blue` com texto branco.
- **Menus:** abrem ao passar o mouse (e ao clicar/teclar), com submenu lateral para grupos; a seleção atual fica destacada.
- **Celular:** chips com a lista expansível abaixo.
- **Migalhas:** ícone de casa, 14px, última em peso 600.

### Seletor segmentado
Contêiner arredondado com borda `hairline`; o item ativo fica em `harbor-navy` com texto branco (ou em `brand-blue` nas visões de calendário). Usado para Todos/Matriz/Loja, Reuniões/Treinamentos e Mês/Semana/Dia.

### Cartão de pessoa
Cartão interno compacto com avatar de iniciais em círculo azul-suave, nome em 16px/700, cargo em 14px, tag de ramal à direita, linha divisória, tag neutra de setor e tag de ação com o e-mail.

## Do's and Don'ts

### Do:
- **Do** usar os tokens (`brand`, `ink`, `line`…) em vez de hex soltos.
- **Do** manter o mesmo padrão para o mesmo tipo de coisa: lista, filtro, dropdown, data, cartão e modal têm um só componente.
- **Do** usar texto `-ink` sobre fundos suaves de estado.
- **Do** manter 44px de alvo de toque e foco visível, e tratar `prefers-reduced-motion`.
- **Do** mostrar "Em breve" e desativar o que ainda não existe.
- **Do** deixar a profundidade nos cartões e nos painéis flutuantes, e mais nada.

### Don't:
- **Don't** usar `<select>` ou `<input type="date">` nativos.
- **Don't** usar gradientes decorativos nem barras coloridas nas laterais de blocos.
- **Don't** usar cor só para enfeitar: cada uma tem significado fixo.
- **Don't** criar tamanhos de fonte fora da escala fixa.
- **Don't** passar dados de exemplo por conteúdo oficial.
- **Don't** deixar um botão que parece funcionar e não faz nada.
