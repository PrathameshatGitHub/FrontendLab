'use client';

import * as React from 'react';
import { useAiExplainer } from '@/hooks/use-ai-explainer';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui/primitives';
import { Sparkles, Send, RefreshCw, Cpu } from 'lucide-react';
import OpenAI from 'openai';

interface AiPanelProps {
  moduleName: string;
  extraContext?: string;
}

export function AiPanel({ moduleName, extraContext }: AiPanelProps) {
  const { loading, explanation, explain } = useAiExplainer();
  const [customPrompt, setCustomPrompt] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  
  // Fixed: Removed the space in the API key
  const client = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
    dangerouslyAllowBrowser: true,
  });

  // Load initial explanation on mount
  React.useEffect(() => {
    explain(moduleName, extraContext);
  }, [moduleName, extraContext, explain]);

  // Set initial explanation once loaded
  React.useEffect(() => {
    if (explanation) {
      setMessages([{ role: 'assistant', text: explanation }]);
    }
  }, [explanation]);

  // Scroll to bottom on new messages
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const isBusy = loading || isSubmitting;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || isBusy) return;

    const userMsg = customPrompt.trim();
    setCustomPrompt('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsSubmitting(true);

    try {
      // Fixed: Using correct model name for Groq
      const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // This works with Groq
        messages: [
          {
            role: 'system',
            content: `
You are an expert Frontend Architect explaining a Next.js 15 & React 19 app.
Focus on:
- clean architecture
- performance
- scalability
- production best practices
- React patterns
            `,
          },
          {
            role: 'user',
            content: `
Module: "${moduleName}"

Context: "${extraContext || 'General'}"

Question:
${userMsg}
            `,
          },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      });

      const responseText =
        completion.choices?.[0]?.message?.content ||
        'No explanation generated.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: responseText,
        },
      ]);
    } catch (err: any) {
      console.error('API Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Error: ${err.message || 'Unknown error'}. Please check your API key and model name.`,
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-stone-800 bg-stone-900/30 overflow-hidden flex flex-col h-[600px]">
      <CardHeader className="border-b border-stone-800/50 bg-stone-950/20 py-4 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            Groq AI Explainer{' '}
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
              llama-3.3-70b
            </span>
          </CardTitle>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => explain(moduleName, extraContext)} 
          disabled={isBusy} 
          className="h-8"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isBusy ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 font-sans leading-relaxed text-sm text-stone-300">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl p-4 border ${
                msg.role === 'user'
                  ? 'bg-emerald-950/20 border-emerald-500/20 text-stone-200'
                  : 'bg-stone-950/30 border-stone-800 text-stone-300'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] uppercase tracking-wider mb-2">
                  <Cpu className="w-3.5 h-3.5" />
                  AI Architect
                </div>
              )}
              {msg.role === 'user' && (
                <div className="text-stone-400 font-mono text-[10px] uppercase tracking-wider mb-2 text-right">
                  Developer
                </div>
              )}
              <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-1">
                {msg.text.split('\n').map((line, i) => {
                  if (line.startsWith('### ')) return <h4 key={i} className="text-sm font-bold text-white mt-3 mb-1">{line.slice(4)}</h4>;
                  if (line.startsWith('#### ')) return <h5 key={i} className="text-xs font-semibold text-emerald-400 mt-2">{line.slice(5)}</h5>;
                  if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-stone-300">{line.slice(2)}</li>;
                  if (/^\d+\. /.test(line)) return <li key={i} className="ml-4 list-decimal text-stone-300">{line.replace(/^\d+\. /, '')}</li>;
                  if (line.startsWith('```')) return null;
                  if (!line.trim()) return <br key={i} />;
                  return <p key={i} className="text-stone-300 leading-relaxed">{line}</p>;
                })}
              </div>
            </div>
          </div>
        ))}
        {isBusy && (
          <div className="flex justify-start">
            <div className="bg-stone-950/30 border border-stone-800 rounded-xl p-4 max-w-[85%] w-full space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] uppercase tracking-wider mb-2">
                <Cpu className="w-3.5 h-3.5 animate-pulse" />
                Thinking...
              </div>
              <div className="h-4 bg-stone-800 rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-stone-800 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-stone-800 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </CardContent>

      <form onSubmit={handleSend} className="p-4 border-t border-stone-800 bg-stone-950/40 flex items-center space-x-2">
        <Input
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="flex-1 bg-stone-900 border-stone-800 text-stone-200"
          disabled={isBusy}
        />
        <Button 
          type="submit" 
          disabled={isBusy || !customPrompt.trim()} 
          className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
}