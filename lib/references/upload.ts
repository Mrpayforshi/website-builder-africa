// lib/references/upload.ts
// Browser only. Uploads straight to Supabase Storage (not through a Next route)
// so large files never hit Vercel's request body limit.

import { createClient } from "@/lib/supabase/client";
import {
  REFERENCE_BUCKET,
  REFERENCE_LIMITS,
  classifyFile,
  formatBytes,
  type ReferenceAttachment,
  type ReferenceKind,
} from "./types";

function safeName(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return (cleaned || "file").slice(-100);
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", quality));
}

/** Shrink big photos (phone cameras are 4–10 MB) to something the model + storage can handle cheaply. */
async function shrinkImage(file: File): Promise<{ blob: Blob; mime: string; name: string }> {
  const supported = (REFERENCE_LIMITS.modelImageMimes as readonly string[]).includes(file.type);
  const small = file.size <= 1.5 * 1024 * 1024;
  if (supported && small) return { blob: file, mime: file.type, name: file.name };

  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.fillStyle = "#ffffff"; // JPEG has no alpha — flatten transparent logos onto white
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const jpeg = await canvasToJpeg(canvas, 0.85);
    if (!jpeg) throw new Error("encode failed");
    return { blob: jpeg, mime: "image/jpeg", name: file.name.replace(/\.[^.]+$/, "") + ".jpg" };
  } catch {
    // e.g. HEIC on a browser that can't decode it. Keep the original; the AI will just see the filename.
    return { blob: file, mime: file.type, name: file.name };
  }
}

/** Grab a few evenly spaced still frames so the AI can "see" a video. Returns [] if the browser can't decode it. */
async function extractVideoFrames(file: File, count: number): Promise<Blob[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.preload = "auto";
  video.playsInline = true;
  video.src = url;

  const withTimeout = <T,>(p: Promise<T>, ms: number) =>
    Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

  try {
    await withTimeout(
      new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("cannot decode video"));
      }),
      10_000
    );

    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0 || !video.videoWidth) return [];

    const scale = Math.min(1, 1024 / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];

    const frames: Blob[] = [];
    for (let i = 0; i < count; i++) {
      const t = duration * ((i + 0.5) / count);
      await withTimeout(
        new Promise<void>((resolve, reject) => {
          video.onseeked = () => resolve();
          video.onerror = () => reject(new Error("seek failed"));
          video.currentTime = t;
        }),
        10_000
      );
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await canvasToJpeg(canvas, 0.8);
      if (blob) frames.push(blob);
    }
    return frames;
  } catch {
    return [];
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute("src");
    video.load();
  }
}

export async function uploadReference(businessId: string, file: File): Promise<ReferenceAttachment> {
  const kind: ReferenceKind = classifyFile(file);
  const cap = REFERENCE_LIMITS.maxBytes[kind];
  if (file.size > cap) {
    throw new Error(`"${file.name}" is too big (${formatBytes(file.size)}). The limit for this type is ${formatBytes(cap)}.`);
  }

  const supabase = createClient();
  const id = crypto.randomUUID();
  const folder = `${businessId}/${id}`;
  const uploadedPaths: string[] = [];

  const put = async (path: string, body: Blob, contentType: string) => {
    const { error } = await supabase.storage
      .from(REFERENCE_BUCKET)
      .upload(path, body, { contentType: contentType || "application/octet-stream", upsert: false });
    if (error) throw new Error(error.message);
    uploadedPaths.push(path);
  };

  try {
    let body: Blob = file;
    let mime = file.type;
    let fileName = file.name;
    let previewUrl: string | undefined;

    if (kind === "image") {
      const shrunk = await shrinkImage(file);
      body = shrunk.blob;
      mime = shrunk.mime;
      fileName = shrunk.name;
      previewUrl = URL.createObjectURL(body);
    }

    const mainPath = `${folder}/${safeName(fileName)}`;
    await put(mainPath, body, mime);

    const framePaths: string[] = [];
    if (kind === "video") {
      const frames = await extractVideoFrames(file, REFERENCE_LIMITS.videoFrames);
      for (let i = 0; i < frames.length; i++) {
        const p = `${folder}/frame-${i + 1}.jpg`;
        await put(p, frames[i], "image/jpeg");
        framePaths.push(p);
      }
      if (frames[0]) previewUrl = URL.createObjectURL(frames[0]);
    }

    const { error: insertError } = await supabase.from("business_references").insert({
      id,
      business_id: businessId,
      kind,
      file_name: fileName,
      mime_type: mime || null,
      size_bytes: body.size,
      storage_path: mainPath,
      frame_paths: framePaths,
    });
    if (insertError) throw new Error(insertError.message);

    return { id, kind, fileName, sizeBytes: body.size, previewUrl, paths: uploadedPaths };
  } catch (err) {
    // Don't leave orphaned files behind if any step failed.
    if (uploadedPaths.length) await supabase.storage.from(REFERENCE_BUCKET).remove(uploadedPaths);
    throw err instanceof Error ? err : new Error("Upload failed");
  }
}

/** Remove an attachment the user changed their mind about before sending. */
export async function deleteReference(attachment: ReferenceAttachment): Promise<void> {
  const supabase = createClient();
  await supabase.from("business_references").delete().eq("id", attachment.id);
  if (attachment.paths.length) {
    await supabase.storage.from(REFERENCE_BUCKET).remove(attachment.paths);
  }
  if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
}
