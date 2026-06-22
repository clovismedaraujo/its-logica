import { useState, useRef, useEffect } from "react";

interface Message {
  from: "user" | "bot";
  text: string;
}

interface Props {
  topicId: string;
  topicLabel: string;
}

const RASA_URL = "http://localhost:5005/webhooks/rest/webhook";
const SENDER_ID = "student_" + Math.random().toString(36).slice(2, 8);

export default function ChatWidget({ topicId, topicLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const initialized = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Ao abrir o chat pela primeira vez, define o tópico no Rasa
  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true;
      sendToRasa(`tópico: ${topicId}`, true);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendToRasa(text: string, silent = false) {
    if (!silent) {
      setMessages(prev => [...prev, { from: "user", text }]);
    }
    setLoading(true);
    setOffline(false);

    try {
      const res = await fetch(RASA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: SENDER_ID, message: text }),
      });

      if (!res.ok) throw new Error("server error");

      const data: { text?: string }[] = await res.json();
      const botMessages = data.map(d => d.text).filter(Boolean) as string[];

      const replies = botMessages.length > 0
        ? botMessages
        : ["Não entendi bem. Tente: \"me dá uma dica\", \"não entendi\", \"errei\" ou \"acertei\"."];
      setMessages(prev => [
        ...prev,
        ...replies.map(t => ({ from: "bot" as const, text: t })),
      ]);
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    sendToRasa(text);
  }

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100 }}>
      {/* Botão flutuante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Falar com o tutor"
          style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "var(--accent)", color: "#fff",
            border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 0,
          }}
        >
          <i className="ti ti-message-chatbot" aria-hidden />
        </button>
      )}

      {/* Painel de chat */}
      {open && (
        <div style={{
          width: 340, height: 460,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          boxShadow: "var(--shadow-md)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "12px 14px",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--accent)", color: "#fff",
          }}>
            <i className="ti ti-brain" style={{ fontSize: 18 }} aria-hidden />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Tutor IA</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>{topicLabel}</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none", border: "none", color: "#fff",
                padding: 4, borderRadius: 6, cursor: "pointer",
                display: "flex", alignItems: "center",
              }}
            >
              <i className="ti ti-x" style={{ fontSize: 16 }} aria-hidden />
            </button>
          </div>

          {/* Mensagens */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.length === 0 && !loading && (
              <div style={{ fontSize: 13, color: "var(--text)", textAlign: "center", marginTop: 30 }}>
                <i className="ti ti-message-dots" style={{ fontSize: 28, display: "block", marginBottom: 8, opacity: 0.5 }} aria-hidden />
                Olá! Peça uma <b>dica</b>, diga que <b>não entendeu</b>, ou conte que <b>errou/acertou</b>.
              </div>
            )}

            {offline && (
              <div style={{
                fontSize: 12, padding: "8px 12px", borderRadius: 8,
                background: "#fee2e2", color: "#991b1b",
                border: "1px solid #fca5a5",
              }}>
                Tutor offline. Inicie o servidor Rasa com <code>docker compose up</code> na pasta <code>rasa/</code>.
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                  padding: "9px 12px",
                  borderRadius: msg.from === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: msg.from === "user" ? "var(--accent)" : "var(--code-bg)",
                  color: msg.from === "user" ? "#fff" : "var(--text-h)",
                  fontSize: 13,
                  lineHeight: 1.5,
                  border: msg.from === "bot" ? "1px solid var(--border)" : "none",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: "flex-start", fontSize: 20, color: "var(--text)", padding: "4px 8px", letterSpacing: 2 }}>
                •••
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "10px 12px",
            borderTop: "1px solid var(--border)",
            display: "flex", gap: 8,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Peça uma dica, diga que errou..."
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--code-bg)",
                fontSize: 13, color: "var(--text-h)", outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                padding: "8px 14px", borderRadius: 8,
                background: "var(--accent)", color: "#fff",
                border: "none", fontSize: 15, cursor: "pointer",
                opacity: !input.trim() || loading ? 0.5 : 1,
              }}
            >
              <i className="ti ti-send" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
