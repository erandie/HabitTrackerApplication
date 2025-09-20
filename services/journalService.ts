// services/journalService.ts
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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

export const getJournals = async (): Promise<JournalEntry[]> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const q = query(collection(db, 'journals'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const journals: JournalEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      journals.push({
        id: doc.id,
        title: data.title || 'Untitled',
        content: data.content || '',
        mood: data.mood || 'neutral',
        userId: data.userId || user.uid,
        date: data.date ? data.date.toDate() : new Date(),
      } as JournalEntry);
    });
    return journals;
  } catch (error) {
    console.error('Error fetching journals:', error);
    throw error;
  }
};

export const updateJournal = async (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'userId' | 'date'>>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const journalRef = doc(db, 'journals', id);
    await updateDoc(journalRef, updates);
  } catch (error) {
    console.error('Error updating journal:', error);
    throw error;
  }
};

export const deleteJournal = async (id: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const journalRef = doc(db, 'journals', id);
    await deleteDoc(journalRef);
  } catch (error) {
    console.error('Error deleting journal:', error);
    throw error;
  }
};