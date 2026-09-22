import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion.hook';

/** Animate a number from previous value to target. Skips when reduced motion is on. */
export function useCountUp(target: number, durationMs = 700): number {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | number>(0);

  const skipAnimation = reducedMotion || !Number.isFinite(target);

  // Adjust state during render (React's documented pattern for syncing state to a
  // prop change) instead of scheduling a redundant extra render via setState-in-effect.
  if (skipAnimation && value !== target) {
    setValue(target);
  }

  useEffect(() => {
    if (skipAnimation) {
      fromRef.current = target;
      return;
    }

    const from = fromRef.current;
    const start = Date.now();
    if (typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(rafRef.current as number);
    }

    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setValue(from + (target - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(rafRef.current as number);
      }
    };
  }, [target, durationMs, reducedMotion]);

  return value;
}
