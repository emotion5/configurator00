# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

자연어 처리를 활용하여 3D 정이십면체에 프로시더럴 텍스처를 적용하는 웹 애플리케이션입니다. 사용자가 텍스처를 설명하는 자연어 프롬프트(예: "거친 금속 표면", "사이버펑크 네온 패턴")를 입력하면 Claude API를 통해 해석하고, 실시간으로 3D 텍스처를 생성하여 정이십면체에 적용합니다.

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
3. **AI 처리** → Claude 3.5 Sonnet이 텍스트를 구조화된 텍스처 파라미터로 변환
4. **텍스처 생성** → `generateProceduralTexture()` 함수가 Canvas에 프로시더럴 텍스처 렌더링
5. **3D 적용** → R3F `Scene3D` 컴포넌트에서 Three.js CanvasTexture로 실시간 적용

### 주요 컴포넌트 구조
- **`src/app/page.tsx`**: 메인 페이지, 전체 상태 관리 및 데이터 플로우 제어
- **`src/components/Scene3D.tsx`**: React Three Fiber 3D 씬, 조명 시스템 및 텍스처 적용
- **`src/components/TextureInput.tsx`**: 사용자 입력 인터페이스 및 샘플 프롬프트
- **`src/app/api/generate-texture/route.ts`**: Claude API 연동 및 응답 파싱
- **`src/lib/texture-generator.ts`**: 4가지 패턴별 프로시더럴 텍스처 생성 로직
- **`src/lib/claude-api.ts`**: Claude API 클라이언트 및 타입 정의

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

### 텍스처 파라미터
```typescript
interface TextureResponse {
  colors: string[];        // 색상 팔레트 (최소 3개)
  pattern: string;         // 패턴 타입
  roughness: number;       // 표면 거칠기 (0-1)
  metalness: number;       // 금속성 (0-1)  
  scale: number;           // 패턴 스케일 (0.5-3.0)
  seed: number;            // 노이즈 시드값
}
```

## 3D 렌더링 최적화

### 조명 시스템
- 환경광 (intensity: 0.7) + 방향광 (intensity: 2.2) 조합
- 다중 포인트 라이트로 입체감 강화하되 텍스처 디테일 보존
- 텍스처 미리보기와 3D 렌더링 밝기 일치 목표

### 성능 최적화 전략
- React useMemo로 텍스처 객체 캐싱
- Three.js CanvasTexture의 needsUpdate 플래그 활용
- useEffect를 통한 브라우저 환경에서만 Canvas 생성

## 개발 시 주의사항

### 텍스처 생성
- `document.createElement('canvas')`는 브라우저 환경에서만 실행 (useEffect 내부)
- chroma-js는 LCH 색상 공간 + correctLightness(true)로 자연스러운 색상 전환
- 노이즈 시드는 재현 가능한 결과를 위해 파라미터에서 파생

### React Three Fiber 사용
- 복잡한 Three.js 조작은 ref와 useFrame 활용
- meshStandardMaterial의 emissive 속성으로 색상 보정 (emissiveIntensity: 0.05)
- 텍스처 적용 시 color와 map 속성 모두 설정으로 일관된 결과 보장

## 현재 구현 상태

✅ **완료된 기능들**:
- Claude API 연동 및 자연어 처리
- 4가지 패턴의 프로시더럴 텍스처 생성
- React Three Fiber 3D 씬 및 실시간 렌더링
- 최적화된 조명 시스템
- 텍스처 미리보기 기능
- 다크 테마 UI

🔄 **향후 개발 예정**:
- 텍스처 히스토리 및 즐겨찾기 기능
- 더 다양한 패턴 타입 지원
- 텍스처 내보내기 기능