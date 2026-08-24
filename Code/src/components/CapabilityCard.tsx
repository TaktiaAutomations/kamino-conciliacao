import type { ReactNode } from "react";
import { Check, Download, Mail, CalendarClock, FileText, ShieldCheck, Clock } from "lucide-react";
import { brl } from "../data";
import {
  capabilities,
  ACTIONS,
  capturaBoletos,
  acimaDaAlcada,
  ALCADA_ANALISTA,
  type CapabilityId,
} from "../capabilities";
import type { Approval } from "../store";
import type { PersonaId } from "../personas";

/* ————————————————————————————————————————————————————————————————
   Cards de resposta das jornadas. Cada capacidade tem um "overview" e
   telas de resultado. Botões disparam as mesmas ações que as
   palavras-chave (via onAction → chat). Conteúdo derivado do case.
   Maker/checker: o analista captura/prepara e ENVIA; a dona APROVA.
———————————————————————————————————————————————————————————————— */

function Shell({
  cap,
  title,
  children,
  actions,
  onAction,
  tag = "prévia · dados do case · em desenho",
}: {
  cap: CapabilityId;
  title: string;
  children: ReactNode;
  actions?: string[];
  onAction?: (t: string) => void;
  tag?: string;
}) {
  const c = capabilities[cap];
  const Icon = c.icon;
  return (
    <div className="mt-1 rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden max-w-[560px]">
      <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ background: `${c.cor}14`, color: c.cor }}
        >
          <Icon size={16} strokeWidth={2} />
        </span>
        <div className="text-sm font-semibold text-ink">{title}</div>
      </div>
      <div className="px-4 pb-3">{children}</div>
      {(actions?.length || tag) && (
        <div className="px-4 py-2.5 border-t border-gray-200 flex items-center gap-2 flex-wrap">
          {actions?.map((a) => (
            <button
              key={a}
              onClick={() => onAction?.(a)}
              className="text-xs font-semibold px-3.5 py-2 rounded-md text-white bg-navy-600 hover:bg-navy-700 transition-[filter] duration-120 active:scale-[0.98]"
            >
              {a}
            </button>
          ))}
          {tag && <span className="text-[10px] text-gray-400 ml-auto">{tag}</span>}
        </div>
      )}
    </div>
  );
}

function LineRow({
  label,
  sub,
  value,
  tone = "ink",
  badge,
  badgeTone = "coral",
  source,
}: {
  label: string;
  sub?: string;
  value: string;
  tone?: "ink" | "green" | "coral" | "navy" | "muted";
  badge?: string;
  badgeTone?: "coral" | "orange" | "navy";
  source?: string;
}) {
  const color =
    tone === "green"
      ? "text-kgreen-600"
      : tone === "coral"
      ? "text-coral-500"
      : tone === "navy"
      ? "text-navy-600"
      : tone === "muted"
      ? "text-muted"
      : "text-ink";
  const badgeCls =
    badgeTone === "orange"
      ? "bg-orange-50 text-orange-600"
      : badgeTone === "navy"
      ? "bg-navy-50 text-navy-600"
      : "bg-coral-50 text-coral-600";
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <div className="text-xs font-medium text-ink flex items-center gap-1.5 flex-wrap">
          {label}
          {source && (
            <span className="text-[9px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
              via {source}
            </span>
          )}
          {badge && (
            <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${badgeCls}`}>
              {badge}
            </span>
          )}
        </div>
        {sub && <div className="text-[11px] text-muted">{sub}</div>}
      </div>
      <div className={`text-sm font-bold tabular-nums shrink-0 ${color}`}>{value}</div>
    </div>
  );
}

function SuccessPill({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-kgreen-700 bg-kgreen-50 border border-kgreen-600/30 rounded-full px-2.5 py-1 mb-3">
      <Check size={13} strokeWidth={3} />
      {children}
    </div>
  );
}

export function CapabilityCard({
  cap,
  view = "overview",
  persona,
  approvals = [],
  onAction,
}: {
  cap: CapabilityId;
  view?: string;
  persona?: PersonaId;
  approvals?: Approval[];
  onAction: (t: string) => void;
}) {
  const isDona = persona === "dona";

  /* ————————————————— APROVAÇÕES (inbox da dona) ————————————————— */
  if (cap === "aprovacoes") {
    const pend = approvals.filter((a) => a.status === "pendente");
    const decididas = approvals.filter((a) => a.status !== "pendente");
    return (
      <Shell cap={cap} title={isDona ? "Sua fila de aprovações" : "Aprovações — status dos envios"} tag="segregação de funções · maker/checker">
        {pend.length === 0 && decididas.length === 0 && (
          <div className="text-xs text-muted py-2">Nenhuma aprovação por aqui.</div>
        )}
        {pend.map((a) => (
          <div key={a.id} className="rounded-md border border-gray-200 p-3 mb-2">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="text-sm font-semibold text-ink">{a.title}</div>
              <div className="text-sm font-bold text-navy-600 tabular-nums">{brl(a.valor)}</div>
            </div>
            <div className="text-[11px] text-muted mb-2">{a.detalhe}</div>

            {/* detalhe dos títulos — sustenta a decisão */}
            {a.itens && a.itens.length > 0 && (
              <div className="rounded-md border border-gray-200 bg-gray-50 divide-y divide-gray-200 mb-2.5">
                {a.itens.map((it, i) => (
                  <div key={i} className="px-2.5 py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-ink truncate">{it.fornecedor}</div>
                      <div className="text-[10px] text-muted flex items-center gap-1.5 flex-wrap">
                        <span>{it.categoria}</span>
                        <span className="text-gray-300">·</span>
                        <span className="font-semibold uppercase tracking-wide bg-gray-100 text-gray-500 px-1 rounded">
                          via {it.origem}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span>vence {it.vencimento}</span>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-ink tabular-nums shrink-0">{brl(it.valor)}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-muted mb-2.5">
              <Clock size={12} strokeWidth={2} />
              enviado por {a.submittedBy}
            </div>
            {isDona ? (
              <div className="flex gap-2">
                <button
                  onClick={() => onAction(`__approve__${a.id}`)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md text-white bg-kgreen-600 hover:bg-kgreen-700 transition active:scale-[0.98] inline-flex items-center gap-1.5"
                >
                  <ShieldCheck size={14} strokeWidth={2} /> Aprovar
                </button>
                <button
                  onClick={() => onAction(`__reject__${a.id}`)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 text-coral-500 hover:bg-gray-50 transition"
                >
                  Rejeitar
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-500/30 rounded-full px-2.5 py-1">
                <Clock size={12} strokeWidth={2} /> aguardando aprovação
              </div>
            )}
          </div>
        ))}
        {decididas.map((a) => (
          <div key={a.id} className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 mb-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                a.status === "aprovado" ? "bg-kgreen-50 text-kgreen-700" : "bg-coral-50 text-coral-600"
              }`}
            >
              {a.status === "aprovado" ? "✓" : "×"}
            </span>
            <span className="text-xs text-gray-600 flex-1 truncate">{a.title}</span>
            <span
              className={`text-[10px] font-bold uppercase ${
                a.status === "aprovado" ? "text-kgreen-700" : "text-coral-600"
              }`}
            >
              {a.status}
            </span>
          </div>
        ))}
      </Shell>
    );
  }

  /* ————————————————— CAIXA ————————————————— */
  if (cap === "caixa" && view === "projecao") {
    const dias = [
      { d: "Hoje (seg)", delta: 0, saldo: 12305 },
      { d: "Ter", delta: -45, saldo: 12260 },
      { d: "Qua", delta: 2500, saldo: 14760 },
      { d: "Qui", delta: -3000, saldo: 11760 },
      { d: "Sex", delta: 0, saldo: 11760 },
    ];
    const max = Math.max(...dias.map((x) => x.saldo));
    return (
      <Shell cap={cap} title="Projeção de caixa · próximos 7 dias" onAction={onAction}>
        <div className="space-y-2">
          {dias.map((x) => (
            <div key={x.d} className="flex items-center gap-3">
              <div className="w-16 text-[11px] text-muted shrink-0">{x.d}</div>
              <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                <div className="h-full rounded" style={{ width: `${(x.saldo / max) * 100}%`, background: "#0a5da0" }} />
              </div>
              <div className="w-24 text-right text-xs font-bold text-ink tabular-nums shrink-0">{brl(x.saldo)}</div>
              <div
                className={`w-16 text-right text-[11px] tabular-nums shrink-0 ${
                  x.delta > 0 ? "text-kgreen-600" : x.delta < 0 ? "text-coral-500" : "text-gray-300"
                }`}
              >
                {x.delta === 0 ? "—" : `${x.delta > 0 ? "+" : "−"}${brl(Math.abs(x.delta))}`}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-coral-600 bg-coral-50 rounded-md px-3 py-2 border border-coral-500/20">
          ⚠ Sem o recebimento da <b>Sigma (R$ 2.500)</b>, a semana fecha em <b>{brl(9260)}</b>.
        </div>
      </Shell>
    );
  }
  if (cap === "caixa") {
    return (
      <Shell cap={cap} title="Fluxo de caixa · visão rápida" actions={[ACTIONS.caixa.projecao]} onAction={onAction}>
        <div className="mb-3">
          <div className="text-[11px] uppercase tracking-[0.04em] text-muted">Saldo disponível hoje</div>
          <div className="text-2xl font-bold text-navy-600 tabular-nums">{brl(12305)}</div>
        </div>
        <LineRow label="Entradas previstas (7 dias)" sub="CR-003 Sigma — recebimento em atraso" value={`+ ${brl(2500)}`} tone="green" />
        <LineRow label="Saídas previstas (7 dias)" sub="CP-006 Delta — saldo em aberto" value={`− ${brl(3000)}`} tone="coral" />
        <LineRow label="Saldo projetado" sub="fim da semana" value={brl(11805)} tone="navy" />
      </Shell>
    );
  }

  /* ————————————————— PAGAR · captura → lançamento → aprovação ————————————————— */
  if (cap === "pagar" && view === "submitted") {
    const total = acimaDaAlcada.reduce((s, b) => s + b.valor, 0);
    return (
      <Shell cap={cap} title="Enviado para aprovação" onAction={onAction}>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-500/30 rounded-full px-2.5 py-1 mb-3">
          <Clock size={13} strokeWidth={2} /> Aguardando aprovação
        </div>
        {acimaDaAlcada.map((b) => (
          <LineRow key={b.id} label={b.fornecedor} sub={`${b.categoria} · via ${b.origem} · vence ${b.vencimento}`} value={brl(b.valor)} tone="navy" />
        ))}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <LineRow label="Total acima da alçada" sub={`> ${brl(ALCADA_ANALISTA)} por pagamento`} value={brl(total)} tone="navy" />
        </div>
        <div className="mt-2 text-[11px] text-muted">
          As outras 4 despesas (dentro da alçada) já foram lançadas e agendadas.
        </div>
      </Shell>
    );
  }
  if (cap === "pagar" && view === "scheduled") {
    return (
      <Shell cap={cap} title="Pagamentos agendados" onAction={onAction}>
        <SuccessPill>Aprovado e agendado no CNAB · Itaú</SuccessPill>
        {capturaBoletos.map((b) => (
          <LineRow key={b.id} label={b.fornecedor} sub={`${b.categoria} · agendado p/ ${b.vencimento}`} value={brl(b.valor)} tone="muted" />
        ))}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <LineRow label="Total agendado" sub="6 pagamentos · trilha completa" value={brl(25700)} tone="navy" />
        </div>
      </Shell>
    );
  }
  if (cap === "pagar" && view === "lancado") {
    return (
      <Shell cap={cap} title="Despesas lançadas · contas a pagar" actions={[ACTIONS.pagar.enviar]} onAction={onAction}>
        <SuccessPill>6 despesas lançadas · classificadas pela IA</SuccessPill>
        {capturaBoletos.map((b) => {
          const acima = b.valor > ALCADA_ANALISTA;
          return (
            <LineRow
              key={b.id}
              label={b.fornecedor}
              sub={`${b.categoria} · via ${b.origem}`}
              value={brl(b.valor)}
              tone={acima ? "navy" : "muted"}
              badge={acima ? "acima da alçada" : undefined}
              badgeTone="navy"
            />
          );
        })}
        <div className="mt-2 rounded-md bg-orange-50 border border-orange-500/20 px-3 py-2 text-[11px] text-orange-700">
          ⚠ <b>2 pagamentos acima de {brl(ALCADA_ANALISTA)}</b> — Gama e Delta — precisam de aprovação.
          As outras 4 já ficaram agendadas.
        </div>
      </Shell>
    );
  }
  if (cap === "pagar") {
    const primary = isDona ? ACTIONS.pagar.agendar : ACTIONS.pagar.lancar;
    return (
      <Shell cap={cap} title="Documentos capturados · caixa de entrada" actions={[primary]} onAction={onAction}>
        <div className="text-[11px] text-muted mb-2.5">
          6 boletos capturados automaticamente — <b>DDA</b> e <b>e-mail</b>. A IA extraiu os dados e
          já sugeriu <b>categoria</b> e <b>centro de custo</b> para cada um.
        </div>
        <LineRow label="Alfa Tecnologia" sub="Tecnologia / SaaS · vence 05/06" value={brl(3200)} source="DDA" />
        <LineRow
          label="Beta Serviços (3×)"
          sub="Serviços terceirizados · vence 10/06"
          value={brl(4500)}
          source="e-mail"
          badge="verificar duplicidade"
          badgeTone="orange"
        />
        <LineRow label="Gama Consultoria" sub="Consultoria · vence 12/06" value={brl(10000)} source="e-mail" />
        <LineRow label="Delta Aluguéis" sub="Aluguel · vence 15/06" value={brl(8000)} source="DDA" />
        <div className="mt-2 rounded-md bg-orange-50 border border-orange-500/20 px-3 py-2 text-[11px] text-orange-700">
          ⚠ 3 boletos idênticos da Beta (R$ 1.500) — a IA sinaliza <b>possível duplicidade</b>. No
          case são 3 parcelas legítimas; confirme antes de lançar.
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <LineRow label="Total capturado" sub="6 boletos" value={brl(25700)} tone="navy" />
        </div>
      </Shell>
    );
  }

  /* ————————————————— RECEBER ————————————————— */
  if (cap === "receber" && view === "sent") {
    return (
      <Shell cap={cap} title="Cobrança da Sigma" onAction={onAction}>
        <SuccessPill>Cobrança enviada · e-mail + WhatsApp</SuccessPill>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <CalendarClock size={15} strokeWidth={2} className="text-navy-600" />
          Lembrete automático reagendado para <b className="text-ink">+7 dias</b> sem retorno.
        </div>
      </Shell>
    );
  }
  if (cap === "receber" && view === "cobranca") {
    return (
      <Shell cap={cap} title="Cobrança da Sigma — rascunho" actions={[ACTIONS.receber.enviar]} onAction={onAction}>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-500/30 rounded-full px-2.5 py-0.5 mb-2.5">
          <span className="w-[7px] h-[7px] rounded-full bg-orange-500" /> IA sugere · confirme o envio
        </div>
        <LineRow label="Sigma Ltda" sub="CR-003 · venceu 20/06" value={brl(2500)} tone="coral" badge="vencido" />
        <div className="mt-3 rounded-md bg-gray-50 border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted mb-1">
            <Mail size={12} strokeWidth={2} /> mensagem sugerida
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            Olá, tudo bem? Identificamos que a fatura <b>CR-003</b>, no valor de <b>R$ 2.500,00</b>,
            venceu em 20/06 e ainda consta em aberto. Segue o link para pagamento via Pix. Qualquer
            dúvida, estamos à disposição. — Financeiro Acme
          </p>
        </div>
      </Shell>
    );
  }
  if (cap === "receber") {
    return (
      <Shell cap={cap} title="Contas a receber · em aberto" actions={[ACTIONS.receber.preparar]} onAction={onAction}>
        <LineRow label="Consultoria Silva" sub="CR-001 · venceu 08/06" value={brl(6000)} tone="green" />
        <LineRow label="Ômega Varejo" sub="CR-002 · venceu 09/06" value={brl(4200)} tone="green" />
        <LineRow label="Sigma Ltda" sub="CR-003 · venceu 20/06 · não caiu" value={brl(2500)} tone="coral" badge="em atraso" />
        <div className="mt-2 pt-2 border-t border-gray-200">
          <LineRow label="Total a receber" sub="1 em atraso · R$ 2.500,00" value={brl(12700)} tone="navy" />
        </div>
      </Shell>
    );
  }

  /* ————————————————— RELATÓRIOS ————————————————— */
  if (cap === "relatorios" && view === "exported") {
    return (
      <Shell cap={cap} title="Relatório de fechamento · junho" onAction={onAction}>
        <SuccessPill>Relatório gerado</SuccessPill>
        <FileRow name="fechamento-junho-2026.pdf" size="240 KB" />
        <FileRow name="fechamento-junho-2026.xlsx" size="86 KB" />
      </Shell>
    );
  }
  if (cap === "relatorios" && view === "checklist") {
    const itens = [
      "Extrato conciliado (7 de 7 linhas)",
      "Lançamentos revisados",
      "Retenções aplicadas (ISS + IRRF)",
      "DRE simplificada gerada",
    ];
    return (
      <Shell cap={cap} title="Checklist de fechamento · junho" actions={[ACTIONS.relatorios.exportar]} onAction={onAction}>
        <div className="space-y-2 mb-3">
          {itens.map((i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
              <span className="w-4 h-4 rounded-full bg-kgreen-50 text-kgreen-700 flex items-center justify-center shrink-0">
                <Check size={11} strokeWidth={3} />
              </span>
              {i}
            </div>
          ))}
        </div>
        <SuccessPill>Junho fechado · pronto para a contabilidade</SuccessPill>
      </Shell>
    );
  }
  // relatorios overview
  return (
    <Shell
      cap={cap}
      title="Fechamento de junho · resumo"
      actions={[ACTIONS.relatorios.exportar, ACTIONS.relatorios.fechar]}
      onAction={onAction}
    >
      <LineRow label="Entradas (junho)" sub="recebimentos no extrato" value={`+ ${brl(10200)}`} tone="green" />
      <LineRow label="Saídas (junho)" sub="pagamentos + tarifas" value={`− ${brl(22095)}`} tone="coral" />
      <LineRow label="Resultado do mês" value={`− ${brl(11895)}`} tone="coral" />
      <div className="mt-2 pt-2 border-t border-gray-200">
        <LineRow label="Saldo final em banco" sub="conciliado com o extrato" value={brl(12305)} tone="navy" />
      </div>
    </Shell>
  );
}

function FileRow({ name, size }: { name: string; size: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5 border-b border-gray-100 last:border-0">
      <span className="w-7 h-7 rounded-md bg-navy-50 text-navy-600 flex items-center justify-center shrink-0">
        <FileText size={15} strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-ink truncate">{name}</div>
        <div className="text-[10px] text-muted">{size}</div>
      </div>
      <span className="text-gray-400">
        <Download size={16} strokeWidth={2} />
      </span>
    </div>
  );
}
