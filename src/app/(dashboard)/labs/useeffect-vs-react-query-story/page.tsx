'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Zap, 
  Clock, 
  Activity, 
  RefreshCw, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Code, 
  ArrowRight, 
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye,
  Terminal,
  Database,
  Image as ImageIcon,
  Flame,
  Sliders,
  Check,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui/primitives';
import { apiFetch } from '@/utils/api-client';

// Real API Fetch with Latency Simulation and Local Search Filtering
const fetchRealProductsWithLatency = async (search: string, delayMs: number): Promise<any[]> => {
  const start = performance.now();
  // Fetch real products from the backend API
  const data = await apiFetch<any>('/products/products');
  const duration = performance.now() - start;

  // Simulate network delay if desired delay is longer than actual request duration
  const remainingDelay = Math.max(0, delayMs - duration);
  if (remainingDelay > 0) {
    await new Promise(resolve => setTimeout(resolve, remainingDelay));
  }

  const products = Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []);
  if (!search) return products;
  return products.filter((p: any) => 
    p.title?.toLowerCase().includes(search.toLowerCase()) || 
    p.category?.toLowerCase().includes(search.toLowerCase())
  );
};

interface NetworkLog {
  id: string;
  source: 'useEffect' | 'React Query';
  query: string;
  timestamp: string;
  durationMs: number;
  status: 'PENDING' | 'SUCCESS' | 'ERROR';
  isCacheHit: boolean;
}

// ==================== SUBCOMPONENT: useEffect Fetcher ====================
interface UseEffectFetcherProps {
  searchQuery: string;
  latency: number;
  onFetchStart: () => void;
  onFetchSuccess: (durationMs: number) => void;
  onFetchError: (err: string) => void;
  onFlicker: () => void;
  instanceId: string;
  globalRendersRef: React.MutableRefObject<number>;
  addLog: (source: 'useEffect' | 'React Query', query: string, durationMs: number, isCacheHit: boolean, status: 'SUCCESS' | 'ERROR' | 'PENDING') => void;
}

function UseEffectFetcher({
  searchQuery,
  latency,
  onFetchStart,
  onFetchSuccess,
  onFetchError,
  onFlicker,
  instanceId,
  globalRendersRef,
  addLog
}: UseEffectFetcherProps) {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const localRendersRef = React.useRef(0);
  localRendersRef.current += 1;
  globalRendersRef.current += 1;

  React.useEffect(() => {
    let active = true;

    
    // Trigger 

    onFlicker();
    setData([]);
    setLoading(true);
    setError(null);
    onFetchStart();

    const startTime = performance.now();

    fetchRealProductsWithLatency(searchQuery, latency)
      .then((products) => {
        if (!active) return;
        const duration = Math.round(performance.now() - startTime);
        setData(products);
        setLoading(false);
        onFetchSuccess(duration);
        addLog('useEffect', searchQuery, duration, false, 'SUCCESS');
      })
      .catch((err) => {
        if (!active) return;
        setLoading(false);
        const errMsg = err.message || 'Failed to fetch';
        setError(errMsg);
        onFetchError(errMsg);
        addLog('useEffect', searchQuery, 0, false, 'ERROR');
      });

    return () => {
      active = false;
    };
  }, [searchQuery, latency]);

  return (
    <div className="border border-stone-800 bg-stone-900/60 p-4 rounded-xl flex flex-col justify-between min-h-[180px] shadow-lg backdrop-blur">
      <div className="flex items-center justify-between border-b border-stone-850 pb-2 mb-3">
        <span className="text-[10px] font-mono text-orange-400 font-semibold uppercase tracking-wider">{instanceId}</span>
        <span className="text-[9px] font-mono text-stone-500 bg-stone-950/60 px-1.5 py-0.5 rounded border border-stone-850">Renders: {localRendersRef.current}</span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <RefreshCw className="w-5 h-5 text-orange-400 animate-spin" />
            <span className="text-[9px] text-orange-300 font-mono animate-pulse">Fetching from network...</span>
          </div>
        ) : error ? (
          <div className="text-[10px] text-red-400 text-center p-2 border border-red-500/20 bg-red-500/5 rounded-lg flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
            {data.slice(0, 3).map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex items-center justify-between bg-stone-950/50 p-2 rounded border border-stone-850">
                <span className="text-[10px] font-medium text-stone-300 truncate max-w-[120px]">{item.title}</span>
                <span className="text-[9px] font-mono text-stone-500">${item.price}</span>
              </div>
            ))}
            {data.length === 0 && (
              <div className="text-center text-[9px] text-stone-500 py-4">No items found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== SUBCOMPONENT: React Query Fetcher ====================
interface ReactQueryFetcherProps {
  searchQuery: string;
  latency: number;
  staleTime: number;
  onFetchStart: () => void;
  onFetchSuccess: (durationMs: number) => void;
  onFetchError: (err: string) => void;
  onFlicker: () => void;
  onCacheHit: () => void;
  instanceId: string;
  globalRendersRef: React.MutableRefObject<number>;
  addLog: (source: 'useEffect' | 'React Query', query: string, durationMs: number, isCacheHit: boolean, status: 'SUCCESS' | 'ERROR' | 'PENDING') => void;
}

function ReactQueryFetcher({
  searchQuery,
  latency,
  staleTime,
  onFetchStart,
  onFetchSuccess,
  onFetchError,
  onFlicker,
  onCacheHit,
  instanceId,
  globalRendersRef,
  addLog
}: ReactQueryFetcherProps) {
  const localRendersRef = React.useRef(0);
  localRendersRef.current += 1;
  globalRendersRef.current += 1;

  const queryClient = useQueryClient();
  const queryKey = ['real-products', searchQuery];

  // Detect cache status on mount
  const isCachedBeforeMount = React.useMemo(() => {
    return !!queryClient.getQueryData(queryKey);
  }, [queryClient, searchQuery]);

  const hasMountedRef = React.useRef(false);

  React.useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (isCachedBeforeMount) {
        onCacheHit();
        addLog('React Query', searchQuery, 0, true, 'SUCCESS');
      } else {
        onFlicker();
      }
    }
  }, [isCachedBeforeMount, searchQuery]);

  const { data = [], isLoading, isFetching, error } = useQuery<any[], Error>({
    queryKey,
    queryFn: async () => {
      onFetchStart();
      const startTime = performance.now();
      try {
        const res = await fetchRealProductsWithLatency(searchQuery, latency);
        const duration = Math.round(performance.now() - startTime);
        onFetchSuccess(duration);
        addLog('React Query', searchQuery, duration, false, 'SUCCESS');
        return res;
      } catch (err: any) {
        const errMsg = err.message || 'Failed to fetch';
        onFetchError(errMsg);
        addLog('React Query', searchQuery, 0, false, 'ERROR');
        throw err;
      }
    },
    staleTime,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // triggers background sync on mount if data is stale
  });

  return (
    <div className="border border-stone-850 bg-stone-900/60 p-4 rounded-xl flex flex-col justify-between min-h-[180px] shadow-lg backdrop-blur">
      <div className="flex items-center justify-between border-b border-stone-850 pb-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">{instanceId}</span>
          {isFetching && (
            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[7px] px-1.5 py-0.5 rounded font-mono animate-pulse">
              SYNCING
            </Badge>
          )}
        </div>
        <span className="text-[9px] font-mono text-stone-500 bg-stone-950/60 px-1.5 py-0.5 rounded border border-stone-850">Renders: {localRendersRef.current}</span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
            <span className="text-[9px] text-emerald-300 font-mono animate-pulse">Loading from network...</span>
          </div>
        ) : error ? (
          <div className="text-[10px] text-red-400 text-center p-2 border border-red-500/20 bg-red-500/5 rounded-lg flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{error.message}</span>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
            {data.slice(0, 3).map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex items-center justify-between bg-stone-950/50 p-2 rounded border border-stone-850">
                <span className="text-[10px] font-medium text-stone-300 truncate max-w-[120px]">{item.title}</span>
                <span className="text-[9px] font-mono text-stone-500">${item.price}</span>
              </div>
            ))}
            {data.length === 0 && (
              <div className="text-center text-[9px] text-stone-500 py-4">No items found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UseEffectVsReactQueryStory() {
  // Tabs Navigation State
  const [activeTab, setActiveTab] = React.useState<'intro' | 'useEffect' | 'analysis' | 'reactQuery' | 'metrics' | 'code' | 'takeaways'>('intro');

  // Shared Sandbox Controls
  const [searchQuery, setSearchQuery] = React.useState('');
  const [latency, setLatency] = React.useState(800);
  const [staleTime, setStaleTime] = React.useState(3000);

  // Slot states for mounting individual widget instances
  const [ueMountedSlots, setUeMountedSlots] = React.useState<boolean[]>([true, false, false]);
  const [rqMountedSlots, setRqMountedSlots] = React.useState<boolean[]>([true, false, false]);

  // Remount simulator keys
  const [useEffectKey, setUseEffectKey] = React.useState(0);
  const [reactQueryKey, setReactQueryKey] = React.useState(0);

  // --- Real-world Telemetry Metrics ---
  const [ueRequests, setUeRequests] = React.useState(0);
  const [ueFlickers, setUeFlickers] = React.useState(0);
  const [ueTimes, setUeTimes] = React.useState<number[]>([]);

  const [rqRequests, setRqRequests] = React.useState(0);
  const [rqCacheHits, setRqCacheHits] = React.useState(0);
  const [rqFlickers, setRqFlickers] = React.useState(0);
  const [rqTimes, setRqTimes] = React.useState<number[]>([]);

  const [networkLogs, setNetworkLogs] = React.useState<NetworkLog[]>([]);

  // Use refs to count renders — ref mutations don't trigger re-renders,
  // so there's no infinite loop. We read .current directly in JSX.
  const ueRendersRef = React.useRef(0);
  const rqRendersRef = React.useRef(0);

  // Logs adding utility
  const addLog = React.useCallback((source: 'useEffect' | 'React Query', query: string, durationMs: number, isCacheHit: boolean = false, status: 'SUCCESS' | 'ERROR' | 'PENDING' = 'SUCCESS') => {
    const newLog: NetworkLog = {
      id: Math.random().toString(36).substring(2, 9),
      source,
      query: query || 'All Items',
      timestamp: new Date().toLocaleTimeString(),
      durationMs,
      status,
      isCacheHit
    };
    setNetworkLogs(prev => [newLog, ...prev].slice(0, 15));
  }, []);

  // Reset Telemetry helper
  const handleResetTelemetry = () => {
    setUeRequests(0);
    ueRendersRef.current = 0;
    setUeFlickers(0);
    setUeTimes([]);
    setRqRequests(0);
    rqRendersRef.current = 0;
    setRqCacheHits(0);
    setRqFlickers(0);
    setRqTimes([]);
    setNetworkLogs([]);
    setUseEffectKey(k => k + 1);
    setReactQueryKey(k => k + 1);
    setUeMountedSlots([true, false, false]);
    setRqMountedSlots([true, false, false]);
  };

  // Telemetry aggregates
  const ueAvgTime = ueTimes.length > 0 ? Math.round(ueTimes.reduce((a, b) => a + b, 0) / ueTimes.length) : 0;
  const rqAvgTime = rqTimes.length > 0 ? Math.round(rqTimes.reduce((a, b) => a + b, 0) / rqTimes.length) : 0;
  const cacheHitRatio = rqCacheHits + rqRequests > 0 ? Math.round((rqCacheHits / (rqCacheHits + rqRequests)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-slate-900 to-stone-950 text-stone-100 p-6 space-y-6">
      
      {/* HEADER HERO */}
      <section className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-800/80">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-wider">
            <Sparkles className="w-3 h-3 animate-pulse" />
            Interactive Engineering Lab
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            useEffect vs React Query
            <Badge variant="info" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Story Mode
            </Badge>
          </h1>
          <p className="text-stone-400 max-w-2xl text-xs leading-relaxed">
            Witness how direct state hydration using standard effects compares to the declarative state engines of production-grade caching clients.
          </p>
        </div>

        {/* Global Telemetry Summary Widget */}
        <Card className="bg-stone-950/40 border-stone-850 backdrop-blur shadow-xl min-w-[240px] p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-stone-850 pb-2">
            <div className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-semibold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              Real Telemetry
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleResetTelemetry}
              className="h-6 w-6 text-stone-500 hover:text-red-400"
              title="Reset metrics counts"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div>
              <span className="text-stone-500 block">useEffect GETs</span>
              <span className="text-sm font-bold text-orange-400">{ueRequests}</span>
            </div>
            <div>
              <span className="text-stone-500 block">React Query GETs</span>
              <span className="text-sm font-bold text-emerald-400">{rqRequests}</span>
            </div>
          </div>
        </Card>
      </section>

      {/* STORY NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto border-b border-stone-800 bg-stone-900/10 p-1 rounded-xl flex flex-wrap gap-1">
        {[
          { id: 'intro', label: '1. Problem Statement', icon: HelpCircle },
          { id: 'useEffect', label: '2. useEffect Fetcher', icon: Flame },
          { id: 'analysis', label: '3. Problems Analysis', icon: ShieldAlert },
          { id: 'reactQuery', label: '4. React Query Caching', icon: Zap },
          { id: 'metrics', label: '5. Metrics Dashboard', icon: Activity },
          { id: 'code', label: '6. Code Anatomy', icon: Code },
          { id: 'takeaways', label: '7. Takeaways', icon: CheckCircle2 }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500 text-stone-950 font-bold shadow-md shadow-emerald-500/10'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto min-h-[500px]">
        
        {/* ==================== TAB 1: PROBLEM STATEMENT ==================== */}
        {activeTab === 'intro' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-stone-800 bg-stone-900/40 p-6">
              <div className="max-w-3xl space-y-4">
                <h2 className="text-xl font-bold text-emerald-400">The Async Orchestration Problem</h2>
                <p className="text-sm leading-relaxed text-stone-300">
                  Most React developers initially handle server data caching inside components using <code className="bg-stone-950 text-orange-400 px-1 rounded font-mono">useEffect</code>. It seems straightforward: mount, fire a request, save to local component state.
                </p>
                <p className="text-sm leading-relaxed text-stone-300">
                  However, standard effects are designed for **synchronizing React state with external systems**, not acting as fully featured server state caching clients. When applications scale, critical issues immediately appear.
                </p>
              </div>

              {/* Graphical Diagram Timeline */}
              <div className="mt-8 border border-stone-800 bg-stone-950/60 p-6 rounded-xl space-y-6">
                <h3 className="text-xs font-mono text-stone-400 uppercase tracking-widest">Visual Request Cascade (useEffect)</h3>
                
                <div className="relative flex flex-col md:flex-row items-stretch justify-between gap-6 font-mono text-[10px]">
                  <div className="flex-1 border border-stone-850 p-3 rounded-lg bg-stone-900/40 relative">
                    <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 absolute -top-2.5 left-3">Mount Phase</Badge>
                    <p className="text-stone-300 mt-1 font-semibold">Component mounts</p>
                    <p className="text-stone-500 mt-1">Fires network call, triggers blank loading layout state.</p>
                    <div className="mt-2 w-full bg-orange-500/10 text-orange-400 py-1 text-center rounded animate-pulse">GET /products (Pending)</div>
                  </div>

                  <div className="flex items-center justify-center text-stone-600">
                    <ArrowRight className="w-5 h-5 hidden md:block" />
                  </div>

                  <div className="flex-1 border border-stone-850 p-3 rounded-lg bg-stone-900/40 relative">
                    <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 absolute -top-2.5 left-3">Unmount Phase</Badge>
                    <p className="text-stone-300 mt-1 font-semibold">User navigates away</p>
                    <p className="text-stone-500 mt-1">Component unmounts. Clean state is destroyed. Fired request remains dangling.</p>
                  </div>

                  <div className="flex items-center justify-center text-stone-600">
                    <ArrowRight className="w-5 h-5 hidden md:block" />
                  </div>

                  <div className="flex-1 border border-stone-850 p-3 rounded-lg bg-stone-900/40 relative">
                    <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 absolute -top-2.5 left-3">Remount Phase</Badge>
                    <p className="text-stone-300 mt-1 font-semibold">Component remounts</p>
                    <p className="text-stone-500 mt-1">Has zero cache. Must reload entirely over network from scratch.</p>
                    <div className="mt-2 w-full bg-orange-500/10 text-orange-400 py-1 text-center rounded animate-pulse">GET /products (Pending)</div>
                  </div>
                </div>
              </div>

              {/* Pain Point Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {[
                  { title: 'The Remount Storm', desc: 'Navigating back and forth triggers identical requests over and over, destroying TTFB latency advantages.' },
                  { title: 'Layout Shifts & Flicker', desc: 'Emptying data arrays during fetches forces visual templates to unmount, causing noticeable flashes.' },
                  { title: 'Parallel Request Spam', desc: 'Multiple components requesting same datasets fire separate calls synchronously, overloading API bandwidth.' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-stone-800 bg-stone-950/20 space-y-1">
                    <h4 className="text-xs font-mono font-bold text-orange-400">{item.title}</h4>
                    <p className="text-xs text-stone-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => setActiveTab('useEffect')} className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold font-mono text-xs rounded-lg">
                  Next Stage: useEffect Sandbox <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ==================== TAB 2: USE EFFECT FETCHING (INTERACTIVE) ==================== */}
        {activeTab === 'useEffect' && (
          <div className="space-y-6 animate-fade-in">
            {/* Split controls & list sandbox */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sandbox Controls panel */}
              <Card className="border-stone-800 bg-stone-900/40 p-5 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-stone-200 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-orange-400" />
                    useEffect Fetcher Controls
                  </h3>
                  <p className="text-[10px] text-stone-500 mt-1">Simulate changes and trigger fetches on the naive component.</p>
                </div>

                <div className="space-y-4">
                  {/* Control 1: Query */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-stone-300 block">Search Query</label>
                    <input 
                      type="text"
                      placeholder="e.g. Vercel, Compiler, Hydration..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* Control 2: Latency */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-300">Network Latency</span>
                      <span className="font-mono text-orange-400 font-bold">{latency}ms</span>
                    </div>
                    <input 
                      type="range"
                      min="100"
                      max="2500"
                      step="100"
                      value={latency}
                      onChange={(e) => setLatency(Number(e.target.value))}
                      className="w-full h-1 bg-stone-950 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Control 3: Slot Lifecycles */}
                  <div className="space-y-2 border-t border-stone-850 pt-4">
                    <span className="text-xs font-semibold text-stone-300 block">Isolated Widget Slots</span>
                    <div className="space-y-2">
                      {ueMountedSlots.map((isMounted, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-stone-950/60 p-2 rounded-lg border border-stone-850">
                          <span className="text-xs text-stone-400 font-mono font-medium">Widget Sibling #{idx + 1}</span>
                          <button
                            onClick={() => {
                              const next = [...ueMountedSlots];
                              next[idx] = !next[idx];
                              setUeMountedSlots(next);
                            }}
                            className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                              isMounted
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                          >
                            {isMounted ? 'Unmount' : 'Mount'}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setUeMountedSlots([true, true, true])}
                        className="flex-1 text-[9px] font-mono h-7 border-stone-800 text-stone-400 hover:text-white"
                      >
                        Mount All 3
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setUeMountedSlots([true, false, false])}
                        className="flex-1 text-[9px] font-mono h-7 border-stone-800 text-stone-400 hover:text-white"
                      >
                        Reset (1 Sibling)
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-850">
                  <Button 
                    size="sm"
                    onClick={() => setUseEffectKey(k => k + 1)}
                    className="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Remount All Siblings
                  </Button>
                  <p className="text-[9px] text-stone-500 leading-tight text-center mt-1">Forces complete deletion of internal states and effect triggering.</p>
                </div>
              </Card>

              {/* Main Sandbox Component list render */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-orange-500/20 bg-stone-900/40 p-5 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-500/50" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-850 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20">useEffect</Badge>
                        <h3 className="text-sm font-bold text-white">Naive Async Component Listing</h3>
                      </div>
                      <span className="text-[10px] font-mono text-stone-500">Total Sibling Renders: {ueRendersRef.current}</span>
                    </div>

                    {/* Interactive Sibling Investigation Guide */}
                    <div className="p-3.5 border border-orange-500/10 bg-orange-500/5 rounded-xl space-y-2 text-stone-300">
                      <h4 className="font-bold text-orange-400 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide">
                        <HelpCircle className="w-3.5 h-3.5 animate-pulse" /> 
                        Investigation Guide: The useEffect Pain Points
                      </h4>
                      <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-stone-400 leading-normal">
                        <li>
                          <strong>Duplicate Network Request Spam:</strong> Click <code className="bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800 text-stone-300 font-mono text-[10px]">Mount</code> on <strong>Widget Sibling #2 and #3</strong>. Notice how the total network requests increment with each widget! They spam redundant fetches for identical data.
                        </li>
                        <li>
                          <strong>Layout Shifts & Flickering Spinner:</strong> Unmount Widget #2, then mount it again. You will observe a loading spinner and visual layout shift. Because <code>useEffect</code> has no cache, data is destroyed on unmount and must be fetched from scratch.
                        </li>
                        <li>
                          <strong>Rapid Filter Storms:</strong> Type in the search input box. Each mounted sibling clears its data array and fires independent concurrent requests, creating network bottlenecks.
                        </li>
                      </ol>
                    </div>

                    {/* Simulation area */}
                    <div className="min-h-[220px] bg-stone-950/20 border border-stone-850 rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {ueMountedSlots.map((isMounted, idx) => {
                          const widgetId = `Widget #${idx + 1}`;
                          return isMounted ? (
                            <UseEffectFetcher
                              key={`ue-widget-${idx}-${useEffectKey}`}
                              instanceId={widgetId}
                              searchQuery={searchQuery}
                              latency={latency}
                              onFetchStart={() => setUeRequests(c => c + 1)}
                              onFetchSuccess={(duration) => setUeTimes(prev => [...prev, duration])}
                              onFetchError={() => {}}
                              onFlicker={() => setUeFlickers(c => c + 1)}
                              globalRendersRef={ueRendersRef}
                              addLog={addLog}
                            />
                          ) : (
                            <div 
                              key={`ue-slot-${idx}`} 
                              className="border border-dashed border-stone-800/80 rounded-xl p-4 flex flex-col items-center justify-center min-h-[180px] text-stone-650 bg-stone-950/15 hover:bg-stone-950/25 hover:border-stone-750 transition-all cursor-pointer group"
                              onClick={() => {
                                const next = [...ueMountedSlots];
                                next[idx] = true;
                                setUeMountedSlots(next);
                              }}
                            >
                              <Layers className="w-5 h-5 mb-1.5 text-stone-700 group-hover:text-stone-500 transition-colors" />
                              <span className="text-[10px] font-mono text-center text-stone-500">Slot #{idx + 1} Empty</span>
                              <span className="text-[8px] text-stone-600 mt-1">Click to Mount</span>
                            </div>
                          );
                        })}
                      </div>
                      {ueMountedSlots.filter(Boolean).length === 0 && (
                        <div className="text-center text-xs text-stone-500 py-12">
                          All widgets unmounted. Mount a slot above or click an empty slot box.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-stone-850 grid grid-cols-3 gap-2 text-[10px] font-mono text-center">
                    <div>
                      <span className="text-stone-500 block">GET CALLS</span>
                      <span className="text-sm font-bold text-orange-400">{ueRequests}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">IMAGE FLICKERS</span>
                      <span className="text-sm font-bold text-red-400 flex items-center justify-center gap-1">
                        {ueFlickers} <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">AVG SPEED</span>
                      <span className="text-sm font-bold text-orange-400">{ueAvgTime}ms</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* LIVE CONSOLE LOG UNDERNEATH */}
            <Card className="border-stone-800 bg-stone-950/80 backdrop-blur rounded-xl overflow-hidden">
              <div className="border-b border-stone-800 bg-stone-950/40 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-orange-400" />
                  <h4 className="font-mono font-bold text-xs tracking-wider text-stone-300">OBSERVABILITY NETWORK LOG TRAFFIC (useEffect)</h4>
                </div>
                <span className="text-[9px] font-mono text-stone-500">GET Requests Captured</span>
              </div>
              <div className="p-4 max-h-[160px] overflow-y-auto font-mono text-[10px] space-y-1.5">
                {networkLogs.filter(log => log.source === 'useEffect').length === 0 ? (
                  <div className="text-center text-stone-600 py-4">No active requests logged yet. Trigger sandbox events.</div>
                ) : (
                  networkLogs.filter(log => log.source === 'useEffect').map(log => (
                    <div key={log.id} className="flex items-center justify-between p-1.5 border border-orange-500/20 bg-orange-500/5 text-orange-400 rounded">
                      <div className="flex items-center gap-4">
                        <span className="font-bold">GET</span>
                        <span>/products/products?search={log.query}</span>
                        <span className="text-stone-500">latency: {log.durationMs}ms</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-stone-600">{log.timestamp}</span>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded text-[8px]">SUCCESS</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <div className="flex justify-between mt-6">
              <Button onClick={() => setActiveTab('intro')} variant="outline" className="border-stone-800 text-stone-300 hover:bg-stone-900 font-mono text-xs rounded-lg">
                &lt; Stage 1
              </Button>
              <Button onClick={() => setActiveTab('analysis')} className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold font-mono text-xs rounded-lg">
                Stage 3: Problems Analysis <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: PROBLEMS ANALYSIS (DEEP-DIVE) ==================== */}
        {activeTab === 'analysis' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-stone-800 bg-stone-900/40 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Why standard useEffect breaks down:</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-stone-300">
                <div className="space-y-4">
                  <h3 className="text-orange-400 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    1. Component Coupling vs Global Caching
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-400">
                    A local <code className="text-orange-400 bg-orange-950/20 px-1 rounded">useState</code> is bound tightly to the component's render lifecycle. When the component unmounts:
                  </p>
                  <ul className="list-disc pl-5 text-xs text-stone-400 space-y-1.5">
                    <li>The local state is completely trashed.</li>
                    <li>Subsequent mounts have zero context of the prior fetched result, necessitating another server GET.</li>
                    <li>This prevents data-sharing across different pages or sidebar widgets, forcing duplicate fetching.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-orange-400 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    2. Race Conditions & Dandling Promises
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-400">
                    If the user types rapidly in a search filter, standard effects run sequentially.
                  </p>
                  <ul className="list-disc pl-5 text-xs text-stone-400 space-y-1.5">
                    <li>Each keypress fires an asynchronous request.</li>
                    <li>Network packets can arrive out of order (e.g. Request 1 resolving AFTER Request 2).</li>
                    <li>This causes the UI to display stale, incorrect search outcomes without explicit cleanup controls.</li>
                  </ul>
                </div>
              </div>

              {/* Explanatory visual card */}
              <div className="mt-8 border border-stone-800 bg-stone-950/40 p-6 rounded-xl space-y-4 max-w-3xl">
                <h4 className="text-xs font-mono font-bold text-stone-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Engineering Insight: React 18+ Mount Rules
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  In React StrictMode, components are intentionally mounted, unmounted, and remounted synchronously to detect missing cleanup phases. Under useEffect, this triggers **two simultaneous network GET requests instantly on initial load**. Caching clients resolve this automatically by deduplicating and serving hot cache.
                </p>
              </div>

              <div className="flex justify-between mt-8">
                <Button onClick={() => setActiveTab('useEffect')} variant="outline" className="border-stone-800 text-stone-300 hover:bg-stone-900 font-mono text-xs rounded-lg">
                  &lt; Stage 2
                </Button>
                <Button onClick={() => setActiveTab('reactQuery')} className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold font-mono text-xs rounded-lg">
                  Stage 4: React Query Caching <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ==================== TAB 4: REACT QUERY SOLUTION (INTERACTIVE) ==================== */}
        {activeTab === 'reactQuery' && (
          <div className="space-y-6 animate-fade-in">
            {/* Split controls & list sandbox */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sandbox Controls panel */}
              <Card className="border-stone-800 bg-stone-900/40 p-5 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-stone-200 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    React Query Controls
                  </h3>
                  <p className="text-[10px] text-stone-500 mt-1">Configure Query attributes and watch caching engines respond.</p>
                </div>

                <div className="space-y-4">
                  {/* Control 1: Query */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-stone-300 block">Search Query</label>
                    <input 
                      type="text"
                      placeholder="e.g. Vercel, Compiler, Hydration..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Control 2: Latency */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-300">Network Latency</span>
                      <span className="font-mono text-emerald-400 font-bold">{latency}ms</span>
                    </div>
                    <input 
                      type="range"
                      min="100"
                      max="2500"
                      step="100"
                      value={latency}
                      onChange={(e) => setLatency(Number(e.target.value))}
                      className="w-full h-1 bg-stone-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Control 3: Stale Time */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-300">staleTime (Fresh Cache)</span>
                      <span className="font-mono text-emerald-400 font-bold">{staleTime / 1000}s</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="10000"
                      step="1000"
                      value={staleTime}
                      onChange={(e) => setStaleTime(Number(e.target.value))}
                      className="w-full h-1 bg-stone-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <p className="text-[9px] text-stone-500 leading-tight">Controls how long cache remains "Fresh" before background fetches are triggered.</p>
                  </div>                  {/* Control 4: Slot Lifecycles */}
                  <div className="space-y-2 border-t border-stone-850 pt-4">
                    <span className="text-xs font-semibold text-stone-300 block">Isolated Widget Slots</span>
                    <div className="space-y-2">
                      {rqMountedSlots.map((isMounted, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-stone-950/60 p-2 rounded-lg border border-stone-850">
                          <span className="text-xs text-stone-400 font-mono font-medium">Widget Sibling #{idx + 1}</span>
                          <button
                            onClick={() => {
                              const next = [...rqMountedSlots];
                              next[idx] = !next[idx];
                              setRqMountedSlots(next);
                            }}
                            className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                              isMounted
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                          >
                            {isMounted ? 'Unmount' : 'Mount'}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRqMountedSlots([true, true, true])}
                        className="flex-1 text-[9px] font-mono h-7 border-stone-800 text-stone-400 hover:text-white"
                      >
                        Mount All 3
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRqMountedSlots([true, false, false])}
                        className="flex-1 text-[9px] font-mono h-7 border-stone-800 text-stone-400 hover:text-white"
                      >
                        Reset (1 Sibling)
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-850">
                  <Button 
                    size="sm"
                    onClick={() => setReactQueryKey(k => k + 1)}
                    className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Remount All Siblings
                  </Button>
                </div>
              </Card>

              {/* Main Sandbox Component list render */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-emerald-500/20 bg-stone-900/40 p-5 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500/50" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-850 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">React Query</Badge>
                        <h3 className="text-sm font-bold text-white">Declarative Query Caching</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-stone-500">Total Sibling Renders: {rqRendersRef.current}</span>
                      </div>
                    </div>

                    {/* Interactive Caching Investigation Guide */}
                    <div className="p-3.5 border border-emerald-500/10 bg-emerald-500/5 rounded-xl space-y-2 text-stone-300">
                      <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide">
                        <HelpCircle className="w-3.5 h-3.5 animate-pulse" /> 
                        Investigation Guide: Caching & Deduplication Solutions
                      </h4>
                      <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-stone-400 leading-normal">
                        <li>
                          <strong>Automated Request Deduplication:</strong> Click <code className="bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800 text-stone-300 font-mono text-[10px]">Mount</code> on <strong>Widget Sibling #2 and #3</strong>. Notice how they load instantly, but the total network requests does NOT increase! React Query batches simultaneous requests into one query fetch.
                        </li>
                        <li>
                          <strong>Zero Flicker Hydration:</strong> Unmount Sibling #2, then mount it again. It renders <em>instantly</em> (0ms perceived latency) with no spinner or visual shift because data is hydrated straight from the cache.
                        </li>
                        <li>
                          <strong>Stale-While-Revalidate Sync:</strong> Set <code className="text-emerald-400 font-mono">staleTime</code> to 0s, and mount Sibling #2. Data renders instantly from cache (no blank spinner), but a background refetch runs silently (blinking <code className="text-cyan-400 font-mono">SYNCING</code> badge).
                        </li>
                      </ol>
                    </div>

                    {/* Simulation area */}
                    <div className="min-h-[220px] bg-stone-950/20 border border-stone-850 rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {rqMountedSlots.map((isMounted, idx) => {
                          const widgetId = `Widget #${idx + 1}`;
                          return isMounted ? (
                            <ReactQueryFetcher
                              key={`rq-widget-${idx}-${reactQueryKey}`}
                              instanceId={widgetId}
                              searchQuery={searchQuery}
                              latency={latency}
                              staleTime={staleTime}
                              onFetchStart={() => setRqRequests(c => c + 1)}
                              onFetchSuccess={(duration) => setRqTimes(prev => [...prev, duration])}
                              onFetchError={() => {}}
                              onFlicker={() => setRqFlickers(c => c + 1)}
                              onCacheHit={() => setRqCacheHits(c => c + 1)}
                              globalRendersRef={rqRendersRef}
                              addLog={addLog}
                            />
                          ) : (
                            <div 
                              key={`rq-slot-${idx}`} 
                              className="border border-dashed border-stone-800/80 rounded-xl p-4 flex flex-col items-center justify-center min-h-[180px] text-stone-650 bg-stone-950/15 hover:bg-stone-950/25 hover:border-stone-750 transition-all cursor-pointer group"
                              onClick={() => {
                                const next = [...rqMountedSlots];
                                next[idx] = true;
                                setRqMountedSlots(next);
                              }}
                            >
                              <Layers className="w-5 h-5 mb-1.5 text-stone-700 group-hover:text-stone-500 transition-colors" />
                              <span className="text-[10px] font-mono text-center text-stone-500">Slot #{idx + 1} Empty</span>
                              <span className="text-[8px] text-stone-600 mt-1">Click to Mount</span>
                            </div>
                          );
                        })}
                      </div>
                      {rqMountedSlots.filter(Boolean).length === 0 && (
                        <div className="text-center text-xs text-stone-500 py-12">
                          All widgets unmounted. Mount a slot above or click an empty slot box.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-stone-850 grid grid-cols-4 gap-2 text-[10px] font-mono text-center">
                    <div>
                      <span className="text-stone-500 block">NET REQUESTS</span>
                      <span className="text-sm font-bold text-emerald-400">{rqRequests}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">CACHE HITS</span>
                      <span className="text-sm font-bold text-cyan-400">{rqCacheHits}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">IMAGE FLICKERS</span>
                      <span className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1">
                        {rqFlickers} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">AVG SPEED</span>
                      <span className="text-sm font-bold text-emerald-400">{rqAvgTime}ms</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* LIVE CONSOLE LOG UNDERNEATH */}
            <Card className="border-stone-800 bg-stone-950/80 backdrop-blur rounded-xl overflow-hidden">
              <div className="border-b border-stone-800 bg-stone-950/40 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-mono font-bold text-xs tracking-wider text-stone-300">OBSERVABILITY NETWORK LOG TRAFFIC (React Query)</h4>
                </div>
                <span className="text-[9px] font-mono text-stone-500">GET Requests Captured</span>
              </div>
              <div className="p-4 max-h-[160px] overflow-y-auto font-mono text-[10px] space-y-1.5">
                {networkLogs.filter(log => log.source === 'React Query').length === 0 ? (
                  <div className="text-center text-stone-600 py-4">No active requests logged yet. Trigger sandbox events.</div>
                ) : (
                  networkLogs.filter(log => log.source === 'React Query').map(log => (
                    <div key={log.id} className={`flex items-center justify-between p-1.5 border ${log.isCacheHit ? 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400' : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'} rounded`}>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">GET</span>
                        <span>/products/products?search={log.query}</span>
                        <span className="text-stone-500">{log.isCacheHit ? 'instant cache hit' : `latency: ${log.durationMs}ms`}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-stone-600">{log.timestamp}</span>
                        {log.isCacheHit ? (
                          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1 rounded text-[8px]">CACHE HIT</span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded text-[8px]">NET MISS</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <div className="flex justify-between mt-6">
              <Button onClick={() => setActiveTab('analysis')} variant="outline" className="border-stone-800 text-stone-300 hover:bg-stone-900 font-mono text-xs rounded-lg">
                &lt; Stage 3
              </Button>
              <Button onClick={() => setActiveTab('metrics')} className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold font-mono text-xs rounded-lg">
                Stage 5: Metrics Comparison <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: METRICS COMPARISON (LIVE OBSERVABILITY) ==================== */}
        {activeTab === 'metrics' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-stone-800 bg-stone-900/40 p-6 space-y-8">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Live Observability Telemetry Dashboard
                </h2>
                <p className="text-xs text-stone-400 mt-1">Aggregated statistics based on your actual playground actions across Tab 2 and Tab 4.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                {/* Metric 1 */}
                <div className="bg-stone-950/40 border border-stone-850 p-5 rounded-xl space-y-2">
                  <h3 className="text-[10px] text-stone-500 font-mono uppercase tracking-wider">Server Requests</h3>
                  <div className="flex items-baseline justify-center gap-2 py-1">
                    <span className="text-3xl font-extrabold text-orange-400">{ueRequests}</span>
                    <span className="text-stone-600 text-xs">vs</span>
                    <span className="text-3xl font-extrabold text-emerald-400">{rqRequests}</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${rqRequests + ueRequests > 0 ? (rqRequests / (rqRequests + ueRequests)) * 100 : 50}%` }} />
                  </div>
                  <p className="text-[9px] text-stone-500 text-left pt-1 leading-relaxed">Lower is better. Shows how caching reduces database bandwidth.</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-stone-950/40 border border-stone-850 p-5 rounded-xl space-y-2">
                  <h3 className="text-[10px] text-stone-500 font-mono uppercase tracking-wider">UI Render Cycles</h3>
                  <div className="flex items-baseline justify-center gap-2 py-1">
                    <span className="text-3xl font-extrabold text-orange-400">{ueRendersRef.current}</span>
                    <span className="text-stone-600 text-xs">vs</span>
                    <span className="text-3xl font-extrabold text-emerald-400">{rqRendersRef.current}</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${rqRendersRef.current + ueRendersRef.current > 0 ? (rqRendersRef.current / (rqRendersRef.current + ueRendersRef.current)) * 100 : 50}%` }} />
                  </div>
                  <p className="text-[9px] text-stone-500 text-left pt-1 leading-relaxed">Lower is better. Standard effects trigger multiple state mutations per cycle.</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-stone-950/40 border border-stone-850 p-5 rounded-xl space-y-2">
                  <h3 className="text-[10px] text-stone-500 font-mono uppercase tracking-wider">Perceived Performance</h3>
                  <div className="flex items-baseline justify-center gap-2 py-1">
                    <span className="text-xl font-extrabold text-orange-400">{latency}ms</span>
                    <span className="text-stone-600 text-xs">vs</span>
                    <span className="text-xl font-extrabold text-emerald-400">&lt; 1ms</span>
                  </div>
                  <p className="text-[9px] text-stone-500 text-left pt-1 leading-relaxed">Hot caching delivers absolute immediate rendering, bypassing browser layout spinners entirely.</p>
                </div>

                {/* Metric 4 */}
                <div className="bg-stone-950/40 border border-stone-850 p-5 rounded-xl space-y-2">
                  <h3 className="text-[10px] text-stone-500 font-mono uppercase tracking-wider">Image Caching Hit Ratio</h3>
                  <div className="py-2">
                    <span className="text-3xl font-extrabold text-cyan-400">{cacheHitRatio}%</span>
                  </div>
                  <p className="text-[9px] text-stone-500 text-left leading-relaxed">Indicates the percentage of layouts loaded cleanly without visual shift or redraw flickers.</p>
                </div>
              </div>

              {/* Progress Summary stats */}
              <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl max-w-2xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Overall Telemetry Verdict
                  </h4>
                  <p className="text-[10px] text-stone-400 leading-normal">
                    By implementing Query deduplication and Stale-While-Revalidate caching, React Query saved **{ueRequests - rqRequests > 0 ? (ueRequests - rqRequests) : 0} redundant network GET calls** and prevented layout shifting.
                  </p>
                </div>
                <Badge variant="success" className="text-xs font-mono font-bold">OPTIMIZED</Badge>
              </div>

              <div className="flex justify-between pt-4 border-t border-stone-850">
                <Button onClick={() => setActiveTab('reactQuery')} variant="outline" className="border-stone-800 text-stone-300 hover:bg-stone-900 font-mono text-xs rounded-lg">
                  &lt; Stage 4
                </Button>
                <Button onClick={() => setActiveTab('code')} className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold font-mono text-xs rounded-lg">
                  Stage 6: Code Anatomy <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ==================== TAB 6: CODE BREAKDOWN ==================== */}
        {activeTab === 'code' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Naive useEffect component code */}
              <Card className="border-orange-500/20 bg-stone-950 p-5 overflow-hidden">
                <div className="border-b border-orange-500/20 pb-3 flex items-center justify-between">
                  <span className="text-xs font-mono text-orange-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Naive useEffect Orchestration
                  </span>
                  <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[8px] font-mono">BUG-PRONE</Badge>
                </div>
                <pre className="p-4 text-[10px] font-mono text-stone-300 overflow-x-auto leading-relaxed">
{`import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/utils/api-client';

export function ProductList({ searchQuery }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    // ❌ Destroys layout cache, causing CLS & image flickers
    setData([]);

    apiFetch('/products/products')
      .then(res => {
        // ❌ Race condition risk if dependencies change
        if (active) {
          setData(res.products);
          setLoading(false);
        }
      });

    return () => {
      active = false; // ❌ Boilerplate cleanups required
    };
  }, [searchQuery]); // ❌ Fires on EVERY dependency change
}`}
                </pre>
              </Card>

              {/* React Query Hook code */}
              <Card className="border-emerald-500/20 bg-stone-950 p-5 overflow-hidden">
                <div className="border-b border-emerald-500/20 pb-3 flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Declarative useQuery Hook
                  </span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[8px] font-mono">PRODUCTION-GRADE</Badge>
                </div>
                <pre className="p-4 text-[10px] font-mono text-stone-300 overflow-x-auto leading-relaxed">
{`import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/utils/api-client';

export function ProductList({ searchQuery }) {
  // ✅ Complete async lifecycle encapsulated declaratively
  const { data = [], isLoading, isFetching } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: () => apiFetch('/products/products').then(r => r.products),
    
    // ✅ Keeps previous data visible during background syncs (Stable CLS)
    placeholderData: (previousData) => previousData,
    
    // ✅ 5-second fresh cache blocks redundant GET requests
    staleTime: 5000,
    
    // ✅ Deduplicates concurrent requests automatically
    refetchOnWindowFocus: false,
  });

  return isLoading ? <Spinner /> : <Grid items={data} />;
}`}
                </pre>
              </Card>

            </div>

            <div className="flex justify-between mt-6">
              <Button onClick={() => setActiveTab('metrics')} variant="outline" className="border-stone-800 text-stone-300 hover:bg-stone-900 font-mono text-xs rounded-lg">
                &lt; Stage 5
              </Button>
              <Button onClick={() => setActiveTab('takeaways')} className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold font-mono text-xs rounded-lg">
                Stage 7: Takeaways <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ==================== TAB 7: ENGINEERING TAKEAWAYS ==================== */}
        {activeTab === 'takeaways' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-stone-800 bg-stone-900/40 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Architectural Takeaways & Decision Guidelines</h2>
                <p className="text-xs text-stone-400 mt-1">Summary guidelines for deciding on asynchronous data state layers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-stone-300">
                <div className="p-4 border border-stone-800 bg-stone-950/40 rounded-xl space-y-2">
                  <h4 className="font-bold text-orange-400 uppercase tracking-wider font-mono">Use useEffect only when:</h4>
                  <ul className="list-disc pl-4 text-stone-400 space-y-1">
                    <li>Quick prototypes or static local JSON configs are used.</li>
                    <li>Synchronizing with hardware APIs (e.g. setting up audio listeners, custom canvas triggers).</li>
                    <li>Fires-once side effects that have absolutely no impact on UI data state hydration.</li>
                  </ul>
                </div>

                <div className="p-4 border border-stone-800 bg-stone-950/40 rounded-xl space-y-2">
                  <h4 className="font-bold text-emerald-400 uppercase tracking-wider font-mono">Use Caching Clients (React Query) when:</h4>
                  <ul className="list-disc pl-4 text-stone-400 space-y-1">
                    <li>Building production dashboard consoles with parallel loads.</li>
                    <li>Frequent CRUD operations require optimistic caching / mutations.</li>
                    <li>Network bandwidth savings on the backend database are high priority.</li>
                    <li>Structural layout shift prevention (CLS) is needed for high-quality UX.</li>
                  </ul>
                </div>
              </div>

              {/* Architectural checklist */}
              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-mono font-bold text-stone-300 uppercase tracking-widest">Production Checklist</h4>
                <div className="space-y-2 text-xs text-stone-450">
                  {[
                    { title: 'Deduplicate GET queries', desc: 'Merge parallel sibling requests on key parameter duplicates.' },
                    { title: 'Placeholder Retention', desc: 'Hold stale cache properties visible during network syncs to maintain stable image renders.' },
                    { title: 'Intelligent staleTime configs', desc: 'Set staleTimes matching database updates (e.g. 5s for dashboard panels).' }
                  ].map((chk, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-stone-300">{chk.title}</strong> — {chk.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-start mt-8 pt-4 border-t border-stone-850">
                <Button onClick={() => setActiveTab('intro')} variant="outline" className="border-stone-800 text-stone-300 hover:bg-stone-900 font-mono text-xs rounded-lg flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" /> Start Story Over
                </Button>
              </div>
            </Card>
          </div>
        )}

      </div>

    </div>
  );
}
