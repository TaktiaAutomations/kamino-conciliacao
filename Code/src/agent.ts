/* ————————————————————————————————————————————————————————————————
   MOTOR DO AGENTE — determinístico, roteirizado por intenção.
   Cobre as 7 situações do case. Quando nada casa e há chave de API,
   App delega para a Claude (ver llm.ts). Caso contrário, fallback útil.
———————————————————————————————————————————————————————————————— */
import { cases, caseByKey } from "./data";
import type { PersonaId } from "./personas";
import type { CapabilityId } from "./capabilities";

export type CardPayload =
  | { kind: "case"; caseKey: string }
  | { kind: "balances" }
  | { kind: "resolvedNote"; caseKey: string }
  | { kind: "capCard"; cap: CapabilityId; view?: string };

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text?: string;
  card?: CardPayload;
  chips?: string[];
  pending?: boolean;
  ts: number;
}

export type Effect = { type: "resolve"; caseKey: string };

export interface AgentReply {
  messages: Array<Pick<ChatMessage, "text" | "card" | "chips">>;
  effects?: Effect[];
  /** sinaliza a App para tentar a LLM (híbrido) quando houver chave */
  needsLLM?: boolean;
}

export interface AgentCtx {
  persona: PersonaId;
  resolved: Set<string>;
  apiKeyPresent: boolean;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const has = (t: string, ...ws: string[]) => ws.some((w) => t.includes(w));

/** casos ainda não resolvidos, filtrando por predicado */
const pending = (ctx: AgentCtx) => cases.filter((c) => !ctx.resolved.has(c.key));

export function interpret(input: string, ctx: AgentCtx): AgentReply {
  const t = norm(input.trim());
  const dona = ctx.persona === "dona";

  /* —— saudação / confiança no saldo (voz típica da dona) —— */
  if (has(t, "confiar", "confio", "confiavel", "posso confiar", "saldo confiavel")) {
    return {
      messages: [
        {
          text: "Hoje, ainda **não 100%** — e eu prefiro te dizer isso do que te dar um número bonito e falso. Do seu extrato de junho, **29% já está conciliado com evidência** (Alfa e Ômega, batem exato). O resto eu não fecho sozinho porque envolve julgamento: um nome divergente, um lote, uma retenção de imposto, um pagamento parcial e uma tarifa. Te mostro cada um — você confirma em 1 clique e aí sim o saldo fica confiável.",
        },
        { card: { kind: "balances" } },
        {
          text: "Quer resolver junto agora? Começo pelo mais simples.",
          chips: ["O que falta para 100%?", "Mostra o lote", "Por que a Gama veio menor?"],
        },
      ],
    };
  }

  /* —— o que falta / panorama das pendências —— */
  if (has(t, "falta", "100", "pendencia", "panorama", "resumo", "o que sobrou", "o que sobra")) {
    const pend = pending(ctx).filter((c) => c.kind !== "exato");
    return {
      messages: [
        {
          text: `Faltam **${pend.length} pontos** para o extrato ficar 100% explicado. Listei na fila ao lado e trago cada card aqui no chat conforme você pedir. Em ordem de esforço:`,
        },
        {
          text: pend
            .map((c) => `• **${c.titulo}** — ${autonomiaTxt(c.autonomia)}`)
            .join("\n"),
          chips: pend.slice(0, 3).map((c) => chipFor(c.key)),
        },
      ],
    };
  }

  /* —— algo para decidir (dona aprova exceções) —— */
  if (has(t, "decidir", "preciso decidir", "aprovar", "o que decido", "decisao")) {
    const escala = pending(ctx).filter((c) => c.autonomia === "escala");
    return {
      messages: [
        {
          text:
            "O que **exige você** são as coisas que viram fato contábil ou que eu não deveria criar sozinho:",
        },
        ...escala.map((c) => ({ card: { kind: "case" as const, caseKey: c.key } })),
        {
          text:
            "A retenção da Gama também te chama antes de eu lançar o imposto — te mostro se quiser.",
          chips: ["Por que a Gama veio menor?", "E a Sigma?"],
        },
      ],
    };
  }

  /* —— lote 3382 —— */
  if (has(t, "lote", "3382", "beta", "boletos")) {
    return caseReply("lote", ctx, "Aqui está o lote. A soma bate exata, mesma contraparte:");
  }

  /* —— retenção / gama / imposto —— */
  if (has(t, "retenc", "gama", "imposto", "iss", "irrf", "9350", "9.350", "veio menor", "menor que o titulo")) {
    return caseReply(
      "gama",
      ctx,
      "A Gama pagou menos que o título — e o motivo é imposto retido, não erro:"
    );
  }

  /* —— parcial / delta —— */
  if (has(t, "parcial", "delta", "aluguel", "aluguei", "5000 delta", "sobra")) {
    return caseReply("delta", ctx, "Esse é um pagamento parcial — sobra saldo em aberto:");
  }

  /* —— nome divergente / silva —— */
  if (has(t, "nome", "silva", "joao", "divergenc", "pagador", "6000")) {
    return caseReply(
      "silva",
      ctx,
      "Valor e data batem; o que diverge é o nome do pagador. Minha hipótese:"
    );
  }

  /* —— tarifa —— */
  if (has(t, "tarifa", "45", "pacote de servico", "cobrou", "banco cobrou")) {
    return caseReply(
      "tarifa",
      ctx,
      "Essa linha não tem título interno — é uma tarifa do banco. Eu **não crio a despesa sozinho**:"
    );
  }

  /* —— sigma / recebimento em atraso —— */
  if (has(t, "sigma", "atraso", "nao caiu", "nao entrou", "recebimento", "cr-003", "cr 003", "20/06")) {
    return caseReply(
      "sigma",
      ctx,
      "Esse é o caso escondido: um recebimento que **não aconteceu** e mexe no seu saldo previsto:"
    );
  }

  /* —— conciliar exatos (já feitos no init) —— */
  if (has(t, "exato", "batem exato", "os que batem", "1:1", "conciliados automat")) {
    return {
      messages: [
        {
          text:
            "Esses eu já adiantei assim que o extrato entrou: **Alfa (−3.200)** e **Ômega (+4.200)**. Valor, data e contraparte batem — risco baixíssimo, então **agi sozinho** e deixei a evidência anexada e reversível.",
        },
        { card: { kind: "case" as const, caseKey: "alfa" } },
        { card: { kind: "case" as const, caseKey: "omega" } },
      ],
    };
  }

  /* —— batch: concilia tudo ≥ 90% (respeita o limiar!) —— */
  if (has(t, "90", ">= 90", "acima de 90", "tudo que for seguro", "concilia tudo")) {
    const alvo = pending(ctx).filter(
      (c) => c.confianca >= 90 && c.autonomia === "sugere"
    );
    const segurados = pending(ctx).filter(
      (c) => c.kind !== "exato" && (c.confianca < 90 || c.autonomia === "escala")
    );
    if (alvo.length === 0) {
      return {
        messages: [
          {
            text:
              "Nesse momento **nada acima de 90% está pendente** além do que já conciliei. Os que restam estão abaixo do limiar ou criam lançamento — prefiro te mostrar um a um.",
            chips: ["O que falta para 100%?"],
          },
        ],
      };
    }
    return {
      messages: [
        {
          text: `Fechado. Concilio **${alvo.length}** que passa${
            alvo.length > 1 ? "m" : ""
          } de 90% de confiança: ${alvo.map((c) => `**${c.titulo.split(" — ")[0]}**`).join(", ")}. Respeito o limiar — **abaixo de 90% eu não fecho no automático**.`,
        },
        ...alvo.map((c) => ({ card: { kind: "resolvedNote" as const, caseKey: c.key } })),
        {
          text:
            segurados.length > 0
              ? `Deixei **${segurados.length} pra você** porque estão abaixo de 90% ou criam fato contábil: ${segurados
                  .map((c) => c.titulo.split(" — ")[0])
                  .join(", ")}.`
              : "Fila esvaziada até onde o limiar permite.",
          chips: segurados.slice(0, 3).map((c) => chipFor(c.key)),
        },
      ],
      effects: alvo.map((c) => ({ type: "resolve", caseKey: c.key })),
    };
  }

  /* —— zera a fila (analista, agressivo mas respeitando fronteira) —— */
  if (has(t, "zera", "zerar", "resolve tudo", "fecha tudo", "limpa a fila")) {
    const reversiveis = pending(ctx).filter(
      (c) => c.autonomia === "sugere" && !c.lancamento
    );
    const precisaConfirmar = pending(ctx).filter(
      (c) => c.autonomia === "escala" || !!c.lancamento
    );
    return {
      messages: [
        {
          text: reversiveis.length
            ? `Concilio agora as **${reversiveis.length} reversíveis** (só correspondência, sem criar lançamento): ${reversiveis
                .map((c) => c.titulo.split(" — ")[0])
                .join(", ")}.`
            : "As reversíveis já estão conciliadas.",
        },
        ...reversiveis.map((c) => ({ card: { kind: "resolvedNote" as const, caseKey: c.key } })),
        {
          text: precisaConfirmar.length
            ? `Estas **eu não fecho sozinho** — criam fato financeiro ou não têm lastro. Confirma cada uma em 1 clique:`
            : "Nada mais pendente. Saldo 100% explicado. 🎯",
        },
        ...precisaConfirmar.map((c) => ({ card: { kind: "case" as const, caseKey: c.key } })),
      ],
      effects: reversiveis.map((c) => ({ type: "resolve", caseKey: c.key })),
    };
  }

  /* —— desfazer —— */
  if (has(t, "desfaz", "desfazer", "reverter", "voltar atras", "undo")) {
    return {
      messages: [
        {
          text:
            "Toda conciliação aqui é **reversível**. Passe o mouse sobre um item já conciliado na fila ao lado e use **Desfazer** — a trilha de auditoria registra quem desfez, quando e com que evidência. Nada some sem rastro.",
        },
      ],
    };
  }

  /* —— ajuda / capacidades —— */
  if (has(t, "ajuda", "o que voce faz", "como funciona", "help", "menu", "?")) {
    return capacidades(dona);
  }

  /* —— fallback: tenta LLM se houver chave —— */
  if (ctx.apiKeyPresent) {
    return { messages: [], needsLLM: true };
  }
  return capacidades(dona, true);
}

/* ————————————————————————————— helpers ————————————————————————————— */

function caseReply(key: string, ctx: AgentCtx, intro: string): AgentReply {
  const c = caseByKey(key);
  if (ctx.resolved.has(key)) {
    return {
      messages: [
        {
          text: `Esse já está resolvido ✓ — **${c.titulo}**. Fica registrado na trilha e você pode desfazer pela fila ao lado.`,
          card: { kind: "resolvedNote", caseKey: key },
        },
      ],
    };
  }
  return {
    messages: [{ text: intro }, { card: { kind: "case", caseKey: key } }],
  };
}

function autonomiaTxt(a: string) {
  if (a === "age") return "🟢 posso agir sozinho";
  if (a === "sugere") return "🟡 sugiro, você confirma";
  return "🔴 escala pra você decidir";
}

function chipFor(key: string): string {
  const map: Record<string, string> = {
    lote: "Mostra o lote",
    gama: "Por que a Gama veio menor?",
    delta: "E o pagamento parcial da Delta?",
    silva: "O nome do pagador diverge?",
    tarifa: "E a tarifa de R$ 45?",
    sigma: "E a Sigma que não caiu?",
    alfa: "Mostra os que bateram exato",
    omega: "Mostra os que bateram exato",
  };
  return map[key] ?? "Detalhar";
}

function capacidades(dona: boolean, fallback = false): AgentReply {
  return {
    messages: [
      {
        text:
          (fallback
            ? "Não peguei exatamente o que você quis dizer — mas aqui é o que eu resolvo neste fechamento de junho:\n\n"
            : "Neste fechamento eu te ajudo com:\n\n") +
          "• **Conciliar** o que bate exato (já fiz Alfa e Ômega)\n" +
          "• Explicar **por que um valor veio diferente** (retenção, parcial, tarifa)\n" +
          "• Agrupar um **lote** de títulos num débito só\n" +
          "• Tratar **nome divergente** de pagador\n" +
          "• Apontar um **recebimento que não caiu** (Sigma)\n" +
          (dona
            ? "\nÉ só perguntar em linguagem natural — ou tocar num chip."
            : "\nPeça “concilia tudo ≥ 90%” ou “zera a fila” que eu adianto o operacional."),
        chips: dona
          ? ["Posso confiar no meu saldo?", "O que falta para 100%?", "Mostra o lote"]
          : ["Concilia tudo ≥ 90%", "Mostra o lote", "Por que a Gama veio menor?"],
      },
    ],
  };
}
