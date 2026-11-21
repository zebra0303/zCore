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
  Checkbox: () => Checkbox,
  ConfirmModal: () => ConfirmModal,
  ErrorBoundary: () => ErrorBoundary,
  Input: () => Input,
  LazyImage: () => LazyImage,
  LinkifiedText: () => LinkifiedText,
  Modal: () => Modal,
  Pagination: () => Pagination,
  Select: () => Select,
  Skeleton: () => Skeleton,
  Textarea: () => Textarea,
  ToastContainer: () => ToastContainer,
  ToggleSwitch: () => ToggleSwitch,
  buildPageList: () => buildPageList,
  createConfirmStore: () => createConfirmStore,
  createToastStore: () => createToastStore,
  useClickOutside: () => useClickOutside
});
module.exports = __toCommonJS(client_exports);

// src/client/stores/createToastStore.ts
var import_zustand = require("zustand");
function createToastStore(options = {}) {
  const { duration = 3e3, maxToasts = 10 } = options;
  const timers = /* @__PURE__ */ new Map();
  let counter = 0;
  return (0, import_zustand.create)((set) => ({
    toasts: [],
    showToast: (message, type = "info", durationOverride) => {
      const id = `toast-${++counter}-${Date.now().toString(36)}`;
      const effectiveDuration = durationOverride ?? duration;
      set((state) => {
        const next = [...state.toasts, { id, message, type }];
        if (next.length > maxToasts) {
          const evicted = next.splice(0, next.length - maxToasts);
          for (const t of evicted) {
            const existingTimer = timers.get(t.id);
            if (existingTimer) {
              clearTimeout(existingTimer);
              timers.delete(t.id);
            }
          }
        }
        return { toasts: next };
      });
      if (effectiveDuration > 0) {
        const timer = setTimeout(() => {
          timers.delete(id);
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id)
          }));
        }, effectiveDuration);
        timers.set(id, timer);
      }
    },
    removeToast: (id) => {
      const timer = timers.get(id);
      if (timer) {
        clearTimeout(timer);
        timers.delete(id);
      }
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    },
    clearToasts: () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
      set({ toasts: [] });
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
      const pendingResolve = get().resolve;
      if (pendingResolve) {
        pendingResolve(false);
      }
      return new Promise((resolve) => {
        set({ isOpen: true, message, resolve });
      });
    },
    onConfirm: () => {
      const { resolve } = get();
      set({ isOpen: false, resolve: null });
      if (resolve) resolve(true);
    },
    onCancel: () => {
      const { resolve } = get();
      set({ isOpen: false, resolve: null });
      if (resolve) resolve(false);
    }
  }));
}

// src/client/hooks/useClickOutside.ts
var import_react = require("react");
function useClickOutside(ref, handler, enabled = true) {
  const handlerRef = (0, import_react.useRef)(handler);
  (0, import_react.useEffect)(() => {
    handlerRef.current = handler;
  }, [handler]);
  (0, import_react.useEffect)(() => {
    if (!enabled) return;
    const handleClickOutside = (e) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        handlerRef.current();
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [ref, enabled]);
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

// src/shared/errors/handleApiError.ts
async function extractResponseError(response, fallback) {
  let parsed;
  let rawText = "";
  if (typeof response.text === "function") {
    rawText = await response.text().catch(() => "");
    if (!rawText) {
      return { message: fallback };
    }
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const titleMatch = /<title>(.*?)<\/title>/i.exec(rawText);
      if (titleMatch?.[1]?.trim()) {
        return { message: titleMatch[1].trim() };
      }
      const trimmed = rawText.trim();
      if (!trimmed.startsWith("<") && trimmed.length > 0 && trimmed.length < 200) {
        return { message: trimmed };
      }
      return { message: fallback };
    }
  } else if (typeof response.json === "function") {
    try {
      parsed = await response.json();
    } catch {
      return { message: fallback };
    }
  } else {
    return { message: fallback };
  }
  if (typeof parsed === "object" && parsed !== null) {
    const obj = parsed;
    if (typeof obj.error === "string" && obj.error.trim()) {
      return { message: obj.error.trim(), details: parsed };
    }
    if (typeof obj.error === "object" && obj.error !== null) {
      const nested = obj.error;
      if (typeof nested.message === "string" && nested.message.trim()) {
        return { message: nested.message.trim(), details: parsed };
      }
    }
    if (typeof obj.message === "string" && obj.message.trim()) {
      return { message: obj.message.trim(), details: parsed };
    }
    return { message: fallback, details: parsed };
  }
  return { message: fallback };
}

// src/shared/errors/maskError.ts
var isAbortError = (err) => typeof err === "object" && err !== null && "name" in err && err.name === "AbortError";

// src/client/api/ApiClient.ts
var IDEMPOTENT_METHODS = /* @__PURE__ */ new Set(["GET", "HEAD", "OPTIONS"]);
function joinUrl(baseUrl, path) {
  if (!path) return baseUrl;
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
function abortableSleep(ms, signal) {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(
        signal.reason instanceof Error ? signal.reason : new DOMException("Aborted", "AbortError")
      );
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(
        signal?.reason instanceof Error ? signal.reason : new DOMException("Aborted", "AbortError")
      );
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
function parseRetryAfterMs(header) {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1e3;
  }
  const dateMs = Date.parse(header);
  if (!Number.isNaN(dateMs)) {
    return Math.max(0, dateMs - Date.now());
  }
  return null;
}
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
    this.retries = Math.max(0, options.retries ?? 0);
    this.retryDelay = Math.max(0, options.retryDelay ?? 1e3);
  }
  /** Build request headers without mutating caller objects. */
  buildHeaders(contentType, extraHeaders) {
    const headers = { ...this.getAuthHeaders() };
    if (contentType) headers["Content-Type"] = contentType;
    if (extraHeaders) {
      Object.assign(headers, extraHeaders);
    }
    const hasAccept = Object.keys(headers).some((k) => k.toLowerCase() === "accept");
    if (!hasAccept) {
      headers.Accept = "application/json";
    }
    return headers;
  }
  /** Safely parse JSON response while tolerating 204/205, empty bodies, and lightweight test mocks. */
  async parseResponse(res) {
    const contentLength = typeof res.headers?.get === "function" ? res.headers.get("content-length") : null;
    if (res.status === 204 || res.status === 205 || contentLength === "0") {
      return void 0;
    }
    if (typeof res.text === "function") {
      const text = await res.text();
      if (!text.trim()) {
        return void 0;
      }
      return JSON.parse(text);
    }
    return res.json();
  }
  /** Handle non-ok response: fire unauthorized callback if 401, then throw ApiError with details. */
  async handleError(res, path) {
    if (res.status === 401) {
      this.onUnauthorized(path);
    }
    const fallback = `HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ""}`;
    const { message, details } = await extractResponseError(res, fallback);
    throw new ApiError(message, res.status, details);
  }
  /** Compose an AbortSignal from optional caller signal and timeout. */
  createSignal(options) {
    const signals = [];
    if (options?.signal) signals.push(options.signal);
    if (options?.timeout !== void 0 && options.timeout > 0) {
      signals.push(AbortSignal.timeout(options.timeout));
    }
    if (signals.length === 0) return void 0;
    if (signals.length === 1) return signals[0];
    return AbortSignal.any(signals);
  }
  /** Internal fetch wrapper with safe retry logic (idempotent methods only by default). */
  async fetchWithRetry(path, init, requestOptions) {
    const url = joinUrl(this.baseUrl, path);
    const method = (init.method ?? "GET").toUpperCase();
    const maxRetries = Math.max(
      0,
      requestOptions?.retries ?? (IDEMPOTENT_METHODS.has(method) ? this.retries : 0)
    );
    const signal = this.createSignal(requestOptions);
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, { ...init, signal });
        if (!res.ok && (res.status >= 500 || res.status === 429) && attempt < maxRetries) {
          const retryAfter = parseRetryAfterMs(res.headers.get("retry-after"));
          const backoff = this.retryDelay * Math.pow(2, attempt);
          const jitter = Math.floor(Math.random() * Math.min(250, backoff * 0.25));
          await abortableSleep(retryAfter ?? backoff + jitter, signal);
          continue;
        }
        return res;
      } catch (error) {
        if (isAbortError(error) || signal?.aborted) {
          throw error;
        }
        lastError = error;
        if (attempt < maxRetries) {
          const backoff = this.retryDelay * Math.pow(2, attempt);
          const jitter = Math.floor(Math.random() * Math.min(250, backoff * 0.25));
          await abortableSleep(backoff + jitter, signal);
          continue;
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Request failed");
  }
  /** Type guard distinguishing ApiRequestOptions from a plain headers record. */
  isRequestOptions(value) {
    return "headers" in value || "signal" in value || "timeout" in value || "retries" in value;
  }
  /** Normalize backward-compatible Record<string, string> or ApiRequestOptions parameter. */
  normalizeOptions(headersOrOptions) {
    if (!headersOrOptions) return void 0;
    if (this.isRequestOptions(headersOrOptions)) {
      return headersOrOptions;
    }
    return { headers: headersOrOptions };
  }
  async get(path, headersOrOptions) {
    const opts = this.normalizeOptions(headersOrOptions);
    const res = await this.fetchWithRetry(
      path,
      {
        method: "GET",
        headers: this.buildHeaders(void 0, opts?.headers),
        credentials: this.credentials
      },
      opts
    );
    if (!res.ok) return this.handleError(res, path);
    return this.parseResponse(res);
  }
  async post(path, body, options) {
    const hasBody = body !== void 0;
    const res = await this.fetchWithRetry(
      path,
      {
        method: "POST",
        headers: this.buildHeaders(hasBody ? "application/json" : void 0, options?.headers),
        credentials: this.credentials,
        body: hasBody ? JSON.stringify(body) : void 0
      },
      options
    );
    if (!res.ok) return this.handleError(res, path);
    return this.parseResponse(res);
  }
  async put(path, body, options) {
    const hasBody = body !== void 0;
    const res = await this.fetchWithRetry(
      path,
      {
        method: "PUT",
        headers: this.buildHeaders(hasBody ? "application/json" : void 0, options?.headers),
        credentials: this.credentials,
        body: hasBody ? JSON.stringify(body) : void 0
      },
      options
    );
    if (!res.ok) return this.handleError(res, path);
    return this.parseResponse(res);
  }
  async patch(path, body, options) {
    const hasBody = body !== void 0;
    const res = await this.fetchWithRetry(
      path,
      {
        method: "PATCH",
        headers: this.buildHeaders(hasBody ? "application/json" : void 0, options?.headers),
        credentials: this.credentials,
        body: hasBody ? JSON.stringify(body) : void 0
      },
      options
    );
    if (!res.ok) return this.handleError(res, path);
    return this.parseResponse(res);
  }
  async delete(path, body, options) {
    const hasBody = body !== void 0;
    const res = await this.fetchWithRetry(
      path,
      {
        method: "DELETE",
        headers: this.buildHeaders(hasBody ? "application/json" : void 0, options?.headers),
        credentials: this.credentials,
        body: hasBody ? JSON.stringify(body) : void 0
      },
      options
    );
    if (!res.ok) return this.handleError(res, path);
    return this.parseResponse(res);
  }
  async upload(path, formData, options) {
    const res = await this.fetchWithRetry(
      path,
      {
        method: "POST",
        headers: this.buildHeaders(void 0, options?.headers),
        credentials: this.credentials,
        body: formData
      },
      options
    );
    if (!res.ok) return this.handleError(res, path);
    return this.parseResponse(res);
  }
};

// src/client/ui/Skeleton.tsx
var import_react2 = __toESM(require("react"), 1);

// src/shared/cn.ts
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
function cn(...inputs) {
  return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
}

// src/client/ui/Skeleton.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var Skeleton = import_react2.default.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        ref,
        "aria-hidden": "true",
        className: cn("bg-muted animate-pulse rounded-lg", className),
        ...props
      }
    );
  }
);
Skeleton.displayName = "Skeleton";

// src/client/ui/Modal.tsx
var import_react3 = require("react");
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
  const dialogRef = (0, import_react3.useRef)(null);
  const titleId = (0, import_react3.useId)();
  (0, import_react3.useEffect)(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open && typeof dialog.showModal === "function") {
      dialog.showModal();
    }
    return () => {
      if (dialog.open && typeof dialog.close === "function") {
        dialog.close();
      }
    };
  }, [isOpen]);
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };
  if (!isOpen || typeof document === "undefined") return null;
  return (0, import_react_dom.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "dialog",
      {
        ref: dialogRef,
        "aria-labelledby": title ? titleId : void 0,
        className: cn(
          "bg-card text-card-foreground border-border fixed inset-0 z-50 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-sm rounded-2xl border p-0 shadow-2xl backdrop:bg-black/50 sm:w-full",
          className
        ),
        onClose,
        onClick: handleBackdropClick,
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "relative flex max-h-[85vh] flex-col gap-4 p-6", children: [
          title && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { id: titleId, className: "pr-6 text-lg font-semibold", children: title }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
            "button",
            {
              type: "button",
              onClick: onClose,
              className: cn(
                "focus-visible:ring-ring absolute top-4 right-4 rounded-md opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                closeButtonClassName
              ),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react.X, { className: "h-4 w-4", "aria-hidden": "true" }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "sr-only", children: "Close" })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "overflow-y-auto", children })
        ] })
      }
    ),
    document.body
  );
}

// src/client/ui/Pagination.tsx
var import_lucide_react2 = require("lucide-react");
var import_jsx_runtime3 = require("react/jsx-runtime");
function buildPageList(currentPage, totalPages, delta = 2) {
  if (totalPages <= 0) return [];
  const safeDelta = Math.max(0, delta);
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || i >= currentPage - safeDelta && i <= currentPage + safeDelta) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return pages;
}
var baseBtn = "focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-all focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
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
      "aria-label": `Pagination, page ${currentPage} of ${totalPages}`,
      className: cn("flex items-center justify-center gap-2", className),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "button",
          {
            type: "button",
            className: cn(
              baseBtn,
              "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
              buttonClassName
            ),
            disabled: currentPage <= 1,
            onClick: () => {
              onPageChange(Math.max(1, currentPage - 1));
            },
            "aria-label": "Previous page",
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react2.ChevronLeft, { className: "h-4 w-4", "aria-hidden": "true" })
          }
        ),
        pages.map(
          (page, i) => page === "..." ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "span",
            {
              "aria-hidden": "true",
              className: "text-muted-foreground flex h-9 w-9 items-center justify-center",
              children: "..."
            },
            `e-${i}`
          ) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "button",
            {
              type: "button",
              className: cn(
                baseBtn,
                page === currentPage ? cn(
                  "border-primary bg-primary text-primary-foreground scale-105 font-bold shadow-sm",
                  activeButtonClassName
                ) : cn(
                  "border-border text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted hover:text-foreground",
                  buttonClassName
                )
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
            type: "button",
            className: cn(
              baseBtn,
              "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
              buttonClassName
            ),
            disabled: currentPage >= totalPages,
            onClick: () => {
              onPageChange(Math.min(totalPages, currentPage + 1));
            },
            "aria-label": "Next page",
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react2.ChevronRight, { className: "h-4 w-4", "aria-hidden": "true" })
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
  warning: import_lucide_react3.AlertTriangle,
  info: import_lucide_react3.Info
};
var borderMap = {
  success: "border-green-300 dark:border-green-700",
  error: "border-red-300 dark:border-red-700",
  warning: "border-amber-300 dark:border-amber-700",
  info: "border-blue-300 dark:border-blue-700"
};
var iconColorMap = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500"
};
function ToastContainer({
  toasts,
  removeToast,
  className,
  toastClassName
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    "div",
    {
      "aria-live": "polite",
      "aria-atomic": "false",
      className: cn(
        "pointer-events-none fixed inset-0 z-[200] flex flex-col items-center justify-end gap-2 px-4 py-6 sm:items-end sm:justify-end",
        className
      ),
      children: toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        const isError = toast.type === "error";
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "div",
          {
            className: cn(
              "bg-card text-card-foreground pointer-events-auto flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-lg border p-4 shadow-lg",
              borderMap[toast.type],
              toastClassName
            ),
            role: isError ? "alert" : "status",
            "aria-live": isError ? "assertive" : "polite",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { className: cn("h-5 w-5 shrink-0", iconColorMap[toast.type]), "aria-hidden": "true" }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "flex-1 text-sm font-medium", children: toast.message }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                "button",
                {
                  type: "button",
                  className: "text-muted-foreground hover:text-foreground focus-visible:ring-ring shrink-0 rounded-md focus-visible:ring-2 focus-visible:outline-none",
                  onClick: () => {
                    removeToast(toast.id);
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "sr-only", children: "Close" }),
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react3.X, { className: "h-4 w-4", "aria-hidden": "true" })
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
var import_react5 = require("react");
var import_react_dom2 = require("react-dom");
var import_lucide_react4 = require("lucide-react");

// src/client/ui/Button.tsx
var import_react4 = __toESM(require("react"), 1);
var import_react_slot = require("@radix-ui/react-slot");
var import_jsx_runtime5 = require("react/jsx-runtime");
var Button = import_react4.default.forwardRef(
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
  showCancel = true,
  onConfirm,
  onCancel,
  variant = "danger",
  className
}) {
  const titleId = (0, import_react5.useId)();
  const descriptionId = (0, import_react5.useId)();
  const panelRef = (0, import_react5.useRef)(null);
  const previousFocusRef = (0, import_react5.useRef)(null);
  const onCancelRef = (0, import_react5.useRef)(onCancel);
  (0, import_react5.useEffect)(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);
  (0, import_react5.useEffect)(() => {
    if (!isOpen || typeof document === "undefined") return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = panelRef.current?.querySelector(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancelRef.current();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);
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
  const content = /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "div",
    {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": titleId,
      "aria-describedby": descriptionId,
      className: "bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm",
      onClick: onCancel,
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "div",
        {
          ref: panelRef,
          className: cn(
            "bg-card text-card-foreground border-border w-full max-w-sm overflow-hidden rounded-xl border shadow-lg",
            className
          ),
          onClick: (e) => {
            e.stopPropagation();
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "p-6", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "mb-4 flex items-center gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: cn("rounded-full p-2", variantStyles[variant]), children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react4.AlertTriangle, { className: "h-5 w-5", "aria-hidden": "true" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h3", { id: titleId, className: "text-lg font-semibold tracking-tight", children: title })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { id: descriptionId, className: "text-muted-foreground mb-6 text-sm leading-relaxed", children: message }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex justify-end gap-3", children: [
              showCancel && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { type: "button", variant: "outline", onClick: onCancel, children: cancelLabel }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                Button,
                {
                  type: "button",
                  variant: buttonVariants[variant],
                  className: showCancel ? "" : "w-full",
                  onClick: onConfirm,
                  children: confirmLabel
                }
              )
            ] })
          ] })
        }
      )
    }
  );
  if (typeof document !== "undefined") {
    return (0, import_react_dom2.createPortal)(content, document.body);
  }
  return content;
}

// src/client/ui/LinkifiedText.tsx
var import_react6 = __toESM(require("react"), 1);

// src/shared/text/linkify.ts
var URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/;
var TRAILING_PUNCTUATION_REGEX = /[.,!?;:'")\]}>]+$/;
function isValidHttpUrl(candidate) {
  try {
    const parsed = new URL(candidate);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}
function trimTrailingPunctuation(raw) {
  let url = raw;
  let trailing = "";
  while (TRAILING_PUNCTUATION_REGEX.test(url)) {
    const lastChar = url.slice(-1);
    if (lastChar === ")") {
      const openCount = (url.match(/\(/g) ?? []).length;
      const closeCount = (url.match(/\)/g) ?? []).length;
      if (closeCount <= openCount) break;
    }
    trailing = lastChar + trailing;
    url = url.slice(0, -1);
  }
  return { url, trailing };
}
function parseLinkSegments(text) {
  if (!text) return [];
  const parts = text.split(URL_SPLIT_REGEX);
  const segments = [];
  const pushPlain = (plain) => {
    if (!plain) return;
    const last = segments[segments.length - 1];
    if (last && !last.isUrl) {
      last.text += plain;
    } else {
      segments.push({ text: plain, isUrl: false });
    }
  };
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    if (i % 2 === 1) {
      const { url, trailing } = trimTrailingPunctuation(part);
      if (isValidHttpUrl(url)) {
        segments.push({ text: url, isUrl: true });
        pushPlain(trailing);
      } else {
        pushPlain(part);
      }
    } else {
      pushPlain(part);
    }
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
          "font-medium break-words text-blue-600 hover:underline dark:text-blue-400",
          linkClassName
        ),
        onClick: (e) => {
          e.stopPropagation();
        },
        children: seg.text
      },
      i
    ) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_react6.default.Fragment, { children: seg.text }, i)
  ) });
}

// src/client/ui/Checkbox.tsx
var import_react7 = __toESM(require("react"), 1);
var import_lucide_react5 = require("lucide-react");
var import_jsx_runtime8 = (
  // Use shrink-wrapped inline-flex span so the centered Check icon aligns to the 16x16 input
  require("react/jsx-runtime")
);
var Checkbox = import_react7.default.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "relative inline-flex shrink-0 items-center justify-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "input",
        {
          type: "checkbox",
          className: cn(
            "peer border-input focus-visible:ring-primary checked:bg-primary checked:border-primary h-4 w-4 shrink-0 appearance-none rounded border bg-transparent shadow-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          ),
          ref,
          ...props
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        import_lucide_react5.Check,
        {
          "aria-hidden": "true",
          className: "text-primary-foreground pointer-events-none absolute top-1/2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100"
        }
      )
    ] });
  }
);
Checkbox.displayName = "Checkbox";

// src/client/ui/Select.tsx
var import_react8 = __toESM(require("react"), 1);
var import_lucide_react6 = require("lucide-react");
var import_jsx_runtime9 = require("react/jsx-runtime");
var Select = import_react8.default.forwardRef(
  ({ className, children, ...props }, ref) => {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "relative inline-block w-full", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        "select",
        {
          className: cn(
            // Reserve pr-9 on the right so long option labels never overlap the chevron icon
            "border-input bg-background text-foreground focus-visible:ring-primary flex h-10 w-full appearance-none rounded-md border py-2 pr-9 pl-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          ),
          ref,
          ...props,
          children
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        import_lucide_react6.ChevronDown,
        {
          "aria-hidden": "true",
          className: "text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 opacity-70"
        }
      )
    ] });
  }
);
Select.displayName = "Select";

// src/client/ui/ToggleSwitch.tsx
var import_react9 = __toESM(require("react"), 1);
var import_jsx_runtime10 = require("react/jsx-runtime");
var ToggleSwitch = import_react9.default.forwardRef(
  ({ checked, onToggle, label, size = "md", className, ...props }, ref) => {
    const isMd = size === "md";
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "button",
      {
        ref,
        type: "button",
        role: "switch",
        "aria-checked": checked,
        "aria-label": label,
        onClick: onToggle,
        className: cn(
          "focus-visible:ring-primary relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700",
          isMd ? "h-6 w-11" : "h-5 w-9",
          className
        ),
        ...props,
        children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "span",
          {
            "aria-hidden": "true",
            className: cn(
              "pointer-events-none absolute top-0.5 left-0 block rounded-full bg-white shadow-sm transition-transform",
              isMd ? cn("h-5 w-5", checked ? "translate-x-5" : "translate-x-0.5") : cn("h-4 w-4", checked ? "translate-x-4" : "translate-x-0.5")
            )
          }
        )
      }
    );
  }
);
ToggleSwitch.displayName = "ToggleSwitch";

// src/client/ui/LazyImage.tsx
var import_react10 = require("react");
var import_jsx_runtime11 = require("react/jsx-runtime");
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
  onLoad,
  onError,
  ...props
}) {
  const srcKey = `${src ?? ""}|${srcSet ?? ""}`;
  const [loadedKey, setLoadedKey] = (0, import_react10.useState)(null);
  const [errorKey, setErrorKey] = (0, import_react10.useState)(null);
  const [observedInView, setObservedInView] = (0, import_react10.useState)(priority);
  const containerRef = (0, import_react10.useRef)(null);
  const isInView = priority || observedInView || typeof window !== "undefined" && typeof IntersectionObserver === "undefined";
  const isLoaded = loadedKey === srcKey;
  const hasError = errorKey === srcKey;
  const handleImgRef = (0, import_react10.useCallback)(
    (img) => {
      if (img?.complete && img.naturalWidth > 0) {
        setLoadedKey(srcKey);
      }
    },
    [srcKey]
  );
  (0, import_react10.useEffect)(() => {
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
      { rootMargin }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [isInView, rootMargin]);
  if (hasError && fallback) return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_jsx_runtime11.Fragment, { children: fallback });
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
    "div",
    {
      ref: containerRef,
      className: cn("bg-muted relative overflow-hidden", className),
      style,
      children: isInView && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        "img",
        {
          ref: handleImgRef,
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
          ...props,
          onLoad: (e) => {
            setLoadedKey(srcKey);
            onLoad?.(e);
          },
          onError: (e) => {
            setErrorKey(srcKey);
            onError?.(e);
          }
        }
      )
    }
  );
}

// src/client/ui/ErrorBoundary.tsx
var import_react11 = require("react");
var import_jsx_runtime12 = require("react/jsx-runtime");
var ErrorBoundary = class extends import_react11.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.props.onError?.(error, info);
  }
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };
  render() {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        "div",
        {
          role: "alert",
          className: "bg-background text-foreground flex min-h-[240px] flex-col items-center justify-center p-6 text-center",
          children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "bg-card text-card-foreground border-border w-full max-w-md rounded-xl border p-6 shadow-sm", children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("h2", { className: "mb-2 text-lg font-semibold", children: this.props.title ?? "Something went wrong" }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("p", { className: "text-muted-foreground mb-4 text-sm", children: this.props.description ?? "An unexpected error occurred while rendering this page." }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
              "button",
              {
                type: "button",
                onClick: this.handleReset,
                className: "bg-primary text-primary-foreground focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none",
                children: this.props.retryLabel ?? "Try again"
              }
            )
          ] })
        }
      );
    }
    return this.props.children;
  }
};

// src/client/ui/Card.tsx
var import_react12 = __toESM(require("react"), 1);
var import_jsx_runtime13 = require("react/jsx-runtime");
var Card = import_react12.default.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
    "div",
    {
      ref,
      className: cn(
        "bg-card text-card-foreground border-border rounded-xl border shadow-sm",
        className
      ),
      ...props
    }
  )
);
Card.displayName = "Card";
var CardHeader = import_react12.default.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })
);
CardHeader.displayName = "CardHeader";
var CardTitle = import_react12.default.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("h3", { ref, className: cn("leading-none font-semibold tracking-tight", className), ...props }));
CardTitle.displayName = "CardTitle";
var CardContent = import_react12.default.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
var CardFooter = import_react12.default.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props })
);
CardFooter.displayName = "CardFooter";

// src/client/ui/Input.tsx
var import_react13 = __toESM(require("react"), 1);
var import_jsx_runtime14 = require("react/jsx-runtime");
var Input = import_react13.default.forwardRef(
  ({ className, type = "text", ...props }, ref) => {
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
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
var import_react14 = __toESM(require("react"), 1);
var import_jsx_runtime15 = require("react/jsx-runtime");
var Textarea = import_react14.default.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
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
var import_react15 = __toESM(require("react"), 1);
var import_jsx_runtime16 = require("react/jsx-runtime");
var Badge = import_react15.default.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
      "span",
      {
        ref,
        className: cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
          {
            "bg-primary text-primary-foreground border-transparent": variant === "default",
            "bg-secondary text-secondary-foreground border-transparent": variant === "secondary",
            // Explicit border-border prevents currentColor border mismatch in Tailwind v4
            "border-border text-foreground": variant === "outline",
            "bg-destructive text-destructive-foreground border-transparent": variant === "destructive"
          },
          className
        ),
        ...props
      }
    );
  }
);
Badge.displayName = "Badge";
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
  Checkbox,
  ConfirmModal,
  ErrorBoundary,
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
});
//# sourceMappingURL=index.cjs.map