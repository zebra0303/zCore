import { UseBoundStore, StoreApi } from 'zustand';
import * as React$1 from 'react';
import React__default, { RefObject, Component, ReactNode, ErrorInfo } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

type ToastType = "success" | "error" | "info" | "warning";
interface Toast {
    id: string;
    message: string;
    type: ToastType;
}
interface ToastState {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, durationOverride?: number) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;
}
interface ToastStoreOptions {
    /** Auto-dismiss duration in ms; pass <= 0 for persistent toasts (default: 3000) */
    duration?: number;
    /** Maximum number of simultaneous toasts (default: 10) */
    maxToasts?: number;
}
/**
 * Factory that creates an independent Zustand toast store.
 * Each project gets its own store instance — no shared global state.
 */
declare function createToastStore(options?: ToastStoreOptions): UseBoundStore<StoreApi<ToastState>>;

interface ConfirmState {
    isOpen: boolean;
    message: string;
    resolve: ((value: boolean) => void) | null;
    confirm: (message: string) => Promise<boolean>;
    onConfirm: () => void;
    onCancel: () => void;
}
/**
 * Factory that creates an independent Zustand confirm store.
 * Returns a Promise-based confirm dialog — call `confirm(msg)` and await the result.
 */
declare function createConfirmStore(): UseBoundStore<StoreApi<ConfirmState>>;

/**
 * Hook that calls handler when a pointer interaction occurs outside the referenced element.
 * Uses a ref for handler to avoid re-attaching document listeners on every render.
 */
declare function useClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, handler: () => void, enabled?: boolean): void;

interface ApiClientOptions {
    /** Base URL prefix for all requests (default: "/api") */
    baseUrl?: string;
    /** Return extra headers (e.g. Authorization) to include in every request */
    getAuthHeaders?: () => Record<string, string>;
    /** Called when a 401 response is received (e.g. redirect to login) */
    onUnauthorized?: (path: string) => void;
    /** Credentials mode for fetch (default: "include") */
    credentials?: RequestCredentials;
    /** Number of retry attempts for idempotent 5xx/429/network errors (default: 0) */
    retries?: number;
    /** Base delay in milliseconds between retries using exponential backoff (default: 1000) */
    retryDelay?: number;
}
interface ApiRequestOptions {
    headers?: Record<string, string>;
    signal?: AbortSignal;
    /** Per-request timeout in milliseconds */
    timeout?: number;
    /** Override retry count (defaults to client retries for idempotent methods, 0 otherwise) */
    retries?: number;
}
/**
 * Configurable fetch-based HTTP client.
 * Each project creates its own instance with project-specific auth strategy.
 */
declare class ApiClient {
    private baseUrl;
    private getAuthHeaders;
    private onUnauthorized;
    private credentials;
    private retries;
    private retryDelay;
    constructor(options?: ApiClientOptions);
    /** Build request headers without mutating caller objects. */
    private buildHeaders;
    /** Safely parse JSON response while tolerating 204/205, empty bodies, and lightweight test mocks. */
    private parseResponse;
    /** Handle non-ok response: fire unauthorized callback if 401, then throw ApiError with details. */
    private handleError;
    /** Compose an AbortSignal from optional caller signal and timeout. */
    private createSignal;
    /** Internal fetch wrapper with safe retry logic (idempotent methods only by default). */
    private fetchWithRetry;
    /** Type guard distinguishing ApiRequestOptions from a plain headers record. */
    private isRequestOptions;
    /** Normalize backward-compatible Record<string, string> or ApiRequestOptions parameter. */
    private normalizeOptions;
    get<T>(path: string, headersOrOptions?: Record<string, string> | ApiRequestOptions): Promise<T>;
    post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
    put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
    patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
    delete<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
    upload<T>(path: string, formData: FormData, options?: ApiRequestOptions): Promise<T>;
}

type SkeletonProps = React__default.HTMLAttributes<HTMLDivElement>;
declare const Skeleton: React__default.ForwardRefExoticComponent<SkeletonProps & React__default.RefAttributes<HTMLDivElement>>;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    /** Override dialog panel classes */
    className?: string;
    /** Override close-button classes */
    closeButtonClassName?: string;
}
declare function Modal({ isOpen, onClose, title, children, className, closeButtonClassName, }: ModalProps): React$1.ReactPortal | null;

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    /** Override nav container classes */
    className?: string;
    /** Override individual page button classes */
    buttonClassName?: string;
    /** Override active page button classes */
    activeButtonClassName?: string;
}
/**
 * Build the visible page list with ellipsis markers.
 * Pure logic — exported for testing.
 */
declare function buildPageList(currentPage: number, totalPages: number, delta?: number): (number | "...")[];
declare function Pagination({ currentPage, totalPages, onPageChange, className, buttonClassName, activeButtonClassName, }: PaginationProps): react_jsx_runtime.JSX.Element | null;

interface ToastContainerProps {
    /** Current list of toasts (from your store) */
    toasts: Toast[];
    /** Remove callback (from your store) */
    removeToast: (id: string) => void;
    /** Override outer container classes */
    className?: string;
    /** Override individual toast card classes */
    toastClassName?: string;
}
declare function ToastContainer({ toasts, removeToast, className, toastClassName, }: ToastContainerProps): react_jsx_runtime.JSX.Element;

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: React__default.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    showCancel?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: "danger" | "warning" | "info";
    className?: string;
}
declare function ConfirmModal({ isOpen, title, message, confirmLabel, cancelLabel, showCancel, onConfirm, onCancel, variant, className, }: ConfirmModalProps): react_jsx_runtime.JSX.Element | null;

interface LinkifiedTextProps {
    text: string;
    /** Override link classes */
    linkClassName?: string;
}
/**
 * Renders plain text with validated http/https URLs converted to clickable links.
 */
declare function LinkifiedText({ text, linkClassName }: LinkifiedTextProps): react_jsx_runtime.JSX.Element | null;

type CheckboxProps = Omit<React__default.InputHTMLAttributes<HTMLInputElement>, "type">;
/**
 * Reusable checkbox component with custom styling and accessibility.
 */
declare const Checkbox: React__default.ForwardRefExoticComponent<CheckboxProps & React__default.RefAttributes<HTMLInputElement>>;

type SelectProps = React__default.SelectHTMLAttributes<HTMLSelectElement>;
/**
 * Reusable select component with custom styling and vertically centered Chevron icon.
 */
declare const Select: React__default.ForwardRefExoticComponent<SelectProps & React__default.RefAttributes<HTMLSelectElement>>;

interface ToggleSwitchProps extends Omit<React__default.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
    checked: boolean;
    onToggle: () => void;
    label?: string;
    size?: "sm" | "md";
}
/**
 * Reusable toggle switch component with built-in accessibility.
 * - sm: h-5 w-9 track, h-4 w-4 thumb
 * - md: h-6 w-11 track, h-5 w-5 thumb (default)
 */
declare const ToggleSwitch: React__default.ForwardRefExoticComponent<ToggleSwitchProps & React__default.RefAttributes<HTMLButtonElement>>;

interface LazyImageProps extends React__default.ImgHTMLAttributes<HTMLImageElement> {
    fallback?: React__default.ReactNode;
    objectFit?: "cover" | "contain" | "contain-mobile";
    priority?: boolean;
    rootMargin?: string;
}
/**
 * Image component with intersection observer lazy loading and LCP optimization.
 */
declare function LazyImage({ src, alt, className, fallback, objectFit, priority, rootMargin, srcSet, sizes, style, onLoad, onError, ...props }: LazyImageProps): react_jsx_runtime.JSX.Element;

interface ErrorBoundaryProps {
    children: ReactNode;
    /** Optional custom fallback element or render function */
    fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
    /** Optional error callback (e.g., logging/telemetry) */
    onError?: (error: Error, info: ErrorInfo) => void;
    /** Localized labels for the default fallback UI */
    title?: string;
    description?: string;
    retryLabel?: string;
}
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}
/**
 * Reusable React Error Boundary for isolating rendering crashes across applications.
 * Uses semantic theme CSS variables so it adapts automatically to light/dark modes.
 */
declare class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState;
    static getDerivedStateFromError(error: Error): ErrorBoundaryState;
    componentDidCatch(error: Error, info: ErrorInfo): void;
    private handleReset;
    render(): ReactNode;
}

interface ButtonProps extends React__default.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "danger" | "destructive" | "link";
    size?: "xs" | "sm" | "default" | "md" | "lg" | "icon";
    asChild?: boolean;
}
declare const Button: React__default.ForwardRefExoticComponent<ButtonProps & React__default.RefAttributes<HTMLButtonElement>>;

declare const Card: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;
declare const CardHeader: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;
declare const CardTitle: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLHeadingElement> & React__default.RefAttributes<HTMLHeadingElement>>;
declare const CardContent: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;
declare const CardFooter: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;

type InputProps = React__default.InputHTMLAttributes<HTMLInputElement>;
declare const Input: React__default.ForwardRefExoticComponent<InputProps & React__default.RefAttributes<HTMLInputElement>>;

type TextareaProps = React__default.TextareaHTMLAttributes<HTMLTextAreaElement>;
declare const Textarea: React__default.ForwardRefExoticComponent<TextareaProps & React__default.RefAttributes<HTMLTextAreaElement>>;

interface BadgeProps extends React__default.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "secondary" | "outline" | "destructive";
}
declare const Badge: React__default.ForwardRefExoticComponent<BadgeProps & React__default.RefAttributes<HTMLSpanElement>>;

export { ApiClient, type ApiClientOptions, type ApiRequestOptions, Badge, type BadgeProps, Button, type ButtonProps, Card, CardContent, CardFooter, CardHeader, CardTitle, Checkbox, type CheckboxProps, ConfirmModal, type ConfirmModalProps, type ConfirmState, ErrorBoundary, type ErrorBoundaryProps, Input, type InputProps, LazyImage, type LazyImageProps, LinkifiedText, type LinkifiedTextProps, Modal, type ModalProps, Pagination, type PaginationProps, Select, type SelectProps, Skeleton, type SkeletonProps, Textarea, type TextareaProps, type Toast, ToastContainer, type ToastContainerProps, type ToastState, type ToastStoreOptions, type ToastType, ToggleSwitch, type ToggleSwitchProps, buildPageList, createConfirmStore, createToastStore, useClickOutside };
