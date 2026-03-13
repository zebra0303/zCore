// Stores (factory pattern — each project gets its own instance)
export {
  createToastStore,
  type Toast,
  type ToastType,
  type ToastState,
  type ToastStoreOptions,
} from "./stores/createToastStore.js";
export {
  createConfirmStore,
  type ConfirmState,
} from "./stores/createConfirmStore.js";

// Hooks
export { useClickOutside } from "./hooks/useClickOutside.js";

// API Client
export { ApiClient, type ApiClientOptions } from "./api/ApiClient.js";

// UI Components
export { Skeleton } from "./ui/Skeleton.js";
export { Modal, type ModalProps } from "./ui/Modal.js";
export {
  Pagination,
  buildPageList,
  type PaginationProps,
} from "./ui/Pagination.js";
export {
  ToastContainer,
  type ToastContainerProps,
} from "./ui/ToastContainer.js";
export {
  ConfirmModal,
  type ConfirmModalProps,
} from "./ui/ConfirmModal.js";
export {
  LinkifiedText,
  type LinkifiedTextProps,
} from "./ui/LinkifiedText.js";
