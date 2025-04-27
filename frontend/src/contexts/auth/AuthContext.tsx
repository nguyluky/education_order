import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../types/common/models';

// Auth context state interface
interface AuthContextState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerStudent: (userData: any) => Promise<void>;
  registerEducator: (userData: any) => Promise<void>;
}

// Default context state
const defaultAuthContextState: AuthContextState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  registerStudent: async () => {},
  registerEducator: async () => {},
};

// Create context
export const AuthContext = createContext<AuthContextState>(defaultAuthContextState);

// Auth provider props interface
interface AuthProviderProps {
  children: React.ReactNode;
}

// Auth service
const authService = new AuthService();

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on load
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthentication();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ email, password });
      
      // Save token to localStorage
      localStorage.setItem('token', response.token);
      
      // Get user data
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Register student function
  const registerStudent = async (userData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.registerStudent(userData);
      
      // Save token to localStorage
      localStorage.setItem('token', response.token);
      
      // Get user data
      const userDataResponse = await authService.getCurrentUser();
      setUser(userDataResponse);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Register educator function
  const registerEducator = async (userData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.registerEducator(userData);
      
      // Save token to localStorage
      localStorage.setItem('token', response.token);
      
      // Get user data
      const userDataResponse = await authService.getCurrentUser();
      setUser(userDataResponse);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Educator registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create context value
  const contextValue: AuthContextState = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    registerStudent,
    registerEducator,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);