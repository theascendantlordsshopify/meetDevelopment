'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthToken, setAuthToken, clearAuthTokens } from '@/lib/api/client';
import { User, LoginCredentials, RegisterData, AuthResponse } from '@/types';
import { API_ENDPOINTS, ROUTES } from '@/constants';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Failed to refresh user:', error);
          clearAuthTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      const { user: userData, token } = response.data.data!;
      
      setAuthToken(token);
      setUser(userData);
      
      toast.success('Welcome back!');
      
      // Redirect to dashboard or intended page
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || ROUTES.DASHBOARD;
      router.push(redirectTo);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.error || 'Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
      
      const { user: userData, token } = response.data.data!;
      
      setAuthToken(token);
      setUser(userData);
      
      toast.success('Account created successfully! Please verify your email.');
      router.push(ROUTES.VERIFY_EMAIL);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle field-specific errors
      if (error.field_errors) {
        Object.entries(error.field_errors).forEach(([field, errors]) => {
          if (Array.isArray(errors)) {
            errors.forEach(errorMsg => toast.error(`${field}: ${errorMsg}`));
          }
        });
      } else {
        toast.error(error.error || 'Registration failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout endpoint to invalidate token on server
      try {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      } catch (error) {
        // Continue with logout even if server call fails
        console.warn('Server logout failed:', error);
      }
      
      // Clear local state and tokens
      clearAuthTokens();
      setUser(null);
      
      toast.success('Logged out successfully');
      router.push(ROUTES.LOGIN);
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get<User>(API_ENDPOINTS.AUTH.PROFILE);
      setUser(response.data.data!);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.patch<User>(API_ENDPOINTS.AUTH.PROFILE, data);
      setUser(response.data.data!);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.error || 'Failed to update profile');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        const currentPath = window.location.pathname;
        router.push(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(currentPath)}`);
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="spinner w-8 h-8" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}