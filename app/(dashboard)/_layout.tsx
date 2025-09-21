import React, { createContext, useContext, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';
import { AuthProvider } from '@/context/AuthContext';
import { LoaderProvider } from '@/context/LoaderContext';
import '../../global.css'
import { useAuth } from '../../context/AuthContext';

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

// Theme toggle component
const ThemeToggle = () => {
  const { theme, setTheme, colors } = useTheme();
  return (
    <View className="flex-row justify-center mr-4">
      <TouchableOpacity
        className={`px-2 py-1 rounded-md mr-1 ${theme === 'light' ? colors.accent : 'bg-gray-300'}`}
        onPress={() => setTheme('light')}
        accessibilityLabel="Switch to light theme"
      >
        <Text className={`text-sm font-medium ${theme === 'light' ? colors.accentText : 'text-gray-600'}`}>
          Light
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`px-2 py-1 rounded-md mr-1 ${theme === 'dark' ? colors.accent : 'bg-gray-300'}`}
        onPress={() => setTheme('dark')}
        accessibilityLabel="Switch to dark theme"
      >
        <Text className={`text-sm font-medium ${theme === 'dark' ? colors.accentText : 'text-gray-600'}`}>
          Dark
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`px-2 py-1 rounded-md ${theme === 'pink' ? colors.accent : 'bg-gray-300'}`}
        onPress={() => setTheme('pink')}
        accessibilityLabel="Switch to pink theme"
      >
        <Text className={`text-sm font-medium ${theme === 'pink' ? colors.accentText : 'text-gray-600'}`}>
          Pink
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function DashboardLayout() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'pink'>('light');
  const { user } = useAuth();

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: themes[theme] }}>
      <LoaderProvider>
        <AuthProvider>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: '#D4A5A5', // Pink for active tab
              tabBarInactiveTintColor: '#666', // Gray for inactive
              tabBarStyle: { backgroundColor: '#F5E6E8' }, // Cozy pink background
            }}
          >
            <Tabs.Screen
              name="home"
              options={{
                title: `${user?.displayName || 'Guest'}'s Diary 🖋️`,
                headerRight: () => <ThemeToggle />,
                tabBarLabel: 'Home', 
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="home-outline" size={size} color={color} />
                ),
              }}
            />

            <Tabs.Screen
              name="habits"
              options={{
                title: 'Habits',
                headerRight: () => <ThemeToggle />,
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="checkbox-outline" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="journal"
              options={{
                title: 'Journal',
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="book-outline" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: 'Profile',
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="person-outline" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen name="AddHabit" options={{ href: null }} />
            <Tabs.Screen name="EditHabit" options={{ href: null }} />
            <Tabs.Screen name="AddJournal" options={{ href: null }} />
            <Tabs.Screen name="EditJournal" options={{ href: null }} />
            <Tabs.Screen name="EditProfile" options={{ href: null }} />
          </Tabs>
        </AuthProvider>
      </LoaderProvider>
    </ThemeContext.Provider>
  );
}