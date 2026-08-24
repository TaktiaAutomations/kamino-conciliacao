/* Conciliação — mensagens do chat + composer (input, chips rápidos). */
const QUICK_CHIPS = [
  "Concilia tudo ≥ 90%", "Mostra o lote", "Por que a Gama veio menor?",
  "E a tarifa de R$ 45?", "E a Sigma que não caiu?",
];

function MessageView({ m, balances, resolvedSet, onResolve, onChip }) {
  const { md, CaseCardView, ResolvedNote, MiniBalances } = window.ConcUI;
  const isUser = m.role === "user";

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }} className="conc-in">
        <div style={{ maxWidth: "78%", borderRadius: "16px 16px 4px 16px", background: "var(--kamino-navy)", color: "#fff", padding: "10px 14px", fontSize: 14, boxShadow: "var(--shadow-xs)" }}>{m.text}</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12 }} className="conc-in">
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--white)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "var(--shadow-xs)", overflow: "hidden" }}>
        <img src="../../assets/kamino-icon.png" alt="" style={{ width: 20, height: 18, objectFit: "contain" }} />
      </div>
      <div style={{ maxWidth: "82%", display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        {m.pending ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, borderRadius: "16px 16px 16px 4px", background: "var(--white)", border: "1px solid var(--border-default)", padding: "12px 16px", boxShadow: "var(--shadow-xs)", width: "fit-content" }}>
            {[0, 1, 2].map((i) => <span key={i} className="conc-typing" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gray-400)", animationDelay: `${i * 0.2}s` }}></span>)}
          </div>
        ) : (
          <>
            {m.text && (
              <div style={{ borderRadius: "16px 16px 16px 4px", background: "var(--white)", border: "1px solid var(--border-default)", padding: "10px 14px", fontSize: 14, color: "var(--gray-700)", lineHeight: 1.55, boxShadow: "var(--shadow-xs)" }}>{md(m.text)}</div>
            )}
            {m.card && m.card.kind === "case" && <CaseCardView caseKey={m.card.caseKey} resolved={resolvedSet.has(m.card.caseKey)} onResolve={onResolve} />}
            {m.card && m.card.kind === "resolvedNote" && <ResolvedNote caseKey={m.card.caseKey} />}
            {m.card && m.card.kind === "balances" && <MiniBalances b={balances} />}
            {m.chips && m.chips.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 2 }}>
                {m.chips.map((c, i) => (
                  <button key={i} onClick={() => onChip(c)} style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 999, border: "1px solid var(--kamino-navy-100)", background: "var(--kamino-navy-050)", color: "var(--kamino-navy)", cursor: "pointer", fontFamily: "var(--font-sans)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--kamino-navy-100)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--kamino-navy-050)"; }}>{c}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Chat({ messages, persona, balances, resolvedSet, onSend, onResolve }) {
  const [text, setText] = React.useState("");
  const endRef = React.useRef(null);
  React.useEffect(() => { if (endRef.current) endRef.current.parentNode.scrollTop = endRef.current.parentNode.scrollHeight; }, [messages]);

  const submit = (value) => {
    const v = (value != null ? value : text).trim();
    if (!v) return;
    onSend(v);
    setText("");
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", background: "var(--gray-050)", minWidth: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((m) => (
            <MessageView key={m.id} m={m} balances={balances} resolvedSet={resolvedSet} onResolve={onResolve} onChip={submit} />
          ))}
          <div ref={endRef}></div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)", padding: "12px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8 }}>
            {QUICK_CHIPS.map((c) => (
              <button key={c} onClick={() => submit(c)} style={{ whiteSpace: "nowrap", fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--white)", color: "var(--gray-600)", cursor: "pointer", fontFamily: "var(--font-sans)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--kamino-navy-100)"; e.currentTarget.style.background = "var(--kamino-navy-050)"; e.currentTarget.style.color = "var(--kamino-navy)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.background = "var(--white)"; e.currentTarget.style.color = "var(--gray-600)"; }}>{c}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
              placeholder={persona.id === "dona" ? "Pergunte em linguagem natural… ex.: “posso confiar no meu saldo?”" : "Comande… ex.: “concilia tudo ≥ 90%” ou “zera a fila”"}
              style={{ flex: 1, resize: "none", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)", padding: "10px 14px", fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--gray-900)", outline: "none", maxHeight: 128 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--border-focus)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--focus-ring)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.boxShadow = "none"; }} />
            <button onClick={() => submit()} disabled={!text.trim()} style={{ flexShrink: 0, height: 42, padding: "0 18px", borderRadius: "var(--radius-lg)", background: "var(--kamino-navy)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-sans)", cursor: text.trim() ? "pointer" : "not-allowed", opacity: text.trim() ? 1 : 0.4 }}>Enviar</button>
          </div>
          <div style={{ fontSize: 10, color: "var(--gray-400)", marginTop: 6, textAlign: "center" }}>
            O agente concilia o exato, sugere o ambíguo e escala o que cria fato financeiro. Toda ação é reversível e auditável.
          </div>
        </div>
      </div>
    </div>
  );
}

window.ConcUI = Object.assign(window.ConcUI || {}, { MessageView, Chat });
