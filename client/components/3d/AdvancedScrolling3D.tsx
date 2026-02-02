'use client';

import { useRef } from 'react';
import { useTheme } from 'next-themes';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Float,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  Sphere,
  Box,
  Torus,
  Icosahedron,
  Octahedron,
  Stars,
  Environment,
  PerspectiveCamera,
  useScroll,
  ScrollControls,
  Sparkles,
  Trail,
} from '@react-three/drei';
import { useInView } from 'framer-motion';
import * as THREE from 'three';

/**
 * Scroll-controlled floating sphere that morphs and moves with scroll
 */
function ScrollSphere({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (!meshRef.current) return;

    // Get scroll progress (0 to 1)
    const offset = scroll.offset;

    // Transform based on scroll position
    meshRef.current.position.y = offset * 10 - 5;
    meshRef.current.position.x = Math.sin(offset * Math.PI * 2) * 3;
    meshRef.current.rotation.x = offset * Math.PI * 4;
    meshRef.current.rotation.y = offset * Math.PI * 2;
    meshRef.current.scale.setScalar(1 + Math.sin(offset * Math.PI * 2) * 0.3);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color={isDark ? '#3b82f6' : '#2563eb'}
          attach="material"
          distort={0.6}
          speed={1.5}
          roughness={isDark ? 0.1 : 0.2}
          metalness={isDark ? 0.9 : 0.7}
        />
      </Sphere>
    </Float>
  );
}

/**
 * Glass torus that rotates and moves with scroll
 */
function ScrollTorus({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (!meshRef.current) return;

    const offset = scroll.offset;

    // Circular motion around the scene
    meshRef.current.position.x = Math.cos(offset * Math.PI * 4) * 4;
    meshRef.current.position.z = Math.sin(offset * Math.PI * 4) * 4;
    meshRef.current.position.y = Math.sin(offset * Math.PI * 2) * 2;
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y = offset * Math.PI * 3;
  });

  return (
    <Torus ref={meshRef} args={[1, 0.4, 16, 100]} position={[2, 0, 0]}>
      <MeshTransmissionMaterial
        backside
        samples={16}
        resolution={512}
        transmission={isDark ? 0.95 : 0.85}
        roughness={isDark ? 0.15 : 0.25}
        thickness={0.5}
        ior={1.5}
        chromaticAberration={isDark ? 0.6 : 0.4}
        anisotropy={1}
        color={isDark ? '#8b5cf6' : '#7c3aed'}
      />
    </Torus>
  );
}

/**
 * Morphing icosahedron that changes shape with scroll
 */
function ScrollIcosahedron({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (!meshRef.current) return;

    const offset = scroll.offset;

    // Spiral motion
    const angle = offset * Math.PI * 6;
    const radius = 3 + Math.sin(offset * Math.PI * 2) * 1;
    meshRef.current.position.x = Math.cos(angle) * radius;
    meshRef.current.position.z = Math.sin(angle) * radius;
    meshRef.current.position.y = offset * 8 - 4;

    // Rotation based on scroll
    meshRef.current.rotation.x = offset * Math.PI * 5;
    meshRef.current.rotation.y = offset * Math.PI * 3;
    meshRef.current.rotation.z = offset * Math.PI * 2;

    // Scale pulsing
    const scale = 1 + Math.sin(offset * Math.PI * 4) * 0.4;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <Icosahedron ref={meshRef} args={[1, 0]} position={[-2, 0, 0]}>
      <meshStandardMaterial
        color={isDark ? '#10b981' : '#059669'}
        roughness={isDark ? 0.1 : 0.2}
        metalness={1}
        envMapIntensity={isDark ? 2 : 1.5}
      />
    </Icosahedron>
  );
}

/**
 * Floating boxes that orbit with scroll
 */
function ScrollBoxes({ isDark }: { isDark: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  const darkColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  const lightColors = ['#2563eb', '#7c3aed', '#db2777', '#d97706', '#059669'];
  const colors = isDark ? darkColors : lightColors;

  useFrame(() => {
    if (!groupRef.current) return;

    const offset = scroll.offset;

    // Rotate entire group
    groupRef.current.rotation.y = offset * Math.PI * 2;
    groupRef.current.rotation.x = Math.sin(offset * Math.PI) * 0.5;
  });

  return (
    <group ref={groupRef}>
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 5;
        return (
          <Box
            key={i}
            args={[0.5, 0.5, 0.5]}
            position={[Math.cos(angle) * radius, Math.sin(angle) * 2, Math.sin(angle) * radius]}
          >
            <meshStandardMaterial
              color={colors[i]}
              roughness={isDark ? 0.2 : 0.3}
              metalness={isDark ? 0.8 : 0.6}
            />
          </Box>
        );
      })}
    </group>
  );
}

/**
 * Camera that moves with scroll
 */
function ScrollCamera() {
  const scroll = useScroll();
  const { camera } = useThree();

  useFrame(() => {
    const offset = scroll.offset;

    // Move camera through the scene
    /* eslint-disable react-hooks/immutability */
    camera.position.z = 10 - offset * 5;
    camera.position.y = offset * 3;
    camera.rotation.x = -offset * 0.5;
    /* eslint-enable react-hooks/immutability */
  });

  return null;
}

/**
 * Trail effect for moving objects
 */
function TrailingSphere({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();
  const trailColor = isDark ? '#ec4899' : '#db2777';

  useFrame(() => {
    if (!meshRef.current) return;

    const offset = scroll.offset;
    meshRef.current.position.x = Math.sin(offset * Math.PI * 8) * 4;
    meshRef.current.position.y = offset * 6 - 3;
  });

  return (
    <Trail width={2} length={8} color={trailColor} attenuation={(t) => t * t}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={trailColor}
          emissive={trailColor}
          emissiveIntensity={isDark ? 0.5 : 0.3}
        />
      </Sphere>
    </Trail>
  );
}

/**
 * Main scroll-controlled 3D scene
 */
function ScrollScene({ isDark }: { isDark: boolean }) {
  const fogColor = isDark ? '#0a0a0a' : '#f0f9ff';
  const ambientIntensity = isDark ? 0.4 : 0.6;
  const directionalIntensity = isDark ? 1 : 1.5;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={75} />
      <ScrollCamera />

      {/* Lighting */}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[10, 10, 5]} intensity={directionalIntensity} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[0, -10, 5]} intensity={0.5} color="#ec4899" />

      {/* Environment */}
      <Environment preset={isDark ? 'sunset' : 'city'} />

      {/* Stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Sparkles */}
      <Sparkles
        count={200}
        scale={20}
        size={2}
        speed={0.4}
        opacity={isDark ? 0.6 : 0.4}
        color="#ffffff"
      />

      {/* Scroll-controlled geometries */}
      <ScrollSphere isDark={isDark} />
      <ScrollTorus isDark={isDark} />
      <ScrollIcosahedron isDark={isDark} />
      <ScrollBoxes isDark={isDark} />
      <TrailingSphere isDark={isDark} />

      {/* Additional floating elements */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1}>
        <Octahedron args={[0.8, 0]} position={[3, 2, -2]}>
          <meshStandardMaterial
            color={isDark ? '#f59e0b' : '#d97706'}
            wireframe
            roughness={isDark ? 0.2 : 0.3}
            metalness={isDark ? 0.8 : 0.6}
          />
        </Octahedron>
      </Float>

      {/* Fog for depth */}
      <fog attach="fog" args={[fogColor, 5, 25]} />
    </>
  );
}

/**
 * Advanced Scroll-Controlled 3D Background
 * Geometries transform and move based on scroll position
 */
export default function AdvancedScrolling3D() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.1 });
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full pointer-events-none">
      {isInView && (
        <Canvas
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
        >
          <ScrollControls pages={3} damping={0.2} distance={1}>
            <ScrollScene isDark={isDark} />
          </ScrollControls>
        </Canvas>
      )}
    </div>
  );
}
