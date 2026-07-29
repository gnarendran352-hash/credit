import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

const DEMO_USER = {
  uid: 'demo-user-001',
  email: 'demo@fraudshield.ai',
  displayName: 'Demo User',
  emailVerified: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<any>(DEMO_USER);
  const [loading] = useState(false);

  const login = async () => {};
  const register = async () => {};
  const logout = async () => {};

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
