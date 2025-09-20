// app/(dashboard)/journal.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { JournalEntry } from '../../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { addJournal, updateJournal, deleteJournal } from '../../services/journalService';
import JournalCard from '../../components/journalCard';
import * as Notifications from 'expo-notifications';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function JournalScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  

  useEffect(() => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to view journal');
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'journals'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entriesData: JournalEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entriesData.push({
          id: doc.id,
          title: data.title || 'Untitled',
          content: data.content || '',
          mood: data.mood || 'neutral',
          userId: data.userId || user.uid,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        } as JournalEntry);
      });
      setEntries(entriesData);
      applyFilters(entriesData); // Apply filters on initial load
      setLoading(false);
    }, (error) => {
      Alert.alert('Error', 'Failed to load journal entries: ' + error.message);
      console.error('Snapshot error:', error);
      setLoading(false);
    });

    if (Platform.OS !== 'web') {
      scheduleDailyNotification();
    }

    // Theme Styling
    const { theme } = useTheme();
    const applyTheme = () => {
      if (theme === 'dark') {
        document.body.style.backgroundColor = '#1a202c';
        document.body.style.color = '#e2e8f0';
      } else if (theme === 'pink') {
        document.body.style.backgroundColor = '#f5e6e8';
        document.body.style.color = '#4a2c2a';
      } else {
        document.body.style.backgroundColor = '#f5f6fa';
        document.body.style.color = '#2d3748';
      }
    };
    applyTheme();
    return () => unsubscribe();

    return () => unsubscribe();
  }, [user]);

  const applyFilters = (data: JournalEntry[]) => {
    let filtered = [...data];
    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (moodFilter !== 'all') {
      filtered = filtered.filter(entry => entry.mood === moodFilter);
    }
    setFilteredEntries(filtered);
  };

  const scheduleDailyNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Journal Time! 📝',
        body: 'Take a moment to record your thoughts today.',
        data: { screen: 'journal' },
      },
      trigger: { seconds: 10 }, // Test with 10 seconds
    });
  };

  const addNewEntry = async () => {
    router.push('/(dashboard)/AddJournal');
    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Great Job! 🎉',
          body: 'You added a journal entry. Want to add more?',
          data: { screen: 'journal' },
        },
        trigger: { seconds: 5 },
      });
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteJournal(id);
              Alert.alert('Success', 'Entry deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete entry: ' + error.message);
              console.error('Delete error:', error);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (entry: JournalEntry) => {
    router.push({
      pathname: '/(dashboard)/EditJournal',
      params: { entry: JSON.stringify(entry) },
    });
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <JournalCard
      entry={item}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  );

  return (
    <View className="flex-1 p-5 bg-gray-50">
      <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">My Journal</Text>
      <View className="mb-4">
        <TextInput
          className="bg-white rounded-lg p-2 text-gray-800 mb-2"
          placeholder="Search by title or content..."
          value={searchQuery}
          onChangeText={text => {
            setSearchQuery(text);
            applyFilters(entries);
          }}
        />
        <View className="bg-white rounded-lg p-1">
          <Picker
            selectedValue={moodFilter}
            onValueChange={(value) => {
              setMoodFilter(value);
              applyFilters(entries);
            }}
            className="text-gray-800"
          >
            <Picker.Item label="All Moods" value="all" />
            <Picker.Item label="Happy 😊" value="happy" />
            <Picker.Item label="Sad 😢" value="sad" />
            <Picker.Item label="Neutral 😐" value="neutral" />
          </Picker>
        </View>
      </View>
      {loading ? (
        <Text className="text-base text-gray-500 text-center mt-5">Loading entries...</Text>
      ) : filteredEntries.length === 0 ? (
        <Text className="text-base text-gray-500 text-center mt-5">No entries match your filter. Add one!</Text>
      ) : (
        <FlatList
          data={filteredEntries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          contentContainerClassName="pb-20"
        />
      )}
      <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-600 rounded-full p-3.5 shadow-md elevation-3" onPress={addNewEntry}>
        <Text className="text-white font-bold text-lg">+ Add Entry</Text>
      </TouchableOpacity>
    </View>
  );
}