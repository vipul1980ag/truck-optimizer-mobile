import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LIGHT = {
  bg:          '#ffffff',
  surface:     '#ffffff',
  surface2:    '#f8fafc',
  surface3:    '#f1f5f9',
  border:      '#e2e8f0',
  borderLight: '#f5f7fa',
  text:        '#0f172a',
  text2:       '#475569',
  text3:       '#94a3b8',
  primary:     '#2563eb',
  primaryD:    '#1d4ed8',
  primaryL:    '#3b82f6',
  success:     '#16a34a',
  warning:     '#d97706',
  danger:      '#dc2626',
  navy:        '#0c1f40',
  navyMid:     '#1a2f50',
  navyLight:   '#1e293b',
  accent:      '#7c3aed',
  teal:        '#0d9488',
  gold:        '#d97706',
};

export const DARK = {
  bg:          '#0f172a',
  surface:     '#1e293b',
  surface2:    '#1e293b',
  surface3:    '#0f172a',
  border:      '#334155',
  borderLight: '#1e293b',
  text:        '#f1f5f9',
  text2:       '#94a3b8',
  text3:       '#64748b',
  primary:     '#3b82f6',
  primaryD:    '#2563eb',
  primaryL:    '#60a5fa',
  success:     '#22c55e',
  warning:     '#f59e0b',
  danger:      '#ef4444',
  navy:        '#020617',
  navyMid:     '#0f172a',
  navyLight:   '#1e293b',
  accent:      '#8b5cf6',
  teal:        '#14b8a6',
  gold:        '#f59e0b',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('theme_mode').then(v => {
      if (v === 'dark') setIsDark(true);
    }).catch(() => {});
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem('theme_mode', next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme: isDark ? DARK : LIGHT, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
