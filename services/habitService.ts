// services/habitService.ts
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Habit } from '../types';

export const addHabit = async (habit: Omit<Habit, 'id' | 'userId' | 'createdAt'>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const habitData = {
      ...habit,
      userId: user.uid,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'habits'), habitData);
    return { id: docRef.id, ...habitData };
  } catch (error) {
    console.error('Error adding habit:', error);
    throw error;
  }
};

export const getHabits = async (): Promise<Habit[]> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const habits: Habit[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      habits.push({
        id: doc.id,
        title: data.title || 'Untitled',
        description: data.description || '',
        frequency: data.frequency || 'daily',
        completed: data.completed || false,
        userId: data.userId || user.uid,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      } as Habit);
    });
    return habits;
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }
};

export const updateHabit = async (id: string, updates: Partial<Omit<Habit, 'id' | 'userId' | 'createdAt'>>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const habitRef = doc(db, 'habits', id);
    await updateDoc(habitRef, updates);
  } catch (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
};

export const deleteHabit = async (id: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const habitRef = doc(db, 'habits', id);
    await deleteDoc(habitRef);
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
};