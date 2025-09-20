import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { updateHabit } from '../../services/habitService';
import { Habit } from '../../types';

const EditHabit = () => {
  const { habit: habitString } = useLocalSearchParams(); // Get params from navigation
  const habit: Habit = habitString ? JSON.parse(habitString as string) : null;
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState(habit?.title || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(habit?.frequency || 'daily');

  if (!habit) {
    Alert.alert('Error', 'No habit data found');
    router.back();
    return null;
  }

  const handleSaveHabit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to edit a habit');
      return;
    }
    if (!title) {
      Alert.alert('Error', 'Please enter a habit title');
      return;
    }

    try {
      await updateHabit(habit.id, { title, description, frequency });
      Alert.alert('Success', 'Habit updated successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    }
  };

  return (
    <View className="flex-1 p-5 bg-gray-100">
      <Text className="text-2xl font-bold text-gray-700 mb-5 text-center">Edit Habit</Text>
      <TextInput
        className="bg-white rounded-lg p-3 mb-3 text-gray-800"
        placeholder="Habit Title (e.g., Drink Water)"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        className="bg-white rounded-lg p-3 mb-3 text-gray-800"
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
      />
      <View className="flex-row justify-between mb-5">
        <TouchableOpacity
          className={`flex-1 p-3 rounded-lg bg-white items-center mr-2 ${frequency === 'daily' ? 'bg-blue-500' : ''}`}
          onPress={() => setFrequency('daily')}
        >
          <Text className={`text-base ${frequency === 'daily' ? 'text-white' : 'text-gray-700'}`}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 p-3 rounded-lg bg-white items-center ml-2 ${frequency === 'weekly' ? 'bg-blue-500' : ''}`}
          onPress={() => setFrequency('weekly')}
        >
          <Text className={`text-base ${frequency === 'weekly' ? 'text-white' : 'text-gray-700'}`}>Weekly</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity className="bg-blue-600 p-3 rounded-lg items-center" onPress={handleSaveHabit}>
        <Text className="text-white font-bold text-base">Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditHabit;