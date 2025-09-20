// app/(dashboard)/profile.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [habitsCount, setHabitsCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [streak, setStreak] = useState(0); // Placeholder for streak logic

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user) return;

      // Fetch habits count
      const habitsQuery = query(collection(db, 'habits'), where('userId', '==', user.uid));
      const habitsSnapshot = await getDocs(habitsQuery);
      setHabitsCount(habitsSnapshot.size);

      // Fetch journal entries count
      const journalQuery = query(collection(db, 'journals'), where('userId', '==', user.uid));
      const journalSnapshot = await getDocs(journalQuery);
      setJournalCount(journalSnapshot.size);

      // Placeholder for streak (implement logic based on completed habits)
      setStreak(7); // Replace with actual streak calculation
    };

    fetchCounts();
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => signOut(auth) },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/(dashboard)/EditProfile'); // Navigate to edit screen (to be created)
  };

  return (
    <View className="flex-1 p-5 bg-gray-50">
      <View className="items-center mb-7">
        <View className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-4">
          <Text className="text-3xl text-white font-bold">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text className="text-xl font-bold text-gray-800 mb-1">User Name</Text>
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
        <TouchableOpacity className="p-4 border-b border-gray-200" onPress={handleEditProfile}>
          <Text className="text-base text-gray-800">Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity className="p-4 border-b border-gray-200">
          <Text className="text-base text-gray-800">Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity className="p-4 border-b border-gray-200">
          <Text className="text-base text-gray-800">Help & Support</Text>
        </TouchableOpacity>
        <TouchableOpacity className="p-4" onPress={handleLogout}>
          <Text className="text-base text-red-600">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}