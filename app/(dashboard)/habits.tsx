// app/(dashboard)/habits.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Habit } from '../../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { addHabit, updateHabit, deleteHabit } from '../../services/habitService';
import HabitCard from '../../components/habitCard';
import * as Notifications from 'expo-notifications';
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

export default function HabitsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [filteredHabits, setFilteredHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

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
      applyFilters(habitsData); // Apply filters on initial load
      setLoading(false);
    }, (error) => {
      Alert.alert('Error', 'Failed to load habits: ' + error.message);
      console.error('Snapshot error:', error);
      setLoading(false);
    });

    if (Platform.OS !== 'web') {
      scheduleDailyHabitNotification();
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
    
  }, [user]);

  const applyFilters = (data: Habit[]) => {
    let filtered = [...data];
    if (searchQuery) {
      filtered = filtered.filter(habit =>
        habit.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (!showCompleted) {
      filtered = filtered.filter(habit => !habit.completed);
    }
    setFilteredHabits(filtered);
  };

  const scheduleDailyHabitNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Habit Check! ⏰',
        body: 'Time to check off your habits today.',
        data: { screen: 'habits' },
      },
      trigger: { seconds: 10 }, // Test with 10 seconds
    });
  };

  const addNewHabit = async () => {
    router.push('/(dashboard)/AddHabit');
    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Awesome Work! 🌟',
          body: 'You added a new habit. Keep it up!',
          data: { screen: 'habits' },
        },
        trigger: { seconds: 5 },
      });
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await updateHabit(id, { completed: !completed });
      applyFilters(habits); // Reapply filters after toggle
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
      <View className="mb-4 flex-row items-center">
        <TextInput
          className="bg-white rounded-lg p-2 text-gray-800 flex-1 mr-2"
          placeholder="Search by title..."
          value={searchQuery}
          onChangeText={text => {
            setSearchQuery(text);
            applyFilters(habits);
          }}
        />
        <View className="flex-row items-center">
          <Text className="text-gray-600 mr-2">Show Completed</Text>
          <Switch
            value={showCompleted}
            onValueChange={value => {
              setShowCompleted(value);
              applyFilters(habits);
            }}
          />
        </View>
      </View>
      {loading ? (
        <Text className="text-base text-gray-500 text-center mt-5">Loading habits...</Text>
      ) : filteredHabits.length === 0 ? (
        <Text className="text-base text-gray-500 text-center mt-5">No habits match your filter. Add one!</Text>
      ) : (
        <FlatList
          data={filteredHabits}
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