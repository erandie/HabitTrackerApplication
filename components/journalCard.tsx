// components/journalCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { JournalEntry } from '../types';

interface JournalCardProps {
  entry: JournalEntry;
  onDelete: (id: string) => void;
  onEdit: (entry: JournalEntry) => void;
}

const getMoodEmoji = (mood: string) => {
  switch (mood) {
    case 'happy': return '😊';
    case 'sad': return '😢';
    case 'neutral': return '😐';
    case 'excited': return '🤩';
    default: return '📝';
  }
};

const JournalCard: React.FC<JournalCardProps> = ({ entry, onDelete, onEdit }) => {
  // Fallback for date if not a valid Date object
  const formatDate = (date: Date | undefined): string => {
    return date instanceof Date && !isNaN(date.getTime())
      ? date.toISOString().split('T')[0]
      : 'N/A';
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-md shadow-black/10">
      <View className="flex-row justify-between mb-3">
        <Text className="text-lg font-bold text-gray-800 flex-1">{entry.title}</Text>
        <View className="items-end">
          <Text className="text-xl mb-1">{getMoodEmoji(entry.mood)}</Text>
          <Text className="text-xs text-gray-500">{formatDate(entry.date)}</Text>
        </View>
      </View>
      <Text className="text-sm text-gray-600 mb-3 line-clamp-3" numberOfLines={3}>{entry.content}</Text>
      <View className="flex-row justify-end">
        <TouchableOpacity onPress={() => onEdit(entry)} className="mr-4">
          <Text className="text-blue-600 text-base">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(entry.id)}>
          <Text className="text-red-600 text-base">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default JournalCard;