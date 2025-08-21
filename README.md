# 3D 텍스처 생성기 

Claude AI와 React Three Fiber를 활용한 실시간 3D 텍스처 생성 웹 애플리케이션입니다.

## 프로젝트 소개

자연어 프롬프트를 입력하면 Claude AI가 텍스처 파라미터를 생성하고, 프로시저럴 알고리즘으로 실시간 3D 텍스처를 만들어 구체에 적용하는 애플리케이션입니다.

### 주요 기능
- 🎨 **자연어 텍스처 생성**: "수박 텍스처", "나무 껍질" 등 자연어로 텍스처 설명
- 🎯 **3가지 색상 선택**: AI가 제안하는 3가지 색상 옵션 중 원하는 텍스처 선택  
- 🔄 **텍스처 히스토리**: 과거 생성한 텍스처 저장 및 재적용
- 💾 **PNG 다운로드**: 현재 선택된 텍스처를 PNG 파일로 저장
- 🌐 **실시간 3D 렌더링**: React Three Fiber로 부드러운 3D 구체 렌더링

## 시작하기

### 환경 설정

1. **의존성 설치**:
```bash
npm install
```

2. **환경변수 설정** (`.env.local` 파일 생성):
```bash
CLAUDE_API_KEY=sk-ant-api03-xxxxx
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

### 빌드 및 배포

```bash
# 프로덕션 빌드 (Turbopack 사용)
npm run build

# 프로덕션 서버 시작
npm start

# 코드 린팅
npm run lint
```

## 기술 스택

- **프론트엔드**: Next.js 15, React 19, TypeScript
- **3D 렌더링**: React Three Fiber, Three.js
- **AI/API**: Claude 3.5 Sonnet (Anthropic)
- **상태 관리**: Zustand + localStorage persist
- **스타일링**: Tailwind CSS
- **텍스처 생성**: Canvas API, simplex-noise, chroma-js

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/generate-texture/  # Claude API 엔드포인트
│   └── page.tsx               # 메인 페이지
├── components/             # React 컴포넌트
│   ├── Scene3D.tsx            # 3D 렌더링
│   ├── TextureSelector.tsx    # 3색상 선택 UI
│   ├── TextureHistory.tsx     # 히스토리 관리
│   └── TextureInput.tsx       # 프롬프트 입력
├── store/                  # Zustand 상태 관리
├── lib/                    # 유틸리티 함수
│   ├── claude-api.ts          # Claude API 클라이언트
│   └── texture-generator.ts   # 프로시저럴 텍스처 생성
└── hooks/                  # 커스텀 훅
```

## Vercel 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/emotion5/configurator00)

**배포 시 환경변수 설정 필수**:
- `CLAUDE_API_KEY`: Anthropic Claude API 키

## 사용 방법

1. **텍스처 생성**: 텍스트 입력란에 원하는 텍스처를 자연어로 설명
2. **색상 선택**: AI가 제안하는 3가지 색상 옵션 중 하나 선택
3. **실시간 확인**: 3D 구체에서 텍스처 결과 실시간 확인
4. **다운로드**: 마음에 드는 텍스처를 PNG 파일로 저장
5. **히스토리 활용**: 과거 텍스처를 클릭하여 다시 적용
