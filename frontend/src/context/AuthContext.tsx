import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserProfile, PrivacySettings } from '../types';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  baseline: any | null;
  privacy: PrivacySettings | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  quickLogin: (email: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [baseline, setBaseline] = useState<any | null>(null);
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUserData = async () => {
    try {
      if (!getAuthToken()) {
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
      setBaseline(data.baseline);
      setPrivacy(data.privacy);
    } catch (err) {
      console.error('Failed to load user context:', err);
      removeAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If no token exists on first boot, auto login as Arun Sharma (demo user) for immediate instant demo readiness
    const init = async () => {
      const token = getAuthToken();
      if (!token) {
        await quickLogin('user@heatguard.demo');
      } else {
        await refreshUserData();
      }
    };
    init();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      setAuthToken(res.token);
      await refreshUserData();
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (email: string) => {
    await login(email, 'HeatGuard@123');
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setProfile(null);
    setBaseline(null);
    setPrivacy(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        baseline,
        privacy,
        isAuthenticated: !!user,
        isLoading,
        login,
        quickLogin,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
