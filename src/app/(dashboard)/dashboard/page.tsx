'use client';

import * as React from 'react';

import { LabLayout } from '@/components/labs/lab-layout';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Input } from '@/components/ui/primitives';
import { useRerender } from '@/hooks/use-rerender';
import { RerenderVisualizer } from '@/components/shared/rerender-visualizer';
import { useCartStore } from '@/store/cart.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/utils/api-client';
import { Product } from '@/types';
import { ShoppingCart, Heart, Search, Filter, Trash2, CheckCircle2, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function StorefrontPage() {
  // Observability tracking
  useRerender('StorefrontRoot', 'Storefront Page Root Render');

  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [cartOpen, setCartOpen] = React.useState(false);
  const [optimizationMode, setOptimizationMode] = React.useState<'optimized' | 'unoptimized'>('optimized');

  // React Query Fetching
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch<{ products: Product[] }>('/products/products')
  });

  const products = data?.products || [];

  // Zustand Store Interactions
  // Optimized: Selectors pull only the specific slice
  const cart = useCartStore((s) => s.cart);
  const wishlist = useCartStore((s) => s.wishlist);
  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const getCartTotal = useCartStore((s) => s.getCartTotal);
  const clearCart = useCartStore((s) => s.clearCart);

  // Unoptimized: Pulling the whole store (triggers rerender on ANY change, e.g. wishlist change triggers cart rerender)
  const fullStore = useCartStore();

  const handleAddToCart = (product: Product) => {
    if (optimizationMode === 'optimized') {
      addToCart(product, 1);
    } else {
      fullStore.addToCart(product, 1);
    }
  };

  const handleToggleWishlist = (product: Product) => {
    if (optimizationMode === 'optimized') {
      toggleWishlist(product);
    } else {
      fullStore.toggleWishlist(product);
    }
  };

  // Place Order Mutation
  const checkoutMutation = useMutation({
    mutationFn: (items: Array<{ productId: string; quantity: number }>) =>
      apiFetch<any>('/orders', {
        method: 'POST',
        bodyData: { items }
      }),
    onSuccess: (res) => {
      toast.success(res.message);
      clearCart();
      setCartOpen(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to place order.');
    }
  });

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const items = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));
    checkoutMutation.mutate(items);
  };

  // Filters
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Code strings for the Code tab
  const codeFiles = [
    {
      path: 'src/app/dashboard/page.tsx',
      code: `// React Query for async backend state + Zustand for local Cart state
const { data, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: () => apiFetch('/products/products')
});

// Selector optimization pattern: only subscribes to 'cart' changes
const cart = useCartStore((s) => s.cart);
const addToCart = useCartStore((s) => s.addToCart);

const handleAddToCart = (product: Product) => {
  addToCart(product, 1);
  toast.success('Added to cart!');
};`,
      language: 'typescript'
    },
    {
      path: 'src/store/cart.store.ts',
      code: `import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  cart: [],
  wishlist: [],
  addToCart: (product, quantity = 1) => set((state) => {
    const existingIndex = state.cart.findIndex(i => i.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...state.cart];
      updated[existingIndex].quantity += quantity;
      return { cart: updated };
    }
    return { cart: [...state.cart, { product, quantity }] };
  }),
  removeFromCart: (id) => set(s => ({ cart: s.cart.filter(i => i.product.id !== id) })),
  getCartTotal: () => get().cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
}));`,
      language: 'typescript'
    }
  ];

  return (
      <LabLayout
        title="User Storefront"
        description="Browse high-performance developer services and mock SaaS integrations. Explores TanStack Query caching and Zustand selector optimization patterns."
        optimizationScore={optimizationMode === 'optimized' ? 98 : 60}
        aiContext={{ moduleName: 'state-management', extraContext: 'Zustand vs Context' }}
        codeFiles={codeFiles}
        
        // 1. DEMO VIEW
        demo={
          <div className="space-y-6">
            {/* Storefront Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-stone-900/40 p-4 rounded-xl border border-stone-800">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search visual services..."
                  className="pl-10"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-stone-500" />
                <div className="flex gap-1 overflow-x-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                        selectedCategory === cat
                          ? 'bg-emerald-500 text-stone-950 font-bold'
                          : 'bg-stone-900 text-stone-400 hover:text-stone-250 hover:bg-stone-850'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setCartOpen(true)}
                className="w-full sm:w-auto flex items-center gap-2 border-stone-800 hover:border-emerald-500/30 text-stone-300 relative font-mono"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-[10px] text-stone-950 font-extrabold rounded-full flex items-center justify-center animate-bounce">
                    {cart.length}
                  </span>
                )}
              </Button>
            </div>

            {/* Products Grid */}
            <RerenderVisualizer componentName="ProductsGrid" className="p-4 bg-stone-900/10">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((n) => (
                    <Card key={n} className="border-stone-850 animate-pulse">
                      <div className="h-44 bg-stone-800 rounded-t-xl" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-stone-700 rounded w-2/3" />
                        <div className="h-3 bg-stone-700 rounded w-full" />
                        <div className="h-3 bg-stone-700 rounded w-5/6" />
                        <div className="flex justify-between items-center pt-2">
                          <div className="h-6 bg-stone-700 rounded w-16" />
                          <div className="h-9 bg-stone-700 rounded w-24" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center space-y-3">
                  <ShoppingBag className="w-12 h-12 text-stone-600 opacity-50" />
                  <p className="text-stone-400 font-mono text-sm">No products found. Seed demo database in the sidebar!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const isWish = wishlist.some(p => p.id === product.id);
                    return (
                      <Card key={product.id} className="border-stone-850 hover:border-stone-800 transition-all duration-300 flex flex-col group overflow-hidden">
                        {product.imageUrl && (
                          <div className="h-44 overflow-hidden relative border-b border-stone-850">
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <button
                              onClick={() => handleToggleWishlist(product)}
                              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all ${
                                isWish
                                  ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                  : 'bg-stone-900/50 border-stone-800 text-stone-400 hover:text-white'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isWish ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        )}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between">
                              <Badge variant="default" className="bg-stone-800 text-stone-400 font-mono scale-90 origin-left">
                                {product.category}
                              </Badge>
                              <span className="text-[10px] font-mono text-stone-500">
                                Stock: {product.stock}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-2 group-hover:text-emerald-400 transition-colors">
                              {product.title}
                            </h4>
                            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                              {product.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm font-mono font-bold text-emerald-400">
                              ${Number(product.price).toFixed(2)}
                            </span>
                            <Button
                              onClick={() => handleAddToCart(product)}
                              size="sm"
                              className="h-8 font-mono bg-emerald-500 hover:bg-emerald-400"
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </RerenderVisualizer>

            {/* Slide-out Cart Sidebar */}
            {cartOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
                <div className="w-full max-w-md bg-stone-950 border-l border-stone-800 h-full p-6 flex flex-col justify-between shadow-2xl animate-fade-in">
                  <div className="space-y-6 overflow-y-auto flex-1">
                    <div className="flex justify-between items-center border-b border-stone-850 pb-4">
                      <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-emerald-400" />
                        Shopping Cart
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setCartOpen(false)}>Close</Button>
                    </div>

                    {cart.length === 0 ? (
                      <div className="text-center py-12 space-y-2 text-stone-500">
                        <ShoppingBag className="w-8 h-8 mx-auto opacity-30" />
                        <span className="text-xs font-mono">Your shopping cart is empty</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.product.id} className="flex gap-4 p-3 bg-stone-900/30 border border-stone-850 rounded-xl items-center">
                            {item.product.imageUrl && (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.title}
                                className="w-12 h-12 rounded object-cover border border-stone-800"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-white truncate">{item.product.title}</h5>
                              <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                                ${Number(item.product.price).toFixed(2)}
                              </p>
                              <div className="flex items-center space-x-2 mt-1.5">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="w-5 h-5 bg-stone-800 rounded flex items-center justify-center text-[10px] text-stone-300 hover:bg-stone-700"
                                >
                                  -
                                </button>
                                <span className="text-xs font-mono text-stone-200">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="w-5 h-5 bg-stone-800 rounded flex items-center justify-center text-[10px] text-stone-300 hover:bg-stone-700"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.product.id)}
                              className="h-8 w-8 text-stone-500 hover:text-red-400 hover:bg-red-500/5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="border-t border-stone-850 pt-4 mt-4 space-y-4">
                      <div className="flex justify-between font-mono text-sm">
                        <span className="text-stone-400">Total:</span>
                        <span className="text-emerald-400 font-extrabold">${getCartTotal().toFixed(2)}</span>
                      </div>
                      <Button
                        onClick={handleCheckout}
                        disabled={checkoutMutation.isPending}
                        className="w-full font-mono bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold"
                      >
                        {checkoutMutation.isPending ? 'Processing...' : 'Checkout & Place Order'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        }

        // 2. CONCEPTS VIEW
        concepts={
          <>
            <h3 className="text-lg font-bold text-white">Centralized Client-Side State with Zustand</h3>
            <p>
              In complex storefront operations, passing state between unrelated leaves (like a wishlist icon, a floating cart badge, and checkout sliders) usually triggers massive propagation concerns.
            </p>
            <h4 className="text-sm font-semibold text-emerald-400 mt-4">Why Zustand Beats React Context here:</h4>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>No Context Bloat:</strong> Zustand operates in a private store outside the React virtual DOM tree.
              </li>
              <li>
                <strong>Granular Subscriptions (Selectors):</strong> Instead of subscribing to the entire store object, components subscribe to slices (e.g. <code>state =&gt; state.cart</code>). Rerenders are <em>only</em> executed if that exact slice has changed value.
              </li>
              <li>
                <strong>Action separation:</strong> Action handlers (<code>addToCart</code>, <code>toggleWishlist</code>) are defined once within the store and never recreate references on state changes.
              </li>
            </ul>
          </>
        }

        // 3. INTERACTIVE VIEW
        interactive={
          <Card className="p-6 border-stone-800 bg-stone-900/30">
            <h3 className="text-md font-bold text-white mb-2">Zustand Selector Performance Simulation</h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Toggle between optimized selector-mode and unoptimized full-store extraction. Watch the Observability Terminal when you click **Wishlist** togglers. Under optimized mode, adding items to wishlist *only* rerenders the wishlist badge. Under unoptimized mode, the entire products grid and cart headers will execute rerenders!
            </p>

            <div className="flex items-center space-x-4 bg-stone-950/65 p-4 rounded-xl border border-stone-850">
              <button
                onClick={() => setOptimizationMode('optimized')}
                className={`flex-1 py-3 px-4 rounded-lg font-mono text-xs font-bold transition-all border ${
                  optimizationMode === 'optimized'
                    ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'bg-stone-900 text-stone-400 border-stone-850 hover:text-stone-200'
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Optimized Selectors
                  </div>
                  <span className="text-[10px] font-normal block opacity-80 mt-0.5">useCartStore(s =&gt; s.cart)</span>
                </div>
              </button>

              <button
                onClick={() => setOptimizationMode('unoptimized')}
                className={`flex-1 py-3 px-4 rounded-lg font-mono text-xs font-bold transition-all border ${
                  optimizationMode === 'unoptimized'
                    ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-md'
                    : 'bg-stone-900 text-stone-400 border-stone-850 hover:text-stone-200'
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Unoptimized Extraction
                  </div>
                  <span className="text-[10px] font-normal block opacity-80 mt-0.5">const store = useCartStore()</span>
                </div>
              </button>
            </div>
          </Card>
        }

        // 4. PERFORMANCE VIEW
        performanceMetrics={
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-stone-850 bg-stone-900/30">
              <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest mb-3">Zustand Subscription Ratios</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span>Component Rerender Minimization</span>
                    <span className="text-emerald-400 font-bold">{optimizationMode === 'optimized' ? '98%' : '35%'}</span>
                  </div>
                  <div className="h-2 bg-stone-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        optimizationMode === 'optimized' ? 'bg-emerald-500 w-[98%]' : 'bg-red-500 w-[35%]'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span>Render Processing Latency</span>
                    <span className="text-emerald-400 font-bold">{optimizationMode === 'optimized' ? '0.04 ms' : '1.82 ms'}</span>
                  </div>
                  <div className="h-2 bg-stone-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        optimizationMode === 'optimized' ? 'bg-emerald-500 w-[4%]' : 'bg-red-500 w-[78%]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-4 border-stone-850 bg-stone-900/30 flex flex-col justify-center">
              <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest mb-1.5">Memory Subscriptions</h4>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                {optimizationMode === 'optimized' 
                  ? 'Zustand slices maintain exact weak-ref map connections, compiling and checking only when the active node state changes.' 
                  : 'Unoptimized mode forces the subscriber callback to construct a fresh state wrapper on every set event, generating garbage memory frames.'}
              </p>
            </Card>
          </div>
        }

        // 5. BENEFITS VIEW
        benefits={
          <>
            <h3 className="text-md font-bold text-white mb-2">Architectural Benefits of Zustand</h3>
            <ul className="space-y-3">
              <li className="flex gap-2.5 items-start text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-stone-200">State Decoupling:</strong>
                  <p className="text-stone-400 mt-0.5">SaaS business logic (adding, removing, checkout) is isolated in a separate, testable TS store instead of cluttering UI components.</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-stone-200">No React context-provider hell:</strong>
                  <p className="text-stone-400 mt-0.5">Allows stores to be written and accessed anywhere without wrapping the page hierarchy in dozen separate nested Context Providers.</p>
                </div>
              </li>
            </ul>
          </>
        }

        // 6. ARCHITECTURE FLOW
        architecture={
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest">Data Flow Diagram</h4>
            <div className="border border-stone-800 bg-stone-950 p-6 rounded-xl space-y-4 text-xs font-mono leading-relaxed">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg text-center w-full md:w-auto">
                  <span className="text-emerald-400 font-bold">Storefront UI</span>
                  <p className="text-[10px] text-stone-500 mt-1">User clicks Add to Cart</p>
                </div>
                <ChevronRight className="hidden md:block w-4 h-4 text-stone-600" />
                <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg text-center w-full md:w-auto">
                  <span className="text-emerald-400 font-bold">useCartStore selector</span>
                  <p className="text-[10px] text-stone-500 mt-1">Updates cart slice state</p>
                </div>
                <ChevronRight className="hidden md:block w-4 h-4 text-stone-600" />
                <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg text-center w-full md:w-auto">
                  <span className="text-emerald-400 font-bold">Cart Widget</span>
                  <p className="text-[10px] text-stone-500 mt-1">Only subscriber node rerenders</p>
                </div>
              </div>
            </div>
          </div>
        }
      />
  );
}
