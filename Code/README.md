# Kamino · Conciliação assistida por agente

Protótipo **funcional** do case de PM Sênior — Plataforma Financeira (core).
Experiência **chat-protagonista**: o agente conduz a conciliação do extrato de junho da
Acme contra os títulos em aberto; a UI (saldos, cards, fila) é o **apoio visual** do que o
chat não consegue descrever sozinho.

Todos os dados vêm do **Apêndice A** do case (`Dados_Case_Conciliacao.xlsx`).

---

## Como rodar

Pré-requisitos: **Node 18+** e um gerenciador de pacotes (pnpm recomendado; npm funciona).

```bash
cd Code
pnpm install      # ou: npm install
pnpm dev          # ou: npm run dev
```

O Vite abre em **http://localhost:5173**. É um servidor de desenvolvimento com hot-reload —
edite qualquer arquivo em `src/` e a tela atualiza sozinha.

Para gerar a versão estática (deploy/entrega offline):

```bash
pnpm build        # gera dist/
pnpm preview      # serve o dist/ em produção local
```

---

## O que demonstrar (roteiro de ~4 min)

1. **Login** → entre como **Bia (dona)**. O agente já abre dizendo que conciliou 2 de 7
   automaticamente e que o saldo está em 29%.
2. Pergunte **"Posso confiar no meu saldo?"** → o agente é honesto: ainda não 100%, e mostra
   os 4 saldos inline. A tese: *confiança se mostra, não se pede*.
3. **"Mostra o lote"** → card do lote 3382 (🟡 sugere): soma exata de 3 títulos da Beta.
   Clique em **Conciliar o lote**.
4. **"Por que a Gama veio menor?"** → card de **retenção** (🟡, mas cria fato contábil):
   650 = ISS 5% + IRRF 1,5%. Botão exige **sua confirmação** antes de lançar o imposto.
5. **"E a tarifa de R$ 45?"** → card 🔴 **escala**: sem título correspondente; a IA **não cria
   a despesa sozinha**.
6. **"E a Sigma que não caiu?"** → o 7º caso escondido: recebível sem linha no extrato.
7. **Troque de persona** (topo → "trocar persona") para o **Analista** e mande
   **"Concilia tudo ≥ 90%"** → o agente respeita o limiar: concilia só o que passa de 90% e
   deixa o resto explicitamente para decisão humana.
8. Abra a aba **Trilha** (fila lateral) → toda ação tem autor (IA × humano), evidência e é
   **reversível** (Desfazer no hover). **Reiniciar demo** volta ao estado zero ao vivo.

---

## Modo híbrido (IA real, opcional)

O protótipo é **100% determinístico e offline** — a demo nunca depende de rede. Se quiser que
perguntas **fora do roteiro** sejam respondidas pela Claude de verdade, clique em
**"Modo híbrido"** no topo e cole uma chave de API da Anthropic. Sem chave, o agente responde
com um fallback útil listando o que sabe fazer.

> A chamada é feita direto do browser (conveniência de protótipo). Em produção isso ficaria
> atrás de um backend — nenhuma chave trafega para o cliente.

---

## A fronteira de IA (critério nº 1 de avaliação)

Cada card carrega um selo de autonomia, proporcional ao **risco financeiro**:

| Selo | Quando | Casos do Apêndice A |
|------|--------|---------------------|
| 🟢 **age sozinha** | correspondência exata (valor + data + contraparte) | Alfa (CP-001), Ômega (CR-002) |
| 🟡 **sugere, confirme** | ambiguidade controlada; evidência explicada | nome divergente, lote, retenção, parcial |
| 🔴 **escala pra você** | cria fato financeiro ou não tem lastro | tarifa, Sigma |

**Regra de ouro:** a IA nunca cria lançamento (tarifa/imposto) sem confirmação humana — ela
prepara a decisão.

---

## Arquitetura

```
src/
  data.ts         # Apêndice A + as 7 situações (fonte da verdade do domínio)
  personas.ts     # Dona × Analista — mesma engine, tom e ações diferentes
  agent.ts        # motor determinístico: intenção → resposta + UI generativa
  llm.ts          # ponte opcional com a Claude (modo híbrido)
  store.ts        # reducer + seletores de saldo + trilha de auditoria
  components/      # UI de apoio: saldos, chat, cards, fila
```

O estado é derivado de um único conjunto `resolved` (quais casos foram conciliados). Saldos,
percentuais e status de título são **selecionados** a partir dele — nada é duplicado.

---

## Como a IA foi usada para construir (meta, para a apresentação)

- **Discovery/modelagem:** a IA ajudou a mapear os 7 casos do Apêndice A em níveis de
  autonomia e a derivar os números (ex.: 650 = ISS+IRRF; saldo inicial que faz o banco fechar
  em 12.305).
- **Protótipo:** este app foi escrito com assistência de IA sob critério — o julgamento de
  produto (o que expor, onde a IA age × escala) é humano; a IA acelerou a materialização.
- **Onde a IA me levou para o caminho errado:** [preencher com 1 exemplo real seu na
  apresentação — parte do que a Kamino quer ouvir].

---

_Dados fictícios. Valores em R$, referentes a junho._
