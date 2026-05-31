'use client';

import * as React from 'react';
import { LabLayout } from '@/components/labs/lab-layout';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui/primitives';
import { Button } from '@/components/ui/primitives';
import { useObservabilityStore } from '@/store/observability.store';
import { Cpu, RefreshCw, Zap } from 'lucide-react';

// ─── Heavy computation (simulated) ────────────────────────────────────────────
function heavyCompute(n: number): number {
  let result = 0;
  for (let i = 0; i < n * 50000; i++) {
    result += Math.sqrt(i);
  }
  return Math.round(result);
}

// ─── Render flash overlay (highlights component border on render) ──────────────
function FlashBox({ label, children, flashing }: {
  label: string; children: React.ReactNode; flashing: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 transition-all duration-150 ${
        flashing
          ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20'
          : 'border-stone-800 bg-stone-950/30'
      }`}
    >
      <div className="text-[10px] font-mono text-stone-500 mb-2">{label}</div>
      {children}
    </div>
  );
}

// ─── Child that re-renders on every parent change (no memo) ───────────────────
function UnmemoizedChild({ value }: { value: number }) {
  const renders = React.useRef(0);
  renders.current++;
  return (
    <div className="text-xs font-mono space-y-1">
      <span className="text-stone-400">Value: </span>
      <span className="text-emerald-400">{value}</span>
      <span className="ml-3 text-amber-400">renders: {renders.current}</span>
    </div>
  );
}

// ─── Child memoized with React.memo ────────────────────────────────────────────
const MemoizedChild = React.memo(function MemoizedChild({ value }: { value: number }) {
  const renders = React.useRef(0);
  renders.current++;
  return (
    <div className="text-xs font-mono space-y-1">
      <span className="text-stone-400">Value: </span>
      <span className="text-emerald-400">{value}</span>
      <span className="ml-3 text-emerald-400">renders: {renders.current} ✓</span>
    </div>
  );
});

type RenderMode = 'baseline' | 'memo' | 'usecallback' | 'concurrent';

export default function RenderingLab() {
  const { addLog, triggerFlash, flashingComponents } = useObservabilityStore();

  const [mode, setMode] = React.useState<RenderMode>('baseline');
  const [counter, setCounter] = React.useState(0);
  const [heavyN, setHeavyN] = React.useState(5);
  const [heavyResult, setHeavyResult] = React.useState<number | null>(null);
  const [computeMs, setComputeMs] = React.useState<number | null>(null);
  const [isComputing, setIsComputing] = React.useState(false);

  const parentRenders = React.useRef(0);
  parentRenders.current++;

  // callback — recreated every parent render unless useCallback
 const handleIncrement = React.useCallback(() => {
  setCounter((c) => c + 1);
  triggerFlash('parent');
  addLog(
    mode === 'usecallback' ? 'Parent (useCallback)' : 'Parent (baseline)',
    mode === 'usecallback' ? 0.1 : 0.5,
    mode === 'usecallback' ? 'Stable callback reference' : 'New callback each render'
  );
}, [mode, triggerFlash, addLog]); // Include mode in dependencies

  // memoized value
 const doubled = React.useMemo(() => counter * 2, [counter]);

  // heavy compute
  const runHeavy = () => {
    setIsComputing(true);
    setTimeout(() => {
      const start = performance.now();
      const result = heavyCompute(heavyN);
      const ms = Math.round(performance.now() - start);
      setHeavyResult(result);
      setComputeMs(ms);
      setIsComputing(false);
      addLog('HeavyCompute', ms, `N=${heavyN} — ${ms} ms`);
      triggerFlash('heavy');
    }, 0);
  };

  // ── demo ───────────────────────────────────────────────────────────────────
  const demo = (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          ['baseline',    'Baseline (no opts)',  'outline'],
          ['memo',        'useMemo',             'outline'],
          ['usecallback', 'useCallback',         'outline'],
          ['concurrent',  'Concurrent Mode',     'outline'],
        ] as const).map(([m, label]) => (
          <Button key={m} size="sm" variant={mode === m ? 'primary' : 'outline'} onClick={() => setMode(m)}>
            {label}
          </Button>
        ))}
      </div>

      {/* Parent / child flash visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FlashBox label="Parent Component" flashing={!!flashingComponents['parent']}>
          <div className="text-xs font-mono text-stone-400 mb-2">Renders: <span className="text-yellow-400">{parentRenders.current}</span></div>
          <div className="text-xs font-mono text-stone-400 mb-2">Counter: <span className="text-emerald-400">{counter}</span></div>
          <div className="text-xs font-mono text-stone-400 mb-3">Doubled: <span className="text-emerald-400">{doubled}</span></div>
          <Button size="sm" onClick={handleIncrement}>
  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
  Increment
</Button>
        </FlashBox>

        <div className="space-y-3">
          <FlashBox label="Child — no memo" flashing={false}>
            <UnmemoizedChild value={counter} />
          </FlashBox>
          <FlashBox label="Child — React.memo" flashing={false}>
            <MemoizedChild value={counter} />
          </FlashBox>
        </div>
      </div>

      {/* Heavy compute demo */}
      <Card className="bg-stone-950/40 border-stone-800 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-stone-200">Heavy Computation Demo</span>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs text-stone-500 font-mono block mb-1">
              Intensity N: <span className="text-emerald-400">{heavyN}</span>
            </label>
            <input
              type="range" min={1} max={20} value={heavyN}
              onChange={(e) => setHeavyN(Number(e.target.value))}
              className="w-32 accent-emerald-500"
            />
          </div>
          <Button size="sm" onClick={runHeavy} disabled={isComputing} variant="secondary">
            <Cpu className={`w-3.5 h-3.5 mr-1.5 ${isComputing ? 'animate-spin' : ''}`} />
            {isComputing ? 'Computing…' : 'Run'}
          </Button>
        </div>
        {computeMs !== null && (
          <div className="flex gap-4 text-xs font-mono">
            <span className="text-stone-400">Result: <span className="text-white">{heavyResult?.toLocaleString()}</span></span>
            <span className="text-stone-400">Time: <span className={computeMs > 100 ? 'text-red-400' : 'text-emerald-400'}>{computeMs} ms</span></span>
          </div>
        )}
        {mode === 'concurrent' && (
          <div className="text-xs text-stone-400 font-mono bg-stone-900/50 rounded p-2">
            💡 React 18 Concurrent Mode: use <code>startTransition</code> to mark heavy state updates as
            non-urgent so the browser can render frames between iterations.
          </div>
        )}
      </Card>
    </div>
  );

  const concepts = (
    <div className="space-y-4 text-stone-300 text-sm leading-relaxed">
      <h2 className="text-xl font-semibold text-emerald-400">React Rendering Optimizations</h2>

      <h3 className="text-white font-semibold">React.memo</h3>
      <p>Wraps a component so it only re-renders when its props change (shallow comparison). If a parent re-renders but passes the same props, the child is skipped.</p>

      <h3 className="text-white font-semibold mt-3">useMemo</h3>
      <p>Memoizes the result of an expensive computation. The value is recomputed only when listed dependencies change.</p>

      <h3 className="text-white font-semibold mt-3">useCallback</h3>
      <p>Returns a stable function reference. Without it, a new function is created on every render — causing memoized children to re-render because they receive a "new" callback prop each time.</p>

      <h3 className="text-white font-semibold mt-3">Concurrent Mode (React 18)</h3>
      <p>
        <code className="bg-stone-900 px-1 rounded">startTransition</code> marks state updates as low-priority.
        React can pause them to keep the UI responsive during heavy work.
      </p>
    </div>
  );

  const interactive = (
    <div className="space-y-3 text-stone-300 text-sm">
      <p>1. Click <strong className="text-white">Increment</strong> in <strong className="text-white">Baseline</strong> mode — both children re-render (see render counters).</p>
      <p>2. Switch to <strong className="text-white">useMemo</strong> — the "Doubled" value is memoized; still both children re-render because the counter changed.</p>
      <p>3. Switch to <strong className="text-white">useCallback</strong> — the callback is stable; the memoized child should skip re-renders when counter doesn't change.</p>
      <p>4. Use the <strong className="text-white">Heavy Computation</strong> slider — crank N to 20 to feel the UI freeze, then wrap in <code className="bg-stone-900 px-1 rounded">startTransition</code> (Concurrent mode explanation).</p>
    </div>
  );

  const codeFiles = [
    {
      path: 'React.memo Lab',
      language: 'tsx',
      code: `// Child that re-renders on every parent change (no memo)
function UnmemoizedChild({ value }: { value: number }) {
  const renders = React.useRef(0);
  renders.current++;
  return (
    <div className="text-xs font-mono space-y-1">
      <span className="text-stone-400">Value: </span>
      <span className="text-emerald-400">{value}</span>
      <span className="ml-3 text-amber-400">renders: {renders.current}</span>
    </div>
  );
}

// Child memoized with React.memo
const MemoizedChild = React.memo(function MemoizedChild({ value }: { value: number }) {
  const renders = React.useRef(0);
  renders.current++;
  return (
    <div className="text-xs font-mono space-y-1">
      <span className="text-stone-400">Value: </span>
      <span className="text-emerald-400">{value}</span>
      <span className="ml-3 text-emerald-400">renders: {renders.current} ✓</span>
    </div>
  );
});`,
    },
    {
      path: 'useMemo Lab',
      language: 'tsx',
      code: `  // heavy compute using useMemo
  const doubled = React.useMemo(() => counter * 2, [counter]);

  // non-memoized heavy computation
  const runHeavy = () => {
    setIsComputing(true);
    setTimeout(() => {
      const start = performance.now();
      const result = heavyCompute(heavyN); // ❌ Blocks UI while running
      const ms = Math.round(performance.now() - start);
      setHeavyResult(result);
      setComputeMs(ms);
      setIsComputing(false);
      addLog('HeavyCompute', ms, \`N=\${heavyN} — \${ms} ms\`);
      triggerFlash('heavy');
    }, 0);
  };`,
    },
    {
      path: 'useCallback Lab',
      language: 'tsx',
      code: `  // callback — recreated every parent render unless useCallback
  const handleIncrement = React.useCallback(() => {
    setCounter((c) => c + 1);
    triggerFlash('parent');
    addLog(
      mode === 'usecallback' ? 'Parent (useCallback)' : 'Parent (baseline)',
      mode === 'usecallback' ? 0.1 : 0.5,
      mode === 'usecallback' ? 'Stable callback reference' : 'New callback each render'
    );
  }, [mode, triggerFlash, addLog]); // ✅ Mode included as dependency`,
    },
  ];

  const performanceMetrics = (
    <div className="space-y-3 text-stone-300 text-sm">
      {[
        ['Unmemoized child renders', 'Every parent re-render'],
        ['React.memo child renders', 'Only on prop change'],
        ['useMemo recompute', 'Only on dependency change'],
        ['useCallback new fn created', 'Only on dependency change'],
        ['Heavy N=5 compute time', computeMs !== null ? `${computeMs} ms` : 'Run above'],
      ].map(([label, value]) => (
        <div key={label} className="flex justify-between border-b border-stone-900 pb-2">
          <span>{label}</span>
          <span className="font-mono text-emerald-400">{value}</span>
        </div>
      ))}
    </div>
  );

  const benefits = (
    <div className="space-y-2 text-stone-300 text-sm leading-relaxed">
      <p>✅ React.memo — eliminates child re-renders when parent state unrelated to child changes.</p>
      <p>✅ useMemo — removes repeated expensive calculations from the render path.</p>
      <p>✅ useCallback — stabilizes function refs, making React.memo effective.</p>
      <p>✅ startTransition — keeps UI interactive during heavy background updates.</p>
    </div>
  );

  const architecture = (
    <pre className="bg-stone-950 p-4 rounded-lg overflow-x-auto text-emerald-400 text-xs font-mono leading-relaxed">
{`Baseline
  Parent renders → ALL children render

React.memo
  Parent renders → Memo child skips if props unchanged

useMemo
  Parent renders → expensiveValue recomputed only if deps changed

useCallback
  Parent renders → callback ref is stable → Memo child skips

startTransition (Concurrent)
  urgent: input renders instantly
  non-urgent: heavy setState pauses to yield to browser`}
    </pre>
  );

  return (
    <LabLayout
      title="Rendering Sandbox Lab"
      description="Visualize React.memo, useMemo, useCallback and Concurrent Mode with live flash animations and render counters."
      optimizationScore={80}
      demo={demo}
      concepts={concepts}
      interactive={interactive}
      codeFiles={codeFiles}
      aiContext={{ moduleName: 'Rendering Sandbox Lab', extraContext: 'Cover React.memo, useMemo, useCallback, startTransition.' }}
      performanceMetrics={performanceMetrics}
      benefits={benefits}
      architecture={architecture}
    />
  );
}
