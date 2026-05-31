'use client';

import * as React from 'react';
import { LabLayout } from '@/components/labs/lab-layout';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui/primitives';
import { Button } from '@/components/ui/primitives';
import { useObservabilityStore } from '@/store/observability.store';
import { ArrowDown, ArrowRight, Box } from 'lucide-react';

// ─── shared mock state ─────────────────────────────────────────────────────────
interface AppState {
  theme: 'dark' | 'light';
  user: string;
  cartCount: number;
}

// ─── Prop Drilling demo ────────────────────────────────────────────────────────
function PropDrilledGrandparent({ state, onToggleTheme }: { state: AppState; onToggleTheme: () => void }) {
  return (
    <div className="border border-stone-700 rounded-lg p-3 space-y-2">
      <div className="text-[10px] font-mono text-stone-500">Grandparent (holds state)</div>
      <PropDrilledParent state={state} onToggleTheme={onToggleTheme} />
    </div>
  );
}
function PropDrilledParent({ state, onToggleTheme }: { state: AppState; onToggleTheme: () => void }) {
  return (
    <div className="border border-stone-700 rounded-lg p-3 space-y-2">
      <div className="text-[10px] font-mono text-stone-500">Parent (passes props down)</div>
      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
        <ArrowDown className="w-3 h-3" /> props: state, onToggleTheme
      </div>
      <PropDrilledChild state={state} onToggleTheme={onToggleTheme} />
    </div>
  );
}
function PropDrilledChild({ state, onToggleTheme }: { state: AppState; onToggleTheme: () => void }) {
  return (
    <div className="border border-stone-700 rounded-lg p-3 space-y-2">
      <div className="text-[10px] font-mono text-stone-500">Child (finally uses state)</div>
      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
        <ArrowDown className="w-3 h-3" /> props: state, onToggleTheme
      </div>
      <div className="text-xs text-stone-300">Theme: <span className="text-emerald-400">{state.theme}</span></div>
      <Button size="sm" variant="outline" onClick={onToggleTheme}>Toggle Theme</Button>
    </div>
  );
}

// ─── Context API demo ──────────────────────────────────────────────────────────
const AppContext = React.createContext<{ state: AppState; toggleTheme: () => void } | null>(null);

function ContextProvider({ children, state, toggleTheme }: {
  children: React.ReactNode; state: AppState; toggleTheme: () => void;
}) {
  return <AppContext.Provider value={{ state, toggleTheme }}>{children}</AppContext.Provider>;
}

function ContextConsumerDeep() {
  const ctx = React.useContext(AppContext)!;
  return (
    <div className="border border-stone-700 rounded-lg p-3 space-y-2">
      <div className="text-[10px] font-mono text-stone-500">Deep Consumer (no prop threading)</div>
      <div className="flex items-center gap-1 text-[10px] text-blue-400 font-mono">
        <ArrowRight className="w-3 h-3" /> useContext(AppContext)
      </div>
      <div className="text-xs text-stone-300">Theme: <span className="text-emerald-400">{ctx.state.theme}</span></div>
      <Button size="sm" variant="outline" onClick={ctx.toggleTheme}>Toggle Theme</Button>
    </div>
  );
}

// ─── Zustand demo ──────────────────────────────────────────────────────────────
// Uses the existing observability store — we piggyback on imageMode/stateMode as stand-in
function ZustandConsumer({ mode, onToggle }: { mode: string; onToggle: () => void }) {
  return (
    <div className="border border-stone-700 rounded-lg p-3 space-y-2">
      <div className="text-[10px] font-mono text-stone-500">Zustand Consumer (any depth, no Provider needed)</div>
      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
        <ArrowRight className="w-3 h-3" /> useObservabilityStore(selector)
      </div>
      <div className="text-xs text-stone-300">Mode: <span className="text-emerald-400">{mode}</span></div>
      <Button size="sm" onClick={onToggle}>Toggle Mode</Button>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function StateManagementLab() {
  const { stateMode, setStateMode, addLog } = useObservabilityStore();

  // Local state for prop-drilling & context demos
  const [appState, setAppState] = React.useState<AppState>({
    theme: 'dark',
    user: 'Dev',
    cartCount: 3,
  });

  const toggleTheme = React.useCallback(() => {
    const start = performance.now();
    setAppState((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
    addLog('StateManagementLab', Math.round(performance.now() - start), 'Theme toggled');
  }, [addLog]);

  const toggleMode = () => {
    const next: Record<string, 'prop-drilling' | 'context-api' | 'zustand'> = {
      'prop-drilling': 'context-api',
      'context-api': 'zustand',
      'zustand': 'prop-drilling',
    };
    setStateMode(next[stateMode]);
  };

  const renderCount = React.useRef(0);
  renderCount.current++;

  // ── demo ──────────────────────────────────────────────────────────────────
  const demo = (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {(['prop-drilling', 'context-api', 'zustand'] as const).map((m) => (
          <Button
            key={m}
            size="sm"
            variant={stateMode === m ? 'primary' : 'outline'}
            onClick={() => setStateMode(m)}
          >
            {m}
          </Button>
        ))}
      </div>

      {/* Render counter */}
      <div className="text-xs font-mono text-stone-500">
        Component renders: <span className="text-emerald-400">{renderCount.current}</span>
      </div>

      {/* Pattern demo */}
      {stateMode === 'prop-drilling' && (
        <Card className="bg-stone-950/40 border-amber-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="warning">Anti-pattern</Badge>
            <span className="text-xs text-stone-400">Prop Drilling</span>
          </div>
          <PropDrilledGrandparent state={appState} onToggleTheme={toggleTheme} />
        </Card>
      )}

      {stateMode === 'context-api' && (
        <Card className="bg-stone-950/40 border-blue-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="info">Better</Badge>
            <span className="text-xs text-stone-400">React Context API</span>
          </div>
          <ContextProvider state={appState} toggleTheme={toggleTheme}>
            <div className="border border-stone-700 rounded-lg p-3 space-y-2">
              <div className="text-[10px] font-mono text-stone-500">Provider wraps tree</div>
              <div className="border border-stone-700 rounded-lg p-3">
                <div className="text-[10px] font-mono text-stone-500">Middle layer (no props)</div>
                <ContextConsumerDeep />
              </div>
            </div>
          </ContextProvider>
        </Card>
      )}

      {stateMode === 'zustand' && (
        <Card className="bg-stone-950/40 border-emerald-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="success">Best for complex state</Badge>
            <span className="text-xs text-stone-400">Zustand Global Store</span>
          </div>
          <ZustandConsumer mode={stateMode} onToggle={toggleMode} />
        </Card>
      )}
    </div>
  );

  const concepts = (
    <div className="space-y-4 text-stone-300 text-sm leading-relaxed">
      <h2 className="text-xl font-semibold text-emerald-400">State Management Patterns</h2>

      <h3 className="text-amber-400 font-semibold mt-3">❌ Prop Drilling</h3>
      <p>
        State lives at the top; every intermediate component must accept and pass props it
        doesn't care about. Painful to maintain beyond 2 levels deep.
      </p>

      <h3 className="text-blue-400 font-semibold mt-3">✔ Context API</h3>
      <p>
        React's built-in solution. Avoids prop threading but has a key pitfall:{' '}
        <strong className="text-white">all consumers re-render</strong> when the context value changes, even if they
        only use a small slice. Fine for low-frequency updates (theme, locale).
      </p>

      <h3 className="text-emerald-400 font-semibold mt-3">✅ Zustand</h3>
      <p>
        Selector-based subscriptions mean only the components that read a specific piece of state
        re-render. No Provider boilerplate. Works outside React (e.g., in utility functions).
      </p>
    </div>
  );

  const interactive = (
    <div className="space-y-3 text-stone-300 text-sm">
      <p>1. Switch to <strong className="text-white">Prop Drilling</strong> — notice how state must thread through every layer.</p>
      <p>2. Switch to <strong className="text-white">Context API</strong> — the Provider sits at the top; consumers read directly.</p>
      <p>3. Switch to <strong className="text-white">Zustand</strong> — no Provider at all; any component calls <code className="bg-stone-900 px-1 rounded">useObservabilityStore(selector)</code>.</p>
      <p>4. Watch the render counter — Zustand only re-renders subscribed components.</p>
    </div>
  );

  const codeFiles = [
    {
      path: 'src/app/labs/state-management/page.tsx',
      language: 'tsx',
      code: `// Zustand store
const useObservabilityStore = create((set) => ({
  stateMode: 'zustand',
  setStateMode: (mode) => set({ stateMode: mode }),
}));

// Consumer (anywhere in the tree, no Provider needed)
function ZustandConsumer() {
  const { stateMode, setStateMode } = useObservabilityStore();
  return <button onClick={() => setStateMode('context-api')}>{stateMode}</button>;
}`,
    },
    {
      path: 'Context API example',
      language: 'tsx',
      code: `const AppContext = createContext(null);

function Provider({ children }) {
  const [theme, setTheme] = useState('dark');
  return (
    <AppContext.Provider value={{ theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

// Any descendant can consume
function Consumer() {
  const { theme } = useContext(AppContext);
  return <div>{theme}</div>;
}`,
    },
  ];

  const performanceMetrics = (
    <div className="space-y-3 text-stone-300 text-sm">
      {[
        ['Prop Drilling re-render scope', 'Entire component tree'],
        ['Context API re-render scope', 'All consumers of that context'],
        ['Zustand re-render scope', 'Only selector-matched components'],
        ['Zustand update latency', '< 1 ms'],
        ['Context update latency', '< 1 ms (but more re-renders)'],
      ].map(([label, value]) => (
        <div key={label} className="flex justify-between border-b border-stone-900 pb-2">
          <span>{label}</span>
          <span className="font-mono text-emerald-400 text-right max-w-[50%]">{value}</span>
        </div>
      ))}
    </div>
  );

  const benefits = (
    <div className="space-y-2 text-stone-300 text-sm leading-relaxed">
      <p>✅ Zustand: zero boilerplate, selector precision, works outside React.</p>
      <p>✅ Context: built-in, no dependency, perfect for low-frequency global values.</p>
      <p>⚠️ Prop drilling: predictable but doesn't scale beyond 2-3 levels.</p>
    </div>
  );

  const architecture = (
    <pre className="bg-stone-950 p-4 rounded-lg overflow-x-auto text-emerald-400 text-xs font-mono leading-relaxed">
{`Prop Drilling
  Grandparent(state) → Parent(state) → Child(state)

Context API
  <Provider value={state}>
    <Middle>           ← no props needed
      <Consumer />     ← useContext() reads directly
    </Middle>
  </Provider>

Zustand
  create((set) => ({ stateMode, setStateMode }))
  Consumer (anywhere) → useStore(selector) → re-render only if slice changed`}
    </pre>
  );

  return (
    <LabLayout
      title="State Management Lab"
      description="Compare prop drilling, Context API, and Zustand side-by-side with live re-render tracking."
      optimizationScore={85}
      demo={demo}
      concepts={concepts}
      interactive={interactive}
      codeFiles={codeFiles}
      aiContext={{ moduleName: 'State Management Lab', extraContext: 'Compare prop drilling, Context API, and Zustand patterns.' }}
      performanceMetrics={performanceMetrics}
      benefits={benefits}
      architecture={architecture}
    />
  );
}
