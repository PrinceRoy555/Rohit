import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useVelocity,
  useTransform,
} from "motion/react";
import { cn } from "../lib/utils";

export interface CustomCursorProps {
  circleSize?: number;
  dotSize?: number;
  circleColor?: string;
  dotColor?: string;
  circleStiffness?: number;
  circleDamping?: number;
  dotStiffness?: number;
  dotDamping?: number;
  circleBorderWidth?: number;
  className?: string;
  circleClassName?: string;
  dotClassName?: string;
  showOnTouch?: boolean;
  zIndex?: number;
  elastic?: boolean;
  targets?: string[];
  images?: string[];
  imageScale?: number;
  imageAnimationDuration?: number;
  imageClassName?: string;
  targetPadding?: number;
  mixBlendMode?: React.CSSProperties["mixBlendMode"];
  children?: React.ReactNode;
}

export function CustomCursor({
  circleSize = 36,
  dotSize = 6,
  circleColor = "var(--cursor-color, #18181b)",
  dotColor = "var(--cursor-color, #18181b)",
  circleStiffness = 150,
  circleDamping = 20,
  dotStiffness = 300,
  dotDamping = 30,
  circleBorderWidth = 1.5,
  className,
  circleClassName,
  dotClassName,
  showOnTouch = false,
  zIndex = 9999,
  elastic = true,
  targets = [],
  images = [],
  imageScale = 0.9,
  imageAnimationDuration = 0.6,
  imageClassName,
  targetPadding = 6,
  mixBlendMode,
  children,
}: CustomCursorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [hoveredTargets, setHoveredTargets] = useState<Set<number>>(new Set());
  const [targetRects, setTargetRects] = useState<Map<number, DOMRect>>(new Map());
  const [activeTarget, setActiveTarget] = useState<number | null>(null);

  const mouseX = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 0);

  const targetWidth = useMotionValue(circleSize);
  const targetHeight = useMotionValue(circleSize);
  const targetRadius = useMotionValue(circleSize / 2);
  const targetX = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 0);
  const targetY = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 0);

  const targetSpringConfig = { stiffness: 350, damping: 30, mass: 0.5 };
  const animatedWidth = useSpring(targetWidth, targetSpringConfig);
  const animatedHeight = useSpring(targetHeight, targetSpringConfig);
  const animatedRadius = useSpring(targetRadius, targetSpringConfig);
  const animatedTargetX = useSpring(targetX, targetSpringConfig);
  const animatedTargetY = useSpring(targetY, targetSpringConfig);

  const circleFollowerX = useSpring(mouseX, { stiffness: circleStiffness, damping: circleDamping, mass: 0.5 });
  const circleFollowerY = useSpring(mouseY, { stiffness: circleStiffness, damping: circleDamping, mass: 0.5 });

  const dotFollowerX = useSpring(mouseX, { stiffness: dotStiffness, damping: dotDamping, mass: 0.2 });
  const dotFollowerY = useSpring(mouseY, { stiffness: dotStiffness, damping: dotDamping, mass: 0.2 });

  const velocityX = useVelocity(mouseX);
  const velocityY = useVelocity(mouseY);
  const scaleX = useTransform(velocityX, [-1000, 0, 1000], [0.85, 1, 1.15]);
  const scaleY = useTransform(velocityY, [-1000, 0, 1000], [0.85, 1, 1.15]);

  const currentTargetInfo = useMemo(() => {
    if (activeTarget === null) return null;
    const rect = targetRects.get(activeTarget);
    const element = document.querySelector(targets[activeTarget]);
    if (rect && element) {
      const computedStyle = window.getComputedStyle(element);
      const borderRadiusValue = parseFloat(computedStyle.borderRadius) || 16;
      return { rect, borderRadiusValue, element };
    }
    return null;
  }, [activeTarget, targetRects, targets]);

  const isCircleTarget = useMemo(() => {
    if (!currentTargetInfo) return false;
    const { rect, borderRadiusValue } = currentTargetInfo;
    return Math.abs(rect.width - rect.height) < 1 && borderRadiusValue >= rect.width / 2 - 1;
  }, [currentTargetInfo]);

  useEffect(() => {
    if (activeTarget !== null && currentTargetInfo) {
      const { rect, borderRadiusValue } = currentTargetInfo;
      const w = rect.width + 2 * targetPadding;
      const h = rect.height + 2 * targetPadding;
      targetWidth.set(w);
      targetHeight.set(h);
      if (isCircleTarget) {
        targetRadius.set(w / 2);
      } else {
        targetRadius.set(borderRadiusValue + targetPadding);
      }
      targetX.set(rect.left + rect.width / 2);
      targetY.set(rect.top + rect.height / 2);
    } else if (activeTarget === null) {
      targetWidth.set(circleSize);
      targetHeight.set(circleSize);
      targetRadius.set(circleSize / 2);
      const unsubX = circleFollowerX.on("change", (val) => targetX.set(val));
      const unsubY = circleFollowerY.on("change", (val) => targetY.set(val));
      return () => {
        unsubX();
        unsubY();
      };
    }
  }, [
    activeTarget,
    currentTargetInfo,
    circleSize,
    targetWidth,
    targetHeight,
    targetRadius,
    targetX,
    targetY,
    circleFollowerX,
    circleFollowerY,
    targetPadding,
    isCircleTarget,
  ]);

  const updateTargetRects = useCallback(() => {
    const nextRects = new Map<number, DOMRect>();
    targets.forEach((selector, idx) => {
      const el = document.querySelector(selector);
      if (el) {
        nextRects.set(idx, el.getBoundingClientRect());
      }
    });
    setTargetRects(nextRects);
  }, [targets]);

  useEffect(() => {
    if (targets && targets.length > 0) {
      requestAnimationFrame(() => {
        updateTargetRects();
      });
    }
  }, [targets, updateTargetRects]);

  useEffect(() => {
    if (!targets || targets.length === 0) return;
    const cleanups: (() => void)[] = [];

    const attachListeners = () => {
      cleanups.forEach((c) => c());
      cleanups.length = 0;

      targets.forEach((selector, idx) => {
        const el = document.querySelector(selector);
        if (el) {
          const onEnter = () => {
            setHoveredTargets((prev) => new Set(prev).add(idx));
            updateTargetRects();
            setActiveTarget(idx);
          };
          const onLeave = () => {
            setHoveredTargets((prev) => {
              const next = new Set(prev);
              next.delete(idx);
              return next;
            });
            setActiveTarget(null);
          };
          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
          });
        }
      });
    };

    attachListeners();

    let debounceTimer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        attachListeners();
        updateTargetRects();
      }, 200);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", updateTargetRects, true);
    window.addEventListener("resize", updateTargetRects);

    return () => {
      observer.disconnect();
      clearTimeout(debounceTimer);
      cleanups.forEach((c) => c());
      window.removeEventListener("scroll", updateTargetRects, true);
      window.removeEventListener("resize", updateTargetRects);
    };
  }, [targets, updateTargetRects]);

  useEffect(() => {
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      ((navigator as unknown as { msMaxTouchPoints?: number }).msMaxTouchPoints ?? 0) > 0;
    setIsTouchDevice(isTouch);

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    if (!isTouch || showOnTouch) {
      window.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseenter", onMouseEnter);
      document.addEventListener("mouseleave", onMouseLeave);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [mouseX, mouseY, isVisible, isTouchDevice, showOnTouch]);

  if (isTouchDevice && !showOnTouch) return null;

  return (
    <div
      className={cn("pointer-events-none fixed inset-0 overflow-hidden", className)}
      style={{ zIndex }}
      aria-hidden="true"
    >
      {/* Outer morphing ring */}
      <motion.div
        className={cn("absolute flex items-center justify-center pointer-events-none", circleClassName)}
        style={{
          width: animatedWidth,
          height: animatedHeight,
          borderRadius: animatedRadius,
          left: animatedTargetX,
          top: animatedTargetY,
          x: "-50%",
          y: "-50%",
          border: `${circleBorderWidth}px solid ${circleColor}`,
          opacity: isVisible ? 1 : 0,
          scaleX: elastic && activeTarget === null ? scaleX : 1,
          scaleY: elastic && activeTarget === null ? scaleY : 1,
          mixBlendMode,
          willChange: "transform, width, height, border-radius",
        }}
      >
        {children}
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className={cn("absolute rounded-full pointer-events-none", dotClassName)}
        animate={
          activeTarget !== null
            ? { opacity: 0, scale: 0 }
            : { opacity: isVisible ? 1 : 0, scale: 1 }
        }
        transition={{ duration: 0.15 }}
        style={{
          width: dotSize,
          height: dotSize,
          left: dotFollowerX,
          top: dotFollowerY,
          x: "-50%",
          y: "-50%",
          backgroundColor: dotColor,
          mixBlendMode,
          willChange: "transform, opacity",
        }}
      />

      {/* Hover preview images */}
      {targets.map((selector, idx) => {
        const isHovered = hoveredTargets.has(idx);
        const imgUrl = images?.[idx];
        const rect = targetRects.get(idx);
        if (!isHovered || !rect || !imgUrl) return null;

        const el = document.querySelector(selector);
        const rawBorderRadius = parseFloat(el ? window.getComputedStyle(el).borderRadius : "0px") || 0;
        const isCircle = Math.abs(rect.width - rect.height) < 1 && rawBorderRadius >= rect.width / 2 - 1;
        const outerW = rect.width + 2 * targetPadding;
        const outerRadius = isCircle ? outerW / 2 : rawBorderRadius + targetPadding;
        const innerRadius = isCircle ? (rect.width / 2) * imageScale : rawBorderRadius * imageScale;

        return (
          <AnimatePresence key={`${selector}-${idx}`}>
            {isHovered && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: imageScale, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: imageAnimationDuration, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "fixed",
                  left: rect.left + rect.width / 2,
                  top: rect.top + rect.height / 2,
                  width: rect.width,
                  height: rect.height,
                  x: "-50%",
                  y: "-50%",
                  pointerEvents: "none",
                  willChange: "transform, opacity",
                  borderRadius: `${outerRadius}px`,
                }}
              >
                <div
                  className={cn("w-full h-full bg-center bg-cover", imageClassName)}
                  style={{
                    backgroundImage: `url(${imgUrl})`,
                    borderRadius: `${innerRadius}px`,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </div>
  );
}

export default CustomCursor;
