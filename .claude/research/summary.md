# zCore 프로젝트 분석 요약 (Research Summary)

## 1. 개요
zCore(`@zebra/core`)는 다수의 프로젝트(BigStone, zlog 등)에서 공통으로 사용하기 위해 설계된 다목적 유틸리티 라이브러리입니다. 번들 크기 최적화 및 다양한 실행 환경(클라이언트, 서버, 엣지)과의 호환성을 고려하여 프로젝트가 크게 세 가지 모듈(`shared`, `client`, `server`)로 분리되어 있습니다.

## 2. 아키텍처 및 주요 모듈

### 2.1 Shared (`src/shared`)
- **역할**: 클라이언트, 서버, 엣지 등 어떤 환경에서든 실행 가능한 프레임워크 독립적인 공통 로직을 포함합니다.
- **주요 기능**:
  - **텍스트 처리**: 마크다운 제거(`stripMarkdown`), 읽는 시간 계산(`readingTime`), 링크 파싱(`linkify`) 등
  - **날짜 포맷팅**: `formatDate`, `timeAgo` 등 시간 관련 유틸리티
  - **식별자 생성**: 고유 ID(`generateId`) 및 슬러그(`slug`) 생성
  - **공통 에러**: `ApiError`, `handleApiError` 등 클라이언트/서버 간 일관된 에러 처리를 위한 클래스 제공
  - **스타일링**: Tailwind CSS 클래스 병합 유틸리티(`cn.ts` - `clsx`, `tailwind-merge` 기반)

### 2.2 Client (`src/client`)
- **역할**: React 애플리케이션을 위한 클라이언트 전용 로직 및 UI 컴포넌트 모음입니다.
- **주요 기능**:
  - **UI 컴포넌트**: `Modal`, `ToastContainer`, `Pagination`, `Skeleton`, `ConfirmModal`, `LinkifiedText` 등 필수적인 공통 컴포넌트 제공
  - **상태 관리 (Zustand)**: 소비자(consumer) 애플리케이션이 동일한 로직을 공유하면서도 개별적인 상태 인스턴스를 가질 수 있도록 팩토리 패턴(`createToastStore`, `createConfirmStore`)을 적용
  - **커스텀 훅**: 외부 클릭 감지(`useClickOutside`) 등 공통 React 훅 제공
  - **API 통신**: `ApiClient`를 통해 헤더 처리 및 에러 파싱을 중앙집중화한 통신 클래스 제공

### 2.3 Server (`src/server`)
- **역할**: Node.js 기반 서버 환경(Express, Hono 등)에서 사용되는 서버 전용 로직입니다.
- **주요 기능**:
  - 일관된 HTTP 에러 처리를 위한 표준 `AppError` 계층 구조(`BadRequestError`, `NotFoundError` 등) 제공

## 3. 핵심 기술 스택
- **언어**: TypeScript
- **프론트엔드**: React
- **상태 관리**: Zustand
- **스타일링**: Tailwind CSS (유틸리티 클래스를 통한 스타일링)
- **테스트**: Vitest (각 모듈별로 `__tests__` 폴더에 테스트 코드가 존재함)
- **빌드**: tsup (`tsup.config.ts`를 사용한 라이브러리 번들링)

## 4. 결론
zCore는 UI 컴포넌트, 상태 관리 로직, 유틸리티 함수, 그리고 에러 핸들링 메커니즘을 캡슐화한 견고한 모노레포 형태의 패키지입니다. 이를 통해 서비스 전반에 걸쳐 일관된 코드베이스를 유지하고, 새로운 프로젝트(React/Node.js 환경) 시작 시 보일러플레이트를 최소화하며 빠른 개발을 가능하게 합니다.
