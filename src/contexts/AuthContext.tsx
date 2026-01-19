import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, userAPI } from '../utils/api';

interface UserType {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: (email: string, name: string, googleId: string, picture?: string) => Promise<void>;
  signInGuest: () => Promise<void>;
  updateProfile: (updates: { name?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists and verify it on mount
    const verifyToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      // Keep loading true while verifying
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          const response = await authAPI.verify();
          setUser(response.data.user);
          setLoading(false);
          return; // Success, exit
        } catch (error: any) {
          console.error(`Token verification failed (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);

          // Check if it's a network error (not 401/403)
          const isNetworkError = !error.response || error.response.status >= 500;

          if (isNetworkError && retryCount < maxRetries) {
            // Retry on network errors
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
            continue;
          }

          // If it's an auth error (401/403) or max retries reached, clear token
          if (error.response?.status === 401 || error.response?.status === 403 || retryCount >= maxRetries) {
            console.warn('Token is invalid or expired, clearing...');
            localStorage.removeItem('token');
            setUser(null);
          }

          setLoading(false);
          return;
        }
      }
    };

    verifyToken();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await authAPI.register(email, password, name);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const signInGuest = async () => {
    try {
      const response = await authAPI.guest();
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (updates: { name?: string }) => {
    try {
      const response = await userAPI.updateProfile(updates.name || '');
      setUser(response.data);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async (email: string, name: string, googleId: string, picture?: string) => {
    try {
      const response = await authAPI.googleLogin(email, name, googleId, picture);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInGuest,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 