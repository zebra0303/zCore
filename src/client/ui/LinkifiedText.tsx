import React from "react";
import { parseLinkSegments } from "../../shared/text/linkify.js";
import { cn } from "../../shared/cn.js";

export interface LinkifiedTextProps {
  text: string;
  /** Override link classes */
  linkClassName?: string;
}

/**
 * Renders plain text with validated http/https URLs converted to clickable links.
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
              "font-medium break-words text-blue-600 hover:underline dark:text-blue-400",
              linkClassName,
            )}
            onClick={(e) => {
              e.stopPropagation();
            }}
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
