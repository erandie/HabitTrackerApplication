// services/habitService.ts
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
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
      habits.push({ id: doc.id, ...doc.data() } as Habit);
    });
    return habits;
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }
};