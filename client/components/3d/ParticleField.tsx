'use client';

/**
 * Particle Field Component
 *
 * @description Thousands of animated particles forming a field in 3D space
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ParticleFieldConfig } from '@/interfaces/animations.interface';

interface ParticleFieldProps {
  config: ParticleFieldConfig;
  scrollProgress?: number;
}

export function ParticleField({ config, scrollProgress = 0 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { count, size, color = '#ffffff', spread, speed = 0.5, opacity = 0.6 } = config;

  // Generate particle positions
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    // Use crypto.getRandomValues for deterministic random generation
    const randomValues = new Uint32Array(count * 4);
    if (typeof window !== 'undefined') {
      crypto.getRandomValues(randomValues);
    }

    for (let i = 0; i < count; i++) {
      // Convert to 0-1 range
      const r1 = randomValues[i * 4] / 0xffffffff;
      const r2 = randomValues[i * 4 + 1] / 0xffffffff;
      const r3 = randomValues[i * 4 + 2] / 0xffffffff;
      const r4 = randomValues[i * 4 + 3] / 0xffffffff;

      // Random position within spread
      positions[i * 3] = (r1 - 0.5) * spread;
      positions[i * 3 + 1] = (r2 - 0.5) * spread;
      positions[i * 3 + 2] = (r3 - 0.5) * spread;

      // Random scale
      scales[i] = r4;
    }

    return { positions, scales };
  }, [count, spread]);

  // Animate particles
  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime();

      // Rotate the entire particle system
      pointsRef.current.rotation.y = time * speed * 0.05;

      // Wave motion based on scroll
      if (scrollProgress > 0) {
        pointsRef.current.rotation.x = Math.sin(scrollProgress * Math.PI) * 0.5;
      }

      // Update particle positions for wave effect
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const z = positions[i3 + 2];

        // Create wave pattern
        positions[i3 + 1] += Math.sin(time * speed + x * 0.5 + z * 0.5) * 0.001;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
        <bufferAttribute attach="attributes-scale" args={[particles.scales, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
