import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void; // New prop for edit
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete, onEdit }) => {
  return (
    <View style={[styles.card, habit.completed && styles.completedCard]}>
      <View style={styles.header}>
        <Text style={styles.title}>{habit.title}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(habit)}>
            <Text style={styles.edit}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(habit.id)}>
            <Text style={styles.delete}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.description}>{habit.description}</Text>
      <Text style={styles.frequency}>{habit.frequency}</Text>
      <TouchableOpacity
        style={[styles.button, habit.completed && styles.completedButton]}
        onPress={() => onToggle(habit.id, !habit.completed)}
      >
        <Text style={styles.buttonText}>
          {habit.completed ? 'Completed' : 'Mark Complete'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedCard: { backgroundColor: '#e6f7e9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 12 },
  edit: { color: '#4a6bdf', fontSize: 14 }, // Blue for edit
  delete: { color: 'red', fontSize: 14 },
  description: { marginVertical: 8 },
  frequency: { color: '#666', marginBottom: 12 },
  button: {
    backgroundColor: '#4a6bdf',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  completedButton: { backgroundColor: '#4caf50' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default HabitCard;