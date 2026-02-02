'use client';

/**
 * Floating Geometry Component
 *
 * @description Animated 3D geometric shapes using React Three Fiber
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import type { FloatingGeometryConfig } from '@/interfaces/animations.interface';

interface FloatingGeometryProps {
  config: FloatingGeometryConfig;
  scrollProgress?: number;
}

export function FloatingGeometry({ config, scrollProgress = 0 }: FloatingGeometryProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const {
    type,
    position,
    scale = 1,
    color = '#6366f1',
    metalness = 0.5,
    roughness = 0.2,
    wireframe = false,
    rotation = [0, 0, 0],
    floatSpeed = 1.5,
    floatIntensity = 0.5,
  } = config;

  // Animate based on scroll progress
  useFrame((_state) => {
    if (meshRef.current) {
      // Rotate continuously
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.005;

      // Add scroll-based rotation
      if (scrollProgress > 0) {
        meshRef.current.rotation.z = scrollProgress * Math.PI * 2;
      }
    }
  });

  // Render appropriate geometry based on type
  const renderGeometry = () => {
    switch (type) {
      case 'box':
        return <boxGeometry args={[scale, scale, scale]} />;
      case 'sphere':
        return <sphereGeometry args={[scale * 0.5, 32, 32]} />;
      case 'torus':
        return <torusGeometry args={[scale * 0.4, scale * 0.2, 16, 100]} />;
      case 'cone':
        return <coneGeometry args={[scale * 0.5, scale, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[scale * 0.5, scale * 0.5, scale, 32]} />;
      default:
        return <boxGeometry args={[scale, scale, scale]} />;
    }
  };

  return (
    <Float speed={floatSpeed} rotationIntensity={floatIntensity} floatIntensity={floatIntensity}>
      <mesh ref={meshRef} position={position} rotation={rotation}>
        {renderGeometry()}
        <MeshDistortMaterial
          color={color}
          metalness={metalness}
          roughness={roughness}
          wireframe={wireframe}
          distort={0.3}
          speed={2}
        />
      </mesh>
    </Float>
  );
}
