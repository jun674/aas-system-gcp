# AAS App

Asset Administration Shell (AAS) 애플리케이션

## 프로젝트 설정

```sh
npm install
```

### 개발 서버 실행

```sh
npm run dev
```

### 프로덕션 빌드

```sh
npm run build
```

### 빌드된 앱 미리보기

```sh
npm run preview
```

## 기술 스택

- Vue 3
- Vite
- Vue Router
- Pinia (상태 관리)
- Axios (HTTP 클라이언트)
- Chart.js (차트 라이브러리)

## 프로젝트 구조

```
src/
├── assets/          # 정적 자원 (CSS, 이미지 등)
├── components/      # Vue 컴포넌트
│   ├── auth/       # 인증 관련 컴포넌트
│   ├── charts/     # 차트 컴포넌트
│   ├── common/     # 공통 컴포넌트
│   ├── icons/      # 아이콘 컴포넌트
│   ├── layout/     # 레이아웃 컴포넌트
│   └── search/     # 검색 관련 컴포넌트
├── composables/     # Vue Composition API 함수
├── data/           # 목업 데이터
├── router/         # Vue Router 설정
├── services/       # API 서비스
├── stores/         # Pinia 스토어
├── utils/          # 유틸리티 함수
└── views/          # 페이지 컴포넌트