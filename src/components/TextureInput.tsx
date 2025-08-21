'use client'

import { useState } from 'react'

interface TextureInputProps {
  onSubmit: (prompt: string) => void
  isLoading?: boolean
}

export default function TextureInput({ onSubmit, isLoading = false }: TextureInputProps) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim())
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="텍스처를 설명해주세요 (예: 거친 금속 표면, 네온 패턴 등)"
          className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? '생성중...' : '생성'}
        </button>
      </form>
      
      {/* 샘플 프롬프트 */}
      <div className="mt-4">
        <p className="text-sm text-gray-400 mb-2">샘플 프롬프트:</p>
        <div className="flex flex-wrap gap-2">
          {[
            '거친 금속 표면',
            '네온 사이버펑크 패턴',
            '대리석 질감',
            '나무 껍질',
            '구름 패턴'
          ].map((sample) => (
            <button
              key={sample}
              onClick={() => setPrompt(sample)}
              className="px-3 py-1 text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-full transition-colors border border-gray-600"
              disabled={isLoading}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}