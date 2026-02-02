'use client';

/**
 * 3D Scene Component
 *
 * @description Main canvas wrapper for React Three Fiber 3D scenes
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import type { Scene3DConfig } from '@/interfaces/animations.interface';

interface Scene3DProps {
  children: React.ReactNode;
  config?: Scene3DConfig;
  enableControls?: boolean;
  className?: string;
}

export function Scene3D({
  children,
  config = {},
  enableControls = false,
  className = '',
}: Scene3DProps) {
  const {
    enableShadows = false,
    cameraPosition = [0, 0, 5],
    backgroundColor = 'transparent',
  } = config;

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows={enableShadows}
        style={{ background: backgroundColor }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          {/* Camera */}
          <PerspectiveCamera makeDefault position={cameraPosition} fov={75} />

          {/* Lights */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow={enableShadows} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          {/* Environment for reflections */}
          <Environment preset="city" />

          {/* Scene content */}
          {children}

          {/* Optional orbit controls for debugging */}
          {enableControls && <OrbitControls enableZoom={false} enablePan={false} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
