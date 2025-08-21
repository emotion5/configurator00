# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

자연어 처리를 활용하여 3D 구체(Sphere)에 프로시더럴 텍스처를 적용하는 웹 애플리케이션입니다. 사용자가 텍스처를 설명하는 자연어 프롬프트(예: "수박 텍스처", "나무 껍질")를 입력하면 Claude API를 통해 3가지 색상 옵션을 생성하고, 사용자가 원하는 텍스처를 선택하여 실시간으로 3D 구체에 적용할 수 있습니다.

## 개발 명령어

```bash
npm run dev          # 개발 서버 시작 (Turbopack 사용)
npm run build        # 프로덕션 빌드 (Turbopack 사용)
npm run start        # 프로덕션 서버 시작
npm run lint         # ESLint 실행
```

## 핵심 아키텍처

### 데이터 플로우
1. **사용자 입력** → `TextureInput` 컴포넌트에서 자연어 프롬프트 수집
2. **API 호출** → `/api/generate-texture` 엔드포인트로 Claude API 요청
3. **AI 처리** → Claude 3.5 Sonnet이 텍스트를 색상별 설명이 포함된 구조화된 파라미터로 변환
4. **다중 텍스처 생성** → `generateTextureOptions()` 함수가 각 색상 옵션별로 Canvas 텍스처 생성
5. **사용자 선택** → `TextureSelector` 컴포넌트에서 3가지 옵션 중 선택
6. **3D 적용** → R3F `Scene3D` 컴포넌트에서 선택된 텍스처를 Three.js CanvasTexture로 적용

### 주요 컴포넌트 구조
- **`src/store/textureStore.ts`**: Zustand 기반 전역 상태 관리 (텍스처 옵션, 히스토리, 선택 상태)
- **`src/components/Scene3D.tsx`**: React Three Fiber 3D 씬, 구체 렌더링 및 동적 텍스처 업데이트
- **`src/components/TextureSelector.tsx`**: 3가지 텍스처 옵션 선택 UI (썸네일, 색상명, 설명 포함)
- **`src/components/TextureHistory.tsx`**: 과거 생성한 텍스처 히스토리 및 재적용 기능
- **`src/components/TextureInput.tsx`**: 사용자 입력 인터페이스
- **`src/app/api/generate-texture/route.ts`**: Claude API 연동, 색상별 메타데이터 포함 응답 파싱
- **`src/lib/texture-generator.ts`**: 단일 색상 기반 프로시저럴 텍스처 생성 로직
- **`src/hooks/useTexture.ts`**: 텍스처 상태 관리를 위한 커스텀 훅

## 환경 설정

### 필수 환경변수 (.env.local)
```bash
CLAUDE_API_KEY=sk-ant-api03-xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Claude API 설정
- 모델: `claude-3-5-sonnet-20241022`
- 프롬프트 엔지니어링으로 일관된 JSON 응답 형식 강제
- 폴백 메커니즘: API 실패 시 기본 텍스처 파라미터 반환

## 텍스처 생성 시스템

### 지원 패턴 타입
- **noise**: 다중 옥타브 노이즈 기반 유기적 패턴
- **metallic**: 선형 패턴 + 스크래치 효과로 금속 표면 시뮬레이션
- **organic**: 복합 노이즈와 삼각함수 조합으로 자연스러운 패턴
- **geometric**: 타일 기반 체커보드 + 그라디언트 패턴

### 텍스처 파라미터 구조
```typescript
interface ColorOption {
  hex: string;           // 색상 코드
  name: string;          // 색상 이름 (예: "겉껍질", "속살")
  description: string;   // 색상 설명
}

interface TextureResponse {
  colors: string[];              // 기존 호환성을 위한 색상 배열
  colorOptions: ColorOption[];   // 색상별 메타데이터
  pattern: 'noise' | 'geometric' | 'organic' | 'metallic';
  roughness: number;             // 표면 거칠기 (0-1)
  metalness: number;             // 금속성 (0-1)
  scale: number;                 // 패턴 스케일 (0.5-3.0)
  seed: number;                  // 노이즈 시드값
}
```

## 3D 렌더링 최적화

### 조명 시스템
- 환경광 (intensity: 0.7) + 방향광 (intensity: 2.2) 조합
- 다중 포인트 라이트로 입체감 강화하되 텍스처 디테일 보존
- 텍스처 미리보기와 3D 렌더링 밝기 일치 목표

### 성능 최적화 전략
- 동적 텍스처 업데이트: `Math.random()` 기반 `textureKey`로 강제 리렌더링
- meshStandardMaterial에 `key` prop 적용으로 확실한 텍스처 교체
- Zustand persist 미들웨어로 히스토리 localStorage 저장 (Canvas 제외)
- useEffect를 통한 브라우저 환경에서만 Canvas 생성

## 개발 시 주의사항

### 텍스처 생성
- 단일 색상 기반: `colorIndex` 파라미터로 개별 색상 선택, 명도 변화로 팔레트 생성
- `generateTextureOptions()`로 3개 색상 옵션을 각각 별도 Canvas로 생성
- chroma-js brighten/darken으로 단일 색상에서 그라디언트 팔레트 생성
- 노이즈 시드는 재현 가능한 결과를 위해 파라미터에서 파생

### React Three Fiber 사용
- Sphere 지오메트리 (args: [1.2, 32, 32])로 부드러운 텍스처 표현
- 텍스처 변경 시 `textureKey`와 material `key` prop으로 강제 업데이트
- 텍스처 적용 시 `color: '#ffffff'`로 원본 텍스처 색상 보존
- THREE.CanvasTexture의 `flipY: false` 설정으로 올바른 방향성 보장

## 현재 구현 상태

✅ **완료된 기능들**:
- Claude API 연동 및 색상별 메타데이터 포함 자연어 처리
- 3가지 색상 옵션 선택 시스템 (`TextureSelector`)
- 단일 색상 기반 프로시더럴 텍스처 생성 (4가지 패턴)
- Zustand 기반 전역 상태 관리 및 localStorage 히스토리
- React Three Fiber Sphere 렌더링 및 동적 텍스처 교체
- 텍스처 히스토리 관리 (`TextureHistory`) 및 클릭으로 재적용
- PNG 다운로드 기능 (현재 선택된 텍스처)
- 다크 테마 반응형 UI

## 상태 관리 아키텍처

### Zustand Store 구조
```typescript
interface TextureStore {
  // 현재 상태
  currentTexture: TextureResponse | null;
  currentCanvas: HTMLCanvasElement | null;
  textureOptions: TextureOption[];      // 3개 선택 옵션
  selectedIndex: number;                // 현재 선택된 인덱스
  
  // 액션들
  generateTexture: (prompt: string) => Promise<void>;
  selectTexture: (index: number) => void;
  applyFromHistory: (item: TextureHistoryItem) => void;
}
```

### 히스토리 관리
- localStorage에 `selectedIndex` 포함 저장으로 정확한 재현
- 중복 방지: 같은 프롬프트 + 색상 인덱스 조합 자동 필터링
- `date-fns`로 한국어 상대 시간 표시