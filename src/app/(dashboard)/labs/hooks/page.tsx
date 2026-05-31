'use client';

import * as React from 'react';
import { LabLayout } from '@/components/labs/lab-layout';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui/primitives';
import { Button } from '@/components/ui/primitives';
import { useObservabilityStore } from '@/store/observability.store';
import { Clock, MousePointer, RefreshCw, Eye } from 'lucide-react';

// ─── Demo hooks ───────────────────────────────────────────────────────────────

/** useDebounce — delays value update until after delay ms */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** useLocalStorage — persists state to localStorage */
function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch {
      return initial;
    }
  });
  const set = React.useCallback((v: T) => {
    setValue(v);
    if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(v));
  }, [key]);
  return [value, set];
}

/** useClickOutside — fires callback when click is outside ref */
function useClickOutside(ref: React.RefObject<HTMLElement | null>, callback: () => void) {
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) callback();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, callback]);
}

/** usePrevious — tracks previous value of a state */
function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);
  React.useEffect(() => { ref.current = value; });
  return ref.current;
}

/** useInterval — declarative setInterval */
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => { savedCallback.current = callback; }, [callback]);
  React.useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// ─── Demo section for each hook ───────────────────────────────────────────────
function DebounceDemo({ addLog }: { addLog: (c: string, t: number, r: string) => void }) {
  const [raw, setRaw] = React.useState('');
  const debounced = useDebounce(raw, 400);
  React.useEffect(() => {
    if (!debounced) return;
    addLog('useDebounce', 0, `Settled: "${debounced}"`);
  }, [debounced, addLog]);
  return (
    <div className="space-y-2">
      <input
        className="w-full rounded-lg border border-stone-800 bg-stone-950 px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-emerald-500"
        placeholder="Type to see debounce in action…"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
      />
      <div className="flex gap-6 text-xs font-mono">
        <span className="text-stone-500">Raw: <span className="text-amber-400">{raw}</span></span>
        <span className="text-stone-500">Debounced: <span className="text-emerald-400">{debounced}</span></span>
      </div>
    </div>
  );
}

function LocalStorageDemo({ addLog }: { addLog: (c: string, t: number, r: string) => void }) {
  const [stored, setStored] = useLocalStorage<string>('fe_lab_hook_demo', '');
  return (
    <div className="space-y-2">
      <input
        className="w-full rounded-lg border border-stone-800 bg-stone-950 px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-emerald-500"
        placeholder="Type — value survives page refresh!"
        value={stored}
        onChange={(e) => {
          setStored(e.target.value);
          addLog('useLocalStorage', 0, 'Persisted to localStorage');
        }}
      />
      <div className="text-xs font-mono text-stone-500">
        Stored key: <span className="text-emerald-400">fe_lab_hook_demo</span>
      </div>
    </div>
  );
}

function ClickOutsideDemo({ addLog }: { addLog: (c: string, t: number, r: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => {
    if (open) {
      setOpen(false);
      addLog('useClickOutside', 0, 'Clicked outside → closed');
    }
  });
  return (
    <div className="relative">
      <Button size="sm" onClick={() => setOpen(true)}>
        <MousePointer className="w-3.5 h-3.5 mr-1.5" />
        Open Dropdown
      </Button>
      {open && (
        <div
          ref={ref}
          className="absolute mt-2 z-10 bg-stone-900 border border-stone-700 rounded-lg p-4 w-48 shadow-xl text-xs text-stone-300"
        >
          I close when you click outside!
        </div>
      )}
    </div>
  );
}

function PreviousDemo({ addLog }: { addLog: (c: string, t: number, r: string) => void }) {
  const [count, setCount] = React.useState(0);
  const prev = usePrevious(count);
  React.useEffect(() => {
    if (count > 0) addLog('usePrevious', 0, `${prev} → ${count}`);
  }, [count, prev, addLog]);
  return (
    <div className="flex items-center gap-4">
      <Button size="sm" onClick={() => setCount((c) => c + 1)}>Increment</Button>
      <span className="text-xs font-mono text-stone-400">
        Previous: <span className="text-amber-400">{prev ?? '—'}</span>
        {' → '}
        Current: <span className="text-emerald-400">{count}</span>
      </span>
    </div>
  );
}

function IntervalDemo({ addLog }: { addLog: (c: string, t: number, r: string) => void }) {
  const [running, setRunning] = React.useState(false);
  const [tick, setTick] = React.useState(0);
  useInterval(
    () => {
      setTick((t) => t + 1);
      addLog('useInterval', 0, `Tick ${tick + 1}`);
    },
    running ? 1000 : null
  );
  return (
    <div className="flex items-center gap-4">
      <Button size="sm" onClick={() => setRunning((r) => !r)} variant={running ? 'danger' : 'primary'}>
        {running ? 'Stop' : 'Start'} Timer
      </Button>
      <span className="text-xs font-mono text-stone-400">
        Ticks: <span className="text-emerald-400">{tick}</span>
      </span>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
const HOOKS = [
  { id: 'debounce',     icon: Clock,         label: 'useDebounce',     badge: 'Performance', color: 'info' as const },
  { id: 'localstorage', icon: RefreshCw,      label: 'useLocalStorage', badge: 'Persistence', color: 'success' as const },
  { id: 'clickoutside', icon: MousePointer,   label: 'useClickOutside', badge: 'UX Pattern',  color: 'warning' as const },
  { id: 'previous',     icon: Eye,            label: 'usePrevious',     badge: 'Utility',     color: 'info' as const },
  { id: 'interval',     icon: Clock,          label: 'useInterval',     badge: 'Declarative', color: 'success' as const },
];

export default function HooksLab() {
  const { addLog } = useObservabilityStore();
  const [activeHook, setActiveHook] = React.useState('debounce');
  const log = React.useCallback(
    (c: string, t: number, r: string) => addLog(c, t, r),
    [addLog]
  );

  const demo = (
    <div className="space-y-4">
      {/* Hook selector */}
      <div className="flex flex-wrap gap-2">
        {HOOKS.map(({ id, label, badge, color }) => (
          <button
            key={id}
            onClick={() => setActiveHook(id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeHook === id
                ? 'bg-emerald-500 text-stone-950 font-bold'
                : 'bg-stone-900/50 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            {label}
            {activeHook === id && <Badge variant={color} className="text-[9px] py-0 px-1">{badge}</Badge>}
          </button>
        ))}
      </div>

      {/* Active hook demo */}
      <Card className="bg-stone-950/40 border-emerald-500/20 p-5">
        <div className="text-xs font-mono text-emerald-400 mb-4 uppercase tracking-widest">
          {HOOKS.find((h) => h.id === activeHook)?.label} — Live Demo
        </div>
        {activeHook === 'debounce'     && <DebounceDemo addLog={log} />}
        {activeHook === 'localstorage' && <LocalStorageDemo addLog={log} />}
        {activeHook === 'clickoutside' && <ClickOutsideDemo addLog={log} />}
        {activeHook === 'previous'     && <PreviousDemo addLog={log} />}
        {activeHook === 'interval'     && <IntervalDemo addLog={log} />}
      </Card>
    </div>
  );

  const concepts = (
    <div className="space-y-4 text-stone-300 text-sm leading-relaxed">
      <h2 className="text-xl font-semibold text-emerald-400">Custom Hooks</h2>
      <p>
        A custom hook is any function whose name starts with <code className="bg-stone-900 px-1 rounded">use</code> and that
        calls other hooks. It lets you extract and reuse stateful logic without changing your component hierarchy.
      </p>
      {HOOKS.map(({ label }) => (
        <div key={label}>
          <h3 className="text-white font-semibold mt-3">{label}</h3>
          {label === 'useDebounce' && <p>Delays propagating a value until input has settled for N ms. Essential for search inputs to avoid firing an API call on every keystroke.</p>}
          {label === 'useLocalStorage' && <p>Wraps <code className="bg-stone-900 px-1 rounded">useState</code> with automatic persistence to localStorage. Read on mount, write on change.</p>}
          {label === 'useClickOutside' && <p>Attaches a <code className="bg-stone-900 px-1 rounded">mousedown</code> listener to the document; fires the callback when the target is outside the given ref. Perfect for dropdowns and modals.</p>}
          {label === 'usePrevious' && <p>Stores the previous value of a variable using a ref that updates after each render. Useful for transition animations and undo logic.</p>}
          {label === 'useInterval' && <p>A declarative wrapper around <code className="bg-stone-900 px-1 rounded">setInterval</code> that re-creates the interval when delay changes and cleans up on unmount.</p>}
        </div>
      ))}
    </div>
  );

  const interactive = (
    <div className="space-y-3 text-stone-300 text-sm">
      <p>1. <strong className="text-white">useDebounce</strong> — type fast in the input; the debounced value only updates 400 ms after you stop.</p>
      <p>2. <strong className="text-white">useLocalStorage</strong> — type a value, then refresh the page — it survives!</p>
      <p>3. <strong className="text-white">useClickOutside</strong> — open the dropdown, then click anywhere outside to close it.</p>
      <p>4. <strong className="text-white">usePrevious</strong> — click Increment and watch the previous value track one step behind.</p>
      <p>5. <strong className="text-white">useInterval</strong> — start the timer and watch the observability console fill with tick logs.</p>
    </div>
  );

  const codeFiles = [
    {
      path: 'useDebounce',
      language: 'ts',
      code: `function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}`,
    },
    {
      path: 'useLocalStorage',
      language: 'ts',
      code: `function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initial;
  });
  const set = useCallback((v: T) => {
    setValue(v);
    localStorage.setItem(key, JSON.stringify(v));
  }, [key]);
  return [value, set] as const;
}`,
    },
    {
      path: 'useClickOutside',
      language: 'ts',
      code: `function useClickOutside(ref, callback) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) callback();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, callback]);
}`,
    },
    {
      path: 'useInterval',
      language: 'ts',
      code: `function useInterval(callback: () => void, delay: number | null) {
  const savedCb = useRef(callback);
  useEffect(() => { savedCb.current = callback; }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCb.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}`,
    },
  ];

  const performanceMetrics = (
    <div className="space-y-3 text-stone-300 text-sm">
      {[
        ['useDebounce overhead', '~0 ms (setTimeout only)'],
        ['useLocalStorage read (mount)', '< 1 ms (sync)'],
        ['useClickOutside listener cost', '~0 ms (passive event)'],
        ['useInterval accuracy', '±10 ms (JS timer resolution)'],
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
      <p>✅ Encapsulate side-effects cleanly — effects live in the hook, not the component.</p>
      <p>✅ Reusable across any component with zero prop changes.</p>
      <p>✅ Testable in isolation — just call the hook function directly.</p>
      <p>✅ Composable — hooks can call other hooks.</p>
    </div>
  );

  const architecture = (
    <pre className="bg-stone-950 p-4 rounded-lg overflow-x-auto text-emerald-400 text-xs font-mono leading-relaxed">
{`Custom Hook anatomy
  function useSomething(params) {
    // 1. Internal state
    const [state, setState] = useState(initial);
    // 2. Effects (subscribe, cleanup)
    useEffect(() => {
      const id = setup(params, setState);
      return () => cleanup(id);
    }, [params]);
    // 3. Return API
    return { state, setState };
  }

Composition:
  useSearch = useDebounce + useLocalStorage + useFetch`}
    </pre>
  );

  return (
    <LabLayout
      title="Hooks Lab"
      description="Build and explore 5 production custom hooks with live demos and observability logging."
      optimizationScore={84}
      demo={demo}
      concepts={concepts}
      interactive={interactive}
      codeFiles={codeFiles}
      aiContext={{ moduleName: 'Hooks Lab', extraContext: 'Cover useDebounce, useLocalStorage, useClickOutside, usePrevious, useInterval.' }}
      performanceMetrics={performanceMetrics}
      benefits={benefits}
      architecture={architecture}
    />
  );
}
