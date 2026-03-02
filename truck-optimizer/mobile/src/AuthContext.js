import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]     = useState(null);
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // checking stored token on boot

  // On mount: restore token from storage and validate with server
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('auth_token');
        if (stored) {
          const data = await authApi.me(stored);
          setToken(stored);
          setUser(data.user);
        }
      } catch (_) {
        await AsyncStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const data = await authApi.login(email, password);
    await AsyncStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function register(email, password, phone, address) {
    const data = await authApi.register(email, password, phone, address);
    await AsyncStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function logout() {
    if (token) {
      await authApi.logout(token).catch(() => {});
    }
    await AsyncStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
