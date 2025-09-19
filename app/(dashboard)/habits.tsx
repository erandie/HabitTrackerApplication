import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Habit } from '../../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const HabitsScreen = () => {
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
          description: data.description || '',
          frequency: data.frequency || 'daily',
          completed: data.completed || false,
          userId: data.userId || user.uid,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(), // Fallback to current date
        } as Habit);
      });
      setHabits(habitsData);
      setLoading(false);
    }, (error) => {
      Alert.alert('Error', 'Failed to load habits: ' + error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addNewHabit = () => {
    router.push('/(dashboard)/AddHabit');
  };

  const toggleHabitCompletion = (id: string) => {
    Alert.alert('Info', 'Toggle functionality to be implemented');
  };

  const deleteHabit = (id: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => Alert.alert('Info', 'Delete functionality to be implemented') },
      ]
    );
  };

  const renderHabit = ({ item }: { item: Habit }) => (
    <View
      className={`bg-white rounded-lg p-4 mb-4 shadow-md ${
        item.completed ? 'bg-green-100' : 'bg-white'
      }`}
    >
      <View className="flex-row justify-between mb-2">
        <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
        <TouchableOpacity onPress={() => deleteHabit(item.id)}>
          <Text className="text-red-500 text-sm">Delete</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-gray-600 text-sm mb-2">{item.description}</Text>
      <Text className="text-gray-500 text-xs mb-3">{item.frequency}</Text>
      <TouchableOpacity
        className={`p-2 rounded-md ${
          item.completed ? 'bg-green-500' : 'bg-blue-600'
        } items-center`}
        onPress={() => toggleHabitCompletion(item.id)}
      >
        <Text className="text-white font-bold">
          {item.completed ? 'Completed' : 'Mark Complete'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 p-5 bg-gray-100">
      <Text className="text-2xl font-bold text-gray-800 mb-5">My Habits</Text>
      {loading ? (
        <Text className="text-gray-600 text-center text-base mt-5">Loading habits...</Text>
      ) : habits.length === 0 ? (
        <Text className="text-gray-600 text-center text-base mt-5">No habits yet. Add one!</Text>
      ) : (
        <FlatList
          data={habits}
          renderItem={renderHabit}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      <TouchableOpacity
        className="absolute bottom-5 right-5 bg-blue-600 p-4 rounded-full shadow-lg"
        onPress={addNewHabit}
      >
        <Text className="text-white font-bold text-base">+ Add New Habit</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HabitsScreen;