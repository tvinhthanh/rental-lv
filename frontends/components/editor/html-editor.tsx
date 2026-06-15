"use client";

import React from "react";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";

// Dynamic import with SSR disabled to prevent window/SSR compilation errors in Next.js
const SunEditor = dynamic(() => import("suneditor-react"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[350px] bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-center animate-pulse">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
    ),
});

interface HtmlEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function HtmlEditor({ value, onChange, placeholder }: HtmlEditorProps) {
    const handleChange = (content: string) => {
        onChange(content);
    };

    return (
        <div className="html-editor-wrapper relative">
            <SunEditor
                defaultValue={value}
                onChange={handleChange}
                placeholder={placeholder}
                setOptions={{
                    buttonList: [
                        ["undo", "redo"],
                        ["font", "fontSize", "formatBlock"],
                        ["paragraphStyle", "blockquote"],
                        ["bold", "underline", "italic", "strike", "subscript", "superscript"],
                        ["removeFormat"],
                        ["fontColor", "hiliteColor"],
                        ["outdent", "indent"],
                        ["align", "horizontalRule", "list", "lineHeight"],
                        ["table", "link", "image", "video"],
                        ["fullScreen", "showBlocks", "codeView"],
                        ["preview"]
                    ],
                    defaultTag: "p",
                    minHeight: "250px",
                    height: "auto",
                    showPathLabel: false,
                }}
            />
        </div>
    );
}
