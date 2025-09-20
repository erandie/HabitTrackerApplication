import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import * as Toast from 'react-native-toast-message';

export default function EditProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState(''); // Current password for re-auth
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (!password && (email !== user.email || newPassword)) {
      Alert.alert('Error', 'Please enter your current password for verification');
      return;
    }

    setIsLoading(true);
    try {
      let changesMade = false;

      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
        changesMade = true;
        await logChange('displayName', displayName);
      }

      if (email && email !== user.email) {
        const credential = EmailAuthProvider.credential(user.email ?? '', password);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, email);
        changesMade = true;
        await logChange('email', email);
        Alert.alert('Note', 'Email change requires re-login next time.');
      }

      if (newPassword) {
        const credential = EmailAuthProvider.credential(user.email ?? '', password);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        changesMade = true;
        await logChange('password', 'updated');
        Alert.alert('Note', 'Password updated successfully.');
      }

      if (changesMade) {
        Toast.show({
          type: 'success',
          text1: 'Profile Updated!',
          text2: 'Your changes have been saved.',
          visibilityTime: 3000,
        });
        router.replace('/(dashboard)/profile'); // Adjust path if needed
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      Alert.alert('Error', `Failed to update profile: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const logChange = async (field: string, value: string) => {
    await addDoc(collection(db, 'profileChanges'), {
      userId: user?.uid,
      field,
      value,
      timestamp: serverTimestamp(),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User: {user?.displayName || 'No user'}</Text>
      <TextInput style={styles.input} placeholder="Display Name" value={displayName} onChangeText={setDisplayName} />
      <TextInput style={styles.input} placeholder="New Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Current Password (for verification)" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="New Password (optional)" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={isLoading}
      >
        {isLoading ? <ActivityIndicator color="#fff" size="large" /> : <Text style={styles.buttonText}>Save Changes</Text>}
      </TouchableOpacity>
      {/* <Toast.Toast /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f6fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#2d3748' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, color: '#2d3748' },
  button: { padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#4a6bdf' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});