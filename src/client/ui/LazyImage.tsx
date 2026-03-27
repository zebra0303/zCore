import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../shared/cn.js";

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  objectFit?: "cover" | "contain" | "contain-mobile";
  priority?: boolean; // LCP optimization: skip lazy loading
  rootMargin?: string;
}

/**
 * Image component with intersection observer lazy loading and LCP optimization.
 * Synchronized from zlog project for global use.
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
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || isInView) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [priority, isInView, rootMargin]);

  if (hasError && fallback) return <>{fallback}</>;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden bg-gray-100 dark:bg-gray-800", className)}
      style={style}
    >
      {isInView && (
        <img
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
          onLoad={() => {
            setIsLoaded(true);
          }}
          onError={() => {
            setHasError(true);
          }}
          {...props}
        />
      )}
    </div>
  );
}
