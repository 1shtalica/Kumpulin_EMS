"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";

interface TipTapViewerProps {
    content: string;
}

export default function TipTapViewer({ content }: TipTapViewerProps) {
    const editor = useEditor({
        editable: false,
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
        shouldRerenderOnTransaction: false,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "tiptap prose prose-slate prose-sm max-w-none text-foreground/90 leading-relaxed focus:outline-none cursor-default",
            },
        },
    });

    useEffect(() => {
        if (editor && content) {
            // Allow the preview to update if content changes externally
            try {
                const json = JSON.parse(content);
                editor.commands.setContent(json);
            } catch {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return <EditorContent editor={editor} />;
}
