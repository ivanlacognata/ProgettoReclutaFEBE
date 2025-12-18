'use client'; 

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const login = (userData: any) => {
  const actualUser = userData.user ?? userData;

  if (!actualUser?.id) {
    console.error("LOGIN FALLITO: user senza id", actualUser);
    return;
  }

  const normalizedUser = {
    id: actualUser.id,              
    username: actualUser.username,
    email: actualUser.email,
  };

  setUser(normalizedUser);
  localStorage.setItem("user", JSON.stringify(normalizedUser));
  router.push("/");
};



  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); 
    router.push('/');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
};