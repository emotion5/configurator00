'use client'

import { useTextureStore } from '@/store/textureStore'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function TextureHistory() {
  const { 
    history, 
    applyFromHistory, 
    removeFromHistory, 
    clearHistory,
    isLoading,
    currentPrompt,
    selectedIndex: currentSelectedIndex
  } = useTextureStore()

  if (history.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-white">텍스처 히스토리</h2>
        <div className="text-gray-400 text-center py-8">
          <p>아직 생성된 텍스처가 없습니다.</p>
          <p className="text-sm mt-2">텍스처를 생성하면 여기에 기록됩니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          텍스처 히스토리 ({history.length})
        </h2>
        <button
          onClick={clearHistory}
          className="text-red-400 hover:text-red-300 text-sm transition-colors"
          disabled={isLoading}
        >
          전체 삭제
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className={`
              group relative bg-gray-700 rounded-lg p-4 border transition-all duration-200 cursor-pointer
              ${currentPrompt === item.prompt && currentSelectedIndex === item.selectedIndex
                ? 'border-blue-500 bg-blue-900/20' 
                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-600'
              }
            `}
            onClick={() => !isLoading && applyFromHistory(item)}
          >
            {/* 현재 활성 표시 */}
            {currentPrompt === item.prompt && currentSelectedIndex === item.selectedIndex && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            )}

            {/* 메인 콘텐츠 */}
            <div className="pr-8">
              <p className="text-white font-medium mb-2 line-clamp-2">
                {item.prompt}
              </p>
              
              {/* 텍스처 정보 */}
              <div className="flex flex-wrap gap-2 mb-3 text-xs">
                <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded">
                  {item.params.pattern}
                </span>
                <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded">
                  거칠기: {item.params.roughness.toFixed(2)}
                </span>
                <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded">
                  금속성: {item.params.metalness.toFixed(2)}
                </span>
              </div>

              {/* 선택된 색상 정보 */}
              <div className="flex items-center gap-2 mb-2">
                {item.params.colorOptions && item.params.colorOptions[item.selectedIndex] ? (
                  <>
                    <div
                      className="w-4 h-4 rounded border border-gray-500"
                      style={{ backgroundColor: item.params.colorOptions[item.selectedIndex].hex }}
                      title={item.params.colorOptions[item.selectedIndex].hex}
                    />
                    <span className="text-sm text-gray-300">
                      {item.params.colorOptions[item.selectedIndex].name}
                    </span>
                  </>
                ) : (
                  <div className="flex gap-1">
                    {item.params.colors.slice(0, 3).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded border border-gray-500"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 타임스탬프 */}
              <p className="text-gray-400 text-xs">
                {formatDistanceToNow(item.timestamp, { 
                  addSuffix: true, 
                  locale: ko 
                })}
              </p>
            </div>

            {/* 삭제 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeFromHistory(item.id)
              }}
              className="absolute top-2 right-6 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
              disabled={isLoading}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* 로딩 오버레이 */}
            {isLoading && currentPrompt === item.prompt && currentSelectedIndex === item.selectedIndex && (
              <div className="absolute inset-0 bg-gray-700/50 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 사용법 안내 */}
      <div className="mt-4 text-xs text-gray-500 border-t border-gray-600 pt-3">
        💡 히스토리 항목을 클릭하면 해당 텍스처를 다시 적용할 수 있습니다.
      </div>
    </div>
  )
}