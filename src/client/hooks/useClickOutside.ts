import { useEffect, useRef, type RefObject } from "react";

/**
 * Hook that calls handler when a pointer interaction occurs outside the referenced element.
 * Uses a ref for handler to avoid re-attaching document listeners on every render.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled = true,
): void {
  const handlerRef = useRef(handler);
  // Keep latest handler in ref via effect to satisfy React Compiler ref rules
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;
    const handleClickOutside = (e: PointerEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        handlerRef.current();
      }
    };
    // Use pointerdown to cover mouse, touch, and pen uniformly
    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [ref, enabled]);
}
