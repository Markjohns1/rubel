import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api, User } from './api';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'guest' | 'user' | 'admin';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Determine user role
  const role: UserRole = user ? (user.isAdmin ? 'admin' : 'user') : 'guest';

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.auth.login({ username, password });
      
      const userData = {
        username: response.username,
        isAdmin: response.isAdmin
      };
      
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      toast({ 
        title: "Welcome back!", 
        description: `Logged in as ${response.isAdmin ? 'Admin' : 'User'}` 
      });
    } catch (error) {
      toast({ 
        title: "Login failed", 
        description: "Please check your credentials.",
        variant: "destructive" 
      });
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await api.auth.register({ username, password });
      
      const userData = {
        username: response.username,
        isAdmin: response.isAdmin
      };
      
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      toast({ 
        title: "Account created!", 
        description: "Welcome to our furniture store" 
      });
    } catch (error: any) {
      const message = error.message || "Registration failed";
      toast({ 
        title: "Registration failed", 
        description: message,
        variant: "destructive" 
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast({ title: "Logged out successfully" });
  };

  return (
    <AuthContext.Provider value={{ user, role, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within a AuthProvider');
  return context;
}