import { TOPICS, LEVEL_COLORS } from "../data/topics";
import { isUnlocked, UNLOCK_THRESHOLD } from "../logic/model";
import ProfBar from "./ProfBar";
import type { Model } from "../types";

interface Props {
  model: Model;
  onSelect: (id: string) => void;
}

const LEVEL_ICONS: Record<number, string> = {
  1: "ti-box", 2: "ti-settings", 3: "ti-git-branch", 4: "ti-repeat", 5: "ti-rocket",
};

const REL_STYLE = {
  usa_conceito: { color: "#7c3aed", label: "usa" },
  relacionado:  { color: "#0891b2", label: "rel." },
};

export default function MapView({ model, onSelect }: Props) {
  const levelGroups = [1, 2, 3, 4, 5].map(level => ({
    level, col: LEVEL_COLORS[level],
    topics: TOPICS.filter(t => t.level === level),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {levelGroups.map(({ level, col, topics }, groupIdx) => (
        <div key={level}>
          {/* Level header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px",
            background: col.bg,
            border: `1px solid ${col.border}`,
            borderRadius: groupIdx === 0 ? "10px 10px 0 0" : 0,
            borderBottom: "none",
          }}>
            <i className={`ti ${LEVEL_ICONS[level]}`} style={{ fontSize: 15, color: col.text }} aria-hidden />
            <span style={{ fontSize: 13, fontWeight: 600, color: col.text }}>{col.label}</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: col.text, opacity: 0.7 }}>
              {topics.filter(t => (model[t.id] ?? 0) >= UNLOCK_THRESHOLD).length}/{topics.length} dominados
            </span>
          </div>

          {/* Topic cards */}
          <div style={{
            border: `1px solid ${col.border}`, borderTop: "none",
            borderRadius: groupIdx === levelGroups.length - 1 ? "0 0 10px 10px" : 0,
            padding: "12px", background: "var(--bg-card)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 10,
          }}>
            {topics.map(t => {
              const unlocked = isUnlocked(t.id, model);
              const prof = model[t.id] ?? 0;
              const mastered = prof >= UNLOCK_THRESHOLD;
              const missingDeps = t.deps.filter(dep => (model[dep] ?? 0) < UNLOCK_THRESHOLD);

              // Relações semânticas não-obrigatórias para exibir
              const semanticRels = t.relations.filter(r => r.type === "usa_conceito" || r.type === "relacionado");

              return (
                <div
                  key={t.id}
                  onClick={() => unlocked && onSelect(t.id)}
                  className={unlocked ? "card card-clickable" : "card"}
                  style={{ padding: "12px 14px", opacity: unlocked ? 1 : 0.55, position: "relative", overflow: "hidden" }}
                >
                  {/* Ribbon dominado */}
                  {mastered && (
                    <div style={{
                      position: "absolute", top: 0, right: 0,
                      background: "#1D9E75", color: "#fff",
                      fontSize: 10, fontWeight: 600, padding: "2px 8px",
                      borderRadius: "0 var(--radius) 0 6px", letterSpacing: 0.5,
                    }}>
                      DOMINADO
                    </div>
                  )}

                  {/* Cabeçalho do card */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: unlocked ? col.bg : "var(--code-bg)",
                      border: `1px solid ${unlocked ? col.border : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {unlocked
                        ? <i className="ti ti-books" style={{ fontSize: 16, color: col.text }} aria-hidden />
                        : <i className="ti ti-lock" style={{ fontSize: 15, color: "var(--text)" }} aria-hidden />}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-h)", lineHeight: 1.3 }}>
                        {t.label}
                      </div>
                      {unlocked && (
                        <div style={{ fontSize: 11, color: "var(--text)", marginTop: 1 }}>
                          {prof >= 90 ? "Avançado" : prof >= 40 ? "Intermediário" : "Iniciante"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barra de proficiência ou deps faltando */}
                  {unlocked ? (
                    <ProfBar value={prof} />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {missingDeps.map(dep => {
                        const depTopic = TOPICS.find(d => d.id === dep)!;
                        const depProf = model[dep] ?? 0;
                        return (
                          <div key={dep} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text)" }}>
                            <span style={{
                              width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                              background: depProf > 0 ? "#BA7517" : "var(--border)",
                            }} />
                            <span style={{ flex: 1 }}>{depTopic.label}</span>
                            <span style={{ fontWeight: 500, color: depProf > 0 ? "#BA7517" : "var(--text)" }}>
                              {Math.round(depProf)}%
                            </span>
                          </div>
                        );
                      })}
                      <div style={{ fontSize: 10, color: "var(--text)", marginTop: 2, opacity: 0.7 }}>
                        Requer {UNLOCK_THRESHOLD}% em cada pré-requisito
                      </div>
                    </div>
                  )}

                  {/* Rede Semântica — relações usa_conceito / relacionado */}
                  {unlocked && semanticRels.length > 0 && (
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {semanticRels.map(rel => {
                        const relTopic = TOPICS.find(r => r.id === rel.target);
                        if (!relTopic) return null;
                        const style = REL_STYLE[rel.type as keyof typeof REL_STYLE];
                        return (
                          <span key={rel.target + rel.type} style={{
                            fontSize: 10, padding: "2px 6px", borderRadius: 4,
                            background: style.color + "18",
                            border: `1px solid ${style.color}44`,
                            color: style.color,
                            display: "flex", alignItems: "center", gap: 3,
                          }}>
                            <i className="ti ti-arrow-right" style={{ fontSize: 9 }} aria-hidden />
                            {style.label} {relTopic.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Conector entre níveis */}
          {groupIdx < levelGroups.length - 1 && (
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              height: 28, color: "var(--text)",
            }}>
              <div style={{ width: 1, height: 12, background: "var(--border)" }} />
              <i className="ti ti-chevron-down" style={{ fontSize: 12, opacity: 0.5, marginTop: -2 }} aria-hidden />
            </div>
          )}
        </div>
      ))}

      {/* Legenda */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11, color: "var(--text)", flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "#7c3aed" }} />
          usa conceito de
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "#0891b2" }} />
          relacionado
        </span>
        <span style={{ marginLeft: "auto" }}>
          Tópicos bloqueados requerem {UNLOCK_THRESHOLD}% nos pré-requisitos
        </span>
      </div>
    </div>
  );
}
