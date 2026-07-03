import { useState, useRef, useEffect } from "react";

interface Message {
  from: "user" | "bot";
  text: string;
}

interface Props {
  topicId: string;
  topicLabel: string;
}

const RASA_URL = "https://its-logica-production.up.railway.app/webhooks/rest/webhook";
const SENDER_ID = "student_" + Math.random().toString(36).slice(2, 8);

export default function ChatWidget({ topicId, topicLabel }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const initialized = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Encolhe o conteúdo do app para a metade esquerda enquanto o chat está visível
  useEffect(() => {
    document.body.classList.add("with-chat");
    return () => { document.body.classList.remove("with-chat"); };
  }, []);

  // Define o tópico no Rasa ao montar
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      sendToRasa(`tópico: ${topicId}`, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div style={{
      position: "fixed", top: 0, right: 0,
      width: "50vw", height: "100svh",
      background: "var(--bg-card)",
      borderLeft: "1px solid var(--border)",
      boxShadow: "var(--shadow-md)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      zIndex: 200,
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--accent)", color: "#fff",
      }}>
        <i className="ti ti-brain" style={{ fontSize: 20 }} aria-hidden />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Tutor IA</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>{topicLabel}</div>
        </div>
      </div>

      {/* Mensagens */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && !loading && (
          <div style={{ fontSize: 14, color: "var(--text)", textAlign: "center", marginTop: 40 }}>
            <i className="ti ti-message-dots" style={{ fontSize: 32, display: "block", marginBottom: 10, opacity: 0.5 }} aria-hidden />
            Olá! Peça uma <b>dica</b>, diga que <b>não entendeu</b>, pergunte sobre um <b>conceito</b>, ou conte que <b>errou/acertou</b>.
          </div>
        )}

        {offline && (
          <div style={{
            fontSize: 13, padding: "10px 14px", borderRadius: 8,
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
              padding: "10px 14px",
              borderRadius: msg.from === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.from === "user" ? "var(--accent)" : "var(--code-bg)",
              color: msg.from === "user" ? "#fff" : "var(--text-h)",
              fontSize: 14,
              lineHeight: 1.55,
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
        padding: "12px 16px",
        borderTop: "1px solid var(--border)",
        display: "flex", gap: 8,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Peça uma dica, pergunte um conceito..."
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 8,
            border: "1px solid var(--border)", background: "var(--code-bg)",
            fontSize: 14, color: "var(--text-h)", outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{
            padding: "9px 16px", borderRadius: 8,
            background: "var(--accent)", color: "#fff",
            border: "none", fontSize: 16, cursor: "pointer",
            opacity: !input.trim() || loading ? 0.5 : 1,
          }}
        >
          <i className="ti ti-send" aria-hidden />
        </button>
      </div>
    </div>
  );
}
