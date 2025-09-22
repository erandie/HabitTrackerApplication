import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { addJournal } from '../../services/journalService';
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

const moodConfig = {
  happy: { emoji: '😊', label: 'Happy', color: '#fbbf24' },
  sad: { emoji: '😢', label: 'Sad', color: '#60a5fa' },
  neutral: { emoji: '😐', label: 'Neutral', color: '#9ca3af' },
  excited: { emoji: '😍', label: 'Excited', color: '#f472b6' }
};

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
      Alert.alert('Success', 'Journal entry added successfully! 📖');
      setTitle('');
      setContent('');
      setMood('neutral');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add journal entry. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Text 
        entering={FadeInDown.duration(600).springify()}
        style={styles.title}
      >
        New Journal Entry 📔
      </Animated.Text>
      
      <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Entry Title (e.g., Amazing Day! 🌟)"
          placeholderTextColor={COLORS.textSecondary}
          value={title}
          onChangeText={setTitle}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What's on your mind? 💭"
          placeholderTextColor={COLORS.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </Animated.View>

      <Animated.Text 
        entering={FadeInUp.delay(300).duration(600)}
        style={styles.sectionLabel}
      >
        How are you feeling? ❤️
      </Animated.Text>
      
      <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.moodContainer}>
        {Object.entries(moodConfig).map(([moodKey, moodData]) => (
          <TouchableOpacity
            key={moodKey}
            style={[
              styles.moodButton,
              mood === moodKey && [
                styles.moodButtonActive,
                { borderColor: moodData.color }
              ]
            ]}
            onPress={() => setMood(moodKey as any)}
          >
            <Text style={styles.moodEmoji}>{moodData.emoji}</Text>
            <Text style={[
              styles.moodLabel,
              mood === moodKey && styles.moodLabelActive
            ]}>
              {moodData.label}
            </Text>
            {mood === moodKey && (
              <Animated.View 
                entering={ZoomIn.duration(300)}
                style={[styles.activeIndicator, { backgroundColor: moodData.color }]}
              />
            )}
          </TouchableOpacity>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveJournal}
        >
          <Text style={styles.saveButtonText}>Save Entry 💾</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel ↩️</Text>
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
    borderWidth: 2,
    borderColor: '#e7e5e4',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
    marginTop: 8,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 8,
  },
  moodButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e7e5e4',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodButtonActive: {
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  moodLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
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
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddJournal;