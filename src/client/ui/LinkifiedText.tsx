import React from "react";
import { parseLinkSegments } from "../../shared/text/linkify.js";
import { cn } from "../../shared/cn.js";

export interface LinkifiedTextProps {
  text: string;
  /** Override link classes */
  linkClassName?: string;
}

/**
 * Renders plain text with URLs converted to clickable links.
 * Uses parseLinkSegments (pure function) from shared/text.
 */
export function LinkifiedText({ text, linkClassName }: LinkifiedTextProps) {
  if (!text) return null;

  const segments = parseLinkSegments(text);

  return (
    <>
      {segments.map((seg, i) =>
        seg.isUrl ? (
          <a
            key={i}
            href={seg.text}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-blue-600 hover:underline font-medium dark:text-blue-400",
              linkClassName,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {seg.text}
          </a>
        ) : (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        ),
      )}
    </>
  );
}
