'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Sphere,
  Box,
  Torus,
  OrbitControls,
  Stars,
  Environment,
  ContactShadows,
  PerspectiveCamera,
  Sparkles,
} from '@react-three/drei';
import * as THREE from 'three';

/**
 * Floating Interactive Sphere with distortion effect
 */
function InteractiveSphere({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial
          color="#3b82f6"
          attach="material"
          distort={0.5}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

/**
 * Wobbling Torus with animated material
 */
function WobblingTorus({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.z += 0.005;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <Torus ref={meshRef} args={[1, 0.3, 16, 100]} position={position}>
        <MeshWobbleMaterial
          color="#8b5cf6"
          attach="material"
          factor={0.6}
          speed={2}
          roughness={0.1}
          metalness={0.9}
        />
      </Torus>
    </Float>
  );
}

/**
 * Rotating Box with gradient material
 */
function RotatingBox({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Float speed={1} rotationIntensity={1} floatIntensity={1}>
      <Box ref={meshRef} args={[1.5, 1.5, 1.5]} position={position}>
        <MeshDistortMaterial
          color="#10b981"
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.3}
          metalness={0.7}
        />
      </Box>
    </Float>
  );
}

/**
 * Animated 3D Scene with interactive elements
 */
function Scene3D() {
  return (
    <>
      {/* Camera with custom settings */}
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={75} />

      {/* Orbit Controls for mouse interaction */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#8b5cf6" />

      {/* Environment for realistic reflections */}
      <Environment preset="city" />

      {/* Stars in the background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Sparkles effect */}
      <Sparkles count={100} scale={10} size={2} speed={0.4} opacity={0.6} color="#ffffff" />

      {/* Interactive floating geometries */}
      <InteractiveSphere position={[-3, 1, 0]} />
      <WobblingTorus position={[0, 0, -2]} />
      <RotatingBox position={[3, -1, 0]} />

      {/* Additional floating spheres */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[0.5, 32, 32]} position={[-2, -2, -1]}>
          <meshStandardMaterial color="#ec4899" roughness={0.2} metalness={0.8} />
        </Sphere>
      </Float>

      <Float speed={2} rotationIntensity={0.8} floatIntensity={1.5}>
        <Sphere args={[0.4, 32, 32]} position={[2, 2, -1]}>
          <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.8} />
        </Sphere>
      </Float>

      {/* Contact shadows for depth */}
      <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={10} blur={2} far={4} />

      {/* Fog for depth effect */}
      <fog attach="fog" args={['#000000', 8, 20]} />
    </>
  );
}

/**
 * Advanced 3D Hero Background
 * Uses Drei's powerful components for interactive WebGL scenes
 */
export default function Advanced3DHero() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Scene3D />
      </Canvas>
    </div>
  );
}
