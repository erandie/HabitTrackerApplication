import React, { createContext, useContext, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthProvider } from '@/context/AuthContext';
import { LoaderProvider } from '@/context/LoaderContext';
import '../../global.css'
import { useAuth } from '../../context/AuthContext';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

// Emerald green color palette
const COLORS = {
  primary: '#10b981',
  primaryLight: '#a7f3d0',
  primaryDark: '#047857',
  background: '#f0fdf4',
  surface: '#ffffff',
  textPrimary: '#1c1917',
  textSecondary: '#57534e',
  accent: '#059669',
  accentLight: '#34d399',
};

// Theme configuration
const themes = {
  light: {
    background: COLORS.background,
    textPrimary: COLORS.textPrimary,
    textSecondary: COLORS.textSecondary,
    accent: COLORS.primary,
    accentText: '#ffffff',
    tabBarBackground: COLORS.surface,
    tabBarActive: COLORS.primary,
    tabBarInactive: '#a8a29e',
    shadow: '#00000020',
  },
  dark: {
    background: '#1c1917',
    textPrimary: '#fafaf9',
    textSecondary: '#d6d3d1',
    accent: COLORS.primaryLight,
    accentText: '#1c1917',
    tabBarBackground: '#292524',
    tabBarActive: COLORS.primaryLight,
    tabBarInactive: '#78716c',
    shadow: '#00000040',
  },
  green: {
    background: COLORS.background,
    textPrimary: COLORS.textPrimary,
    textSecondary: COLORS.textSecondary,
    accent: COLORS.primary,
    accentText: '#ffffff',
    tabBarBackground: COLORS.surface,
    tabBarActive: COLORS.primary,
    tabBarInactive: COLORS.textSecondary,
    shadow: '#05966920',
  }
};

// Define the theme type
type ThemeType = {
  theme: 'light' | 'dark' | 'green';
  setTheme: (theme: 'light' | 'dark' | 'green') => void;
  colors: typeof themes.light;
};

const ThemeContext = createContext<ThemeType>({
  theme: 'green',
  setTheme: () => {},
  colors: themes.green,
});

export const useTheme = () => useContext<ThemeType>(ThemeContext);

// Enhanced ThemeToggle with animations
const ThemeToggle = () => {
  const { theme, setTheme, colors } = useTheme();
  
  const ThemeButton = ({ themeName, label, emoji }) => (
    <Animated.View 
      entering={ZoomIn.duration(400).springify()}
      style={styles.themeButtonWrapper}
    >
      <TouchableOpacity
        style={[
          styles.themeButton,
          theme === themeName && { 
            backgroundColor: colors.accent,
            shadowColor: colors.accent,
            shadowOpacity: 0.3,
          }
        ]}
        onPress={() => setTheme(themeName)}
        accessibilityLabel={`Switch to ${themeName} theme`}
      >
        <Text style={[
          styles.themeButtonText,
          theme === themeName && { color: colors.accentText }
        ]}>
          {emoji} {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Animated.View 
      entering={FadeInDown.duration(600)} 
      style={styles.themeContainer}
    >

      <ThemeButton themeName="light" label="Light" emoji="☀️" />
      <ThemeButton themeName="dark" label="Dark" emoji="🌙" />
    </Animated.View>
  );
};

export default function DashboardLayout() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'green'>('green');
  const { user } = useAuth();

  const getTabBarIcon = (name: string, color: string, size: number) => {
    const iconMap = {
      home: 'home-outline',
      habits: 'checkbox-outline',
      journal: 'book-outline',
      profile: 'person-outline',
    };
    
    const emojiMap = {
      home: '🏠',
      habits: '🌱',
      journal: '📔',
      profile: '👤',
    };

    return (
      <Animated.View 
        entering={FadeInDown.duration(500)}
        style={styles.tabIconContainer}
      >
        <Ionicons name={iconMap[name]} size={size} color={color} />
        <Text style={[styles.tabEmoji, { color }]}>{emojiMap[name]}</Text>
      </Animated.View>
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: themes[theme] }}>
      <LoaderProvider>
        <AuthProvider>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: themes[theme].tabBarActive,
              tabBarInactiveTintColor: themes[theme].tabBarInactive,
              tabBarStyle: { 
                backgroundColor: themes[theme].tabBarBackground,
                borderTopWidth: 0,
                height: 100,
                paddingBottom: 15,
                paddingTop: 10,
                shadowColor: themes[theme].shadow,
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 8,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
                marginTop: 4,
              },
              headerStyle: {
                backgroundColor: themes[theme].background,
                shadowColor: themes[theme].shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 4,
              },
              headerTitleStyle: {
                color: themes[theme].textPrimary,
                fontWeight: '700',
                fontSize: 20,
              },
              // headerTitleAlign: 'center',
              headerShadowVisible: true,
            }}
          >
            <Tabs.Screen
              name="home"
              options={{
                title: `${user?.displayName || 'Guest'}'s Diary 🖋️`,
                headerRight: () => <ThemeToggle />,
                tabBarLabel: 'Home',
                tabBarIcon: ({ color, size }) => getTabBarIcon('home', color, size),
              }}
            />

            <Tabs.Screen
              name="habits"
              options={{
                title: 'My Habits 🌱',
                headerRight: () => <ThemeToggle />,
                tabBarLabel: 'Habits',
                tabBarIcon: ({ color, size }) => getTabBarIcon('habits', color, size),
              }}
            />
            
            <Tabs.Screen
              name="journal"
              options={{
                title: 'My Journal 📔',
                headerRight: () => <ThemeToggle />,
                tabBarLabel: 'Journal',
                tabBarIcon: ({ color, size }) => getTabBarIcon('journal', color, size),
              }}
            />
            
            <Tabs.Screen
              name="profile"
              options={{
                title: 'My Profile 👤',
                headerRight: () => <ThemeToggle />,
                tabBarLabel: 'Profile',
                tabBarIcon: ({ color, size }) => getTabBarIcon('profile', color, size),
              }}
            />
            
            {/* Hidden screens */}
            <Tabs.Screen name="AddHabit" options={{ href: null }} />
            <Tabs.Screen name="EditHabit" options={{ href: null }} />
            <Tabs.Screen name="AddJournal" options={{ href: null }} />
            <Tabs.Screen name="EditJournal" options={{ href: null }} />
            <Tabs.Screen name="EditProfile" options={{ href: null }} />
            <Tabs.Screen name="AddNote" options={{ href: null }} />
          </Tabs>
        </AuthProvider>
      </LoaderProvider>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  themeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: 16,
    gap: 8,
  },
  themeButtonWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  themeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e7e5e4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#57534e',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 4
  },
  tabEmoji: {
    fontSize: 10,
    fontWeight: '500',
    
  },
});