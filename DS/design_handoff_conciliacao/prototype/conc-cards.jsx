/* Conciliação — card de caso (extrato ↔ títulos + evidências + ação) e nota compacta. */
const { Button } = window.KaminoDesignSystem_066e8e;
const { caseByKey, extratoById, titulosSeed, brl, dataBR } = window.ConcData;

function CaseCardView({ caseKey, resolved, onResolve }) {
  const c = caseByKey(caseKey);
  const { AutonomyBadge, ConfidenceBar } = window.ConcUI;
  const ext = c.extratoId ? extratoById(c.extratoId) : null;
  const tits = titulosSeed.filter((t) => c.titulos.includes(t.id));

  const box = { flex: 1, borderRadius: "var(--radius-md)", background: "var(--gray-050)", border: "1px solid var(--border-subtle)", padding: 10 };
  const boxLabel = { fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)", marginBottom: 4 };

  return (
    <div style={{ marginTop: 4, maxWidth: 540, background: "var(--white)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "12px 16px 6px" }}>
        <AutonomyBadge autonomia={c.autonomia} />
        <ConfidenceBar value={c.confianca} />
      </div>
      <div style={{ padding: "0 16px", fontSize: 14, fontWeight: 600, color: "var(--kamino-ink)" }}>{c.titulo}</div>

      <div style={{ padding: "12px 16px", display: "flex", alignItems: "stretch", gap: 8, fontSize: 12 }}>
        <div style={box}>
          <div style={boxLabel}>Extrato</div>
          {ext ? (
            <>
              <div style={{ fontWeight: 600, color: ext.valor < 0 ? "var(--red-600)" : "var(--green-600)", fontVariantNumeric: "tabular-nums" }}>{brl(ext.valor)}</div>
              <div style={{ color: "var(--text-muted)" }}>{dataBR(ext.data)} · {ext.historico}</div>
            </>
          ) : (
            <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>nenhuma linha no extrato</div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", color: "var(--gray-300)", fontWeight: 700 }}>↔</div>
        <div style={box}>
          <div style={boxLabel}>{tits.length > 1 ? `${tits.length} títulos` : "Título"}</div>
          {tits.length ? tits.map((t) => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span style={{ color: "var(--kamino-ink)" }}><b>{t.id}</b> {t.contraparte.split(" ")[0]}</span>
              <span style={{ color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{brl(t.valor)}</span>
            </div>
          )) : (
            <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>sem título — criar lançamento</div>
          )}
        </div>
      </div>

      <div style={{ padding: "0 16px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
        {c.evidencias.map((e, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12 }}>
            <span style={{ color: e.ok ? "var(--green-600)" : "var(--orange-500)", fontWeight: 700, lineHeight: 1.5 }}>{e.ok ? "✓" : "!"}</span>
            <span style={{ color: "var(--gray-600)" }}>{e.label}</span>
          </div>
        ))}
      </div>

      {c.lancamento && (
        <div style={{ margin: "0 16px 8px", borderRadius: "var(--radius-md)", background: "var(--kamino-navy-050)", border: "1px solid var(--kamino-navy-100)", padding: 10, fontSize: 12 }}>
          <div style={{ fontWeight: 600, color: "var(--kamino-navy)", marginBottom: 4 }}>Lançamento a criar — {c.lancamento.descricao}</div>
          {c.lancamento.linhas.map((l, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", color: "var(--gray-600)" }}>
              <span>{l.label}</span><span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{brl(l.valor)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
        {resolved ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--green-700)" }}>
            <span style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--green-050)", color: "var(--green-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✓</span>
            Resolvido · registrado na trilha
          </span>
        ) : (
          <Button size="sm" variant={c.autonomia === "escala" ? "primary" : "success"} onClick={() => onResolve(caseKey)}>{c.acaoLabel}</Button>
        )}
      </div>
    </div>
  );
}

function ResolvedNote({ caseKey }) {
  const c = caseByKey(caseKey);
  return (
    <div style={{ marginTop: 4, maxWidth: 540, display: "flex", alignItems: "center", gap: 8, borderRadius: "var(--radius-md)", border: "1px solid rgba(7,148,85,0.3)", background: "var(--green-050)", padding: "8px 12px", fontSize: 12 }}>
      <span style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--green-600)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }}>✓</span>
      <span style={{ color: "var(--green-700)", fontWeight: 600 }}>{c.titulo}</span>
      <span style={{ color: "rgba(5,113,63,0.7)", marginLeft: "auto" }}>conciliado · reversível</span>
    </div>
  );
}

window.ConcUI = Object.assign(window.ConcUI || {}, { CaseCardView, ResolvedNote });
