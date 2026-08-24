/* ————————————————————————————————————————————————————————————————
   STORE — assistente multi-task. Cada conversa (task) tem sua própria
   trilha de mensagens; tasks de conciliação carregam também o estado
   de domínio (resolved + audit). Saldos/% derivam de `resolved`.
———————————————————————————————————————————————————————————————— */
import { cases, extratoSeed, titulosSeed, SALDO_INICIAL, caseByKey } from "./data";
import type { Titulo } from "./data";
import type { ChatMessage } from "./agent";
import type { PersonaId } from "./personas";
import { titleFor, type CapabilityId } from "./capabilities";

export interface AuditEntry {
  id: string;
  ts: number;
  autor: string;
  acao: string;
  evidencia: string;
  caseKey: string;
  automatica: boolean;
}

export interface Task {
  id: string;
  capability: CapabilityId;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
  resolved: string[]; // relevante só p/ conciliação
  audit: AuditEntry[]; // idem
}

export interface ApprovalItem {
  fornecedor: string;
  categoria: string;
  origem: string;
  valor: number;
  vencimento: string;
}

export interface Approval {
  id: string;
  cap: CapabilityId;
  title: string;
  detalhe: string;
  valor: number;
  submittedBy: string;
  ts: number;
  status: "pendente" | "aprovado" | "rejeitado";
  itens?: ApprovalItem[]; // detalhe dos títulos para sustentar a decisão
}

export interface State {
  persona: PersonaId | null;
  tasks: Task[];
  activeTaskId: string | null; // null → launcher
  approvals: Approval[]; // fila de aprovações — compartilhada entre personas
  apiKey: string;
  llmBusy: boolean;
}

export function initialState(): State {
  return {
    persona: null,
    tasks: [],
    activeTaskId: null,
    approvals: [], // o analista cria a aprovação ao vivo (captura → envia)
    apiKey: "",
    llmBusy: false,
  };
}

/** Alfa e Ômega já entram conciliados (2 de 7) numa task de conciliação. */
const INITIAL_RESOLVED = ["alfa", "omega"];

function autoAudit(caseKey: string): AuditEntry {
  const c = caseByKey(caseKey);
  return {
    id: `aud-${caseKey}-${Math.random().toString(36).slice(2, 7)}`,
    ts: Date.now(),
    autor: "Agente Kamino",
    acao: `Conciliou automaticamente: ${c.titulo}`,
    evidencia: c.evidencias.map((e) => e.label).join(" · "),
    caseKey,
    automatica: true,
  };
}

let taskSeq = 0;
export function makeTask(capability: CapabilityId, userText: string): Task {
  const id = `task-${Date.now()}-${taskSeq++}`;
  const isConcil = capability === "conciliacao";
  return {
    id,
    capability,
    title: titleFor(capability, userText),
    createdAt: Date.now(),
    messages: [],
    resolved: isConcil ? [...INITIAL_RESOLVED] : [],
    audit: isConcil ? INITIAL_RESOLVED.map(autoAudit) : [],
  };
}

export type Action =
  | { type: "LOGIN"; persona: PersonaId }
  | { type: "LOGOUT" }
  | { type: "RESET" }
  | { type: "NEW_TASK"; task: Task }
  | { type: "OPEN_TASK"; id: string | null }
  | { type: "CLOSE_TASK"; id: string }
  | { type: "ADD_MESSAGES"; taskId: string; messages: ChatMessage[] }
  | { type: "REPLACE_MESSAGE"; taskId: string; id: string; message: ChatMessage }
  | { type: "RESOLVE"; taskId: string; caseKey: string; autor: string; automatica: boolean }
  | { type: "UNDO"; taskId: string; caseKey: string; autor: string }
  | { type: "SET_APIKEY"; value: string }
  | { type: "SET_LLM_BUSY"; value: boolean }
  | { type: "SUBMIT_APPROVAL"; approval: Approval }
  | { type: "DECIDE_APPROVAL"; id: string; decision: "aprovado" | "rejeitado" };

function updateTask(state: State, id: string, fn: (t: Task) => Task): State {
  return { ...state, tasks: state.tasks.map((t) => (t.id === id ? fn(t) : t)) };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOGIN":
      // troca de persona preserva a fila de aprovações (maker/checker)
      return { ...initialState(), persona: action.persona, approvals: state.approvals, apiKey: state.apiKey };
    case "LOGOUT":
      return { ...initialState(), approvals: state.approvals, apiKey: state.apiKey };
    case "RESET":
      return { ...initialState(), persona: state.persona };
    case "NEW_TASK":
      return { ...state, tasks: [action.task, ...state.tasks], activeTaskId: action.task.id };
    case "OPEN_TASK":
      return { ...state, activeTaskId: action.id };
    case "CLOSE_TASK": {
      const tasks = state.tasks.filter((t) => t.id !== action.id);
      const activeTaskId =
        state.activeTaskId === action.id ? null : state.activeTaskId;
      return { ...state, tasks, activeTaskId };
    }
    case "ADD_MESSAGES":
      return updateTask(state, action.taskId, (t) => ({
        ...t,
        messages: [...t.messages, ...action.messages],
      }));
    case "REPLACE_MESSAGE":
      return updateTask(state, action.taskId, (t) => ({
        ...t,
        messages: t.messages.map((m) => (m.id === action.id ? action.message : m)),
      }));
    case "RESOLVE":
      return updateTask(state, action.taskId, (t) => {
        if (t.resolved.includes(action.caseKey)) return t;
        const c = caseByKey(action.caseKey);
        const entry: AuditEntry = {
          id: `aud-${action.caseKey}-${Math.random().toString(36).slice(2, 7)}`,
          ts: Date.now(),
          autor: action.autor,
          acao: resolveVerb(action.caseKey) + `: ${c.titulo}`,
          evidencia: c.evidencias.map((e) => e.label).join(" · "),
          caseKey: action.caseKey,
          automatica: action.automatica,
        };
        return { ...t, resolved: [...t.resolved, action.caseKey], audit: [entry, ...t.audit] };
      });
    case "UNDO":
      return updateTask(state, action.taskId, (t) => {
        if (!t.resolved.includes(action.caseKey)) return t;
        const c = caseByKey(action.caseKey);
        const entry: AuditEntry = {
          id: `aud-undo-${action.caseKey}-${Math.random().toString(36).slice(2, 7)}`,
          ts: Date.now(),
          autor: action.autor,
          acao: `Desfez: ${c.titulo}`,
          evidencia: "Reversão manual",
          caseKey: action.caseKey,
          automatica: false,
        };
        return {
          ...t,
          resolved: t.resolved.filter((k) => k !== action.caseKey),
          audit: [entry, ...t.audit],
        };
      });
    case "SET_APIKEY":
      return { ...state, apiKey: action.value };
    case "SET_LLM_BUSY":
      return { ...state, llmBusy: action.value };
    case "SUBMIT_APPROVAL":
      return { ...state, approvals: [action.approval, ...state.approvals] };
    case "DECIDE_APPROVAL":
      return {
        ...state,
        approvals: state.approvals.map((a) =>
          a.id === action.id ? { ...a, status: action.decision } : a
        ),
      };
    default:
      return state;
  }
}

export function activeTask(state: State): Task | null {
  return state.tasks.find((t) => t.id === state.activeTaskId) ?? null;
}

function resolveVerb(caseKey: string): string {
  const c = caseByKey(caseKey);
  switch (c.kind) {
    case "retencao":
      return "Baixou título e lançou retenção";
    case "tarifa":
      return "Criou despesa de tarifa (aprovado)";
    case "parcial":
      return "Baixa parcial";
    case "lote":
      return "Conciliou lote";
    case "ausente":
      return "Marcou para cobrança";
    default:
      return "Conciliou";
  }
}

/* ————————————————————————— SELETORES / SALDOS ————————————————————————— */

const extValor = (exId: string) => extratoSeed.find((e) => e.id === exId)?.valor ?? 0;
const TODAS_LINHAS = extratoSeed.reduce((s, e) => s + e.valor, 0);

export interface Balances {
  banco: number;
  interno: number;
  conciliadoPct: number;
  linhasConciliadas: number;
  totalLinhas: number;
  pendencias: number;
  saldoPrevisto: number;
}

export function selectBalances(resolvedArr: string[]): Balances {
  const resolved = new Set(resolvedArr);
  const linhasComExtrato = cases.filter((c) => c.extratoId);
  const explicadas = linhasComExtrato.filter((c) => resolved.has(c.key));
  const interno =
    SALDO_INICIAL + explicadas.reduce((s, c) => s + extValor(c.extratoId!), 0);
  const banco = SALDO_INICIAL + TODAS_LINHAS;
  const totalLinhas = linhasComExtrato.length;
  const pendencias = cases.filter((c) => c.kind !== "exato" && !resolved.has(c.key)).length;
  const sigma = caseByKey("sigma");
  const sigmaValor = resolved.has("sigma")
    ? 0
    : titulosSeed
        .filter((t) => sigma.titulos.includes(t.id))
        .reduce((s, t) => s + t.valor, 0);
  return {
    banco,
    interno,
    conciliadoPct: Math.round((explicadas.length / totalLinhas) * 100),
    linhasConciliadas: explicadas.length,
    totalLinhas,
    pendencias,
    saldoPrevisto: banco + sigmaValor,
  };
}

export interface TituloView extends Titulo {
  caseKey: string | null;
  resolvido: boolean;
}

export function selectTitulos(resolvedArr: string[]): TituloView[] {
  const resolved = new Set(resolvedArr);
  return titulosSeed.map((t) => {
    const c = cases.find((cc) => cc.titulos.includes(t.id));
    if (!c || !resolved.has(c.key)) {
      return { ...t, caseKey: c?.key ?? null, resolvido: false };
    }
    if (c.kind === "parcial") {
      const b = c.baixaParcial?.[t.id] ?? 0;
      return { ...t, baixado: b, status: "parcial", caseKey: c.key, resolvido: true };
    }
    if (c.kind === "ausente") {
      return { ...t, status: "aberto", caseKey: c.key, resolvido: true };
    }
    return { ...t, baixado: t.valor, status: "conciliado", caseKey: c.key, resolvido: true };
  });
}
