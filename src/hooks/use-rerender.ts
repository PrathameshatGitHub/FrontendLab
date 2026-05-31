import { useRef, useEffect } from 'react';
import { useObservabilityStore } from '@/store/observability.store';

export function useRerender(componentName: string, reason = 'Render') {
  const renderCount = useRef(0);
  const startTime = useRef(0);
  const addLog = useObservabilityStore((s) => s.addLog);
  const triggerFlash = useObservabilityStore((s) => s.triggerFlash);

  // We capture the start time right before rendering
  startTime.current = performance.now();
  renderCount.current += 1;

  useEffect(() => {
    const duration = performance.now() - startTime.current;
    
    // Defer the store update to avoid updating state during render
    const timeout = setTimeout(() => {
      addLog(componentName, parseFloat(Math.max(0.01, duration).toFixed(2)), `${reason} (#${renderCount.current})`);
      triggerFlash(componentName);
    }, 0);

    return () => clearTimeout(timeout);
  });

  return renderCount.current;
}
