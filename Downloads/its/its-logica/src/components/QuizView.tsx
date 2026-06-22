import { useState } from "react";
import { TOPICS, LEVEL_COLORS } from "../data/topics";
import ChatWidget from "./ChatWidget";
import { buildQueue } from "../logic/queue";
import { GAIN, LOSS } from "../logic/model";
import { getPedagogyAction, getPedagogyFeedback } from "../logic/pedagogy";
import type { Model, HistoryEntry, Question } from "../types";

const DIFF_LABEL: Record<string, string> = { basica: "Básica", intermediaria: "Intermediária", avancada: "Avançada" };
const DIFF_COLOR: Record<string, string> = { basica: "#1D9E75", intermediaria: "#BA7517", avancada: "#993C1D" };
const DIFF_BG: Record<string, string> = { basica: "#d1fae5", intermediaria: "#fef3c7", avancada: "#fee2e2" };

const ACTION_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  regredir:    { label: "Revisando base", color: "#991b1b", bg: "#fee2e2" },
  "reforçar":  { label: "Reforçando",     color: "#92400e", bg: "#fef3c7" },
  avançar:     { label: "Avançando",      color: "#065f46", bg: "#d1fae5" },
  desbloquear: { label: "Dominando",      color: "#3730a3", bg: "#e0e7ff" },
};

interface Props {
  topicId: string;
  model: Model;
  history: HistoryEntry[];
  onAnswer: (payload: { topicId: string; qId: number; correct: boolean; delta: number; chosen: number }) => void;
  onBack: () => void;
}

export default function QuizView({ topicId, model, history, onAnswer, onBack }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [queue, setQueue] = useState<Question[]>(() => buildQueue(topicId, model, history));

  const topic = TOPICS.find(t => t.id === topicId);
  if (!topic) return null;

  const col = LEVEL_COLORS[topic.level];
  const question = queue[0];
  if (!question) return null;

  const pL = model[topicId] ?? 0;
  const action = getPedagogyAction(pL);
  const actionBadge = ACTION_BADGE[action];

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    if (selected === null) return;
    const correct = selected === question.correct;
    const delta = correct ? GAIN[question.diff] : -LOSS;
    onAnswer({ topicId, qId: question.id, correct, delta, chosen: selected });
    const nextHistory: HistoryEntry[] = [...history, { topicId, qId: question.id, correct, delta, chosen: selected }];
    const remaining = queue.slice(1);
    setQueue(remaining.length > 0 ? remaining : buildQueue(topicId, model, nextHistory));
    setSelected(null);
    setSubmitted(false);
  };

  const isCorrect = submitted && selected === question.correct;

  // Feedback pedagógico contextual
  const pedagogyMessage = submitted ? getPedagogyFeedback(pL, isCorrect) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ padding: "5px 12px", fontSize: 13 }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} aria-hidden />
          Voltar
        </button>
        <span style={{
          fontSize: 13, fontWeight: 600, color: col.text,
          background: col.bg, border: `1px solid ${col.border}`,
          borderRadius: 6, padding: "3px 10px",
        }}>
          {topic.label}
        </span>

        {/* Badge da ação pedagógica */}
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
          background: actionBadge.bg, color: actionBadge.color,
        }}>
          {actionBadge.label} · {Math.round(pL)}%
        </span>

        <span style={{
          marginLeft: "auto", fontSize: 12, fontWeight: 500,
          color: DIFF_COLOR[question.diff],
          background: DIFF_BG[question.diff],
          padding: "2px 10px", borderRadius: 20,
        }}>
          {DIFF_LABEL[question.diff]}
        </span>
      </div>

      {/* Question card */}
      <div className="card" style={{ padding: "22px 20px 18px" }}>
        <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 18px", lineHeight: 1.55, color: "var(--text-h)" }}>
          {question.text}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {question.opts.map((opt, i) => {
            let bg = "var(--code-bg)";
            let border = "1px solid var(--border)";
            let textColor = "var(--text-h)";

            if (submitted) {
              if (i === question.correct) {
                bg = "#d1fae5"; border = "1px solid #6ee7b7"; textColor = "#065f46";
              } else if (i === selected) {
                bg = "#fee2e2"; border = "1px solid #fca5a5"; textColor = "#991b1b";
              }
            } else if (i === selected) {
              bg = "var(--accent-bg)"; border = "1.5px solid var(--accent)";
            }

            return (
              <div
                key={i}
                onClick={() => !submitted && setSelected(i)}
                className={submitted ? "" : "quiz-opt"}
                style={{
                  background: bg, border, borderRadius: 8,
                  padding: "11px 14px", cursor: submitted ? "default" : "pointer",
                  fontSize: 14, color: textColor,
                  display: "flex", alignItems: "center", gap: 10,
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, background: "var(--bg-card)",
                  color: i === selected ? "var(--accent)" : "var(--text)",
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{ flex: 1 }}>{opt}</span>
                {submitted && i === question.correct && (
                  <i className="ti ti-check" style={{ color: "#1D9E75", fontSize: 16 }} aria-hidden />
                )}
                {submitted && i === selected && i !== question.correct && (
                  <i className="ti ti-x" style={{ color: "#dc2626", fontSize: 16 }} aria-hidden />
                )}
              </div>
            );
          })}
        </div>

        {/* Feedback */}
        {submitted && (
          <div style={{
            marginTop: 16, padding: "14px 16px",
            background: isCorrect ? "#d1fae5" : "#fee2e2",
            border: `1px solid ${isCorrect ? "#6ee7b7" : "#fca5a5"}`,
            borderRadius: 8, fontSize: 13, lineHeight: 1.6,
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <i
                className={`ti ${isCorrect ? "ti-check-circle" : "ti-circle-x"}`}
                style={{ fontSize: 18, color: isCorrect ? "#1D9E75" : "#dc2626", flexShrink: 0, marginTop: 1 }}
                aria-hidden
              />
              <span>
                <span style={{ fontWeight: 600, color: isCorrect ? "#065f46" : "#991b1b" }}>
                  {isCorrect ? "Correto! " : "Incorreto. "}
                </span>
                {/* Feedback específico por alternativa ou explicação geral */}
                {!isCorrect && selected !== null && question.wrongFeedback?.[selected] ? (
                  <span style={{ color: "var(--text)" }}>
                    {question.wrongFeedback[selected]}
                    <span style={{ display: "block", marginTop: 6, paddingTop: 6, borderTop: "1px solid #fca5a5", color: "#991b1b", fontWeight: 500 }}>
                      Resposta correta: {question.opts[question.correct]}
                    </span>
                  </span>
                ) : (
                  <span style={{ color: "var(--text)" }}>{question.explain}</span>
                )}
              </span>
            </div>

            {/* Mensagem pedagógica contextual baseada em P(L) */}
            {pedagogyMessage && (
              <div style={{
                fontSize: 12, color: isCorrect ? "#065f46" : "#92400e",
                background: isCorrect ? "#a7f3d0" : "#fde68a",
                padding: "6px 10px", borderRadius: 6,
                display: "flex", gap: 6, alignItems: "center",
              }}>
                <i className="ti ti-brain" style={{ fontSize: 13, flexShrink: 0 }} aria-hidden />
                {pedagogyMessage}
              </div>
            )}
          </div>
        )}
      </div>

      <ChatWidget topicId={topicId} topicLabel={topic.label} />

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {!submitted ? (
          <button onClick={handleSubmit} disabled={selected === null} className="primary" style={{ padding: "9px 22px", fontSize: 14 }}>
            Confirmar resposta
          </button>
        ) : (
          <button onClick={handleNext} className="primary" style={{ padding: "9px 22px", fontSize: 14 }}>
            Próxima questão
            <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
