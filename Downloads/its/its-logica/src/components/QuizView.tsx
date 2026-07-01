import { useState } from "react";
import { TOPICS, LEVEL_COLORS } from "../data/topics";
import ChatWidget from "./ChatWidget";
import { buildQueue } from "../logic/queue";
import { GAIN, LOSS } from "../logic/model";
import { getStreak, streakMilestone } from "../logic/streak";
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

const KIND_BADGE: Record<string, { label: string; icon: string }> = {
  trace:     { label: "Rastreie o código", icon: "ti-player-track-next" },
  completar: { label: "Complete o código", icon: "ti-code-dots" },
};

interface Props {
  topicId: string;
  model: Model;
  history: HistoryEntry[];
  onAnswer: (payload: { topicId: string; qId: number; correct: boolean; delta: number; chosen: number }) => void;
  onBack: () => void;
  onReviewLesson?: () => void;
}

export default function QuizView({ topicId, model, history, onAnswer, onBack, onReviewLesson }: Props) {
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
    const delta = correct ? GAIN[question.diff] : -LOSS[question.diff];
    onAnswer({ topicId, qId: question.id, correct, delta, chosen: selected });
    const nextHistory: HistoryEntry[] = [...history, { topicId, qId: question.id, correct, delta, chosen: selected }];

    let remaining = queue.slice(1);

    // Reinserir questão errada após 3 questões
    if (!correct) {
      const insertAt = Math.min(3, remaining.length);
      remaining = [
        ...remaining.slice(0, insertAt),
        question,
        ...remaining.slice(insertAt),
      ];
    }

    setQueue(remaining.length > 0 ? remaining : buildQueue(topicId, model, nextHistory));
    setSelected(null);
    setSubmitted(false);
  };

  const isCorrect = submitted && selected === question.correct;

  // Erros acumulados neste tópico (para re-ensino direcionado)
  const wrongCountTopic = history.filter(h => h.topicId === topicId && !h.correct).length;

  // Sequência de acertos (deriva do histórico)
  const streak = getStreak(history);
  // Ao acertar, projeta a sequência que ESTA resposta produz (histórico só atualiza no "Próxima")
  const projectedStreak = isCorrect ? streak.current + 1 : 0;
  const milestone = isCorrect ? streakMilestone(projectedStreak) : null;

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
        {onReviewLesson && (
          <button onClick={onReviewLesson} style={{ padding: "5px 12px", fontSize: 13 }} title="Rever a aula deste tópico">
            <i className="ti ti-book" style={{ fontSize: 14 }} aria-hidden />
            Rever lição
          </button>
        )}
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

        {/* Sequência de acertos */}
        {streak.current >= 2 && (
          <span
            title={`Recorde: ${streak.best} seguidos`}
            style={{
              fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
              background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <i className="ti ti-flame" style={{ fontSize: 13 }} aria-hidden />
            {streak.current}
          </span>
        )}

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
        {/* Badge de exercício de código */}
        {question.kind && KIND_BADGE[question.kind] && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 11, fontWeight: 600, color: "#3730a3",
            background: "#e0e7ff", padding: "3px 10px", borderRadius: 6,
            marginBottom: 14,
          }}>
            <i className={`ti ${KIND_BADGE[question.kind].icon}`} style={{ fontSize: 13 }} aria-hidden />
            {KIND_BADGE[question.kind].label}
          </div>
        )}

        <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 18px", lineHeight: 1.55, color: "var(--text-h)" }}>
          {question.text}
        </p>

        {/* Bloco de código */}
        {question.code && (
          <pre style={{
            margin: "0 0 18px", padding: "14px 16px",
            background: "#1e1e2e", borderRadius: 8,
            border: "1px solid #313244", overflowX: "auto",
            fontSize: 13.5, lineHeight: 1.65,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            color: "#cdd6f4", whiteSpace: "pre",
          }}>
            <code>
              {question.code.split("____").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span style={{
                      background: "#f9e2af", color: "#1e1e2e",
                      padding: "1px 8px", borderRadius: 4, fontWeight: 700,
                      margin: "0 2px",
                    }}>____</span>
                  )}
                </span>
              ))}
            </code>
          </pre>
        )}

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

            {/* Marco de sequência de acertos */}
            {milestone && (
              <div style={{
                fontSize: 13, fontWeight: 700, color: "#c2410c",
                background: "#ffedd5", border: "1px solid #fdba74",
                padding: "8px 12px", borderRadius: 6,
                display: "flex", gap: 7, alignItems: "center",
              }}>
                <i className="ti ti-flame" style={{ fontSize: 16, flexShrink: 0 }} aria-hidden />
                {milestone}
              </div>
            )}

            {/* Re-ensino no erro — retoma a lição do conceito */}
            {!isCorrect && onReviewLesson && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                fontSize: 12.5, color: "#92400e",
                background: "#fffbeb", border: "1px solid #fde68a",
                padding: "8px 12px", borderRadius: 6,
              }}>
                <i className="ti ti-book" style={{ fontSize: 15, flexShrink: 0 }} aria-hidden />
                <span style={{ flex: 1 }}>
                  {wrongCountTopic >= 2
                    ? "Você errou algumas vezes neste tópico. Que tal rever a aula antes de continuar?"
                    : "Quer relembrar o conceito? Reveja a aula deste tópico."}
                </span>
                <button
                  onClick={onReviewLesson}
                  style={{ padding: "5px 12px", fontSize: 12, background: "#fff", border: "1px solid #fbbf24", color: "#92400e", flexShrink: 0 }}
                >
                  Rever a lição
                </button>
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
