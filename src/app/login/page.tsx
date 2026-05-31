'use client';

import * as React from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Label, Badge } from '@/components/ui/primitives';
import { Layers, Mail, Lock, Shield, User, Database, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login(email, password);
    } catch {}
  };

  // Quick-login presets for developer convenience
  const handleQuickLogin = (role: 'ADMIN' | 'VENDOR' | 'USER') => {
    if (role === 'ADMIN') {
      setEmail('admin@felab.dev');
      setPassword('admin123');
    } else if (role === 'VENDOR') {
      setEmail('vendor@felab.dev');
      setPassword('vendor123');
    } else {
      setEmail('user@felab.dev');
      setPassword('user123');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center space-x-2 text-white">
          <Layers className="w-8 h-8 text-emerald-400" />
          <span className="font-extrabold text-2xl tracking-tight font-mono">FE Lab</span>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs text-stone-400">
          Or{' '}
          <Link href="/signup" className="font-medium text-emerald-400 hover:text-emerald-300">
            create a new developer account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <Card className="bg-stone-900/40 border-stone-850 backdrop-blur-md">
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-2 font-mono">
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Quick Developer Access Panel */}
            <div className="mt-6 pt-6 border-t border-stone-800/60">
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block mb-3 text-center">
                Quick Dev Presets (Autofills Mock Credentials)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('USER')}
                  className="h-9 px-1 text-[10px] font-mono text-stone-400 hover:text-emerald-400 hover:border-emerald-500/30 flex flex-col justify-center items-center py-1 gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>User</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('VENDOR')}
                  className="h-9 px-1 text-[10px] font-mono text-stone-400 hover:text-amber-400 hover:border-amber-500/30 flex flex-col justify-center items-center py-1 gap-1"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Vendor</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('ADMIN')}
                  className="h-9 px-1 text-[10px] font-mono text-stone-400 hover:text-red-400 hover:border-red-500/30 flex flex-col justify-center items-center py-1 gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
