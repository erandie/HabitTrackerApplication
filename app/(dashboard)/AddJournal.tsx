// app/(dashboard)/AddJournal.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { addJournal } from '../../services/journalService';
import { JournalEntry } from '../../types';

const AddJournal = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<'happy' | 'sad' | 'neutral' | 'excited'>('neutral');

  const handleSaveJournal = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add a journal entry');
      return;
    }
    if (!title) {
      Alert.alert('Error', 'Please enter a journal title');
      return;
    }

    try {
      await addJournal({ title, content, mood, createdAt: new Date() });
      Alert.alert('Success', 'Journal entry added successfully!');
      setTitle('');
      setContent('');
      setMood('neutral');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add journal entry. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-pink-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4">Add New Journal Entry</Text>
      <TextInput
        className="bg-white rounded-lg p-3 mb-3 text-gray-800"
        placeholder="Entry Title (e.g., Productive Day)"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        className="bg-white rounded-lg p-3 mb-3 text-gray-800"
        placeholder="Content (optional)"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <View className="flex-row justify-between mb-3">
        <TouchableOpacity
          className={`flex-1 p-3 rounded-lg mr-2 ${mood === 'happy' ? 'bg-pink-300' : 'bg-gray-200'}`}
          onPress={() => setMood('happy')}
        >
          <Text className="text-center text-gray-800 font-medium">😊</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 p-3 rounded-lg mr-2 ${mood === 'sad' ? 'bg-pink-300' : 'bg-gray-200'}`}
          onPress={() => setMood('sad')}
        >
          <Text className="text-center text-gray-800 font-medium">😢</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 p-3 rounded-lg mr-2 ${mood === 'neutral' ? 'bg-pink-300' : 'bg-gray-200'}`}
          onPress={() => setMood('neutral')}
        >
          <Text className="text-center text-gray-800 font-medium">😐</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 p-3 rounded-lg ml-2 ${mood === 'excited' ? 'bg-pink-300' : 'bg-gray-200'}`}
          onPress={() => setMood('excited')}
        >
          <Text className="text-center text-gray-800 font-medium">🤩</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        className="bg-pink-300 p-3 rounded-lg"
        onPress={handleSaveJournal}
      >
        <Text className="text-white text-center font-bold">Save Entry</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddJournal;