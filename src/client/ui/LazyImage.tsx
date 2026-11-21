import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../shared/cn.js";

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  objectFit?: "cover" | "contain" | "contain-mobile";
  priority?: boolean; // LCP optimization: skip lazy loading
  rootMargin?: string;
}

/**
 * Image component with intersection observer lazy loading and LCP optimization.
 */
export function LazyImage({
  src,
  alt,
  className,
  fallback,
  objectFit = "cover",
  priority = false,
  rootMargin = "200px",
  srcSet,
  sizes,
  style,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const srcKey = `${src ?? ""}|${srcSet ?? ""}`;
  // Track loaded/error state keyed by srcKey so changing src resets state without an effect
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [observedInView, setObservedInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only eagerly reveal when IntersectionObserver is missing in a real browser (preserve SSR lazy behavior)
  const isInView =
    priority ||
    observedInView ||
    (typeof window !== "undefined" && typeof IntersectionObserver === "undefined");
  const isLoaded = loadedKey === srcKey;
  const hasError = errorKey === srcKey;

  // Detect images already satisfied from browser cache before onLoad fires
  const handleImgRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth > 0) {
        setLoadedKey(srcKey);
      }
    },
    [srcKey],
  );

  useEffect(() => {
    if (isInView) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setObservedInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [isInView, rootMargin]);

  if (hasError && fallback) return <>{fallback}</>;

  return (
    <div
      ref={containerRef}
      className={cn("bg-muted relative overflow-hidden", className)}
      style={style}
    >
      {isInView && (
        <img
          ref={handleImgRef}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          className={cn(
            "block w-full transition-opacity duration-500",
            style?.aspectRatio ? "h-full" : "h-auto",
            objectFit === "contain"
              ? "object-contain"
              : objectFit === "contain-mobile"
                ? "object-contain md:object-cover"
                : "object-cover",
            isLoaded ? "opacity-100" : "opacity-0",
          )}
          {...props}
          // Compose consumer callbacks with internal state updates after spreading props
          onLoad={(e) => {
            setLoadedKey(srcKey);
            onLoad?.(e);
          }}
          onError={(e) => {
            setErrorKey(srcKey);
            onError?.(e);
          }}
        />
      )}
    </div>
  );
}
