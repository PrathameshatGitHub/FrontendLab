'use client';

import * as React from 'react';
import { User, Role, AuthResponse } from '@/types';
import { apiFetch, setAuthToken, clearAuthToken, getStoredUser, setStoredUser } from '@/utils/api-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: Role) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const initAuth = () => {
      if (typeof window !== 'undefined') {
        const storedUser = getStoredUser();
        const storedToken = localStorage.getItem('fe_lab_token');
        
        if (storedUser && storedToken) {
          setUser(storedUser);
          setToken(storedToken);
          setAuthToken(storedToken);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        bodyData: { email, password }
      });

      setUser(data.user);
      setToken(data.token);
      setAuthToken(data.token);
      setStoredUser(data.user);
      
      // Set cookies for middleware route guarding (7 days)
      if (typeof window !== 'undefined') {
        document.cookie = `fe_lab_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `fe_lab_role=${data.user.role}; path=/; max-age=604800; SameSite=Lax`;
      }
      
      toast.success(data.message || 'Login successful!');
      
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else if (data.user.role === 'VENDOR') {
        router.push('/vendor');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role?: Role) => {
    setLoading(true);
    try {
      const data = await apiFetch<AuthResponse>('/auth/signup', {
        method: 'POST',
        bodyData: { email, password, name, role }
      });

      setUser(data.user);
      setToken(data.token);
      setAuthToken(data.token);
      setStoredUser(data.user);

      // Set cookies for middleware route guarding (7 days)
      if (typeof window !== 'undefined') {
        document.cookie = `fe_lab_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `fe_lab_role=${data.user.role}; path=/; max-age=604800; SameSite=Lax`;
      }

      toast.success('Registration successful!');
      
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else if (data.user.role === 'VENDOR') {
        router.push('/vendor');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuthToken();
    
    // Clear cookies
    if (typeof window !== 'undefined') {
      document.cookie = "fe_lab_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "fe_lab_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "fe_lab_token_exp=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    }
    
    toast.info('Logged out successfully.');
    router.push('/login');
  };

  const hasRole = (roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
