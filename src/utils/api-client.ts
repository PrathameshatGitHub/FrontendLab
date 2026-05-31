import { config } from '@/config';

// Key for storing token in localStorage
const TOKEN_KEY = 'fe_lab_token';
const USER_KEY = 'fe_lab_user';

// Setup local state database to hold mock data in case the backend is down
let mockProducts = [
  {
    id: 'prod-1',
    title: 'Vercel Analytics Hub',
    description: 'Real-time observability platform for headless deployments. Core Web Vitals profiling out of the box.',
    price: 49.00,
    stock: 250,
    category: 'SaaS',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60',
    vendorId: 'vendor-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    title: 'React Compiler Bundle',
    description: 'Webpack and Vite plugins enabling React 19 Compiler memoization optimization profiles globally.',
    price: 29.00,
    stock: 120,
    category: 'Tooling',
    imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&auto=format&fit=crop&q=60',
    vendorId: 'vendor-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    title: 'Hydration Observability Extension',
    description: 'Browser DevTools extension profiling React 19 hydration mismatch layouts and visual diff overlays.',
    price: 19.00,
    stock: 45,
    category: 'Extensions',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60',
    vendorId: 'vendor-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let mockOrders: any[] = [];
let mockUsers = [
  { id: 'admin-1', email: 'admin@felab.dev', name: 'System Admin', role: 'ADMIN', createdAt: new Date().toISOString() },
  { id: 'vendor-1', email: 'vendor@felab.dev', name: 'Core Vendor', role: 'VENDOR', createdAt: new Date().toISOString() },
  { id: 'user-1', email: 'user@felab.dev', name: 'Junior Dev', role: 'USER', createdAt: new Date().toISOString() },
];

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

export const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
  return null;
};

export const setStoredUser = (user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

interface RequestOptions extends RequestInit {
  bodyData?: any;
  isMultipart?: boolean;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.bodyData) {
    if (options.isMultipart) {
      // For multipart (form data), do not set Content-Type header manually, let fetch do it
      options.body = options.bodyData;
    } else {
      headers.set('Content-Type', 'application/json');
      options.body = JSON.stringify(options.bodyData);
    }
  }

  options.headers = headers;

  // Perform API call with refresh logic
  try {
    const url = `${config.apiBaseUrl}${path}`;
    const response = await fetch(url, options);
    if (!response.ok) {
      // If Unauthorized, attempt token refresh
      if (response.status === 401) {
        // Try refresh token endpoint
        try {
          const refreshData = await apiFetch<{ token: string }>('/auth/refresh', { method: 'POST' });
          // Update stored token and retry original request
          setAuthToken(refreshData.token);
          // Update Authorization header
          headers.set('Authorization', `Bearer ${refreshData.token}`);
          options.headers = headers;
          const retryResponse = await fetch(url, options);
          if (!retryResponse.ok) {
            const errBody = await retryResponse.json().catch(() => ({}));
            throw new Error(errBody.error || `HTTP error ${retryResponse.status}`);
          }
          return await retryResponse.json() as T;
        } catch (refreshErr) {
          // Refresh failed – propagate original error
          const errBody = await response.json().catch(() => ({}));
          throw new Error(errBody.error || `HTTP error ${response.status}`);
        }
      }
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `HTTP error ${response.status}`);
    }
    return await response.json() as T;
  } catch (error: any) {
    console.warn(`Backend connection failed for path "${path}", running client fallback. Error:`, error.message);
    return runMockFallback<T>(path, options);
  }
}

// Client-side mock fallback implementation
function runMockFallback<T>(path: string, options: RequestOptions): T {
  const isPost = options.method === 'POST';
  const isPut = options.method === 'PUT';
  const isDelete = options.method === 'DELETE';

  // 1. Auth Signup & Login
  if (path.includes('/auth/signup') && isPost) {
    const { email, password, name, role } = options.bodyData || {};
    if (!email || !name) throw new Error('Name and email are required');
    const existing = mockUsers.find(u => u.email === email);
    if (existing) throw new Error('Email already registered');
    
    const user = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      role: role || 'USER',
      createdAt: new Date().toISOString()
    };
    mockUsers.push(user);
    const mockToken = `mock-jwt-token-${user.id}`;
    
    setAuthToken(mockToken);
    setStoredUser(user);
    return { message: 'Registered successfully', user, token: mockToken } as any as T;
  }

  if (path.includes('/auth/login') && isPost) {
    const { email } = options.bodyData || {};
    const user = mockUsers.find(u => u.email === email) || {
      id: 'mock-user-id',
      email: email || 'dev@felab.dev',
      name: email ? email.split('@')[0] : 'Demo User',
      role: email?.includes('admin') ? 'ADMIN' : email?.includes('vendor') ? 'VENDOR' : 'USER',
      createdAt: new Date().toISOString()
    };

    if (!mockUsers.find(u => u.email === user.email)) {
      mockUsers.push(user as any);
    }

    const mockToken = `mock-jwt-token-${user.id}`;
    setAuthToken(mockToken);
    setStoredUser(user);
    return { message: 'Login successful', user, token: mockToken } as any as T;
  }

  if (path.includes('/auth/profile')) {
    const user = getStoredUser();
    if (!user) throw new Error('Access denied. No token.');
    return user as any as T;
  }

  // 2. User Storefront Products
  if (path === '/products/products') { // GET all products
    return {
      products: mockProducts,
      pagination: { page: 1, limit: 10, total: mockProducts.length, totalPages: 1 }
    } as any as T;
  }

  if (path.startsWith('/products/products/')) { // GET product by id
    const id = path.split('/').pop();
    const product = mockProducts.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return {
      ...product,
      vendor: { id: product.vendorId, name: 'Core Vendor', email: 'vendor@felab.dev' }
    } as any as T;
  }

  // 3. Vendor Product Operations
  if (path === '/vendor/products') {
    if (isPost) { // POST create product
      // Extract from form data
      const formData = options.bodyData as FormData;
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const price = parseFloat(formData.get('price') as string || '0');
      const stock = parseInt(formData.get('stock') as string || '0');
      const category = formData.get('category') as string;
      
      const newProduct = {
        id: `prod-${Math.random().toString(36).substr(2, 9)}`,
        title: title || 'New Product',
        description: description || '',
        price,
        stock,
        category: category || 'General',
        imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=500&auto=format&fit=crop&q=60',
        vendorId: 'vendor-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockProducts.push(newProduct);
      return { message: 'Product created', product: newProduct } as any as T;
    }
    
    // GET vendor products
    return mockProducts as any as T;
  }

  if (path.startsWith('/vendor/products/')) {
    const id = path.split('/').pop();
    if (isPut) { // PUT update product
      const formData = options.bodyData as FormData;
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const price = formData.get('price') ? parseFloat(formData.get('price') as string) : undefined;
      const stock = formData.get('stock') ? parseInt(formData.get('stock') as string) : undefined;
      const category = formData.get('category') as string;

      const index = mockProducts.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Product not found');

      mockProducts[index] = {
        ...mockProducts[index],
        title: title || mockProducts[index].title,
        description: description !== undefined ? description : mockProducts[index].description,
        price: price !== undefined ? price : mockProducts[index].price,
        stock: stock !== undefined ? stock : mockProducts[index].stock,
        category: category || mockProducts[index].category,
        updatedAt: new Date().toISOString()
      };
      return { message: 'Product updated', product: mockProducts[index] } as any as T;
    }

    if (isDelete) { // DELETE product
      mockProducts = mockProducts.filter(p => p.id !== id);
      return { message: 'Product deleted successfully' } as any as T;
    }
  }

  // 4. Orders
  if (path === '/orders') {
    if (isPost) { // POST place order
      const { items } = options.bodyData || {};
      const user = getStoredUser();
      
      const orderItems = items.map((item: any) => {
        const prod = mockProducts.find(p => p.id === item.productId);
        // decrement stock
        if (prod) prod.stock = Math.max(0, prod.stock - item.quantity);
        return {
          id: `item-${Math.random().toString(36).substr(2, 9)}`,
          quantity: item.quantity,
          price: prod?.price || 10,
          productId: item.productId,
          product: prod ? { id: prod.id, title: prod.title, imageUrl: prod.imageUrl, price: prod.price } : null
        };
      });

      const totalAmount = orderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

      const order = {
        id: `ord-${Math.random().toString(36).substr(2, 9)}`,
        status: 'PENDING',
        totalAmount,
        userId: user?.id || 'user-1',
        items: orderItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockOrders.push(order);
      return { message: 'Order placed successfully', order } as any as T;
    }

    // GET my orders
    return mockOrders as any as T;
  }

  // 5. Admin analytics
  if (path === '/admin/users') {
    return mockUsers as any as T;
  }
  if (path === '/admin/vendors') {
    return mockUsers.filter(u => u.role === 'VENDOR') as any as T;
  }
  if (path === '/admin/products') {
    return mockProducts.map(p => ({
      ...p,
      vendor: { id: p.vendorId, name: 'Core Vendor', email: 'vendor@felab.dev' }
    })) as any as T;
  }
  if (path.startsWith('/admin/products/') && isDelete) {
    const id = path.split('/').pop();
    mockProducts = mockProducts.filter(p => p.id !== id);
    return { message: 'Product deleted by admin' } as any as T;
  }

  throw new Error(`Mock handler for ${path} not implemented.`);
}
