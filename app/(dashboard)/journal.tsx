import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Mock data for now - will replace with Firebase later
const mockEntries = [
  { 
    id: '1', 
    title: 'Productive Day', 
    content: 'Today I completed all my tasks and felt really accomplished...', 
    mood: 'happy',
    date: '2023-06-15'
  },
  { 
    id: '2', 
    title: 'Challenging Morning', 
    content: 'Woke up feeling tired but pushed through my morning routine...', 
    mood: 'neutral',
    date: '2023-06-14'
  },
  { 
    id: '3', 
    title: 'Exciting News', 
    content: 'Got accepted into the program I applied for! So excited...', 
    mood: 'excited',
    date: '2023-06-13'
  }
];

const getMoodEmoji = (mood: string) => {
  switch(mood) {
    case 'happy': return '😊';
    case 'sad': return '😢';
    case 'neutral': return '😐';
    case 'excited': return '🤩';
    default: return '📝';
  }
};

export default function JournalScreen() {
  const [entries, setEntries] = useState(mockEntries);
  const { user } = useAuth();
  const navigation = useNavigation();

  const deleteEntry = (id: string) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this journal entry?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => setEntries(entries.filter(entry => entry.id !== id)) }
      ]
    );
  };

  const addNewEntry = () => {
    navigation.navigate('AddJournal'); // We'll create this screen later
  };

  const renderEntry = ({ item }: { item: any }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle}>{item.title}</Text>
        <View style={styles.entryMeta}>
          <Text style={styles.entryMood}>{getMoodEmoji(item.mood)}</Text>
          <Text style={styles.entryDate}>{item.date}</Text>
        </View>
      </View>
      <Text style={styles.entryContent} numberOfLines={3}>{item.content}</Text>
      <View style={styles.entryActions}>
        <TouchableOpacity onPress={() => navigation.navigate('EditJournal', { entry: item })}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteEntry(item.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Journal</Text>
      
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.entriesList}
      />
      
      <TouchableOpacity style={styles.addButton} onPress={addNewEntry}>
        <Text style={styles.addButtonText}>+ Add Entry</Text>
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
  entriesList: {
    paddingBottom: 80
  },
  entryCard: {
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  entryMeta: {
    alignItems: 'flex-end'
  },
  entryMood: {
    fontSize: 20,
    marginBottom: 4
  },
  entryDate: {
    fontSize: 12,
    color: '#888'
  },
  entryContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12
  },
  entryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  editText: {
    color: '#4a6bdf',
    marginRight: 16,
    fontSize: 14
  },
  deleteText: {
    color: 'red',
    fontSize: 14
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