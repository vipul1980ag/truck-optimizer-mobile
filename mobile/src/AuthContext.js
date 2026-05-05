import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { authApi } from './api';

const AuthContext = createContext(null);

const CREDS_KEY = 'auth_credentials';
const TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }) {
  const [token, setToken]     = useState(null);
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Step 1: try stored token
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (stored) {
          try {
            const data = await authApi.me(stored);
            setToken(stored);
            setUser(data.user);
            return;
          } catch (_) {
            // Token rejected (server restarted / data wiped) — fall through to silent re-login
            await AsyncStorage.removeItem(TOKEN_KEY);
          }
        }

        // Step 2: silent re-login with securely stored credentials
        const credsJson = await SecureStore.getItemAsync(CREDS_KEY);
        if (credsJson) {
          const { email, password } = JSON.parse(credsJson);
          const data = await authApi.login(email, password);
          await AsyncStorage.setItem(TOKEN_KEY, data.token);
          setToken(data.token);
          setUser(data.user);
        }
      } catch (_) {
        // Credentials invalid or network error — user must log in manually
        await AsyncStorage.removeItem(TOKEN_KEY);
        await SecureStore.deleteItemAsync(CREDS_KEY).catch(() => {});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const data = await authApi.login(email, password);
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await SecureStore.setItemAsync(CREDS_KEY, JSON.stringify({ email, password }));
    setToken(data.token);
    setUser(data.user);
  }

  async function register(email, password, phone, address) {
    const data = await authApi.register(email, password, phone, address);
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await SecureStore.setItemAsync(CREDS_KEY, JSON.stringify({ email, password }));
    setToken(data.token);
    setUser(data.user);
  }

  async function logout() {
    if (token) {
      await authApi.logout(token).catch(() => {});
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
    await SecureStore.deleteItemAsync(CREDS_KEY).catch(() => {});
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
