import { Fragment, type ReactNode } from "react";

/** mini-markdown: **negrito**, quebras de linha e bullets "• "/"- " */
export function md(text: string): ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const bullet = /^\s*[•\-]\s+/.test(line);
    const content = bullet ? line.replace(/^\s*[•\-]\s+/, "") : line;
    return (
      <Fragment key={i}>
        {bullet ? (
          <span className="flex gap-2">
            <span className="text-navy-500 select-none">•</span>
            <span>{bold(content)}</span>
          </span>
        ) : (
          <span>{bold(content)}</span>
        )}
        {i < lines.length - 1 && <br />}
      </Fragment>
    );
  });
}

function bold(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return (
        <strong key={i} className="font-semibold text-ink">
          {p.slice(2, -2)}
        </strong>
      );
    if (p.startsWith("_") && p.endsWith("_"))
      return (
        <em key={i} className="text-muted not-italic opacity-80">
          {p.slice(1, -1)}
        </em>
      );
    return <Fragment key={i}>{p}</Fragment>;
  });
}
