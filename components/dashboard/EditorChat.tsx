"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import styles from "./editor-workspace.module.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ToolCallLog {
  tool: string;
  result?: { ok?: boolean };
}

interface EditorChatProps {
  businessId: string;
  businessName: string;
  welcome: boolean;
  onSiteChanged: () => void | Promise<void>;
}

const SUGGESTIONS = [
  "Rewrite the hero headline for my business: ",
  "Change the sample prices and products to: ",
  "Update my contact details: ",
];

export function EditorChat({ businessId, businessName, welcome, onSiteChanged }: EditorChatProps) {
  const greeting = welcome
    ? `Your ${businessName} site is ready — it's a copy you own, filled with sample content.\n\nA sensible order from here:\n1. Rewrite the hero headline and tagline for your business\n2. Replace the sample photos, products and prices with your own\n3. Turn on WhatsApp, EcoCash or layby from Connectors\n4. Publish when it looks right\n\nTell me what to change and I'll do it, or switch to Edit content to type directly.`
    : `What would you like to change on ${businessName}? Tell me and I'll update the site.`;

  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: greeting }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text || loading) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    // The API wants the conversation to start with a user turn, so drop the
    // local greeting from what we send.
    const firstUser = next.findIndex((m) => m.role === "user");
    const payload = next.slice(firstUser);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, mode: "edit", messages: payload }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong — try again.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Done — anything else to change?" },
      ]);

      const changed = ((data.toolCalls ?? []) as ToolCallLog[]).some((t) => t.result?.ok);
      if (changed) await onSiteChanged();
    } catch {
      setError("Couldn't reach the AI — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(input.trim());
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input.trim());
    }
  }

  const hasUserMessage = messages.some((m) => m.role === "user");

  return (
    <>
      <div className={styles.chatThread}>
        {messages.map((m, i) => (
          <div key={i} className={`${styles.bubble} ${m.role === "user" ? styles.bubbleUser : styles.bubbleAi}`}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className={`${styles.bubble} ${styles.bubbleAi}`}>
            <span className={styles.typing}>Updating your site…</span>
          </div>
        )}
        {!hasUserMessage && (
          <div className={styles.chips}>
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className={styles.chip} onClick={() => setInput(s)}>
                {s.trim().replace(/:$/, "")}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.composer}>
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Rivo to change something…"
          disabled={loading}
        />
        <button type="submit" className={styles.sendBtn} disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </>
  );
}
