'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
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
  Sparkles,
  Line,
} from '@react-three/drei';
import * as THREE from 'three';

// Custom hook for native browser scroll tracking
function useScrollOffset() {
  const [scrollOffset, setScrollOffset] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const updateScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const maxScroll = scrollHeight - clientHeight;

      // Prevent division by zero and ensure proper calculation
      if (maxScroll <= 0) {
        setScrollOffset(0);
        return;
      }

      const currentScroll =
        window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const offset = Math.max(0, Math.min(1, currentScroll / maxScroll));

      setScrollOffset(offset);
    };

    const handleScroll = () => {
      // Cancel previous animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame for smooth updates
      rafRef.current = requestAnimationFrame(updateScroll);
    };

    // Listen to scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Also listen to resize events in case page height changes
    window.addEventListener('resize', handleScroll, { passive: true });

    // Initial call
    updateScroll();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return scrollOffset;
}

/**
 * Neural Network Node - Interconnected AI nodes
 */
function NeuralNode({
  position,
  isDark,
  index,
  scrollOffset,
}: {
  position: [number, number, number];
  isDark: boolean;
  index: number;
  scrollOffset: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    // Simplified pulsing effect
    const pulse = 0.9 + Math.sin(time + index) * 0.1;
    meshRef.current.scale.setScalar(pulse);

    // Simplified rotation
    meshRef.current.rotation.y = time * 0.2;

    // Vertical movement with scroll
    meshRef.current.position.y = position[1] + scrollOffset * 2;
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
function NeuralConnections({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
  const groupRef = useRef<THREE.Group>(null);

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
    groupRef.current.rotation.y = scrollOffset * Math.PI * 2;
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
function DataFlowParticles({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!particlesRef.current) return;

    const time = state.clock.elapsedTime;

    // Animate particle positions
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] = Math.sin(time * 0.5 + i * 0.1) * 5 + scrollOffset * 10;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    particlesRef.current.rotation.y = scrollOffset * Math.PI;
  });

  // Generate particle positions using deterministic approach
  const particleCount = 300; // Reduced from 500
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);

    // Use index-based deterministic positioning
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const angle = t * Math.PI * 2 * 5; // Multiple spirals
      const radius = 2 + (i % 60) / 10; // Varying radius
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = ((i % 100) / 100 - 0.5) * 10; // Vertical spread
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }

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
function AICoreGlobal({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    // Morphing and pulsing
    meshRef.current.rotation.x = time * 0.2 + scrollOffset * Math.PI * 3;
    meshRef.current.rotation.y = time * 0.3;

    // Scale based on scroll
    const scale = 1.5 + Math.sin(scrollOffset * Math.PI * 2) * 0.3;
    meshRef.current.scale.setScalar(scale);

    // Position movement
    meshRef.current.position.z = -2 + scrollOffset * 8;
    meshRef.current.position.y = Math.sin(scrollOffset * Math.PI) * 3;
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]}>
      <MeshTransmissionMaterial
        backside
        samples={8}
        resolution={256}
        transmission={isDark ? 0.9 : 0.8}
        roughness={isDark ? 0.15 : 0.25}
        thickness={0.5}
        ior={1.5}
        chromaticAberration={isDark ? 0.3 : 0.2}
        anisotropy={0.5}
        color={isDark ? '#3b82f6' : '#2563eb'}
      />
    </Sphere>
  );
}

/**
 * Holographic Data Rings - AI processing visualization
 */
function HolographicRings({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    groupRef.current.rotation.x = time * 0.3 + scrollOffset * Math.PI;
    groupRef.current.rotation.y = time * 0.5;
    groupRef.current.rotation.z = scrollOffset * Math.PI * 2;
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
function CircuitPattern({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
  const linesRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!linesRef.current) return;
    linesRef.current.position.y = -scrollOffset * 5;
    linesRef.current.rotation.z = scrollOffset * Math.PI * 0.5;
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
 * AI Cloud Shapes - Volumetric cloud-like structures
 */
function AICloudShapes({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
  const cloudRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!cloudRef.current) return;
    const time = state.clock.elapsedTime;
    cloudRef.current.rotation.y = time * 0.1 + scrollOffset * 0.5;
    cloudRef.current.position.y = Math.sin(time * 0.5) * 0.5 + scrollOffset * 2;
  });

  return (
    <group ref={cloudRef} position={[-6, 2, -4]}>
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 1.5;
        return (
          <Sphere
            key={i}
            args={[0.4 + Math.sin(i) * 0.1, 16, 16]}
            position={[Math.cos(angle) * radius, Math.sin(angle) * 0.5, Math.sin(angle) * radius]}
          >
            <meshStandardMaterial
              color={isDark ? '#06b6d4' : '#0891b2'}
              transparent
              opacity={isDark ? 0.3 : 0.2}
              emissive={isDark ? '#0e7490' : '#0c4a6e'}
              emissiveIntensity={0.2}
            />
          </Sphere>
        );
      })}
    </group>
  );
}

/**
 * Binary Code Stream - Matrix-style data flow
 */
function BinaryCodeStream({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.position.y = ((time * 2) % 20) - 10 + scrollOffset * 5;
  });

  const binaryStrings = useMemo(() => {
    const strings = [];
    for (let i = 0; i < 5; i++) {
      strings.push({
        x: -8 + i * 4,
        z: -6 - i * 0.5,
      });
    }
    return strings;
  }, []);

  return (
    <group ref={groupRef}>
      {binaryStrings.map((pos, i) => (
        <Line
          key={i}
          points={[
            [pos.x, -10, pos.z],
            [pos.x, 10, pos.z],
          ]}
          color={isDark ? '#22d3ee' : '#0891b2'}
          lineWidth={1}
          opacity={isDark ? 0.4 : 0.3}
          transparent
          dashed
          dashSize={0.5}
          gapSize={0.5}
        />
      ))}
    </group>
  );
}

/**
 * AI Data Cubes - Floating information blocks
 */
function AIDataCubes({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
  const cubesRef = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    cubesRef.current.forEach((cube, i) => {
      if (!cube) return;
      cube.rotation.x = time * (0.5 + i * 0.1);
      cube.rotation.y = time * (0.3 + i * 0.1);
      cube.position.y = Math.sin(time + i) * 1.5 + scrollOffset * 3;
    });
  });

  const cubePositions = useMemo(() => {
    return [
      [-5, 3, -2],
      [5, -2, -3],
      [-3, -3, -4],
      [6, 1, -1],
    ] as [number, number, number][];
  }, []);

  return (
    <>
      {cubePositions.map((pos, i) => (
        <mesh key={i} ref={(el) => (cubesRef.current[i] = el)} position={pos}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial
            color={isDark ? '#8b5cf6' : '#7c3aed'}
            wireframe
            transparent
            opacity={isDark ? 0.5 : 0.4}
            emissive={isDark ? '#6d28d9' : '#5b21b6'}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </>
  );
}

/**
 * Holographic Screens - AI interface panels
 */
function HolographicScreens({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
  const screensRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!screensRef.current) return;
    const time = state.clock.elapsedTime;
    screensRef.current.rotation.y = Math.sin(time * 0.3) * 0.3 + scrollOffset * Math.PI;
  });

  return (
    <group ref={screensRef} position={[0, 0, -6]}>
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 4, Math.sin(i) * 2, Math.sin(angle) * 4]}
            rotation={[0, -angle, 0]}
          >
            <planeGeometry args={[2, 1.5]} />
            <meshStandardMaterial
              color={isDark ? '#3b82f6' : '#2563eb'}
              transparent
              opacity={isDark ? 0.3 : 0.2}
              emissive={isDark ? '#1e40af' : '#1e3a8a'}
              emissiveIntensity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Energy Beams - AI processing visualization
 */
function EnergyBeams({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
  const beamsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!beamsRef.current) return;
    const time = state.clock.elapsedTime;
    beamsRef.current.rotation.z = time * 0.2 + scrollOffset * Math.PI * 0.5;
  });

  const beamCount = 6;
  return (
    <group ref={beamsRef}>
      {[...Array(beamCount)].map((_, i) => {
        const angle = (i / beamCount) * Math.PI * 2;
        return (
          <Line
            key={i}
            points={[
              [0, 0, 0],
              [Math.cos(angle) * 8, Math.sin(angle) * 8, (i % 2 === 0 ? 1 : -1) * 2],
            ]}
            color={isDark ? '#ec4899' : '#db2777'}
            lineWidth={2}
            opacity={isDark ? 0.4 : 0.3}
            transparent
          />
        );
      })}
    </group>
  );
}

/**
 * Danger AI - Warning Zones and Threat Indicators
 */
function DangerZones({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
  const warningRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!warningRef.current) return;
    const time = state.clock.elapsedTime;
    // Pulsing effect for danger zones
    const pulse = 0.8 + Math.sin(time * 3) * 0.2;
    warningRef.current.scale.setScalar(pulse);
    warningRef.current.rotation.y = -time * 0.5;
    // Move with scroll
    warningRef.current.position.y = -1 + scrollOffset * 3;
  });

  return (
    <group ref={warningRef} position={[7, -1, -5]}>
      {/* Warning octahedron */}
      <Octahedron args={[0.8, 0]}>
        <meshStandardMaterial
          color={isDark ? '#ef4444' : '#dc2626'}
          emissive="#991b1b"
          emissiveIntensity={isDark ? 0.6 : 0.4}
          wireframe
          transparent
          opacity={isDark ? 0.7 : 0.6}
        />
      </Octahedron>
      {/* Danger rings */}
      {[1, 1.5, 2].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.03, 8, 32]} />
          <meshStandardMaterial
            color={isDark ? '#f87171' : '#ef4444'}
            emissive="#7f1d1d"
            emissiveIntensity={0.5}
            transparent
            opacity={0.4 - i * 0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Alert Particles - Red warning particles
 */
function AlertParticles({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const time = state.clock.elapsedTime;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      // Pulsing vertical movement
      positions[i + 1] = Math.sin(time * 2 + i * 0.5) * 3 + scrollOffset * 8;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.rotation.y = time * 0.3;
  });

  const alertCount = 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(alertCount * 3);
    for (let i = 0; i < alertCount; i++) {
      const t = i / alertCount;
      const angle = t * Math.PI * 2 * 3;
      const radius = 5 + (i % 30) / 15;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = ((i % 50) / 50 - 0.5) * 8;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isDark ? 0.1 : 0.08}
        color={isDark ? '#fca5a5' : '#f87171'}
        transparent
        opacity={isDark ? 0.6 : 0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Threat Scanner - Scanning laser effect
 */
function ThreatScanner({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
  const scannerRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!scannerRef.current) return;
    const time = state.clock.elapsedTime;
    scannerRef.current.rotation.y = time * 1.5;
    scannerRef.current.position.y = Math.sin(time * 2) * 2 + scrollOffset * 4;
  });

  return (
    <group ref={scannerRef} position={[-7, 0, -3]}>
      {/* Scanning plane */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 0.1]} />
        <meshStandardMaterial
          color={isDark ? '#fbbf24' : '#f59e0b'}
          emissive="#92400e"
          emissiveIntensity={0.8}
          transparent
          opacity={isDark ? 0.5 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Warning pyramid */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.4, 0.8, 3]} />
        <meshStandardMaterial
          color={isDark ? '#fbbf24' : '#f59e0b'}
          emissive="#78350f"
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>
    </group>
  );
}

/**
 * Firewall Grid - Security barrier visualization
 */
function FirewallGrid({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!gridRef.current) return;
    const time = state.clock.elapsedTime;
    gridRef.current.position.z = -8 + Math.sin(time * 0.5) * 1;

    // Flicker effect
    const flicker = Math.sin(time * 10) > 0.7 ? 1 : 0.8;
    gridRef.current.scale.setScalar(flicker);

    // Shift grid with scroll
    gridRef.current.position.y = scrollOffset * 2;
  });

  return (
    <group ref={gridRef}>
      {/* Vertical lines */}
      {[...Array(8)].map((_, i) => {
        const x = -7 + i * 2;
        return (
          <Line
            key={`v${i}`}
            points={[
              [x, -5, -8],
              [x, 5, -8],
            ]}
            color={isDark ? '#fb923c' : '#f97316'}
            lineWidth={1.5}
            opacity={isDark ? 0.4 : 0.3}
            transparent
          />
        );
      })}
      {/* Horizontal lines */}
      {[...Array(6)].map((_, i) => {
        const y = -4 + i * 2;
        return (
          <Line
            key={`h${i}`}
            points={[
              [-7, y, -8],
              [7, y, -8],
            ]}
            color={isDark ? '#fb923c' : '#f97316'}
            lineWidth={1.5}
            opacity={isDark ? 0.4 : 0.3}
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
function ScrollCamera({ scrollOffset }: { scrollOffset: number }) {
  const { camera } = useThree();

  useFrame(() => {
    // Clamp scrollOffset to ensure it's always valid
    const safeOffset = Math.max(0, Math.min(1, scrollOffset));

    // Conservative camera movement
    const targetY = safeOffset * 1;
    const targetZ = 10 - safeOffset * 2; // Camera moves from z=10 to z=8
    const targetRotX = -safeOffset * 0.1;

    // eslint-disable-next-line react-hooks/immutability
    camera.position.y += (targetY - camera.position.y) * 0.05;

    camera.position.z += (targetZ - camera.position.z) * 0.05;

    camera.rotation.x += (targetRotX - camera.rotation.x) * 0.05;
  });

  return null;
}

/**
 * AI-Themed 3D Scene
 */
function AIScene({ isDark, scrollOffset }: { isDark: boolean; scrollOffset: number }) {
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
      <ScrollCamera scrollOffset={scrollOffset} />

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
        count={150}
        scale={25}
        size={2}
        speed={0.3}
        opacity={isDark ? 0.5 : 0.3}
        color={isDark ? '#06b6d4' : '#0891b2'}
      />

      {/* AI Components */}
      <AICoreGlobal isDark={isDark} scrollOffset={scrollOffset} />

      {/* Neural Network Nodes */}
      {nodePositions.map((pos, i) => (
        <NeuralNode key={i} position={pos} isDark={isDark} index={i} scrollOffset={scrollOffset} />
      ))}

      <NeuralConnections isDark={isDark} scrollOffset={scrollOffset} />
      <DataFlowParticles isDark={isDark} scrollOffset={scrollOffset} />
      <HolographicRings isDark={isDark} scrollOffset={scrollOffset} />
      <CircuitPattern isDark={isDark} scrollOffset={scrollOffset} />

      {/* New AI Elements - Clouds, Data, Holograms */}
      <AICloudShapes isDark={isDark} scrollOffset={scrollOffset} />
      <BinaryCodeStream isDark={isDark} scrollOffset={scrollOffset} />
      <AIDataCubes isDark={isDark} scrollOffset={scrollOffset} />
      <HolographicScreens isDark={isDark} scrollOffset={scrollOffset} />
      <EnergyBeams isDark={isDark} scrollOffset={scrollOffset} />

      {/* Danger AI Elements - Warnings, Threats, Security */}
      <DangerZones isDark={isDark} scrollOffset={scrollOffset} />
      <AlertParticles isDark={isDark} scrollOffset={scrollOffset} />
      <ThreatScanner isDark={isDark} scrollOffset={scrollOffset} />
      <FirewallGrid isDark={isDark} scrollOffset={scrollOffset} />

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
      <fog attach="fog" args={[fogColor, 20, 40]} />
    </>
  );
}

/**
 * AI-Themed 3D Background Component
 * Neural networks, data flows, and holographic AI visualization
 */
export default function AI3DBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === 'dark';
  const scrollOffset = useScrollOffset();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 w-full h-full"
      style={{
        zIndex: 0,
        pointerEvents: 'none',
        touchAction: 'none',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        willChange: 'transform',
      }}
    >
      <Canvas
        frameloop="always"
        dpr={1}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          background: 'transparent',
        }}
      >
        <AIScene isDark={isDark} scrollOffset={scrollOffset} />
      </Canvas>
    </div>
  );
}
