export interface Habit {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly';
  completed: boolean;
  createdAt: Date;
  userId: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: 'happy' | 'sad' | 'neutral' | 'excited';
  createdAt: Date;
  userId: string;
}