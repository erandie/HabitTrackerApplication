import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useTheme } from '@/app/(dashboard)/_layout';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [habitCompletionRate, setHabitCompletionRate] = useState(0);
  const [journalFrequencyData, setJournalFrequencyData] = useState<number[]>(new Array(7).fill(0));
  const [streak, setStreak] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark' | 'pink'>('light');
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const [notes, setNotes] = useState<{ id: string; title: string; note: string }[]>([]);

  // Fetch latest 3 notes
  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    try {
      const notesQuery = query(
        collection(db, 'notes'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const notesSnapshot = await getDocs(notesQuery);
      const notesData = notesSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        note: doc.data().note,
      }));
      setNotes(notesData);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load notes: ' + error.message);
      console.error('Fetch error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Get first few words of note (e.g., first 5 words)
  const getNotePreview = (note: string) => {
    const words = note.split(' ').slice(0, 5).join(' ');
    return words.length < note.length ? `${words}...` : words;
  };
  

  // Fetch analytics data
  const calculateAnalytics = useCallback(async () => {
    if (!user) return;

    setRefreshing(true);
    try {
      // Habit Completion Rate
      const habitsQuery = query(collection(db, 'habits'), where('userId', '==', user.uid));
      const habitsSnapshot = await getDocs(habitsQuery);
      const totalHabits = habitsSnapshot.size;
      const completedHabits = habitsSnapshot.docs.filter(doc => doc.data().completed).length;
      setHabitCompletionRate(totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0);

      // Journal Frequency (daily data for the week)
      const journalQuery = query(collection(db, 'journals'), where('userId', '==', user.uid));
      const journalSnapshot = await getDocs(journalQuery);
      const entries = journalSnapshot.docs.map(doc => doc.data().createdAt?.toDate() || new Date());
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const dailyData = new Array(7).fill(0);
      entries.forEach(entry => {
        const dayIndex = Math.floor((oneWeekAgo.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)) % 7;
        if (dayIndex >= 0) dailyData[dayIndex]++;
      });
      setJournalFrequencyData(dailyData);

      // Streak (simplified: consecutive days with completed habits)
      const completedDates = habitsSnapshot.docs
        .filter(doc => doc.data().completed)
        .map(doc => doc.data().createdAt?.toDate() || new Date())
        .sort((a, b) => b - a);
      let currentStreak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Normalize to start of day
      for (let date of completedDates) {
        const habitDate = new Date(date);
        habitDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((currentDate.getTime() - habitDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === currentStreak) {
          currentStreak++;
          currentDate = habitDate;
        } else {
          break;
        }
      }
      setStreak(currentStreak);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load analytics: ' + error.message);
      console.error('Fetch error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    calculateAnalytics();
  }, [calculateAnalytics]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => signOut(auth).catch(error => Alert.alert('Error', error.message)) },
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  return (
    <ScrollView
      className="flex-1 p-5"
      style={{ backgroundColor: theme === 'dark' ? '#1a202c' : theme === 'pink' ? '#f5e6e8' : '#f5f6fa' }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={calculateAnalytics}
          colors={['#4a6bdf']}
          tintColor={theme === 'dark' ? '#e2e8f0' : '#4a6bdf'}
        />
      }
    >
      <View className="flex-1">
        <Text
          className="text-3xl font-bold mb-2"
          style={{ color: theme === 'dark' ? '#e2e8f0' : theme === 'pink' ? '#4a2c2a' : '#2d3748' }}
        >
          {getGreeting()} {user?.displayName || user?.email || 'Guest'}!
        </Text>

         
        {/* Latest Notes Section */}
        <View className="mb-6">
          <Text className={`text-xl font-bold mb-4 ${colors.textPrimary}`}>Recent Notes</Text>
          {notes.length > 0 ? (
            notes.map(note => (
              <View
                key={note.id}
                className={`p-4 mb-4 rounded-lg ${colors.inputBackground} border border-gray-300`}
              >
                <Text className={`text-lg font-semibold ${colors.textPrimary}`}>{note.title}</Text>
                <Text className={`text-base ${colors.textSecondary}`}>
                  {getNotePreview(note.note)}
                </Text>
              </View>
            ))
          ) : (
            <Text className={`text-base ${colors.textSecondary}`}>No notes yet.</Text>
          )}
        </View>

        {/* <Text
          className="text-base mb-6 text-center"
          style={{ color: theme === 'dark' ? '#a0aec0' : '#718096' }}
        >
          Track your habits and journal your thoughts
        </Text> */}
        {/* Theme Toggle */}
      

        {/* Analytics Dashboard with Charts */}
        <View className="mb-6">
          <Text
            className="text-xl font-bold mb-4"
            style={{ color: theme === 'dark' ? '#e2e8f0' : theme === 'pink' ? '#4a2c2a' : '#2d3748' }}
          >
            Your Progress
          </Text>
          {/* Habit Completion Bar Chart */}
          <View className="mb-4">
            <Text
              className="text-lg mb-2"
              style={{ color: theme === 'dark' ? '#a0aec0' : '#718096' }}
            >
              Habit Completion Rate
            </Text>
            <BarChart
              data={{
                labels: ['Completed', 'Incomplete'],
                datasets: [{ data: [habitCompletionRate, 100 - habitCompletionRate] }],
              }}
              width={300}
              height={200}
              yAxisLabel="%"
              yAxisSuffix="%"
              chartConfig={{
                backgroundColor: theme === 'dark' ? '#2d3748' : theme === 'pink' ? '#f5e6e8' : '#f5f6fa',
                backgroundGradientFrom: theme === 'dark' ? '#2d3748' : theme === 'pink' ? '#f5e6e8' : '#f5f6fa',
                backgroundGradientTo: theme === 'dark' ? '#2d3748' : theme === 'pink' ? '#f5e6e8' : '#f5f6fa',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(74, 107, 223, ${opacity})`,
                labelColor: (opacity = 1) => theme === 'dark' ? `rgba(226, 232, 240, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
              }}
              style={{ marginVertical: 8 }}
            />
          </View>

          {/* Journal Frequency Line Chart */}
          <View>
            <Text
              className="text-lg mb-2"
              style={{ color: theme === 'dark' ? '#a0aec0' : '#718096' }}
            >
              Journal Entries (Weekly)
            </Text>
            <LineChart
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{ data: journalFrequencyData }],
              }}
              width={300}
              height={200}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: theme === 'dark' ? '#2d3748' : theme === 'pink' ? '#f5e6e8' : '#f5f6fa',
                backgroundGradientFrom: theme === 'dark' ? '#2d3748' : theme === 'pink' ? '#f5e6e8' : '#f5f6fa',
                backgroundGradientTo: theme === 'dark' ? '#2d3748' : theme === 'pink' ? '#f5e6e8' : '#f5f6fa',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(212, 165, 165, ${opacity})`,
                labelColor: (opacity = 1) => theme === 'dark' ? `rgba(226, 232, 240, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
              }}
              style={{ marginVertical: 8 }}
            />
          </View>
        </View>

        {/* <TouchableOpacity
          className="bg-red-600 rounded-md p-3 mt-auto"
          onPress={handleLogout}
          accessibilityLabel="Logout"
        >
          <Text className="text-white text-center text-base font-medium">Logout</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
}