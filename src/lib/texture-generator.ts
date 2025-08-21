import { createNoise2D } from 'simplex-noise';
import chroma from 'chroma-js';
import { TextureResponse } from './claude-api';

export function generateProceduralTexture(params: TextureResponse, size: number = 512, colorIndex?: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 시드로 노이즈 함수 생성
  const noise2D = createNoise2D(() => params.seed / 1000);

  // 색상 선택: colorIndex가 있으면 단일 색상, 없으면 기존 방식 (호환성)
  let colorScale: chroma.Scale;
  if (colorIndex !== undefined && params.colorOptions && params.colorOptions[colorIndex]) {
    // 단일 색상 기반 팔레트 생성 (명도 변화)
    const baseColor = chroma(params.colorOptions[colorIndex].hex);
    const lighterColor = baseColor.brighten(1.5);
    const darkerColor = baseColor.darken(1.5);
    colorScale = chroma.scale([darkerColor, baseColor, lighterColor])
      .mode('lch')
      .correctLightness(true);
  } else {
    // 기존 방식 (색상 배열 혼합)
    colorScale = chroma.scale(params.colors)
      .mode('lch')
      .correctLightness(true);
  }

  // 패턴별 텍스처 생성
  switch (params.pattern) {
    case 'noise':
      generateNoiseTexture(ctx, noise2D, colorScale, params, size);
      break;
    case 'metallic':
      generateMetallicTexture(ctx, noise2D, colorScale, params, size);
      break;
    case 'organic':
      generateOrganicTexture(ctx, noise2D, colorScale, params, size);
      break;
    case 'geometric':
      generateGeometricTexture(ctx, colorScale, params, size);
      break;
    default:
      generateNoiseTexture(ctx, noise2D, colorScale, params, size);
  }

  return canvas;
}

// 3개 색상 옵션에 대한 텍스처 배열 생성
export function generateTextureOptions(params: TextureResponse, size: number = 512): HTMLCanvasElement[] {
  const textures: HTMLCanvasElement[] = [];
  
  if (params.colorOptions && params.colorOptions.length > 0) {
    // 새로운 방식: 각 색상 옵션별로 텍스처 생성
    for (let i = 0; i < params.colorOptions.length; i++) {
      textures.push(generateProceduralTexture(params, size, i));
    }
  } else {
    // 폴백: 기존 방식으로 1개 텍스처만 생성
    textures.push(generateProceduralTexture(params, size));
  }
  
  return textures;
}

function generateNoiseTexture(
  ctx: CanvasRenderingContext2D,
  noise2D: (x: number, y: number) => number,
  colorScale: chroma.Scale,
  params: TextureResponse,
  size: number
) {
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const nx = (x / size) * params.scale;
      const ny = (y / size) * params.scale;
      
      // 다중 옥타브 노이즈
      const noise1 = noise2D(nx * 1, ny * 1) * 0.5;
      const noise2 = noise2D(nx * 2, ny * 2) * 0.25;
      const noise3 = noise2D(nx * 4, ny * 4) * 0.125;
      
      const noiseValue = (noise1 + noise2 + noise3 + 1) / 2; // 0-1 범위로 정규화
      
      const color = colorScale(noiseValue);
      const rgb = color.rgb();
      
      const index = (y * size + x) * 4;
      data[index] = Math.round(rgb[0]);     // R
      data[index + 1] = Math.round(rgb[1]); // G
      data[index + 2] = Math.round(rgb[2]); // B
      data[index + 3] = 255;                // A
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function generateMetallicTexture(
  ctx: CanvasRenderingContext2D,
  noise2D: (x: number, y: number) => number,
  colorScale: chroma.Scale,
  params: TextureResponse,
  size: number
) {
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const nx = (x / size) * params.scale;
      const ny = (y / size) * params.scale;
      
      // 금속 표면을 위한 선형 패턴 + 노이즈
      const linePattern = Math.sin(nx * 20) * 0.1;
      const noiseValue = noise2D(nx * 8, ny * 8) * 0.3;
      const scratchPattern = Math.sin(nx * 50 + noiseValue * 10) * 0.05;
      
      const finalValue = Math.max(0, Math.min(1, 0.5 + linePattern + noiseValue + scratchPattern));
      
      const color = colorScale(finalValue);
      const rgb = color.rgb();
      
      const index = (y * size + x) * 4;
      data[index] = Math.round(rgb[0]);
      data[index + 1] = Math.round(rgb[1]);
      data[index + 2] = Math.round(rgb[2]);
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function generateOrganicTexture(
  ctx: CanvasRenderingContext2D,
  noise2D: (x: number, y: number) => number,
  colorScale: chroma.Scale,
  params: TextureResponse,
  size: number
) {
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const nx = (x / size) * params.scale;
      const ny = (y / size) * params.scale;
      
      // 유기적 패턴을 위한 복합 노이즈
      const noise1 = noise2D(nx * 2, ny * 2);
      const noise2 = noise2D(nx * 4 + noise1, ny * 4 + noise1);
      const noise3 = noise2D(nx * 8, ny * 8) * 0.5;
      
      const organicValue = (Math.sin(noise1 * Math.PI) + Math.cos(noise2 * Math.PI) + noise3 + 3) / 6;
      
      const color = colorScale(organicValue);
      const rgb = color.rgb();
      
      const index = (y * size + x) * 4;
      data[index] = Math.round(rgb[0]);
      data[index + 1] = Math.round(rgb[1]);
      data[index + 2] = Math.round(rgb[2]);
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function generateGeometricTexture(
  ctx: CanvasRenderingContext2D,
  colorScale: chroma.Scale,
  params: TextureResponse,
  size: number
) {
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  const tileSize = Math.max(1, Math.floor(size / (params.scale * 10)));

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const tileX = Math.floor(x / tileSize);
      const tileY = Math.floor(y / tileSize);
      
      // 체커보드 패턴 + 그라디언트
      const checker = (tileX + tileY) % 2;
      const gradient = (x + y) / (size * 2);
      const pattern = (checker * 0.3 + gradient * 0.7);
      
      const color = colorScale(pattern);
      const rgb = color.rgb();
      
      const index = (y * size + x) * 4;
      data[index] = Math.round(rgb[0]);
      data[index + 1] = Math.round(rgb[1]);
      data[index + 2] = Math.round(rgb[2]);
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}