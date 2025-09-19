// services/journalService.ts
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { JournalEntry } from '../types';

export const addJournal = async (journal: Omit<JournalEntry, 'id' | 'userId' | 'date'>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const journalData = {
      ...journal,
      userId: user.uid,
      date: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'journals'), journalData);
    return { id: docRef.id, ...journalData };
  } catch (error) {
    console.error('Error adding journal:', error);
    throw error;
  }
};