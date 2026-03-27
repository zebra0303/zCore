// src/client/stores/createToastStore.ts
import { create } from "zustand";
function createToastStore(options = {}) {
  const { duration = 3e3 } = options;
  return create((set) => ({
    toasts: [],
    showToast: (message, type = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }));
      }, duration);
    },
    removeToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }
  }));
}

// src/client/stores/createConfirmStore.ts
import { create as create2 } from "zustand";
function createConfirmStore() {
  return create2((set, get) => ({
    isOpen: false,
    message: "",
    resolve: null,
    confirm: (message) => {
      return new Promise((resolve) => {
        set({ isOpen: true, message, resolve });
      });
    },
    onConfirm: () => {
      const { resolve } = get();
      if (resolve) resolve(true);
      set({ isOpen: false, resolve: null });
    },
    onCancel: () => {
      const { resolve } = get();
      if (resolve) resolve(false);
      set({ isOpen: false, resolve: null });
    }
  }));
}

// src/client/hooks/useClickOutside.ts
import { useEffect } from "react";
function useClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        handler();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler, enabled]);
}

// src/shared/errors/ApiError.ts
var ApiError = class extends Error {
  status;
  details;
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
};

// src/client/api/ApiClient.ts
var ApiClient = class {
  baseUrl;
  getAuthHeaders;
  onUnauthorized;
  credentials;
  retries;
  retryDelay;
  constructor(options = {}) {
    this.baseUrl = options.baseUrl ?? "/api";
    this.getAuthHeaders = options.getAuthHeaders ?? (() => ({}));
    this.onUnauthorized = options.onUnauthorized ?? (() => {
    });
    this.credentials = options.credentials ?? "include";
    this.retries = options.retries ?? 0;
    this.retryDelay = options.retryDelay ?? 1e3;
  }
  /** Extract error message from a failed response. */
  async extractErrorMessage(res, fallback) {
    const text = await res.text().catch(() => "");
    if (!text) return fallback;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === "object" && parsed !== null) {
        const obj = parsed;
        if (typeof obj.error === "string" && obj.error.trim()) {
          return obj.error;
        }
        if (typeof obj.message === "string" && obj.message.trim()) {
          return obj.message;
        }
      }
    } catch {
      const titleMatch = /<title>(.*?)<\/title>/i.exec(text);
      if (titleMatch?.[1]) {
        return titleMatch[1].trim();
      }
      const trimmed = text.trim();
      if (!trimmed.startsWith("<") && trimmed.length > 0 && trimmed.length < 200) {
        return trimmed;
      }
    }
    return fallback;
  }
  /** Build headers for a request. */
  buildHeaders(contentType) {
    const headers = { ...this.getAuthHeaders() };
    if (contentType) headers["Content-Type"] = contentType;
    return headers;
  }
  /** Handle non-ok response: fire unauthorized callback if 401, then throw. */
  async handleError(res, path) {
    if (res.status === 401) {
      this.onUnauthorized(path);
    }
    const fallback = `HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ""}`;
    throw new ApiError(await this.extractErrorMessage(res, fallback), res.status);
  }
  /** Internal fetch wrapper with retry logic for 5xx and network errors */
  async fetchWithRetry(path, init) {
    const url = `${this.baseUrl}${path}`;
    const headers = { ...init.headers };
    headers.Accept ??= "application/json";
    init.headers = headers;
    let lastError;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const res = await fetch(url, init);
        if (!res.ok && (res.status >= 500 || res.status === 429)) {
          if (attempt < this.retries) {
            await new Promise(
              (resolve) => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt))
            );
            continue;
          }
        }
        return res;
      } catch (error) {
        lastError = error;
        if (attempt < this.retries) {
          await new Promise(
            (resolve) => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt))
          );
          continue;
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Request failed");
  }
  async get(path, extraHeaders) {
    const headers = { ...this.buildHeaders(), ...extraHeaders };
    const res = await this.fetchWithRetry(path, {
      method: "GET",
      headers,
      credentials: this.credentials
    });
    if (!res.ok) return this.handleError(res, path);
    return res.json();
  }
  async post(path, body) {
    const res = await this.fetchWithRetry(path, {
      method: "POST",
      headers: this.buildHeaders("application/json"),
      credentials: this.credentials,
      body: body ? JSON.stringify(body) : void 0
    });
    if (!res.ok) return this.handleError(res, path);
    return res.json();
  }
  async put(path, body) {
    const res = await this.fetchWithRetry(path, {
      method: "PUT",
      headers: this.buildHeaders("application/json"),
      credentials: this.credentials,
      body: body ? JSON.stringify(body) : void 0
    });
    if (!res.ok) return this.handleError(res, path);
    return res.json();
  }
  async delete(path, body) {
    const res = await this.fetchWithRetry(path, {
      method: "DELETE",
      headers: this.buildHeaders(body ? "application/json" : void 0),
      credentials: this.credentials,
      body: body ? JSON.stringify(body) : void 0
    });
    if (!res.ok) return this.handleError(res, path);
    return res.json();
  }
  async upload(path, formData) {
    const headers = this.buildHeaders();
    const res = await this.fetchWithRetry(path, {
      method: "POST",
      headers,
      credentials: this.credentials,
      body: formData
    });
    if (!res.ok) return this.handleError(res, path);
    return res.json();
  }
};

// src/shared/cn.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/client/ui/Skeleton.tsx
import { jsx } from "react/jsx-runtime";
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700", className),
      ...props
    }
  );
}

// src/client/ui/Modal.tsx
import { useEffect as useEffect2, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  closeButtonClassName
}) {
  const dialogRef = useRef(null);
  useEffect2(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };
  if (!isOpen) return null;
  return createPortal(
    /* @__PURE__ */ jsxs(
      "dialog",
      {
        ref: dialogRef,
        className: cn(
          "fixed inset-0 z-50 m-auto flex max-h-[85vh] w-[calc(100%-2rem)] max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl backdrop:bg-black/50 sm:w-full dark:bg-gray-800",
          className
        ),
        onClose,
        onClick: handleBackdropClick,
        children: [
          title && /* @__PURE__ */ jsx2("div", { className: "pr-6 text-lg font-semibold text-gray-900 dark:text-gray-100", children: title }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: onClose,
              className: cn(
                "absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none",
                closeButtonClassName
              ),
              children: [
                /* @__PURE__ */ jsx2(X, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx2("span", { className: "sr-only", children: "Close" })
              ]
            }
          ),
          /* @__PURE__ */ jsx2("div", { className: "overflow-y-auto", children })
        ]
      }
    ),
    document.body
  );
}

// src/client/ui/Pagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function buildPageList(currentPage, totalPages, delta = 2) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || i >= currentPage - delta && i <= currentPage + delta) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return pages;
}
var baseBtn = "inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors disabled:pointer-events-none disabled:opacity-50";
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  buttonClassName,
  activeButtonClassName
}) {
  if (totalPages <= 1) return null;
  const pages = buildPageList(currentPage, totalPages);
  return /* @__PURE__ */ jsxs2(
    "nav",
    {
      "aria-label": `Page ${currentPage} of ${totalPages}`,
      className: cn("flex items-center justify-center gap-1", className),
      children: [
        /* @__PURE__ */ jsx3(
          "button",
          {
            className: cn(baseBtn, buttonClassName),
            disabled: currentPage === 1,
            onClick: () => {
              onPageChange(currentPage - 1);
            },
            "aria-label": "Previous page",
            children: /* @__PURE__ */ jsx3(ChevronLeft, { className: "h-4 w-4" })
          }
        ),
        pages.map(
          (page, i) => page === "..." ? /* @__PURE__ */ jsx3("span", { className: "px-2 text-gray-400", children: "..." }, `e-${i}`) : /* @__PURE__ */ jsx3(
            "button",
            {
              className: cn(
                baseBtn,
                page === currentPage ? cn(
                  "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900",
                  activeButtonClassName
                ) : buttonClassName
              ),
              onClick: () => {
                onPageChange(page);
              },
              "aria-current": page === currentPage ? "page" : void 0,
              children: page
            },
            page
          )
        ),
        /* @__PURE__ */ jsx3(
          "button",
          {
            className: cn(baseBtn, buttonClassName),
            disabled: currentPage === totalPages,
            onClick: () => {
              onPageChange(currentPage + 1);
            },
            "aria-label": "Next page",
            children: /* @__PURE__ */ jsx3(ChevronRight, { className: "h-4 w-4" })
          }
        )
      ]
    }
  );
}

// src/client/ui/ToastContainer.tsx
import { CheckCircle, AlertTriangle, Info, X as X2 } from "lucide-react";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var iconMap = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info
};
var borderMap = {
  success: "border-green-300 dark:border-green-700",
  error: "border-red-300 dark:border-red-700",
  info: "border-blue-300 dark:border-blue-700"
};
var iconColorMap = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-blue-500"
};
function ToastContainer({
  toasts,
  removeToast,
  className,
  toastClassName
}) {
  if (toasts.length === 0) return null;
  return /* @__PURE__ */ jsx4(
    "div",
    {
      "aria-live": "assertive",
      className: cn(
        "pointer-events-none fixed inset-0 z-[200] flex flex-col items-center justify-end gap-2 px-4 py-6 sm:items-end sm:justify-end",
        className
      ),
      children: toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return /* @__PURE__ */ jsxs3(
          "div",
          {
            className: cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-lg border bg-white p-4 shadow-lg dark:bg-gray-800",
              borderMap[toast.type],
              toastClassName
            ),
            role: "alert",
            children: [
              /* @__PURE__ */ jsx4(Icon, { className: cn("h-5 w-5 shrink-0", iconColorMap[toast.type]) }),
              /* @__PURE__ */ jsx4("p", { className: "flex-1 text-sm font-medium text-gray-900 dark:text-gray-100", children: toast.message }),
              /* @__PURE__ */ jsxs3(
                "button",
                {
                  type: "button",
                  className: "shrink-0 rounded-md text-gray-400 hover:text-gray-600 focus:ring-2 focus:outline-none dark:hover:text-gray-200",
                  onClick: () => {
                    removeToast(toast.id);
                  },
                  children: [
                    /* @__PURE__ */ jsx4("span", { className: "sr-only", children: "Close" }),
                    /* @__PURE__ */ jsx4(X2, { className: "h-4 w-4" })
                  ]
                }
              )
            ]
          },
          toast.id
        );
      })
    }
  );
}

// src/client/ui/ConfirmModal.tsx
import { AlertTriangle as AlertTriangle2 } from "lucide-react";

// src/client/ui/Button.tsx
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { jsx as jsx5 } from "react/jsx-runtime";
var Button = React.forwardRef(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const v = variant === "primary" ? "default" : variant === "danger" ? "destructive" : variant;
    const s = size === "md" ? "default" : size;
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx5(
      Comp,
      {
        ref,
        className: cn(
          "focus-visible:ring-primary ring-offset-background inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": v === "default",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": v === "secondary",
            "border-input bg-background hover:bg-accent hover:text-accent-foreground border": v === "outline",
            "hover:bg-accent hover:text-accent-foreground": v === "ghost",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90": v === "destructive",
            "text-primary underline-offset-4 hover:underline": v === "link",
            "h-7 rounded-md px-2 text-xs": s === "xs",
            "h-9 rounded-md px-3": s === "sm",
            "h-10 px-4 py-2": s === "default",
            "h-11 rounded-md px-8": s === "lg",
            "h-10 w-10": s === "icon"
          },
          className
        ),
        ...props
      }
    );
  }
);
Button.displayName = "Button";

// src/client/ui/ConfirmModal.tsx
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
  className
}) {
  if (!isOpen) return null;
  const variantStyles = {
    danger: "text-destructive bg-destructive/10",
    warning: "text-amber-600 bg-amber-500/10",
    info: "text-blue-600 bg-blue-500/10"
  };
  const buttonVariants = {
    danger: "destructive",
    warning: "default",
    info: "default"
  };
  return /* @__PURE__ */ jsx6(
    "div",
    {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "confirm-modal-title",
      className: "bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm",
      children: /* @__PURE__ */ jsx6(
        "div",
        {
          className: cn(
            "bg-card text-card-foreground w-full max-w-sm overflow-hidden rounded-xl border shadow-lg",
            className
          ),
          onClick: (e) => {
            e.stopPropagation();
          },
          children: /* @__PURE__ */ jsxs4("div", { className: "p-6", children: [
            /* @__PURE__ */ jsxs4("div", { className: "mb-4 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx6("div", { className: `rounded-full p-2 ${variantStyles[variant]}`, children: /* @__PURE__ */ jsx6(AlertTriangle2, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsx6("h3", { id: "confirm-modal-title", className: "text-lg font-semibold tracking-tight", children: title })
            ] }),
            /* @__PURE__ */ jsx6("div", { className: "text-muted-foreground mb-6 text-sm leading-relaxed", children: message }),
            /* @__PURE__ */ jsxs4("div", { className: "flex justify-end gap-3", children: [
              /* @__PURE__ */ jsx6(Button, { variant: "outline", onClick: onCancel, children: cancelLabel }),
              /* @__PURE__ */ jsx6(
                Button,
                {
                  variant: buttonVariants[variant],
                  onClick: () => {
                    onConfirm();
                    onCancel();
                  },
                  children: confirmLabel
                }
              )
            ] })
          ] })
        }
      )
    }
  );
}

// src/client/ui/LinkifiedText.tsx
import React2 from "react";

// src/shared/text/linkify.ts
var URL_REGEX = /(https?:\/\/[^\s]+)/g;
function parseLinkSegments(text) {
  if (!text) return [];
  const parts = text.split(URL_REGEX);
  const segments = [];
  for (const part of parts) {
    if (!part) continue;
    segments.push({ text: part, isUrl: URL_REGEX.test(part) });
    URL_REGEX.lastIndex = 0;
  }
  return segments;
}

// src/client/ui/LinkifiedText.tsx
import { Fragment, jsx as jsx7 } from "react/jsx-runtime";
function LinkifiedText({ text, linkClassName }) {
  if (!text) return null;
  const segments = parseLinkSegments(text);
  return /* @__PURE__ */ jsx7(Fragment, { children: segments.map(
    (seg, i) => seg.isUrl ? /* @__PURE__ */ jsx7(
      "a",
      {
        href: seg.text,
        target: "_blank",
        rel: "noopener noreferrer",
        className: cn(
          "font-medium text-blue-600 hover:underline dark:text-blue-400",
          linkClassName
        ),
        onClick: (e) => {
          e.stopPropagation();
        },
        children: seg.text
      },
      i
    ) : /* @__PURE__ */ jsx7(React2.Fragment, { children: seg.text }, i)
  ) });
}

// src/client/ui/Checkbox.tsx
import React3 from "react";
import { Check } from "lucide-react";
import { jsx as jsx8, jsxs as jsxs5 } from "react/jsx-runtime";
var Checkbox = React3.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxs5("div", { className: "relative flex items-center", children: [
      /* @__PURE__ */ jsx8(
        "input",
        {
          type: "checkbox",
          className: cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-gray-900 bg-transparent shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 appearance-none checked:bg-primary checked:border-primary dark:border-gray-500",
            className
          ),
          ref,
          ...props
        }
      ),
      /* @__PURE__ */ jsx8(Check, { className: "pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-primary-foreground opacity-0 peer-checked:opacity-100" })
    ] });
  }
);
Checkbox.displayName = "Checkbox";

// src/client/ui/Select.tsx
import React4 from "react";
import { ChevronDown } from "lucide-react";
import { jsx as jsx9, jsxs as jsxs6 } from "react/jsx-runtime";
var Select = React4.forwardRef(
  ({ className, children, ...props }, ref) => {
    return /* @__PURE__ */ jsxs6("div", { className: "relative", children: [
      /* @__PURE__ */ jsx9(
        "select",
        {
          className: cn(
            "flex h-10 w-full appearance-none rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-primary",
            className
          ),
          ref,
          ...props,
          children
        }
      ),
      /* @__PURE__ */ jsx9(ChevronDown, { className: "pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-500 opacity-50 dark:text-gray-400" })
    ] });
  }
);
Select.displayName = "Select";

// src/client/ui/ToggleSwitch.tsx
import { jsx as jsx10 } from "react/jsx-runtime";
function ToggleSwitch({ checked, onToggle, label, size = "md", className, ...props }) {
  const isMd = size === "md";
  return /* @__PURE__ */ jsx10(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": checked,
      "aria-label": label,
      onClick: onToggle,
      className: cn(
        "relative rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        checked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700",
        isMd ? "h-6 w-11" : "h-5 w-9",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx10(
        "span",
        {
          className: cn(
            "absolute top-0.5 rounded-full bg-white transition-transform shadow-sm",
            isMd ? `h-5 w-5 ${checked ? "translate-x-[20px]" : "translate-x-0.5"}` : `h-4 w-4 ${checked ? "translate-x-[16px]" : "translate-x-0.5"}`
          )
        }
      )
    }
  );
}

// src/client/ui/LazyImage.tsx
import { useEffect as useEffect3, useRef as useRef2, useState } from "react";
import { Fragment as Fragment2, jsx as jsx11 } from "react/jsx-runtime";
function LazyImage({
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
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef2(null);
  useEffect3(() => {
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
      { rootMargin }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [priority, isInView, rootMargin]);
  if (hasError && fallback) return /* @__PURE__ */ jsx11(Fragment2, { children: fallback });
  return /* @__PURE__ */ jsx11(
    "div",
    {
      ref: containerRef,
      className: cn("relative overflow-hidden bg-gray-100 dark:bg-gray-800", className),
      style,
      children: isInView && /* @__PURE__ */ jsx11(
        "img",
        {
          src,
          srcSet,
          sizes,
          alt,
          fetchPriority: priority ? "high" : "auto",
          loading: priority ? "eager" : "lazy",
          decoding: priority ? "sync" : "async",
          className: cn(
            "block w-full transition-opacity duration-500",
            style?.aspectRatio ? "h-full" : "h-auto",
            objectFit === "contain" ? "object-contain" : objectFit === "contain-mobile" ? "object-contain md:object-cover" : "object-cover",
            isLoaded ? "opacity-100" : "opacity-0"
          ),
          onLoad: () => {
            setIsLoaded(true);
          },
          onError: () => {
            setHasError(true);
          },
          ...props
        }
      )
    }
  );
}

// src/client/ui/Card.tsx
import React6 from "react";
import { jsx as jsx12 } from "react/jsx-runtime";
var Card = React6.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx12(
    "div",
    {
      ref,
      className: cn("bg-card text-card-foreground rounded-xl border shadow-sm", className),
      ...props
    }
  )
);
Card.displayName = "Card";
var CardHeader = React6.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx12("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })
);
CardHeader.displayName = "CardHeader";
var CardTitle = React6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx12("h3", { ref, className: cn("leading-none font-semibold tracking-tight", className), ...props }));
CardTitle.displayName = "CardTitle";
var CardContent = React6.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx12("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
var CardFooter = React6.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx12("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props })
);
CardFooter.displayName = "CardFooter";

// src/client/ui/Input.tsx
import React7 from "react";
import { jsx as jsx13 } from "react/jsx-runtime";
var Input = React7.forwardRef(
  ({ className, type = "text", ...props }, ref) => {
    return /* @__PURE__ */ jsx13(
      "input",
      {
        type,
        className: cn(
          "border-input placeholder:text-muted-foreground focus-visible:ring-primary ring-offset-background flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";

// src/client/ui/Textarea.tsx
import React8 from "react";
import { jsx as jsx14 } from "react/jsx-runtime";
var Textarea = React8.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx14(
      "textarea",
      {
        className: cn(
          "border-input placeholder:text-muted-foreground focus-visible:ring-primary ring-offset-background flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";

// src/client/ui/Badge.tsx
import { jsx as jsx15 } from "react/jsx-runtime";
function Badge({ className, variant = "default", ...props }) {
  return /* @__PURE__ */ jsx15(
    "span",
    {
      className: cn(
        "focus:ring-ring inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none",
        {
          "bg-primary text-primary-foreground hover:bg-primary/80 border-transparent": variant === "default",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent": variant === "secondary",
          "text-foreground": variant === "outline",
          "bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent": variant === "destructive"
        },
        className
      ),
      ...props
    }
  );
}
export {
  ApiClient,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  ConfirmModal,
  Input,
  LazyImage,
  LinkifiedText,
  Modal,
  Pagination,
  Select,
  Skeleton,
  Textarea,
  ToastContainer,
  ToggleSwitch,
  buildPageList,
  createConfirmStore,
  createToastStore,
  useClickOutside
};
//# sourceMappingURL=index.js.map