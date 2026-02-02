'use client';

import { useRef } from 'react';
import { useTheme } from 'next-themes';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  Sphere,
  RoundedBox,
  Torus,
  OrbitControls,
  Environment,
  PerspectiveCamera,
  useScroll,
  ScrollControls,
  Sparkles,
  Cloud,
  Sky,
} from '@react-three/drei';
import * as THREE from 'three';

/**
 * Hero sphere that reacts to scroll
 */
function HeroSphere({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame((state) => {
    if (!meshRef.current) return;

    const offset = scroll.offset;

    // Pulse effect
    const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    meshRef.current.scale.setScalar(scale);

    // Rotation
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 + offset * Math.PI;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 + offset * Math.PI * 2;

    // Position shift on scroll
    meshRef.current.position.y = Math.sin(offset * Math.PI) * 2;
    meshRef.current.position.x = Math.cos(offset * Math.PI * 2) * 1;
  });

  return (
    <Sphere ref={meshRef} args={[2, 128, 128]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color={isDark ? '#3b82f6' : '#2563eb'}
        attach="material"
        distort={0.4}
        speed={2}
        roughness={isDark ? 0.2 : 0.3}
        metalness={isDark ? 0.9 : 0.7}
        emissive={isDark ? '#1e40af' : '#1e3a8a'}
        emissiveIntensity={isDark ? 0.2 : 0.1}
      />
    </Sphere>
  );
}

/**
 * Orbiting glass rings
 */
function GlassRings({ isDark }: { isDark: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const darkColors = ['#3b82f6', '#8b5cf6', '#ec4899'];
  const lightColors = ['#2563eb', '#7c3aed', '#db2777'];
  const colors = isDark ? darkColors : lightColors;

  useFrame((state) => {
    if (!groupRef.current) return;

    const offset = scroll.offset;

    groupRef.current.rotation.y = state.clock.elapsedTime * 0.5 + offset * Math.PI * 4;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2].map((i) => (
        <Torus
          key={i}
          args={[3 + i * 0.8, 0.1, 16, 100]}
          position={[0, 0, 0]}
          rotation={[(Math.PI / 3) * i, 0, 0]}
        >
          <MeshTransmissionMaterial
            backside
            samples={16}
            resolution={512}
            transmission={isDark ? 0.98 : 0.88}
            roughness={isDark ? 0.1 : 0.2}
            thickness={0.3}
            ior={1.5}
            chromaticAberration={isDark ? 0.4 : 0.3}
            color={colors[i]}
          />
        </Torus>
      ))}
    </group>
  );
}

/**
 * Floating geometric shapes
 */
function FloatingShapes({ isDark }: { isDark: boolean }) {
  const darkColors = [
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#06b6d4',
    '#6366f1',
    '#f43f5e',
  ];
  const lightColors = [
    '#2563eb',
    '#7c3aed',
    '#db2777',
    '#d97706',
    '#059669',
    '#0891b2',
    '#4f46e5',
    '#e11d48',
  ];
  const darkEmissive = [
    '#1e40af',
    '#6d28d9',
    '#be185d',
    '#b45309',
    '#047857',
    '#0e7490',
    '#4338ca',
    '#be123c',
  ];
  const lightEmissive = [
    '#1e3a8a',
    '#5b21b6',
    '#9f1239',
    '#92400e',
    '#065f46',
    '#0c4a6e',
    '#3730a3',
    '#9f1239',
  ];

  const colors = isDark ? darkColors : lightColors;
  const emissiveColors = isDark ? darkEmissive : lightEmissive;

  return (
    <>
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 6;

        return (
          <Float
            key={i}
            speed={1 + i * 0.2}
            rotationIntensity={0.5 + i * 0.1}
            floatIntensity={1 + i * 0.2}
          >
            <RoundedBox
              args={[0.4, 0.4, 0.4]}
              radius={0.05}
              position={[Math.cos(angle) * radius, Math.sin(i * 0.5) * 3, Math.sin(angle) * radius]}
            >
              <meshStandardMaterial
                color={colors[i]}
                roughness={isDark ? 0.2 : 0.3}
                metalness={isDark ? 0.8 : 0.6}
                emissive={emissiveColors[i]}
                emissiveIntensity={isDark ? 0.3 : 0.2}
              />
            </RoundedBox>
          </Float>
        );
      })}
    </>
  );
}

/**
 * Particle system that moves with scroll
 */
function ScrollParticles() {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const offset = scroll.offset;

    groupRef.current.rotation.y = offset * Math.PI * 2;
    groupRef.current.position.y = offset * 5;
  });

  return (
    <group ref={groupRef}>
      <Sparkles count={300} scale={15} size={2} speed={0.5} opacity={0.8} color="#ffffff" />
    </group>
  );
}

/**
 * Animated clouds
 */
function AnimatedClouds() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <group ref={groupRef}>
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <Cloud
            key={i}
            position={[Math.cos(angle) * 8, i * 2 - 4, Math.sin(angle) * 8]}
            speed={0.2}
            opacity={0.3}
            segments={20}
            bounds={[2, 1, 1]}
            volume={4}
            color="#ffffff"
          />
        );
      })}
    </group>
  );
}

/**
 * Hero 3D Scene
 */
function HeroScene({ isDark }: { isDark: boolean }) {
  const fogColor = isDark ? '#0f172a' : '#f0f9ff';
  const ambientIntensity = isDark ? 0.3 : 0.5;
  const directionalIntensity = isDark ? 1.5 : 2;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={60} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />

      {/* Lighting */}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[10, 10, 5]} intensity={directionalIntensity} color="#ffffff" />
      <pointLight position={[-10, 0, -5]} intensity={0.8} color="#3b82f6" />
      <pointLight position={[10, 0, -5]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[0, 10, 5]} intensity={0.5} color="#ec4899" />

      {/* Environment */}
      <Environment preset="city" />
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={isDark ? 0.6 : 0.5}
        azimuth={0.25}
      />

      {/* 3D Elements */}
      <HeroSphere isDark={isDark} />
      <GlassRings isDark={isDark} />
      <FloatingShapes isDark={isDark} />
      <ScrollParticles />
      <AnimatedClouds />

      {/* Fog */}
      <fog attach="fog" args={[fogColor, 10, 30]} />
    </>
  );
}

/**
 * Scroll-Enhanced Hero Background
 * Professional 3D scene with scroll-reactive elements
 */
export default function ScrollEnhancedHero() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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
        <ScrollControls pages={2} damping={0.3} distance={1}>
          <HeroScene isDark={isDark} />
        </ScrollControls>
      </Canvas>
    </div>
  );
}
