import { Fragment } from "react";

interface HighlightTextProps {
  text: string;
  query?: string;
  queries?: string[];
  className?: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function HighlightText({
  text,
  query,
  queries,
  className,
}: HighlightTextProps) {
  const parts = (query ? [query] : queries ?? [])
    .map((q) => q.trim())
    .filter(Boolean);

  if (parts.length === 0 || !text) {
    return <span className={className}>{text}</span>;
  }

  const pattern = new RegExp(`(${parts.map(escapeRegExp).join("|")})`, "gi");
  const segments = text.split(pattern);

  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment && parts.some((p) => p.toLowerCase() === segment.toLowerCase()) ? (
          <mark
            key={index}
            className="rounded-[2px] bg-primary/20 px-0.5 font-bold text-primary"
          >
            {segment}
          </mark>
        ) : (
          <Fragment key={index}>{segment}</Fragment>
        ),
      )}
    </span>
  );
}