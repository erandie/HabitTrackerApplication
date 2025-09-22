import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useTheme } from '../_layout';

export default function AddNote() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const [text, setText] = useState('');

  

  const handleSave = async () => {
    const [title, ...noteLines] = text.split('\n').filter(line => line.trim());
    const note = noteLines.join(' ');

    if (!title || !note) {
      Alert.alert('Error', 'Please enter both a title and a note.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to save a note.');
      return;
    }

    try {
      await AddNote({ title, note })
      Alert.alert('Success', 'Note saved successfully!');
      
      router.back();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save note: ' + error.message);
    }
  };

  return (
    <View className={`flex-1 p-5 ${colors.background}`}>
      <Text className={`text-2xl font-bold mb-4 ${colors.textPrimary}`}>Add Note</Text>
      <View className={`border border-gray-300 rounded-lg p-3 mb-4 ${colors.inputBackground}`}>
        <TextInput
          className={`text-base ${colors.textPrimary}`}
          placeholder={`Title\n\nNote`}
          placeholderTextColor={colors.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
        />
        <View className="border-t border-gray-300 opacity-50 my-2" />
      </View>
      <TouchableOpacity
        className={`${colors.button} rounded-md p-3`}
        onPress={handleSave}
        accessibilityLabel="Save Note"
      >
        <Text className={`${colors.accentText} text-center text-base font-medium`}>Save Note</Text>
      </TouchableOpacity>
    </View>
  );
}