import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../_layout';

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
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchCounts} colors={['#4a6bdf']} />}
    >
      <View className="flex-1 p-5 bg-gray-50">
        <View className="items-center mb-7">
          <TouchableOpacity onPress={pickImage} accessibilityLabel="Change profile picture">
            <Image
              className="w-24 h-24 rounded-full bg-gray-200"
              source={imageUri ? { uri: `data:image/png;base64,${imageUri}` } : require('../../assets/images/habitTrackerAvater.jpeg')}
            />
            <Text className="text-sm text-blue-600 mt-2">Change Profile Picture</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 mb-1">{user?.displayName || 'No nickname'}</Text>
          <Text className="text-base text-gray-600">{user?.email || 'No email'}</Text>
        </View>

        <View className="flex-row justify-between mb-7">
          <View className="items-center bg-white p-4 rounded-lg shadow-md shadow-black/10 w-[30%]">
            <Text className="text-lg font-bold text-blue-600 mb-1">{habitsCount}</Text>
            <Text className="text-xs text-gray-600 text-center">Habits</Text>
          </View>
          <View className="items-center bg-white p-4 rounded-lg shadow-md shadow-black/10 w-[30%]">
            <Text className="text-lg font-bold text-blue-600 mb-1">{journalCount}</Text>
            <Text className="text-xs text-gray-600 text-center">Journal Entries</Text>
          </View>
          <View className="items-center bg-white p-4 rounded-lg shadow-md shadow-black/10 w-[30%]">
            <Text className="text-lg font-bold text-blue-600 mb-1">{streak}</Text>
            <Text className="text-xs text-gray-600 text-center">Day Streak</Text>
          </View>
        </View>

        <View className="bg-white rounded-lg shadow-md shadow-black/10">

        <TouchableOpacity
          className="p-4 border-b border-gray-200"
          onPress={() => router.push('/(dashboard)/AddNote')}
          accessibilityLabel="Add Note"
        >
          <Text className={`text-base ${colors.textPrimary}`}>📒 Notes</Text>
        </TouchableOpacity>
        
          <TouchableOpacity
            className="p-4 border-b border-gray-200"
            onPress={handleEditProfile}
            accessibilityLabel="Edit profile"
          >
            <Text className="text-base text-gray-800">Edit Profile</Text>
          </TouchableOpacity>
          {/* Placeholder for future implementation */}
          {/* <TouchableOpacity className="p-4 border-b border-gray-200" accessibilityLabel="Settings">
            <Text className="text-base text-gray-800">Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity className="p-4 border-b border-gray-200" accessibilityLabel="Help and support">
            <Text className="text-base text-gray-800">Help & Support</Text>
          </TouchableOpacity> */}

          <TouchableOpacity className="p-4" onPress={handleLogout} accessibilityLabel="Setting">
            <Text className="text-base text-black-600">Setting</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4"
            accessibilityLabel="Go to Login"
            onPress={() => router.push('/login')}
          >
            <Text className="text-base text-black-600">Login</Text>
          </TouchableOpacity>

          <TouchableOpacity className="p-4" onPress={handleLogout} accessibilityLabel="Logout">
            <Text className="text-base text-red-600">Logout</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </ScrollView>
  );
}