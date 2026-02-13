"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import TipTapMenuBar from "./TipTapMenuBar";

interface TiptapProps {
  content?: string;
  onChange?: (content: string) => void;
}

export default function Tiptap({ content = "", onChange }: TiptapProps) {
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
    content: (() => {
      try {
        return content ? JSON.parse(content) : "";
      } catch {
        return content;
      }
    })(),
    onUpdate: ({ editor }) => {
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

  return (
    <div className="border rounded-lg shadow-xs bg-white overflow-hidden">
      <div className="p-3 border-b bg-primary-light">
        <TipTapMenuBar editor={editor} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
