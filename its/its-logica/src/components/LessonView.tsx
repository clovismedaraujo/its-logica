import { TOPICS, LEVEL_COLORS } from "../data/topics";
import { LESSONS } from "../data/lessons";

interface Props {
  topicId: string;
  onPractice: () => void;
  onBack: () => void;
}

export default function LessonView({ topicId, onPractice, onBack }: Props) {
  const topic = TOPICS.find(t => t.id === topicId);
  const lesson = LESSONS[topicId];
  if (!topic || !lesson) {
    // Sem lição cadastrada — vai direto para a prática
    onPractice();
    return null;
  }
  const col = LEVEL_COLORS[topic.level];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>

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
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
          background: "#e0e7ff", color: "#3730a3", display: "flex", alignItems: "center", gap: 5,
        }}>
          <i className="ti ti-book" style={{ fontSize: 13 }} aria-hidden />
          Aula
        </span>
      </div>

      {/* Card da lição */}
      <div className="card" style={{ padding: "24px 22px" }}>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: "var(--text-h)", margin: "0 0 6px" }}>
          {topic.label}
        </h2>
        <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, margin: "0 0 20px", fontStyle: "italic" }}>
          {lesson.intro}
        </p>

        {/* Seções de conceito */}
        {lesson.sections.map((sec, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-h)", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 6, height: 16, borderRadius: 3, background: col.text, display: "inline-block" }} />
              {sec.heading}
            </h3>
            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.65, margin: 0 }}>
              {sec.body}
            </p>
          </div>
        ))}

        {/* Exemplo resolvido (worked example) */}
        {lesson.example && (
          <div style={{ marginTop: 22, marginBottom: 4 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-h)", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 7 }}>
              <i className="ti ti-bulb" style={{ fontSize: 17, color: "#BA7517" }} aria-hidden />
              Exemplo resolvido: {lesson.example.title}
            </h3>

            <pre style={{
              margin: "0 0 14px", padding: "14px 16px",
              background: "#1e1e2e", borderRadius: 8, border: "1px solid #313244",
              overflowX: "auto", fontSize: 13.5, lineHeight: 1.65,
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              color: "#cdd6f4", whiteSpace: "pre",
            }}>
              <code>{lesson.example.code}</code>
            </pre>

            <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {lesson.example.steps.map((step, i) => (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, color: "var(--text)", lineHeight: 1.55 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    background: col.bg, border: `1px solid ${col.border}`, color: col.text,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, marginTop: 1,
                  }}>
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Pontos-chave */}
        <div style={{
          marginTop: 22, padding: "14px 16px", borderRadius: 8,
          background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-h)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ti ti-key" style={{ fontSize: 15, color: "var(--accent)" }} aria-hidden />
            Pontos-chave
          </div>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {lesson.keyPoints.map((kp, i) => (
              <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13.5, color: "var(--text)", lineHeight: 1.5 }}>
                <i className="ti ti-check" style={{ fontSize: 14, color: "var(--accent)", flexShrink: 0, marginTop: 2 }} aria-hidden />
                <span>{kp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ação */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="primary" onClick={onPractice} style={{ padding: "10px 24px", fontSize: 14 }}>
          Praticar agora
          <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden />
        </button>
      </div>
    </div>
  );
}
