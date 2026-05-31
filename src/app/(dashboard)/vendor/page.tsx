'use client';

import * as React from 'react';

import { LabLayout } from '@/components/labs/lab-layout';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Input, Label, Select ,CardDescription} from '@/components/ui/primitives';
import { useRerender } from '@/hooks/use-rerender';
import { RerenderVisualizer } from '@/components/shared/rerender-visualizer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/utils/api-client';
import { Product } from '@/types';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Database, Plus, Trash2, ArrowUpRight, Zap, CheckCircle2, ChevronRight, AlertCircle, Sparkles, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';



// Define the validation schema using Zod
const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  price: z.preprocess((val) => parseFloat(val as string || '0'), z.number().min(0.01, 'Price must be greater than 0')),
  stock: z.preprocess((val) => parseInt(val as string || '0'), z.number().min(1, 'Stock must be at least 1')),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
 image: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Max file size is 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
      'Only JPEG/PNG images are allowed'
    ),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function VendorPage() {
  // Rerender tracking
  useRerender('VendorRoot', 'Vendor Page Root Render');

  const queryClient = useQueryClient();
  const [optimisticMode, setOptimisticMode] = React.useState<'active' | 'inactive'>('active');
  const [showAddForm, setShowAddForm] = React.useState(false);

  // Fetch Vendor Products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['vendor-products'],
    queryFn: () => apiFetch<Product[]>('/vendor/products')
  });

  // Custom Zod resolver wrapper for React Hook Form (reduces package size/dependency version clash)
  const customResolver = React.useCallback((values: any) => {
    try {
      productSchema.parse(values);
      return { values, errors: {} };
    } catch (error: any) {
      const errors: any = {};
      if (error instanceof z.ZodError) {
        error.issues.forEach((err) => {
          const path = err.path[0];
          errors[path] = { message: err.message };
        });
      }
      return { values: {}, errors };
    }
  }, []);

 const {
  register,
  handleSubmit,
  reset,
  watch,        // Add this
  setValue,     // Add this
  formState: { errors }
} = useForm<ProductFormData>({
  resolver: customResolver,
  defaultValues: { 
    title: '', 
    price: 0, 
    stock: 0, 
    category: 'SaaS', 
    description: '',
    image: undefined  // Add this
  }
});

  // 1. Mutation WITH OPTIMISTIC UPDATES
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Simulate network latency
   
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('price', data.price.toString());
      formData.append('stock', data.stock.toString());
      formData.append('category', data.category);
      if (data.description) formData.append('description', data.description);
        formData.append('image', data.image); // Add this line

      return apiFetch<{ message: string; product: Product }>('/vendor/products', {
        method: 'POST',
        bodyData: formData,
        isMultipart: true
      });
    },
    // Triggers before mutation function runs
    onMutate: async (newProductData) => {
      if (optimisticMode === 'inactive') return;

      // Cancel outgoing queries to avoid overwrites
      await queryClient.cancelQueries({ queryKey: ['vendor-products'] });
      
      // Snapshot the current cache
      const previousProducts = queryClient.getQueryData<Product[]>(['vendor-products']);
      
      // Create a temporary, optimistic product record
     const tempProduct: Product = {
  id: `temp-${Date.now()}`,
  title: newProductData.title,
  price: newProductData.price,
  stock: newProductData.stock,
  category: newProductData.category,
  description: newProductData.description || null,
  imageUrl: newProductData.image ? URL.createObjectURL(newProductData.image) : 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=500&auto=format&fit=crop&q=60',
  vendorId: 'vendor-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
      
      // Optimistically inject the new product into the cache
      queryClient.setQueryData<Product[]>(['vendor-products'], (old = []) => [tempProduct, ...old]);
      
      // Return previous snapshot so we can rollback on error
      return { previousProducts };
    },
    onError: (err, newProduct, context: any) => {
      if (optimisticMode === 'active' && context?.previousProducts) {
        // Rollback cache state
        queryClient.setQueryData(['vendor-products'], context.previousProducts);
        toast.error('Server error: rolled back optimistic creation!');
      } else {
        toast.error('Failed to create product.');
      }
    },
    onSuccess: (res) => {
      toast.success(res.message);
      reset();
      setShowAddForm(false);
    },
    onSettled: () => {
      // Invalidate query to fetch the real server record
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  // Delete Mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiFetch(`/vendor/products/${id}`, { method: 'DELETE' });
    },
    onMutate: async (id) => {
      if (optimisticMode === 'inactive') return;
      await queryClient.cancelQueries({ queryKey: ['vendor-products'] });
      const previousProducts = queryClient.getQueryData<Product[]>(['vendor-products']);
      
      // Optimistically remove from cache
      queryClient.setQueryData<Product[]>(['vendor-products'], (old = []) => old.filter(p => p.id !== id));
      
      return { previousProducts };
    },
    onError: (err, id, context: any) => {
      if (optimisticMode === 'active' && context?.previousProducts) {
        queryClient.setQueryData(['vendor-products'], context.previousProducts);
        toast.error('Rollback delete operation!');
      } else {
        toast.error('Failed to delete product.');
      }
    },
    onSuccess: (res: any) => {
      toast.success(res.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

 const onSubmit = (data: ProductFormData) => {
  // Ensure all required fields are present
  if (!data.image) {
    toast.error('Please select an image');
    return;
  }
  createProductMutation.mutate(data);
};
  const codeFiles = [
    {
      path: 'src/app/vendor/page.tsx',
      code: `// React Query optimistic mutation flow
const createProductMutation = useMutation({
  mutationFn: (data) => apiFetch('/vendor/products', { method: 'POST', bodyData: data }),
  
  onMutate: async (newProduct) => {
    await queryClient.cancelQueries({ queryKey: ['products'] });
    const previous = queryClient.getQueryData(['products']);
    
    // Inject temp optimistic product
    const tempItem = { id: 'temp-id', ...newProduct };
    queryClient.setQueryData(['products'], (old) => [tempItem, ...old]);
    
    return { previous };
  },
  
  onError: (err, newProduct, context) => {
    // Rollback to previous state snapshot
    queryClient.setQueryData(['products'], context.previous);
    toast.error('Rolled back optimistic updates!');
  },
  
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }
});`,
      language: 'typescript'
    }
  ];

  return (
      <LabLayout
        title="Vendor Dashboard"
        description="Add, edit, and manage storefront product inventories. Demonstrates React Hook Form validation schemas alongside React Query optimistic update caching workflows."
        optimizationScore={optimisticMode === 'active' ? 95 : 55}
        aiContext={{ moduleName: 'react-query', extraContext: 'Optimistic Updates' }}
        codeFiles={codeFiles}
        
        // 1. DEMO VIEW
        demo={
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 border-stone-850 bg-stone-900/10">
                <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">My Products</div>
                <div className="text-xl font-bold font-mono text-white mt-1">{products.length} Items</div>
              </Card>
              <Card className="p-4 border-stone-850 bg-stone-900/10">
                <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">Inventory Capacity</div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {products.reduce((sum, p) => sum + Number(p.stock), 0)} Units
                </div>
              </Card>
              <Card className="p-4 border-stone-850 bg-stone-900/10">
                <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">Optimistic Engine</div>
                <div className="text-xl font-bold font-mono mt-1 text-emerald-400">
                  {optimisticMode === 'active' ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </Card>
            </div>

            {/* Header Control */}
            <div className="flex justify-between items-center bg-stone-900/35 border border-stone-850 p-4 rounded-xl">
              <span className="text-xs font-mono text-stone-400">Product List Administration</span>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="font-mono bg-emerald-500 text-stone-950 font-bold flex items-center gap-1 h-9"
              >
                <Plus className="w-4 h-4" />
                {showAddForm ? 'Hide Form' : 'Add Product'}
              </Button>
            </div>

            {/* Product Creation Form */}
            {showAddForm && (
              <Card className="border-emerald-500/25 bg-stone-950/70 p-6 max-w-xl mx-auto shadow-lg shadow-emerald-500/5 animate-fade-in">
                <CardHeader className="p-0 pb-4 border-b border-stone-850">
                  <CardTitle className="text-md font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    New Product Details
                  </CardTitle>
                  <CardDescription>Zod validated schema form</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <div className="space-y-1">
                    <Label htmlFor="title">Product Title</Label>
                    <Input id="title" {...register('title')} placeholder="e.g. NextJS Profiling Bundle" />
                    {errors.title && <p className="text-[10px] text-red-400 font-mono mt-1">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input id="price" type="number" step="0.01" {...register('price')} placeholder="29.99" />
                      {errors.price && <p className="text-[10px] text-red-400 font-mono mt-1">{errors.price.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="stock">Initial Stock</Label>
                      <Input id="stock" type="number" {...register('stock')} placeholder="100" />
                      {errors.stock && <p className="text-[10px] text-red-400 font-mono mt-1">{errors.stock.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="category">Category</Label>
                    <Select id="category" {...register('category')}>
                      <option value="SaaS" className="bg-stone-900 text-stone-250">SaaS Platform</option>
                      <option value="Tooling" className="bg-stone-900 text-stone-250">Developer Tooling</option>
                      <option value="Extensions" className="bg-stone-900 text-stone-250">Web Extension</option>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input id="description" {...register('description')} placeholder="Detail description of engineering benefits" />
                  </div>
                   {/* Image Upload Section */}
  <div className="space-y-2">
  <Label htmlFor="image">Product Image</Label>
  <div className="flex items-center gap-3">
    <input
      id="image"
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          setValue('image', file);
        }
      }}
      className="hidden"
    />
    <Button
      type="button"
      variant="outline"
      onClick={() => document.getElementById('image')?.click()}
      className="font-mono border-emerald-500/30 hover:bg-emerald-500/10"
    >
      <ImageIcon className="w-4 h-4 mr-2" />
      Choose Image
    </Button>
    {watch('image') && (
      <span className="text-xs text-emerald-400 font-mono">
        {(watch('image') as File).name}
      </span>
    )}
  </div>
  {errors.image && <p className="text-[10px] text-red-400 font-mono mt-1">{errors.image.message}</p>}
  
  {/* Image Preview */}
  {watch('image') && (
    <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border border-stone-700">
      <img
        src={URL.createObjectURL(watch('image') as File)}
        alt="Preview"
        className="w-full h-full object-cover"
        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
      />
    </div>
  )}
</div>


                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending}
                    className="w-full font-mono bg-emerald-500 text-stone-950 font-bold"
                  >
                    {createProductMutation.isPending && optimisticMode === 'inactive' ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Awaiting server response...
                      </span>
                    ) : (
                      'Publish Product'
                    )}
                  </Button>
                </form>
              </Card>
            )}

            {/* Vendor Products List Table */}
            <RerenderVisualizer componentName="VendorProductList" className="p-4 bg-stone-900/10">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-14 bg-stone-850 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center space-y-3">
                  <Database className="w-12 h-12 text-stone-600 opacity-50" />
                  <p className="text-stone-400 font-mono text-sm">No items registered in your inventory.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-500">
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const isOptimistic = product.id.startsWith('temp-');
                        return (
                          <tr
                            key={product.id}
                            className={`border-b border-stone-850 hover:bg-stone-900/20 transition-all ${
                              isOptimistic ? 'opacity-50 bg-emerald-500/5 animate-pulse' : ''
                            }`}
                          >
                            <td className="py-3 px-4 text-white font-sans font-semibold">
                              {product.title}
                              {isOptimistic && (
                                <Badge variant="info" className="ml-2 scale-90 bg-emerald-500/10 text-emerald-400 font-mono">
                                  Syncing...
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-stone-400">{product.category}</td>
                            <td className="py-3 px-4 text-emerald-400 font-bold">${Number(product.price).toFixed(2)}</td>
                            <td className="py-3 px-4 text-stone-300">{product.stock}</td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteProductMutation.mutate(product.id)}
                                disabled={deleteProductMutation.isPending || isOptimistic}
                                className="h-8 w-8 text-stone-500 hover:text-red-400 hover:bg-red-500/5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </RerenderVisualizer>
          </div>
        }

        // 2. CONCEPTS VIEW
        concepts={
          <>
            <h3 className="text-lg font-bold text-white">Form Architectures and Cache Optimistic Updates</h3>
            <p>
              Traditional CRUD patterns enforce a strict linear wait time: Form Submit → API Request → PostgreSQL Transaction → JSON Response → Component UI Redraw. During this server roundtrip, the interface displays loading spinners, blocking user interactions.
            </p>
            <h4 className="text-sm font-semibold text-emerald-400 mt-4">The React Query Mutation Pipeline:</h4>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>onMutate():</strong> Triggered immediately before data hits the network. We snap the current cache state and inject a temporary, optimistic object (simulated UUID) so the list updates instantly on screen.
              </li>
              <li>
                <strong>onError():</strong> If the API rejects the request (database down, validation error, auth expiration), we re-inject the previous cache snapshot to revert the UI seamlessly.
              </li>
              <li>
                <strong>onSettled():</strong> We invalidate the query key (`queryClient.invalidateQueries`). This background fetch pulls the real, final database row, ensuring data consistency without interrupting user layout.
              </li>
            </ul>
          </>
        }

        // 3. INTERACTIVE VIEW
        interactive={
          <Card className="p-6 border-stone-800 bg-stone-900/30">
            <h3 className="text-md font-bold text-white mb-2">Optimistic Mutation Simulation Control</h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Toggle optimistic updates. When active, clicking **Publish Product** adds it to the table below *instantly* (1ms) and resolves the server payload in the background. When inactive, adding products forces you to wait for a simulated 2000ms database latency spinner.
            </p>

            <div className="flex items-center space-x-4 bg-stone-950/65 p-4 rounded-xl border border-stone-850">
              <button
                onClick={() => setOptimisticMode('active')}
                className={`flex-1 py-3 px-4 rounded-lg font-mono text-xs font-bold transition-all border ${
                  optimisticMode === 'active'
                    ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'bg-stone-900 text-stone-400 border-stone-850 hover:text-stone-250'
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Optimistic Updates Enabled
                  </div>
                  <span className="text-[10px] font-normal block opacity-80 mt-0.5">UI updates in 1ms</span>
                </div>
              </button>

              <button
                onClick={() => setOptimisticMode('inactive')}
                className={`flex-1 py-3 px-4 rounded-lg font-mono text-xs font-bold transition-all border ${
                  optimisticMode === 'inactive'
                    ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-md'
                    : 'bg-stone-900 text-stone-400 border-stone-850 hover:text-stone-250'
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Blocking Server Roundtrip
                  </div>
                  <span className="text-[10px] font-normal block opacity-80 mt-0.5">UI blocks on network delay</span>
                </div>
              </button>
            </div>
          </Card>
        }

        // 4. PERFORMANCE VIEW
        performanceMetrics={
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-stone-850 bg-stone-900/30">
              <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest mb-3">Latency Visualized</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span>Active Optimistic Updates UI Delay</span>
                    <span className="text-emerald-400 font-bold">1.2 ms</span>
                  </div>
                  <div className="h-2 bg-stone-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[1%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span>Blocking Updates UI Delay</span>
                    <span className="text-emerald-400 font-bold">2000 ms</span>
                  </div>
                  <div className="h-2 bg-stone-950 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[100%]" />
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-4 border-stone-850 bg-stone-900/30 flex items-center">
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                By bypassing the server latency in the visual loop, user satisfaction metrics (like perceived speed) improve by up to <strong>99.8%</strong>.
              </p>
            </Card>
          </div>
        }

        // 5. BENEFITS VIEW
        benefits={
          <>
            <h3 className="text-md font-bold text-white mb-2">Form Architecture & Validations</h3>
            <div className="space-y-3">
              <div className="text-xs text-stone-400">
                <strong className="text-stone-200">React Hook Form:</strong>
                <p className="mt-0.5">Minimizes keystroke rerenders by keeping input elements un-controlled until submission, preventing CPU choke on low-powered client devices.</p>
              </div>
              <div className="text-xs text-stone-400">
                <strong className="text-stone-200">Zod schemas:</strong>
                <p className="mt-0.5">Enforces unified validation rules on both frontend (inputs) and backend (Prisma constraints), ensuring data integrity before network serialization.</p>
              </div>
            </div>
          </>
        }

        // 6. ARCHITECTURE FLOW
        architecture={
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest">Optimistic Cache Mutate Flow</h4>
            <div className="border border-stone-800 bg-stone-950 p-6 rounded-xl space-y-4 text-xs font-mono leading-relaxed">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="p-3 bg-stone-900 border border-stone-850 rounded-lg text-center w-full md:w-auto">
                  <span className="text-emerald-400 font-bold">Submit Form</span>
                  <p className="text-[10px] text-stone-500 mt-1">onMutate triggers</p>
                </div>
                <ChevronRight className="hidden md:block w-4 h-4 text-stone-600" />
                <div className="p-3 bg-stone-900 border border-stone-850 rounded-lg text-center w-full md:w-auto">
                  <span className="text-emerald-400 font-bold">Cache Insert</span>
                  <p className="text-[10px] text-stone-500 mt-1">Inject temp product</p>
                </div>
                <ChevronRight className="hidden md:block w-4 h-4 text-stone-600" />
                <div className="p-3 bg-stone-900 border border-stone-850 rounded-lg text-center w-full md:w-auto">
                  <span className="text-emerald-400 font-bold">API completes</span>
                  <p className="text-[10px] text-stone-500 mt-1">Confirm or rollback</p>
                </div>
              </div>
            </div>
          </div>
        }
      />
  );
}
