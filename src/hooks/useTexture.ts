import { useTextureStore } from '@/store/textureStore'
import { TextureHistoryItem } from '@/store/textureStore'

export function useTexture() {
  const store = useTextureStore()

  return {
    // 현재 상태
    currentTexture: store.currentTexture,
    currentCanvas: store.currentCanvas,
    currentPrompt: store.currentPrompt,
    isLoading: store.isLoading,
    error: store.error,
    
    // 히스토리
    history: store.history,
    
    // 액션들
    generateTexture: store.generateTexture,
    applyFromHistory: store.applyFromHistory,
    removeFromHistory: store.removeFromHistory,
    clearHistory: store.clearHistory,
    
    // 유틸리티 함수들
    getHistoryById: (id: string): TextureHistoryItem | undefined => {
      return store.history.find(item => item.id === id)
    },
    
    getHistoryByPrompt: (prompt: string): TextureHistoryItem | undefined => {
      return store.history.find(item => item.prompt === prompt)
    },
    
    hasHistory: (): boolean => {
      return store.history.length > 0
    },
    
    isCurrentTexture: (id: string): boolean => {
      const item = store.history.find(item => item.id === id)
      return item?.prompt === store.currentPrompt
    }
  }
}

export type UseTextureReturn = ReturnType<typeof useTexture>