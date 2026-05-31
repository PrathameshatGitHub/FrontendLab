export type Role = 'USER' | 'VENDOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  vendorId: string;
  vendor?: {
    id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string;
  product?: {
    id: string;
    title: string;
    imageUrl: string | null;
    price: number;
  };
}

export interface Order {
  id: string;
  status: string;
  totalAmount: number;
  userId: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
