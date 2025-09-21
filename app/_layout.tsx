import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { Slot } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from '@/context/AuthContext';
import { LoaderProvider } from '@/context/LoaderContext';
import './../global.css';

// Theme configuration
const themes = {
  light: {
    background: 'bg-gray-50',
    textPrimary: 'text-gray-800',
    textSecondary: 'text-gray-600',
    accent: 'bg-blue-600',
    accentText: 'text-white',
    chartBackground: 'bg-gray-100',
    chartLabel: 'text-black',
  },
  dark: {
    background: 'bg-gray-900',
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-400',
    accent: 'bg-blue-500',
    accentText: 'text-white',
    chartBackground: 'bg-gray-800',
    chartLabel: 'text-gray-200',
  },
  pink: {
    background: 'bg-pink-50',
    textPrimary: 'text-pink-800',
    textSecondary: 'text-pink-600',
    accent: 'bg-pink-500',
    accentText: 'text-white',
    chartBackground: 'bg-pink-100',
    chartLabel: 'text-pink-800',
  },
};

// Define the theme type
type ThemeType = {
  theme: 'light' | 'dark' | 'pink';
  setTheme: (theme: 'light' | 'dark' | 'pink') => void;
  colors: typeof themes.light;
};

const ThemeContext = createContext<ThemeType>({
  theme: 'light',
  setTheme: () => {},
  colors: themes.light,
});

export const useTheme = () => useContext<ThemeType>(ThemeContext);

const RootLayout = () => {
  const [theme, setTheme] = useState<ThemeType['theme']>('light');

  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Please enable notifications for reminders.');
        }
      })();
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: themes[theme] }}>
      <LoaderProvider>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </LoaderProvider>
    </ThemeContext.Provider>
  );
};

export default RootLayout;