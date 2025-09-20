// app/(dashboard)/journal.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { JournalEntry } from '../../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { addJournal, updateJournal, deleteJournal } from '../../services/journalService';
import JournalCard from '../../components/journalCard';
import * as Notifications from 'expo-notifications';

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
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }, (error) => {
      Alert.alert('Error', 'Failed to load journal entries: ' + error.message);
      console.error('Snapshot error:', error);
      setLoading(false);
    });

    // Schedule daily notification only on mobile
    if (Platform.OS !== 'web') {
      scheduleDailyNotification();
    }

    return () => unsubscribe();
  }, [user]);

  const scheduleDailyNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Journal Time! 📝',
        body: 'Take a moment to record your thoughts today.',
        data: { screen: 'journal' },
      },
      trigger: {
        hour: 18, // 6 PM local time
        minute: 0,
        repeats: true,
      },
    });
  };

  const addNewEntry = async () => {
    router.push('/(dashboard)/AddJournal');
    // Schedule a notification 1 hour after adding, only on mobile
    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Great Job! 🎉',
          body: 'You added a journal entry. Want to add more?',
          data: { screen: 'journal' },
        },
        trigger: { seconds: 5 }, // 5 seconds for testing, change to { hours: 1 } later
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
      {loading ? (
        <Text className="text-base text-gray-500 text-center mt-5">Loading entries...</Text>
      ) : entries.length === 0 ? (
        <Text className="text-base text-gray-500 text-center mt-5">No entries yet. Add one!</Text>
      ) : (
        <FlatList
          data={entries}
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