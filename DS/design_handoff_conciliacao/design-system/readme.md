# Kamino Design System

Design system for **Kamino** — a Brazilian financial ERP (`kamino.pro`) for corporate cash management: contas a pagar/receber, payment batches, CNAB bank integration, cartões, notas fiscais, reembolsos, and reporting. The product is in **Brazilian Portuguese** and speaks the language of finance teams (pagamentos, rateios, centros de custo, competência, Pix/Boleto/TED).

## Sources
This system was reconstructed from product screenshots supplied by the user (no codebase or Figma was provided):
- `uploads/ds.png` — Novo Pagamento form (Pix method)
- `uploads/ds_empty.png` — CSV/Excel import empty state
- `uploads/ds1.png` — payment detail + CPF/CNPJ warning modal
- `uploads/ds2.png` — Central de pagamentos board + expanded "Pagar" sidebar
- `uploads/ds3.png` — "Novo ▾" split-button import menu
- `uploads/dsmenu.png` — expanded "Receber" sidebar submenu

> ⚠️ Because only screenshots were available, exact values (font family, some spacings) are best-effort. If you have the codebase or a Figma file, re-attach it so these can be made exact.

---

## Content fundamentals

**Language:** Brazilian Portuguese, always. Financial-operations register — precise, functional, never playful.

- **Tone:** Direct and instructional. The product tells the user what to do: *"Preencha a pessoa para verificar as informações do pix."*, *"Carregue um arquivo CSV ou Excel para iniciar o processo de importação"*.
- **Person:** Impersonal/imperative verbs (*"Cole aqui…"*, *"Pesquise o nome…"*, *"Faça o rateio…"*). Occasionally addresses the user with *"você"* in questions (*"Quais dados você deseja carregar?"*). Never first-person.
- **Casing:** Sentence case for body and helper text. Buttons and page titles use **Title Case for the primary noun** (*"Novo Pagamento"*, *"Salvar + Novo"*, *"Central de pagamentos"*). Sidebar section dividers are **UPPERCASE** (*CAPTURA, REEMBOLSOS, SOLICITAÇÕES, CONTRATOS, NOTAS FISCAIS*).
- **Buttons:** Short verb or verb+noun — *Salvar*, *Cancelar*, *Salvar + Novo*, *Editar pessoa*, *Importar CNAB*, *Novo*. The "+" in "Salvar + Novo" is spaced.
- **Field labels:** Nouns, sentence case, almost always followed by a small ⓘ info glyph — *Pessoa, Valor bruto, Vencimento, Competência, Classificação, Centro de Custo, Unidade de Negócio, Conta de pagamento preferencial*.
- **Security framing:** Compliance messages lead with reassurance — *"Para sua segurança, o preenchimento do CPF/CNPJ … é obrigatório."*
- **Money:** Brazilian format, always prefixed `R$` with comma decimals and dot thousands — `R$ 123,67`, `R$ 204,90`. Dates are `dd/mm/yyyy`; batch headers abbreviate weekday+day — `sáb, 3/mai`.
- **Emoji:** None. The product uses none anywhere.

---

## Visual foundations

**Overall vibe:** clean, dense, trustworthy fintech SaaS on a light canvas. Lots of white cards on a near-white page, thin gray borders, restrained color used to signal meaning (money = red/green, primary action = navy, active nav = lime).

- **Color:** Deep navy is the brand anchor — `--kamino-ink #001e36` (logo) and `--kamino-navy #05508a` (primary actions: Salvar+Novo, Atalhos, Pix tab, Editar pessoa). Success/execute actions are green `--green-600 #079455` (Salvar, CNAB buttons, settled values). Amounts due and errors are red `--red-600 #e02d20`. The signature accent is a bright **lime `--kamino-lime #e6fd8c`**, used only for the active sidebar item pill (with dark-navy text). Warning/pending is orange `--orange-500 #f79009`. Everything else is a 10-step neutral gray scale; page background is `--gray-050 #f9fafb`.
- **Type:** One humanist-grotesque sans across the whole UI (see font caveat). Compact scale: 14px body/inputs/buttons, 13px dense/helper, 12px meta & uppercase dividers, 18px card section titles, 22px page titles, 28px dashboard numbers. Weights: 400 body, 600 labels/buttons, 700 headings & money. Headings are ink-navy with slight negative tracking; numbers are tabular.
- **Spacing:** 4px base grid; cards pad 24px; form fields gap ~16–20px; inputs are 42px tall.
- **Backgrounds:** Flat colors only — no gradients, no imagery, no textures or patterns. Page is light gray, surfaces are white. Modal scrim is `rgba(16,24,40,0.45)`.
- **Corner radii:** gentle — inputs/buttons/segmented control 6px, cards/panels 8px, modals 12px, badges/pills fully round.
- **Cards:** white fill, 1px `--border-subtle` hairline, 8px radius, very soft shadow (`--shadow-xs`). Not heavy — elevation is subtle.
- **Shadows:** low-contrast, cool (`rgba(16,24,40,…)`). Dropdowns/menus use a stronger `--shadow-lg`; modals `--shadow-modal`. No inner shadows.
- **Borders:** the workhorse of the UI — 1px `--gray-300` on inputs, `--gray-200` dividers between sections.
- **Focus:** navy border + 3px soft navy ring (`--focus-ring`).
- **Buttons/hover:** subtle `brightness(0.94)` darken on hover; `scale(0.98)` on press. Ghost/nav items get a `--gray-050` wash on hover.
- **Animation:** minimal and quick — 120ms color/background transitions, 60ms press. No bounces or elaborate motion. The one decorative flourish is the concentric ripple rings behind the modal's warning icon.
- **Transparency/blur:** essentially none beyond the modal scrim; the UI is opaque and flat.
- **Layout rules:** fixed left icon rail (+ optional flyout submenu), fixed top bar, scrollable content. Batch board scrolls horizontally. Actions repeat at top and bottom of long forms.

---

## Iconography

- **Style:** thin **line icons, ~2px stroke, rounded caps/joins, no fill** — a Feather/Lucide-family look. Navigation glyphs (Painel grid, Pagar barcode, Receber hand-with-coin, Contas bank, Cartões card, Relatórios chart) are simple monoline marks.
- **Substitution:** the original icon assets were not available in the sources. This system ships **inline SVG glyphs hand-matched to the product's stroke style** (in `Sidebar.jsx`'s `NavIcons`, `TopBar`, and inline within components). For new work, **[Lucide](https://lucide.dev)** is the recommended CDN match (same 2px rounded-stroke style) — `<i data-lucide="…">` or inline SVG. Flagged: these are the closest match, not the exact Kamino icon set.
- **Status dots:** small solid circles precede status text ("● Pendente"), colored by semantic token.
- **No emoji, no unicode symbols** used as icons. The only glyph-as-text is `R$`, `✕` (modal close), and chevrons.
- **Logo:** two overlapping mountain-peak outlines ("Kamino" = path/mountain). Two real forms were extracted from the screenshots into `assets/`: `kamino-mark.png` (navy line mark) and `kamino-icon.png` (white mark on ink square, the app icon). The wordmark "Kamino" is set in plain bold type — no custom wordmark asset was available, so render it as type.

---

## Components

Reusable React primitives, grouped by concern under `components/`. Each has a sibling `.d.ts` (props) and `.prompt.md` (usage). Namespace: `window.KaminoDesignSystem_066e8e`.

**Actions** (`components/actions/`)
- **Button** — navy/green/gray/outline/ghost action button; sizes sm/md/lg.
- **IconButton** — icon-only square (toolbar outline, inline ghost, navy).
- **SegmentedControl** — tabbed method selector (Boleto/Ted/Pix/Outros).

**Forms** (`components/forms/`)
- **Field** — label + ⓘ info + inline action + helper/error wrapper.
- **Input**, **Select**, **DateInput**, **CurrencyInput** — bordered controls with navy focus ring; currency right-aligned, dates `dd/mm/yyyy`.
- **SearchInput** — input with leading magnifier ("Ir para…", list filters).

**Display** (`components/display/`)
- **Card** / **CardHeader** — white surface panel + bold title row.
- **Badge** — status pill with dot ("● Pendente").
- **MoneyValue** — BRL currency, red (due) / green (positive) / neutral.
- **DataList** — label/value detail rows.
- **BatchCard** — Central de pagamentos date-batch card with red total + green CNAB action.
- **Avatar** — initials circle for the account menu.

**Feedback** (`components/feedback/`)
- **Modal** — centered alert with ripple-ring icon + full-width navy action.
- **Menu** — dropdown panel of text rows (split-button menus).
- **EmptyState** — centered illustration + question headline + instruction.

**Navigation** (`components/navigation/`)
- **Sidebar** — left nav with lime active pill + flyout submenu (also exports `NavIcons`).
- **TopBar** — global search, Atalhos button, help/notifications, account chip.
- **PageHeader** — page title with right-aligned actions.

---

## UI kits
- **`ui_kits/kamino-erp/`** — interactive recreation of the payments product. `index.html` wires three screens through the real Sidebar/TopBar: **Central de pagamentos** (batch board), **Novo Pagamento** (creation form), **Detalhe do pagamento** (detail + CPF/CNPJ modal). Click "Novo" to walk the flow.

## Foundations (Design System tab)
Specimen cards live in `guidelines/`: brand/semantic/neutral colors, heading & body type, spacing-radius-shadow, and the logo. Component specimen cards live beside each component group as `*.card.html`.

## Repository index
- `styles.css` — global entry (@import manifest only)
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`
- `components/{actions,forms,display,feedback,navigation}/` — primitives (`.jsx` + `.d.ts` + `.prompt.md` + `*.card.html`)
- `guidelines/` — foundation specimen cards
- `assets/` — `kamino-mark.png`, `kamino-icon.png`
- `ui_kits/kamino-erp/` — product recreation
- `SKILL.md` — Agent-Skills manifest
- generated (do not edit): `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`

## Caveat — font
Kamino's production UI font could not be extracted from screenshots. **Inter** is substituted (`tokens/fonts.css`, Google Fonts) as the closest widely-available humanist-grotesque match. Please upload the real font files to make this exact.
