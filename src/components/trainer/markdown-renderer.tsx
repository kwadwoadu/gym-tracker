"use client";

import ReactMarkdown, { type Components } from "react-markdown";

const components: Components = {
  strong: ({ children }) => (
    <strong className="text-primary font-semibold">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="list-disc ml-4 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal ml-4 space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="marker:text-primary">{children}</li>
  ),
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  em: ({ children }) => (
    <em className="text-muted-foreground italic">{children}</em>
  ),
};

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="text-sm text-white leading-relaxed">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
