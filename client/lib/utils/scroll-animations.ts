/**
 * Scroll animation utilities using Framer Motion
 *
 * @description Reusable animation configurations and custom hooks for scroll-based animations
 */

import { Variants, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import type { ScrollProgressData, ScrollAnimationConfig } from '@/interfaces/animations.interface';

/**
 * Fade in from bottom animation variant
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * Fade in with scale animation variant
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * Slide in from left animation variant
 */
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * Slide in from right animation variant
 */
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * Stagger children animation variant
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Custom hook for scroll progress tracking
 *
 * @returns Scroll progress data including position, direction, and velocity
 */
export function useScrollProgress(): ScrollProgressData {
  const { scrollY, scrollYProgress } = useScroll();
  const [scrollData, setScrollData] = useState<ScrollProgressData>({
    scrollY: 0,
    scrollYProgress: 0,
    scrollDirection: 'down',
    velocity: 0,
  });

  const prevScrollY = useRef(0);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      const direction = latest > prevScrollY.current ? 'down' : 'up';
      const velocity = Math.abs(latest - prevScrollY.current);

      setScrollData({
        scrollY: latest,
        scrollYProgress: scrollYProgress.get(),
        scrollDirection: direction,
        velocity,
      });

      prevScrollY.current = latest;
    });
  }, [scrollY, scrollYProgress]);

  return scrollData;
}

/**
 * Custom hook for parallax scroll effect
 *
 * @param speed - Scroll speed multiplier (0.5 = slower, 2 = faster)
 * @returns Transform value for parallax effect
 */
export function useParallax(speed: number = 0.5) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return smoothY;
}

/**
 * Custom hook for scroll-triggered scale effect
 *
 * @param inputRange - Scroll Y values to trigger scale
 * @param outputRange - Scale values corresponding to input range
 * @returns Transform value for scale effect
 */
export function useScrollScale(inputRange: number[] = [0, 300], outputRange: number[] = [0.8, 1]) {
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, inputRange, outputRange);
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });

  return smoothScale;
}

/**
 * Custom hook for scroll-triggered opacity effect
 *
 * @param inputRange - Scroll Y values to trigger opacity
 * @param outputRange - Opacity values corresponding to input range
 * @returns Transform value for opacity effect
 */
export function useScrollOpacity(inputRange: number[] = [0, 200], outputRange: number[] = [0, 1]) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, inputRange, outputRange);

  return opacity;
}

/**
 * Preset animation configurations
 */
export const animationPresets: Record<string, ScrollAnimationConfig> = {
  fadeInUp: {
    variants: fadeInUp,
    initial: 'hidden',
    animate: 'visible',
  },
  scaleIn: {
    variants: scaleIn,
    initial: 'hidden',
    animate: 'visible',
  },
  slideInLeft: {
    variants: slideInLeft,
    initial: 'hidden',
    animate: 'visible',
  },
  slideInRight: {
    variants: slideInRight,
    initial: 'hidden',
    animate: 'visible',
  },
};

/**
 * Easing functions for custom animations
 */
export const easings = {
  easeInOut: [0.22, 1, 0.36, 1],
  easeOut: [0.16, 1, 0.3, 1],
  easeIn: [0.7, 0, 0.84, 0],
  spring: { type: 'spring', stiffness: 100, damping: 15 },
};
