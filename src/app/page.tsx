'use client';

import * as React from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/primitives';
import {
  ArrowRight, Layers, Globe, Code2, Sparkles, Shield, Zap, Database,
  LayoutTemplate, Activity, GitBranch, Image as ImageIcon, Settings,
  BarChart3, Search, Filter, Users, ShoppingBag, Server, Lock,
  ChevronRight, Terminal, Cpu, Box, RefreshCw, Eye, TrendingUp,
  CheckCircle2, ExternalLink, Star
} from 'lucide-react';

const fadeUp: any = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

const fadeIn: any = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.06 }
  })
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const TECH_STACK = [
  'Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion',
  'Redux Toolkit', 'Redux Saga', 'React Query', 'Zustand', 'Recharts',
  'Ant Design', 'Zod', 'React Hook Form', 'Sonner', 'Lucide Icons',
];

const FEATURES = [
  { icon: Shield, label: 'JWT Auth', desc: 'Role-based route protection with secure token management', color: 'emerald' },
  { icon: GitBranch, label: 'Redux Toolkit', desc: 'Scalable state slices with RTK and async thunks', color: 'cyan' },
  { icon: RefreshCw, label: 'Redux Saga', desc: 'Complex async flows with generator-based side effects', color: 'violet' },
  { icon: Server, label: 'SSR & RSC', desc: 'Server Components with zero client bundle overhead', color: 'emerald' },
  { icon: Database, label: 'API Integration', desc: 'React Query caching with optimistic mutations', color: 'cyan' },
  { icon: Activity, label: 'Dashboard Analytics', desc: 'Real-time charts and observability metrics', color: 'violet' },
  { icon: Lock, label: 'Protected Routes', desc: 'Middleware-level cookie-based route guards', color: 'emerald' },
  { icon: LayoutTemplate, label: 'Responsive Design', desc: 'Fluid layouts across mobile, tablet and desktop', color: 'cyan' },
  { icon: Layers, label: 'Reusable Components', desc: 'Clean primitive architecture with composable APIs', color: 'violet' },
  { icon: Zap, label: 'Optimized Rendering', desc: 'useMemo, useCallback, React.memo, lazy imports', color: 'emerald' },
  { icon: Filter, label: 'Search & Filters', desc: 'Memoized client-side filtering with debounced inputs', color: 'cyan' },
  { icon: BarChart3, label: 'Dynamic Tables', desc: 'Sortable, paginated tables with Ant Design Pro', color: 'violet' },
  { icon: Users, label: 'Role Management', desc: 'Admin, Vendor, User privilege tiers with audit logs', color: 'emerald' },
  { icon: ImageIcon, label: 'Image Optimization', desc: 'Next/Image with lazy loading and format conversion', color: 'cyan' },
  { icon: Cpu, label: 'Memoization Labs', desc: 'Interactive demos visualizing re-render prevention', color: 'violet' },
];

const ROLES = [
  {
    role: 'User',
    icon: ShoppingBag,
    color: 'emerald',
    path: '/dashboard',
    badge: 'Storefront',
    desc: 'Browse products, manage cart, track orders with optimistic UI updates.',
    capabilities: ['Product browsing', 'Cart management', 'Order tracking', 'Profile settings'],
  },
  {
    role: 'Vendor',
    icon: Database,
    color: 'amber',
    path: '/vendor',
    badge: 'Management',
    desc: 'Full CRUD over product catalog with image uploads and inventory control.',
    capabilities: ['Product CRUD', 'Image uploads', 'Stock management', 'Sales analytics'],
  },
  {
    role: 'Admin',
    icon: Shield,
    color: 'rose',
    path: '/admin',
    badge: 'Control Center',
    desc: 'Platform-wide analytics, user management, and content moderation.',
    capabilities: ['User management', 'Platform analytics', 'Vendor oversight', 'System health'],
  },
];

const LABS = [
  { name: 'React Query Lab', path: '/labs/react-query', icon: Zap, desc: 'Caching, mutations, invalidation' },
  { name: 'Fetching Story', path: '/labs/useeffect-vs-react-query-story', icon: Sparkles, desc: 'Visual async engineering documentary' },
  { name: 'SSR Demo', path: '/labs/ssr', icon: Server, desc: 'Server Components vs CSR' },
  { name: 'Hooks Lab', path: '/labs/hooks', icon: Settings, desc: 'useMemo, useCallback, custom hooks' },
  { name: 'State Management', path: '/labs/state-management', icon: GitBranch, desc: 'Redux vs Zustand patterns' },
  { name: 'Rendering Sandbox', path: '/labs/rendering', icon: Eye, desc: 'Re-render visualizer' },
  { name: 'Image Optimization', path: '/labs/image-optimization', icon: ImageIcon, desc: 'Next/Image deep dive' },
];

const PERF_METRICS = [
  { label: 'CSR — Standard SPA', value: 2400, max: 2400, color: 'bg-stone-600', textColor: 'text-stone-400', unit: 'ms' },
  { label: 'SSR — React Server Components', value: 120, max: 2400, color: 'bg-emerald-500', textColor: 'text-emerald-400', unit: 'ms', glow: true },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar({ onSignIn }: { onSignIn: () => void }) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/60 shadow-2xl shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Layers className="w-4 h-4 text-stone-950" />
          </div>
          <span className="font-extrabold text-white tracking-tight font-mono text-sm">FE Lab</span>
          <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            v2.0
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {['Features', 'Labs', 'Performance', 'Architecture'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs font-mono text-stone-400 hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-stone-400 hover:text-white transition-colors"
          >
            <GitBranch className="w-4 h-4" />
          </a>
          <Button
            onClick={onSignIn}
            className="h-8 px-4 text-xs font-mono font-bold bg-white text-stone-950 hover:bg-stone-100 rounded-lg"
          >
            Sign In <ArrowRight className="w-3 h-3 ml-1.5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

function TechMarquee() {
  return (
    <div className="relative overflow-hidden py-4 border-y border-stone-800/50 bg-stone-950/40">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-stone-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-stone-950 to-transparent z-10 pointer-events-none" />
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="flex gap-8 whitespace-nowrap"
      >
        {[...TECH_STACK, ...TECH_STACK].map((tech, i) => (
          <span key={i} className="flex items-center gap-2 text-[11px] font-mono text-stone-500">
            <span className="w-1 h-1 rounded-full bg-emerald-500/60" />
            {tech}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon: Icon, label, desc, color, index }: {
  icon: React.ElementType; label: string; desc: string; color: string; index: number;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'border-emerald-500/20 group-hover:border-emerald-500/50 bg-emerald-500/5 text-emerald-400',
    cyan: 'border-cyan-500/20 group-hover:border-cyan-500/50 bg-cyan-500/5 text-cyan-400',
    violet: 'border-violet-500/20 group-hover:border-violet-500/50 bg-violet-500/5 text-violet-400',
  };
  const glowMap: Record<string, string> = {
    emerald: 'group-hover:shadow-emerald-500/10',
    cyan: 'group-hover:shadow-cyan-500/10',
    violet: 'group-hover:shadow-violet-500/10',
  };

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative p-5 rounded-2xl bg-stone-900/40 border border-stone-800 
        hover:border-stone-700 hover:bg-stone-900/70 hover:shadow-xl ${glowMap[color]}
        transition-all duration-300 cursor-default`}
    >
      {/* Gradient top line */}
      <div className={`absolute top-0 left-6 right-6 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500
        ${color === 'emerald' ? 'bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent'
        : color === 'cyan' ? 'bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent'
        : 'bg-gradient-to-r from-transparent via-violet-500/60 to-transparent'}`}
      />

      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-white font-mono mb-1.5">{label}</h3>
      <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function PerfBar({ label, value, max, color, textColor, glow, unit, index }: {
  label: string; value: number; max: number; color: string;
  textColor: string; glow?: boolean; unit: string; index: number;
}) {
  const pct = `${(value / max) * 100}%`;
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-mono text-stone-400">{label}</span>
        <span className={`text-xs font-mono font-bold ${textColor}`}>{value}{unit}</span>
      </div>
      <div className="h-2.5 w-full bg-stone-900 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: pct }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.2 }}
          className={`h-full rounded-full ${color} ${glow ? 'shadow-[0_0_12px_rgba(16,185,129,0.6)]' : ''}`}
        />
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const heroRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-300">

      {/* ── Fixed Mesh Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top-left glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-600/6 blur-[140px]" />
        {/* Bottom-right glow */}
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/5 blur-[140px]" />
        {/* Center subtle */}
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-violet-600/4 blur-[180px]" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <Navbar onSignIn={() => router.push('/login')} />

      {/* ══════════════════ HERO ══════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center items-center pt-24 pb-16 overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">

          {/* Badge */}
          <motion.div
            variants={fadeUp} custom={0} initial="hidden" animate="visible"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-stone-900/80 border border-stone-700/60 backdrop-blur mb-10"
          >
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse [animation-delay:0.4s]" />
            </div>
            <span className="text-[11px] font-mono text-stone-300 tracking-wide">
              Next.js 15 · React 19 · Production Architecture
            </span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp} custom={1} initial="hidden" animate="visible"
            className="text-5xl sm:text-6xl md:text-8xl font-extrabold text-white tracking-tight leading-[0.9] mb-8"
          >
            Frontend
            <br />
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300">
                Engineering
              </span>
              {/* Underline glow */}
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/60 to-cyan-500/0" />
            </span>
            <br />
            <span className="text-stone-500">Mastered.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={fadeUp} custom={2} initial="hidden" animate="visible"
            className="text-base sm:text-lg md:text-xl text-stone-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            An interactive lab platform demonstrating production-level patterns —
            SSR, caching, memoization, role-based auth, and AI-assisted architecture
            — all in one living codebase.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp} custom={3} initial="hidden" animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              onClick={() => router.push('/login')}
              className="h-12 px-8 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold font-mono text-sm w-full sm:w-auto shadow-2xl shadow-emerald-500/25 rounded-xl"
            >
              Enter the Lab <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/labs/ssr')}
              className="h-12 px-8 border-stone-700 text-stone-300 hover:text-white hover:bg-stone-900 font-mono text-sm w-full sm:w-auto rounded-xl"
            >
              <Terminal className="w-4 h-4 mr-2" /> View SSR Demo
            </Button>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            variants={fadeIn} custom={5} initial="hidden" animate="visible"
            className="mt-12 flex items-center justify-center gap-6 flex-wrap"
          >
            {[
              { icon: Code2, label: '15+ Engineering Concepts' },
              { icon: Box, label: '6 Interactive Labs' },
              { icon: Star, label: '3 Role Dashboards' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs font-mono text-stone-500">
                <Icon className="w-3.5 h-3.5 text-stone-600" />
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero terminal mockup */}
        <motion.div
          variants={fadeUp} custom={4} initial="hidden" animate="visible"
          className="relative z-10 mt-16 max-w-3xl w-full mx-auto px-6"
        >
          <div className="relative rounded-2xl border border-stone-800 bg-stone-950/80 backdrop-blur overflow-hidden shadow-2xl shadow-black/40">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-stone-800/80 bg-stone-900/40">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <span className="ml-3 text-[11px] font-mono text-stone-500">src/app/(dashboard)/admin/page.tsx</span>
            </div>
            <div className="p-6 text-xs font-mono leading-relaxed overflow-hidden">
              <div className="space-y-1.5">
                {[
                  { indent: 0, tokens: [{ t: '// ', c: 'text-stone-600' }, { t: 'React Server Component — zero client bundle', c: 'text-stone-600' }] },
                  { indent: 0, tokens: [{ t: 'export default ', c: 'text-violet-400' }, { t: 'async function ', c: 'text-cyan-400' }, { t: 'AdminPage', c: 'text-emerald-400' }, { t: '() {', c: 'text-stone-400' }] },
                  { indent: 1, tokens: [{ t: 'const ', c: 'text-violet-400' }, { t: 'analytics ', c: 'text-stone-200' }, { t: '= ', c: 'text-stone-400' }, { t: 'await ', c: 'text-cyan-400' }, { t: 'fetchAnalytics()', c: 'text-emerald-400' }, { t: ';', c: 'text-stone-400' }] },
                  { indent: 1, tokens: [{ t: 'const ', c: 'text-violet-400' }, { t: 'users ', c: 'text-stone-200' }, { t: '= ', c: 'text-stone-400' }, { t: 'await ', c: 'text-cyan-400' }, { t: 'getUsers({ role: ', c: 'text-stone-300' }, { t: "'ADMIN'", c: 'text-amber-400' }, { t: ' })', c: 'text-stone-300' }, { t: ';', c: 'text-stone-400' }] },
                  { indent: 0, tokens: [] },
                  { indent: 1, tokens: [{ t: 'return ', c: 'text-violet-400' }, { t: '(', c: 'text-stone-400' }] },
                  { indent: 2, tokens: [{ t: '<', c: 'text-stone-500' }, { t: 'AdminDashboard ', c: 'text-emerald-400' }, { t: 'analytics', c: 'text-cyan-300' }, { t: '={analytics} ', c: 'text-stone-400' }, { t: 'users', c: 'text-cyan-300' }, { t: '={users}', c: 'text-stone-400' }, { t: ' />', c: 'text-stone-500' }] },
                  { indent: 1, tokens: [{ t: ')', c: 'text-stone-400' }, { t: ';', c: 'text-stone-500' }] },
                  { indent: 0, tokens: [{ t: '}', c: 'text-stone-400' }] },
                ].map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.07, duration: 0.3 }}
                    className="flex"
                    style={{ paddingLeft: `${line.indent * 20}px` }}
                  >
                    {line.tokens.map((tok, j) => (
                      <span key={j} className={tok.c}>{tok.t}</span>
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <TechMarquee />

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section id="features" className="relative py-28 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 mb-5">
              <Box className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-mono text-stone-400 tracking-wide">Engineering Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Everything a senior dev<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                ships in production.
              </span>
            </h2>
            <p className="text-stone-400 max-w-xl mx-auto text-sm leading-relaxed">
              Every pattern, optimization, and architecture decision is implemented,
              documented, and visualizable inside the lab.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {FEATURES.map((feat, i) => (
              <FeatureCard key={feat.label} {...feat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ PERFORMANCE ══════════════════ */}
      <section id="performance" className="relative py-28 z-10 border-t border-stone-900">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900/20 to-stone-950 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — copy */}
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-mono text-stone-400">Performance First</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                SSR renders in{' '}
                <span className="text-emerald-400 font-mono">120ms.</span>
                <br />CSR takes{' '}
                <span className="text-stone-500 font-mono line-through">2400ms.</span>
              </h2>
              <p className="text-stone-400 text-sm leading-relaxed">
                React Server Components eliminate the client JS waterfall entirely.
                Data is fetched on the server, HTML is streamed to the browser — no loading spinners.
              </p>

              <div className="space-y-3">
                {[
                  'Zero client-side JS for server-rendered content',
                  'Instant TTFB with edge streaming',
                  'useMemo & useCallback preventing re-render cascades',
                  'Dynamic imports splitting route bundles',
                  'Next/Image converting to WebP with lazy loading',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-stone-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — visual perf card */}
            <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div className="rounded-2xl border border-stone-800 bg-stone-950/80 backdrop-blur p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest">Render Latency</h3>
                  <span className="text-[10px] font-mono text-stone-600 bg-stone-900 px-2 py-1 rounded border border-stone-800">
                    measured · p95
                  </span>
                </div>

                <div className="space-y-6">
                  {PERF_METRICS.map((m, i) => (
                    <PerfBar key={m.label} {...m} index={i} />
                  ))}
                </div>

                {/* Speedup badge */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-xs font-mono text-stone-400">Performance improvement</span>
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', delay: 0.6 }}
                    className="text-2xl font-extrabold font-mono text-emerald-400"
                  >
                    20x
                  </motion.span>
                </div>

                {/* Optimization chips */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'useMemo', desc: 'Filtered lists' },
                    { label: 'useCallback', desc: 'Stable handlers' },
                    { label: 'React.memo', desc: 'Child bailout' },
                    { label: 'Lazy import', desc: 'Code splitting' },
                  ].map(({ label, desc }) => (
                    <div key={label} className="p-3 rounded-lg bg-stone-900/60 border border-stone-800">
                      <p className="text-[11px] font-mono font-bold text-cyan-400">{label}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════ ARCHITECTURE / ROLES ══════════════════ */}
      <section id="architecture" className="relative py-28 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 mb-5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-mono text-stone-400">Role-Based Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Three dashboards.<br />
              <span className="text-stone-500">One codebase.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLES.map((role, i) => {
              const colorMap: Record<string, { border: string; badge: string; icon: string; cta: string; dot: string }> = {
                emerald: {
                  border: 'hover:border-emerald-500/40',
                  badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  icon: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                  cta: 'hover:text-emerald-400 hover:border-emerald-500/30',
                  dot: 'bg-emerald-500',
                },
                amber: {
                  border: 'hover:border-amber-500/40',
                  badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                  icon: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                  cta: 'hover:text-amber-400 hover:border-amber-500/30',
                  dot: 'bg-amber-500',
                },
                rose: {
                  border: 'hover:border-rose-500/40',
                  badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                  icon: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
                  cta: 'hover:text-rose-400 hover:border-rose-500/30',
                  dot: 'bg-rose-500',
                },
              };
              const c = colorMap[role.color];

              return (
                <motion.div
                  key={role.role}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className={`group relative flex flex-col p-6 rounded-2xl bg-stone-900/40 border border-stone-800 ${c.border} transition-all duration-300`}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${c.icon}`}>
                      <role.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${c.badge}`}>
                      {role.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-mono mb-2">{role.role} Dashboard</h3>
                  <p className="text-xs text-stone-400 leading-relaxed mb-5">{role.desc}</p>

                  <div className="space-y-2 flex-1">
                    {role.capabilities.map((cap) => (
                      <div key={cap} className="flex items-center gap-2 text-xs text-stone-400">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
                        {cap}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => router.push('/login')}
                    className={`mt-6 flex items-center gap-1.5 text-xs font-mono text-stone-500 border-b border-transparent pb-0.5 transition-all w-fit ${c.cta}`}
                  >
                    View Dashboard <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ LABS GRID ══════════════════ */}
      <section id="labs" className="relative py-28 z-10 border-t border-stone-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 mb-5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-mono text-stone-400">Interactive Labs</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Learn by doing,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                not by reading docs.
              </span>
            </h2>
            <p className="text-stone-400 max-w-lg mx-auto text-sm">
              Each lab is a live, interactive demonstration with code viewer, concept explanation,
              and performance metrics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LABS.map((lab, i) => (
              <motion.button
                key={lab.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                onClick={() => router.push('/login')}
                className="group text-left p-5 rounded-2xl bg-stone-900/40 border border-stone-800 hover:border-emerald-500/30 hover:bg-stone-900/70 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <lab.icon className="w-4.5 h-4.5 text-emerald-400" />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-600 group-hover:text-stone-400 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-white font-mono mb-1">{lab.name}</h3>
                <p className="text-xs text-stone-500">{lab.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA BANNER ══════════════════ */}
      <section className="relative py-28 z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="relative rounded-3xl border border-stone-800 bg-stone-900/40 backdrop-blur p-12 overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-mono text-emerald-400">Ready to explore?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                Sign in and start building.
              </h2>
              <p className="text-stone-400 mb-8 text-sm max-w-md mx-auto">
                Use the quick-dev presets on the login page — no real credentials needed.
                Admin, Vendor, and User roles ready to go.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => router.push('/login')}
                  className="h-12 px-10 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold font-mono text-sm rounded-xl shadow-2xl shadow-emerald-500/20"
                >
                  Open the Lab <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/signup')}
                  className="h-12 px-8 text-stone-400 hover:text-white font-mono text-sm"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-stone-900 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-mono text-sm font-bold text-stone-400">FE Lab</span>
            <span className="text-stone-700 text-xs font-mono">· Frontend Engineering Lab</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-stone-600">
            <span>Next.js 15</span>
            <span>·</span>
            <span>React 19</span>
            <span>·</span>
            <span>Built for observability</span>
          </div>
          <p className="text-[11px] font-mono text-stone-700">
            © 2025 FE Lab. Educational use.
          </p>
        </div>
      </footer>

    </div>
  );
}