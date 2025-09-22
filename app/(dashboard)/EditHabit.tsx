import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { updateHabit } from '../../services/habitService';
import { Habit } from '../../types';
import { useTheme } from './_layout';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

// Emerald green color palette
const COLORS = {
  primary: '#10b981',
  primaryLight: '#a7f3d0',
  primaryDark: '#047857',
  background: '#f0fdf4',
  surface: '#ffffff',
  textPrimary: '#1c1917',
  textSecondary: '#57534e',
  accent: '#059669',
  error: '#ef4444',
};

const EditHabit = () => {
  const { habit: habitString } = useLocalSearchParams();
  const habit: Habit = habitString ? JSON.parse(habitString as string) : null;
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
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
      Alert.alert('Success', 'Habit updated successfully! 🌟');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    }
  };

   return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.Text 
        entering={FadeInDown.duration(600).springify()}
        style={[styles.title, { color: colors.textPrimary }]}
      >
        Edit Habit ✏️
      </Animated.Text>
      
      <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.backgroundWhite,
            color: colors.textPrimary,
            borderColor: colors.textSecondary
          }]}
          placeholder="Habit Title (e.g., Drink Water 💧)"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.textArea, { 
            backgroundColor: colors.backgroundWhite,
            color: colors.textPrimary,
            borderColor: colors.textSecondary
          }]}
          placeholder="Description (optional) 📝"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
      </Animated.View>

      <Animated.Text 
        entering={FadeInUp.delay(300).duration(600)}
        style={[styles.sectionLabel, { color: colors.textPrimary }]}
      >
        Frequency 🔄
      </Animated.Text>
      
      <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.frequencyContainer}>
        <TouchableOpacity
          style={[
            styles.frequencyButton,
            { backgroundColor: colors.backgroundWhite, borderColor: colors.textSecondary },
            frequency === 'daily' && styles.frequencyButtonActive
          ]}
          onPress={() => setFrequency('daily')}
        >
          <Text style={[
            styles.frequencyText,
            { color: colors.textSecondary },
            frequency === 'daily' && styles.frequencyTextActive
          ]}>
            Daily 🌞
          </Text>
          {frequency === 'daily' && (
            <Animated.View 
              entering={ZoomIn.duration(300)}
              style={styles.activeIndicator}
            />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.frequencyButton,
            { backgroundColor: colors.backgroundWhite, borderColor: colors.textSecondary },
            frequency === 'weekly' && styles.frequencyButtonActive
          ]}
          onPress={() => setFrequency('weekly')}
        >
          <Text style={[
            styles.frequencyText,
            { color: colors.textSecondary },
            frequency === 'weekly' && styles.frequencyTextActive
          ]}>
            Weekly 📅
          </Text>
          {frequency === 'weekly' && (
            <Animated.View 
              entering={ZoomIn.duration(300)}
              style={styles.activeIndicator}
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.accent }]}
          onPress={handleSaveHabit}
        >
          <Text style={styles.saveButtonText}>Save Changes 💾</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.cancelButton, { borderColor: colors.textSecondary }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel ↩️</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 20,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 0.1,
    borderColor: '#a19f9eff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
    marginTop: 8,
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.2,
    borderColor: '#949392ff',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  frequencyButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  frequencyTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  buttonContainer: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    // borderWidth: 0.5,
    borderColor: COLORS.textSecondary,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditHabit;