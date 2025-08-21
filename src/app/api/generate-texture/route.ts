import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

interface TextureRequest {
  prompt: string;
  style?: 'realistic' | 'abstract' | 'geometric';
  complexity?: 'low' | 'medium' | 'high';
}

interface TextureResponse {
  colors: string[];
  pattern: 'noise' | 'geometric' | 'organic' | 'metallic';
  roughness: number;
  metalness: number;
  scale: number;
  seed: number;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = 'realistic', complexity = 'medium' }: TextureRequest = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: '프롬프트를 입력해주세요.' },
        { status: 400 }
      );
    }

    // API 키 확인
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      console.error('Claude API 키가 설정되지 않았습니다.');
      throw new Error('API key not configured');
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    console.log('🔄 Claude API 요청 시작:', prompt);
    
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `다음 텍스처 설명을 3D 텍스처 파라미터로 변환해주세요:

텍스처 설명: "${prompt}"
스타일: ${style}
복잡도: ${complexity}

정확히 다음 JSON 형식으로만 응답해주세요. 다른 설명은 포함하지 마세요:

{
  "colors": ["#색상1", "#색상2", "#색상3"],
  "pattern": "noise|geometric|organic|metallic",
  "roughness": 0.0~1.0 사이의 숫자,
  "metalness": 0.0~1.0 사이의 숫자,
  "scale": 0.5~3.0 사이의 숫자,
  "seed": 1~1000 사이의 정수
}

예시:
- "거친 금속 표면" → {"colors": ["#silver", "#gray", "#darkgray"], "pattern": "metallic", "roughness": 0.8, "metalness": 0.9, "scale": 1.2, "seed": 123}
- "네온 사이버펑크" → {"colors": ["#ff00ff", "#00ffff", "#ff0080"], "pattern": "geometric", "roughness": 0.1, "metalness": 0.0, "scale": 2.0, "seed": 456}
- "나무 껍질" → {"colors": ["#8b4513", "#654321", "#a0522d"], "pattern": "organic", "roughness": 0.9, "metalness": 0.0, "scale": 1.5, "seed": 789}`
      }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('📝 Claude 원본 응답:', responseText);
    
    // JSON 추출 시도
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ JSON을 찾을 수 없음. 응답:', responseText);
      throw new Error('Valid JSON not found in Claude response');
    }

    console.log('🔍 추출된 JSON:', jsonMatch[0]);
    const textureParams: TextureResponse = JSON.parse(jsonMatch[0]);

    // 파라미터 검증
    if (!textureParams.colors || !Array.isArray(textureParams.colors) || textureParams.colors.length === 0) {
      throw new Error('Invalid colors in response');
    }

    if (!['noise', 'geometric', 'organic', 'metallic'].includes(textureParams.pattern)) {
      throw new Error('Invalid pattern in response');
    }

    if (typeof textureParams.roughness !== 'number' || textureParams.roughness < 0 || textureParams.roughness > 1) {
      throw new Error('Invalid roughness value');
    }

    if (typeof textureParams.metalness !== 'number' || textureParams.metalness < 0 || textureParams.metalness > 1) {
      throw new Error('Invalid metalness value');
    }

    console.log('✅ Claude API 성공! 반환 파라미터:', textureParams);
    return NextResponse.json(textureParams);

  } catch (error) {
    console.error('❌ Claude API 오류:', error);
    
    // 폴백 텍스처 파라미터 제공
    const fallbackTexture: TextureResponse = {
      colors: ['#ffffff', '#cccccc', '#999999'],
      pattern: 'noise',
      roughness: 0.5,
      metalness: 0.1,
      scale: 1.0,
      seed: Math.floor(Math.random() * 1000)
    };

    console.log('⚠️ 폴백 텍스처 사용:', fallbackTexture);
    return NextResponse.json(fallbackTexture);
  }
}