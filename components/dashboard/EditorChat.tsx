"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { deleteReference, uploadReference } from "@/lib/references/upload";
import { REFERENCE_LIMITS, formatBytes, type ReferenceAttachment, type ReferenceKind } from "@/lib/references/types";
import styles from "./editor-workspace.module.css";
import attach from "./editor-chat-attachments.module.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /** Client-only, for showing thumbnails in the bubble. */
  attachments?: ReferenceAttachment[];
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

const KIND_ICON: Record<ReferenceKind, string> = {
  image: "🖼",
  video: "🎬",
  html: "🌐",
  pdf: "📄",
  text: "📝",
  other: "📎",
};

export function EditorChat({ businessId, businessName, welcome, onSiteChanged }: EditorChatProps) {
  const greeting = welcome
    ? `Your ${businessName} site is ready — it's a copy you own, filled with sample content.\n\nA sensible order from here:\n1. Rewrite the hero headline and tagline for your business\n2. Replace the sample photos, products and prices with your own\n3. Turn on WhatsApp, EcoCash or layby from Connectors\n4. Publish when it looks right\n\nTell me what to change and I'll do it, or switch to Edit content to type directly.\n\nGot a menu, price list, or a site you like? Attach it with the paperclip and I'll use it as a guide.`
    : `What would you like to change on ${businessName}? Tell me and I'll update the site. You can attach photos, a menu or a price list with the paperclip.`;

  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: greeting }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ReferenceAttachment[]>([]);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function addFiles(fileList: File[]) {
    if (fileList.length === 0) return;
    setError(null);

    const room = REFERENCE_LIMITS.maxFilesPerMessage - attachments.length - uploading;
    if (room <= 0) {
      setError(`You can attach up to ${REFERENCE_LIMITS.maxFilesPerMessage} files per message.`);
      return;
    }
    const accepted = fileList.slice(0, room);
    if (accepted.length < fileList.length) {
      setError(
        `Only the first ${accepted.length} file(s) were added — the limit is ${REFERENCE_LIMITS.maxFilesPerMessage} per message.`
      );
    }

    setUploading((n) => n + accepted.length);
    const results = await Promise.allSettled(accepted.map((f) => uploadReference(businessId, f)));
    setUploading((n) => n - accepted.length);

    const done: ReferenceAttachment[] = [];
    const failures: string[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") done.push(r.value);
      else failures.push(r.reason instanceof Error ? r.reason.message : "Upload failed");
    }
    if (done.length) setAttachments((prev) => [...prev, ...done]);
    if (failures.length) setError(failures[0]);
  }

  function handlePick(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow picking the same file again
    void addFiles(files);
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(e.clipboardData.files ?? []);
    if (files.length) {
      e.preventDefault();
      void addFiles(files);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    void addFiles(Array.from(e.dataTransfer.files ?? []));
  }

  function removeAttachment(a: ReferenceAttachment) {
    setAttachments((prev) => prev.filter((x) => x.id !== a.id));
    void deleteReference(a);
  }

  async function send(rawText: string) {
    const text = rawText || (attachments.length ? "Here are some references for my site." : "");
    if (!text || loading || uploading > 0) return;

    const sentAttachments = attachments;
    const next: ChatMessage[] = [
      ...messages,
      { role: "user", content: text, attachments: sentAttachments.length ? sentAttachments : undefined },
    ];
    setMessages(next);
    setInput("");
    setAttachments([]);
    setLoading(true);
    setError(null);

    // The API wants the conversation to start with a user turn, so drop the
    // local greeting from what we send.
    const firstUser = next.findIndex((m) => m.role === "user");
    const payload = next.slice(firstUser).map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.attachments?.length ? { referenceIds: m.attachments.map((a) => a.id) } : {}),
    }));

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
  const canSend = !loading && uploading === 0 && (input.trim().length > 0 || attachments.length > 0);

  return (
    <div
      className={attach.dropZone}
      onDragOver={(e) => {
        e.preventDefault();
        if (!dragging) setDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false);
      }}
      onDrop={handleDrop}
    >
      {dragging && <div className={attach.dropOverlay}>Drop files to use as references</div>}

      <div className={styles.chatThread}>
        {messages.map((m, i) => (
          <div key={i} className={`${styles.bubble} ${m.role === "user" ? styles.bubbleUser : styles.bubbleAi}`}>
            {m.attachments && m.attachments.length > 0 && (
              <div className={attach.bubbleAttachments}>
                {m.attachments.map((a) =>
                  a.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={a.id} src={a.previewUrl} alt={a.fileName} className={attach.bubbleThumb} />
                  ) : (
                    <span key={a.id} className={attach.bubbleFile}>
                      {KIND_ICON[a.kind]} {a.fileName}
                    </span>
                  )
                )}
              </div>
            )}
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

      {(attachments.length > 0 || uploading > 0) && (
        <div className={attach.tray}>
          {attachments.map((a) => (
            <div key={a.id} className={attach.chip} title={`${a.fileName} · ${formatBytes(a.sizeBytes)}`}>
              {a.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.previewUrl} alt="" className={attach.chipThumb} />
              ) : (
                <span className={attach.chipIcon}>{KIND_ICON[a.kind]}</span>
              )}
              <span className={attach.chipName}>{a.fileName}</span>
              <button
                type="button"
                className={attach.chipRemove}
                onClick={() => removeAttachment(a)}
                aria-label={`Remove ${a.fileName}`}
              >
                ×
              </button>
            </div>
          ))}
          {uploading > 0 && <div className={attach.chipUploading}>Uploading {uploading}…</div>}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${styles.composer} ${attachments.length > 0 || uploading > 0 ? attach.composerUnderTray : ""}`}>
        <input ref={fileInputRef} type="file" multiple hidden onChange={handlePick} />
        <button
          type="button"
          className={attach.attachBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          aria-label="Attach reference files"
          title="Attach photos, videos, HTML, PDFs…"
        >
          📎
        </button>
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Ask Rivo to change something…"
          disabled={loading}
        />
        <button type="submit" className={styles.sendBtn} disabled={!canSend}>
          Send
        </button>
      </form>
    </div>
  );
}
