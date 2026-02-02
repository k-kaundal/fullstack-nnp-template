'use client';

import { useRef, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  Sphere,
  Icosahedron,
  Torus,
  OrbitControls,
  Environment,
  PerspectiveCamera,
  useScroll,
  ScrollControls,
  Line,
} from '@react-three/drei';
import * as THREE from 'three';

/**
 * AI Brain Core - Central neural network sphere
 */
function AIBrainCore({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame((state) => {
    if (!meshRef.current) return;

    const offset = scroll.offset;
    const time = state.clock.elapsedTime;

    // Neural activity pulsing
    const pulse = 1.8 + Math.sin(time * 0.5) * 0.2 + Math.cos(offset * Math.PI * 2) * 0.3;
    meshRef.current.scale.setScalar(pulse);

    // Rotation simulating neural processing
    meshRef.current.rotation.x = time * 0.15 + offset * Math.PI;
    meshRef.current.rotation.y = time * 0.25 + offset * Math.PI * 1.5;

    // Scroll-based position
    meshRef.current.position.y = Math.sin(offset * Math.PI * 1.5) * 2;
  });

  return (
    <Sphere ref={meshRef} args={[2, 128, 128]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color={isDark ? '#06b6d4' : '#0891b2'}
        attach="material"
        distort={0.5}
        speed={1.5}
        roughness={0.1}
        metalness={0.9}
        emissive={isDark ? '#0e7490' : '#0c4a6e'}
        emissiveIntensity={isDark ? 0.4 : 0.2}
      />
    </Sphere>
  );
}

/**
 * Neural Network Layer - Interconnected nodes forming a network
 */
function NeuralNetworkLayer({ isDark }: { isDark: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  const nodeCount = 20;
  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }, (_, i) => {
      const layer = Math.floor(i / 5);
      const angle = (i % 5) * ((Math.PI * 2) / 5);
      const radius = 4 + layer * 0.5;
      return {
        position: [Math.cos(angle) * radius, (layer - 1.5) * 2, Math.sin(angle) * radius] as [
          number,
          number,
          number,
        ],
        color: isDark
          ? ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'][layer % 4]
          : ['#0891b2', '#2563eb', '#7c3aed', '#db2777'][layer % 4],
      };
    });
  }, [isDark]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const offset = scroll.offset;
    const time = state.clock.elapsedTime;

    groupRef.current.rotation.y = time * 0.3 + offset * Math.PI * 2;
    groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.2;
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <Float key={i} speed={1 + (i % 5) * 0.2} rotationIntensity={0.3} floatIntensity={0.5}>
          <Icosahedron args={[0.15, 1]} position={node.position}>
            <meshStandardMaterial
              color={node.color}
              emissive={node.color}
              emissiveIntensity={isDark ? 0.6 : 0.4}
              metalness={0.9}
              roughness={0.1}
            />
          </Icosahedron>
        </Float>
      ))}
    </group>
  );
}

/**
 * Data Stream Rings - Holographic information flow
 */
function DataStreamRings({ isDark }: { isDark: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  useFrame((state) => {
    if (!groupRef.current) return;

    const offset = scroll.offset;
    const time = state.clock.elapsedTime;

    // Rotating at different speeds
    groupRef.current.rotation.x = time * 0.4 + offset * Math.PI * 3;
    groupRef.current.rotation.y = time * 0.6;
    groupRef.current.rotation.z = offset * Math.PI * 2;

    // Scale pulsing
    const scale = 1 + Math.sin(offset * Math.PI * 4) * 0.2;
    groupRef.current.scale.setScalar(scale);
  });

  const ringColors = isDark
    ? ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']
    : ['#0891b2', '#2563eb', '#7c3aed', '#db2777', '#d97706'];

  return (
    <group ref={groupRef}>
      {ringColors.map((color, i) => (
        <Torus
          key={i}
          args={[2.5 + i * 0.5, 0.08, 16, 100]}
          position={[0, 0, 0]}
          rotation={[Math.PI / 2 + (i * Math.PI) / 6, 0, 0]}
        >
          <MeshTransmissionMaterial
            backside
            samples={8}
            resolution={256}
            transmission={isDark ? 0.92 : 0.82}
            roughness={0.15}
            thickness={0.2}
            ior={1.5}
            chromaticAberration={isDark ? 0.4 : 0.3}
            color={color}
          />
        </Torus>
      ))}
    </group>
  );
}

/**
 * Quantum Computing Particles - Floating data points
 */
function QuantumParticles({ isDark }: { isDark: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  const scroll = useScroll();

  const particleCount = 800;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    /* eslint-disable react-hooks/purity */
    for (let i = 0; i < particleCount; i++) {
      const radius = 3 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    /* eslint-enable react-hooks/purity */
    return pos;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;

    const offset = scroll.offset;
    const time = state.clock.elapsedTime;

    // Animate particles
    const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const x = pos[i3];
      const y = pos[i3 + 1];
      const z = pos[i3 + 2];

      // Spiral motion
      const angle = time * 0.5 + i * 0.01;
      pos[i3] = x * Math.cos(angle * 0.1) - z * Math.sin(angle * 0.1);
      pos[i3 + 2] = x * Math.sin(angle * 0.1) + z * Math.cos(angle * 0.1);

      // Vertical wave
      pos[i3 + 1] = y + Math.sin(time + i * 0.1 + offset * Math.PI * 2) * 0.1;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    particlesRef.current.rotation.y = offset * Math.PI;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isDark ? 0.05 : 0.04}
        color={isDark ? '#06b6d4' : '#0891b2'}
        transparent
        opacity={isDark ? 0.6 : 0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Circuit Grid - Tech background pattern
 */
function CircuitGrid({ isDark }: { isDark: boolean }) {
  const linesRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (!linesRef.current) return;
    const offset = scroll.offset;
    linesRef.current.rotation.y = offset * Math.PI * 0.5;
  });

  const gridColor = isDark ? '#1e40af' : '#1e3a8a';

  return (
    <group ref={linesRef} position={[0, 0, -8]}>
      {[...Array(16)].map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const radius1 = 5;
        const radius2 = 12;

        return (
          <Line
            key={i}
            points={[
              [Math.cos(angle) * radius1, Math.sin(angle) * radius1, 0],
              [Math.cos(angle) * radius2, Math.sin(angle) * radius2, 0],
            ]}
            color={gridColor}
            lineWidth={0.5}
            opacity={isDark ? 0.2 : 0.15}
            transparent
          />
        );
      })}
    </group>
  );
}

/**
 * AI Hero Scene - Complete hero section with AI theme
 */
function AIHeroSceneContent({ isDark }: { isDark: boolean }) {
  const fogColor = isDark ? '#0a0a0a' : '#f0f9ff';
  const ambientIntensity = isDark ? 0.2 : 0.4;
  const directionalIntensity = isDark ? 1.5 : 2;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 14]} fov={60} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.2}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />

      {/* AI-Themed Lighting */}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[10, 10, 5]} intensity={directionalIntensity} color="#ffffff" />
      <pointLight position={[-10, 0, -5]} intensity={1} color="#06b6d4" />
      <pointLight position={[10, 0, -5]} intensity={1} color="#3b82f6" />
      <pointLight position={[0, 10, 5]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[0, -10, 0]} intensity={0.6} color="#ec4899" />

      {/* Environment */}
      <Environment preset={isDark ? 'night' : 'city'} />

      {/* AI Components */}
      <AIBrainCore isDark={isDark} />
      <NeuralNetworkLayer isDark={isDark} />
      <DataStreamRings isDark={isDark} />
      <QuantumParticles isDark={isDark} />
      <CircuitGrid isDark={isDark} />

      {/* Additional Tech Elements */}
      <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
        <Icosahedron args={[0.8, 2]} position={[5, 3, -2]}>
          <meshStandardMaterial
            color={isDark ? '#f59e0b' : '#d97706'}
            emissive={isDark ? '#b45309' : '#92400e'}
            emissiveIntensity={isDark ? 0.5 : 0.3}
            wireframe
            transparent
            opacity={isDark ? 0.6 : 0.4}
          />
        </Icosahedron>
      </Float>

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <Sphere args={[0.6, 32, 32]} position={[-5, -2, -3]}>
          <MeshTransmissionMaterial
            backside
            samples={8}
            resolution={256}
            transmission={isDark ? 0.95 : 0.85}
            roughness={0.1}
            thickness={0.4}
            ior={1.5}
            chromaticAberration={isDark ? 0.5 : 0.3}
            color={isDark ? '#ec4899' : '#db2777'}
          />
        </Sphere>
      </Float>

      {/* Fog */}
      <fog attach="fog" args={[fogColor, 8, 35]} />
    </>
  );
}

/**
 * AI Hero Scene Component
 * Advanced AI visualization with neural networks and data streams
 */
export default function AIHeroScene() {
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
          <AIHeroSceneContent isDark={isDark} />
        </ScrollControls>
      </Canvas>
    </div>
  );
}
