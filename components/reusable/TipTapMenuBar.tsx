import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Editor } from "@tiptap/react";
import { Toggle } from "../ui/toggle";

export default function TipTapMenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null;
  }

  const menuOptions = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
      label: "Bold",
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
      label: "Italic",
    },
    {
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike"),
      label: "Strikethrough",
    },
    {
      icon: AlignLeft,
      action: () => editor.chain().focus().setTextAlign("left").run(),
      isActive: () => editor.isActive({ textAlign: "left" }),
      label: "Align Left",
    },
    {
      icon: AlignCenter,
      action: () => editor.chain().focus().setTextAlign("center").run(),
      isActive: () => editor.isActive({ textAlign: "center" }),
      label: "Align Center",
    },
    {
      icon: AlignRight,
      action: () => editor.chain().focus().setTextAlign("right").run(),
      isActive: () => editor.isActive({ textAlign: "right" }),
      label: "Align Right",
    },
    {
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList"),
      label: "Bullet List",
    },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList"),
      label: "Ordered List",
    },
    {
      icon: Undo,
      action: () => editor.chain().focus().undo().run(),
      isActive: () => false,
      label: "Undo",
    },
    {
      icon: Redo,
      action: () => editor.chain().focus().redo().run(),
      isActive: () => false,
      label: "Redo",
    },
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {menuOptions.map((option, index) => (
        <Toggle
          key={index}
          size="sm"
          pressed={option.isActive()}
          onPressedChange={option.action}
          aria-label={option.label}
          className="h-8 w-8 p-0"
        >
          <option.icon className="h-4 w-4" />
        </Toggle>
      ))}
    </div>
  );
}
