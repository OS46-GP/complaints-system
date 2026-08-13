import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Jodit } from "jodit/esm/index.js";
import "jodit/esm/plugins/justify/justify.js";
import "jodit/esm/plugins/indent/indent.js";
import "jodit/esm/plugins/hr/hr.js";
import "jodit/esm/plugins/clean-html/clean-html.js";
import "jodit/esm/plugins/paste/paste.js";
import "jodit/es2015/jodit.min.css";

import { Dom } from "jodit/esm/core/dom/dom.js";
import { Icon } from "jodit/esm/core/ui/icon.js";

Icon.set(
  "direction",
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 5l-7 7 7 7V5zm6 0v14l7-7-7-7z"/></svg>',
);

export interface WysiwygEditorHandle {
  insertHtml: (html: string) => void;
}

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
}

const TOOLBAR = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "eraser",
  "|",
  "ul",
  "ol",
  "|",
  "outdent",
  "indent",
  "|",
  "font",
  "fontsize",
  "paragraph",
  "brush",
  "|",
  "align",
  "direction",
  "superscript",
  "subscript",
  "|",
  "hr",
  "table",
  "|",
  "undo",
  "redo",
];

export const WysiwygEditor = forwardRef<WysiwygEditorHandle, WysiwygEditorProps>(
  function WysiwygEditor(
    { value, onChange, placeholder, height, className },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<Jodit | null>(null);
    const onChangeRef = useRef(onChange);
    const valueRef = useRef(value);

    onChangeRef.current = onChange;
    valueRef.current = value;

    useEffect(() => {
      if (!containerRef.current || editorRef.current) return;

      const editor = Jodit.make(containerRef.current, {
        ...(typeof placeholder === "string" && placeholder.trim()
          ? { placeholder }
          : {}),
        language: "ar",
        direction: "rtl",
        ...(typeof height === "number" ? { height } : {}),
        buttons: TOOLBAR,
        showXPathInStatusbar: false,
        showCharsCounter: false,
        showWordsCounter: false,
        toolbarSticky: false,
        inline: false,
        controls: {
          direction: {
            name: "direction",
            tooltip: "اتجاه النص",
            icon: "direction",
            exec: (jodit: Jodit) => {
              const current = jodit.s.current();
              const block = current
                ? (Dom.closest(current, Dom.isBlock, jodit.editor) ??
                  jodit.editor)
                : jodit.editor;
              const dir = block.getAttribute("dir");
              block.setAttribute("dir", dir === "ltr" ? "rtl" : "ltr");
              jodit.e.fire("change");
            },
          },
        },
      }) as Jodit;

      editorRef.current = editor;

      editor.events?.on("change", () => {
        onChangeRef.current(editor.getEditorValue());
      });

      if (valueRef.current) {
        editor.setEditorValue(valueRef.current);
      }

      return () => {
        editor.destruct();
        editorRef.current = null;
      };
    }, [placeholder]);

    useEffect(() => {
      const editor = editorRef.current;
      if (!editor) return;
      const current = editor.getEditorValue();
      if (current !== valueRef.current) {
        editor.setEditorValue(valueRef.current);
      }
    }, [value]);

    useImperativeHandle(ref, () => ({
      insertHtml(html: string) {
        const editor = editorRef.current;
        if (!editor) return;
        editor.s.insertHTML(html);
        onChangeRef.current(editor.getEditorValue());
      },
    }));

    return <div ref={containerRef} className={className} />;
  },
);
