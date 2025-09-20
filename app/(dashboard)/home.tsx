// app/(dashboard)/home.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => signOut(auth).catch(error => Alert.alert('Error', error.message)) },
      ]
    );
  };

  return (
    <View className="flex-1 p-5 bg-gray-50">
      <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">Welcome, {user?.email || 'Guest'}</Text>
      <Text className="text-base text-gray-600 mb-6 text-center">Track your habits and journal your thoughts</Text>

      <View className="flex-row justify-between mb-6">
        <View className="w-[48%] bg-gray-200 p-4 rounded-lg shadow-md shadow-black/10">
          <Text className="text-lg font-bold text-gray-800 mb-2">Habits</Text>
          <Text className="text-sm text-gray-600 mb-3">Track your daily habits</Text>
          <TouchableOpacity
            className="bg-pink-400 rounded-md p-2"
            onPress={() => router.push('/habits')}
          >
            <Text className="text-white text-center text-base font-medium">View Habits</Text>
          </TouchableOpacity>
        </View>

        <View className="w-[48%] bg-gray-200 p-4 rounded-lg shadow-md shadow-black/10">
          <Text className="text-lg font-bold text-gray-800 mb-2">Journal</Text>
          <Text className="text-sm text-gray-600 mb-3">Record your thoughts</Text>
          <TouchableOpacity
            className="bg-pink-400 rounded-md p-2"
            onPress={() => router.push('/journal')}
          >
            <Text className="text-white text-center text-base font-medium">View Journal</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        className="bg-red-600 rounded-md p-3 mt-auto"
        onPress={handleLogout}
      >
        <Text className="text-white text-center text-base font-medium">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}