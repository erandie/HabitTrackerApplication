import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.header}>Edit Habit</Text>
      <TextInput
        style={styles.input}
        placeholder="Habit Title (e.g., Drink Water)"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
      />
      <View style={styles.frequencyContainer}>
        <TouchableOpacity
          style={[styles.frequencyButton, frequency === 'daily' && styles.selectedFrequency]}
          onPress={() => setFrequency('daily')}
        >
          <Text style={styles.frequencyText}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.frequencyButton, frequency === 'weekly' && styles.selectedFrequency]}
          onPress={() => setFrequency('weekly')}
        >
          <Text style={styles.frequencyText}>Weekly</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveHabit}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  frequencyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedFrequency: {
    backgroundColor: '#4a6bdf',
  },
  frequencyText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4a6bdf',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditHabit;