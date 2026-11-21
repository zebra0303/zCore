# @zebra/core

[![npm version](https://img.shields.io/npm/v/@zebra/core.svg)](https://www.npmjs.com/package/@zebra/core)

BigStone, zlog, zGo 프로젝트를 위한 다목적 공통 유틸리티 라이브러리입니다. 가볍고, 프레임워크에 종속되지 않는 설계를 지향하며, 다양한 환경에서 높은 재사용성을 제공합니다.

[🇬🇧 English README](./README.md)

## 주요 기능

번들 크기를 최적화하고 실행 환경 호환성을 보장하기 위해 세 가지 주요 진입점(entry points)으로 분리되어 있습니다:

### 1. Shared (`@zebra/core`)

클라이언트, 서버, 엣지 등 어떠한 환경에서도 실행 가능한 프레임워크 독립적인 유틸리티입니다.

- **텍스트 처리**: 마크다운 제거(`stripMarkdown`), 읽는 시간 계산(`readingTime`), 링크 파싱(`linkify`).
- **날짜 유틸리티**: 날짜 포맷팅(`formatDate`), 상대 시간 표시(`timeAgo`).
- **식별자 생성**: 고유 ID 생성(`generateId` - `uuidv7` 기반), 슬러그 생성(`slug`).
- **에러 처리**: 일관된 에러 구조와 안전한 UI 마스킹을 위한 `ApiError`, `handleApiError`, `createMaskedError`.
- **데이터 난독화**: 클라이언트 스토리지용 경량 `obfuscate` / `deobfuscate` 유틸리티.
- **타입 정의(Types)**: `ApiResponse`, `PaginatedResponse` 등 공통 API 래퍼 타입.
- **스타일링**: Tailwind CSS 클래스 병합 유틸리티 (`clsx`와 `tailwind-merge` 기반의 `cn` 함수).

### 2. Client (`@zebra/core/client`)

클라이언트 측 로직 및 React UI 컴포넌트 모음입니다.

- **UI 컴포넌트**: `Button`, `Card`, `Input`, `Textarea`, `Badge`, `Modal` (네이티브 `<dialog>` + StrictMode 가드), `ToastContainer`, `Pagination`, `Skeleton`, `ConfirmModal` (포털, 포커스 트랩, Escape 처리), `ErrorBoundary`, `LinkifiedText`, `Checkbox`, `Select`, `ToggleSwitch`, `LazyImage` 등.
- **상태 관리**: 소비자 애플리케이션이 개별적인 상태 인스턴스를 가질 수 있게 해주는 Zustand 스토어 팩토리 (`createToastStore`, `createConfirmStore`).
- **커스텀 훅**: 외부 클릭 감지(`useClickOutside`) 등 공통 React 훅.
- **API 클라이언트**: `credentials`, `retry`, `timeout` 및 일관된 에러 파싱을 지원하는 중앙집중화된 HTTP 클라이언트(`ApiClient`).

### 3. Server (`@zebra/core/server`)

Node.js 환경(Express, Hono 등)에서 사용되는 서버 전용 유틸리티입니다.

- **에러 처리**: 표준화된 HTTP 에러 계층 구조 제공 (`AppError`, `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `UnprocessableEntityError`, `TooManyRequestsError`, `InternalServerError`).
- **보안 및 네트워크**: `resolveJwtSecret` (프로덕션 시크릿 필수 검증 + 개발 환경 임시 키 폴백), `isPrivateOrReservedIp`, `assertSafeUrl`, `safeFetch` (DNS 조회 및 리다이렉트 검증 포함 SSRF 방어).

## 설치

```bash
npm install @zebra/core
```

_참고: 사용하는 모듈에 따라 peer dependencies (`react`, `react-dom`, `zustand`, `lucide-react`) 설치가 필요할 수 있습니다._

## 사용 방법

### 공통(Shared) 유틸리티 사용

```typescript
import { cn, generateId, timeAgo } from "@zebra/core";

const id = generateId();
const className = cn("base-class", conditionalClass && "active-class");
const relativeTime = timeAgo(new Date());
```

### 클라이언트(Client) 컴포넌트 사용 (React)

```tsx
import { Modal, createToastStore, ApiClient } from "@zebra/core/client";

// 앱을 위한 별도의 토스트 스토어 초기화
const useToastStore = createToastStore();

function MyComponent() {
  return (
    <Modal isOpen={true} onClose={() => {}}>
      모달 내용
    </Modal>
  );
}
```

### 서버(Server) 유틸리티 사용

```typescript
import { BadRequestError } from "@zebra/core/server";

function handleRequest(req) {
  if (!req.body.id) {
    throw new BadRequestError("ID가 필요합니다.");
  }
}
```

## 개발 스크립트

```bash
# 의존성 설치
npm install

# 라이브러리 빌드 (npm 12에서 Git 의존성 중첩 prepare 방지를 위해 `bundle` 스크립트 사용)
npm run bundle

# 테스트 실행
npm run test

# 린트 실행
npm run lint

# 코드 포맷팅
npm run format

# Git 훅 설치 (로컬 개발용)
npm run hooks
```

### 테스트 커버리지

33개의 테스트 스위트, 226개의 테스트 케이스로 공유 유틸리티, UI 컴포넌트, 에러 바운더리, 스토어, API 클라이언트, JWT 시크릿 검증 및 SSRF 방어 로직을 검증합니다.

## 라이선스

MIT
