import { create } from 'zustand';
import { Product } from '@/types';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  wishlist: [],

  addToCart: (product, quantity = 1) => set((state) => {
    const existingIndex = state.cart.findIndex(item => item.product.id === product.id);
    
    if (existingIndex > -1) {
      const updatedCart = [...state.cart];
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: updatedCart[existingIndex].quantity + quantity
      };
      return { cart: updatedCart };
    }
    
    return { cart: [...state.cart, { product, quantity }] };
  }),

  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.product.id !== productId)
  })),

  updateQuantity: (productId, quantity) => set((state) => ({
    cart: state.cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: Math.max(1, quantity) } 
        : item
    )
  })),

  clearCart: () => set({ cart: [] }),

  toggleWishlist: (product) => set((state) => {
    const exists = state.wishlist.some(p => p.id === product.id);
    if (exists) {
      return { wishlist: state.wishlist.filter(p => p.id !== product.id) };
    }
    return { wishlist: [...state.wishlist, product] };
  }),

  isInWishlist: (productId) => {
    return get().wishlist.some(p => p.id === productId);
  },

  getCartTotal: () => {
    return get().cart.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0);
  },

  getCartCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  }
}));
