import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { BarChart, LineChart } from 'react-native-chart-kit';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [habitCompletionRate, setHabitCompletionRate] = useState(0);
  const [journalFrequencyData, setJournalFrequencyData] = useState<number[]>(new Array(7).fill(0));
  const [streak, setStreak] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark' | 'pink'>('light');

  useEffect(() => {
    const calculateAnalytics = async () => {
      if (!user) return;

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
      for (let date of completedDates) {
        const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= currentStreak) {
          currentStreak++;
        } else {
          break;
        }
        currentDate = date;
      }
      setStreak(currentStreak);
    };

    calculateAnalytics();

    // Theme Styling
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

  }, [user, theme]);

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
  

      return (
        <View className="flex-1 p-5 bg-gray-50">
          <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">Welcome, {user?.email || 'Guest'}</Text>
          <Text className="text-base text-gray-600 mb-6 text-center">Track your habits and journal your thoughts</Text>

          {/* Theme Toggle */}
            <View className="flex-row justify-center mb-4">
              <TouchableOpacity
                className={`px-4 py-2 rounded-md mr-2 ${theme === 'light' ? 'bg-blue-600' : 'bg-gray-300'}`}
                onPress={() => setTheme('light')}
              >
                <Text className={`${theme === 'light' ? 'text-white' : 'text-gray-600'} font-medium`}>Light</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-4 py-2 rounded-md mr-2 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}
                onPress={() => setTheme('dark')}
              >
                <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'} font-medium`}>Dark</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-4 py-2 rounded-md ${theme === 'pink' ? 'bg-blue-600' : 'bg-gray-300'}`}
                onPress={() => setTheme('pink')}
              >
                <Text className={`${theme === 'pink' ? 'text-white' : 'text-gray-600'} font-medium`}>Pink</Text>
              </TouchableOpacity>
            </View>

          {/* Analytics Dashboard with Charts */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Your Progress</Text>
            <ScrollView className="h-full">
              {/* Habit Completion Bar Chart */}
              <View className="mb-4">
                <Text className="text-lg text-gray-600 mb-2">Habit Completion Rate</Text>
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
                    backgroundColor: '#f5f6fa',
                    backgroundGradientFrom: '#f5f6fa',
                    backgroundGradientTo: '#f5f6fa',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(74, 107, 223, ${opacity})`, // Matches your blue theme
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  style={{ marginVertical: 8 }}
                />
              </View>

              {/* Journal Frequency Line Chart */}
              <View>
                <Text className="text-lg text-gray-600 mb-2">Journal Entries (Weekly)</Text>
                <LineChart
                  data={{
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{ data: journalFrequencyData }],
                  }}
                  width={300}
                  height={200}
                  yAxisLabel=""
                  chartConfig={{
                    backgroundColor: '#f5f6fa',
                    backgroundGradientFrom: '#f5f6fa',
                    backgroundGradientTo: '#f5f6fa',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(212, 165, 165, ${opacity})`, // Matches your pink theme
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  style={{ marginVertical: 8 }}
                />
              </View>
            </ScrollView>
          </View>

          {/* <View className="flex-row justify-between mb-6">
            <View className="w-[48%] bg-gray-200 p-4 rounded-lg shadow-md shadow-black/10">
              <Text className="text-lg font-bold text-gray-800 mb-2">Habits</Text>
              <Text className="text-sm text-gray-600 mb-3">Track your daily habits</Text>
              <TouchableOpacity
                className="bg-blue-600 rounded-md p-2"
                onPress={() => router.push('/habits')}
              >
                <Text className="text-white text-center text-base font-medium">View Habits</Text>
              </TouchableOpacity>
            </View>

            <View className="w-[48%] bg-gray-200 p-4 rounded-lg shadow-md shadow-black/10">
              <Text className="text-lg font-bold text-gray-800 mb-2">Journal</Text>
              <Text className="text-sm text-gray-600 mb-3">Record your thoughts</Text>
              <TouchableOpacity
                className="bg-blue-600 rounded-md p-2"
                onPress={() => router.push('/journal')}
              >
                <Text className="text-white text-center text-base font-medium">View Journal</Text>
              </TouchableOpacity>
            </View>npm install react-native-chart-kit
          </View> */}

          {/* <TouchableOpacity
            className="bg-red-600 rounded-md p-3 mt-auto"
            onPress={handleLogout}
          >
            <Text className="text-white text-center text-base font-medium">Logout</Text>
          </TouchableOpacity> */}
        </View>
  );
}