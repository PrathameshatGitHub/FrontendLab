'use client';

import * as React from 'react';
import { LabLayout } from '@/components/labs/lab-layout';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui/primitives';
import { Button } from '@/components/ui/primitives';
import { useObservabilityStore } from '@/store/observability.store';
import { apiFetch } from '@/utils/api-client';
import { RefreshCw, Database, Zap, Clock } from 'lucide-react';

// ─── simulated "cache" ────────────────────────────────────────────────────────
const CACHE = new Map<string, { data: any; ts: number }>();

function cachedFetch(key: string, staleTime: number, latency: number, fn: () => Promise<any>) {
  const entry = CACHE.get(key);
  if (entry && Date.now() - entry.ts < staleTime) {
    return Promise.resolve({ data: entry.data, cacheHit: true });
  }
  return new Promise<{ data: any; cacheHit: boolean }>((resolve) =>
    setTimeout(async () => {
      const data = await fn();
      CACHE.set(key, { data, ts: Date.now() });
      resolve({ data, cacheHit: false });
    }, latency)
  );
}

// ─── product card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: any }) {
  return (
    <Card className="bg-stone-950/40 border-stone-800 p-4 flex gap-3 items-start hover:border-emerald-500/30 transition-all">
      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold shrink-0">
        {product.title?.charAt(0)}
      </div>
      <div>
        <div className="text-sm font-semibold text-stone-200">{product.title}</div>
        <div className="text-xs text-stone-500 mt-0.5">{product.category}</div>
        <div className="text-xs font-mono text-emerald-400 mt-1">${product.price}</div>
      </div>
    </Card>
  );
}

export default function ReactQueryLab() {
  const { staleTime, simulatedLatency, rqCacheHits, rqCacheMisses,
          setStaleTime, setSimulatedLatency, incrementCacheHits, incrementCacheMisses,
          addLog } = useObservabilityStore();

  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [lastSource, setLastSource] = React.useState<'cache' | 'network' | null>(null);
  const [fetchCount, setFetchCount] = React.useState(0);

  const doFetch = React.useCallback(async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const { data, cacheHit } = await cachedFetch(
        'products',
        staleTime,
        simulatedLatency,
        () => apiFetch<any>('/products/products').then((r: any) => r.products ?? r)
      );
      const ms = Math.round(performance.now() - start);
      setProducts(Array.isArray(data) ? data : []);
      setLastSource(cacheHit ? 'cache' : 'network');
      setFetchCount((c) => c + 1);
      if (cacheHit) incrementCacheHits();
      else incrementCacheMisses();
      addLog('ReactQueryLab', ms, cacheHit ? 'Cache HIT' : 'Network fetch');
    } finally {
      setLoading(false);
    }
  }, [staleTime, simulatedLatency, addLog, incrementCacheHits, incrementCacheMisses]);

  React.useEffect(() => { doFetch(); }, []); // eslint-disable-line

  // ── demo ─────────────────────────────────────────────────────────────────────
  const demo = (
    <div className="space-y-4">
      {/* Stat bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Cache Hits', value: rqCacheHits, icon: Database, color: 'text-emerald-400' },
          { label: 'Network Calls', value: rqCacheMisses, icon: Zap, color: 'text-amber-400' },
          { label: 'Total Fetches', value: fetchCount, icon: RefreshCw, color: 'text-blue-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-stone-950/40 border-stone-800 p-4">
            <div className={`${color} flex items-center gap-1 text-xs font-mono mb-1`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </div>
            <div className="text-2xl font-bold text-white font-mono">{value}</div>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card className="bg-stone-950/40 border-stone-800 p-4 space-y-3">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs text-stone-500 font-mono block mb-1">
              Stale Time: <span className="text-emerald-400">{staleTime}ms</span>
            </label>
            <input
              type="range" min={0} max={10000} step={500}
              value={staleTime}
              onChange={(e) => setStaleTime(Number(e.target.value))}
              className="w-36 accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-stone-500 font-mono block mb-1">
              Simulated Latency: <span className="text-emerald-400">{simulatedLatency}ms</span>
            </label>
            <input
              type="range" min={0} max={3000} step={100}
              value={simulatedLatency}
              onChange={(e) => setSimulatedLatency(Number(e.target.value))}
              className="w-36 accent-emerald-500"
            />
          </div>
          <Button onClick={doFetch} disabled={loading} size="sm" className="mb-0.5">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Fetching…' : 'Re-fetch'}
          </Button>
        </div>
        {lastSource && (
          <div className="text-xs font-mono">
            Last fetch: <Badge variant={lastSource === 'cache' ? 'success' : 'warning'}>
              {lastSource === 'cache' ? '⚡ CACHE HIT' : '🌐 NETWORK'}
            </Badge>
          </div>
        )}
      </Card>

      {/* Product list */}
      {loading ? (
        <div className="text-stone-500 font-mono text-sm animate-pulse">Fetching products…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );

  const concepts = (
    <div className="space-y-4 text-stone-300 text-sm leading-relaxed">
      <h2 className="text-xl font-semibold text-emerald-400">Data Fetching & Caching</h2>
      <p>
        React Query (and its principles) solve three problems at once: <strong className="text-white">deduplication</strong>,{' '}
        <strong className="text-white">caching</strong>, and <strong className="text-white">background refetching</strong>.
      </p>
      <h3 className="text-white font-semibold mt-3">staleTime</h3>
      <p>
        For <code className="bg-stone-900 px-1 rounded">staleTime</code> milliseconds after a fetch, the cached data is
        considered "fresh" — subsequent requests return instantly from cache without hitting the network.
        This is the single biggest performance lever for read-heavy UIs.
      </p>
      <h3 className="text-white font-semibold mt-3">Optimistic Updates</h3>
      <p>
        Mutations can immediately update the UI before the server responds. On failure, roll back to
        the snapshot taken before the mutation.
      </p>
    </div>
  );

  const interactive = (
    <div className="space-y-3 text-stone-300 text-sm">
      <p>
        1. Click <strong className="text-white">Re-fetch</strong> repeatedly while <strong className="text-white">Stale Time</strong> is
        high — observe Cache Hit count climbing.
      </p>
      <p>
        2. Set Stale Time to <strong className="text-white">0ms</strong> and re-fetch — every call hits the simulated network.
      </p>
      <p>
        3. Increase Latency to <strong className="text-white">2000ms</strong> and watch the loading spinner to feel the real-world
        difference caching makes.
      </p>
    </div>
  );

  const codeFiles = [
    {
      path: 'src/app/labs/react-query/page.tsx',
      language: 'tsx',
      code: `// Simulated cache with staleTime
const CACHE = new Map();

function cachedFetch(key, staleTime, latency, fn) {
  const entry = CACHE.get(key);
  if (entry && Date.now() - entry.ts < staleTime) {
    return Promise.resolve({ data: entry.data, cacheHit: true });
  }
  return new Promise((resolve) =>
    setTimeout(async () => {
      const data = await fn();
      CACHE.set(key, { data, ts: Date.now() });
      resolve({ data, cacheHit: false });
    }, latency)
  );
}`,
    },
    {
      path: 'src/utils/api-client.ts',
      language: 'ts',
      code: `// apiFetch tries real backend first, falls back to in-memory mocks
export async function apiFetch<T>(path: string, options = {}): Promise<T> {
  try {
    const res = await fetch(\`\${config.apiBaseUrl}\${path}\`, options);
    return await res.json();
  } catch {
    return runMockFallback(path, options);
  }
}`,
    },
  ];

  const performanceMetrics = (
    <div className="space-y-3 text-stone-300 text-sm">
      {[
        ['Cache HIT response time', '< 1ms (sync Map lookup)'],
        ['Network MISS (0ms latency)', '~15ms (fetch + parse)'],
        ['With 500ms simulated latency', '~515ms'],
        ['Re-render cost per fetch', '< 3ms (Zustand update)'],
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
      <p>✅ Eliminates redundant network requests across the app via shared cache.</p>
      <p>✅ Stale-while-revalidate — users always see something immediately.</p>
      <p>✅ Background refetch keeps data fresh without blocking the UI.</p>
      <p>✅ Optimistic updates make mutations feel instantaneous.</p>
    </div>
  );

  const architecture = (
    <pre className="bg-stone-950 p-4 rounded-lg overflow-x-auto text-emerald-400 text-xs font-mono leading-relaxed">
{`React Query (simulated here with Map)
├── cachedFetch(key, staleTime, latency, fetcher)
│   ├── CACHE.has(key) && fresh? → return cached
│   └── else → setTimeout(latency) → apiFetch
│       └── CACHE.set(key, { data, ts: now })
└── Component
    ├── doFetch() → setProducts / setLastSource
    ├── ObservabilityStore.addLog(...)
    └── ObservabilityStore.incrementCacheHits/Misses`}
    </pre>
  );

  return (
    <LabLayout
      title="React Query / Data Fetching Lab"
      description="Explore staleTime, cache hits, latency simulation and background refetching patterns."
      optimizationScore={88}
      demo={demo}
      concepts={concepts}
      interactive={interactive}
      codeFiles={codeFiles}
      aiContext={{ moduleName: 'React Query Lab', extraContext: 'Focus on staleTime, cache hits/misses, and optimistic updates.' }}
      performanceMetrics={performanceMetrics}
      benefits={benefits}
      architecture={architecture}
    />
  );
}
