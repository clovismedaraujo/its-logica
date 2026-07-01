import { useState } from "react";
import { TOPICS } from "../data/topics";
import { buildDiagnostic, seedFromAnswers, SEED_CORRECT } from "../logic/diagnostic";
import ProfBar from "./ProfBar";
import type { Model, DiagnosticResult } from "../types";

interface Props {
  onComplete: (model: Model) => void;
  onSkip: () => void;
}

type Phase = "intro" | "quiz" | "done";

export default function DiagnosticView({ onComplete, onSkip }: Props) {
  const [items] = useState(() => buildDiagnostic());
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const total = items.length;
  const item = items[index];

  function handleNext() {
    if (selected === null) return;
    const correct = selected === item.question.correct;
    const newResults = [...results, { topicId: item.topicId, correct }];
    setResults(newResults);
    setSelected(null);
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      setPhase("done");
    }
  }

  // ─── Intro ──────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div style={{ maxWidth: 560, margin: "40px auto", textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px",
          background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="ti ti-stethoscope" style={{ fontSize: 28, color: "var(--accent)" }} aria-hidden />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-h)", marginBottom: 8 }}>
          Vamos descobrir o que você já sabe
        </h2>
        <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, marginBottom: 24 }}>
          Antes de começar, o tutor faz uma sondagem rápida de <strong>{total} perguntas</strong>,
          uma de cada assunto. Com isso ele estima seu ponto de partida e personaliza o que
          mostrar primeiro. Não vale nota — responda com sinceridade, e tudo bem não saber.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="primary" onClick={() => setPhase("quiz")} style={{ padding: "10px 24px", fontSize: 14 }}>
            <i className="ti ti-player-play" style={{ fontSize: 15 }} aria-hidden />
            Começar diagnóstico
          </button>
          <button onClick={onSkip} style={{ padding: "10px 20px", fontSize: 14 }}>
            Pular
          </button>
        </div>
      </div>
    );
  }

  // ─── Resultado ────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const model = seedFromAnswers(results);
    const acertos = results.filter(r => r.correct).length;
    return (
      <div style={{ maxWidth: 620, margin: "32px auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px",
            background: "#d1fae5", border: "1px solid #6ee7b7",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="ti ti-circle-check" style={{ fontSize: 28, color: "#1D9E75" }} aria-hidden />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-h)", marginBottom: 8 }}>
            Diagnóstico concluído
          </h2>
          <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>
            Você acertou <strong>{acertos} de {total}</strong>. Veja o ponto de partida que o tutor
            estimou para cada assunto — você vai praticar a partir daqui.
          </p>
        </div>

        <div className="card" style={{ padding: "16px 18px", marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TOPICS.map(t => {
              const prof = model[t.id] ?? 0;
              const sabia = prof >= SEED_CORRECT;
              return (
                <div key={t.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: "var(--text-h)" }}>{t.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: sabia ? "#1D9E75" : "var(--text)", display: "flex", alignItems: "center", gap: 4 }}>
                      <i className={`ti ${sabia ? "ti-check" : "ti-minus"}`} style={{ fontSize: 12 }} aria-hidden />
                      {sabia ? "tem uma base" : "vamos construir"}
                    </span>
                  </div>
                  <ProfBar value={prof} />
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button className="primary" onClick={() => onComplete(model)} style={{ padding: "10px 26px", fontSize: 14 }}>
            Começar a estudar
            <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  // ─── Quiz ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 620, margin: "24px auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Progresso */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "var(--text)" }}>
          <span>Sondagem — {item.topicLabel}</span>
          <span>Pergunta {index + 1} de {total}</span>
        </div>
        <div style={{ height: 6, background: "var(--code-bg)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${(index / total) * 100}%`, height: "100%", background: "var(--accent)", transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Questão */}
      <div className="card" style={{ padding: "22px 20px" }}>
        <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 18px", lineHeight: 1.55, color: "var(--text-h)" }}>
          {item.question.text}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {item.question.opts.map((opt, i) => {
            const isSel = i === selected;
            return (
              <div
                key={i}
                onClick={() => setSelected(i)}
                className="quiz-opt"
                style={{
                  background: isSel ? "var(--accent-bg)" : "var(--code-bg)",
                  border: isSel ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                  borderRadius: 8, padding: "11px 14px", cursor: "pointer",
                  fontSize: 14, color: "var(--text-h)",
                  display: "flex", alignItems: "center", gap: 10,
                }}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, background: "var(--bg-card)",
                  color: isSel ? "var(--accent)" : "var(--text)",
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{ flex: 1 }}>{opt}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ações */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onSkip} style={{ padding: "8px 16px", fontSize: 13 }}>
          Pular diagnóstico
        </button>
        <button onClick={handleNext} disabled={selected === null} className="primary" style={{ padding: "9px 22px", fontSize: 14 }}>
          {index + 1 < total ? "Próxima" : "Ver resultado"}
          <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden />
        </button>
      </div>
    </div>
  );
}
