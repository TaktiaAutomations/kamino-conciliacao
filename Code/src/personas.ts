/* ————————————————————————————————————————————————————————————————
   PERSONAS — mesma engine, mesmos dados; muda o tom do agente e QUAIS
   ações são expostas. Slide 6 do plano: "dois modos, uma engine".
———————————————————————————————————————————————————————————————— */

export type PersonaId = "dona" | "analista";

export interface Persona {
  id: PersonaId;
  nome: string;
  iniciais: string;
  cargo: string;
  cor: string; // avatar
  objetivo: string;
  /** mensagem de abertura do agente ao logar */
  saudacao: string;
  /** chips sugeridos no início */
  chipsIniciais: string[];
  /** a dona NÃO executa trabalho braçal em lote; o analista sim */
  podeAgirEmLote: boolean;
  /** a dona aprova exceções de valor alto; o analista opera tudo */
  focoAprovacao: boolean;
}

export const personas: Record<PersonaId, Persona> = {
  dona: {
    id: "dona",
    nome: "Bia Garcia",
    iniciais: "BG",
    cargo: "Sócia-fundadora · Acme Serviços",
    cor: "#1e3a5f",
    objetivo: "Abrir e confiar no saldo em 30 segundos.",
    saudacao:
      "Bom dia, Bia. Já olhei o extrato de junho e adiantei o que era seguro. **Conciliei 2 de 7 lançamentos automaticamente** — os que batem exato. Sobraram **5 pontos que precisam de um olhar** e **1 recebimento que não caiu**. Seu saldo conciliado hoje está em **29%**. Quer que eu te explique o que falta para chegar a 100%?",
    chipsIniciais: [
      "Posso confiar no meu saldo?",
      "O que falta para 100%?",
      "Tem algo que eu preciso decidir?",
    ],
    podeAgirEmLote: false,
    focoAprovacao: true,
  },
  analista: {
    id: "analista",
    nome: "Rafael Dias",
    iniciais: "RD",
    cargo: "Analista financeiro · Acme Serviços",
    cor: "#2f855a",
    objetivo: "Zerar a fila de pendências do dia.",
    saudacao:
      "E aí, Rafael. Extrato de junho carregado. **2 conciliados automaticamente** (Alfa e Ômega). Tem **5 pendências na fila** + o CR-003 da Sigma sem movimento. Posso resolver várias de uma vez: quer que eu **concilie tudo que estiver acima de 90% de confiança** e deixe só o que precisa de decisão contábil pra você?",
    chipsIniciais: [
      "Concilia tudo ≥ 90%",
      "Mostra o lote 3382",
      "Zera a fila",
    ],
    podeAgirEmLote: true,
    focoAprovacao: false,
  },
};
