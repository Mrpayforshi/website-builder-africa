"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./intake.module.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ToolCallLog {
  tool: string;
  result?: { ok?: boolean };
}

interface IntakeChatProps {
  businessId: string;
  businessName: string;
}

const GREETING =
  "Tell me about your business — what do you sell or do, and who are your customers? I'll set up your site as we talk, starting with picking the right template for you.";

export function IntakeChat({ businessId, businessName }: IntakeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateReady, setTemplateReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, mode: "intake", messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong — try again.");
        setLoading(false);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Got it — anything else to add?" },
      ]);

      const assignedTemplate = ((data.toolCalls ?? []) as ToolCallLog[]).some(
        (t) => t.tool === "set_business_info" && t.result?.ok
      );
      if (assignedTemplate) setTemplateReady(true);
    } catch {
      setError("Couldn't reach the AI — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.scene}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Building with AI</span>
            <h1>{businessName}</h1>
          </div>
          {templateReady && (
            <a className={styles.editorLink} href={`/dashboard/${businessId}`}>
              Open your site editor →
            </a>
          )}
        </header>

        <div className={styles.thread}>
          {messages.map((m, i) => (
            <div key={i} className={`${styles.bubble} ${m.role === "user" ? styles.bubbleUser : styles.bubbleAi}`}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div className={`${styles.bubble} ${styles.bubbleAi} ${styles.bubbleTyping}`}>
              <span />
              <span />
              <span />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.composer}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your business…"
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
