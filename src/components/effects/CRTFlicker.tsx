import { useEffect, useRef } from 'react';

export default function CRTFlicker() {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleFlicker = () => {
      const delay = 5000 + Math.random() * 10000; // 5-15 seconds
      timeoutId = setTimeout(() => {
        const duration = 50 + Math.random() * 100; // 50-150ms
        el.style.opacity = '0.98';
        setTimeout(() => {
          el.style.opacity = '1';
          scheduleFlicker();
        }, duration);
      }, delay);
    };

    scheduleFlicker();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      ref={elRef}
      className="fixed inset-0 pointer-events-none z-[9996] transition-opacity duration-75"
      aria-hidden="true"
    />
  );
}
