import { caseByKey, extratoSeed, titulosSeed, brl, dataBR, type Autonomia } from "../data";

const badge: Record<Autonomia, { txt: string; bg: string; fg: string; dot: string; border: string }> = {
  age: {
    txt: "IA agiu sozinha",
    bg: "#e7f6ee",
    fg: "#05713f",
    dot: "#079455",
    border: "rgba(7,148,85,0.25)",
  },
  sugere: {
    txt: "IA sugere · confirme",
    bg: "#fef4e6",
    fg: "#b25e04",
    dot: "#f79009",
    border: "rgba(247,144,9,0.3)",
  },
  escala: {
    txt: "Decisão sua",
    bg: "#fdeceb",
    fg: "#b42318",
    dot: "#e02d20",
    border: "rgba(224,45,32,0.25)",
  },
};

export function CaseCard({
  caseKey,
  resolved,
  onResolve,
}: {
  caseKey: string;
  resolved: boolean;
  onResolve: (k: string) => void;
}) {
  const c = caseByKey(caseKey);
  const b = badge[c.autonomia];
  const ext = c.extratoId ? extratoSeed.find((e) => e.id === c.extratoId) : null;
  const tits = titulosSeed.filter((t) => c.titulos.includes(t.id));
  const confColor = c.confianca >= 90 ? "#079455" : c.confianca >= 80 ? "#f79009" : "#dd6b20";

  return (
    <div className="mt-1 rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden max-w-[540px]">
      {/* header */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-1.5">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap"
          style={{ background: b.bg, color: b.fg, borderColor: b.border }}
        >
          <span className="w-[7px] h-[7px] rounded-full" style={{ background: b.dot }} />
          {b.txt}
        </span>
        {c.confianca > 0 && (
          <span className="flex items-center gap-1.5 text-[11px] text-muted">
            confiança
            <span className="w-[60px] h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <span
                className="block h-full rounded-full"
                style={{ width: `${c.confianca}%`, background: confColor }}
              />
            </span>
            <b className="text-gray-900">{c.confianca}%</b>
          </span>
        )}
      </div>

      <div className="px-4">
        <div className="font-semibold text-sm text-ink">{c.titulo}</div>
      </div>

      {/* correspondência: extrato ↔ títulos */}
      <div className="px-4 py-3 flex items-stretch gap-2 text-xs">
        <div className="flex-1 rounded-md bg-gray-50 border border-gray-200 p-2.5">
          <div className="text-[10px] uppercase tracking-[0.04em] text-muted mb-1">Extrato</div>
          {ext ? (
            <>
              <div
                className={`font-semibold tabular-nums ${
                  ext.valor < 0 ? "text-coral-500" : "text-kgreen-600"
                }`}
              >
                {brl(ext.valor)}
              </div>
              <div className="text-muted">
                {dataBR(ext.data)} · {ext.historico}
              </div>
            </>
          ) : (
            <div className="text-muted italic">nenhuma linha no extrato</div>
          )}
        </div>
        <div className="flex items-center text-gray-300 font-bold">↔</div>
        <div className="flex-1 rounded-md bg-gray-50 border border-gray-200 p-2.5">
          <div className="text-[10px] uppercase tracking-[0.04em] text-muted mb-1">
            {tits.length > 1 ? `${tits.length} títulos` : "Título"}
          </div>
          {tits.length ? (
            tits.map((t) => (
              <div key={t.id} className="flex justify-between gap-2">
                <span className="text-ink">
                  <b>{t.id}</b> {t.contraparte.split(" ")[0]}
                </span>
                <span className="text-muted tabular-nums">{brl(t.valor)}</span>
              </div>
            ))
          ) : (
            <div className="text-muted italic">sem título — criar lançamento</div>
          )}
        </div>
      </div>

      {/* evidências */}
      <div className="px-4 pb-2 space-y-1">
        {c.evidencias.map((e, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs">
            <span
              className="font-bold leading-6"
              style={{ color: e.ok ? "#079455" : "#f79009", lineHeight: 1.5 }}
            >
              {e.ok ? "✓" : "!"}
            </span>
            <span className="text-gray-600">{e.label}</span>
          </div>
        ))}
      </div>

      {/* lançamento a criar */}
      {c.lancamento && (
        <div className="mx-4 mb-2 rounded-md bg-navy-50 border border-navy-100 p-2.5 text-xs">
          <div className="font-semibold text-navy-600 mb-1">
            Lançamento a criar — {c.lancamento.descricao}
          </div>
          {c.lancamento.linhas.map((l, i) => (
            <div key={i} className="flex justify-between text-gray-600">
              <span>{l.label}</span>
              <span className="font-semibold tabular-nums">{brl(l.valor)}</span>
            </div>
          ))}
        </div>
      )}

      {/* ação */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-2">
        {resolved ? (
          <span className="text-xs font-semibold text-kgreen-700 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-kgreen-50 text-kgreen-700 flex items-center justify-center text-[10px]">
              ✓
            </span>
            Resolvido · registrado na trilha
          </span>
        ) : (
          <button
            onClick={() => onResolve(caseKey)}
            className={`text-xs font-semibold px-3.5 py-2 rounded-md text-white transition-[filter] duration-120 hover:brightness-95 active:scale-[0.98] ${
              c.autonomia === "escala" ? "bg-navy-600" : "bg-kgreen-600"
            }`}
          >
            {c.acaoLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/** versão compacta usada quando o agente resolve em lote */
export function ResolvedNote({ caseKey }: { caseKey: string }) {
  const c = caseByKey(caseKey);
  return (
    <div
      className="mt-1 flex items-center gap-2 rounded-md bg-kgreen-50 px-3 py-2 text-xs max-w-[540px] border"
      style={{ borderColor: "rgba(7,148,85,0.3)" }}
    >
      <span className="w-4 h-4 rounded-full bg-kgreen-600 text-white flex items-center justify-center text-[10px] shrink-0">
        ✓
      </span>
      <span className="text-kgreen-700 font-semibold">{c.titulo}</span>
      <span className="text-kgreen-700/70 ml-auto">conciliado · reversível</span>
    </div>
  );
}
