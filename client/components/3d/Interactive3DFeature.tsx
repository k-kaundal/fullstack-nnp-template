'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  MeshTransmissionMaterial,
  Sphere,
  Icosahedron,
  Octahedron,
  OrbitControls,
  Environment,
  Sparkles,
} from '@react-three/drei';
import { useInView } from 'framer-motion';
import * as THREE from 'three';

/**
 * Glass Sphere with transmission material
 */
function GlassSphere({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={2}>
      <Sphere ref={meshRef} args={[0.8, 64, 64]} position={position}>
        <MeshTransmissionMaterial
          backside
          samples={16}
          resolution={512}
          transmission={1}
          roughness={0.1}
          thickness={0.5}
          ior={1.5}
          chromaticAberration={0.5}
          anisotropy={1}
          distortion={0.3}
          distortionScale={0.5}
          temporalDistortion={0.2}
          color={color}
        />
      </Sphere>
    </Float>
  );
}

/**
 * Metallic Icosahedron
 */
function MetallicIco({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <Icosahedron ref={meshRef} args={[1, 0]} position={position}>
        <meshStandardMaterial color="#3b82f6" roughness={0.1} metalness={1} envMapIntensity={2} />
      </Icosahedron>
    </Float>
  );
}

/**
 * Wireframe Octahedron
 */
function WireframeOcta({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.2}>
      <Octahedron ref={meshRef} args={[1.2, 0]} position={position}>
        <meshStandardMaterial color="#8b5cf6" wireframe roughness={0.2} metalness={0.8} />
      </Octahedron>
    </Float>
  );
}

/**
 * Feature Card 3D Scene
 */
function FeatureScene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#3b82f6" />

      {/* Environment */}
      <Environment preset="sunset" />

      {/* Glass Spheres */}
      <GlassSphere position={[-2, 0, 0]} color="#3b82f6" />
      <GlassSphere position={[2, 1, -1]} color="#8b5cf6" />

      {/* Metallic Shapes */}
      <MetallicIco position={[0, -1.5, 0]} />
      <WireframeOcta position={[1, 1.5, -2]} />

      {/* Sparkles */}
      <Sparkles count={50} scale={6} size={1.5} speed={0.3} opacity={0.5} color="#ffffff" />

      {/* Controls */}
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
    </>
  );
}

/**
 * Interactive 3D Feature Card Background
 */
export function Interactive3DFeature() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full opacity-40">
      {isInView && (
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
        >
          <FeatureScene />
        </Canvas>
      )}
    </div>
  );
}

export default Interactive3DFeature;
