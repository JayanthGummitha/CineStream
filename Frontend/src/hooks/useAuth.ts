'use client';

import { useState, useEffect } from 'react';
import { 
  getAuthState, 
  saveAuthState, 
  clearAuthState, 
  simulateLogin, 
  logout as logoutUser,
  onAuthStateChange,
  type User,
  type AuthState 
} from '@/lib/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initialAuthState = getAuthState();
    setAuthState(initialAuthState);
    setLoading(false);
  }, []);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((newAuthState) => {
      setAuthState(newAuthState);
    });

    return unsubscribe;
  }, []);

  const login = async (formData: {
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<User> => {
    setLoading(true);
    try {
      const user = await simulateLogin(formData);
      setAuthState({ isAuthenticated: true, user });
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true);
    try {
      logoutUser();
      setAuthState({ isAuthenticated: false, user: null });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (!authState.user) return;
    
    const updatedUser = { ...authState.user, ...userData };
    saveAuthState(updatedUser);
    setAuthState({ isAuthenticated: true, user: updatedUser });
  };

  return {
    ...authState,
    loading,
    login,
    logout,
    updateUser
  };
}