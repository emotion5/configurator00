'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'
import { Suspense, useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'
import { TextureResponse } from '@/lib/claude-api'

interface SphereMeshProps {
  textureCanvas?: HTMLCanvasElement;
  textureParams?: TextureResponse;
}

function SphereMesh({ textureCanvas, textureParams }: SphereMeshProps) {
  // 간단한 키 기반 강제 업데이트
  const textureKey = useMemo(() => Math.random(), [textureCanvas]);

  const texture = useMemo(() => {
    if (textureCanvas) {
      console.log('🔄 Scene3D: 새 텍스처 생성:', textureKey);
      const tex = new THREE.CanvasTexture(textureCanvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.needsUpdate = true;
      tex.flipY = false;
      return tex;
    }
    return null;
  }, [textureCanvas, textureKey]);

  const materialProps = useMemo(() => {
    if (textureParams && texture) {
      // 텍스처가 있을 때는 텍스처 색상이 잘 보이도록 설정
      return {
        map: texture,
        color: '#ffffff', // 흰색으로 설정하여 텍스처 원본 색상 유지
        roughness: Math.max(0.1, textureParams.roughness),
        metalness: Math.min(0.8, textureParams.metalness),
        transparent: false,
        opacity: 1.0,
      };
    } else if (textureParams) {
      // 텍스처가 없지만 파라미터가 있을 때는 기본 색상 사용
      const baseColor = textureParams.colors[0] || '#ffffff';
      return {
        color: baseColor,
        roughness: Math.max(0.1, textureParams.roughness),
        metalness: Math.min(0.8, textureParams.metalness),
        transparent: false,
        opacity: 1.0,
      };
    }
    return {
      color: "#ffffff",
      roughness: 0.3,
      metalness: 0.1,
      transparent: false,
      opacity: 1.0,
    };
  }, [texture, textureParams]);

  return (
    <Sphere args={[1.2, 32, 32]} position={[0, 0, 0]}>
      <meshStandardMaterial key={textureKey} {...materialProps} />
    </Sphere>
  )
}

function Lighting() {
  return (
    <>
      {/* 환경광 - 줄여서 입체감 살리기 */}
      <ambientLight intensity={0.7} color="#ffffff" />
      
      {/* 주 조명 - 대폭 증가 */}
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={2.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* 보조 조명 - 증가 */}
      <pointLight 
        position={[-3, 3, 3]} 
        intensity={0.9} 
        color="#ffffff"
      />
      <pointLight 
        position={[3, -3, 3]} 
        intensity={0.7} 
        color="#ffffff"
      />
      
      {/* 뒷면 조명 - 림 라이트 효과 증가 */}
      <pointLight 
        position={[0, 0, -4]} 
        intensity={0.5} 
        color="#ffffff"
      />
    </>
  )
}

function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-500">3D 모델 로딩 중...</div>
    </div>
  )
}

interface Scene3DProps {
  textureCanvas?: HTMLCanvasElement;
  textureParams?: TextureResponse;
}

export default function Scene3D({ textureCanvas, textureParams }: Scene3DProps) {
  console.log('🔍 Scene3D props 변경:', { 
    hasCanvas: !!textureCanvas, 
    hasParams: !!textureParams,
    canvasId: textureCanvas ? textureCanvas.toString() : 'none'
  });
  
  return (
    <div className="w-full h-full bg-gray-900">
      <Canvas
        camera={{ 
          position: [0, 0, 5], 
          fov: 75 
        }}
        shadows
        style={{ background: '#111827' }}
      >
        <Suspense fallback={null}>
          <Lighting />
          <SphereMesh 
            textureCanvas={textureCanvas}
            textureParams={textureParams}
          />
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={10}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}