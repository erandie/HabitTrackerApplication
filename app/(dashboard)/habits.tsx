import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform, TextInput, Switch, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Habit } from '../../types';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { addHabit, updateHabit, deleteHabit } from '../../services/habitService';
import HabitCard from '../../components/habitCard';
import * as Notifications from 'expo-notifications';
import { useTheme } from '@/app/(dashboard)/_layout';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';

// Define our color palette
const COLORS = {
  primary: '#10b981',
  primaryLight: '#a7f3d0',
  primaryDark: '#047857',
  background: '#f8fafc',
  surface: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  accent: '#f59e0b',
  error: '#ef4444',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const { colors } = useTheme();

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
      onToggle={handleToggle}  // Make sure this is passed
      onDelete={handleDelete}  // And these too
      onEdit={handleEdit}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Header */}
      <Animated.View entering={FadeInUp.duration(800).springify()} style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>My Habits 🌱</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Cultivate your daily routines</Text>
      </Animated.View>

      {/* Search and Filter Row */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.filterRow}>
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { 
              backgroundColor: colors.backgroundWhite,
              color: colors.textPrimary,
              borderColor: colors.textSecondary 
            }]}
            placeholder="Search habits..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              applyFilters(habits);
            }}
          />
          <Text style={{position: 'absolute', right: 12, top: 12}}>🔍</Text>
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Show Completed</Text>
          <Switch
            value={showCompleted}
            onValueChange={value => {
              setShowCompleted(value);
              applyFilters(habits);
            }}
            trackColor={{ false: '#d1d5db', true: COLORS.primary }} // Keep original colors
            thumbColor={showCompleted ? COLORS.primaryLight : '#f4f3f4'} // Keep original colors
          />
        </View>
      </Animated.View>

      {/* Habits List */}
      {loading ? (
        <Animated.View entering={FadeInDown.delay(400)} style={styles.centerMessage}>
          <Text style={[styles.messageText, { color: colors.textPrimary }]}>Loading your habits... ⏳</Text>
        </Animated.View>
      ) : filteredHabits.length === 0 ? (
        <Animated.View entering={FadeInDown.delay(400)} style={styles.centerMessage}>
          <Text style={[styles.messageText, { color: colors.textPrimary }]}>
            {searchQuery ? "No habits found 🌵" : "No habits yet! Tap + to start growing 🌟"}
          </Text>
          {!searchQuery && (
            <Text style={[styles.messageText, {fontSize: 14, marginTop: 8, color: colors.textSecondary }]}>
              Your journey to better habits starts here
            </Text>
          )}
        </Animated.View>
      ) : (
        <FlatList
          data={filteredHabits}
          renderItem={({item, index}) => (
            <Animated.View 
              entering={FadeInDown.delay(200 + index * 80).springify().damping(12)}
              style={[styles.habitSquare, { backgroundColor: colors.backgroundWhite }]}
            >
              {/* Main Content */}
              <View style={styles.habitContent}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.habitEmoji}>
                    {item.completed ? '✅' : '⏳'}
                  </Text>
                </View>
                
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.habitDate, { color: colors.textSecondary }]}>
                    Started {item.createdAt.toLocaleDateString()}
                  </Text>
                </View>

                {/* Toggle Button - Use handleToggle directly */}
                <TouchableOpacity 
                  onPress={() => handleToggle(item.id, item.completed)}
                  style={[
                    styles.toggleBtn,
                    item.completed && styles.toggleBtnCompleted
                  ]}
                >
                  <Text style={styles.toggleIcon}>
                    {item.completed ? '✓' : '○'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionContainer}>
                <TouchableOpacity 
                  onPress={() => handleEdit(item)}
                  style={[styles.actionBtn, styles.editBtn]}
                >
                  <Text style={styles.actionText}>✏️ Edit</Text>
                </TouchableOpacity>
                
                <View style={styles.divider} />
                
                <TouchableOpacity 
                  onPress={() => handleDelete(item.id)}
                  style={[styles.actionBtn, styles.deleteBtn]}
                >
                  <Text style={styles.actionText}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchHabits}
              colors={[COLORS.primary]} // Keep original green
              tintColor={COLORS.primary} // Keep original green
            />
          }
        />
      )}

      {/* Floating Add Button */}
      <Animated.View 
        entering={FadeInUp.delay(600).springify()}
        style={styles.fabContainer}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={addNewHabit}
          accessibilityLabel="Add new habit"
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  switchLabel: {
    marginRight: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  centerMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  messageText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabText: {
    color: COLORS.surface,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -2,
  },

  habitSquare: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  habitEmoji: {
    fontSize: 24,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 24,
  },
  habitDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  toggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  toggleBtnCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  toggleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  editBtn: {
    backgroundColor: COLORS.primaryLight,
    marginRight: 8,
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    marginLeft: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
});
