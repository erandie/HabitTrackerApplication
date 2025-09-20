import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete, onEdit }) => {
  return (
    <View className={`bg-white rounded-lg p-4 mb-3 shadow-md ${habit.completed ? 'bg-green-50' : ''}`}>
      <View className="flex-row justify-between items-center">
        <Text className="text-lg font-bold">{habit.title}</Text>
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={() => onEdit(habit)}>
            <Text className="text-blue-600 text-sm">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              console.log('Delete button pressed for habit ID:', habit.id); // Debug log
              onDelete(habit.id);
            }}
          >
            <Text className="text-red-600 text-sm">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text className="text-gray-600 mt-2">{habit.description}</Text>
      <Text className="text-gray-500 mb-3">{habit.frequency}</Text>
      <TouchableOpacity
        className={`bg-blue-600 p-2 rounded-md items-center ${habit.completed ? 'bg-green-600' : ''}`}
        onPress={() => onToggle(habit.id, !habit.completed)}
      >
        <Text className="text-white font-bold">
          {habit.completed ? 'Completed' : 'Mark Complete'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HabitCard;