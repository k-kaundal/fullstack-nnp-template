'use client';

import { useRef, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Float,
  MeshTransmissionMaterial,
  Sphere,
  Icosahedron,
  Octahedron,
  Environment,
  PerspectiveCamera,
  useScroll,
  ScrollControls,
  Sparkles,
  Line,
} from '@react-three/drei';
import { useInView } from 'framer-motion';
import * as THREE from 'three';

/**
 * Neural Network Node - Interconnected AI nodes
 */
function NeuralNode({
  position,
  isDark,
  index,
}: {
  position: [number, number, number];
  isDark: boolean;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame((state) => {
    if (!meshRef.current) return;

    const offset = scroll.offset;
    const time = state.clock.elapsedTime;

    // Pulsing effect synced with scroll
    const pulse = 0.8 + Math.sin(time * 2 + index * 0.5) * 0.2 + offset * 0.3;
    meshRef.current.scale.setScalar(pulse);

    // Gentle rotation
    meshRef.current.rotation.x = time * 0.3 + offset * Math.PI;
    meshRef.current.rotation.y = time * 0.2;

    // Vertical movement with scroll
    meshRef.current.position.y = position[1] + Math.sin(offset * Math.PI * 2 + index) * 2;
  });

  const nodeColor = isDark ? '#06b6d4' : '#0891b2'; // Cyan for AI
  const emissiveColor = isDark ? '#0e7490' : '#0c4a6e';

  return (
    <Icosahedron ref={meshRef} args={[0.3, 1]} position={position}>
      <meshStandardMaterial
        color={nodeColor}
        emissive={emissiveColor}
        emissiveIntensity={isDark ? 0.5 : 0.3}
        metalness={0.9}
        roughness={0.1}
      />
    </Icosahedron>
  );
}

/**
 * Neural Network Connections - Lines connecting nodes
 */
function NeuralConnections({ isDark }: { isDark: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  const lineColor = isDark ? '#3b82f6' : '#2563eb';

  // Generate connection points for neural network
  const connections = useMemo(() => {
    const points: [number, number, number][][] = [];
    for (let i = 0; i < 8; i++) {
      const angle1 = (i / 8) * Math.PI * 2;
      const angle2 = ((i + 1) / 8) * Math.PI * 2;
      points.push([
        [Math.cos(angle1) * 4, Math.sin(angle1) * 2, Math.sin(angle1) * 3],
        [Math.cos(angle2) * 4, Math.sin(angle2) * 2, Math.sin(angle2) * 3],
      ]);
    }
    return points;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const offset = scroll.offset;
    groupRef.current.rotation.y = offset * Math.PI * 2;
  });

  return (
    <group ref={groupRef}>
      {connections.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={lineColor}
          lineWidth={isDark ? 2 : 1.5}
          opacity={isDark ? 0.4 : 0.3}
          transparent
        />
      ))}
    </group>
  );
}

/**
 * Data Flow Particles - Animated particles flowing through the scene
 */
function DataFlowParticles({ isDark }: { isDark: boolean }) {
  const scroll = useScroll();
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!particlesRef.current) return;

    const offset = scroll.offset;
    const time = state.clock.elapsedTime;

    // Animate particle positions
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] = Math.sin(time * 0.5 + i * 0.1) * 5 + offset * 10;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    particlesRef.current.rotation.y = offset * Math.PI;
  });

  // Generate particle positions
  const particleCount = 500;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    /* eslint-disable react-hooks/purity */
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 6;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    /* eslint-enable react-hooks/purity */
    return pos;
  }, []);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isDark ? 0.08 : 0.06}
        color={isDark ? '#8b5cf6' : '#7c3aed'}
        transparent
        opacity={isDark ? 0.7 : 0.5}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * AI Core Sphere - Central brain/processor
 */
function AICoreGlobal({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame((state) => {
    if (!meshRef.current) return;

    const offset = scroll.offset;
    const time = state.clock.elapsedTime;

    // Morphing and pulsing
    meshRef.current.rotation.x = time * 0.2 + offset * Math.PI * 3;
    meshRef.current.rotation.y = time * 0.3;

    // Scale based on scroll
    const scale = 1.5 + Math.sin(offset * Math.PI * 2) * 0.3;
    meshRef.current.scale.setScalar(scale);

    // Position movement
    meshRef.current.position.z = -2 + offset * 8;
    meshRef.current.position.y = Math.sin(offset * Math.PI) * 3;
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <MeshTransmissionMaterial
        backside
        samples={16}
        resolution={512}
        transmission={isDark ? 0.95 : 0.85}
        roughness={isDark ? 0.1 : 0.2}
        thickness={0.5}
        ior={1.5}
        chromaticAberration={isDark ? 0.5 : 0.3}
        anisotropy={1}
        color={isDark ? '#3b82f6' : '#2563eb'}
      />
    </Sphere>
  );
}

/**
 * Holographic Data Rings - AI processing visualization
 */
function HolographicRings({ isDark }: { isDark: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  useFrame((state) => {
    if (!groupRef.current) return;

    const offset = scroll.offset;
    const time = state.clock.elapsedTime;

    groupRef.current.rotation.x = time * 0.3 + offset * Math.PI;
    groupRef.current.rotation.y = time * 0.5;
    groupRef.current.rotation.z = offset * Math.PI * 2;
  });

  const ringColors = isDark
    ? ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']
    : ['#0891b2', '#2563eb', '#7c3aed', '#db2777'];

  return (
    <group ref={groupRef} position={[3, 0, -1]}>
      {ringColors.map((color, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, (Math.PI / 4) * i]}>
          <torusGeometry args={[2 + i * 0.3, 0.05, 16, 100]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isDark ? 0.4 : 0.2}
            transparent
            opacity={isDark ? 0.6 : 0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Circuit Board Pattern - Tech grid background
 */
function CircuitPattern({ isDark }: { isDark: boolean }) {
  const linesRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (!linesRef.current) return;
    const offset = scroll.offset;
    linesRef.current.position.y = -offset * 5;
    linesRef.current.rotation.z = offset * Math.PI * 0.5;
  });

  const lineColor = isDark ? '#1e40af' : '#1e3a8a';

  return (
    <group ref={linesRef} position={[0, 0, -5]}>
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <Line
            key={i}
            points={[
              [Math.cos(angle) * 3, Math.sin(angle) * 3, 0],
              [Math.cos(angle) * 8, Math.sin(angle) * 8, 0],
            ]}
            color={lineColor}
            lineWidth={1}
            opacity={isDark ? 0.3 : 0.2}
            transparent
          />
        );
      })}
    </group>
  );
}

/**
 * Camera Animation - Scroll-controlled camera movement
 */
function ScrollCamera() {
  const { camera } = useThree();
  const scroll = useScroll();

  useFrame(() => {
    const offset = scroll.offset;

    // Move camera through the scene using set method
    camera.position.set(camera.position.x, offset * 3, 10 - offset * 5);
    camera.rotation.set(-offset * 0.3, camera.rotation.y, camera.rotation.z);
  });

  return null;
}

/**
 * AI-Themed 3D Scene
 */
function AIScene({ isDark }: { isDark: boolean }) {
  const fogColor = isDark ? '#0a0a0a' : '#f0f9ff';
  const ambientIntensity = isDark ? 0.3 : 0.5;
  const directionalIntensity = isDark ? 1.2 : 1.8;

  // Generate neural node positions in a neural network pattern
  const nodePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 4 + (i % 3);
      const y = Math.sin(i * 0.5) * 2;
      positions.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
    }
    return positions;
  }, []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={75} />
      <ScrollCamera />

      {/* AI-Themed Lighting */}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[10, 10, 5]} intensity={directionalIntensity} />
      <pointLight position={[-10, 0, -5]} intensity={0.8} color="#06b6d4" />
      <pointLight position={[10, 0, -5]} intensity={0.8} color="#3b82f6" />
      <pointLight position={[0, 10, 5]} intensity={0.6} color="#8b5cf6" />

      {/* Environment */}
      <Environment preset={isDark ? 'night' : 'city'} />

      {/* Tech Sparkles */}
      <Sparkles
        count={300}
        scale={25}
        size={2}
        speed={0.3}
        opacity={isDark ? 0.5 : 0.3}
        color={isDark ? '#06b6d4' : '#0891b2'}
      />

      {/* AI Components */}
      <AICoreGlobal isDark={isDark} />

      {/* Neural Network Nodes */}
      {nodePositions.map((pos, i) => (
        <NeuralNode key={i} position={pos} isDark={isDark} index={i} />
      ))}

      <NeuralConnections isDark={isDark} />
      <DataFlowParticles isDark={isDark} />
      <HolographicRings isDark={isDark} />
      <CircuitPattern isDark={isDark} />

      {/* Floating AI Elements */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <Octahedron args={[0.6, 0]} position={[-4, 2, -2]}>
          <meshStandardMaterial
            color={isDark ? '#8b5cf6' : '#7c3aed'}
            emissive={isDark ? '#6d28d9' : '#5b21b6'}
            emissiveIntensity={isDark ? 0.4 : 0.2}
            wireframe
            transparent
            opacity={isDark ? 0.7 : 0.5}
          />
        </Octahedron>
      </Float>

      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
        <Icosahedron args={[0.5, 1]} position={[4, -1, -3]}>
          <meshStandardMaterial
            color={isDark ? '#ec4899' : '#db2777'}
            metalness={1}
            roughness={0.1}
            emissive={isDark ? '#be185d' : '#9f1239'}
            emissiveIntensity={isDark ? 0.3 : 0.2}
          />
        </Icosahedron>
      </Float>

      {/* Fog for depth */}
      <fog attach="fog" args={[fogColor, 5, 30]} />
    </>
  );
}

/**
 * AI-Themed 3D Background Component
 * Neural networks, data flows, and holographic AI visualization
 */
export default function AI3DBackground() {
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
            <AIScene isDark={isDark} />
          </ScrollControls>
        </Canvas>
      )}
    </div>
  );
}
