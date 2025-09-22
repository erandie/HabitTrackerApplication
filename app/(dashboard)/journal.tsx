import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform, TextInput, RefreshControl, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { JournalEntry } from '../../types';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { addJournal, updateJournal, deleteJournal } from '../../services/journalService';
import JournalCard from '../../components/journalCard';
import * as Notifications from 'expo-notifications';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/app/(dashboard)/_layout';
import Animated, { FadeInUp, FadeInDown, FadeInRight } from 'react-native-reanimated';

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

export default function JournalScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme() || { theme: 'light' as const };
  const { colors } = useTheme();

  // Fetch journal entries
  const fetchEntries = useCallback(async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to view journal');
      setLoading(false);
      return;
    }

    setRefreshing(true);
    try {
      const q = query(collection(db, 'journals'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
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
      applyFilters(entriesData);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load journal entries: ' + error.message);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Real-time listener for journal entries
  useEffect(() => {
    if (!user) return;

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
      applyFilters(entriesData);
      setLoading(false);
    }, (error) => {
      Alert.alert('Error', 'Failed to load journal entries: ' + error.message);
      console.error('Snapshot error:', error);
      setLoading(false);
    });

    if (Platform.OS !== 'web') {
      scheduleDailyNotification();
    }

    return () => unsubscribe();
  }, [user, theme]);

  // Apply search and mood filters
  const applyFilters = useCallback((data: JournalEntry[]) => {
    let filtered = [...data];
    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (moodFilter !== 'all') {
      filtered = filtered.filter(entry => entry.mood === moodFilter);
    }
    setFilteredEntries(filtered);
  }, [searchQuery, moodFilter]);

  // Schedule daily notification
  const scheduleDailyNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Journal Time! 📝',
        body: 'Take a moment to record your thoughts today.',
        data: { screen: 'journal' },
      },
      trigger: { seconds: 10 }, // Test with 10 seconds
    });
  };

  // Add new journal entry
  const addNewEntry = async () => {
    router.push('/(dashboard)/AddJournal');
    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Great Job! 🎉',
          body: 'You added a journal entry. Want to add more?',
          data: { screen: 'journal' },
        },
        trigger: { seconds: 5 },
      });
    }
  };

  // Delete journal entry
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

  // Edit journal entry
  const handleEdit = (entry: JournalEntry) => {
    router.push({
      pathname: '/(dashboard)/EditJournal',
      params: { entry: JSON.stringify(entry) },
    });
  };

  // Render journal entry card
  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <JournalCard
      entry={item}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  );

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'neutral': return '😐';
      case 'excited': return '🤩';
      case 'angry': return '😠';
      case 'tired': return '😴';
      default: return '📝';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': return '#f59e0b'; // Amber
      case 'sad': return '#3b82f6'; // Blue
      case 'neutral': return '#10b981'; // Green
      default: return '#10b981'; // Green
    }
  };


 return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Header */}
      <Animated.View entering={FadeInUp.duration(800).springify()} style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>My Journal 📔</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Capture your thoughts and feelings</Text>
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
            placeholder="Search entries..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              applyFilters(entries);
            }}
          />
          <Text style={{position: 'absolute', right: 12, top: 12}}>🔍</Text>
        </View>

        <View style={styles.moodFilter}>
          <Text style={[styles.filterLabel, { color: colors.textPrimary }]}>Mood:</Text>
          <View style={styles.moodButtons}>
            {['all', 'happy', 'sad', 'neutral'].map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.moodButton,
                  moodFilter === mood && styles.moodButtonActive,
                  moodFilter === mood && { backgroundColor: getMoodColor(mood) }
                ]}
                onPress={() => {
                  setMoodFilter(mood);
                  applyFilters(entries);
                }}
              >
                <Text style={[
                  styles.moodButtonText,
                  moodFilter === mood && styles.moodButtonTextActive
                ]}>
                  {mood === 'all' ? 'All' : getMoodEmoji(mood)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Journal Entries List */}
      {loading ? (
        <Animated.View entering={FadeInDown.delay(400)} style={styles.centerMessage}>
          <Text style={[styles.messageText, { color: colors.textPrimary }]}>Loading your thoughts... 💭</Text>
        </Animated.View>
      ) : filteredEntries.length === 0 ? (
        <Animated.View entering={FadeInDown.delay(400)} style={styles.centerMessage}>
          <Text style={[styles.messageText, { color: colors.textPrimary }]}>
            {searchQuery || moodFilter !== 'all' 
              ? "No entries found 🌵" 
              : "No journal entries yet! Tap + to start writing ✨"
            }
          </Text>
          {!searchQuery && moodFilter === 'all' && (
            <Text style={[styles.messageText, {fontSize: 14, marginTop: 8, color: colors.textSecondary }]}>
              Your first entry is waiting to be written
            </Text>
          )}
        </Animated.View>
      ) : (
        <FlatList
          data={filteredEntries}
          renderItem={({item, index}) => (
            <Animated.View 
              entering={FadeInRight.delay(400 + index * 100).springify()}
              style={[styles.journalCard, { backgroundColor: colors.backgroundWhite }]}
            >
              {/* Mood Indicator */}
              <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(item.mood) }]}>
                <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood)}</Text>
              </View>

              {/* Content */}
              <View style={styles.cardContent}>
                <Text style={[styles.entryTitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.entryPreview, { color: colors.textSecondary }]} numberOfLines={3}>
                  {item.content.length > 120 ? item.content.substring(0, 120) + '...' : item.content}
                </Text>
                <Text style={[styles.entryDate, { color: colors.textSecondary }]}>
                  {item.createdAt.toLocaleDateString()} • {item.mood}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  onPress={() => handleEdit(item)}
                  style={[styles.actionButton, styles.editButton]}
                >
                  <Text style={styles.actionText}>✏️ Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDelete(item.id)}
                  style={[styles.actionButton, styles.deleteButton]}
                >
                  <Text style={styles.actionText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchEntries}
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
          onPress={addNewEntry}
          accessibilityLabel="Add new journal entry"
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
    marginBottom: 20,
    gap: 16,
  },
  searchContainer: {
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
  moodFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  moodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  moodButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    minWidth: 40,
    alignItems: 'center',
  },
  moodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  moodButtonText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  moodButtonTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
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
  journalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  moodIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moodEmoji: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  entryPreview: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: COLORS.primaryLight,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingBottom: 100,
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
});