"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  ImageIcon,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Table as TableIcon,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";

interface MenuButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  title?: string;
}

const MenuButton = ({
  onClick,
  isActive,
  children,
  title,
}: MenuButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded hover:bg-[var(--custom-100)] transition-colors ${
      isActive
        ? "bg-[var(--custom-500)] text-white"
        : "text-gray-700 hover:text-[var(--custom-600)]"
    }`}
    title={title}
  >
    {children}
  </button>
);

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content = "",
  onChange,
  placeholder = "Write your content...",
}) => {
  const [isUploading, setIsUploading] = React.useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "tiptap-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!editor) return;
    const update = () => setTick((t) => t + 1);
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content && content !== current) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
    if (!content && current !== "") {
      editor.commands.clearContent();
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="min-h-[500px] w-full bg-white border border-gray-300 rounded-lg flex items-center justify-center">
        <div className="text-gray-400">Loading editor...</div>
      </div>
    );
  }

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    const loadingToast = toast.loading("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      editor.chain().focus().setImage({ src: data.url }).run();
      toast.success("Image uploaded successfully!", { id: loadingToast });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload image";
      toast.error(errorMessage, {
        id: loadingToast,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target?.files?.[0];
      if (file) {
        await uploadImage(file);
      }
    };
    input.click();
  };

  const addImageUrl = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertDefaultTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div className="border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="border-b border-gray-300 p-3 bg-gray-50">
        <div className="flex items-center space-x-1 overflow-x-auto">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive("paragraph")}
            title="Paragraph"
          >
            <Type className="w-4 h-4" />
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <MenuButton
            onClick={insertDefaultTable}
            isActive={editor.isActive("table")}
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().addRowAfter().run()}
            isActive={false}
            title="Add Row"
          >
            <Plus className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().deleteTable().run()}
            isActive={false}
            title="Delete Table"
          >
            <Trash2 className="w-4 h-4" />
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <MenuButton
            onClick={addLink}
            isActive={editor.isActive("link")}
            title="Add Link"
          >
            <Link2 className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={handleImageUpload}
            isActive={false}
            title="Upload Image"
          >
            <Upload className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={addImageUrl}
            isActive={false}
            title="Add Image URL"
          >
            <ImageIcon className="w-4 h-4" />
          </MenuButton>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            isActive={false}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            isActive={false}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </MenuButton>
        </div>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose prose-lg max-w-none min-h-[500px] focus:outline-none"
      />

      {isUploading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="text-[var(--custom-600)]">Uploading...</div>
        </div>
      )}

      <style jsx global>{`
        .ProseMirror {
          padding: 1.5rem;
          min-height: 500px;
          outline: none;
          color: #1f2937;
          background-color: white;
        }

        .ProseMirror h1 {
          color: var(--custom-600);
          font-size: 2rem;
          font-weight: bold;
          margin: 1.5rem 0 1rem 0;
        }

        .ProseMirror h2 {
          color: var(--custom-600);
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1.25rem 0 0.75rem 0;
        }

        .ProseMirror h3 {
          color: var(--custom-600);
          font-size: 1.25rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
        }

        .ProseMirror p {
          color: #374151;
          margin: 0.75rem 0;
          line-height: 1.75;
        }

        .ProseMirror strong {
          font-weight: 600;
          color: #111827;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror code {
          background-color: #f3f4f6;
          color: var(--custom-600);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: "Courier New", monospace;
          font-size: 0.875em;
        }

        .ProseMirror blockquote {
          border-left: 4px solid var(--custom-500);
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: #6b7280;
          font-style: italic;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .ProseMirror ol {
          list-style-type: decimal;
          list-style-position: outside;
        }

        .ProseMirror ul {
          list-style-type: disc;
          list-style-position: outside;
        }

        .ProseMirror li {
          color: #374151;
          margin: 0.5rem 0;
          display: list-item;
        }

        .ProseMirror a {
          color: var(--custom-600);
          text-decoration: underline;
          cursor: pointer;
        }

        .ProseMirror a:hover {
          color: var(--custom-700);
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        }

        .ProseMirror table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        }

        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem 1rem;
          vertical-align: top;
        }

        .ProseMirror th {
          background-color: var(--custom-50);
          color: var(--custom-700);
          font-weight: 600;
        }

        .ProseMirror tr:nth-child(even) td {
          background-color: #f9fafb;
        }

        .ProseMirror .selectedCell {
          background-color: var(--custom-100);
        }

        .ProseMirror .is-empty::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          height: 0;
          float: left;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
