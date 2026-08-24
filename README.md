# Kamino · Case PM Sênior — Conciliação assistida por agente

Repositório da entrega do case de **PM Sênior — Plataforma Financeira (core)**:
protótipo funcional de conciliação bancária conduzida por um agente, com design
system e materiais de apresentação.

## Estrutura

| Pasta / arquivo | O que é |
| --- | --- |
| [`Code/`](Code/) | Protótipo funcional (React 19 + Vite + Tailwind 4). Ver [`Code/README.md`](Code/README.md) para rodar. |
| [`DS/design_handoff_conciliacao/`](DS/design_handoff_conciliacao/) | Design handoff: tokens, styles, protótipo em JSX e screenshots. |
| [`Kamino/`](Kamino/) | Deck de apresentação (`Plano_Case_Kamino*.pptx`) e materiais do case. |
| `Case_Pratico_PM_Senior_Plataforma.docx` | Enunciado do case. |
| `Dados_Case_Conciliacao.xlsx` | Apêndice A — dados de títulos e extrato usados pelo protótipo. |

## Rodando o protótipo

```bash
cd Code
pnpm install      # ou: npm install
pnpm dev          # abre em http://localhost:5173
```

O motor de conciliação é **determinístico** — a demo não depende de nenhuma API externa.
A ponte opcional com a Claude (`Code/src/llm.ts`) só é acionada se o usuário colar uma
chave de API na própria interface; nenhuma chave é armazenada no repositório.
