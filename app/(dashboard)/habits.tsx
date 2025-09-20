import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Habit } from '../../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { updateHabit, deleteHabit } from '../../services/habitService';
import HabitCard from '../../components/habitCard';

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
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        } as Habit);
      });
      setHabits(habitsData);
      setLoading(false);
    }, (error) => {
      Alert.alert('Error', 'Failed to load habits: ' + error.message);
      console.error('Snapshot error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addNewHabit = () => {
    router.push('/(dashboard)/AddHabit');
  };

  const toggleHabitCompletion = async (id: string, completed: boolean) => {
    try {
      console.log('Toggling habit:', id, 'to completed:', completed); // Debug
      await updateHabit(id, { completed });
    } catch (error) {
      Alert.alert('Error', 'Failed to update habit completion');
      console.error('Toggle error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    console.log('handleDelete called with ID:', id); // Debug: Confirm handler fires
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('Delete confirmed, calling deleteHabit for ID:', id); // Debug: Confirm onPress
            try {
              await deleteHabit(id);
              console.log('deleteHabit returned successfully for ID:', id); // Debug: Success
              Alert.alert('Success', 'Habit deleted successfully');
            } catch (error: any) {
              console.error('Delete failed in handleDelete:', error.message || error);
              Alert.alert('Error', 'Failed to delete habit: ' + (error.message || 'Unknown error'));
            }
          },
        },
      ]
    );
  };

  const handleEdit = (habit: Habit) => {
    console.log('Navigating to EditHabit with habit ID:', habit.id); // Debug
    router.push({
      pathname: '/(dashboard)/EditHabit',
      params: { habit: JSON.stringify(habit) },
    });
  };

  const renderHabit = ({ item }: { item: Habit }) => (
    <HabitCard
      habit={item}
      onToggle={toggleHabitCompletion}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
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