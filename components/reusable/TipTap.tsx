"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useRef } from "react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import TipTapMenuBar from "./TipTapMenuBar";

interface TiptapProps {
  content?: string;
  onChange?: (content: string) => void;
}

export default function Tiptap({ content = "", onChange }: TiptapProps) {
  const isSettingContent = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-6 my-2",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-6 my-2",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "my-1",
          },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: "font-bold",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    // Start empty — content is injected via useEffect below (same pattern as TipTapViewer)
    content: "",
    onUpdate: ({ editor }) => {
      // Skip onChange during programmatic setContent calls to avoid overwriting RHF field
      if (isSettingContent.current) return;
      if (onChange) {
        onChange(JSON.stringify(editor.getJSON()));
      }
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "min-h-[200px] w-full px-4 py-3 focus:outline-none",
      },
    },
  });

  // Sync editor whenever the content prop or editor instance changes.
  // Mirrors TipTapViewer's approach — always call setContent unconditionally.
  useEffect(() => {
    if (!editor) return;
    isSettingContent.current = true;
    try {
      const json = JSON.parse(content);
      editor.commands.setContent(json);
    } catch {
      editor.commands.setContent(content);
    }
    isSettingContent.current = false;
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-xl bg-white overflow-hidden">
      <div className="p-3 border-b bg-primary-light">
        <TipTapMenuBar editor={editor} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
