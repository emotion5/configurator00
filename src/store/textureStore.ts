import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateTextureParameters, TextureResponse } from '@/lib/claude-api';
import { generateProceduralTexture, generateTextureOptions } from '@/lib/texture-generator';

export interface TextureOption {
  canvas: HTMLCanvasElement;
  colorInfo: {
    hex: string;
    name: string;
    description: string;
  };
}

export interface TextureHistoryItem {
  id: string;
  prompt: string;
  params: TextureResponse;
  selectedIndex: number; // 선택된 색상 인덱스
  timestamp: Date;
  // Canvas는 localStorage에 저장할 수 없으므로 제외
}

interface TextureStore {
  // 현재 상태
  currentTexture: TextureResponse | null;
  currentCanvas: HTMLCanvasElement | null;
  currentPrompt: string | null;
  textureOptions: TextureOption[]; // 3개 텍스처 옵션
  selectedIndex: number; // 현재 선택된 인덱스
  isLoading: boolean;
  error: string | null;
  
  // 히스토리 관리
  history: TextureHistoryItem[];
  maxHistorySize: number;
  
  // 액션들
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  generateTexture: (prompt: string) => Promise<void>;
  selectTexture: (index: number) => void;
  addToHistory: (prompt: string, params: TextureResponse, selectedIndex: number) => void;
  applyFromHistory: (item: TextureHistoryItem) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  
  // 내부 유틸리티
  _generateTextureOptions: (params: TextureResponse) => TextureOption[];
}

export const useTextureStore = create<TextureStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      currentTexture: null,
      currentCanvas: null,
      currentPrompt: null,
      textureOptions: [],
      selectedIndex: -1,
      isLoading: false,
      error: null,
      history: [],
      maxHistorySize: 10,

      // 기본 액션들
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),

      // 메인 텍스처 생성 함수
      generateTexture: async (prompt: string) => {
        const { setLoading, setError, _generateTextureOptions } = get();
        
        setLoading(true);
        setError(null);
        
        try {
          console.log('🔄 텍스처 생성 시작:', prompt);
          
          // 1. Claude API로 텍스처 파라미터 생성
          const params = await generateTextureParameters({ prompt });
          console.log('✅ Claude API 응답:', params);
          
          // 2. 3개 텍스처 옵션 생성
          const options = _generateTextureOptions(params);
          
          if (options.length > 0) {
            // 3. 상태 업데이트 (첫 번째 옵션을 기본 선택)
            set({ 
              currentTexture: params,
              currentCanvas: options[0].canvas,
              currentPrompt: prompt,
              textureOptions: options,
              selectedIndex: 0,
              error: null
            });
            
            console.log('🎨 텍스처 옵션 생성 완료:', options.length + '개');
          } else {
            throw new Error('텍스처 옵션 생성에 실패했습니다.');
          }
          
        } catch (error) {
          console.error('❌ 텍스처 생성 실패:', error);
          const errorMessage = error instanceof Error ? error.message : '텍스처 생성에 실패했습니다.';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      // 텍스처 선택
      selectTexture: (index: number) => {
        const { textureOptions, currentTexture, currentPrompt, addToHistory } = get();
        
        console.log('🔄 텍스처 선택 시도:', { 
          index, 
          hasOptions: textureOptions.length > 0,
          hasTexture: !!currentTexture,
          hasPrompt: !!currentPrompt
        });
        
        if (textureOptions[index] && currentTexture && currentPrompt) {
          console.log('🎯 텍스처 선택 실행:', textureOptions[index].colorInfo);
          console.log('🖼️ 새 Canvas 설정:', textureOptions[index].canvas);
          
          set({
            currentCanvas: textureOptions[index].canvas,
            selectedIndex: index
          });
          
          // 히스토리에 추가 (선택할 때만)
          addToHistory(currentPrompt, currentTexture, index);
          
          console.log('✅ 텍스처 선택 완료:', textureOptions[index].colorInfo.name);
        } else {
          console.error('❌ 텍스처 선택 실패: 조건 불만족');
        }
      },

      // 히스토리에 아이템 추가
      addToHistory: (prompt: string, params: TextureResponse, selectedIndex: number) => {
        const { history, maxHistorySize } = get();
        
        const newItem: TextureHistoryItem = {
          id: crypto.randomUUID(),
          prompt,
          params,
          selectedIndex,
          timestamp: new Date(),
        };
        
        // 중복 제거 (같은 프롬프트 + 선택된 인덱스 조합이 있으면 제거)
        const filteredHistory = history.filter(item => 
          !(item.prompt === prompt && item.selectedIndex === selectedIndex)
        );
        
        // 최신 아이템을 맨 앞에 추가하고 최대 개수 유지
        const updatedHistory = [newItem, ...filteredHistory].slice(0, maxHistorySize);
        
        set({ history: updatedHistory });
      },

      // 히스토리에서 텍스처 적용
      applyFromHistory: (item: TextureHistoryItem) => {
        const { _generateTextureOptions } = get();
        
        console.log('🔄 히스토리에서 텍스처 적용:', item.prompt);
        
        // 텍스처 옵션들 재생성
        const options = _generateTextureOptions(item.params);
        
        if (options.length > item.selectedIndex) {
          set({
            currentTexture: item.params,
            currentCanvas: options[item.selectedIndex].canvas,
            currentPrompt: item.prompt,
            textureOptions: options,
            selectedIndex: item.selectedIndex,
            error: null
          });
          
          console.log('✅ 히스토리 텍스처 적용 완료');
        } else {
          set({ error: '히스토리 텍스처 적용에 실패했습니다.' });
        }
      },

      // 히스토리에서 아이템 제거
      removeFromHistory: (id: string) => {
        const { history } = get();
        const updatedHistory = history.filter(item => item.id !== id);
        set({ history: updatedHistory });
      },

      // 히스토리 전체 삭제
      clearHistory: () => {
        set({ history: [] });
      },

      // 텍스처 옵션 생성 유틸리티 (브라우저 환경에서만 실행)
      _generateTextureOptions: (params: TextureResponse): TextureOption[] => {
        if (typeof document === 'undefined') {
          // 서버 사이드에서는 빈 배열 반환
          return [];
        }
        
        try {
          const canvases = generateTextureOptions(params, 512);
          const options: TextureOption[] = [];
          
          canvases.forEach((canvas, index) => {
            const colorInfo = params.colorOptions && params.colorOptions[index] 
              ? params.colorOptions[index]
              : {
                  hex: params.colors[index] || '#888888',
                  name: `색상 ${index + 1}`,
                  description: `텍스처 옵션 ${index + 1}`
                };
            
            options.push({ canvas, colorInfo });
          });
          
          return options;
        } catch (error) {
          console.error('텍스처 옵션 생성 오류:', error);
          return [];
        }
      },
    }),
    {
      name: 'texture-history-storage',
      // Canvas는 직렬화할 수 없으므로 히스토리만 저장
      partialize: (state) => ({
        history: state.history,
        maxHistorySize: state.maxHistorySize,
      }),
    }
  )
);