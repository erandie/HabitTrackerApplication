import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { addHabit } from '../../services/habitService';
import { useAuth } from '../../context/AuthContext';

const AddHabit = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const handleSaveHabit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add a habit');
      return;
    }
    if (!title) {
      Alert.alert('Error', 'Please enter a habit title');
      return;
    }

    try {
      await addHabit({ title, description, frequency, completed: false });
      Alert.alert('Success', 'Habit added successfully!');
      setTitle('');
      setDescription('');
      setFrequency('daily');
      router.back(); // Navigate back to Habits screen
    } catch (error) {
      Alert.alert('Error', 'Failed to add habit. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-pink-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4">Add New Habit</Text>
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
      <View className="flex-row justify-between mb-3">
        <TouchableOpacity
          className={`flex-1 p-3 rounded-lg mr-2 ${frequency === 'daily' ? 'bg-pink-300' : 'bg-gray-200'}`}
          onPress={() => setFrequency('daily')}
        >
          <Text className="text-center text-gray-800 font-medium">Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 p-3 rounded-lg ml-2 ${frequency === 'weekly' ? 'bg-pink-300' : 'bg-gray-200'}`}
          onPress={() => setFrequency('weekly')}
        >
          <Text className="text-center text-gray-800 font-medium">Weekly</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        className="bg-pink-300 p-3 rounded-lg"
        onPress={handleSaveHabit}
      >
        <Text className="text-white text-center font-bold">Save Habit</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddHabit;