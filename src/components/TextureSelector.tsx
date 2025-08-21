'use client'

import { useTextureStore } from '@/store/textureStore'

export default function TextureSelector() {
  const { 
    textureOptions, 
    selectedIndex, 
    selectTexture, 
    isLoading 
  } = useTextureStore()

  // 텍스처 옵션이 없으면 표시하지 않음
  if (textureOptions.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-white">
        텍스처 선택 ({textureOptions.length}개)
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {textureOptions.map((option, index) => (
          <div
            key={index}
            className={`
              group cursor-pointer p-3 rounded-lg border-2 transition-all duration-200
              ${selectedIndex === index 
                ? 'border-blue-500 bg-blue-900/20' 
                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
              }
              ${isLoading ? 'pointer-events-none opacity-50' : ''}
            `}
            onClick={() => {
              console.log('🖱️ TextureSelector 클릭:', { index, isLoading });
              !isLoading && selectTexture(index);
            }}
          >
            {/* 썸네일 */}
            <div className="relative mb-3">
              <canvas 
                ref={(canvas) => {
                  if (canvas && option.canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      canvas.width = 120;
                      canvas.height = 120;
                      ctx.drawImage(option.canvas, 0, 0, 120, 120);
                    }
                  }
                }}
                className={`
                  w-full h-24 rounded border object-cover
                  ${selectedIndex === index ? 'border-blue-400' : 'border-gray-500'}
                `}
                width={120}
                height={120}
              />
              
              {/* 선택 표시 */}
              {selectedIndex === index && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* 색상 정보 */}
            <div className="space-y-2">
              {/* 색상명과 색상 칩 */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-gray-400 flex-shrink-0"
                  style={{ backgroundColor: option.colorInfo.hex }}
                  title={option.colorInfo.hex}
                />
                <h4 className="font-medium text-white text-sm truncate">
                  {option.colorInfo.name}
                </h4>
              </div>
              
              {/* 색상 설명 */}
              <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                {option.colorInfo.description}
              </p>
              
              {/* 색상 코드 */}
              <p className="text-xs text-gray-400 font-mono">
                {option.colorInfo.hex.toUpperCase()}
              </p>
            </div>
            
            {/* 호버 효과 */}
            <div className={`
              mt-2 text-center text-xs transition-opacity
              ${selectedIndex === index 
                ? 'text-blue-300 opacity-100' 
                : 'text-gray-400 opacity-0 group-hover:opacity-100'
              }
            `}>
              {selectedIndex === index ? '✓ 선택됨' : '클릭하여 선택'}
            </div>
          </div>
        ))}
      </div>
      
      {/* 안내 메시지 */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        💡 원하는 색상의 텍스처를 클릭하여 3D 모델에 적용하세요
      </div>
    </div>
  )
}