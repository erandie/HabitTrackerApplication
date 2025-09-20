// app/(dashboard)/EditProfile.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { auth } from '../../firebase';

export default function EditProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState(''); // For re-auth
  const [newPassword, setNewPassword] = useState('');

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      // Update display name
      await updateProfile(user, { displayName });
      
      // Update email (requires re-authentication)
      if (email && email !== user.email) {
        const credential = EmailAuthProvider.credential(user.email ?? '', password);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, email);
        Alert.alert('Note', 'Email change requires re-login next time.');
      }

      // Update password
      if (newPassword) {
        const credential = EmailAuthProvider.credential(user.email ?? '', password);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword); // Note: updatePassword is a method on user
        Alert.alert('Note', 'Password updated successfully.');
      }

      Alert.alert('Success', 'Profile updated!');
      router.back();
    } catch (error) {
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: string }).message)
        : 'An unexpected error occurred';
      Alert.alert('Error', errorMessage);
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
      <TextInput
        className="bg-white rounded-lg p-3 mb-3 text-gray-800"
        placeholder="New Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        className="bg-white rounded-lg p-3 mb-3 text-gray-800"
        placeholder="Current Password (for verification)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        className="bg-white rounded-lg p-3 mb-3 text-gray-800"
        placeholder="New Password (optional)"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TouchableOpacity className="bg-pink-300 p-3 rounded-lg" onPress={handleSave}>
        <Text className="text-white text-center font-bold">Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}