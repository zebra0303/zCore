# zCore Research Summary

## 1. 개요 (Overview)

`zCore`는 `BigStone`, `zlog`, `zGo` 프로젝트에서 공통적으로 사용되는 UI 컴포넌트, 유틸리티, 로직, 그리고 통신 모듈을 중앙화하여 관리하기 위해 만들어진 유틸리티 레포지토리(Shared Library)입니다.

## 2. 기술 스택 (Tech Stack)

- **언어**: TypeScript
- **환경**: Node.js, Web Browser 호환
- **스타일링**: Tailwind CSS (`tailwind-merge`, `clsx` 활용)
- **UI 라이브러리 (Client)**: React, Lucide-React
- **상태 관리 보조**: Zustand (스토어 팩토리 패턴 활용)
- **패키징**: `tsup` (ESM, CJS 듀얼 빌드 지원)

## 3. 디렉터리 및 아키텍처 구조

아키텍처는 사용 환경에 따라 크게 세 가지 엔트리 포인트(Entry Points)로 분리되어 설계되었습니다. 이 구조를 통해 빌드 용량을 최적화하고 각 환경에 필요한 모듈만 가져다 쓸 수 있습니다 (예: `import { ... } from "@zebra/core/client"`).

### 3.1. Client (`src/client/`)

클라이언트 단(웹 브라우저)에서 사용되는 React 기반 모음입니다.

- **UI 컴포넌트 (`src/client/ui/`)**: `Button`, `Card`, `Input`, `Textarea`, `Badge`, `Skeleton`, `Pagination`, `ConfirmModal`, `Modal`, `ToastContainer`, `Checkbox`, `Select`, `ToggleSwitch`, `LazyImage` 등 FSD(Feature-Sliced Design) 패턴에 적용하기 쉽도록 순수 React와 `clsx`를 통한 커스터마이징 가능한 컴포넌트 위주로 구현되어 있습니다. 외부 의존성을 최소화하여 호환성을 높였습니다.
- **API 클라이언트 (`src/client/api/ApiClient.ts`)**: `fetch` API 기반의 경량화된 통합 HTTP 클라이언트입니다. 재시도 로직, 401 Unauthorized 오류 공통 처리, 일관된 JSON 에러 파싱 기능을 내장하고 있습니다.
- **스토어 팩토리 (`src/client/stores/`)**: 모노레포 혹은 멀티 프로젝트 환경에서 스토어 인스턴스가 오염되지 않도록 `createToastStore`, `createConfirmStore` 등의 Zustand 스토어 팩토리 함수를 제공합니다.

### 3.2. Server (`src/server/`)

Node.js (Express, Hono) 서버 환경에서 사용되는 로직입니다.

- **에러 핸들링 (`src/server/errors.ts`)**: HTTP 상태 코드와 메시지를 포함하는 `AppError` 추상 클래스 및 `BadRequestError`, `NotFoundError`, `UnauthorizedError` 등의 구체적인 에러 클래스를 제공하여 일관된 REST API 에러 응답을 돕습니다.

### 3.3. Shared (`src/shared/`)

서버와 클라이언트 모두에서 사용할 수 있는 순수 비즈니스 로직 및 유틸리티입니다.

- **포맷팅 및 텍스트 (`src/shared/date/`, `src/shared/text/`)**: 시간 포맷(`formatDate`, `timeAgo`), 마크다운 변환(`stripMarkdown`), 링크 치환(`linkify`), 슬러그 변환 등의 순수 함수.
- **고유 식별자 (`src/shared/generateId.ts`)**: `uuid` 라이브러리를 활용한 `uuidv7` 시간 순 정렬 가능 ID 생성.
- **타입 정의 (`src/shared/types/api.ts`)**: `ApiResponse`, `PaginatedResponse`와 함께 프로젝트 간 주고받을 공통 인터페이스 규격 제공.
- **유틸리티 (`src/shared/cn.ts`)**: Tailwind CSS 클래스 충돌 방지를 위한 `cn` 함수.

## 4. 작동 방식 (How it works)

- **빌드 파이프라인**: `npm run build` 시 `tsup`을 사용하여 `dist/client`, `dist/server`, `dist/shared`로 각 엔트리를 ESM, CJS, D.TS 형식으로 트랜스파일합니다.
- **통합 방식**: `package.json`의 `exports` 필드를 세분화하여 각 프로젝트가 `"@zebra/core": "github:..."` 또는 `file:` 링크를 통해 설치한 뒤 딥 임포트(`import ... from "@zebra/core/client"`)를 할 수 있도록 지원합니다.

## 5. 핵심 특징

- 안정성(System Stability)을 극대화하기 위해 라이브러리 본연의 기능에 집중하였으며 불필요한 패키지(`Axios`, 무거운 i18n 모듈 등)는 배제했습니다.
- 모든 UI 컴포넌트는 재사용의 용이성과 다크모드(`dark:`)를 네이티브하게 지원할 수 있도록 철저하게 Tailwind 유틸리티 클래스 기반으로 구성했습니다.
