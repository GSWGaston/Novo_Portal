# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Todos os colaboradores da Facta, da matriz e das lojas. Usam o portal interno no dia a dia, em tarefas curtas: abrir e acompanhar chamados de suporte, achar o ramal ou o e-mail de alguém, reservar sala, consultar políticas e atas, ver aniversariantes e organizar compromissos. A maior parte tem pouca familiaridade com sistemas, então cada tela precisa ser óbvia à primeira vista. O suporte de TI também usa as telas de gestão de chamados, com mais intensidade, mas não é o público principal.

## Product Purpose

Portal interno que reúne, num só lugar, os sistemas e serviços da empresa (Solicitações, Relatórios, Diversos, Recursos Humanos, Ajuda, Código de Ética, Repositório). Este projeto é o redesenho do portal real (portal.facta.com.br/novo2), reconstruído em Next.js. Sucesso é o colaborador resolver o que veio fazer em poucos cliques, sem treinamento.

## Operating Context

- O portal original tem login e uma barra superior com menus e submenus; o redesenho mantém essa navegação.
- Comunicados internos aparecem no painel de acesso: urgentes em popup, os demais como faixa.
- Chamados têm status (Em desenvolvimento, Pendente validação, Aguardando solicitante, Concluído – confirmação), prioridade e histórico de interações.
- Os dados do protótipo ficam no navegador (`localStorage`) ou em arrays de exemplo; não há servidor.

## Capabilities and Constraints

- Telas feitas: login, painel de acesso, dashboard, lista de chamados do setor, detalhe do chamado, nova solicitação, minhas solicitações, histórico, buscar colaborador (antigo Ramais), calendário de compromissos, relação de aniversários, reservas de salas, políticas SEGINFO, atas de reunião.
- Opções de menu sem tela ainda apontam para `#` (marcadas como `soon` em `navMenus`).
- Downloads de PDF (políticas, atas) são demonstração; os arquivos reais não existem no projeto.
- Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4. As regras de design vivem em `docs/design/DIRETRIZES-DE-DESIGN.md`.
- Em aberto: opções reais de "Solicitar para", "Motivo" e "Loja" na nova solicitação; significado exato do filtro "Setor" do dashboard e da coluna "Dias"; filtro "Aguardando retorno" não incluído; logo oficial e imagem do personagem do login não fornecidos.

## Brand Commitments

- O azul da identidade da Facta e a tipografia Plus Jakarta Sans já em uso nas telas.
- O nome "Facta" e a navegação por menus superiores do portal original.

## Evidence on Hand

- Capturas do portal original usadas como referência de conteúdo e fluxo.
- Todas as pessoas, ramais, e-mails, atas, reservas, compromissos e políticas são fictícios, só para demonstração. Nada disso pode ser tratado como conteúdo oficial nem apresentado como prova.
- Não há depoimentos, métricas reais ou arquivos de políticas e atas.

## Product Principles

- A tarefa do colaborador vem antes da estética: cada tela mostra o que ele veio fazer, sem passos desnecessários.
- Consistência entre telas: o mesmo padrão para o mesmo tipo de coisa (listas, filtros, dropdowns, datas, cartões, modais).
- Menos níveis de menu: o que cabe numa página não vira dropdown.
- Usável por todos: alvos de toque de 44px em telas de toque, foco visível, navegação por teclado e respeito a movimento reduzido.
- Conteúdo de exemplo nunca se passa por real.

## Accessibility & Inclusion

Alvos de toque de pelo menos 44px, navegação completa por teclado, foco preso em modais, leitores de tela (rótulos e `aria-live` nas mudanças de estado) e `prefers-reduced-motion` respeitado. Exigência confirmada para o protótipo.
