/* Conciliação — peças compartilhadas de UI (md, badge de autonomia, saldos). */
const { Card } = window.KaminoDesignSystem_066e8e;
const { brl } = window.ConcData;

/** mini-markdown: **negrito** + quebras de linha, com bullets "• ". */
function md(text) {
  return String(text).split("\n").map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((seg, i) => {
      if (/^\*\*[^*]+\*\*$/.test(seg)) {
        return React.createElement("strong", { key: i, style: { fontWeight: 600, color: "var(--gray-900)" } }, seg.slice(2, -2));
      }
      return seg;
    });
    return React.createElement("div", { key: li, style: { minHeight: line === "" ? 8 : undefined } }, parts);
  });
}

const AUTONOMIA = {
  age:    { txt: "IA agiu sozinha",   dot: "var(--green-600)",  bg: "var(--green-050)",  fg: "var(--green-700)", border: "rgba(7,148,85,0.25)" },
  sugere: { txt: "IA sugere · confirme", dot: "var(--orange-500)", bg: "var(--orange-050)", fg: "#b25e04", border: "rgba(247,144,9,0.3)" },
  escala: { txt: "Decisão sua",       dot: "var(--red-600)",    bg: "var(--red-050)",    fg: "var(--red-700)", border: "rgba(224,45,32,0.25)" },
};

function AutonomyBadge({ autonomia }) {
  const a = AUTONOMIA[autonomia];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, border: `1px solid ${a.border}`, background: a.bg, color: a.fg, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: a.dot }}></span>
      {a.txt}
    </span>
  );
}

function ConfidenceBar({ value }) {
  if (!value) return null;
  const color = value >= 90 ? "var(--green-600)" : value >= 80 ? "var(--orange-500)" : "#dd6b20";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
      confiança
      <span style={{ width: 60, height: 6, borderRadius: 999, background: "var(--gray-200)", overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", width: `${value}%`, background: color, borderRadius: 999 }}></span>
      </span>
      <b style={{ color: "var(--gray-900)" }}>{value}%</b>
    </span>
  );
}

/** Faixa de saldos no topo da área de conciliação. */
function TopBalances({ b }) {
  const confie = b.conciliadoPct === 100;
  const Stat = ({ label, value, sub, tone }) => {
    const color = tone === "green" ? "var(--green-600)" : tone === "red" ? "var(--red-600)" : tone === "navy" ? "var(--kamino-navy)" : "var(--kamino-ink)";
    return (
      <div style={{ flex: 1, minWidth: 132, padding: "10px 16px" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)" }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>}
      </div>
    );
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", background: "var(--white)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xs)", overflow: "hidden" }}>
      <Stat label="Saldo no banco" value={brl(b.banco)} sub="extrato de junho" tone="navy" />
      <div style={{ borderLeft: "1px solid var(--border-subtle)" }}></div>
      <Stat label="Saldo interno" value={brl(b.interno)} sub={confie ? "bate com o banco ✓" : "ainda diverge"} tone={confie ? "green" : "red"} />
      <div style={{ borderLeft: "1px solid var(--border-subtle)" }}></div>
      <div style={{ flex: 1, minWidth: 160, padding: "10px 16px" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)" }}>Extrato conciliado</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: confie ? "var(--green-600)" : "var(--kamino-navy)", fontVariantNumeric: "tabular-nums" }}>{b.conciliadoPct}%</span>
          <span style={{ flex: 1, height: 8, borderRadius: 999, background: "var(--gray-100)", overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", borderRadius: 999, width: `${b.conciliadoPct}%`, background: confie ? "var(--green-600)" : "var(--kamino-navy)", transition: "width 700ms ease" }}></span>
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.linhasConciliadas} de {b.totalLinhas} linhas · métrica-mãe</div>
      </div>
      <div style={{ borderLeft: "1px solid var(--border-subtle)" }}></div>
      <Stat label="Pendências" value={String(b.pendencias)} sub={b.pendencias === 0 ? "fila zerada 🎯" : "aguardam decisão"} tone={b.pendencias === 0 ? "green" : "red"} />
    </div>
  );
}

function MiniBalances({ b }) {
  const confie = b.conciliadoPct === 100;
  const Row = ({ label, value, tone }) => {
    const color = tone === "green" ? "var(--green-600)" : tone === "red" ? "var(--red-600)" : tone === "navy" ? "var(--kamino-navy)" : "var(--kamino-ink)";
    return (
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
        <span style={{ fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      </div>
    );
  };
  return (
    <div style={{ maxWidth: 540 }}>
      <Card padding="12px 14px" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", fontSize: 14 }}>
        <Row label="Saldo no banco" value={brl(b.banco)} tone="navy" />
        <Row label="Saldo interno" value={brl(b.interno)} tone={confie ? "green" : "red"} />
        <Row label="Extrato conciliado" value={`${b.conciliadoPct}%`} tone={confie ? "green" : "navy"} />
        <Row label="Pendências" value={String(b.pendencias)} tone={b.pendencias ? "red" : "green"} />
      </Card>
    </div>
  );
}

window.ConcUI = Object.assign(window.ConcUI || {}, { md, AutonomyBadge, ConfidenceBar, TopBalances, MiniBalances, AUTONOMIA });
