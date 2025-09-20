// app/(dashboard)/EditProfile.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../firebase';

export default function EditProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      await updateProfile(user, { displayName });
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Unknown error';
      Alert.alert('Error', 'Failed to update profile: ' + errorMessage);
    }
  };

  return (
    <View className="flex-1 p-4 bg-pink-50">
      <Text className="text-2xl font-bold text-gray-800 mb-4">Edit Profile</Text>
      <TextInput
        className="bg-white rounded-lg p-3 mb-3 text-gray-800"
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TouchableOpacity className="bg-pink-300 p-3 rounded-lg" onPress={handleSave}>
        <Text className="text-white text-center font-bold">Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}