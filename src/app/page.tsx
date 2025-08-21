'use client'

import { useState, useEffect } from 'react'
import Scene3D from '@/components/Scene3D'
import TextureInput from '@/components/TextureInput'
import { generateTextureParameters, TextureResponse } from '@/lib/claude-api'
import { generateProceduralTexture } from '@/lib/texture-generator'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [textureCanvas, setTextureCanvas] = useState<HTMLCanvasElement>()
  const [textureParams, setTextureParams] = useState<TextureResponse>()
  const [error, setError] = useState<string>()

  // textureParams가 변경될 때 브라우저에서 텍스처 생성
  useEffect(() => {
    if (textureParams) {
      try {
        console.log('브라우저에서 텍스처 생성 시작:', textureParams)
        const canvas = generateProceduralTexture(textureParams, 512)
        setTextureCanvas(canvas)
        console.log('텍스처 생성 완료')
      } catch (error) {
        console.error('텍스처 생성 오류:', error)
        setError('텍스처 렌더링에 실패했습니다.')
      }
    }
  }, [textureParams])

  const handleTextureGeneration = async (prompt: string) => {
    setIsLoading(true)
    setError(undefined)
    
    try {
      console.log('텍스처 생성 요청:', prompt)
      
      // 1. Claude API로 텍스처 파라미터 생성
      const params = await generateTextureParameters({ prompt })
      console.log('Claude API 응답:', params)
      console.log('받은 색상들:', params.colors)
      
      // 2. 상태 업데이트 (텍스처 생성은 useEffect에서 처리)
      setTextureParams(params)
      console.log('파라미터 설정 완료')
      
    } catch (error) {
      console.error('텍스처 생성 실패:', error)
      setError(error instanceof Error ? error.message : '텍스처 생성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

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
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          
          {/* 3D Scene */}
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
            <div className="h-96 lg:h-[500px]">
              <Scene3D 
                textureCanvas={textureCanvas}
                textureParams={textureParams}
              />
            </div>
          </div>

          {/* Input Interface */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-white">텍스처 설명 입력</h2>
            <TextureInput 
              onSubmit={handleTextureGeneration}
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

            {textureParams && !isLoading && (
              <div className="mt-4 p-4 bg-green-900/30 rounded-lg border border-green-700">
                <div className="text-green-300">
                  <p className="font-semibold mb-2">✅ 텍스처 생성 완료!</p>
                  <div className="text-sm space-y-1">
                    <p>패턴: {textureParams.pattern}</p>
                    <p>거칠기: {textureParams.roughness.toFixed(2)}</p>
                    <p>금속성: {textureParams.metalness.toFixed(2)}</p>
                    <p>색상: {textureParams.colors.slice(0, 3).join(', ')}</p>
                  </div>
                  
                  {/* 텍스처 미리보기 */}
                  {textureCanvas && (
                    <div className="mt-3">
                      <p className="text-sm mb-2">텍스처 미리보기:</p>
                      <canvas 
                        ref={(canvas) => {
                          if (canvas && textureCanvas) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              canvas.width = 128;
                              canvas.height = 128;
                              ctx.drawImage(textureCanvas, 0, 0, 128, 128);
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
