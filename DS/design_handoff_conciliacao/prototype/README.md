# Conciliação assistida por agente — UI Kit

Protótipo **interativo funcional** do case de PM Sênior (Plataforma Financeira core), recriado com o Design System Kamino. Reconstruído a partir do reference em `Kamino/Code/` (React/Vite/TS) — aqui roda como HTML autocontido, sem build.

Experiência **chat-protagonista**: o agente conduz a conciliação do extrato de junho da Acme contra os títulos em aberto; saldos, cards e fila são o apoio visual.

## Como abrir
Abra `index.html`. Sem servidor — carrega `styles.css` + `_ds_bundle.js` do Design System.

## Fluxo (roteiro ~4 min)
1. **Login** → entre como **Bia (dona)** ou **Rafael (analista)**. O agente já abre dizendo que conciliou 2 de 7 automaticamente (saldo em 29%).
2. Pergunte **"Posso confiar no meu saldo?"** → honestidade: ainda não 100%, mostra os saldos inline.
3. **"Mostra o lote"** → card do lote 3382 (🟡 sugere) → **Conciliar o lote**.
4. **"Por que a Gama veio menor?"** → card de retenção (ISS 5% + IRRF 1,5% = 650); exige confirmação humana antes de lançar imposto.
5. **"E a tarifa de R$ 45?"** → 🔴 escala: sem título; a IA não cria despesa sozinha.
6. **"E a Sigma que não caiu?"** → recebível sem linha no extrato.
7. Troque para **Analista** e mande **"Concilia tudo ≥ 90%"** → respeita o limiar.
8. Aba **Trilha** → toda ação tem autor (IA × humano), evidência e é reversível (**Desfazer** no hover). **Reiniciar demo** volta ao zero.

## A fronteira de IA (critério nº 1 do case)
Cada card carrega um selo de autonomia, proporcional ao risco financeiro:
- 🟢 **age sozinha** — correspondência exata (Alfa, Ômega)
- 🟡 **sugere, confirme** — ambiguidade controlada (nome, lote, retenção, parcial)
- 🔴 **escala pra você** — cria fato financeiro ou sem lastro (tarifa, Sigma)

Regra de ouro: a IA nunca cria lançamento (tarifa/imposto) sem confirmação humana.

## Arquitetura (arquivos)
- `conc-data.js` — Apêndice A: títulos, extrato, as 7 situações, personas, helpers (`window.ConcData`)
- `conc-engine.js` — reducer + trilha + seletores de saldo + agente determinístico (`window.ConcEngine`)
- `conc-parts.jsx` — markdown, selo de autonomia, barra de confiança, faixa de saldos (`window.ConcUI`)
- `conc-cards.jsx` — card de caso (extrato ↔ títulos + evidências + ação) e nota compacta
- `conc-queue.jsx` — painel lateral Fila / Trilha
- `conc-login.jsx` — seleção de persona
- `conc-chat.jsx` — mensagens + composer
- `index.html` — casca do produto (Sidebar + TopBar do DS) + wiring do App

Componentes do DS reutilizados: `Sidebar`, `TopBar`, `Card`, `Button`, `Avatar`. O restante (chat, cards de caso, fila) é específico da tela, construído sobre os tokens do DS.

## Nota
O "modo híbrido" (IA real via Claude) do reference **não** é exposto no frontend desta demo — o roteiro é 100% determinístico. A integração fica no código.

_Dados fictícios. Valores em R$, referentes a junho/2026._
