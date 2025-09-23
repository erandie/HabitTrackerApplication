// app/(dashboard)/EditJournal.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { updateJournal } from '../../services/journalService';
import { JournalEntry } from '../../types';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '../(dashboard)/_layout';
import { red } from 'react-native-reanimated/lib/typescript/Colors';

const EditJournal = () => {
  const { entry: entryString } = useLocalSearchParams();
  const entry: JournalEntry = entryString ? JSON.parse(entryString as string) : null;
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState<'happy' | 'sad' | 'neutral' | 'excited'>(entry?.mood || 'neutral');
  const { colors } = useTheme();

  if (!entry) {
    Alert.alert('Error', 'No entry data found');
    router.back();
    return null;
  }

  const handleSaveJournal = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to edit a journal entry');
      return;
    }
    if (!title) {
      Alert.alert('Error', 'Please enter a journal title');
      return;
    }

    try {
      await updateJournal(entry.id, { title, content, mood });
      Alert.alert('Success', 'Journal entry updated successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update journal entry. Please try again.');
    }
  };

  const moodConfig = {
  happy: { emoji: '😊', label: 'Happy', color: '#fbbf24' },
  sad: { emoji: '😢', label: 'Sad', color: '#60a5fa' },
  neutral: { emoji: '😐', label: 'Neutral', color: '#9ca3af' },
  excited: { emoji: '🤩', label: 'Excited', color: '#f472b6' }
};

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.Text 
        entering={FadeInDown.duration(600).springify()}
        style={[styles.title, { color: colors.textPrimary }]}
      >
        Edit Journal Entry 📔
      </Animated.Text>
      
      <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.backgroundWhite,
            color: colors.textPrimary,
            borderColor: colors.textSecondary
          }]}
          placeholder="Entry Title (e.g., Amazing Day! 🌟)"
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
          placeholder="What's on your mind? 💭"
          placeholderTextColor={colors.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </Animated.View>

      <Animated.Text 
        entering={FadeInUp.delay(300).duration(600)}
        style={[styles.sectionLabel, { color: colors.textPrimary }]}
      >
        How are you feeling? ❤️
      </Animated.Text>
      
      <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.moodContainer}>
        {Object.entries(moodConfig).map(([moodKey, moodData]) => (
          <TouchableOpacity
            key={moodKey}
            style={[
              styles.moodButton,
              { backgroundColor: colors.backgroundWhite, borderColor: colors.textSecondary },
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
              { color: colors.textSecondary },
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
          style={[styles.saveButton, { backgroundColor: colors.accent }]}
          onPress={handleSaveJournal}
        >
          <Text style={styles.saveButtonText}>💾 Save Changes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.cancelButton, { borderColor: colors.textSecondary }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>↩️ Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 0.2,
    borderColor: '#686666ff' ,
    fontWeight: '500',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
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
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 0.2,
    borderColor: '#696767ff'
  },
  moodButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    textAlign: 'center',
  },
  moodLabelActive: {
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
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
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
    // borderWidth: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditJournal;