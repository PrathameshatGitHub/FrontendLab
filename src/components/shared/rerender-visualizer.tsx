'use client';

import * as React from 'react';
import { useObservabilityStore } from '@/store/observability.store';

interface RerenderVisualizerProps {
  componentName: string;
  children: React.ReactNode;
  className?: string;
  showOverlay?: boolean;
}

export function RerenderVisualizer({
  componentName,
  children,
  className = '',
  showOverlay = true
}: RerenderVisualizerProps) {
  const isFlashing = useObservabilityStore((s) => s.flashingComponents[componentName]);
  
  // Track renders locally for this instance to display in the tag
  const localRenders = React.useRef(0);
  localRenders.current += 1;

  return (
    <div
      className={`relative rounded-xl border border-stone-800/40 transition-all ${
        isFlashing ? 'flash-active' : ''
      } ${className}`}
    >
      {showOverlay && (
        <div className="absolute -top-2.5 right-3 z-10 font-mono text-[9px] font-bold bg-stone-900 border border-stone-800 text-stone-400 px-1.5 py-0.5 rounded pointer-events-none select-none flex items-center gap-1 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{componentName}</span>
          <span className="text-stone-600">|</span>
          <span className="text-emerald-400">R:{localRenders.current}</span>
        </div>
      )}
      {children}
    </div>
  );
}
