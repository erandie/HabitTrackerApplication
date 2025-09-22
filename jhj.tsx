// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { View, Text, TouchableOpacity, Alert, ScrollView, RefreshControl, StyleSheet, Dimensions, Platform} from 'react-native';
// import { useRouter } from 'expo-router';
// import { useAuth } from '../../context/AuthContext';
// import { signOut } from 'firebase/auth';
// import { auth, db } from '../../firebase';
// import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
// import { BarChart, LineChart } from 'react-native-chart-kit';
// import { useTheme } from '@/app/(dashboard)/_layout';
// import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
// import Animated, { 
//   FadeIn, 
//   FadeInUp, 
//   FadeInRight, 
//   useSharedValue, 
//   useAnimatedStyle, 
//   withSpring,
//   withSequence,
//   withTiming 
// } from 'react-native-reanimated';

// const COLORS = {
//   primary: '#10b981',
//   primaryLight: '#a7f3d0',
//   primaryDark: '#047857',
//   background: '#f8fafc',
//   surface: '#ffffff',
//   textPrimary: '#1e293b',
//   textSecondary: '#64748b',
//   accent: '#f59e0b',
// };
// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// export default function HomeScreen() {
//   const { user } = useAuth();
//   const router = useRouter();
//   const [habitCompletionRate, setHabitCompletionRate] = useState(0);
//   const [journalFrequencyData, setJournalFrequencyData] = useState<number[]>(new Array(7).fill(0));
//   const [streak, setStreak] = useState(0);
//   const [theme, setTheme] = useState<'light' | 'dark' | 'pink'>('light');
//   const [refreshing, setRefreshing] = useState(false);
//   const { colors } = useTheme();
//   const [notes, setNotes] = useState<{ id: string; title: string; note: string }[]>([]);
//   const progress = useSharedValue(0)
  
  
//   // Fetch latest 3 notes
//   const fetchNotes = useCallback(async () => {
//     if (!user) {
//       setNotes([]);
//       setRefreshing(false);
//       return;
//     }

//     setRefreshing(true);
//     try {
//       const notesQuery = query(
//         collection(db, 'notes'),
//         where('userId', '==', user.uid),
//         orderBy('createdAt', 'desc'),
//         limit(3)
//       );
//       const notesSnapshot = await getDocs(notesQuery);
//       const notesData = notesSnapshot.docs.map(doc => ({
//         id: doc.id,
//         title: doc.data().title,
//         note: doc.data().note,
//       }));
//       setNotes(notesData);
//     } catch (error: any) {
//       Alert.alert('Error', 'Failed to load notes: ' + error.message);
//       console.error('Fetch error:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchNotes();
//   }, [fetchNotes]);

//   // Get first few words of note (e.g., first 5 words)
//   const getNotePreview = (note: string) => {
//     const words = note.split(' ').slice(0, 5).join(' ');
//     return words.length < note.length ? `${words}...` : words;
//   };
  

//   // Fetch analytics data
//   const calculateAnalytics = useCallback(async () => {
//     if (!user) return;

//     setRefreshing(true);
//     try {
//       // Habit Completion Rate
//       const habitsQuery = query(collection(db, 'habits'), where('userId', '==', user.uid));
//       const habitsSnapshot = await getDocs(habitsQuery);
//       const totalHabits = habitsSnapshot.size;
//       const completedHabits = habitsSnapshot.docs.filter(doc => doc.data().completed).length;
//       setHabitCompletionRate(totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0);

//       // Journal Frequency (daily data for the week)
//       const journalQuery = query(collection(db, 'journals'), where('userId', '==', user.uid));
//       const journalSnapshot = await getDocs(journalQuery);
//       const entries = journalSnapshot.docs.map(doc => doc.data().createdAt?.toDate() || new Date());
//       const oneWeekAgo = new Date();
//       oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
//       const dailyData = new Array(7).fill(0);
//       entries.forEach(entry => {
//         const dayIndex = Math.floor((oneWeekAgo.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)) % 7;
//         if (dayIndex >= 0) dailyData[dayIndex]++;
//       });
//       setJournalFrequencyData(dailyData);

//       // Streak (simplified: consecutive days with completed habits)
//       const completedDates = habitsSnapshot.docs
//         .filter(doc => doc.data().completed)
//         .map(doc => doc.data().createdAt?.toDate() || new Date())
//         .sort((a, b) => b - a);
//       let currentStreak = 0;
//       let currentDate = new Date();
//       currentDate.setHours(0, 0, 0, 0); // Normalize to start of day
//       for (let date of completedDates) {
//         const habitDate = new Date(date);
//         habitDate.setHours(0, 0, 0, 0);
//         const diffDays = Math.floor((currentDate.getTime() - habitDate.getTime()) / (1000 * 60 * 60 * 24));
//         if (diffDays === currentStreak) {
//           currentStreak++;
//           currentDate = habitDate;
//         } else {
//           break;
//         }
//       }
//       setStreak(currentStreak);
//     } catch (error: any) {
//       Alert.alert('Error', 'Failed to load analytics: ' + error.message);
//       console.error('Fetch error:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     calculateAnalytics();
//   }, [calculateAnalytics]);

//   const handleLogout = async () => {
//     Alert.alert(
//       'Logout',
//       'Are you sure you want to logout?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Logout', onPress: () => signOut(auth).catch(error => Alert.alert('Error', error.message)) },
//       ]
//     );
//   };

//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return 'Good Morning,';
//     if (hour < 17) return 'Good Afternoon,';
//     return 'Good Evening,';
//   };

//   const sampleNotes = [
//   {
//     id: '1',
//     title: 'Morning Reflection',
//     note: 'Started the day with a refreshing walk and some mindfulness practice. Feeling energized and ready to tackle my goals!',
//   },
//   {
//     id: '2',
//     title: 'Gratitude Journal',
//     note: 'Grateful for my supportive friends and family. Also, completed my workout goal for the week!',
//   },
//   {
//     id: '3',
//     title: 'Evening Thoughts',
//     note: 'Reflected on today’s progress. Need to focus more on hydration tomorrow.',
//   },
// ];



//   return (
//     <ScrollView
//       style={styles.container} // Changed from className
//       refreshControl={
//         <RefreshControl
//           refreshing={refreshing}
//           onRefresh={calculateAnalytics}
//           colors={[COLORS.primary]} // Use our new color
//           tintColor={COLORS.primary} // Use our new color
//         />
//       }
//     >
//       {/* Header Greeting */}
//       <Animated.View entering={FadeInUp.duration(800)} style={styles.header}>
//         <Text style={styles.greeting}>
//           {getGreeting()}{user?.displayName ? `, ${user.displayName}` : ''}! 🌟
//         </Text>
//         <Text style={styles.subtitle}>Track your habits, journal your thoughts</Text>
//       </Animated.View>

//       {/* Streak Card */}
//       <Animated.View entering={FadeInRight.delay(200)} style={styles.statsCard}>
//         <View>
//           <Text style={styles.statsLabel}>Current Streak</Text>
//           <Text style={styles.statsValue}>{streak} days 🔥</Text>
//         </View>
//         <View style={styles.streakIcon}>
//           <Text>🔥</Text>
//         </View>
//       </Animated.View>

//       {/* Recent Notes Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Recent Notes 📔</Text>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.notesScrollContainer}>
//           {(notes.length > 0 ? notes : sampleNotes).map((note, index) => (
//             <View key={note.id || index} style={styles.noteCard}>
//               <Text style={styles.noteTitle} numberOfLines={1}>{note.title}</Text>
//               <Text style={styles.notePreview} numberOfLines={3}>
//                 {getNotePreview(note.note)}
//               </Text>
//             </View>
//           ))}
//         </ScrollView>
//       </View>

//       {/* Analytics Dashboard */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Your Progress 📊</Text>

//         {/* Habit Completion */}
//         <View style={styles.chartContainer}>
//           <Text style={styles.chartTitle}>Habit Completion Rate</Text>
//           <BarChart
//             data={{
//               labels: ['Completed', 'Incomplete'],
//               datasets: [{ data: [habitCompletionRate, 100 - habitCompletionRate] }],
//             }}
//             width={SCREEN_WIDTH - 64}
//             height={200}
//             yAxisLabel=""
//             yAxisSuffix="%"
//             chartConfig={{
//               backgroundColor: COLORS.surface,
//               backgroundGradientFrom: COLORS.surface,
//               backgroundGradientTo: COLORS.surface,
//               decimalPlaces: 0,
//               color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
//               labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
//             }}
//             style={styles.chart}
//           />
//         </View>

//         {/* Journal Frequency */}
//         <View style={styles.chartContainer}>
//           <Text style={styles.chartTitle}>Journal Frequency (This Week)</Text>
//           <LineChart
//             data={{
//               labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//               datasets: [{ data: journalFrequencyData }],
//             }}
//             width={SCREEN_WIDTH - 64}
//             height={200}
//             yAxisLabel=""
//             chartConfig={{
//               backgroundColor: COLORS.surface,
//               backgroundGradientFrom: COLORS.surface,
//               backgroundGradientTo: COLORS.surface,
//               decimalPlaces: 0,
//               color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
//               labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
//               propsForDots: {
//                 r: "5",
//                 fill: COLORS.primary,
//               },
//             }}
//             bezier
//             style={styles.chart}
//           />
//         </View>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8fafc', // COLORS.background
//     padding: 16,
//   },
//   header: {
//     marginBottom: 20,
//   },
//   greeting: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1e293b', // COLORS.textPrimary
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#64748b', // COLORS.textSecondary
//   },
//   statsCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#ffffff', // COLORS.surface
//     padding: 20,
//     borderRadius: 16,
//     marginBottom: 24,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 6,
//       },
//     }),
//   },
//   statsLabel: {
//     fontSize: 14,
//     color: '#64748b', // COLORS.textSecondary
//     marginBottom: 4,
//   },
//   statsValue: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1e293b', // COLORS.textPrimary
//   },
//   streakIcon: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#a7f3d0', // COLORS.primaryLight
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   section: {
//     marginBottom: 32,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#1e293b', // COLORS.textPrimary
//     marginBottom: 16,
//   },
//   notesScrollContainer: {
//     paddingHorizontal: 8,
//   },
//   noteCard: {
//     width: 250,
//     backgroundColor: '#ffffff', // COLORS.surface
//     padding: 16,
//     borderRadius: 12,
//     marginRight: 12,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.05,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   noteTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1e293b', // COLORS.textPrimary
//     marginBottom: 8,
//   },
//   notePreview: {
//     fontSize: 14,
//     color: '#64748b', // COLORS.textSecondary
//     lineHeight: 20,
//   },
//   chartContainer: {
//     backgroundColor: '#ffffff', // COLORS.surface
//     padding: 20,
//     borderRadius: 16,
//     marginBottom: 20,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.05,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   chartTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1e293b', // COLORS.textPrimary
//     marginBottom: 12,
//   },
//   chart: {
//     borderRadius: 8,
//     alignSelf: 'center',
//   },
// });


