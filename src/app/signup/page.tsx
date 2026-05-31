'use client';

import * as React from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button, Input, Card, CardContent, Label, Select } from '@/components/ui/primitives';
import { Layers, Mail, Lock, User, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Role } from '@/types';

export default function SignupPage() {
  const { signup, loading } = useAuth();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<Role>('USER');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    try {
      await signup(email, password, name, role);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center space-x-2 text-white">
          <Layers className="w-8 h-8 text-emerald-400" />
          <span className="font-extrabold text-2xl tracking-tight font-mono">FE Lab</span>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
          Create developer account
        </h2>
        <p className="mt-2 text-center text-xs text-stone-400">
          Or{' '}
          <Link href="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <Card className="bg-stone-900/40 border-stone-850 backdrop-blur-md">
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
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
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="role">Platform Role</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-stone-500 z-10" />
                  <Select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="pl-10"
                  >
                    <option value="USER" className="bg-stone-900 text-stone-200">User Storefront (USER)</option>
                    <option value="VENDOR" className="bg-stone-900 text-stone-200">Product Manager (VENDOR)</option>
                    <option value="ADMIN" className="bg-stone-900 text-stone-200">System Inspector (ADMIN)</option>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-2 font-mono">
                {loading ? 'Creating account...' : 'Create Account'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
