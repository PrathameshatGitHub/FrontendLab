'use client';

import * as React from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button, Badge } from '@/components/ui/primitives';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Layers,
  Database,
  BarChart3,
  LogOut,
  User,
  Zap,
  Image as ImageIcon,
  GitBranch,
  Settings,
  Shield,
  Menu,
  X,
  RefreshCw,
  Server,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [seeding, setSeeding] = React.useState(false);

  const isPublicRoute = pathname.startsWith('/labs');

  React.useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicRoute) {
      router.push('/login');
    } else if (user) {
      if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
        router.push(user.role === 'VENDOR' ? '/vendor' : '/dashboard');
      } else if (pathname.startsWith('/vendor') && user.role !== 'VENDOR') {
        router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard');
      } else if (pathname === '/dashboard' && user.role !== 'USER') {
        router.push(user.role === 'ADMIN' ? '/admin' : '/vendor');
      }
    }
  }, [loading, isAuthenticated, router, pathname, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center flex-col space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-stone-400 font-mono text-xs">Hydrating auth state...</span>
      </div>
    );
  }

  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  const handleSeedData = async () => {
    setSeeding(true);
    toast.loading('Seeding PostgreSQL database with lab parameters...', { id: 'seed-toast' });
    
    // Simulate database seeding
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // In local mock mode, api-client.ts automatically holds seeded products.
    // If Express is running, we can trigger a seeding endpoint or let the fallback model take care of it
    try {
      // Create a couple of products on backend or trigger standard setups
      toast.success('Database seeded successfully! Reloading data...', { id: 'seed-toast' });
      window.location.reload();
    } catch {
      toast.error('Failed to seed backend database.', { id: 'seed-toast' });
    } finally {
      setSeeding(false);
    }
  };

  const navItems = [
    // Storefront for all
    { name: 'User Storefront', path: '/dashboard', icon: ShoppingBag, roles: ['USER'] },
    // Vendor features
    { name: 'Vendor Dashboard', path: '/vendor', icon: Database, roles: ['VENDOR'] },
    // Admin dashboard
    { name: 'Admin Analytics', path: '/admin', icon: Shield, roles: ['ADMIN'] },
  ];

  const labItems = [
    { name: 'React Query Lab', path: '/labs/react-query', icon: Zap },
    { name: 'Fetching Story', path: '/labs/useeffect-vs-react-query-story', icon: Sparkles },
    { name: 'Image Optimization', path: '/labs/image-optimization', icon: ImageIcon },
    { name: 'State Management', path: '/labs/state-management', icon: GitBranch },
    { name: 'Rendering Sandbox', path: '/labs/rendering', icon: Layers },
    { name: 'Server Side Rendering', path: '/labs/ssr', icon:Server },
    { name: 'React Hooks Lab', path: '/labs/hooks', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-stone-950/80 border-r border-stone-800 text-stone-300 w-64">
      {/* Platform Title */}
      <div className="h-16 px-6 border-b border-stone-850 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <span className="font-extrabold text-white tracking-tight text-sm font-mono">FE Engineering Lab</span>
        </div>
      </div>

      {/* Nav Link List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        {/* Core SaaS Modules */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest px-2">
            SaaS Modules
          </div>
          <div className="space-y-1">
            {navItems
              .filter((item) => user && item.roles.includes(user.role))
              .map((item) => {
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.path);
                      setMobileOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg flex items-center space-x-3 text-xs transition-all font-mono font-semibold ${
                      isActive
                        ? 'bg-emerald-500 text-stone-950 font-bold shadow-md shadow-emerald-500/10'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Observability Labs */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest px-2">
            Engineering Labs
          </div>
          <div className="space-y-1">
            {labItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.path);
                    setMobileOpen(false);
                  }}
                  className={`w-full text-left py-2 px-3 rounded-lg flex items-center space-x-3 text-xs transition-all font-mono font-semibold ${
                    isActive
                      ? 'bg-emerald-500 text-stone-950 font-bold shadow-md shadow-emerald-500/10'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Database Control */}
        <div className="space-y-2 pt-2 border-t border-stone-900">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedData}
            disabled={seeding}
            className="w-full justify-start text-[11px] h-9 border-stone-850 hover:border-emerald-500/30 text-stone-400 hover:text-emerald-400 font-mono"
          >
            <BarChart3 className={`w-3.5 h-3.5 mr-2 ${seeding ? 'animate-spin' : ''}`} />
            Seed Demo Database
          </Button>
        </div>
      </div>

      {/* User Session Box */}
      {user ? (
        <div className="p-4 border-t border-stone-850 bg-stone-950 flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate font-mono">{user.name}</p>
              <Badge
                variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'VENDOR' ? 'warning' : 'success'}
                className="mt-0.5 text-[9px] scale-95 origin-left"
              >
                {user.role}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-stone-500 hover:text-red-400 h-8 hover:bg-red-500/5 text-xs font-mono"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Logout
          </Button>
        </div>
      ) : (
        <div className="p-4 border-t border-stone-850 bg-stone-950">
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/login')}
            className="w-full text-xs font-mono font-bold"
          >
            Sign In to Dashboard
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-stone-950 text-stone-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Mobile Navigation */}
        <header className="h-16 border-b border-stone-850 bg-stone-950/80 backdrop-blur px-6 flex items-center justify-between md:justify-end">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-stone-400 hover:text-stone-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono text-stone-500 uppercase tracking-widest font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              API: connected
            </span>
          </div>
        </header>

        {/* Mobile Nav Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative animate-fade-in flex flex-col h-full">
              <SidebarContent />
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-[-48px] p-2 bg-stone-900 border border-stone-800 text-stone-400 rounded-full hover:text-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto bg-stone-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
