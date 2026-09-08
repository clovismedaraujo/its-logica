import ProfBar from "./ProfBar";
import { TOPICS, LEVEL_COLORS } from "../data/topics";
import { isUnlocked, UNLOCK_THRESHOLD, getMisconceptions } from "../logic/model";
import { getStreak } from "../logic/streak";
import type { Model, HistoryEntry } from "../types";

interface Props {
  model: Model;
  history: HistoryEntry[];
}

export default function StatsView({ model, history }: Props) {
  const misconceptions = getMisconceptions(history);
  const total = history.length;
  const corretas = history.filter(h => h.correct).length;
  const taxa = total > 0 ? Math.round((corretas / total) * 100) : 0;
  const avgProf = Math.round(Object.values(model).reduce((a, b) => a + b, 0) / TOPICS.length);
  const streak = getStreak(history);

  const stats = [
    { label: "Questões respondidas", value: String(total), icon: "ti-clipboard-list" },
    { label: "Taxa de acerto", value: taxa + "%", icon: "ti-target" },
    { label: "Proficiência média", value: avgProf + "%", icon: "ti-trending-up" },
    { label: "Melhor sequência", value: `🔥 ${streak.best}`, icon: "ti-flame" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
        {stats.map(({ label, value, icon }) => (
          <div key={label} className="card" style={{ padding: "16px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <i className={`ti ${icon}`} style={{ fontSize: 16, color: "var(--accent)" }} aria-hidden />
              <span style={{ fontSize: 11, color: "var(--text)" }}>{label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-h)", letterSpacing: "-0.5px" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Topic proficiency */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px", color: "var(--text-h)" }}>
          Proficiência por tópico
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1, 2, 3, 4, 5].map(level => {
            const levelTopics = TOPICS.filter(t => t.level === level);
            const col = LEVEL_COLORS[level];
            return (
              <div key={level}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: col.text,
                  background: col.bg, border: `1px solid ${col.border}`,
                  display: "inline-block", padding: "2px 8px", borderRadius: 5,
                  marginBottom: 8,
                }}>
                  {col.label}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {levelTopics.map(t => {
                    const unlocked = isUnlocked(t.id, model);
                    const prof = model[t.id] ?? 0;
                    return (
                      <div key={t.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: "var(--text-h)", fontWeight: unlocked ? 400 : 300 }}>
                            {t.label}
                          </span>
                          {!unlocked && (
                            <span style={{ fontSize: 11, color: "var(--text)", display: "flex", alignItems: "center", gap: 3 }}>
                              <i className="ti ti-lock" style={{ fontSize: 11 }} aria-hidden />
                              bloqueado
                            </span>
                          )}
                          {unlocked && prof >= UNLOCK_THRESHOLD && (
                            <span style={{ fontSize: 11, color: "#1D9E75", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                              <i className="ti ti-check" style={{ fontSize: 12 }} aria-hidden />
                              dominado
                            </span>
                          )}
                        </div>
                        <ProfBar value={prof} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equívocos frequentes */}
      {misconceptions.length > 0 && (
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 16, color: "#BA7517" }} aria-hidden />
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-h)" }}>Equívocos frequentes</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {misconceptions.map((m, i) => (
              <div key={i} style={{
                padding: "10px 12px", borderRadius: 8,
                background: "#fffbeb", border: "1px solid #fde68a",
              }}>
                <div style={{ fontSize: 12, color: "#92400e", fontWeight: 600, marginBottom: 4 }}>
                  Errado {m.count}× · {TOPICS.find(t => t.id === m.topicId)?.label}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-h)", marginBottom: 6 }}>
                  {m.questionText}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ fontSize: 12, color: "#dc2626", display: "flex", gap: 6 }}>
                    <i className="ti ti-x" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden />
                    <span>Você escolheu: <strong>{m.chosenText}</strong></span>
                  </div>
                  <div style={{ fontSize: 12, color: "#1D9E75", display: "flex", gap: 6 }}>
                    <i className="ti ti-check" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden />
                    <span>Correto: <strong>{m.correctText}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text)" }}>
          <i className="ti ti-player-play" style={{ fontSize: 32, opacity: 0.3, display: "block", marginBottom: 8 }} aria-hidden />
          <p style={{ fontSize: 14 }}>Nenhuma questão respondida ainda. Vá para <strong>Praticar</strong> para começar.</p>
        </div>
      )}
    </div>
  );
}
