import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="font-heading text-headline-md font-bold text-foreground mb-3">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading text-body-lg font-bold text-foreground mt-5 mb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading text-label-md font-bold text-foreground mt-4 mb-1">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-foreground mb-3 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pr-5 space-y-1.5 my-3 marker:text-primary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pr-5 space-y-1.5 my-3 marker:text-primary">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-foreground">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-bold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em>{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-r-2 border-primary pr-3 my-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-border" />,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-primary underline underline-offset-2"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-mono-data text-xs text-foreground">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre
      dir="ltr"
      className="overflow-x-auto rounded-lg bg-muted p-3 my-3 text-left font-mono text-xs"
    >
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-body-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-border px-3 py-2 font-heading font-semibold text-foreground text-right">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-3 py-1.5 text-foreground text-right align-top">
      {children}
    </td>
  ),
};

interface MarkdownProps {
  children: string;
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <div dir="rtl" className="font-body text-body-md leading-7">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}