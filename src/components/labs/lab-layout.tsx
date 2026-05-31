'use client';

import * as React from 'react';
import { useObservabilityStore, RenderLog } from '@/store/observability.store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@/components/ui/primitives';
import { CodeViewer } from '@/components/shared/code-viewer';
import dynamic from 'next/dynamic';

const AiPanel = dynamic(() => import('@/components/ai/ai-panel').then(mod => ({ default: mod.AiPanel })), {
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-stone-900/30 border border-stone-800 rounded-xl animate-pulse">
      <span className="text-stone-500 font-mono text-sm">Loading AI Explainer (Lazy Loaded)...</span>
    </div>
  ),
});
import { Terminal, Trash2, Gauge, CheckCircle, Zap } from 'lucide-react';

interface LabLayoutProps {
  title: string;
  description: string;
  optimizationScore?: number;
  // Tab contents
  demo: React.ReactNode;
  concepts: React.ReactNode;
  interactive: React.ReactNode;
  codeFiles: Array<{ path: string; code: string; language?: string }>;
  aiContext: { moduleName: string; extraContext?: string };
  performanceMetrics: React.ReactNode;
  benefits: React.ReactNode;
  architecture: React.ReactNode;
}

export function LabLayout({
  title,
  description,
  optimizationScore = 80,
  demo,
  concepts,
  interactive,
  codeFiles,
  aiContext,
  performanceMetrics,
  benefits,
  architecture
}: LabLayoutProps) {
  const [activeTab, setActiveTab] = React.useState<'demo' | 'concepts' | 'interactive' | 'code' | 'ai' | 'performance' | 'benefits' | 'architecture'>('demo');
  const logs = useObservabilityStore((s) => s.logs);
  const globalRenders = useObservabilityStore((s) => s.globalRenders);
  const clearLogs = useObservabilityStore((s) => s.clearLogs);

  const tabs: Array<{ id: typeof activeTab; label: string }> = [
    { id: 'demo', label: 'Demo' },
    { id: 'concepts', label: 'Concepts' },
    { id: 'interactive', label: 'Interactive' },
    { id: 'code', label: 'Code' },
    { id: 'ai', label: 'AI Explain' },
    { id: 'performance', label: 'Performance' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'architecture', label: 'Architecture' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Top Banner with Title, Description, and Optimization Score */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-800/80">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            {title}
            <Badge variant="info" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Lab Module
            </Badge>
          </h1>
          <p className="mt-2 text-stone-400 max-w-2xl text-sm leading-relaxed">{description}</p>


        </div>

        {/* Optimization Gauge Widget */}
        <Card className="bg-stone-950/40 border-emerald-500/20 backdrop-blur shadow-emerald-500/5 min-w-[200px] flex items-center p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" className="stroke-stone-800" strokeWidth="6" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  className="stroke-emerald-500 transition-all duration-500"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - optimizationScore / 100)}
                />
              </svg>
              <span className="absolute text-sm font-mono font-bold text-white">{optimizationScore}%</span>
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-semibold flex items-center gap-1">
                <Gauge className="w-3 h-3" />
                Efficiency  
              </div>
              <div className="text-xs text-stone-400 mt-0.5">Optimization Score</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-stone-800 bg-stone-900/10 p-1 rounded-xl flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button        
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500 text-stone-950 font-bold shadow-md shadow-emerald-500/10'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Left is active Tab Content, Right is Observability Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side Tab Content Panel */}
        <div className="lg:col-span-3 min-h-[500px]">
          {activeTab === 'demo' && <div className="space-y-4">{demo}</div>}
          {activeTab === 'concepts' && (
            <Card className="p-6 prose prose-invert max-w-none text-stone-300 leading-relaxed text-sm space-y-4 border-stone-850">
              {concepts}
            </Card>
          )}
          {activeTab === 'interactive' && <div className="space-y-4">{interactive}</div>}
          {activeTab === 'code' && <CodeViewer files={codeFiles} />}
          {activeTab === 'ai' && <AiPanel moduleName={aiContext.moduleName} extraContext={aiContext.extraContext} />}
          {activeTab === 'performance' && <div className="space-y-4">{performanceMetrics}</div>}
          {activeTab === 'benefits' && (
            <Card className="p-6 border-stone-800 text-stone-300 leading-relaxed text-sm space-y-4">
              {benefits}
            </Card>
          )}
          {activeTab === 'architecture' && (
            <Card className="p-6 border-stone-800 text-stone-300">
              {architecture}
            </Card>
          )}
        </div>

        {/* Right Side Live Observability Terminal */}
        <Card className="border-stone-800 bg-stone-950/80 backdrop-blur-md h-[600px] flex flex-col sticky top-6">
          <CardHeader className="py-3.5 border-b border-stone-800 bg-stone-950/30 flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
              <CardTitle className="text-xs font-mono font-bold tracking-wider text-stone-300">
                OBSERVABILITY CONSOLE
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                renders: {globalRenders}
              </span>
              <Button variant="ghost" size="icon" onClick={clearLogs} className="h-7 w-7 text-stone-500 hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>



            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] leading-relaxed">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-stone-600 text-center space-y-2">
                <Zap className="w-5 h-5 opacity-40 text-stone-500" />
                <span>Console active. Trigger action in Demo/Interactive to capture rerenders...</span>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 border-l border-emerald-500/40 bg-emerald-500/5 rounded-r border border-stone-900 flex flex-col space-y-0.5 animation-fade-in"
                >
                  <div className="flex justify-between items-center text-stone-400">
                    <span className="text-emerald-400 font-bold">{log.componentName}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="flex justify-between text-stone-300">
                    <span className="text-stone-500">{log.reason}</span>
                    <span className="font-bold text-emerald-400">{log.renderTime} ms</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>



        </Card>
      </div>
    </div>
  );
}
