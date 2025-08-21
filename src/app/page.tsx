'use client'

import Scene3D from '@/components/Scene3D'
import TextureInput from '@/components/TextureInput'
import TextureSelector from '@/components/TextureSelector'
import TextureHistory from '@/components/TextureHistory'
import { useTextureStore } from '@/store/textureStore'

export default function Home() {
  const { 
    isLoading, 
    currentCanvas, 
    currentTexture, 
    currentPrompt,
    error, 
    generateTexture 
  } = useTextureStore()

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">
            3D 텍스처 생성기
          </h1>
          <p className="text-gray-300 mt-1">
            자연어로 설명하면 3D 텍스처를 생성합니다
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - 3D Scene */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
              <div className="h-96 lg:h-[500px]">
                <Scene3D 
                  textureCanvas={currentCanvas}
                  textureParams={currentTexture}
                />
              </div>
            </div>

            {/* Texture Info - 3D 뷰어 바로 아래 */}
            {currentTexture && !isLoading && (
              <div className="bg-green-900/30 rounded-lg p-6 border border-green-700">
                <div className="text-green-300">
                  <p className="font-semibold mb-2">✅ 텍스처 생성 완료!</p>
                  <div className="text-sm space-y-1">
                    <p>프롬프트: {currentPrompt}</p>
                    <p>패턴: {currentTexture.pattern}</p>
                    <p>거칠기: {currentTexture.roughness.toFixed(2)}</p>
                    <p>금속성: {currentTexture.metalness.toFixed(2)}</p>
                    <p>색상: {currentTexture.colors.slice(0, 3).join(', ')}</p>
                  </div>
                  
                  {/* 텍스처 미리보기 및 다운로드 */}
                  {currentCanvas && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm">텍스처 미리보기:</p>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.download = `texture-${currentPrompt?.replace(/[^a-zA-Z0-9ㄱ-ㅎ가-힣]/g, '_') || 'generated'}-${Date.now()}.png`;
                            link.href = currentCanvas.toDataURL();
                            link.click();
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          다운로드
                        </button>
                      </div>
                      <canvas 
                        ref={(canvas) => {
                          if (canvas && currentCanvas) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              canvas.width = 128;
                              canvas.height = 128;
                              ctx.drawImage(currentCanvas, 0, 0, 128, 128);
                            }
                          }
                        }}
                        className="border border-green-600 rounded"
                        width={128}
                        height={128}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Controls and History */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Input Interface */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-white">텍스처 설명 입력</h2>
              <TextureInput 
                onSubmit={generateTexture}
                isLoading={isLoading}
              />
              
              {isLoading && (
                <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    <span className="text-blue-300">AI가 텍스처를 생성하고 있습니다...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-900/30 rounded-lg border border-red-700">
                  <div className="flex items-center gap-2">
                    <span className="text-red-300">⚠️ {error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Texture Selector - 텍스처 옵션이 있을 때만 표시 */}
            <TextureSelector />

            {/* Texture History */}
            <TextureHistory />

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-gray-400 text-sm">
            React Three Fiber + Claude AI로 제작된 3D 텍스처 생성기
          </p>
        </div>
      </footer>
    </div>
  )
}
