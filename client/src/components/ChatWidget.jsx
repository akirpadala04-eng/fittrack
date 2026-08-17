import { useEffect, useRef, useState } from "react";
import { IconX } from "./Icons";

const WELCOME = {
  role: "assistant",
  content: "Hi! I'm FitBot 💪 Ask me anything about workouts, nutrition, or using FitTrack — fitness questions only!",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.filter((m) => m !== WELCOME) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [...m, { role: "assistant", content: data.error || "Something went wrong.", isError: true }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Couldn't reach the fitness assistant. Please try again.", isError: true }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <div className="flex items-center gap-8">
              <div className="chat-avatar">🏋️</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>FitBot</div>
                <div style={{ fontSize: 11, color: "var(--brand-light)" }}>Fitness questions only</div>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">
              <IconX width={16} height={16} />
            </button>
          </div>
          <div className="chat-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble-row ${m.role === "user" ? "chat-bubble-row-user" : ""}`}>
                <div className={`chat-bubble ${m.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"} ${m.isError ? "chat-bubble-error" : ""}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble-row">
                <div className="chat-bubble chat-bubble-bot chat-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
          <form className="chat-input-row" onSubmit={sendMessage}>
            <input
              className="chat-input"
              placeholder="Ask about workouts, nutrition…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button className="chat-send-btn" type="submit" disabled={loading || !input.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label="Open fitness chatbot">
        {open ? <IconX width={22} height={22} /> : "💬"}
      </button>
    </>
  );
}
