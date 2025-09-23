import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useTheme } from '../(dashboard)/_layout';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function AddNote() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const [text, setText] = useState('');

  const handleSave = async () => {
    const [title, ...noteLines] = text.split('\n').filter(line => line.trim());
    const note = noteLines.join(' ');

    if (!title || !note) {
      Alert.alert('Error', 'Please enter both a title and a note.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to save a note.');
      return;
    }

    try {
      await AddNote({ title, note })
      Alert.alert('Success', 'Note saved successfully!');
      
      router.back();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save note: ' + error.message);
    }
  };

return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.Text 
        entering={FadeInDown.duration(600).springify()}
        style={[styles.title, { color: colors.textPrimary }]}
      >
        Add New Note 📝
      </Animated.Text>
      
      <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { 
          backgroundColor: colors.backgroundWhite,
          borderColor: colors.textSecondary 
        }]}>
          <TextInput
            style={[styles.textInput, { color: colors.textPrimary }]}
            placeholder="Title\n\nStart writing your note here..."
            placeholderTextColor={colors.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
          <View style={[styles.divider, { backgroundColor: colors.textSecondary }]} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.accent }]}
          onPress={handleSave}
          accessibilityLabel="Save Note"
        >
          <Text style={styles.saveButtonText}>💾 Save Note</Text>
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
    marginBottom: 32,
  },
  inputWrapper: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000000ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '500',
    minHeight: 200,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    marginVertical: 12,
    opacity: 0.3,
  },
  buttonContainer: {
    paddingHorizontal: 20,
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
});