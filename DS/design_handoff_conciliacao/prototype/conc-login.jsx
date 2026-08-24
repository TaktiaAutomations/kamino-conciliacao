/* Conciliação — tela de login: escolha de persona (dona × analista). */
const { personas } = window.ConcData;

function Login({ onPick }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, var(--kamino-navy-050), #eef2f7)", padding: 24, fontFamily: "var(--font-sans)" }}>
      <div style={{ width: "100%", maxWidth: 720 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 8 }}>
          <img src="../../assets/kamino-icon.png" alt="Kamino" style={{ width: 40, height: 36, objectFit: "contain", borderRadius: 8 }} />
          <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--kamino-navy)" }}>Kamino</span>
        </div>
        <p style={{ textAlign: "center", color: "var(--text-muted)", margin: "0 0 2px" }}>Conciliação assistida por agente</p>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--gray-400)", margin: "0 0 32px" }}>Acme Serviços · fechamento de junho · protótipo funcional do case</p>

        <div style={{ textAlign: "center", marginBottom: 16, fontSize: 14, fontWeight: 600, color: "var(--kamino-ink)" }}>Quem está entrando?</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {Object.keys(personas).map((id) => {
            const p = personas[id];
            return (
              <button key={id} onClick={() => onPick(id)} style={{
                textAlign: "left", background: "var(--white)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-default)",
                padding: 20, cursor: "pointer", transition: "border-color 120ms, box-shadow 120ms", fontFamily: "var(--font-sans)",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--kamino-navy)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ width: 44, height: 44, borderRadius: "50%", background: p.cor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14, flexShrink: 0 }}>{p.iniciais}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--kamino-ink)", lineHeight: 1.25 }}>{p.nome}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.cargo}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "var(--gray-600)", fontStyle: "italic", margin: "0 0 12px" }}>“{p.objetivo}”</p>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--kamino-navy)" }}>Entrar como {id === "dona" ? "a dona" : "o analista"} →</div>
              </button>
            );
          })}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--gray-400)", marginTop: 32, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          Mesma engine, mesmos dados — o agente muda o tom e <b>quais ações expõe</b> conforme quem está do outro lado. Você pode trocar de persona a qualquer momento.
        </p>
      </div>
    </div>
  );
}

window.ConcUI = Object.assign(window.ConcUI || {}, { Login });
