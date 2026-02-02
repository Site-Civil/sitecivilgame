import React from "react";

export const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, rgba(0,0,0,0.06), transparent 60%)",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    color: "#111",
  },
  wrap: { maxWidth: 1040, margin: "0 auto", padding: "28px 16px" },
  headerRow: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  h1: { fontSize: 28, fontWeight: 900, letterSpacing: -0.4 },

  card: {
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 18,
    background: "white",
    boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: 14,
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  cardBody: { padding: 14 },

  panel: {
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 14,
    padding: 12,
    background: "rgba(0,0,0,0.02)",
  },

  pill: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(0,0,0,0.03)",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  option: {
    width: "100%",
    textAlign: "left",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    padding: 14,
    background: "white",
    cursor: "pointer",
    boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
  },

  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "#111",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "8px 12px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  notice: {
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 14,
    padding: 12,
    background: "rgba(0,0,0,0.04)",
  },

  barWrap: { height: 10, borderRadius: 999, background: "rgba(0,0,0,0.1)", overflow: "hidden" },
  barFill: { height: 10, borderRadius: 999, background: "rgba(0,0,0,0.65)" },

  twoCol: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 },
};

export function Card({ title, right, children }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={{ fontWeight: 800 }}>{title}</div>
        {right}
      </div>
      <div style={styles.cardBody}>{children}</div>
    </div>
  );
}

export function Pill({ children }) {
  return <span style={styles.pill}>{children}</span>;
}

export function ScoreBar({ label, value }) {
  const pct = Math.round(((value + 50) / 150) * 100);
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
        <span style={{ opacity: 0.75 }}>{label}</span>
        <span style={{ fontWeight: 700 }}>{value}</span>
      </div>
      <div style={styles.barWrap}>
        <div style={{ ...styles.barFill, width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function OptionCard({ option, onChoose }) {
  return (
    <button onClick={onChoose} style={styles.option}>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 800 }}>{option.title}</div>
        <div style={{ opacity: 0.78, fontSize: 14, lineHeight: 1.35 }}>{option.description}</div>
        {option.flags?.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {option.flags.map((f) => (
              <Pill key={f}>{f.replaceAll("_", " ")}</Pill>
            ))}
          </div>
        ) : null}
      </div>
    </button>
  );
}
