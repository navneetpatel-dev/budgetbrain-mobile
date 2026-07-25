import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';

/** Animate a number from previous value to target. Skips when reduced motion is on. */
export function useCountUp(target: number, durationMs = 700): number {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | number>(0);

  useEffect(() => {
    if (reducedMotion || !Number.isFinite(target)) {
      setValue(target);
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
