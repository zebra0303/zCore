# @zebra/core

[![npm version](https://img.shields.io/npm/v/@zebra/core.svg)](https://www.npmjs.com/package/@zebra/core)

A multi-purpose utility library providing a shared foundation for the BigStone, zlog, and zGo projects. It is designed to be lightweight, framework-agnostic where possible, and highly reusable across different environments.

[🇰🇷 한국어 README](./README.ko.md)

## Features

The library is split into three main entry points to optimize bundle size and ensure environment compatibility:

### 1. Shared (`@zebra/core`)

Framework-agnostic utilities that can run in any environment (Client, Server, Edge).

- **Text Processing**: `stripMarkdown`, `readingTime`, `linkify`.
- **Date Utilities**: `formatDate`, `timeAgo`.
- **Identifiers**: Unique ID generation (`generateId` via `uuidv7`), Slugs (`slug`).
- **Error Handling**: `ApiError` and `handleApiError` for consistent error structures.
- **Types**: `ApiResponse`, `PaginatedResponse`.
- **Styling**: Tailwind CSS class merging utility (`cn` using `clsx` and `tailwind-merge`).

### 2. Client (`@zebra/core/client`)

Client-side specific logic and React UI components.

- **UI Components**: `Button`, `Card`, `Input`, `Textarea`, `Badge`, `Modal`, `ToastContainer`, `Pagination`, `Skeleton`, `ConfirmModal`, `LinkifiedText`.
- **State Management**: Zustand store factories (`createToastStore`, `createConfirmStore`) for isolated instances.
- **Hooks**: Common React hooks like `useClickOutside`.
- **API Client**: `ApiClient` for centralized HTTP requests and error parsing.

### 3. Server (`@zebra/core/server`)

Server-side specific utilities for Node.js environments (Express, Hono, etc.).

- **Error Handling**: Standardized HTTP `AppError` hierarchy (`BadRequestError`, `NotFoundError`, etc.).

## Installation

```bash
npm install @zebra/core
```

_Note: You may need to install peer dependencies (`react`, `react-dom`, `zustand`, `lucide-react`) depending on the modules you use._

## Usage

### Using Shared Utilities

```typescript
import { cn, generateId, timeAgo } from "@zebra/core";

const id = generateId();
const className = cn("base-class", conditionalClass && "active-class");
const relativeTime = timeAgo(new Date());
```

### Using Client Components (React)

```tsx
import { Modal, createToastStore, ApiClient } from "@zebra/core/client";

// Initialize a separate toast store for your app
const useToastStore = createToastStore();

function MyComponent() {
  return (
    <Modal isOpen={true} onClose={() => {}}>
      Modal Content
    </Modal>
  );
}
```

### Using Server Utilities

```typescript
import { BadRequestError } from "@zebra/core/server";

function handleRequest(req) {
  if (!req.body.id) {
    throw new BadRequestError("ID is required");
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format
```

### Test Coverage

22 test suites covering 176 tests across shared utilities, UI components, stores, and API client.

## License

MIT
