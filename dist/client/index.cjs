"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var client_exports = {};
__export(client_exports, {
  ApiClient: () => ApiClient,
  Badge: () => Badge,
  Button: () => Button,
  Card: () => Card,
  CardContent: () => CardContent,
  CardFooter: () => CardFooter,
  CardHeader: () => CardHeader,
  CardTitle: () => CardTitle,
  ConfirmModal: () => ConfirmModal,
  Input: () => Input,
  LinkifiedText: () => LinkifiedText,
  Modal: () => Modal,
  Pagination: () => Pagination,
  Skeleton: () => Skeleton,
  Textarea: () => Textarea,
  ToastContainer: () => ToastContainer,
  buildPageList: () => buildPageList,
  createConfirmStore: () => createConfirmStore,
  createToastStore: () => createToastStore,
  useClickOutside: () => useClickOutside
});
module.exports = __toCommonJS(client_exports);

// src/client/stores/createToastStore.ts
var import_zustand = require("zustand");
function createToastStore(options = {}) {
  const { duration = 3e3 } = options;
  return (0, import_zustand.create)((set) => ({
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
var import_zustand2 = require("zustand");
function createConfirmStore() {
  return (0, import_zustand2.create)((set, get) => ({
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
var import_react = require("react");
function useClickOutside(ref, handler, enabled = true) {
  (0, import_react.useEffect)(() => {
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
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
function cn(...inputs) {
  return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
}

// src/client/ui/Skeleton.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: cn("animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700", className),
      ...props
    }
  );
}

// src/client/ui/Modal.tsx
var import_react2 = require("react");
var import_react_dom = require("react-dom");
var import_lucide_react = require("lucide-react");
var import_jsx_runtime2 = require("react/jsx-runtime");
function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  closeButtonClassName
}) {
  const dialogRef = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
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
  return (0, import_react_dom.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
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
          title && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "pr-6 text-lg font-semibold text-gray-900 dark:text-gray-100", children: title }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
            "button",
            {
              onClick: onClose,
              className: cn(
                "absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none",
                closeButtonClassName
              ),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react.X, { className: "h-4 w-4" }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "sr-only", children: "Close" })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "overflow-y-auto", children })
        ]
      }
    ),
    document.body
  );
}

// src/client/ui/Pagination.tsx
var import_lucide_react2 = require("lucide-react");
var import_jsx_runtime3 = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "nav",
    {
      "aria-label": `Page ${currentPage} of ${totalPages}`,
      className: cn("flex items-center justify-center gap-1", className),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "button",
          {
            className: cn(baseBtn, buttonClassName),
            disabled: currentPage === 1,
            onClick: () => {
              onPageChange(currentPage - 1);
            },
            "aria-label": "Previous page",
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react2.ChevronLeft, { className: "h-4 w-4" })
          }
        ),
        pages.map(
          (page, i) => page === "..." ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "px-2 text-gray-400", children: "..." }, `e-${i}`) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "button",
          {
            className: cn(baseBtn, buttonClassName),
            disabled: currentPage === totalPages,
            onClick: () => {
              onPageChange(currentPage + 1);
            },
            "aria-label": "Next page",
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react2.ChevronRight, { className: "h-4 w-4" })
          }
        )
      ]
    }
  );
}

// src/client/ui/ToastContainer.tsx
var import_lucide_react3 = require("lucide-react");
var import_jsx_runtime4 = require("react/jsx-runtime");
var iconMap = {
  success: import_lucide_react3.CheckCircle,
  error: import_lucide_react3.AlertTriangle,
  info: import_lucide_react3.Info
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
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    "div",
    {
      "aria-live": "assertive",
      className: cn(
        "pointer-events-none fixed inset-0 z-[200] flex flex-col items-center justify-end gap-2 px-4 py-6 sm:items-end sm:justify-end",
        className
      ),
      children: toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "div",
          {
            className: cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-lg border bg-white p-4 shadow-lg dark:bg-gray-800",
              borderMap[toast.type],
              toastClassName
            ),
            role: "alert",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { className: cn("h-5 w-5 shrink-0", iconColorMap[toast.type]) }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "flex-1 text-sm font-medium text-gray-900 dark:text-gray-100", children: toast.message }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                "button",
                {
                  type: "button",
                  className: "shrink-0 rounded-md text-gray-400 hover:text-gray-600 focus:ring-2 focus:outline-none dark:hover:text-gray-200",
                  onClick: () => {
                    removeToast(toast.id);
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "sr-only", children: "Close" }),
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react3.X, { className: "h-4 w-4" })
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
var import_lucide_react4 = require("lucide-react");

// src/client/ui/Button.tsx
var import_react3 = __toESM(require("react"), 1);
var import_react_slot = require("@radix-ui/react-slot");
var import_jsx_runtime5 = require("react/jsx-runtime");
var Button = import_react3.default.forwardRef(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const v = variant === "primary" ? "default" : variant === "danger" ? "destructive" : variant;
    const s = size === "md" ? "default" : size;
    const Comp = asChild ? import_react_slot.Slot : "button";
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
var import_jsx_runtime6 = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "div",
    {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "confirm-modal-title",
      className: "bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm",
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "div",
        {
          className: cn(
            "bg-card text-card-foreground w-full max-w-sm overflow-hidden rounded-xl border shadow-lg",
            className
          ),
          onClick: (e) => {
            e.stopPropagation();
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "p-6", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "mb-4 flex items-center gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: `rounded-full p-2 ${variantStyles[variant]}`, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react4.AlertTriangle, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h3", { id: "confirm-modal-title", className: "text-lg font-semibold tracking-tight", children: title })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "text-muted-foreground mb-6 text-sm leading-relaxed", children: message }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex justify-end gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { variant: "outline", onClick: onCancel, children: cancelLabel }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
var import_react4 = __toESM(require("react"), 1);

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
var import_jsx_runtime7 = require("react/jsx-runtime");
function LinkifiedText({ text, linkClassName }) {
  if (!text) return null;
  const segments = parseLinkSegments(text);
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_jsx_runtime7.Fragment, { children: segments.map(
    (seg, i) => seg.isUrl ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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
    ) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_react4.default.Fragment, { children: seg.text }, i)
  ) });
}

// src/client/ui/Card.tsx
var import_react5 = __toESM(require("react"), 1);
var import_jsx_runtime8 = require("react/jsx-runtime");
var Card = import_react5.default.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    "div",
    {
      ref,
      className: cn("bg-card text-card-foreground rounded-xl border shadow-sm", className),
      ...props
    }
  )
);
Card.displayName = "Card";
var CardHeader = import_react5.default.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })
);
CardHeader.displayName = "CardHeader";
var CardTitle = import_react5.default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h3", { ref, className: cn("leading-none font-semibold tracking-tight", className), ...props }));
CardTitle.displayName = "CardTitle";
var CardContent = import_react5.default.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
var CardFooter = import_react5.default.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props })
);
CardFooter.displayName = "CardFooter";

// src/client/ui/Input.tsx
var import_react6 = __toESM(require("react"), 1);
var import_jsx_runtime9 = require("react/jsx-runtime");
var Input = import_react6.default.forwardRef(
  ({ className, type = "text", ...props }, ref) => {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
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
var import_react7 = __toESM(require("react"), 1);
var import_jsx_runtime10 = require("react/jsx-runtime");
var Textarea = import_react7.default.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
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
var import_jsx_runtime11 = require("react/jsx-runtime");
function Badge({ className, variant = "default", ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiClient,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  ConfirmModal,
  Input,
  LinkifiedText,
  Modal,
  Pagination,
  Skeleton,
  Textarea,
  ToastContainer,
  buildPageList,
  createConfirmStore,
  createToastStore,
  useClickOutside
});
//# sourceMappingURL=index.cjs.map