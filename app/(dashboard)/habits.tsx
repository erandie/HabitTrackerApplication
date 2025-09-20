// app/(dashboard)/habits.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Habit } from '../../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { addHabit, updateHabit, deleteHabit } from '../../services/habitService';
import HabitCard from '../../components/habitCard';
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

export default function HabitsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to view habits');
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const habitsData: Habit[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        habitsData.push({
          id: doc.id,
          title: data.title || 'Untitled',
          completed: data.completed || false,
          userId: data.userId || user.uid,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        } as Habit);
      });
      setHabits(habitsData);
      setLoading(false);
    }, (error) => {
      Alert.alert('Error', 'Failed to load habits: ' + error.message); // Fixed here
      console.error('Snapshot error:', error);
      setLoading(false);
    });

    // Schedule daily habit reminder only on mobile
    if (Platform.OS !== 'web') {
      scheduleDailyHabitNotification();
    }

    return () => unsubscribe();
  }, [user]);

  const scheduleDailyHabitNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Habit Check! ⏰',
        body: 'Time to check off your habits today.',
        data: { screen: 'habits' },
      },
      trigger: { seconds: 10 }, // Test with 10 seconds, change to { hour: 8, minute: 0, repeats: true } later
    });
  };

  const addNewHabit = async () => {
    router.push('/(dashboard)/AddHabit');
    // Schedule a notification 5 seconds after adding, only on mobile
    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Awesome Work! 🌟',
          body: 'You added a new habit. Keep it up!',
          data: { screen: 'habits' },
        },
        trigger: { seconds: 5 }, // 5 seconds for testing, change to { hours: 1 } later
      });
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await updateHabit(id, { completed: !completed });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update habit: ' + error.message);
      console.error('Update error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(id);
              Alert.alert('Success', 'Habit deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete habit: ' + error.message);
              console.error('Delete error:', error);
            }
          },
        },
      ]
    );
  };

  const renderHabit = ({ item }: { item: Habit }) => (
    <HabitCard
      habit={item}
      onToggle={handleToggle}
      onDelete={handleDelete}
    />
  );

  return (
    <View className="flex-1 p-5 bg-gray-50">
      <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">My Habits</Text>
      {loading ? (
        <Text className="text-base text-gray-500 text-center mt-5">Loading habits...</Text>
      ) : habits.length === 0 ? (
        <Text className="text-base text-gray-500 text-center mt-5">No habits yet. Add one!</Text>
      ) : (
        <FlatList
          data={habits}
          renderItem={renderHabit}
          keyExtractor={(item) => item.id}
          contentContainerClassName="pb-20"
        />
      )}
      <TouchableOpacity className="absolute bottom-6 right-6 bg-green-600 rounded-full p-3.5 shadow-md elevation-3" onPress={addNewHabit}>
        <Text className="text-white font-bold text-lg">+ Add Habit</Text>
      </TouchableOpacity>
    </View>
  );
}