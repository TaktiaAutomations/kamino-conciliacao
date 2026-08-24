/* Conciliação — painel lateral: Fila (pendências + conciliados) e Trilha de auditoria. */
const { cases, chipForCase, extratoById, brl } = window.ConcData;

const caseValor = (key) => {
  const c = cases.find((x) => x.key === key);
  if (c && c.extratoId) return (extratoById(c.extratoId) || {}).valor || 0;
  return 0;
};
const DOT = { age: "var(--green-600)", sugere: "var(--orange-500)", escala: "var(--red-600)" };
const hora = (ts) => new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

function QueuePanel({ resolvedSet, audit, onChip, onUndo }) {
  const [tab, setTab] = React.useState("fila");
  const pend = cases.filter((c) => c.kind !== "exato" && !resolvedSet.has(c.key));
  const done = cases.filter((c) => resolvedSet.has(c.key));

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      flex: 1, padding: "6px 0", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer",
      fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
      background: tab === id ? "var(--white)" : "transparent", color: tab === id ? "var(--kamino-ink)" : "var(--text-muted)",
      boxShadow: tab === id ? "var(--shadow-xs)" : "none",
    }}>{label}</button>
  );

  const sectionLabel = (t) => (
    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)", fontWeight: 600, marginBottom: 8 }}>{t}</div>
  );

  return (
    <aside style={{ width: 320, flexShrink: 0, borderLeft: "1px solid var(--border-subtle)", background: "var(--white)", display: "flex", flexDirection: "column", height: "100%", fontFamily: "var(--font-sans)" }}>
      <div style={{ padding: 12, borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", gap: 4, background: "var(--gray-100)", borderRadius: "var(--radius-md)", padding: 3 }}>
          {tabBtn("fila", `Fila (${pend.length})`)}
          {tabBtn("trilha", `Trilha (${audit.length})`)}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {tab === "fila" ? (
          <>
            {sectionLabel("Precisam de decisão")}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
              {pend.length === 0 && (
                <div style={{ fontSize: 12, color: "var(--green-700)", background: "var(--green-050)", border: "1px solid rgba(7,148,85,0.3)", borderRadius: "var(--radius-md)", padding: 12, textAlign: "center", fontWeight: 600 }}>🎯 Fila zerada — extrato 100% explicado.</div>
              )}
              {pend.map((c) => (
                <button key={c.key} onClick={() => onChip(chipForCase[c.key] || c.titulo)} style={{ textAlign: "left", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--white)", cursor: "pointer", padding: 10, fontFamily: "var(--font-sans)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gray-050)"; e.currentTarget.style.borderColor = "var(--kamino-navy-100)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--white)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: DOT[c.autonomia], flexShrink: 0 }}></span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--kamino-ink)", flex: 1, lineHeight: 1.3 }}>{c.titulo.split(" — ")[0]}</span>
                    {caseValor(c.key) !== 0 && <span style={{ fontSize: 11, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{brl(caseValor(c.key))}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, paddingLeft: 16 }}>{c.titulo.split(" — ")[1] || "abrir no chat →"}</div>
                </button>
              ))}
            </div>

            {done.length > 0 && sectionLabel("Conciliados")}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {done.map((c) => (
                <div key={c.key} className="conc-done-row" style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "rgba(249,250,251,0.6)", padding: "8px 10px" }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--green-050)", color: "var(--green-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 12, color: "var(--gray-600)", flex: 1, lineHeight: 1.3 }}>{c.titulo.split(" — ")[0]}</span>
                  <button className="conc-undo" onClick={() => onUndo(c.key)} style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--red-600)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}>Desfazer</button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {audit.map((a) => (
              <div key={a.id} style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", padding: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: a.automatica ? "var(--green-050)" : "var(--kamino-navy-050)", color: a.automatica ? "var(--green-700)" : "var(--kamino-navy)" }}>{a.automatica ? "IA" : "Humano"}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.autor}</span>
                  <span style={{ fontSize: 10, color: "var(--gray-400)", marginLeft: "auto" }}>{hora(a.ts)}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--gray-700)", lineHeight: 1.3 }}>{a.acao}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.3 }}>{a.evidencia}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: 12, borderTop: "1px solid var(--border-subtle)", fontSize: 10, color: "var(--text-muted)", display: "flex", gap: 12 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green-600)" }}></span> age</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange-500)" }}></span> sugere</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red-600)" }}></span> escala</span>
      </div>
    </aside>
  );
}

window.ConcUI = Object.assign(window.ConcUI || {}, { QueuePanel });
