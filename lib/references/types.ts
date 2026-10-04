// lib/references/types.ts
// Shared between the browser (upload) and the server (chat route).

export const REFERENCE_BUCKET = "business-references";

export type ReferenceKind = "image" | "video" | "html" | "pdf" | "text" | "other";

export interface ReferenceRow {
  id: string;
  business_id: string;
  kind: ReferenceKind;
  file_name: string;
  mime_type: string | null;
  size_bytes: number;
  storage_path: string;
  frame_paths: string[];
  created_at: string;
}

/** What the chat UI keeps for a file that has been uploaded. */
export interface ReferenceAttachment {
  id: string;
  kind: ReferenceKind;
  fileName: string;
  sizeBytes: number;
  /** Object URL for a thumbnail (images + first video frame). Browser only. */
  previewUrl?: string;
  /** Storage paths, so an unsent attachment can be cleaned up if removed. */
  paths: string[];
}

export const REFERENCE_LIMITS = {
  maxFilesPerMessage: 6,
  /** Raw size caps checked before upload. Images are shrunk client-side afterwards. */
  maxBytes: {
    image: 15 * 1024 * 1024,
    video: 50 * 1024 * 1024, // matches the bucket's file_size_limit
    html: 2 * 1024 * 1024,
    pdf: 20 * 1024 * 1024,
    text: 1 * 1024 * 1024,
    other: 20 * 1024 * 1024,
  } satisfies Record<ReferenceKind, number>,
  videoFrames: 4,
  /** Only these formats can be sent to the model as images. */
  modelImageMimes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  /** Characters of HTML / text handed to the model per file. */
  maxTextChars: 40_000,
} as const;

const TEXT_EXTENSIONS = ["txt", "md", "csv", "json", "css", "js", "ts", "xml", "svg"];

export function classifyFile(file: { name: string; type: string }): ReferenceKind {
  const type = (file.type || "").toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (type.startsWith("image/") && type !== "image/svg+xml") return "image";
  if (type.startsWith("video/")) return "video";
  if (type === "text/html" || ext === "html" || ext === "htm") return "html";
  if (type === "application/pdf" || ext === "pdf") return "pdf";
  if (type.startsWith("text/") || TEXT_EXTENSIONS.includes(ext)) return "text";
  return "other";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
