"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useMemo } from "react";

interface TipTapViewerProps {
    content: unknown;
    className?: string;
}

type TipTapRenderableContent = string | Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeTipTapContent = (value: unknown): TipTapRenderableContent => {
    if (value == null) return "";

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return "";

        try {
            return normalizeTipTapContent(JSON.parse(trimmed));
        } catch {
            return value;
        }
    }

    if (Array.isArray(value)) {
        return {
            type: "doc",
            content: value,
        };
    }

    if (isRecord(value)) {
        const hasTipTapType = typeof value.type === "string";
        const wrappedContent = value.content;

        if (!hasTipTapType && wrappedContent !== undefined) {
            return normalizeTipTapContent(wrappedContent);
        }

        return value;
    }

    return String(value);
};

export default function TipTapViewer({ content, className = "" }: TipTapViewerProps) {
    const normalizedContent = useMemo(() => normalizeTipTapContent(content), [content]);

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
        content: normalizedContent,
        shouldRerenderOnTransaction: false,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: `tiptap prose prose-slate prose-sm md:prose-base max-w-none text-slate-600 leading-relaxed focus:outline-none cursor-default prose-headings:text-slate-950 prose-headings:font-bold prose-p:my-2 prose-li:my-1 prose-strong:text-slate-900 ${className}`.trim(),
            },
        },
    });

    useEffect(() => {
        if (editor) {
            // Allow the preview to update if content changes externally.
            editor.commands.setContent(normalizedContent);
        }
    }, [editor, normalizedContent]);

    if (!editor) {
        return null;
    }

    return <EditorContent editor={editor} />;
}
