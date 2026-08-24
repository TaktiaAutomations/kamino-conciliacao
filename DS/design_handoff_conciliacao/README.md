# Handoff: Conciliação assistida por agente — re-skin com o Kamino Design System

## Overview
Este pacote leva o **design ajustado** (o Kamino Design System) para dentro do codebase existente `Kamino/Code/` — o protótipo funcional da **conciliação bancária assistida por agente** (case PM Sênior · Plataforma Financeira). O objetivo **não é recriar do zero**: o `Code/` já implementa toda a experiência e a lógica de domínio. A tarefa é **re-skinar os componentes existentes** para os valores do Design System (cor, tipografia, raio, sombra, espaçamento) e adotar os assets reais da marca.

## Sobre os arquivos deste pacote
Os arquivos em `prototype/` são **referências de design em HTML** — mostram o visual e o comportamento pretendidos, **não são código de produção para copiar tal e qual**. O `Code/` é React 19 + Vite + Tailwind v4; a implementação deve permanecer nesse ambiente, ajustando os componentes que já existem lá. Use este README + os tokens em `design-system/` como fonte da verdade dos valores.

Estrutura do pacote:
- `index.css` — **drop-in**: substitui o bloco `@theme` do seu `src/index.css`. É a migração de maior impacto.
- `design-system/` — o Design System completo: `styles.css`, `tokens/` (CSS vars), `assets/` (logo real), `readme.md` (foundations detalhadas) e `SKILL.md`.
- `prototype/` — os arquivos do protótipo HTML/JSX re-skinado (referência visual 1:1 do resultado esperado).
- `screenshots/` — capturas das telas principais já no visual do DS.

## Fidelidade
**Hi-fi.** Cores, tipografia, espaçamento, raios e interações são finais. Recrie pixel-perfect usando as classes/patterns do próprio `Code/` (Tailwind v4). Onde este doc der um hex/px exato, use-o — não arredonde para defaults de framework.

---

## Caminho de migração (recomendado, em 3 passos)

### Passo 1 — Tokens (cobre ~90% do re-skin, sem tocar em JSX)
Seu `src/index.css` usa Tailwind v4 CSS-first (`@theme {}`) com nomes semânticos que os componentes já consomem (`bg-navy-600`, `text-kgreen-600`, `bg-lime-brand`, `text-coral-600`, `text-ink`, `text-muted`). **Substitua o `@theme` inteiro pelo de `index.css` deste pacote.** Cada classe pega o novo valor automaticamente.

Mudanças de valor (antigo → DS):

| Token | Antes | Depois (DS) | Papel |
|---|---|---|---|
| `--color-navy-600` | #1e3a5f | **#05508a** | ação primária (botão navy, bolha do usuário, foco) |
| `--color-navy-700` | #17304f | **#0a4271** | hover/press do navy |
| `--color-navy-900` | #0f2036 | **#001e36** | ink profundo (logo) |
| `--color-navy-50` | #eef2f7 | **#eaf1f8** | tint do lançamento a criar |
| `--color-ink` | #17304f | **#001e36** | títulos, texto forte |
| `--color-kgreen-600` | #2f855a | **#079455** | Salvar/CNAB/conciliado |
| `--color-kgreen-700` | #276749 | **#05713f** | hover do verde |
| `--color-lime-brand` | #d9ee73 | **#e6fd8c** | pill de nav ativo |
| `--color-lime-brandDark` | #c4dd4a | **#d4f03c** | lime pressionado |
| `--color-coral-500` | #e53e3e | **#e02d20** | valores a pagar / erro |
| `--color-coral-600` | #c53030 | **#b42318** | coral escuro |
| `--color-muted` | #64748b | **#667085** | texto secundário |
| page bg (`body`) | #f4f6f9 | **#f9fafb** | fundo da página |

Também atualize os `rgba` das animações: `pulse-ring` → `rgba(7,148,85,…)`; `count-flash` → `rgba(230,253,140,…)`. (Já feito no `index.css` do pacote.)

### Passo 2 — Assets da marca
- Substitua o `src/components/Logo.tsx` desenhado à mão pelos assets reais em `design-system/assets/`:
  - `kamino-icon.png` — marca branca sobre quadrado ink (ícone de app, use na Sidebar e no avatar do agente no chat).
  - `kamino-mark.png` — marca em linha navy sobre claro (use no Login e onde a marca aparece sobre fundo claro).
- Copie-os para `Code/public/` (ou `src/assets/`) e referencie via `<img src="/kamino-icon.png">`.

### Passo 3 — Refinos finos (os 10% restantes)
Ajustes que não são cor e valem para bater com o DS. Detalhe por componente abaixo; foundations completas em `design-system/readme.md` → *Visual foundations*.

---

## Mapa por componente
Cada item marca **[mín]** (só troca de token, já resolvido no Passo 1) e **[refino]** (ajuste manual de classe).

### Sidebar (`components/Sidebar.tsx`)
- [mín] Item ativo: pill `bg-lime-brand` com texto `text-navy-700`/ink e chevron `›`.
- [refino] Trocar os glyphs unicode (`▦ ▤ $ ⛬`) por ícones de traço **Lucide** (2px, cantos arredondados) — o DS usa esse estilo. Ícones sugeridos: Painel=`layout-grid`, Pagar=`barcode`, Receber=`hand-coins`, Contas=`landmark`, Cartões=`credit-card`, Relatórios=`chart-column`, Mais=`more-horizontal`.
- [refino] Largura 232px (expandida); item: padding 10px 14px, radius 6px, fonte 14/600 quando ativo, 14/500 inativo; hover inativo `bg-slate-50`.
- Cabeçalho do workspace: mark 34×30 + nome bold 14 + domínio 12 muted.

### TopBar / header (`App.tsx` header)
- [mín] Botão "Atalhos" = navy primário (#05508a), radius 6px, com glyph raio.
- [refino] Barra de busca global "Ir para…" com lupa à esquerda, borda `#d0d5dd`, radius 6px, altura 42px, foco = borda navy + ring `rgba(5,80,138,0.28)` 3px.
- Avatar da persona: círculo 36px, iniciais brancas 14/600. Conta: `Nome@Org` em navy 14/600.

### Login (`components/Login.tsx`)
- [refino] Cards de persona: radius **12px**, borda `#d0d5dd`; hover = borda `#05508a` + `shadow-lg` (`0 12px 24px -6px rgba(16,24,40,.14)`).
- Avatar 44px na cor da persona (`dona #05508a`, `analista #079455`). Objetivo em itálico `#475467`. CTA "Entrar como… →" navy 12/600.
- Fundo: gradiente `#eaf1f8 → #eef2f7`.

### TopBalances (`components/TopBalances.tsx`)
- [mín] Saldo no banco = navy; saldo interno = coral (diverge) / kgreen (bate); % = navy→kgreen ao chegar em 100%; pendências = coral/kgreen.
- [refino] Container: card branco, borda `#eaecf0`, radius **8px**, `shadow-xs` (`0 1px 2px rgba(16,24,40,.05)`), divisores verticais `#eaecf0`.
- Label: 11px uppercase, letter-spacing .04em, muted. Valor: 18/700 tabular-nums. Barra de progresso: trilho `#f2f4f7`, preenchimento navy (ou kgreen a 100%), transição 700ms.

### CaseCard (`components/CaseCard.tsx`) — componente central
- [mín] Botão de ação: `escala` → navy; demais → kgreen. Selo de autonomia (ver cores abaixo).
- [refino] Card: branco, borda `#d0d5dd`, radius **8px**, `shadow-sm`, max-width 540px.
- Selo de autonomia (pill 11/600, dot 7px):
  - 🟢 age: bg `#e7f6ee`, texto `#05713f`, dot `#079455`, borda `rgba(7,148,85,.25)`.
  - 🟡 sugere: bg `#fef4e6`, texto `#b25e04`, dot `#f79009`, borda `rgba(247,144,9,.3)`.
  - 🔴 escala: bg `#fdeceb`, texto `#b42318`, dot `#e02d20`, borda `rgba(224,45,32,.25)`.
- Barra de confiança: trilho `#eaecf0`; preenchimento ≥90 verde `#079455`, ≥80 laranja `#f79009`, senão `#dd6b20`.
- Boxes Extrato ↔ Títulos: bg `#f9fafb`, borda `#eaecf0`, radius 6px; débito em coral, crédito em kgreen; separador `↔` em `#d0d5dd`.
- Evidências: `✓` kgreen (ok) / `!` laranja (atenção) + texto `#475467` 12px.
- Lançamento a criar: bg `#eaf1f8`, borda `#cfe0ef`, título navy 12/600.
- Rodapé: borda-topo `#eaecf0`; resolvido = check kgreen + "Resolvido · registrado na trilha".

### Chat (`components/Chat.tsx` + `MessageView.tsx`)
- [refino] Bolha do usuário: navy `#05508a`, texto branco, radius `16 16 4 16`, 14px.
- Bolha do agente: branco, borda `#d0d5dd`, radius `16 16 16 4`, texto `#344054` 14/1.55, `shadow-xs`.
- Avatar do agente: círculo 32px branco borda `#d0d5dd` com `kamino-icon.png` dentro.
- Typing: 3 dots 6px `#98a2b3`, blink 1.2s escalonado.
- Chips (rápidos e do agente): pill 12/600. Do agente: `bg-navy-50 #eaf1f8`, texto navy, borda `#cfe0ef`. Rápidos: branco, borda `#d0d5dd`, hover vira navy-50.
- Composer: textarea borda `#d0d5dd` radius 8px, foco navy+ring; botão Enviar navy 42px radius 8px, disabled 40% opacity.

### QueuePanel (`components/QueuePanel.tsx`)
- [refino] Largura 320px, borda-esq `#eaecf0`. Tabs = segmented em `#f2f4f7`, aba ativa branca com `shadow-xs`.
- Linhas de pendência: borda `#d0d5dd`, radius 6px, hover `bg #f9fafb` + borda `#cfe0ef`; dot de autonomia (verde/laranja/coral).
- Linhas conciliadas: borda `#eaecf0`, check kgreen; "Desfazer" aparece no hover, vira coral.
- Trilha: badge "IA" (kgreen bg `#e7f6ee`) × "Humano" (navy bg `#eaf1f8`); autor, hora, ação, evidência.
- Legenda no rodapé: dots age/sugere/escala.

---

## Interações & comportamento (já implementadas no `Code/` — preservar)
- **Envio de mensagem:** usuário → typing (~560ms) → resposta do agente; mensagens extras escalonam 420ms (com card) / 680ms; efeitos de conciliação em lote aplicam a cada 520ms.
- **Resolver caso:** via botão do card (autor = persona, "Humano") ou via efeito do agente (autor = "Agente Kamino", "IA"). Ao resolver manualmente, o agente posta um texto de confirmação.
- **Fronteira de IA:** `age` (exato) já vem conciliado; `sugere` exige 1 clique; `escala`/lançamento nunca é criado sem confirmação humana. "Concilia tudo ≥ 90%" respeita o limiar.
- **Reversível:** todo item conciliado pode ser desfeito na fila (hover → Desfazer); tudo entra na Trilha com autor/hora/evidência.
- **Personas:** dona (Bia, tom consultivo) × analista (Rafael, tom operacional) — mesma engine, saudação/chips diferentes. Trocar persona reinicia a conversa.
- **Reiniciar demo:** volta ao estado zero (2 de 7 já conciliados).
- Transições: 120ms cor/bg, 60ms press (scale .98), fade-in de mensagem 280ms. Sem bounce.

## State (já no `store.ts` — não mudar)
Fonte da verdade = conjunto `resolved`. Saldos, %, status de título e pendências são **derivados** dele. `audit` é a trilha. Não duplicar estado ao re-skinar.

## Design tokens (referência rápida)
Todos em `design-system/tokens/` e `design-system/readme.md`.
- **Cores:** ink #001e36 · navy #05508a (hover #0a4271) · lime #e6fd8c · verde #079455/#05713f · coral #e02d20/#b42318 · laranja #f79009 · grays 900 #101828 / 700 #344054 / 600 #475467 / 500 #667085 / 400 #98a2b3 / 300 #d0d5dd / 200 #eaecf0 / 100 #f2f4f7 / 050 #f9fafb.
- **Tipografia:** Inter (substituta — ver caveat). 14 base/inputs/botões, 13 denso/helper, 12 meta/uppercase, 18 título de seção, 22 título de página, 28 números. Pesos 400/600/700. Números tabulares.
- **Espaçamento:** grid 4px. Cards padding 24px; campos gap 16–20px; inputs 42px.
- **Raio:** 6 (botão/input) · 8 (card) · 12 (modal) · full (pills).
- **Sombra:** xs `0 1px 2px rgba(16,24,40,.05)` · sm `0 1px 3px rgba(16,24,40,.08),0 1px 2px rgba(16,24,40,.06)` · lg `0 12px 24px -6px rgba(16,24,40,.14),0 4px 8px -4px rgba(16,24,40,.08)`.
- **Foco:** borda navy + ring `rgba(5,80,138,.28)` 3px.

## Assets
- `design-system/assets/kamino-icon.png` — marca branca sobre quadrado ink (extraída do produto real).
- `design-system/assets/kamino-mark.png` — marca em linha navy sobre claro (extraída do produto real).
- Ícones de UI: usar **Lucide** (traço 2px arredondado) — é o match do DS. Instale `lucide-react` no `Code/` se ainda não houver.

## Caveat — fonte
A fonte de produção do Kamino não pôde ser extraída dos screenshots; o DS usa **Inter** como substituta próxima. Se você tiver os arquivos da fonte real, troque `--font-sans` (e o `@font-face`) — o layout foi calibrado com métricas de Inter, então revise espaçamentos após a troca.

## Arquivos de referência
- Protótipo re-skinado (visual-alvo): `prototype/index.html` + `prototype/conc-*.jsx` / `conc-*.js`.
- Codebase a ajustar: `Kamino/Code/src/` (mesma árvore de componentes: `Login`, `Sidebar`, `TopBalances`, `Chat`, `MessageView`, `CaseCard`, `QueuePanel`, `store.ts`, `agent.ts`, `data.ts`, `personas.ts`).
- Foundations detalhadas: `design-system/readme.md`.

## Como usar com o Claude Code
1. Copie a pasta `design_handoff_conciliacao/` para dentro (ou ao lado) do repo `Code/`.
2. No Claude Code, aponte para este README e peça: *"aplique o Passo 1 (tokens) substituindo o @theme do src/index.css, depois os Passos 2 e 3 seguindo o mapa por componente."*
3. Rode `pnpm dev` e compare com `prototype/index.html` e os `screenshots/`.
