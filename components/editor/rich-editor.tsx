"use client";

import { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import { Button } from "../button";

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const lowlight = createLowlight();

export function RichEditor({ value, onChange, placeholder = "Start writing..." }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight })
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "min-h-[240px] w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 outline-none focus:border-brand-500"
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const toolbar = useMemo(
    () => [
      { label: "Bold", command: () => editor?.chain().focus().toggleBold().run() },
      { label: "Italic", command: () => editor?.chain().focus().toggleItalic().run() },
      { label: "Heading", command: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
      { label: "Bullet List", command: () => editor?.chain().focus().toggleBulletList().run() },
      { label: "Ordered List", command: () => editor?.chain().focus().toggleOrderedList().run() },
      { label: "Code Block", command: () => editor?.chain().focus().toggleCodeBlock().run() },
      { label: "Quote", command: () => editor?.chain().focus().toggleBlockquote().run() }
    ],
    [editor]
  );

  if (!editor) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {toolbar.map((item) => (
          <Button key={item.label} type="button" variant="secondary" onClick={item.command}>
            {item.label}
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
