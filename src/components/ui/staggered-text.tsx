'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, type TargetAndTransition, type Easing } from 'motion/react';
import { cn } from '../../lib/utils';

export type StaggerDirection = 'forward' | 'reverse' | 'center';
export type AnimationDirection = 'top' | 'bottom' | 'left' | 'right';
export type SegmentBy = 'chars' | 'words' | 'lines';

export interface StaggeredTextProps {
  text?: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  segmentBy?: SegmentBy;
  separator?: string;
  delay?: number;
  duration?: number;
  easing?: Easing | Easing[];
  threshold?: number;
  rootMargin?: string;
  direction?: AnimationDirection;
  blur?: boolean;
  staggerDirection?: StaggerDirection;
  respectReducedMotion?: boolean;
  exitOnScrollOut?: boolean;
  from?: TargetAndTransition;
  to?: TargetAndTransition | TargetAndTransition[];
  onAnimationComplete?: () => void;
  onExitComplete?: () => void;
}

interface SegmentItem {
  id: string;
  content: string;
  isSpace: boolean;
  isLineBreak: boolean;
  staggerIndex: number;
}

export function StaggeredText({
  text = '',
  className = '',
  as = 'p',
  segmentBy = 'words',
  separator,
  delay = 80,
  duration = 0.6,
  easing = [0.22, 1, 0.36, 1],
  threshold = 0.1,
  rootMargin = '0px',
  direction = 'bottom',
  blur = true,
  staggerDirection = 'forward',
  respectReducedMotion = true,
  exitOnScrollOut = false,
  from,
  to,
  onAnimationComplete,
  onExitComplete,
}: StaggeredTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (!respectReducedMotion || typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [respectReducedMotion]);

  // Viewport intersection observer
  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (!exitOnScrollOut) {
            observer.unobserve(element);
          }
        } else if (exitOnScrollOut) {
          setInView(false);
          onExitComplete?.();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, exitOnScrollOut, onExitComplete]);

  // Build segments from text
  const { segments, totalAnimatable } = useMemo(() => {
    if (!text) return { segments: [], totalAnimatable: 0 };

    const rawLines = separator ? text.split(separator) : [text];
    const items: SegmentItem[] = [];
    let animatableCount = 0;

    rawLines.forEach((line, lineIdx) => {
      if (lineIdx > 0) {
        items.push({
          id: `br-${lineIdx}`,
          content: '',
          isSpace: false,
          isLineBreak: true,
          staggerIndex: -1,
        });
      }

      if (segmentBy === 'lines') {
        items.push({
          id: `line-${lineIdx}`,
          content: line,
          isSpace: false,
          isLineBreak: false,
          staggerIndex: animatableCount++,
        });
      } else if (segmentBy === 'words') {
        const words = line.split(/(\s+)/);
        words.forEach((chunk, chunkIdx) => {
          if (!chunk) return;
          const isSpace = /^\s+$/.test(chunk);
          items.push({
            id: `word-${lineIdx}-${chunkIdx}`,
            content: chunk,
            isSpace,
            isLineBreak: false,
            staggerIndex: isSpace ? -1 : animatableCount++,
          });
        });
      } else {
        // chars: split by words with characters inside to preserve natural word wrap
        const words = line.split(/(\s+)/);
        words.forEach((chunk, chunkIdx) => {
          if (!chunk) return;
          const isSpace = /^\s+$/.test(chunk);
          if (isSpace) {
            items.push({
              id: `space-${lineIdx}-${chunkIdx}`,
              content: chunk,
              isSpace: true,
              isLineBreak: false,
              staggerIndex: -1,
            });
          } else {
            Array.from(chunk).forEach((char, charIdx) => {
              items.push({
                id: `char-${lineIdx}-${chunkIdx}-${charIdx}`,
                content: char,
                isSpace: false,
                isLineBreak: false,
                staggerIndex: animatableCount++,
              });
            });
          }
        });
      }
    });

    return { segments: items, totalAnimatable: animatableCount };
  }, [text, segmentBy, separator]);

  // Compute animation states
  const defaultFrom: TargetAndTransition = useMemo(() => {
    let offset: TargetAndTransition = {};
    if (direction === 'top') offset = { y: -30 };
    else if (direction === 'bottom') offset = { y: 30 };
    else if (direction === 'left') offset = { x: -30 };
    else if (direction === 'right') offset = { x: 30 };

    return {
      opacity: 0,
      ...(blur ? { filter: 'blur(8px)' } : {}),
      ...offset,
    };
  }, [direction, blur]);

  const defaultTo: TargetAndTransition = useMemo(() => {
    let offset: TargetAndTransition = {};
    if (direction === 'top' || direction === 'bottom') offset = { y: 0 };
    else if (direction === 'left' || direction === 'right') offset = { x: 0 };

    return {
      opacity: 1,
      ...(blur ? { filter: 'blur(0px)' } : {}),
      ...offset,
    };
  }, [direction, blur]);

  const resolvedTo: TargetAndTransition = useMemo(() => {
    if (!to) return defaultTo;
    if (Array.isArray(to)) {
      const keys = new Set(to.flatMap((o) => Object.keys(o)));
      const merged: Record<string, any> = {};
      keys.forEach((k) => {
        merged[k] = to.map((o) => (o as any)[k]);
      });
      return merged as TargetAndTransition;
    }
    return to;
  }, [to, defaultTo]);

  const fromState: TargetAndTransition = from ?? defaultFrom;
  const toState: TargetAndTransition = resolvedTo;

  // Calculate stagger offset
  const getDelay = (index: number) => {
    if (index < 0 || totalAnimatable <= 1) return 0;
    let order = index;
    if (staggerDirection === 'reverse') {
      order = totalAnimatable - 1 - index;
    } else if (staggerDirection === 'center') {
      const mid = (totalAnimatable - 1) / 2;
      order = Math.abs(index - mid);
    }
    return (order * delay) / 1000;
  };

  const shouldAnimate = !prefersReducedMotion;
  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={containerRef as React.Ref<HTMLElement>}
      className={cn('staggered-text inline-block', className)}
    >
      {segments.map((item) => {
        if (item.isLineBreak) {
          return <br key={item.id} />;
        }

        if (item.isSpace) {
          return <span key={item.id}>&nbsp;</span>;
        }

        const itemDelay = shouldAnimate ? getDelay(item.staggerIndex) : 0;
        const isLastAnimatable = item.staggerIndex === totalAnimatable - 1;

        return (
          <motion.span
            key={item.id}
            initial={shouldAnimate ? fromState : toState}
            animate={inView || !shouldAnimate ? toState : fromState}
            transition={{
              duration: shouldAnimate ? duration : 0,
              delay: itemDelay,
              ease: easing,
            }}
            onAnimationComplete={isLastAnimatable ? onAnimationComplete : undefined}
            className="inline-block will-change-[transform,filter,opacity]"
          >
            {item.content}
          </motion.span>
        );
      })}
    </Tag>
  );
}

export default StaggeredText;
