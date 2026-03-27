import { UseBoundStore, StoreApi } from 'zustand';
import * as React$1 from 'react';
import React__default, { RefObject } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

type ToastType = "success" | "error" | "info";
interface Toast {
    id: string;
    message: string;
    type: ToastType;
}
interface ToastState {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}
interface ToastStoreOptions {
    /** Auto-dismiss duration in ms (default: 3000) */
    duration?: number;
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
 * Hook that calls handler when a click occurs outside the referenced element.
 * Only attaches the listener when `enabled` is true (default: true).
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
    /** Number of retry attempts for 5xx or network errors (default: 0) */
    retries?: number;
    /** Base delay in milliseconds between retries using exponential backoff (default: 1000) */
    retryDelay?: number;
}
/**
 * Configurable fetch-based HTTP client.
 * Each project creates its own instance with project-specific auth strategy.
 *
 * @example
 * const api = new ApiClient({
 *   getAuthHeaders: () => {
 *     const token = localStorage.getItem("token");
 *     return token ? { Authorization: `Bearer ${token}` } : {};
 *   },
 *   onUnauthorized: () => window.location.href = "/login",
 *   retries: 3, // Automatically retry failed requests (5xx)
 * });
 */
declare class ApiClient {
    private baseUrl;
    private getAuthHeaders;
    private onUnauthorized;
    private credentials;
    private retries;
    private retryDelay;
    constructor(options?: ApiClientOptions);
    /** Extract error message from a failed response. */
    private extractErrorMessage;
    /** Build headers for a request. */
    private buildHeaders;
    /** Handle non-ok response: fire unauthorized callback if 401, then throw. */
    private handleError;
    /** Internal fetch wrapper with retry logic for 5xx and network errors */
    private fetchWithRetry;
    get<T>(path: string, extraHeaders?: Record<string, string>): Promise<T>;
    post<T>(path: string, body?: unknown): Promise<T>;
    put<T>(path: string, body?: unknown): Promise<T>;
    delete<T>(path: string, body?: unknown): Promise<T>;
    upload<T>(path: string, formData: FormData): Promise<T>;
}

declare function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;

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
declare function ToastContainer({ toasts, removeToast, className, toastClassName, }: ToastContainerProps): react_jsx_runtime.JSX.Element | null;

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: React__default.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: "danger" | "warning" | "info";
    className?: string;
}
declare function ConfirmModal({ isOpen, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, variant, className, }: ConfirmModalProps): react_jsx_runtime.JSX.Element | null;

interface LinkifiedTextProps {
    text: string;
    /** Override link classes */
    linkClassName?: string;
}
/**
 * Renders plain text with URLs converted to clickable links.
 * Uses parseLinkSegments (pure function) from shared/text.
 */
declare function LinkifiedText({ text, linkClassName }: LinkifiedTextProps): react_jsx_runtime.JSX.Element | null;

interface ButtonProps extends React__default.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "danger" | "destructive" | "link";
    size?: "xs" | "sm" | "default" | "md" | "lg" | "icon";
    asChild?: boolean;
}
declare const Button: React__default.ForwardRefExoticComponent<ButtonProps & React__default.RefAttributes<HTMLButtonElement>>;

declare const Card: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;
declare const CardHeader: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;
declare const CardTitle: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLHeadingElement> & React__default.RefAttributes<HTMLParagraphElement>>;
declare const CardContent: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;
declare const CardFooter: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;

type InputProps = React__default.InputHTMLAttributes<HTMLInputElement>;
declare const Input: React__default.ForwardRefExoticComponent<InputProps & React__default.RefAttributes<HTMLInputElement>>;

type TextareaProps = React__default.TextareaHTMLAttributes<HTMLTextAreaElement>;
declare const Textarea: React__default.ForwardRefExoticComponent<TextareaProps & React__default.RefAttributes<HTMLTextAreaElement>>;

interface BadgeProps extends React__default.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "secondary" | "outline" | "destructive";
}
declare function Badge({ className, variant, ...props }: BadgeProps): react_jsx_runtime.JSX.Element;

export { ApiClient, type ApiClientOptions, Badge, type BadgeProps, Button, type ButtonProps, Card, CardContent, CardFooter, CardHeader, CardTitle, ConfirmModal, type ConfirmModalProps, type ConfirmState, Input, type InputProps, LinkifiedText, type LinkifiedTextProps, Modal, type ModalProps, Pagination, type PaginationProps, Skeleton, Textarea, type TextareaProps, type Toast, ToastContainer, type ToastContainerProps, type ToastState, type ToastStoreOptions, type ToastType, buildPageList, createConfirmStore, createToastStore, useClickOutside };
