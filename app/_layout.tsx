import React, { createContext, useState } from "react";
import "./../global.css";
import { AuthProvider } from "@/context/AuthContext";
import { LoaderProvider } from "@/context/LoaderContext"
import { Slot } from "expo-router";
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

// Define the theme type
type ThemeType = {
  theme: 'light' | 'dark' | 'pink';
  setTheme: (theme: 'light' | 'dark' | 'pink') => void;
};

const ThemeContext = createContext<ThemeType>({
  theme: 'light',
  setTheme: () => {},
});

const RootLayout = () => {
  const [theme, setTheme] = useState('light');

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
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <LoaderProvider>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </LoaderProvider>
    </ThemeContext.Provider>
  );
};

export default RootLayout;