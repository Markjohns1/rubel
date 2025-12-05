import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api, User } from './api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // In a real app, validate token with backend
      // api.auth.me().then(setUser).catch(() => logout());
      
      // For now, just hydrate from storage if we saved user info
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
      
      toast({ title: "Welcome back!" });
    } catch (error) {
      toast({ 
        title: "Login failed", 
        description: "Please check your credentials (backend might be offline)",
        variant: "destructive" 
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast({ title: "Logged out" });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within a AuthProvider');
  return context;
}
