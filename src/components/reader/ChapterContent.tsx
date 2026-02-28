"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import type { JSONContent } from "@tiptap/react";

interface ChapterContentProps {
  content: JSONContent;
  fontSize: number;
  lineHeight: number;
  fontFamily?: string;
  paragraphSpacing?: number;
}

export function ChapterContent({
  content,
  fontSize,
  lineHeight,
  fontFamily = "",
  paragraphSpacing = 0.8,
}: ChapterContentProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: true }),
    ],
    content,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base max-w-none focus:outline-none ${fontFamily}`,
        style: `font-size: ${fontSize}px; line-height: ${lineHeight}`,
      },
    },
  });

  if (!editor) return null;

  return (
    <div style={{ "--paragraph-spacing": `${paragraphSpacing}rem` } as React.CSSProperties}>
      <EditorContent editor={editor} />
    </div>
  );
}
