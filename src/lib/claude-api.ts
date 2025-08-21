export interface TextureRequest {
  prompt: string;
  style?: 'realistic' | 'abstract' | 'geometric';
  complexity?: 'low' | 'medium' | 'high';
}

export interface ColorOption {
  hex: string;
  name: string;
  description: string;
}

export interface TextureResponse {
  colors: string[]; // 기존 호환성을 위해 유지
  colorOptions: ColorOption[];
  pattern: 'noise' | 'geometric' | 'organic' | 'metallic';
  roughness: number;
  metalness: number;
  scale: number;
  seed: number;
}

export async function generateTextureParameters(request: TextureRequest): Promise<TextureResponse> {
  const response = await fetch('/api/generate-texture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export class TextureAPIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'TextureAPIError';
  }
}