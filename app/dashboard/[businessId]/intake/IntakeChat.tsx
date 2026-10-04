"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type DragEvent, type FormEvent } from "react";
import { deleteReference, uploadReference } from "@/lib/references/upload";
import { REFERENCE_LIMITS, formatBytes, type ReferenceAttachment, type ReferenceKind } from "@/lib/references/types";
import styles from "./intake.module.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /** Client-only, for showing chips in the bubble. */
  attachments?: ReferenceAttachment[];
}

interface ToolCallLog {
  tool: string;
  result?: { ok?: boolean };
}

interface IntakeChatProps {
  businessId: string;
  businessName: string;
  initialMessage?: string;
}

const GREETING =
  "Tell me about your business — what do you sell or do, and who are your customers? I'll set up your site as we talk, starting with picking the right template for you.\n\nGot photos, a menu, a site you like, or a video? Attach them with the paperclip and I'll use them as a guide.";

const KIND_ICON: Record<ReferenceKind, string> = {
  image: "🖼",
  video: "🎬",
  html: "🌐",
  pdf: "📄",
  text: "📝",
  other: "📎",
};

export function IntakeChat({ businessId, businessName, initialMessage }: IntakeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateReady, setTemplateReady] = useState(false);
  const [attachments, setAttachments] = useState<ReferenceAttachment[]>([]);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSent = useRef(false);

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
      setError(`Only the first ${accepted.length} file(s) were added — the limit is ${REFERENCE_LIMITS.maxFilesPerMessage} per message.`);
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

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
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
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text, attachments: sentAttachments.length ? sentAttachments : undefined },
    ];
    setMessages(nextMessages);
    setInput("");
    setAttachments([]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          mode: "intake",
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
            ...(m.attachments?.length ? { referenceIds: m.attachments.map((a) => a.id) } : {}),
          })),
        }),
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

  useEffect(() => {
    if (autoSent.current) return;
    if (!initialMessage || !initialMessage.trim()) return;
    autoSent.current = true;
    send(initialMessage.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(input.trim());
  }

  const canSend = !loading && uploading === 0 && (input.trim().length > 0 || attachments.length > 0);

  return (
    <div className={styles.scene}>
      <div className={styles.glow} aria-hidden="true" />
      <div
        className={styles.panel}
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setDragging(false);
        }}
        onDrop={handleDrop}
      >
        {dragging && <div className={styles.dropOverlay}>Drop files to use as references</div>}

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
              {m.attachments && m.attachments.length > 0 && (
                <div className={styles.bubbleAttachments}>
                  {m.attachments.map((a) =>
                    a.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={a.id} src={a.previewUrl} alt={a.fileName} className={styles.bubbleThumb} />
                    ) : (
                      <span key={a.id} className={styles.bubbleFile}>
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
            <div className={`${styles.bubble} ${styles.bubbleAi} ${styles.bubbleTyping}`}>
              <span />
              <span />
              <span />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {(attachments.length > 0 || uploading > 0) && (
          <div className={styles.tray}>
            {attachments.map((a) => (
              <div key={a.id} className={styles.chip} title={`${a.fileName} · ${formatBytes(a.sizeBytes)}`}>
                {a.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.previewUrl} alt="" className={styles.chipThumb} />
                ) : (
                  <span className={styles.chipIcon}>{KIND_ICON[a.kind]}</span>
                )}
                <span className={styles.chipName}>{a.fileName}</span>
                <button type="button" className={styles.chipRemove} onClick={() => removeAttachment(a)} aria-label={`Remove ${a.fileName}`}>
                  ×
                </button>
              </div>
            ))}
            {uploading > 0 && <div className={styles.chipUploading}>Uploading {uploading}…</div>}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.composer}>
          <input ref={fileInputRef} type="file" multiple hidden onChange={handlePick} />
          <button
            type="button"
            className={styles.attachBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            aria-label="Attach reference files"
            title="Attach photos, videos, HTML, PDFs…"
          >
            📎
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            placeholder="Describe your business…"
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={!canSend}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
