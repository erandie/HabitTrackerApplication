import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Mock data for now - will replace with Firebase later
const mockHabits = [
  { id: '1', title: 'Morning Meditation', description: '10 minutes daily', frequency: 'Daily', completed: true },
  { id: '2', title: 'Exercise', description: '30 minutes workout', frequency: 'Daily', completed: false },
  { id: '3', title: 'Read Book', description: 'Read 20 pages', frequency: 'Daily', completed: false },
  { id: '4', title: 'No Sugar', description: 'Avoid sugary foods', frequency: 'Daily', completed: true },
];

export default function HabitsScreen() {
  const [habits, setHabits] = useState(mockHabits);
  const { user } = useAuth();
  const navigation = useNavigation();

  const toggleHabitCompletion = (id: string) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
  };

  const deleteHabit = (id: string) => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => setHabits(habits.filter(habit => habit.id !== id)) }
      ]
    );
  };

  const addNewHabit = () => {
    navigation.navigate('AddHabit'); // We'll create this screen later
  };

    const renderHabit = ({ item }: { item: any }) => (
      <View style={[styles.habitCard, item.completed && styles.completedCard]}>
        <View style={styles.habitHeader}>
          <Text style={styles.habitTitle}>{item.title}</Text>
          <TouchableOpacity onPress={() => deleteHabit(item.id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.habitDesc}>{item.description}</Text>
        <Text style={styles.habitFreq}>{item.frequency}</Text>
        <TouchableOpacity 
          style={[styles.completeButton, item.completed && styles.completedButton]}
          onPress={() => toggleHabitCompletion(item.id)}
        >
          <Text style={styles.completeButtonText}>
            {item.completed ? 'Completed' : 'Mark Complete'}
          </Text>
        </TouchableOpacity>
      </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Habits</Text>
      
      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.habitsList}
      />
      
      <TouchableOpacity style={styles.addButton} onPress={addNewHabit}>
        <Text style={styles.addButtonText}>+ Add New Habit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  habitsList: {
    paddingBottom: 80
  },
  habitCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  completedCard: {
    backgroundColor: '#e6f7e9'
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  deleteText: {
    color: 'red',
    fontSize: 14
  },
  habitDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  habitFreq: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12
  },
  completeButton: {
    backgroundColor: '#4a6bdf',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  completedButton: {
    backgroundColor: '#4caf50'
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4a6bdf',
    padding: 16,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});