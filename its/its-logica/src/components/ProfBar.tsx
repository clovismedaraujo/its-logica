interface Props {
  value: number;
}

export default function ProfBar({ value }: Props) {
  const pct = Math.round(value);
  const color = pct >= 90 ? "#1D9E75" : pct >= 70 ? "#378ADD" : pct >= 40 ? "#BA7517" : "#888780";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#e5e4e7", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: color, borderRadius: 3, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, minWidth: 32, color: "#6b6375" }}>{pct}%</span>
    </div>
  );
}
