import { brl } from "../data";
import type { Balances } from "../store";

function Stat({
  label,
  value,
  sub,
  tone = "ink",
  hint,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "ink" | "green" | "coral" | "navy";
  hint?: string;
}) {
  const color =
    tone === "green"
      ? "text-kgreen-600"
      : tone === "coral"
      ? "text-coral-500"
      : tone === "navy"
      ? "text-navy-600"
      : "text-ink";
  return (
    <div className="flex-1 min-w-[132px] px-4 py-2.5" title={hint}>
      <div className="text-[11px] uppercase tracking-[0.04em] text-muted">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${color}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted">{sub}</div>}
    </div>
  );
}

export function TopBalances({ b }: { b: Balances }) {
  const confie = b.conciliadoPct === 100;
  return (
    <div className="flex items-stretch flex-wrap divide-x divide-gray-200 bg-white border border-gray-200 rounded-lg shadow-xs">
      <Stat
        label="Saldo no banco"
        value={brl(b.banco)}
        sub="extrato de junho"
        tone="navy"
        hint="O que o banco diz — fixo."
      />
      <Stat
        label="Saldo interno"
        value={brl(b.interno)}
        sub={confie ? "bate com o banco ✓" : "ainda diverge"}
        tone={confie ? "green" : "coral"}
        hint="O que os livros mostram. Converge para o banco conforme você concilia."
      />
      <div className="flex-1 min-w-[160px] px-4 py-2.5">
        <div className="text-[11px] uppercase tracking-[0.04em] text-muted">Extrato conciliado</div>
        <div className="flex items-center gap-2">
          <span
            className={`text-lg font-bold tabular-nums ${confie ? "text-kgreen-600" : "text-navy-600"}`}
          >
            {b.conciliadoPct}%
          </span>
          <span className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
            <span
              className="block h-full rounded-full transition-all duration-700"
              style={{ width: `${b.conciliadoPct}%`, background: confie ? "#079455" : "#05508a" }}
            />
          </span>
        </div>
        <div className="text-[11px] text-muted">
          {b.linhasConciliadas} de {b.totalLinhas} linhas · métrica-mãe
        </div>
      </div>
      <Stat
        label="Pendências"
        value={String(b.pendencias)}
        sub={b.pendencias === 0 ? "fila zerada 🎯" : "aguardam decisão"}
        tone={b.pendencias === 0 ? "green" : "coral"}
        hint="Exceções ainda não resolvidas, incluindo recebíveis não realizados."
      />
    </div>
  );
}

export function MiniBalances({ b }: { b: Balances }) {
  const confie = b.conciliadoPct === 100;
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-xs p-3 grid grid-cols-2 gap-y-2 gap-x-5 text-sm max-w-[540px]">
      <Row label="Saldo no banco" value={brl(b.banco)} tone="navy" />
      <Row label="Saldo interno" value={brl(b.interno)} tone={confie ? "green" : "coral"} />
      <Row label="Extrato conciliado" value={`${b.conciliadoPct}%`} tone={confie ? "green" : "navy"} />
      <Row label="Pendências" value={String(b.pendencias)} tone={b.pendencias ? "coral" : "green"} />
    </div>
  );
}

function Row({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string;
  tone?: "ink" | "green" | "coral" | "navy";
}) {
  const color =
    tone === "green"
      ? "text-kgreen-600"
      : tone === "coral"
      ? "text-coral-500"
      : tone === "navy"
      ? "text-navy-600"
      : "text-ink";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted">{label}</span>
      <span className={`font-bold tabular-nums ${color}`}>{value}</span>
    </div>
  );
}
