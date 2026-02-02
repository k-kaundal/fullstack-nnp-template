/**
 * Animation interfaces for scroll-based and 3D animations
 *
 * @description TypeScript interfaces for Framer Motion and Three.js animations
 */

import { Variants } from 'framer-motion';

/**
 * Scroll animation configuration
 */
export interface ScrollAnimationConfig {
  variants: Variants;
  initial: string;
  animate: string;
  transition?: {
    duration?: number;
    delay?: number;
    ease?: string | number[];
  };
}

/**
 * Parallax layer configuration
 */
export interface ParallaxLayer {
  id: string;
  speed: number; // Multiplier for scroll speed (0.5 = slower, 2 = faster)
  zIndex: number;
  children: React.ReactNode;
}

/**
 * 3D Scene configuration
 */
export interface Scene3DConfig {
  enableShadows?: boolean;
  enableBloom?: boolean;
  enableDOF?: boolean; // Depth of field
  cameraPosition?: [number, number, number];
  backgroundColor?: string;
}

/**
 * Floating geometry configuration
 */
export interface FloatingGeometryConfig {
  type: 'box' | 'sphere' | 'torus' | 'cone' | 'cylinder';
  position: [number, number, number];
  scale?: number;
  color?: string;
  metalness?: number;
  roughness?: number;
  wireframe?: boolean;
  rotation?: [number, number, number];
  floatSpeed?: number;
  floatIntensity?: number;
}

/**
 * Particle field configuration
 */
export interface ParticleFieldConfig {
  count: number;
  size: number;
  color?: string;
  spread: number; // How spread out particles are
  speed?: number;
  opacity?: number;
}

/**
 * Scroll progress data
 */
export interface ScrollProgressData {
  scrollY: number;
  scrollYProgress: number; // 0 to 1
  scrollDirection: 'up' | 'down';
  velocity: number;
}

/**
 * 3D Object animation props
 */
export interface AnimatedObject3DProps {
  geometry: FloatingGeometryConfig;
  scrollProgress?: number;
  hovered?: boolean;
  clicked?: boolean;
}

/**
 * Smooth scroll options
 */
export interface SmoothScrollOptions {
  duration?: number;
  easing?: (t: number) => number;
  smooth?: boolean;
  smoothTouch?: boolean;
  touchMultiplier?: number;
  infinite?: boolean;
}
