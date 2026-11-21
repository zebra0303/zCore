# zCore Research Summary

> Last updated: 2026-11-21 (`v0.2.0`)

## 1. 개요 (Overview)

`zCore`는 `BigStone`, `zlog`, `zGo` 프로젝트에서 공통적으로 사용되는 UI 컴포넌트, 유틸리티, 보안/네트워크 로직, 그리고 통신 모듈을 중앙화하여 관리하기 위해 만들어진 유틸리티 레포지토리(Shared Library)입니다.

## 2. 기술 스택 (Tech Stack)

- **언어**: TypeScript
- **환경**: Node.js, Web Browser 호환
- **스타일링**: Tailwind CSS (`tailwind-merge`, `clsx` 활용)
- **UI 라이브러리 (Client)**: React, Lucide-React
- **상태 관리 보조**: Zustand (스토어 팩토리 패턴 활용)
- **패키징**: `tsup` (ESM, CJS 듀얼 빌드 + `.d.ts` 지원, 사전 빌드 `dist/` 커밋 포함)
- **테스트**: Vitest + Testing Library (**33 suites / 226 tests**)

## 3. 디렉터리 및 아키텍처 구조

아키텍처는 사용 환경에 따라 크게 세 가지 엔트리 포인트(Entry Points)로 분리되어 설계되었습니다. 이 구조를 통해 빌드 용량을 최적화하고 각 환경에 필요한 모듈만 가져다 쓸 수 있습니다 (예: `import { ... } from "@zebra/core/client"`).

### 3.1. Client (`src/client/`)

클라이언트 단(웹 브라우저)에서 사용되는 React 기반 모음입니다.

- **UI 컴포넌트 (`src/client/ui/`)**: `Button`, `Card`, `Input`, `Textarea`, `Badge`, `Skeleton`, `Pagination`, `ConfirmModal` (포털, Escape/포커스 트랩, 확인 시 중복 `onCancel` 방지), `Modal` (네이티브 `<dialog>` + StrictMode 가드), `ToastContainer`, `ErrorBoundary`, `LinkifiedText`, `Checkbox`, `Select` (수직 중앙 화살표), `ToggleSwitch` (`left-0` 기준 애니메이션), `LazyImage` 등 FSD(Feature-Sliced Design) 패턴에 적용하기 쉽도록 순수 React와 `clsx` 기반 컴포넌트로 구현되어 있습니다.
- **API 클라이언트 (`src/client/api/ApiClient.ts`)**: `fetch` API 기반의 경량화된 통합 HTTP 클라이언트입니다. `credentials`, `retry`, `timeout`, 401 Unauthorized 오류 공통 처리, 일관된 JSON 에러 파싱 기능을 내장하고 있습니다.
- **스토어 팩토리 (`src/client/stores/`)**: 모노레포 혹은 멀티 프로젝트 환경에서 스토어 인스턴스가 오염되지 않도록 `createToastStore`, `createConfirmStore` 등의 Zustand 스토어 팩토리 함수를 제공합니다.
- **커스텀 훅 (`src/client/hooks/`)**: `useClickOutside` 등 공통 React 훅을 제공합니다.

### 3.2. Server (`src/server/`)

Node.js (Express, Hono) 서버 환경에서 사용되는 로직입니다.

- **에러 핸들링 (`src/server/errors.ts`)**: HTTP 상태 코드와 메시지를 포함하는 `AppError` 기반 클래스 및 `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `UnprocessableEntityError`, `TooManyRequestsError`, `InternalServerError` 등의 구체적인 에러 클래스를 제공합니다.
- **JWT 시크릿 검증 (`src/server/jwtSecret.ts`)**: `resolveJwtSecret()`을 통해 프로덕션 환경에서 `JWT_SECRET` 미설정/취약 기본값 사용 시 즉시 실패하도록 강제하고, 개발/테스트 환경에서는 임시 키로 폴백합니다.
- **SSRF 방어 (`src/server/ssrf.ts`)**: `isPrivateOrReservedIp`, `assertSafeUrl`, `safeFetch`를 제공하여 IPv4/IPv6/IPv4-mapped IPv6 사설·예약 대역 차단, DNS 해석 검증, 리다이렉트 호스트 재검증을 수행합니다.

### 3.3. Shared (`src/shared/`)

서버와 클라이언트 모두에서 사용할 수 있는 순수 비즈니스 로직 및 유틸리티입니다.

- **포맷팅 및 텍스트 (`src/shared/date/`, `src/shared/text/`)**: 시간 포맷(`formatDate`, `timeAgo`), 마크다운 변환(`stripMarkdown`, `readingTime`), 링크 치환(`linkify`), 슬러그 변환(`slug`) 등의 순수 함수.
- **에러 및 마스킹 (`src/shared/errors/`)**: `ApiError`, `handleApiError`, `createMaskedError` (5xx 및 민감 에러 메시지 마스킹).
- **난독화 (`src/shared/crypto/`)**: 클라이언트 스토리지용 `obfuscate` / `deobfuscate`.
- **고유 식별자 (`src/shared/generateId.ts`)**: `uuid` 라이브러리를 활용한 `uuidv7` 시간 순 정렬 가능 ID 생성.
- **타입 정의 (`src/shared/types/api.ts`)**: `ApiResponse`, `PaginatedResponse`와 함께 프로젝트 간 주고받을 공통 인터페이스 규격 제공.
- **유틸리티 (`src/shared/cn.ts`)**: Tailwind CSS 클래스 충돌 방지를 위한 `cn` 함수.

## 4. 작동 방식 (How it works)

- **빌드 파이프라인**: `npm run bundle` 시 `tsup`을 사용하여 `dist/client`, `dist/server`, `dist/shared`로 각 엔트리를 ESM, CJS, `.d.ts` 형식으로 트랜스파일합니다.
- **npm 12 Git 의존성 호환성**: 빌드 스크립트 이름을 `build` 대신 `bundle`로 두고 `prepare` 스크립트를 제거(`hooks: "husky"`로 분리)하여, npm 12 소비자가 Git 의존성(`github:zebra0303/zCore`)을 설치할 때 중첩 `pacote` 준비 단계 없이 커밋된 `dist/` 산출물을 직접 사용하도록 설계했습니다.
- **통합 방식**: `package.json`의 `exports` 필드를 세분화하여 각 프로젝트가 딥 임포트(`@zebra/core`, `@zebra/core/client`, `@zebra/core/server`)를 사용할 수 있도록 지원합니다.
- **Tailwind 스캔 주의**: Tailwind CSS v3 소비자(`BigStone`, `zGo`)는 워크스페이스 루트에 호이스트된 `../node_modules/@zebra/core/dist/**/*.{js,cjs,mjs}`를 `tailwind.config.js`의 `content`에 포함해야 `@zebra/core/client` UI 클래스가 퍼지되지 않습니다.

## 5. 핵심 특징

- 안정성(System Stability)을 극대화하기 위해 라이브러리 본연의 기능에 집중하였으며 불필요한 패키지(`Axios`, 무거운 i18n 모듈 등)는 배제했습니다.
- 모든 UI 컴포넌트는 재사용의 용이성과 다크모드(`dark:`)를 네이티브하게 지원할 수 있도록 철저하게 Tailwind 유틸리티 클래스 기반으로 구성했습니다.
