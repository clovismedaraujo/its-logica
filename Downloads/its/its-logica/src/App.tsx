import { useState } from "react";
import { TOPICS } from "./data/topics";
import { QUESTIONS } from "./data/questions";
import { isUnlocked } from "./logic/model";
import { useProgress } from "./hooks/useProgress";
import ProfBar from "./components/ProfBar";
import MapView from "./components/MapView";
import QuizView from "./components/QuizView";
import StatsView from "./components/StatsView";
import DiagnosticView from "./components/DiagnosticView";
import LessonView from "./components/LessonView";
import type { Recommendation } from "./types";

const TOTAL_QUESTIONS = Object.values(QUESTIONS).reduce((a, b) => a + b.length, 0);

type Tab = "mapa" | "praticar" | "progresso";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "mapa",      label: "Mapa",      icon: "ti-map" },
  { id: "praticar",  label: "Praticar",  icon: "ti-player-play" },
  { id: "progresso", label: "Progresso", icon: "ti-chart-bar" },
];

const REC_ICON: Record<Recommendation["type"], string> = {
  revisar_prereq:   "ti-alert-triangle",
  "reforçar_conceito": "ti-refresh",
  proximo_topico:   "ti-arrow-right-circle",
};
const REC_COLOR: Record<Recommendation["type"], string> = {
  revisar_prereq:   "#92400e",
  "reforçar_conceito": "#1e40af",
  proximo_topico:   "#065f46",
};
const REC_BG: Record<Recommendation["type"], string> = {
  revisar_prereq:   "#fef3c7",
  "reforçar_conceito": "#dbeafe",
  proximo_topico:   "#d1fae5",
};

export default function App() {
  const { model, history, lastFeedback, handleAnswer, recommendations, seedModel } = useProgress();
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState<"licao" | "quiz">("licao");
  const [tab, setTab] = useState<Tab>("mapa");
  const [phase, setPhase] = useState<"diagnostico" | "app">("diagnostico");

  const unlockedCount = TOPICS.filter(t => isUnlocked(t.id, model)).length;
  const avgProf = Math.round(Object.values(model).reduce((a, b) => a + b, 0) / TOPICS.length);

  function goToTopic(id: string) {
    setActiveTopic(id);
    setPracticeMode("licao"); // sempre começa pela lição (ensino antes da prática)
    setTab("praticar");
  }

  // Diagnóstico inicial — semeia o modelo do aluno antes de praticar
  if (phase === "diagnostico") {
    return (
      <div style={{ padding: "0 16px" }}>
        <DiagnosticView
          onComplete={(seeded) => { seedModel(seeded); setPhase("app"); }}
          onSkip={() => setPhase("app")}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100svh" }}>

      {/* Header */}
      <header style={{ padding: "20px 0 0", borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="ti ti-brain" style={{ fontSize: 20, color: "var(--accent)" }} aria-hidden />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-h)", letterSpacing: "-0.3px" }}>
              ITS — Lógica de programação
            </h1>
            <div style={{ fontSize: 12, color: "var(--text)", marginTop: 1 }}>
              {unlockedCount} de {TOPICS.length} tópicos desbloqueados · {TOTAL_QUESTIONS} questões
            </div>
          </div>

          {lastFeedback && (
            <div style={{
              fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 8,
              background: lastFeedback.correct ? "#d1fae5" : "#fee2e2",
              color: lastFeedback.correct ? "#1D9E75" : "#dc2626",
              border: `1px solid ${lastFeedback.correct ? "#6ee7b7" : "#fca5a5"}`,
            }}>
              {lastFeedback.correct ? "▲" : "▼"} {Math.abs(lastFeedback.delta)}% proficiência
            </div>
          )}

          <button
            onClick={() => { setActiveTopic(null); setTab("mapa"); setPhase("diagnostico"); }}
            title="Refazer o diagnóstico inicial"
            style={{ padding: "6px 12px", fontSize: 12, gap: 5 }}
          >
            <i className="ti ti-refresh" style={{ fontSize: 13 }} aria-hidden />
            Refazer diagnóstico
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "var(--text)" }}>Proficiência geral</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-h)" }}>{avgProf}%</span>
          </div>
          <ProfBar value={avgProf} />
        </div>

        <nav style={{ display: "flex", gap: 2, marginBottom: -1 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (t.id !== "praticar") setActiveTopic(null); }}
              style={{
                background: "none", border: "none",
                borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                borderRadius: 0, padding: "8px 16px", fontSize: 14,
                fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? "var(--accent)" : "var(--text)",
                boxShadow: "none", gap: 6,
              }}
            >
              <i className={`ti ${t.icon}`} style={{ fontSize: 15 }} aria-hidden />
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Recomendações do modelo pedagógico */}
      {recommendations.length > 0 && tab !== "praticar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ti ti-bulb" style={{ fontSize: 14, color: "var(--accent)" }} aria-hidden />
            Recomendações do tutor
          </div>
          {recommendations.map((rec, i) => (
            <div
              key={i}
              onClick={() => goToTopic(rec.topicId)}
              className="card card-clickable"
              style={{
                padding: "10px 14px",
                background: REC_BG[rec.type],
                border: `1px solid ${REC_COLOR[rec.type]}33`,
                display: "flex", alignItems: "flex-start", gap: 10,
              }}
            >
              <i
                className={`ti ${REC_ICON[rec.type]}`}
                style={{ fontSize: 16, color: REC_COLOR[rec.type], flexShrink: 0, marginTop: 1 }}
                aria-hidden
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: REC_COLOR[rec.type], marginBottom: 2 }}>
                  {rec.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--text)" }}>{rec.reason}</div>
              </div>
              <i className="ti ti-arrow-right" style={{ fontSize: 14, color: REC_COLOR[rec.type], flexShrink: 0 }} aria-hidden />
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <main style={{ flex: 1, paddingBottom: 32 }}>

        {tab === "mapa" && (
          <MapView model={model} onSelect={goToTopic} />
        )}

        {tab === "praticar" && !activeTopic && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 14, color: "var(--text)", margin: "0 0 4px" }}>
              Escolha um tópico para praticar:
            </p>
            {TOPICS.filter(t => isUnlocked(t.id, model)).map(t => {
              const prof = model[t.id] ?? 0;
              return (
                <div
                  key={t.id}
                  onClick={() => { setActiveTopic(t.id); setPracticeMode("licao"); }}
                  className="card card-clickable"
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-h)" }}>{t.label}</span>
                      <span style={{ fontSize: 11, color: "var(--text)", background: "var(--code-bg)", padding: "1px 6px", borderRadius: 4 }}>
                        {QUESTIONS[t.id]?.length ?? 0} questões
                      </span>
                    </div>
                    <ProfBar value={prof} />
                  </div>
                  <i className="ti ti-arrow-right" style={{ fontSize: 16, color: "var(--text)", flexShrink: 0 }} aria-hidden />
                </div>
              );
            })}
          </div>
        )}

        {tab === "praticar" && activeTopic && practiceMode === "licao" && (
          <LessonView
            topicId={activeTopic}
            onPractice={() => setPracticeMode("quiz")}
            onBack={() => setActiveTopic(null)}
          />
        )}

        {tab === "praticar" && activeTopic && practiceMode === "quiz" && (
          <QuizView
            topicId={activeTopic}
            model={model}
            history={history}
            onAnswer={handleAnswer}
            onBack={() => setActiveTopic(null)}
            onReviewLesson={() => setPracticeMode("licao")}
          />
        )}

        {tab === "progresso" && <StatsView model={model} history={history} />}
      </main>
    </div>
  );
}
