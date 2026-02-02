'use client';

/**
 * Scroll-Controlled 3D Scene
 *
 * @description 3D scene that responds to scroll position
 */

import { useScroll } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Scene3D } from './Scene3D';
import { FloatingGeometry } from './FloatingGeometry';
import { ParticleField } from './ParticleField';
import type {
  FloatingGeometryConfig,
  ParticleFieldConfig,
} from '@/interfaces/animations.interface';

interface ScrollControlled3DProps {
  className?: string;
}

export function ScrollControlled3D({ className = '' }: ScrollControlled3DProps) {
  const { scrollYProgress } = useScroll();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  // Geometry configurations
  const geometries: FloatingGeometryConfig[] = [
    {
      type: 'torus',
      position: [-2, 0, 0],
      scale: 1.5,
      color: isDark ? '#818cf8' : '#6366f1',
      metalness: 0.8,
      roughness: 0.2,
      floatSpeed: 2,
      floatIntensity: 0.3,
    },
    {
      type: 'sphere',
      position: [2, -1, -1],
      scale: 1.2,
      color: isDark ? '#c084fc' : '#a855f7',
      metalness: 0.7,
      roughness: 0.3,
      floatSpeed: 1.5,
      floatIntensity: 0.4,
    },
    {
      type: 'box',
      position: [0, 1.5, -2],
      scale: 1,
      color: isDark ? '#f472b6' : '#ec4899',
      metalness: 0.6,
      roughness: 0.4,
      floatSpeed: 1.8,
      floatIntensity: 0.5,
    },
  ];

  // Particle field configuration
  const particleConfig: ParticleFieldConfig = {
    count: 1000,
    size: 0.02,
    color: isDark ? '#ffffff' : '#6366f1',
    spread: 15,
    speed: 0.3,
    opacity: isDark ? 0.4 : 0.3,
  };

  return (
    <Scene3D className={className} enableControls={false}>
      {/* Floating geometric shapes */}
      {geometries.map((config, index) => (
        <FloatingGeometry key={index} config={config} scrollProgress={scrollYProgress.get()} />
      ))}

      {/* Particle field */}
      <ParticleField config={particleConfig} scrollProgress={scrollYProgress.get()} />
    </Scene3D>
  );
}
