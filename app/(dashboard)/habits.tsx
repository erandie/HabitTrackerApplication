import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform, TextInput, Switch, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Habit } from '../../types';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { addHabit, updateHabit, deleteHabit } from '../../services/habitService';
import HabitCard from '../../components/habitCard';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../_layout';

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
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme() || { theme: 'light' as const };

  // Fetch habits for refresh
  const fetchHabits = useCallback(async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to view habits');
      setLoading(false);
      return;
    }

    setRefreshing(true);
    try {
      const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
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
      applyFilters(habitsData);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load habits: ' + error.message);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Real-time listener for habits
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
      applyFilters(habitsData);
      setLoading(false);
    }, (error) => {
      Alert.alert('Error', 'Failed to load habits: ' + error.message);
      console.error('Snapshot error:', error);
      setLoading(false);
    });

    if (Platform.OS !== 'web') {
      scheduleDailyHabitNotification();
    }

    return () => unsubscribe();
  }, [user, theme]);

  // Apply search and completion filters
  const applyFilters = useCallback((data: Habit[]) => {
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
  }, [searchQuery, showCompleted]);

  // Schedule daily notification
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

  // Add new habit
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

  // Toggle habit completion
  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await updateHabit(id, { completed: !completed });
      applyFilters(habits); // Reapply filters after toggle
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update habit: ' + error.message);
      console.error('Update error:', error);
    }
  };

  // Delete habit
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

  // Edit habit
  const handleEdit = (habit: Habit) => {
    router.push({
      pathname: '/(dashboard)/EditHabit',
      params: { habit: JSON.stringify(habit) },
    });
  };

  // Render habit card
  const renderHabit = ({ item }: { item: Habit }) => (
    <HabitCard
      habit={item}
      onToggle={handleToggle}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  );

  return (
    <View className="flex-1 p-5" style={{ backgroundColor: theme === 'dark' ? '#1a202c' : theme === 'pink' ? '#f5e6e8' : '#f5f6fa' }}>
      <Text
        className="text-2xl font-bold mb-4 text-center"
        style={{ color: theme === 'dark' ? '#e2e8f0' : theme === 'pink' ? '#4a2c2a' : '#2d3748' }}
      >
        My Habits
      </Text>
      <View className="mb-4 flex-row items-center">
        <TextInput
          className="bg-white rounded-lg p-2 text-gray-800 flex-1 mr-2"
          placeholder="Search by title..."
          placeholderTextColor="#a0aec0"
          value={searchQuery}
          onChangeText={text => {
            setSearchQuery(text);
            applyFilters(habits);
          }}
          style={{ color: theme === 'dark' ? '#e2e8f0' : '#2d3748' }}
        />
        <View className="flex-row items-center">
          <Text className="mr-2" style={{ color: theme === 'dark' ? '#e2e8f0' : '#718096' }}>
            Show Completed
          </Text>
          <Switch
            value={showCompleted}
            onValueChange={value => {
              setShowCompleted(value);
              applyFilters(habits);
            }}
            trackColor={{ false: '#d1d5db', true: '#4a6bdf' }}
            thumbColor={theme === 'dark' ? '#e2e8f0' : '#ffffff'}
          />
        </View>
      </View>
      {loading ? (
        <Text className="text-base text-gray-500 text-center mt-5" style={{ color: theme === 'dark' ? '#a0aec0' : '#718096' }}>
          Loading habits...
        </Text>
      ) : filteredHabits.length === 0 ? (
        <Text className="text-base text-gray-500 text-center mt-5" style={{ color: theme === 'dark' ? '#a0aec0' : '#718096' }}>
          No habits match your filter. Add one!
        </Text>
      ) : (
        <FlatList
          data={filteredHabits}
          renderItem={renderHabit}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchHabits}
              colors={['#4a6bdf']}
              tintColor={theme === 'dark' ? '#e2e8f0' : '#4a6bdf'}
            />
          }
        />
      )}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-green-600 rounded-full p-3.5 shadow-md elevation-3"
        onPress={addNewHabit}
        accessibilityLabel="Add new habit"
      >
        <Text className="text-white font-bold text-lg">+ Add Habit</Text>
      </TouchableOpacity>
    </View>
  );
}