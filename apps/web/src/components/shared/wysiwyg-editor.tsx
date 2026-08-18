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
  variableLabels?: Record<string, string>;
  variableTypes?: Record<string, string>;
  variableImageSources?: Record<string, string | null>;
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

const IMAGE_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="jodit-image-variable__icon"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';

function escapeChipLabel(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function rawToChips(
  html: string,
  labels: Record<string, string>,
  types: Record<string, string>,
  sources: Record<string, string | null>,
): string {
  html = html.replace(/src="\{\{([^}]+)\}\}"/g, (match, key: string) => {
    const url = sources[key];
    return url ? `src="${url}"` : match;
  });
  return html.replace(/\{\{([^}]+)\}\}/g, (_match, key: string) => {
    const label = labels[key] ?? key;
    if (types[key] === "image") {
      return `<span class="jodit-image-variable" data-variable="${key}">${IMAGE_ICON_SVG}<span class="jodit-image-variable__label">${escapeChipLabel(label)}</span></span>`;
    }
    return `<span class="jodit-variable-chip" data-variable="${key}">${escapeChipLabel(label)}</span>`;
  });
}

function chipsToRaw(
  html: string,
  sources: Record<string, string | null>,
): string {
  const urlToKey = new Map<string, string>();
  for (const [key, url] of Object.entries(sources)) {
    if (url) urlToKey.set(url, key);
  }
  html = html.replace(/src="([^"]+)"/g, (match, url: string) => {
    const key = urlToKey.get(url);
    return key ? `src="{{${key}}}"` : match;
  });
  return html.replace(
    /<span[^>]*data-variable="([^"]+)"[^>]*>[\s\S]*?<\/span>/g,
    (_match, key: string) => `{{${key}}}`,
  );
}

export const WysiwygEditor = forwardRef<WysiwygEditorHandle, WysiwygEditorProps>(
  function WysiwygEditor(
    { value, onChange, placeholder, height, className, variableLabels, variableTypes, variableImageSources },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<Jodit | null>(null);
    const onChangeRef = useRef(onChange);
    const valueRef = useRef(value);
    const labelsRef = useRef<Record<string, string>>({});
    const typesRef = useRef<Record<string, string>>({});
    const sourcesRef = useRef<Record<string, string | null>>({});

    onChangeRef.current = onChange;
    valueRef.current = value;
    labelsRef.current = variableLabels ?? {};
    typesRef.current = variableTypes ?? {};
    sourcesRef.current = variableImageSources ?? {};

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

      editor.events?.on("beforeSetValueToEditor", (html: unknown) => {
        if (typeof html !== "string") return;
        return rawToChips(html, labelsRef.current, typesRef.current, sourcesRef.current);
      });

      editor.events?.on("beforeGetValueFromEditor", () => {
        const currentHtml = editor.getNativeEditorValue();
        const raw = chipsToRaw(currentHtml, sourcesRef.current);
        if (raw !== currentHtml) return raw;
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

    useEffect(() => {
      const editor = editorRef.current;
      if (!editor) return;
      const currentHtml = editor.getNativeEditorValue();
      const raw = chipsToRaw(currentHtml, sourcesRef.current);
      if (raw !== currentHtml) {
        editor.setNativeEditorValue(
          rawToChips(raw, labelsRef.current, typesRef.current, sourcesRef.current),
        );
      }
    }, [variableLabels, variableTypes, variableImageSources]);

    useImperativeHandle(ref, () => ({
      insertHtml(html: string) {
        const editor = editorRef.current;
        if (!editor) return;
        editor.s.insertHTML(
          rawToChips(html, labelsRef.current, typesRef.current, sourcesRef.current),
        );
        onChangeRef.current(editor.getEditorValue());
      },
    }));

    return <div ref={containerRef} className={className} />;
  },
);