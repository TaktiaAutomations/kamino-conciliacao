import { useReducer, useRef } from "react";
import {
  reducer,
  initialState,
  selectBalances,
  makeTask,
  activeTask,
  type Action,
  type Task,
  type Approval,
} from "./store";
import { interpret, type ChatMessage } from "./agent";
import { caseByKey, brl } from "./data";
import { personas, type PersonaId } from "./personas";
import {
  classifyIntent,
  capabilities,
  capabilityIntro,
  respondCapability,
  ACTIONS,
  NAV,
  acimaDaAlcada,
  type CapabilityId,
} from "./capabilities";
import { Login } from "./components/Login";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { TopBalances } from "./components/TopBalances";
import { Chat } from "./components/Chat";
import { QueuePanel } from "./components/QueuePanel";
import { Launcher } from "./components/Launcher";
import { TaskColumn } from "./components/TaskColumn";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const mkid = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const normTxt = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const EXTRATO_CASES = ["alfa", "omega", "silva", "lote", "gama", "delta", "tarifa"];

/** chips que navegam para outra capacidade (abrem/reusam a task) */
const NAV_CHIPS: Record<string, CapabilityId> = {
  [NAV.conciliacao]: "conciliacao",
  [NAV.receber]: "receber",
  [NAV.aprovacoes]: "aprovacoes",
  [NAV.pagar]: "pagar",
  [NAV.caixa]: "caixa",
};

const CONCIL_CHIPS = [
  "Concilia tudo ≥ 90%",
  "Mostra o lote",
  "Por que a Gama veio menor?",
  "E a tarifa de R$ 45?",
  "E a Sigma que não caiu?",
];

const isGoConcil = (t: string) =>
  t.trim().toLowerCase().startsWith("ir para a concili");

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const stateRef = useRef(state);
  stateRef.current = state;

  if (!state.persona) {
    return <Login onPick={(p: PersonaId) => dispatch({ type: "LOGIN", persona: p })} />;
  }

  const persona = personas[state.persona];
  const task = activeTask(state);
  const isConcil = task?.capability === "conciliacao";
  const balances = selectBalances(task?.resolved ?? []);
  const resolvedSet = new Set(task?.resolved ?? []);

  const add = (taskId: string, msgs: ChatMessage[]) =>
    dispatch({ type: "ADD_MESSAGES", taskId, messages: msgs });
  const replace = (taskId: string, id: string, message: ChatMessage) =>
    dispatch({ type: "REPLACE_MESSAGE", taskId, id, message });

  const curTask = (id: string) => stateRef.current.tasks.find((t) => t.id === id);

  /* ——————— criar task a partir do launcher (classifica a intenção) ——————— */
  async function openFromLauncher(text: string, capOverride?: CapabilityId) {
    if (isGoConcil(text)) return goToConciliacao();
    const cap = capOverride ?? classifyIntent(text);
    const newTask = makeTask(cap, text);
    dispatch({ type: "NEW_TASK", task: newTask });
    await runOpener(newTask, text);
  }

  async function runOpener(t: Task, userText: string) {
    const now = Date.now();
    add(t.id, [{ id: mkid(), role: "user", text: userText, ts: now }]);
    const pid = mkid();
    add(t.id, [{ id: pid, role: "agent", pending: true, ts: now }]);
    await sleep(560);
    const isDona = persona.id === "dona";
    if (t.capability === "conciliacao") {
      replace(t.id, pid, {
        id: pid,
        role: "agent",
        text: persona.saudacao,
        chips: persona.chipsIniciais,
        ts: Date.now(),
      });
    } else if (t.capability === "aprovacoes") {
      const pend = stateRef.current.approvals.filter((a) => a.status === "pendente");
      const text = isDona
        ? pend.length
          ? `Você tem **${pend.length} ${pend.length > 1 ? "itens" : "item"} aguardando sua aprovação**. Revise a evidência e decida — nada é executado sem o seu ok.`
          : "Sua fila de aprovações está **zerada** — nada pendente. Quando o time enviar algo (ex.: um lote de pagamentos), aparece aqui."
        : pend.length
          ? "Aqui está o que você enviou para aprovação. Está **com a Bia** — te aviso assim que ela decidir."
          : "Você não tem envios pendentes. Prepare um lote em **Contas a pagar** e envie para aprovação.";
      replace(t.id, pid, {
        id: pid,
        role: "agent",
        text,
        card: { kind: "capCard", cap: "aprovacoes" },
        chips: isDona ? [] : [NAV.pagar],
        ts: Date.now(),
      });
    } else if (t.capability === "pagar") {
      const text = isDona
        ? "Estes são os pagamentos que o time **capturou e preparou**. Você aprova e eu agendo no banco."
        : "**Capturei os boletos** automaticamente (DDA + e-mail) e a IA já sugeriu categoria e centro de custo. Revise e me mande **lançar as despesas** no contas a pagar.";
      replace(t.id, pid, {
        id: pid,
        role: "agent",
        text,
        card: { kind: "capCard", cap: "pagar", view: "overview" },
        chips: [isDona ? ACTIONS.pagar.agendar : ACTIONS.pagar.lancar],
        ts: Date.now(),
      });
    } else if (t.capability === "caixa" && /projec|projetar|semana|fluxo/.test(normTxt(userText))) {
      // a dona pediu a projeção a partir do saldo conciliado → já entrega
      replace(t.id, pid, {
        id: pid,
        role: "agent",
        text:
          "Projetei seu caixa da semana **a partir do saldo conciliado** (R$ 12.305) — a base é confiável porque o extrato de junho já foi batido. Veja o dia a dia:",
        card: { kind: "capCard", cap: "caixa", view: "projecao" },
        chips: [NAV.receber, NAV.conciliacao],
        ts: Date.now(),
      });
    } else {
      const intro = capabilityIntro(t.capability);
      const hasCard = ["receber", "caixa", "relatorios"].includes(t.capability);
      replace(t.id, pid, {
        id: pid,
        role: "agent",
        text: intro.text,
        card: hasCard ? { kind: "capCard", cap: t.capability } : undefined,
        chips: intro.chips,
        ts: Date.now(),
      });
    }
  }

  function openCapability(cap: CapabilityId, phrase: string) {
    const existing = stateRef.current.tasks.find((t) => t.capability === cap);
    if (existing) {
      dispatch({ type: "OPEN_TASK", id: existing.id });
      return;
    }
    const t = makeTask(cap, phrase);
    dispatch({ type: "NEW_TASK", task: t });
    void runOpener(t, phrase);
  }

  function goToConciliacao() {
    openCapability("conciliacao", "Conciliar o extrato de junho");
  }

  /* ——————— envio dentro da task ativa ——————— */
  async function handleSend(text: string) {
    const t = activeTask(stateRef.current);
    if (!t) return;

    // botões de aprovação (não ecoam como mensagem do usuário)
    if (text.startsWith("__approve__") || text.startsWith("__reject__")) {
      return decideApproval(t, text);
    }

    // chips de navegação entre capacidades (abre/reusa a task)
    if (NAV_CHIPS[text]) {
      return openCapability(NAV_CHIPS[text], text);
    }

    if (isGoConcil(text) || (t.capability !== "conciliacao" && classifyIntent(text) === "conciliacao")) {
      // registra a intenção e navega
      add(t.id, [{ id: mkid(), role: "user", text, ts: Date.now() }]);
      await sleep(300);
      return goToConciliacao();
    }

    const now = Date.now();
    add(t.id, [{ id: mkid(), role: "user", text, ts: now }]);
    const pid = mkid();
    add(t.id, [{ id: pid, role: "agent", pending: true, ts: now }]);

    // aprovações (fila da dona) e captura de pagamentos (maker/checker)
    if (t.capability === "aprovacoes") return handleAprovacoes(t, pid, text);
    if (t.capability === "pagar") return handlePagar(t, pid, text);

    // demais capacidades em desenho: engine de jornada (botão ou palavra-chave)
    if (t.capability !== "conciliacao") {
      await sleep(560);
      const msgs = respondCapability(t.capability, text);
      const [first, ...rest] = msgs;
      replace(t.id, pid, { id: pid, role: "agent", ...first, ts: Date.now() });
      for (const m of rest) {
        await sleep(m.card ? 420 : 640);
        add(t.id, [{ id: mkid(), role: "agent", ...m, ts: Date.now() }]);
      }
      return;
    }

    // conciliação: motor determinístico
    const ctx = {
      persona: stateRef.current.persona!,
      resolved: new Set(t.resolved),
      apiKeyPresent: false,
    };
    const reply = interpret(text, ctx);
    await sleep(560);

    const [first, ...rest] = reply.messages;
    replace(t.id, pid, { id: pid, role: "agent", ...first, ts: Date.now() });
    for (const m of rest) {
      await sleep(m.card ? 420 : 680);
      add(t.id, [{ id: mkid(), role: "agent", ...m, ts: Date.now() }]);
    }
    if (reply.effects) {
      for (const e of reply.effects) {
        await sleep(520);
        applyResolve(t.id, e.caseKey, true);
      }
    }
  }

  /* ——————— captura de pagamentos (analista prepara/envia; dona aprova) ——————— */
  function buildLoteApproval(): Approval {
    const itens = acimaDaAlcada.map((b) => ({
      fornecedor: b.fornecedor,
      categoria: b.categoria,
      origem: b.origem,
      valor: b.valor,
      vencimento: b.vencimento,
    }));
    const valor = itens.reduce((s, i) => s + i.valor, 0); // Gama + Delta = 18.000
    return {
      id: `apr-${Date.now()}`,
      cap: "pagar",
      title: "Pagamentos acima da alçada · junho",
      detalhe: "2 títulos acima de R$ 5.000 — precisam do seu ok",
      valor,
      submittedBy: `${persona.nome} · Analista`,
      ts: Date.now(),
      status: "pendente",
      itens,
    };
  }

  async function handlePagar(t: Task, pid: string, text: string) {
    await sleep(560);
    const isDona = persona.id === "dona";
    const n = normTxt(text);
    const set = (msg: { text: string; view: string; chips: string[] }) =>
      replace(t.id, pid, {
        id: pid,
        role: "agent",
        text: msg.text,
        card: { kind: "capCard", cap: "pagar", view: msg.view },
        chips: msg.chips,
        ts: Date.now(),
      });

    // dona: aprova e agenda direto (tem alçada plena)
    if (isDona) {
      if (["aprov", "agend", "confirmar"].some((w) => n.includes(w))) {
        const pend = stateRef.current.approvals.find((a) => a.cap === "pagar" && a.status === "pendente");
        if (pend) dispatch({ type: "DECIDE_APPROVAL", id: pend.id, decision: "aprovado" });
        set({
          text: "Aprovado — **agendei os pagamentos no CNAB** do banco, respeitando cada vencimento. Registrado na trilha: aprovado por você.",
          view: "scheduled",
          chips: [NAV.caixa],
        });
        return;
      }
      set({
        text: "Estes são os pagamentos preparados pelo time. Posso **aprovar e agendar**.",
        view: "overview",
        chips: [ACTIONS.pagar.agendar],
      });
      return;
    }

    // analista · passo 1: lançar despesas
    if (["lancar", "lança", "lanca", "lançar", "lançamento", "lancamento", "registr", "classif"].some((w) => n.includes(w))) {
      set({
        text:
          "Lancei as **6 despesas** no contas a pagar — a IA classificou cada uma (**categoria** + centro de custo) e cruzou com o cadastro do fornecedor. **4 estão dentro da sua alçada** e já deixei agendadas. **2 passam de R$ 5.000** (Gama e Delta) — essas precisam da Bia.",
        view: "lancado",
        chips: [ACTIONS.pagar.enviar],
      });
      return;
    }

    // analista · passo 2: enviar os acima da alçada para aprovação
    if (["enviar", "aprovac", "aprovaç", "aprovar", "envia", "manda"].some((w) => n.includes(w))) {
      const already = stateRef.current.approvals.find((a) => a.cap === "pagar" && a.status === "pendente");
      if (!already) dispatch({ type: "SUBMIT_APPROVAL", approval: buildLoteApproval() });
      set({
        text: already
          ? "Esses pagamentos já estão **com a Bia** para aprovação — te aviso assim que ela decidir."
          : "Enviei os **2 pagamentos acima da alçada** (Gama e Delta · R$ 18.000) para a **Bia aprovar**, com a evidência completa: categoria, origem, fornecedor e vencimento. Acompanhe em **Aprovações**.",
        view: "submitted",
        chips: [NAV.aprovacoes],
      });
      return;
    }

    // default: overview da captura
    set({
      text: "Aqui está o que **capturei** (DDA + e-mail). Posso **lançar as despesas** no contas a pagar.",
      view: "overview",
      chips: [ACTIONS.pagar.lancar],
    });
  }

  /* ——————— fila de aprovações (dona decide; analista acompanha) ——————— */
  async function handleAprovacoes(t: Task, pid: string, text: string) {
    await sleep(500);
    const isDona = persona.id === "dona";
    const n = normTxt(text);
    const pendentes = () => stateRef.current.approvals.filter((a) => a.status === "pendente");

    if (isDona && /aprov/.test(n)) {
      const first = pendentes()[0];
      if (!first) {
        replace(t.id, pid, { id: pid, role: "agent", text: "Não há nada pendente para aprovar.", card: { kind: "capCard", cap: "aprovacoes" }, ts: Date.now() });
        return;
      }
      finishDecision(t, pid, first, "aprovado");
      return;
    }
    if (isDona && /(rejeit|recus|devolv)/.test(n)) {
      const first = pendentes()[0];
      if (!first) {
        replace(t.id, pid, { id: pid, role: "agent", text: "Não há nada pendente para rejeitar.", card: { kind: "capCard", cap: "aprovacoes" }, ts: Date.now() });
        return;
      }
      finishDecision(t, pid, first, "rejeitado");
      return;
    }
    if (!isDona && /(aprov|rejeit)/.test(n)) {
      replace(t.id, pid, {
        id: pid,
        role: "agent",
        text:
          "A **decisão de aprovar é da Bia** — você prepara e envia; ela decide no ponto de risco. É a segregação de funções que dá segurança ao processo.",
        card: { kind: "capCard", cap: "aprovacoes" },
        ts: Date.now(),
      });
      return;
    }
    const q = pendentes().length;
    replace(t.id, pid, {
      id: pid,
      role: "agent",
      text: isDona
        ? q
          ? `Você tem **${q}** aguardando decisão.`
          : "Fila de aprovações **zerada**."
        : "Aqui estão seus envios e o status de cada um.",
      card: { kind: "capCard", cap: "aprovacoes" },
      chips: isDona ? [] : [NAV.pagar],
      ts: Date.now(),
    });
  }

  // botão Aprovar/Rejeitar do card (sem eco de mensagem do usuário)
  async function decideApproval(t: Task, text: string) {
    const decision: "aprovado" | "rejeitado" = text.startsWith("__approve__") ? "aprovado" : "rejeitado";
    const id = text.replace(/^__(approve|reject)__/, "");
    const a = stateRef.current.approvals.find((x) => x.id === id);
    if (!a || a.status !== "pendente") return;
    const pid = mkid();
    add(t.id, [{ id: pid, role: "agent", pending: true, ts: Date.now() }]);
    await sleep(500);
    finishDecision(t, pid, a, decision);
  }

  function finishDecision(t: Task, pid: string, a: Approval, decision: "aprovado" | "rejeitado") {
    dispatch({ type: "DECIDE_APPROVAL", id: a.id, decision });
    const text =
      decision === "aprovado"
        ? `**Aprovado ✓** — ${a.title} (${brl(a.valor)}). Agendei no CNAB e registrei na trilha: aprovado por ${persona.nome}. O time já pode seguir.`
        : `Rejeitado — devolvi **${a.title}** para o time revisar. Nada foi pago.`;
    replace(t.id, pid, {
      id: pid,
      role: "agent",
      text,
      card: { kind: "capCard", cap: "aprovacoes" },
      chips: decision === "aprovado" ? [NAV.caixa] : [],
      ts: Date.now(),
    });
  }

  /* ——————— resolver caso (card ou efeito) ——————— */
  function applyResolve(taskId: string, caseKey: string, automatica: boolean) {
    const t = curTask(taskId);
    if (!t || t.resolved.includes(caseKey)) return;
    dispatch({
      type: "RESOLVE",
      taskId,
      caseKey,
      autor: automatica ? "Agente Kamino" : persona.nome,
      automatica,
    } satisfies Action);

    const projected = [...t.resolved, caseKey];
    if (!automatica) {
      add(taskId, [{ id: mkid(), role: "agent", text: confirmText(caseKey), ts: Date.now() }]);
    }
    const allDone = EXTRATO_CASES.every((k) => projected.includes(k));
    const wasDone = EXTRATO_CASES.every((k) => t.resolved.includes(k));
    if (allDone && !wasDone) {
      const b = selectBalances(projected);
      setTimeout(
        () =>
          add(taskId, [
            {
              id: mkid(),
              role: "agent",
              text: `É isso: **extrato 100% explicado**. Saldo do banco e saldo interno batem em **${brl(
                b.banco
              )}** — agora é um número em que dá para confiar. Levou minutos, não horas.`,
              ts: Date.now(),
            },
          ]),
        700
      );
    }
  }

  const onResolveFromCard = (k: string) => task && applyResolve(task.id, k, false);
  const onUndo = (k: string) =>
    task && dispatch({ type: "UNDO", taskId: task.id, caseKey: k, autor: persona.nome });

  const quickChips: string[] = (() => {
    const cap = task?.capability;
    const isDona = persona.id === "dona";
    if (cap === "conciliacao") return CONCIL_CHIPS;
    if (cap === "aprovacoes")
      return isDona ? ["Aprovar o lote", "Rejeitar", NAV.caixa] : [NAV.pagar, NAV.conciliacao];
    if (cap === "pagar")
      return isDona
        ? [ACTIONS.pagar.agendar, NAV.conciliacao]
        : [ACTIONS.pagar.lancar, ACTIONS.pagar.enviar, NAV.aprovacoes];
    if (cap === "receber") return [ACTIONS.receber.preparar, NAV.conciliacao];
    if (cap === "caixa") return [ACTIONS.caixa.projecao, NAV.receber, NAV.conciliacao];
    if (cap === "relatorios") return [ACTIONS.relatorios.exportar, ACTIONS.relatorios.fechar, NAV.conciliacao];
    return [NAV.conciliacao, NAV.pagar, NAV.caixa];
  })();

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <TopBar persona={persona} org="Acme" onLogout={() => dispatch({ type: "LOGOUT" })} />

        {/* subheader de contexto */}
        <SubHeader task={task} persona={persona} onReset={() => dispatch({ type: "RESET" })} />

        {/* corpo: coluna de tasks + área de trabalho (saldos + conversa) + painel contextual */}
        <div className="flex-1 flex min-h-0">
          <TaskColumn
            tasks={state.tasks}
            activeTaskId={state.activeTaskId}
            onNew={() => dispatch({ type: "OPEN_TASK", id: null })}
            onOpen={(id) => dispatch({ type: "OPEN_TASK", id })}
            onClose={(id) => dispatch({ type: "CLOSE_TASK", id })}
          />

          {/* área de trabalho — saldos contidos aqui dentro, acima da conversa */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {isConcil && (
              <div className="shrink-0 px-6 pt-3 bg-gray-50">
                <TopBalances b={balances} />
              </div>
            )}

            {task ? (
              <Chat
                key={task.id}
                messages={task.messages}
                persona={persona}
                balances={balances}
                resolvedSet={resolvedSet}
                approvals={state.approvals}
                llmBusy={state.llmBusy}
                quickChips={quickChips}
                onSend={handleSend}
                onResolve={onResolveFromCard}
              />
            ) : (
              <Launcher
                persona={persona}
                pendingApprovals={state.approvals.filter((a) => a.status === "pendente").length}
                onSubmit={openFromLauncher}
              />
            )}
          </div>

          {isConcil && (
            <div className="hidden xl:flex">
              <QueuePanel
                resolvedSet={resolvedSet}
                audit={task!.audit}
                onChip={handleSend}
                onUndo={onUndo}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* —————————————— subheader contextual —————————————— */
function SubHeader({
  task,
  persona,
  onReset,
}: {
  task: Task | null;
  persona: { iniciais: string; cargo: string; cor: string };
  onReset: () => void;
}) {
  const cap = task ? capabilities[task.capability] : null;
  const title = task
    ? task.capability === "conciliacao"
      ? "Conciliação bancária · Junho 2026"
      : task.title
    : "Assistente Kamino";
  const subtitle = task
    ? cap!.ready
      ? "Acme Serviços · assistida por agente"
      : `${cap!.label} · em desenho nesta versão`
    : "Camada de intenção do ERP · uma conversa por assunto";

  return (
    <div className="shrink-0 flex items-center gap-3 px-6 py-2.5 bg-white border-b border-gray-200">
      <div className="min-w-0">
        <h1 className="text-sm font-bold text-ink leading-tight truncate">{title}</h1>
        <p className="text-[11px] text-muted truncate">{subtitle}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden md:inline-flex items-center gap-2 pr-2">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
            style={{ background: persona.cor }}
          >
            {persona.iniciais}
          </span>
          <span className="text-xs text-gray-600">{persona.cargo}</span>
        </span>
        <button
          onClick={onReset}
          className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-gray-300 text-muted hover:bg-gray-50 transition-colors duration-120"
        >
          Reiniciar demo
        </button>
      </div>
    </div>
  );
}

/* —————————————— textos de confirmação por tipo de caso —————————————— */
function confirmText(caseKey: string): string {
  const c = caseByKey(caseKey);
  switch (c.kind) {
    case "nome":
      return "Conciliado ✓ — registrei que “João P da Silva” é a pessoa por trás da Consultoria Silva ME. Da próxima vez eu já sugiro sozinho.";
    case "lote":
      return "Lote fechado ✓ — os 3 títulos da Beta Serviços baixados de uma vez, contra o débito único de R$ 4.500.";
    case "retencao":
      return "Baixei o CP-005 integral e lancei **R$ 650 de impostos retidos** (ISS R$ 500 + IRRF R$ 150), com a sua confirmação. Está na trilha como lançamento criado por decisão humana.";
    case "parcial":
      return "Baixa parcial registrada ✓ — **R$ 5.000** quitados; **R$ 3.000** seguem em aberto no CP-006 (Delta).";
    case "tarifa":
      return "Despesa de **tarifa bancária (R$ 45)** criada com a sua aprovação. Eu não teria criado sozinho — é fato financeiro novo.";
    case "ausente":
      return "Marquei o **CR-003 (Sigma)** para cobrança. Não entra no conciliado do extrato, mas sai das pendências e eu te lembro perto do vencimento.";
    default:
      return "Feito ✓ — evidência anexada e reversível.";
  }
}
