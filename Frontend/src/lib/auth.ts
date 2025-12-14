'use client';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  subscription?: {
    plan: string;
    status: 'active' | 'inactive' | 'trial';
    expiresAt?: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

const AUTH_STORAGE_KEY = 'cinestream_auth';
const USER_STORAGE_KEY = 'cinestream_user';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Save user authentication state to localStorage
 */
export function saveAuthState(user: User): void {
  if (!isBrowser) return;
  
  try {
    const authState: AuthState = {
      isAuthenticated: true,
      user
    };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: authState 
    }));
  } catch (error) {
    console.error('Failed to save auth state:', error);
  }
}

/**
 * Get user authentication state from localStorage
 */
export function getAuthState(): AuthState {
  if (!isBrowser) {
    return { isAuthenticated: false, user: null };
  }
  
  try {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) {
      return { isAuthenticated: false, user: null };
    }
    
    const authState: AuthState = JSON.parse(authData);
    return authState;
  } catch (error) {
    console.error('Failed to get auth state:', error);
    return { isAuthenticated: false, user: null };
  }
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
  if (!isBrowser) return null;
  
  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (!userData) return null;
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Update user data in localStorage
 */
export function updateUser(userData: Partial<User>): void {
  if (!isBrowser) return;
  
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...userData };
    
    const authState: AuthState = {
      isAuthenticated: true,
      user: updatedUser
    };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: authState 
    }));
  } catch (error) {
    console.error('Failed to update user:', error);
  }
}

/**
 * Clear user authentication state from localStorage
 */
export function clearAuthState(): void {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isAuthenticated: false, user: null } 
    }));
  } catch (error) {
    console.error('Failed to clear auth state:', error);
  }
}

/**
 * Valid credentials for demo authentication
 */
const VALID_CREDENTIALS = {
  email: 'jayanthgummitha@gmail.com',
  password: 'Jayanth0305@'
};

/**
 * Simulate user login (for demo purposes with credential validation)
 */
export function simulateLogin(formData: {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<User> {
  return new Promise((resolve, reject) => {
    // Simulate API call delay
    setTimeout(() => {
      // Validate credentials
      if (formData.email !== VALID_CREDENTIALS.email || formData.password !== VALID_CREDENTIALS.password) {
        reject(new Error('Invalid email or password'));
        return;
      }

      // Create user with consistent ID for the valid user
      const user: User = {
        id: 'user_jayanth_574', // Consistent ID for this user
        name: formData.firstName && formData.lastName 
          ? `${formData.firstName} ${formData.lastName}` 
          : 'Jayanth Reddy',
        email: formData.email,
        firstName: formData.firstName || 'Jayanth',
        lastName: formData.lastName || 'Reddy',
        phone: formData.phone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
        subscription: {
          plan: 'premium',
          status: 'active',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
        }
      };
      
      saveAuthState(user);
      resolve(user);
    }, 1000);
  });
}

/**
 * Simulate user logout
 */
export function logout(): void {
  clearAuthState();
  
  // Clear owner session - user is no longer authenticated
  if (isBrowser) {
    sessionStorage.removeItem('cinestream_owner_session');
  }
  
  // Redirect to home page or login page if needed
  if (isBrowser && window.location.pathname !== '/') {
    window.location.href = '/';
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const authState = getAuthState();
  return authState.isAuthenticated;
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthStateChange(callback: (authState: AuthState) => void): () => void {
  if (!isBrowser) return () => {};
  
  const handleAuthChange = (event: CustomEvent<AuthState>) => {
    callback(event.detail);
  };
  
  window.addEventListener('authStateChanged', handleAuthChange as EventListener);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('authStateChanged', handleAuthChange as EventListener);
  };
}