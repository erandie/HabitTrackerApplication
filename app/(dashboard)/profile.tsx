import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, ScrollView, RefreshControl, Dimensions, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/app/(dashboard)/_layout';
import Animated, { FadeInUp, FadeInDown, FadeInRight } from 'react-native-reanimated';

// Define our color palette
const COLORS = {
  primary: '#10b981',
  primaryLight: '#a7f3d0',
  primaryDark: '#047857',
  background: '#f8fafc',
  surface: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  accent: '#f59e0b',
  error: '#ef4444',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [habitsCount, setHabitsCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { theme, colors } = useTheme();

  // Load saved image on mount
  useEffect(() => {
    const loadImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem(`profileImage_${user?.uid}`);
        if (savedImage) setImageUri(savedImage);
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    };
    if (user?.uid) loadImage();
  }, [user?.uid]);

  // Pick and process profile image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload a profile picture.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets?.[0].uri) {
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 200 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.PNG, base64: true }
        );
        if (manipResult.base64) {
          await AsyncStorage.setItem(`profileImage_${user?.uid}`, manipResult.base64);
          setImageUri(manipResult.base64);
          Alert.alert('Success', 'Profile picture updated!');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to process image');
        console.error('Image processing error:', error);
      }
    }
  };

  // Fetch counts and streak
  const fetchCounts = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      // Fetch habits count
      const habitsQuery = query(collection(db, 'habits'), where('userId', '==', user.uid));
      const habitsSnapshot = await getDocs(habitsQuery);
      setHabitsCount(habitsSnapshot.size);

      // Fetch journal count
      const journalQuery = query(collection(db, 'journals'), where('userId', '==', user.uid));
      const journalSnapshot = await getDocs(journalQuery);
      setJournalCount(journalSnapshot.size);

      // Improved streak logic
      const completedHabits = habitsSnapshot.docs
        .filter(doc => doc.data().completed)
        .map(doc => doc.data().createdAt?.toDate() || new Date())
        .sort((a, b) => b - a); // Latest first

      let currentStreak = 0;
      if (completedHabits.length > 0) {
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Normalize to start of day
        for (let i = 0; i < completedHabits.length; i++) {
          const habitDate = new Date(completedHabits[i]);
          habitDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((currentDate.getTime() - habitDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === currentStreak) {
            currentStreak++;
            currentDate = habitDate;
          } else {
            break;
          }
        }
      }
      setStreak(currentStreak);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data');
      console.error('Fetch error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => signOut(auth) },
    ]);
  };

  const handleEditProfile = () => {
    router.push('/(dashboard)/EditProfile');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={fetchCounts} 
          colors={[COLORS.primary]} // Keep original green
        />
      }
    >
      {/* Profile Header */}
      <Animated.View entering={FadeInUp.duration(800).springify()} style={styles.header}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image
            style={styles.avatar}
            source={imageUri ? { uri: `data:image/png;base64,${imageUri}` } : require('../../assets/images/habitTrackerAvater.jpeg')}
          />
          <Text style={[styles.changePhotoText, { color: colors.accent }]}>📷 Change Photo</Text>
        </TouchableOpacity>
        
        <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.displayName || 'Hello Friend! 👋'}</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'No email'}</Text>
      </Animated.View>

      {/* Stats Cards */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.backgroundWhite }]}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>{habitsCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Habits 🌱</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.backgroundWhite }]}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>{journalCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Journals 📔</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.backgroundWhite }]}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>{streak}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak 🔥</Text>
        </View>
      </Animated.View>

      {/* Menu Options */}
      <Animated.View entering={FadeInRight.delay(400).duration(600)} style={[styles.menuContainer, { backgroundColor: colors.backgroundWhite }]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(dashboard)/AddNote')}
        >
          <Text style={styles.menuIcon}>📒</Text>
          <Text style={[styles.menuText, { color: colors.textPrimary }]}>My Notes</Text>
          <Text style={[styles.menuArrow, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleEditProfile}
        >
          <Text style={styles.menuIcon}>👤</Text>
          <Text style={[styles.menuText, { color: colors.textPrimary }]}>Edit Profile</Text>
          <Text style={[styles.menuArrow, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.menuIcon}>🔐</Text>
          <Text style={[styles.menuText, { color: colors.textPrimary }]}>Login</Text>
          <Text style={[styles.menuArrow, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.menuIcon}>✍️</Text>
          <Text style={[styles.menuText, { color: colors.textPrimary }]}>Sign Up</Text>
          <Text style={[styles.menuArrow, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert('Settings', 'Settings coming soon! ⚙️')}
        >
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={[styles.menuText, { color: colors.textPrimary }]}>Settings</Text>
          <Text style={[styles.menuArrow, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuText, styles.logoutText, { color: colors.textPrimary }]}>Logout</Text>
          <Text style={[styles.menuArrow, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Motivational Footer */}
      <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textPrimary }]}>Keep growing! 🌟</Text>
        <Text style={[styles.footerSubtext, { color: colors.textSecondary }]}>Every habit counts towards a better you</Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: (SCREEN_WIDTH - 72) / 3, // Account for padding and gaps
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 24,
    borderRadius: 16,
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 0.3,
    borderBottomColor: '#979595ff',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  logoutText: {
    color: COLORS.error,
  },
  menuArrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});