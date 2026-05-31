'use client';

import * as React from 'react';
import { LabLayout } from '@/components/labs/lab-layout';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui/primitives';
import { Button } from '@/components/ui/primitives';
import { useObservabilityStore } from '@/store/observability.store';
import { Image as ImageIcon, Zap, FileImage } from 'lucide-react';

// ─── demo images (Unsplash) ───────────────────────────────────────────────────
const DEMO_IMAGES = [
  {
    label: 'Dashboard Analytics',
    base: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
  },
  {
    label: 'Code Editor',
    base: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871',
  },
  {
    label: 'Performance Monitor',
    base: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
  },
];

type Format = 'raw' | 'medium' | 'optimized';
type Mode = { label: string; params: string; badge: string; color: string };

const MODES: Record<Format, Mode> = {
  raw:       { label: 'No Optimization',  params: 'w=1200&q=100&fm=jpg', badge: 'raw JPEG',        color: 'text-red-400' },
  medium:    { label: 'Medium Quality',   params: 'w=800&q=70&fm=jpg',   badge: 'JPEG q=70',       color: 'text-amber-400' },
  optimized: { label: 'Fully Optimized',  params: 'w=480&q=60&fm=webp',  badge: 'WebP q=60 480px', color: 'text-emerald-400' },
};

// Rough file size estimates for the UI (illustrative)
const SIZE_ESTIMATES: Record<Format, string> = {
  raw: '~850 KB',
  medium: '~180 KB',
  optimized: '~42 KB',
};

const LOAD_ESTIMATES: Record<Format, string> = {
  raw: '~3.4 s (3G)',
  medium: '~0.7 s (3G)',
  optimized: '~0.17 s (3G)',
};

// ─── single image comparison card ─────────────────────────────────────────────
function ImageCard({ img, format }: { img: typeof DEMO_IMAGES[0]; format: Format }) {
  const mode = MODES[format];
  const url = `${img.base}?${mode.params}&auto=format&fit=crop`;
  const [loaded, setLoaded] = React.useState(false);
  const [loadMs, setLoadMs] = React.useState<number | null>(null);

  React.useEffect(() => {
    setLoaded(false);
    setLoadMs(null);
    const start = performance.now();
    const i = new window.Image();
    i.onload = () => {
      setLoaded(true);
      setLoadMs(Math.round(performance.now() - start));
    };
    i.src = url;
  }, [url]);

  return (
    <Card className="bg-stone-950/40 border-stone-800 overflow-hidden">
      <div className="relative h-40 bg-stone-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={img.label}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-stone-600 animate-pulse">
            <FileImage className="w-8 h-8" />
          </div>
        )}
      </div>
      <CardContent className="p-3 space-y-1">
        <div className="text-xs font-semibold text-stone-200">{img.label}</div>
        <div className={`text-[10px] font-mono ${mode.color}`}>{mode.badge}</div>
        {loadMs !== null && (
          <div className="text-[10px] font-mono text-stone-500">⚡ loaded in {loadMs} ms</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ImageOptimizationLab() {
  const { imageMode, setImageMode, addLog } = useObservabilityStore();
  const [selectedFormat, setSelectedFormat] = React.useState<Format>(imageMode as Format ?? 'optimized');

  const handleFormat = (f: Format) => {
    setSelectedFormat(f);
    setImageMode(f);
    const start = performance.now();
    addLog('ImageOptimizationLab', Math.round(performance.now() - start), `Format changed → ${f}`);
  };

  // ── demo ───────────────────────────────────────────────────────────────────
  const demo = (
    <div className="space-y-4">
      {/* Format picker */}
      <Card className="bg-stone-950/40 border-stone-800 p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(MODES) as Format[]).map((f) => (
            <Button
              key={f}
              variant={selectedFormat === f ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleFormat(f)}
            >
              {MODES[f].label}
            </Button>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-1">
          {[
            { label: 'Est. Size', value: SIZE_ESTIMATES[selectedFormat] },
            { label: '3G Load Time', value: LOAD_ESTIMATES[selectedFormat] },
            { label: 'Format', value: MODES[selectedFormat].badge },
          ].map(({ label, value }) => (
            <div key={label} className="bg-stone-900/50 rounded-lg p-3">
              <div className="text-[10px] text-stone-500 font-mono uppercase">{label}</div>
              <div className={`text-sm font-bold font-mono mt-0.5 ${MODES[selectedFormat].color}`}>{value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Image grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEMO_IMAGES.map((img) => (
          <ImageCard key={img.base} img={img} format={selectedFormat} />
        ))}
      </div>
    </div>
  );

  const concepts = (
    <div className="space-y-4 text-stone-300 text-sm leading-relaxed">
      <h2 className="text-xl font-semibold text-emerald-400">Image Optimization in Next.js</h2>
      <p>
        The <code className="bg-stone-900 px-1 rounded">next/image</code> component automatically serves images in WebP or AVIF
        (browser-dependent), resizes to the device viewport, and lazy-loads by default.
      </p>
      <h3 className="text-white font-semibold">Key Parameters</h3>
      <ul className="list-disc list-inside space-y-1">
        <li><strong className="text-white">width/height</strong> — prevents layout shift (CLS ≈ 0).</li>
        <li><strong className="text-white">quality</strong> — 60–75 is imperceptible to the eye but halves file size.</li>
        <li><strong className="text-white">format</strong> — WebP is ~30 % smaller than JPEG; AVIF ~50 % smaller.</li>
        <li><strong className="text-white">priority</strong> — removes lazy-load for above-the-fold hero images, improving LCP.</li>
      </ul>
    </div>
  );

  const interactive = (
    <div className="space-y-3 text-stone-300 text-sm">
      <p>1. Switch between <strong className="text-white">No Optimization → Medium → Fully Optimized</strong> and compare load times.</p>
      <p>2. Open Chrome DevTools → Network → Img to confirm actual file sizes.</p>
      <p>3. Throttle to <strong className="text-white">Slow 3G</strong> in DevTools to feel the real-world latency difference.</p>
    </div>
  );

  const codeFiles = [
    {
      path: 'src/app/labs/image-optimization/page.tsx',
      language: 'tsx',
      code: `// next/image usage (production)
import Image from 'next/image';

<Image
  src="/photo.jpg"
  alt="Dashboard"
  width={480}
  height={300}
  quality={60}
  // served as WebP automatically
/>

// For external URLs, configure remotePatterns in next.config.ts:
// images: { remotePatterns: [{ hostname: 'images.unsplash.com' }] }`,
    },
  ];

  const performanceMetrics = (
    <div className="space-y-3 text-stone-300 text-sm">
      {[
        ['Raw JPEG (1200px, q=100)', '~850 KB', 'text-red-400'],
        ['JPEG (800px, q=70)',        '~180 KB', 'text-amber-400'],
        ['WebP (480px, q=60)',        '~42 KB',  'text-emerald-400'],
        ['Size reduction vs raw',     '~95 %',   'text-emerald-400'],
      ].map(([label, value, color]) => (
        <div key={label} className="flex justify-between border-b border-stone-900 pb-2">
          <span>{label}</span>
          <span className={`font-mono ${color}`}>{value}</span>
        </div>
      ))}
    </div>
  );

  const benefits = (
    <div className="space-y-2 text-stone-300 text-sm leading-relaxed">
      <p>✅ Automatic format negotiation — no manual WebP conversion pipeline.</p>
      <p>✅ Responsive sizes prevent downloading oversized images on mobile.</p>
      <p>✅ Lazy loading by default — images below the fold don't block load.</p>
      <p>✅ CLS = 0 when width/height props are provided.</p>
    </div>
  );

  const architecture = (
    <pre className="bg-stone-950 p-4 rounded-lg overflow-x-auto text-emerald-400 text-xs font-mono leading-relaxed">
{`next/image (production)
├── Request /photo.jpg?w=480&q=60
├── Next.js Image Optimizer (sharp)
│   ├── Resize to 480px
│   ├── Convert to WebP/AVIF (browser Accept header)
│   └── Cache in .next/cache/images/
└── Serve ~42 KB instead of ~850 KB

Lab simulation:
├── Unsplash URL params (?w=480&q=60&fm=webp)
├── Image.onload timer → load ms
└── ObservabilityStore.addLog(format change)`}
    </pre>
  );

  return (
    <LabLayout
      title="Image Optimization Lab"
      description="Compare raw vs optimized images and see real-world load time differences with WebP/format switching."
      optimizationScore={92}
      demo={demo}
      concepts={concepts}
      interactive={interactive}
      codeFiles={codeFiles}
      aiContext={{ moduleName: 'Image Optimization Lab', extraContext: 'Focus on WebP/AVIF, quality, lazy loading, and CLS.' }}
      performanceMetrics={performanceMetrics}
      benefits={benefits}
      architecture={architecture}
    />
  );
}
