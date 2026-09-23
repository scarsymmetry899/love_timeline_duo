"use client";

import { createClient } from "@/lib/supabase/client";

const DISPLAY_MAX = 1600;

// A lighter JPEG copy for the path, same aspect ratio as the original.
// Returns nulls for formats the browser can't decode (e.g. HEIC on desktop).
async function displayCopy(file: File) {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const { width, height } = bmp;
    const scale = Math.min(1, DISPLAY_MAX / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return { blob, width, height };
  } catch {
    return { blob: null, width: null, height: null };
  }
}

/**
 * Uploads each photo (original plus display copy) to `couple/moment/…` in the
 * private bucket and records it. Returns how many photos failed.
 */
export async function uploadPhotos(
  coupleId: string,
  momentId: string,
  files: File[],
  onProgress: (done: number) => void,
) {
  const supabase = createClient();
  const bucket = supabase.storage.from("moments");
  let failed = 0;

  for (const [i, file] of files.entries()) {
    const base = `${coupleId}/${momentId}/${crypto.randomUUID()}`;
    const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
    const copy = await displayCopy(file);

    const original = await bucket.upload(`${base}.${ext}`, file, { contentType: file.type || undefined });
    const display = copy.blob
      ? await bucket.upload(`${base}-display.jpg`, copy.blob, { contentType: "image/jpeg" })
      : null;

    const storagePath = original.data?.path ?? display?.data?.path;
    if (!storagePath) {
      failed++;
      onProgress(i + 1);
      continue;
    }
    const { error } = await supabase.from("moment_media").insert({
      moment_id: momentId,
      couple_id: coupleId,
      kind: "photo",
      storage_path: storagePath,
      display_path: display?.data?.path ?? null,
      width: copy.width,
      height: copy.height,
      sort: i,
    });
    if (error) failed++;
    onProgress(i + 1);
  }
  return failed;
}
