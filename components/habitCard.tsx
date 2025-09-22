import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Habit } from '../types';
import { useTheme } from '../app/(dashboard)/_layout';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete, onEdit }) => {
  const { colors } = useTheme();

  return (
    <Animated.View 
      entering={FadeInRight.duration(400).springify()}
      style={[
        styles.card,
        { 
          backgroundColor: habit.completed ? colors.primaryLight + '20' : colors.backgroundWhite,
          borderColor: habit.completed ? colors.primary : colors.textSecondary + '20'
        }
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{habit.title}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => onEdit(habit)} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: colors.accent }]}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              console.log('Delete button pressed for habit ID:', habit.id);
              onDelete(habit.id);
            }}
            style={styles.actionButton}
          >
            <Text style={[styles.actionText, { color: '#ef4444' }]}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {habit.description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{habit.description}</Text>
      ) : null}
      
      <Text style={[styles.frequency, { color: colors.textSecondary }]}>
        {habit.frequency === 'daily' ? '📅 Daily' : '📆 Weekly'}
      </Text>
      
      <TouchableOpacity
        style={[
          styles.toggleButton,
          { backgroundColor: habit.completed ? colors.primary : colors.accent }
        ]}
        onPress={() => onToggle(habit.id, !habit.completed)}
      >
        <Text style={styles.toggleButtonText}>
          {habit.completed ? '✅ Completed' : '⏳ Mark Complete'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  frequency: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  toggleButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HabitCard;