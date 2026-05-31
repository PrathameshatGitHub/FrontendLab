import * as React from 'react';
import { LabLayout } from '@/components/labs/lab-layout';
import { Card, Badge } from '@/components/ui/primitives';
import {
  Server, Globe, Zap, SearchCode, Clock, LayoutTemplate,
  CheckCircle2, XCircle, ArrowRight, Database, Cpu, Eye
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// This is a React Server Component (RSC).
// WHY: No 'use client' directive means this runs ONLY on the server (Node.js).
// The component function is async, so we can await data directly — no useEffect,
// no loading spinners, no client-side fetch waterfalls.
// ─────────────────────────────────────────────────────────────────────────────

interface ServerProduct {
  id: number;
  title: string;
  category: string;
  renderNote: string;
}

interface ServerData {
  products: ServerProduct[];
  fetchDurationMs: number;
  serverTimestamp: string;
  nodeVersion: string;
  renderStrategy: string;
}

// Simulates a real DB or API call — runs entirely on the server
async function fetchServerData(): Promise<ServerData> {
  const startTime = Date.now();

  // WHY setTimeout: Simulates real-world DB latency (e.g. Postgres query).
  // In a real app this would be: const data = await db.query('SELECT * FROM products')
  // The user NEVER sees a loading spinner — the HTML is only sent after this resolves.
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    products: [
      {
        id: 1,
        title: 'Vercel Analytics Hub',
        category: 'SaaS',
        renderNote: 'Fully present in HTML before browser executes any JS.',
      },
      {
        id: 2,
        title: 'React Compiler Bundle',
        category: 'Tooling',
        renderNote: 'Googlebot indexes this content natively — no JS required.',
      },
      {
        id: 3,
        title: 'Hydration Observability Extension',
        category: 'DevTools',
        renderNote: 'Rendered on low-end devices at the same speed as high-end ones.',
      },
      {
        id: 4,
        title: 'Redux Saga Middleware Kit',
        category: 'State',
        renderNote: 'Server fetched — zero client bundle impact from this data.',
      },
    ],
    fetchDurationMs: Date.now() - startTime,
    serverTimestamp: new Date().toISOString(),
    nodeVersion: process.version,
    renderStrategy: 'React Server Component (RSC)',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Component — async Server Component
// ─────────────────────────────────────────────────────────────────────────────
export default async function SSRDemoPage() {
  // WHY: Data is fetched HERE, server-side, before the HTML is generated.
  // Compare to CSR: browser gets blank HTML → downloads JS → executes → fetches data → renders.
  // Here: server fetches → renders HTML with data → sends complete HTML to browser.
  const data = await fetchServerData();

  const codeFiles = [
    {
      path: 'src/app/(dashboard)/labs/ssr/page.tsx',
      language: 'typescript',
      code: `// Next.js 15 App Router — React Server Component
// No 'use client' = runs on Node.js server only.
// Async component = can await data directly.

async function fetchServerData() {
  // This runs on the SERVER — could be a real DB call:
  // const data = await db.query('SELECT * FROM products')
  // The client never sees this code in their browser bundle.
  await new Promise(r => setTimeout(r, 600)); // simulate DB
  return {
    products: [...],
    serverTimestamp: new Date().toISOString(),
    nodeVersion: process.version, // only available server-side
  };
}

export default async function SSRDemoPage() {
  // Awaiting data BEFORE rendering — no loading spinner needed.
  const data = await fetchServerData();

  return (
    <div>
      {/* This HTML is fully formed when the browser receives it */}
      <p>Server time: {data.serverTimestamp}</p>
      {data.products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}`,
    },
    {
      path: 'src/app/(dashboard)/labs/ssr/csr-equivalent.tsx',
      language: 'typescript',
      code: `// CSR Equivalent — what this would look like client-side
// Notice the complexity difference: loading state, useEffect, useState
'use client';

export default function CSRPage() {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true); // user sees spinner

  React.useEffect(() => {
    // WHY this is slower:
    // 1. Browser downloads blank HTML
    // 2. Browser downloads JS bundle
    // 3. React initializes, mounts component
    // 4. useEffect fires (AFTER paint)
    // 5. Fetch executes
    // 6. State updates, re-render happens
    // = 3–5 round trips before user sees content
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />; // user sees this for 2–3 seconds

  return <ProductList products={products} />;
}`,
    },
  ];

  // ── DEMO TAB CONTENT ──────────────────────────────────────────────────────
  const demoContent = (
    <div className="space-y-5">
      {/* Live server stats banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Fetch duration */}
        <Card className="p-4 border-emerald-500/30 bg-emerald-500/5 flex items-center gap-4">
          <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 flex-shrink-0">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">Server Fetch Time</p>
            <p className="text-xl font-extrabold font-mono text-emerald-400 mt-0.5">
              {data.fetchDurationMs}
              <span className="text-sm font-normal text-stone-400 ml-1">ms</span>
            </p>
          </div>
        </Card>

        {/* Timestamp */}
        <Card className="p-4 border-stone-800 bg-stone-900/30 flex items-center gap-4">
          <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 flex-shrink-0">
            <Server className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">Generated At</p>
            <p className="text-xs font-mono text-stone-200 mt-0.5">
              {new Date(data.serverTimestamp).toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              })}
            </p>
            <p className="text-[10px] text-stone-500 font-mono">
              {new Date(data.serverTimestamp).toLocaleDateString('en-IN')}
            </p>
          </div>
        </Card>

        {/* Node version */}
        <Card className="p-4 border-stone-800 bg-stone-900/30 flex items-center gap-4">
          <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 flex-shrink-0">
            <Cpu className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">Runtime</p>
            <p className="text-xs font-mono text-stone-200 mt-0.5">Node.js {data.nodeVersion}</p>
            <p className="text-[10px] text-stone-500 font-mono">{data.renderStrategy}</p>
          </div>
        </Card>
      </div>

      {/* Server-rendered product list */}
      <Card className="border-stone-800 bg-stone-900/20 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-stone-500" />
            <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest">
              Server-Rendered Products
            </h4>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
            {data.products.length} items · RSC
          </Badge>
        </div>
        <div className="divide-y divide-stone-800/60">
          {data.products.map((product) => (
            <div
              key={product.id}
              className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-stone-900/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-mono font-bold text-stone-400">
                    #{product.id}
                  </span>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-stone-100">{product.title}</h5>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{product.renderNote}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge className="bg-stone-800 text-stone-400 border border-stone-700 font-mono text-[10px]">
                  {product.category}
                </Badge>
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                  Server rendered
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SEO proof card */}
      <Card className="p-5 border-stone-800 bg-stone-900/30 flex items-start gap-4">
        <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 flex-shrink-0">
          <SearchCode className="w-5 h-5 text-stone-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white font-mono">SEO-Ready HTML</h3>
          <p className="text-xs text-stone-400 leading-relaxed mt-1">
            Right-click this page → <span className="font-mono text-stone-300">View Page Source</span>.
            Every product title above is present in the raw HTML — no JavaScript execution needed.
            Googlebot indexes this content the moment it crawls the URL.
          </p>
        </div>
      </Card>
    </div>
  );

  // ── CONCEPTS TAB ──────────────────────────────────────────────────────────
  const conceptsContent = (
    <>
      <h3 className="text-lg font-bold text-white">Why Server-Side Rendering?</h3>
      <p className="text-stone-400 text-sm leading-relaxed">
        In Client-Side Rendering (CSR), the browser downloads a blank HTML shell and a large JavaScript bundle.
        React executes, mounts, fires <span className="font-mono text-stone-300">useEffect</span>, which then fetches data,
        which triggers a re-render. The user stares at a loading spinner for 2–4 seconds.
      </p>

      <h4 className="text-sm font-bold text-emerald-400 mt-4">The React Server Component (RSC) Model:</h4>
      <div className="space-y-3 mt-2">
        {[
          {
            title: 'Data fetching is co-located with UI',
            body: 'Write await db.query() directly inside your React component. No separate API routes, no extra network round trip.',
          },
          {
            title: 'Zero bundle impact',
            body: 'Dependencies used in Server Components — heavy ORMs, date libraries, markdown parsers — are never shipped to the browser.',
          },
          {
            title: 'HTML arrives complete',
            body: 'The browser receives fully-formed HTML. First Contentful Paint happens the moment the HTML is parsed — not after JS hydration.',
          },
          {
            title: 'Streaming with Suspense',
            body: 'React can stream HTML chunks to the browser as sections finish rendering server-side. Users see content progressively rather than waiting for the slowest query.',
          },
        ].map(({ title, body }) => (
          <div key={title} className="flex gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-stone-200">{title}</p>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // ── INTERACTIVE TAB ───────────────────────────────────────────────────────
  const interactiveContent = (
    <div className="space-y-4">
      <Card className="p-5 border-stone-800 bg-stone-900/30">
        <h3 className="text-sm font-bold text-white mb-3 font-mono">🔬 Test: Disable JavaScript</h3>
        <p className="text-xs text-stone-400 leading-relaxed mb-4">
          Open DevTools → press <span className="font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">Cmd+Shift+P</span> (Mac) or{' '}
          <span className="font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">Ctrl+Shift+P</span> (Win) →
          type <span className="font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">Disable JavaScript</span> → refresh.
          The product list above renders perfectly. No JS = no problem for RSC.
        </p>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Server Components survive JS-disabled environments completely.
        </div>
      </Card>

      <Card className="p-5 border-stone-800 bg-stone-900/30">
        <h3 className="text-sm font-bold text-white mb-3 font-mono">🔬 Test: View Page Source</h3>
        <p className="text-xs text-stone-400 leading-relaxed mb-4">
          Press <span className="font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">Cmd+U</span> (Mac) or{' '}
          <span className="font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">Ctrl+U</span> (Win).
          Search for <span className="font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">Vercel Analytics Hub</span>.
          It's in the raw HTML — meaning Googlebot can read it without executing a single line of JavaScript.
        </p>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Full SEO indexability with zero JavaScript dependency.
        </div>
      </Card>

      <Card className="p-5 border-amber-500/20 bg-amber-500/5">
        <h3 className="text-sm font-bold text-white mb-3 font-mono">⚠️ What RSC cannot do</h3>
        <div className="space-y-2">
          {[
            'useState / useEffect / useReducer (client state only)',
            'Event handlers (onClick, onChange)',
            'Browser APIs (localStorage, window, document)',
            'useRef for DOM manipulation',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs text-stone-400">
              <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="font-mono">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-stone-500 mt-3 leading-relaxed">
          For interactive parts, use <span className="font-mono text-stone-300">'use client'</span> components
          as leaves inside your RSC tree.
        </p>
      </Card>
    </div>
  );

  // ── PERFORMANCE TAB ───────────────────────────────────────────────────────
  const performanceContent = (
    <div className="space-y-5">
      {/* CSR vs SSR comparison */}
      <Card className="p-5 border-stone-800 bg-stone-900/20">
        <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest mb-5">
          Load Sequence: CSR vs SSR
        </h4>
        <div className="space-y-6">
          {/* CSR timeline */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-stone-400">Standard SPA (CSR)</span>
              <span className="text-stone-500">~2,400ms to interactive</span>
            </div>
            <div className="flex w-full h-4 rounded-lg overflow-hidden bg-stone-900 gap-px">
              <div className="bg-blue-500/60 w-[8%] flex items-center justify-center" title="HTML Shell">
                <span className="text-[8px] text-white font-mono hidden sm:block">HTML</span>
              </div>
              <div className="bg-yellow-500/60 w-[35%] flex items-center justify-center" title="JS Bundle Download">
                <span className="text-[8px] text-white font-mono hidden sm:block">JS Bundle</span>
              </div>
              <div className="bg-orange-500/60 w-[20%] flex items-center justify-center" title="JS Parse + React Init">
                <span className="text-[8px] text-white font-mono hidden sm:block">Parse</span>
              </div>
              <div className="bg-red-500/60 w-[37%] flex items-center justify-center" title="Fetch + Re-render">
                <span className="text-[8px] text-white font-mono hidden sm:block">Fetch + Render</span>
              </div>
            </div>
            <div className="flex gap-3 mt-2 flex-wrap">
              {[
                { color: 'bg-blue-400', label: 'HTML shell' },
                { color: 'bg-yellow-400', label: 'JS bundle download' },
                { color: 'bg-orange-400', label: 'JS parse & React init' },
                { color: 'bg-red-400', label: 'API fetch & re-render' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-sm ${color}`} />
                  <span className="text-[10px] font-mono text-stone-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SSR timeline */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-emerald-400 font-bold">React Server Components (SSR)</span>
              <span className="text-emerald-400 font-bold">~120ms to interactive</span>
            </div>
            <div className="flex w-full h-4 rounded-lg overflow-hidden bg-stone-900 gap-px">
              <div
                className="bg-emerald-500 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.4)]"
                style={{ width: '5%' }}
                title="Server fetch + HTML"
              >
                <span className="text-[8px] text-white font-mono hidden sm:block">RSC</span>
              </div>
              <div className="bg-transparent flex-1" />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-2 h-2 rounded-sm bg-emerald-400" />
              <span className="text-[10px] font-mono text-stone-500">Server fetch + HTML generation → ready on arrival</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'TTFB', ssr: '~80ms', csr: '~400ms', win: true },
          { label: 'FCP', ssr: '~120ms', csr: '~2400ms', win: true },
          { label: 'SEO', ssr: '✓ Full', csr: '✗ None', win: true },
          { label: 'JS Bundle', ssr: 'Smaller', csr: 'Large', win: true },
        ].map(({ label, ssr, csr, win }) => (
          <Card key={label} className="p-3 border-stone-800 bg-stone-900/30">
            <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-2">{label}</p>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-xs font-mono text-emerald-400">{ssr}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle className="w-3 h-3 text-red-400" />
                <span className="text-xs font-mono text-stone-500">{csr}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* This very page's timing */}
      <Card className="p-5 border-emerald-500/20 bg-emerald-500/5">
        <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest mb-3">
          This Page's Actual Metrics
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-mono text-stone-500">Server fetch duration</p>
            <p className="text-2xl font-extrabold font-mono text-emerald-400">{data.fetchDurationMs}ms</p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-stone-500">Render strategy</p>
            <p className="text-sm font-bold font-mono text-stone-200">RSC (async component)</p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-stone-500">Client JS for data</p>
            <p className="text-sm font-bold font-mono text-emerald-400">0 bytes</p>
          </div>
        </div>
      </Card>
    </div>
  );

  // ── BENEFITS TAB ──────────────────────────────────────────────────────────
  const benefitsContent = (
    <>
      <h3 className="text-sm font-bold text-white mb-4">Core Benefits of SSR / RSC</h3>
      <div className="space-y-4">
        {[
          {
            icon: Globe,
            title: 'Search Engine Optimization',
            body: 'HTML is fully rendered before it reaches the browser. Social media link previews, Googlebot, and any HTTP crawler reads complete content without executing JavaScript.',
            color: 'text-emerald-400',
          },
          {
            icon: Zap,
            title: 'Device-Agnostic Performance',
            body: 'The server does the heavy lifting. A budget Android from 2019 gets the same fast FCP as a MacBook Pro — because rendering doesn\'t happen on device.',
            color: 'text-cyan-400',
          },
          {
            icon: Eye,
            title: 'Smaller Client Bundle',
            body: 'Server Component code and their dependencies never ship to the browser. Heavy libraries like Prisma, sharp, or date-fns used in RSC have zero client JS cost.',
            color: 'text-violet-400',
          },
          {
            icon: CheckCircle2,
            title: 'Simpler Data Flow',
            body: 'No useEffect, no loading state, no race conditions. The component function awaits data at the top and renders once — always with complete data.',
            color: 'text-amber-400',
          },
        ].map(({ icon: Icon, title, body, color }) => (
          <div key={title} className="flex gap-4 p-4 rounded-xl bg-stone-900/40 border border-stone-800">
            <Icon className={`w-5 h-5 ${color} flex-shrink-0 mt-0.5`} />
            <div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // ── ARCHITECTURE TAB ─────────────────────────────────────────────────────
  const architectureContent = (
    <div className="space-y-5">
      <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest">
        RSC Request → Response Flow
      </h4>

      <div className="border border-stone-800 bg-stone-950 p-6 rounded-xl">
        <div className="flex flex-col gap-0">
          {[
            {
              icon: Globe,
              label: 'Browser',
              color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
              action: 'GET /labs/ssr',
              note: 'HTTP request arrives at Next.js edge',
            },
            {
              icon: ArrowRight,
              label: null,
              color: 'text-stone-600',
              action: null,
              note: null,
            },
            {
              icon: Server,
              label: 'Next.js Server',
              color: 'text-violet-400 border-violet-500/30 bg-violet-500/5',
              action: 'Runs fetchServerData()',
              note: 'Async component executes; awaits DB/API',
            },
            {
              icon: ArrowRight,
              label: null,
              color: 'text-stone-600',
              action: null,
              note: null,
            },
            {
              icon: Database,
              label: 'Data Source',
              color: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
              action: 'Returns products[]',
              note: 'Could be Postgres, REST API, Redis cache',
            },
            {
              icon: ArrowRight,
              label: null,
              color: 'text-stone-600',
              action: null,
              note: null,
            },
            {
              icon: LayoutTemplate,
              label: 'React Renderer',
              color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
              action: 'Renders tree → HTML string',
              note: 'Component tree rendered with real data',
            },
            {
              icon: ArrowRight,
              label: null,
              color: 'text-stone-600',
              action: null,
              note: null,
            },
            {
              icon: Globe,
              label: 'Browser',
              color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
              action: 'Receives complete HTML',
              note: 'Paints immediately. Hydrates interactive parts later.',
            },
          ].map((step, i) => {
            if (!step.label) {
              return (
                <div key={i} className="flex justify-center py-1">
                  <ArrowRight className="w-4 h-4 text-stone-700 rotate-90" />
                </div>
              );
            }
            return (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${step.color}`}>
                <step.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${step.color.split(' ')[0]}`} />
                <div>
                  <p className={`text-xs font-mono font-bold ${step.color.split(' ')[0]}`}>{step.label}</p>
                  <p className="text-xs text-stone-200 font-mono mt-0.5">{step.action}</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">{step.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="p-4 border-stone-800 bg-stone-900/30">
        <p className="text-xs font-mono text-stone-400 leading-relaxed">
          <span className="text-emerald-400 font-bold">Key insight:</span> The entire left column
          (Server → Data → Render) happens before the browser receives a single byte of HTML.
          By the time the browser parses the response, the product list is already embedded in the markup.
        </p>
      </Card>
    </div>
  );

  // ── FINAL RENDER ─────────────────────────────────────────────────────────
  return (
    <LabLayout
      title="SSR & Server Components"
      description="Live demonstration of Next.js 15 React Server Components — async data fetching, zero client bundle, and SEO-ready HTML. This page itself is a Server Component."
      optimizationScore={99}
      aiContext={{ moduleName: 'rendering', extraContext: 'SSR vs CSR, React Server Components, async components, streaming' }}
      codeFiles={codeFiles}
      demo={demoContent}
      concepts={conceptsContent}
      interactive={interactiveContent}
      performanceMetrics={performanceContent}
      benefits={benefitsContent}
      architecture={architectureContent}
    />
  );
}