'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Icosahedron } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { TextureResponse } from '@/lib/claude-api'

interface IcosahedronMeshProps {
  textureCanvas?: HTMLCanvasElement;
  textureParams?: TextureResponse;
}

function IcosahedronMesh({ textureCanvas, textureParams }: IcosahedronMeshProps) {
  const texture = useMemo(() => {
    if (textureCanvas) {
      const tex = new THREE.CanvasTexture(textureCanvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.needsUpdate = true;
      return tex;
    }
    return null;
  }, [textureCanvas]);

  const materialProps = useMemo(() => {
    if (textureParams) {
      // 색상을 더 잘 보이도록 설정
      const baseColor = textureParams.colors[0] || '#ffffff';
      
      return {
        map: texture,
        color: baseColor, // 텍스처가 있어도 기본 색상 유지
        roughness: Math.max(0.1, textureParams.roughness), // 너무 매끄럽지 않게
        metalness: Math.min(0.8, textureParams.metalness), // 너무 금속적이지 않게
        // 색상이 더 잘 보이도록 추가 설정
        transparent: false,
        opacity: 1.0,
        emissive: baseColor, // 약간의 발광 효과
        emissiveIntensity: 0.05, // 발광을 줄여서 텍스처 디테일 살리기
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
    <Icosahedron args={[1, 0]} position={[0, 0, 0]}>
      <meshStandardMaterial {...materialProps} />
    </Icosahedron>
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
          <IcosahedronMesh 
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