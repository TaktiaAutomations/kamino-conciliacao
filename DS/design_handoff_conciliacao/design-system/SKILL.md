---
name: kamino-design
description: Use this skill to generate well-branded interfaces and assets for Kamino (Brazilian financial ERP — contas a pagar/receber, pagamentos, CNAB, Pix/Boleto/TED), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files (`styles.css` + `tokens/`, `components/`, `guidelines/`, `ui_kits/kamino-erp/`, `assets/`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

Key facts: the product is in Brazilian Portuguese, finance-team register, no emoji. Primary action = navy (`--kamino-navy`), execute/save = green, money due = red, active nav = lime pill. Cards are white with hairline borders and gentle radii on a near-white page. Components load from the compiled bundle under `window.KaminoDesignSystem_066e8e`.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
