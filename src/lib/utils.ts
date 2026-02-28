import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Extract plain text from Tiptap JSON content */
export function extractText(tiptapJson: Record<string, unknown>): string {
  if (!tiptapJson || typeof tiptapJson !== "object") return "";
  let text = "";
  if (tiptapJson.text && typeof tiptapJson.text === "string") text += tiptapJson.text;
  if (Array.isArray(tiptapJson.content)) {
    for (const node of tiptapJson.content) {
      text += extractText(node as Record<string, unknown>) + " ";
    }
  }
  return text.trim();
}
