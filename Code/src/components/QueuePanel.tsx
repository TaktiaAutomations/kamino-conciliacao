import { useState } from "react";
import { cases, brl, chipForCase, extratoSeed, type Autonomia } from "../data";
import type { AuditEntry } from "../store";

const dot: Record<Autonomia, string> = {
  age: "#079455",
  sugere: "#f79009",
  escala: "#e02d20",
};

const caseValor = (key: string) => {
  const c = cases.find((x) => x.key === key)!;
  if (c.extratoId) return extratoSeed.find((e) => e.id === c.extratoId)?.valor ?? 0;
  return 0;
};

export function QueuePanel({
  resolvedSet,
  audit,
  onChip,
  onUndo,
}: {
  resolvedSet: Set<string>;
  audit: AuditEntry[];
  onChip: (t: string) => void;
  onUndo: (k: string) => void;
}) {
  const [tab, setTab] = useState<"fila" | "trilha">("fila");

  const pend = cases.filter((c) => c.kind !== "exato" && !resolvedSet.has(c.key));
  const done = cases.filter((c) => resolvedSet.has(c.key));

  return (
    <aside className="w-[320px] shrink-0 border-l border-gray-200 bg-white flex flex-col h-full">
      <div className="p-3 border-b border-gray-200">
        <div className="flex gap-1 bg-gray-100 rounded-md p-[3px] text-xs font-semibold">
          <button
            onClick={() => setTab("fila")}
            className={`flex-1 py-1.5 rounded transition ${
              tab === "fila" ? "bg-white shadow-xs text-ink" : "text-muted"
            }`}
          >
            Fila ({pend.length})
          </button>
          <button
            onClick={() => setTab("trilha")}
            className={`flex-1 py-1.5 rounded transition ${
              tab === "trilha" ? "bg-white shadow-xs text-ink" : "text-muted"
            }`}
          >
            Trilha ({audit.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {tab === "fila" ? (
          <>
            <Section title="Precisam de decisão" count={pend.length}>
              {pend.length === 0 && (
                <div
                  className="text-xs text-kgreen-700 bg-kgreen-50 rounded-md p-3 text-center font-semibold border"
                  style={{ borderColor: "rgba(7,148,85,0.3)" }}
                >
                  🎯 Fila zerada — extrato 100% explicado.
                </div>
              )}
              {pend.map((c) => (
                <button
                  key={c.key}
                  onClick={() => onChip(chipForCase[c.key] ?? c.titulo)}
                  className="w-full text-left rounded-md border border-gray-300 hover:border-navy-100 hover:bg-gray-50 transition p-2.5 group"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: dot[c.autonomia] }}
                    />
                    <span className="text-xs font-semibold text-ink flex-1 leading-tight">
                      {c.titulo.split(" — ")[0]}
                    </span>
                    {caseValor(c.key) !== 0 && (
                      <span className="text-[11px] text-muted tabular-nums">
                        {brl(caseValor(c.key))}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted mt-1 pl-4 group-hover:text-navy-600">
                    {c.titulo.split(" — ")[1] ?? "abrir no chat →"}
                  </div>
                </button>
              ))}
            </Section>

            <Section title="Conciliados" count={done.length}>
              {done.map((c) => (
                <div
                  key={c.key}
                  className="flex items-center gap-2 rounded-md border border-gray-200 px-2.5 py-2 group"
                  style={{ background: "rgba(249,250,251,0.6)" }}
                >
                  <span className="w-4 h-4 rounded-full bg-kgreen-50 text-kgreen-700 flex items-center justify-center text-[9px] shrink-0">
                    ✓
                  </span>
                  <span className="text-xs text-gray-600 flex-1 leading-tight">
                    {c.titulo.split(" — ")[0]}
                  </span>
                  <button
                    onClick={() => onUndo(c.key)}
                    className="text-[10px] font-semibold text-muted opacity-0 group-hover:opacity-100 hover:text-coral-500 transition"
                  >
                    Desfazer
                  </button>
                </div>
              ))}
            </Section>
          </>
        ) : (
          <div className="space-y-2">
            {audit.map((a) => (
              <div key={a.id} className="rounded-md border border-gray-200 p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      a.automatica
                        ? "bg-kgreen-50 text-kgreen-700"
                        : "bg-navy-50 text-navy-600"
                    }`}
                  >
                    {a.automatica ? "IA" : "Humano"}
                  </span>
                  <span className="text-[11px] text-muted">{a.autor}</span>
                  <span className="text-[10px] text-gray-400 ml-auto">{hora(a.ts)}</span>
                </div>
                <div className="text-xs text-gray-700 leading-tight">{a.acao}</div>
                <div className="text-[11px] text-muted mt-1 leading-tight">{a.evidencia}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 text-[10px] text-muted flex gap-3">
        <Legend color="#079455" label="age" />
        <Legend color="#f79009" label="sugere" />
        <Legend color="#e02d20" label="escala" />
      </div>
    </aside>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0 && title === "Conciliados") return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.04em] text-muted font-semibold mb-2">
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function hora(ts: number) {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
