/* ————————————————————————————————————————————————————————————————
   Conciliação — MOTOR: reducer + trilha + saldos + agente determinístico.
   Portado de Code/src/store.ts e agent.ts. Exposto em window.ConcEngine.
———————————————————————————————————————————————————————————————— */
(function () {
  const D = window.ConcData;
  const { cases, extratoSeed, titulosSeed, SALDO_INICIAL, caseByKey, personas, brl } = D;

  const INITIAL_RESOLVED = ["alfa", "omega"];
  const rid = (p) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

  function autoAudit(caseKey) {
    const c = caseByKey(caseKey);
    return {
      id: rid("aud"), ts: Date.now(), autor: "Agente Kamino",
      acao: `Conciliou automaticamente: ${c.titulo}`,
      evidencia: c.evidencias.map((e) => e.label).join(" · "),
      caseKey, automatica: true,
    };
  }

  function initialState() {
    return {
      persona: null,
      resolved: [...INITIAL_RESOLVED],
      messages: [],
      audit: INITIAL_RESOLVED.map(autoAudit),
    };
  }

  function resolveVerb(caseKey) {
    const c = caseByKey(caseKey);
    switch (c.kind) {
      case "retencao": return "Baixou título e lançou retenção";
      case "tarifa": return "Criou despesa de tarifa (aprovado)";
      case "parcial": return "Baixa parcial";
      case "lote": return "Conciliou lote";
      case "ausente": return "Marcou para cobrança";
      default: return "Conciliou";
    }
  }

  function reducer(state, action) {
    switch (action.type) {
      case "LOGIN": {
        const p = personas[action.persona];
        const greeting = { id: rid("m-hello"), role: "agent", text: p.saudacao, chips: p.chipsIniciais, ts: Date.now() };
        return { ...state, persona: action.persona, messages: [greeting] };
      }
      case "LOGOUT":
        return initialState();
      case "RESET":
        return { ...initialState(), persona: null };
      case "RESOLVE": {
        if (state.resolved.includes(action.caseKey)) return state;
        const c = caseByKey(action.caseKey);
        const entry = {
          id: rid("aud"), ts: Date.now(), autor: action.autor,
          acao: resolveVerb(action.caseKey) + `: ${c.titulo}`,
          evidencia: c.evidencias.map((e) => e.label).join(" · "),
          caseKey: action.caseKey, automatica: action.automatica,
        };
        return { ...state, resolved: [...state.resolved, action.caseKey], audit: [entry, ...state.audit] };
      }
      case "UNDO": {
        if (!state.resolved.includes(action.caseKey)) return state;
        const c = caseByKey(action.caseKey);
        const entry = {
          id: rid("aud-undo"), ts: Date.now(), autor: action.autor,
          acao: `Desfez: ${c.titulo}`, evidencia: "Reversão manual",
          caseKey: action.caseKey, automatica: false,
        };
        return { ...state, resolved: state.resolved.filter((k) => k !== action.caseKey), audit: [entry, ...state.audit] };
      }
      case "ADD_MESSAGES":
        return { ...state, messages: [...state.messages, ...action.messages] };
      case "REPLACE_MESSAGE":
        return { ...state, messages: state.messages.map((m) => (m.id === action.id ? action.message : m)) };
      default:
        return state;
    }
  }

  /* ————————— SALDOS ————————— */
  const extValor = (exId) => (extratoSeed.find((e) => e.id === exId) || {}).valor || 0;
  const TODAS_LINHAS = extratoSeed.reduce((s, e) => s + e.valor, 0);

  function selectBalances(state) {
    const resolved = new Set(state.resolved);
    const linhasComExtrato = cases.filter((c) => c.extratoId);
    const explicadas = linhasComExtrato.filter((c) => resolved.has(c.key));
    const interno = SALDO_INICIAL + explicadas.reduce((s, c) => s + extValor(c.extratoId), 0);
    const banco = SALDO_INICIAL + TODAS_LINHAS;
    const totalLinhas = linhasComExtrato.length;
    const pendencias = cases.filter((c) => c.kind !== "exato" && !resolved.has(c.key)).length;
    const sigma = caseByKey("sigma");
    const sigmaValor = resolved.has("sigma") ? 0 :
      titulosSeed.filter((t) => sigma.titulos.includes(t.id)).reduce((s, t) => s + t.valor, 0);
    return {
      banco, interno,
      conciliadoPct: Math.round((explicadas.length / totalLinhas) * 100),
      linhasConciliadas: explicadas.length, totalLinhas, pendencias,
      saldoPrevisto: banco + sigmaValor,
    };
  }

  /* ————————— AGENTE determinístico ————————— */
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const has = (t, ...ws) => ws.some((w) => t.includes(w));
  const pending = (ctx) => cases.filter((c) => !ctx.resolved.has(c.key));

  function autonomiaTxt(a) {
    if (a === "age") return "🟢 posso agir sozinho";
    if (a === "sugere") return "🟡 sugiro, você confirma";
    return "🔴 escala pra você decidir";
  }

  function chipFor(key) {
    const map = {
      lote: "Mostra o lote", gama: "Por que a Gama veio menor?",
      delta: "E o pagamento parcial da Delta?", silva: "O nome do pagador diverge?",
      tarifa: "E a tarifa de R$ 45?", sigma: "E a Sigma que não caiu?",
      alfa: "Mostra os que bateram exato", omega: "Mostra os que bateram exato",
    };
    return map[key] || "Detalhar";
  }

  function caseReply(key, ctx, intro) {
    const c = caseByKey(key);
    if (ctx.resolved.has(key)) {
      return { messages: [{ text: `Esse já está resolvido ✓ — **${c.titulo}**. Fica registrado na trilha e você pode desfazer pela fila ao lado.`, card: { kind: "resolvedNote", caseKey: key } }] };
    }
    return { messages: [{ text: intro }, { card: { kind: "case", caseKey: key } }] };
  }

  function capacidades(dona, fallback) {
    return {
      messages: [{
        text: (fallback
          ? "Não peguei exatamente o que você quis dizer — mas aqui é o que eu resolvo neste fechamento de junho:\n\n"
          : "Neste fechamento eu te ajudo com:\n\n") +
          "• **Conciliar** o que bate exato (já fiz Alfa e Ômega)\n" +
          "• Explicar **por que um valor veio diferente** (retenção, parcial, tarifa)\n" +
          "• Agrupar um **lote** de títulos num débito só\n" +
          "• Tratar **nome divergente** de pagador\n" +
          "• Apontar um **recebimento que não caiu** (Sigma)\n" +
          (dona ? "\nÉ só perguntar em linguagem natural — ou tocar num chip." : "\nPeça “concilia tudo ≥ 90%” ou “zera a fila” que eu adianto o operacional."),
        chips: dona
          ? ["Posso confiar no meu saldo?", "O que falta para 100%?", "Mostra o lote"]
          : ["Concilia tudo ≥ 90%", "Mostra o lote", "Por que a Gama veio menor?"],
      }],
    };
  }

  function interpret(input, ctx) {
    const t = norm(input.trim());
    const dona = ctx.persona === "dona";

    if (has(t, "confiar", "confio", "confiavel", "posso confiar")) {
      return {
        messages: [
          { text: "Hoje, ainda **não 100%** — e eu prefiro te dizer isso do que te dar um número bonito e falso. Do seu extrato de junho, **29% já está conciliado com evidência** (Alfa e Ômega, batem exato). O resto eu não fecho sozinho porque envolve julgamento: um nome divergente, um lote, uma retenção de imposto, um pagamento parcial e uma tarifa. Te mostro cada um — você confirma em 1 clique e aí sim o saldo fica confiável." },
          { card: { kind: "balances" } },
          { text: "Quer resolver junto agora? Começo pelo mais simples.", chips: ["O que falta para 100%?", "Mostra o lote", "Por que a Gama veio menor?"] },
        ],
      };
    }

    if (has(t, "falta", "100", "pendencia", "panorama", "resumo", "o que sobrou", "o que sobra")) {
      const pend = pending(ctx).filter((c) => c.kind !== "exato");
      return {
        messages: [
          { text: `Faltam **${pend.length} pontos** para o extrato ficar 100% explicado. Listei na fila ao lado e trago cada card aqui no chat conforme você pedir. Em ordem de esforço:` },
          { text: pend.map((c) => `• **${c.titulo}** — ${autonomiaTxt(c.autonomia)}`).join("\n"), chips: pend.slice(0, 3).map((c) => chipFor(c.key)) },
        ],
      };
    }

    if (has(t, "decidir", "aprovar", "o que decido", "decisao")) {
      const escala = pending(ctx).filter((c) => c.autonomia === "escala");
      return {
        messages: [
          { text: "O que **exige você** são as coisas que viram fato contábil ou que eu não deveria criar sozinho:" },
          ...escala.map((c) => ({ card: { kind: "case", caseKey: c.key } })),
          { text: "A retenção da Gama também te chama antes de eu lançar o imposto — te mostro se quiser.", chips: ["Por que a Gama veio menor?", "E a Sigma?"] },
        ],
      };
    }

    if (has(t, "lote", "3382", "beta", "boletos")) return caseReply("lote", ctx, "Aqui está o lote. A soma bate exata, mesma contraparte:");
    if (has(t, "retenc", "gama", "imposto", "iss", "irrf", "9350", "9.350", "veio menor", "menor que o titulo")) return caseReply("gama", ctx, "A Gama pagou menos que o título — e o motivo é imposto retido, não erro:");
    if (has(t, "parcial", "delta", "aluguel", "aluguei", "sobra")) return caseReply("delta", ctx, "Esse é um pagamento parcial — sobra saldo em aberto:");
    if (has(t, "nome", "silva", "joao", "divergenc", "pagador", "6000")) return caseReply("silva", ctx, "Valor e data batem; o que diverge é o nome do pagador. Minha hipótese:");
    if (has(t, "tarifa", "45", "pacote de servico", "cobrou", "banco cobrou")) return caseReply("tarifa", ctx, "Essa linha não tem título interno — é uma tarifa do banco. Eu **não crio a despesa sozinho**:");
    if (has(t, "sigma", "atraso", "nao caiu", "nao entrou", "recebimento", "cr-003", "cr 003", "20/06")) return caseReply("sigma", ctx, "Esse é o caso escondido: um recebimento que **não aconteceu** e mexe no seu saldo previsto:");

    if (has(t, "exato", "batem exato", "os que batem", "1:1", "conciliados automat")) {
      return {
        messages: [
          { text: "Esses eu já adiantei assim que o extrato entrou: **Alfa (−3.200)** e **Ômega (+4.200)**. Valor, data e contraparte batem — risco baixíssimo, então **agi sozinho** e deixei a evidência anexada e reversível." },
          { card: { kind: "case", caseKey: "alfa" } },
          { card: { kind: "case", caseKey: "omega" } },
        ],
      };
    }

    if (has(t, "90", "acima de 90", "tudo que for seguro", "concilia tudo")) {
      const alvo = pending(ctx).filter((c) => c.confianca >= 90 && c.autonomia === "sugere");
      const segurados = pending(ctx).filter((c) => c.kind !== "exato" && (c.confianca < 90 || c.autonomia === "escala"));
      if (alvo.length === 0) {
        return { messages: [{ text: "Nesse momento **nada acima de 90% está pendente** além do que já conciliei. Os que restam estão abaixo do limiar ou criam lançamento — prefiro te mostrar um a um.", chips: ["O que falta para 100%?"] }] };
      }
      return {
        messages: [
          { text: `Fechado. Concilio **${alvo.length}** que passa${alvo.length > 1 ? "m" : ""} de 90% de confiança: ${alvo.map((c) => `**${c.titulo.split(" — ")[0]}**`).join(", ")}. Respeito o limiar — **abaixo de 90% eu não fecho no automático**.` },
          ...alvo.map((c) => ({ card: { kind: "resolvedNote", caseKey: c.key } })),
          { text: segurados.length > 0 ? `Deixei **${segurados.length} pra você** porque estão abaixo de 90% ou criam fato contábil: ${segurados.map((c) => c.titulo.split(" — ")[0]).join(", ")}.` : "Fila esvaziada até onde o limiar permite.", chips: segurados.slice(0, 3).map((c) => chipFor(c.key)) },
        ],
        effects: alvo.map((c) => ({ type: "resolve", caseKey: c.key })),
      };
    }

    if (has(t, "zera", "zerar", "resolve tudo", "fecha tudo", "limpa a fila")) {
      const reversiveis = pending(ctx).filter((c) => c.autonomia === "sugere" && !c.lancamento);
      const precisaConfirmar = pending(ctx).filter((c) => c.autonomia === "escala" || !!c.lancamento);
      return {
        messages: [
          { text: reversiveis.length ? `Concilio agora as **${reversiveis.length} reversíveis** (só correspondência, sem criar lançamento): ${reversiveis.map((c) => c.titulo.split(" — ")[0]).join(", ")}.` : "As reversíveis já estão conciliadas." },
          ...reversiveis.map((c) => ({ card: { kind: "resolvedNote", caseKey: c.key } })),
          { text: precisaConfirmar.length ? `Estas **eu não fecho sozinho** — criam fato financeiro ou não têm lastro. Confirma cada uma em 1 clique:` : "Nada mais pendente. Saldo 100% explicado. 🎯" },
          ...precisaConfirmar.map((c) => ({ card: { kind: "case", caseKey: c.key } })),
        ],
        effects: reversiveis.map((c) => ({ type: "resolve", caseKey: c.key })),
      };
    }

    if (has(t, "desfaz", "desfazer", "reverter", "voltar atras", "undo")) {
      return { messages: [{ text: "Toda conciliação aqui é **reversível**. Passe o mouse sobre um item já conciliado na fila ao lado e use **Desfazer** — a trilha de auditoria registra quem desfez, quando e com que evidência. Nada some sem rastro." }] };
    }

    if (has(t, "ajuda", "o que voce faz", "como funciona", "help", "menu")) return capacidades(dona);

    return capacidades(dona, true);
  }

  function confirmText(caseKey) {
    const c = caseByKey(caseKey);
    switch (c.kind) {
      case "nome": return "Conciliado ✓ — registrei que “João P da Silva” é a pessoa por trás da Consultoria Silva ME. Da próxima vez eu já sugiro sozinho.";
      case "lote": return "Lote fechado ✓ — os 3 títulos da Beta Serviços baixados de uma vez, contra o débito único de R$ 4.500.";
      case "retencao": return "Baixei o CP-005 integral e lancei **R$ 650 de impostos retidos** (ISS R$ 500 + IRRF R$ 150), com a sua confirmação. Está na trilha como lançamento criado por decisão humana.";
      case "parcial": return "Baixa parcial registrada ✓ — **R$ 5.000** quitados; **R$ 3.000** seguem em aberto no CP-006 (Delta).";
      case "tarifa": return "Despesa de **tarifa bancária (R$ 45)** criada com a sua aprovação. Eu não teria criado sozinho — é fato financeiro novo.";
      case "ausente": return "Marquei o **CR-003 (Sigma)** para cobrança. Não entra no conciliado do extrato, mas sai das pendências e eu te lembro perto do vencimento.";
      default: return "Feito ✓ — evidência anexada e reversível.";
    }
  }

  window.ConcEngine = { initialState, reducer, selectBalances, interpret, confirmText, EXTRATO_CASES: ["alfa", "omega", "silva", "lote", "gama", "delta", "tarifa"] };
})();
