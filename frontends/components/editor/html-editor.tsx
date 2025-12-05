"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";

interface HtmlEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function HtmlEditor({ value, onChange, placeholder }: HtmlEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            TextStyle,
            Color,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-cyan-400 hover:text-cyan-300 underline",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "max-w-full rounded-lg",
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-invert max-w-none min-h-[200px] px-4 py-3 focus:outline-none text-white",
            },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="html-editor border border-white/20 rounded-lg overflow-hidden bg-white/5">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 p-3 bg-white/10 border-b border-white/20">
                {/* Text Formatting */}
                <div className="flex gap-1 border-r border-white/20 pr-2">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                            editor.isActive("bold")
                                ? "bg-cyan-500 text-white"
                                : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                        type="button"
                    >
                        B
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                            editor.isActive("italic")
                                ? "bg-cyan-500 text-white"
                                : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                        type="button"
                    >
                        I
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                            editor.isActive("underline")
                                ? "bg-cyan-500 text-white"
                                : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                        type="button"
                    >
                        U
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`px-3 py-1.5 rounded text-sm font-semibold transition ${
                            editor.isActive("strike")
                                ? "bg-cyan-500 text-white"
                                : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                        type="button"
                    >
                        S
                    </button>
                </div>

                {/* Headings */}
                <div className="flex gap-1 border-r border-white/20 pr-2">
                    <select
                        onChange={(e) => {
                            const level = parseInt(e.target.value);
                            if (level === 0) {
                                editor.chain().focus().setParagraph().run();
                            } else {
                                editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
                            }
                        }}
                        className="px-2 py-1.5 rounded text-sm bg-white/10 text-white border border-white/20 focus:outline-none focus:border-cyan-400"
                    >
                        <option value="0">Paragraph</option>
                        <option value="1">Heading 1</option>
                        <option value="2">Heading 2</option>
                        <option value="3">Heading 3</option>
                        <option value="4">Heading 4</option>
                    </select>
                </div>

                {/* Lists */}
                <div className="flex gap-1 border-r border-white/20 pr-2">
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`px-3 py-1.5 rounded text-sm transition ${
                            editor.isActive("bulletList")
                                ? "bg-cyan-500 text-white"
                                : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                        type="button"
                    >
                        • List
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`px-3 py-1.5 rounded text-sm transition ${
                            editor.isActive("orderedList")
                                ? "bg-cyan-500 text-white"
                                : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                        type="button"
                    >
                        1. List
                    </button>
                </div>

                {/* Alignment */}
                <div className="flex gap-1 border-r border-white/20 pr-2">
                    <button
                        onClick={() => editor.chain().focus().setTextAlign("left").run()}
                        className={`px-3 py-1.5 rounded text-sm transition ${
                            editor.isActive({ textAlign: "left" })
                                ? "bg-cyan-500 text-white"
                                : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                        type="button"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign("center").run()}
                        className={`px-3 py-1.5 rounded text-sm transition ${
                            editor.isActive({ textAlign: "center" })
                                ? "bg-cyan-500 text-white"
                                : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                        type="button"
                    >
                        ↔
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign("right").run()}
                        className={`px-3 py-1.5 rounded text-sm transition ${
                            editor.isActive({ textAlign: "right" })
                                ? "bg-cyan-500 text-white"
                                : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                        type="button"
                    >
                        →
                    </button>
                </div>

                {/* Link */}
                <div className="flex gap-1 border-r border-white/20 pr-2">
                    <button
                        onClick={() => {
                            const url = window.prompt("Enter URL:");
                            if (url) {
                                editor.chain().focus().setLink({ href: url }).run();
                            }
                        }}
                        className={`px-3 py-1.5 rounded text-sm transition ${
                            editor.isActive("link")
                                ? "bg-cyan-500 text-white"
                                : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                        type="button"
                    >
                        🔗 Link
                    </button>
                    <button
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        className="px-3 py-1.5 rounded text-sm bg-white/10 text-white hover:bg-white/20 transition"
                        type="button"
                        disabled={!editor.isActive("link")}
                    >
                        Unlink
                    </button>
                </div>

                {/* Image */}
                <div className="flex gap-1">
                    <button
                        onClick={() => {
                            const url = window.prompt("Enter image URL:");
                            if (url) {
                                editor.chain().focus().setImage({ src: url }).run();
                            }
                        }}
                        className="px-3 py-1.5 rounded text-sm bg-white/10 text-white hover:bg-white/20 transition"
                        type="button"
                    >
                        🖼️ Image
                    </button>
                </div>
            </div>

            {/* Editor Content */}
            <div className="min-h-[200px] max-h-[400px] overflow-y-auto">
                <EditorContent editor={editor} />
            </div>

            {placeholder && !editor.getText() && (
                <div className="absolute top-20 left-4 text-gray-500 text-sm pointer-events-none">
                    {placeholder}
                </div>
            )}

            <style jsx global>{`
                .html-editor .ProseMirror {
                    outline: none;
                    min-height: 200px;
                    padding: 1rem;
                }
                .html-editor .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: rgba(255, 255, 255, 0.5);
                    pointer-events: none;
                    height: 0;
                }
                .html-editor .ProseMirror a {
                    color: #67e8f9;
                    text-decoration: underline;
                }
                .html-editor .ProseMirror a:hover {
                    color: #a5f3fc;
                }
                .html-editor .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                }
                .html-editor .ProseMirror ul,
                .html-editor .ProseMirror ol {
                    padding-left: 1.5rem;
                    margin: 0.5rem 0;
                }
                .html-editor .ProseMirror h1,
                .html-editor .ProseMirror h2,
                .html-editor .ProseMirror h3,
                .html-editor .ProseMirror h4 {
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                    font-weight: bold;
                }
                .html-editor .ProseMirror h1 {
                    font-size: 2rem;
                }
                .html-editor .ProseMirror h2 {
                    font-size: 1.5rem;
                }
                .html-editor .ProseMirror h3 {
                    font-size: 1.25rem;
                }
                .html-editor .ProseMirror h4 {
                    font-size: 1.1rem;
                }
            `}</style>
        </div>
    );
}
