# Portal Facta — page brief

Source: `https://portal.facta.com.br/novo2/` (area logada, inspecionada em 2026-11-23, desktop ~1912px).

## Route map

| Source path | Local route | Files |
|---|---|---|
| `/novo2/sistema/sys/dashboard.php` | `/` | `src/app/page.tsx` |
| `/novo2/sistema/portal/dashboard.php` | `/solicitacoes` | `src/app/solicitacoes/page.tsx` |
| `/novo2/sistema/portal/solicitacoes/setores.php` | `/solicitacoes/setores` | `src/app/solicitacoes/setores/page.tsx` |

Shared: `src/components/sites/facta/` (shell, nav, data, pie chart, filters/table). Font: Poppins (next/font) + Font Awesome 4.7 (`public/sites/facta/fonts/`).

## Measurements (desktop)
- Header 60px, `linear-gradient(to right,#0178bc,#00bdda)`; dark band `#383f4c` to y=162; content starts y=126 (overlaps band by 36px); side gutter 49px.
- Body Poppins 13px, `#67757c`. Home cards: 3 cols, gap 30px, 308px tall (209 icon area + 89 title + 10 bar), FA icon 150px.
- Card colors: `#ff002e #1e9ff2 #28d094 #9c27b0 #ff9149 #666ee8 #00bcd4`.
- Dashboard: 3 equal columns (568px, gap 30px); stat cards ~151px tall.
- Setores table column widths (%): 3.9 5.3 6 8.4 8.4 4.3 10.5 10.6 10.6 7.7 8.4 5.3 10.6.

## Not copied / known gaps
- All names, ticket numbers and counts are fictitious (the source shows real employees and tickets).
- Logo is a text placeholder (inline SVG was not extracted).
- Dropdowns of Diversos, RH, Ajuda, Código de Ética, Repositório; bell/user menus; sort headers; Excel export; other portal apps (Agenda, RH, ...) were not inspected/implemented.
- Pie chart is a hand-written SVG, not Highcharts (no hover/export menu).
