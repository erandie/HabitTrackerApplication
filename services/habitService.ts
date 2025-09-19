import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Habit } from '../types';

const HABITS_COLLECTION = 'habits';

export const createHabit = async (habit: Omit<Habit, 'id'>) => {
  return await addDoc(collection(db, HABITS_COLLECTION), habit);
};

export const getHabits = async (userId: string): Promise<Habit[]> => {
  const querySnapshot = await getDocs(collection(db, HABITS_COLLECTION));
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Habit))
    .filter(habit => habit.userId === userId);
};

export const updateHabit = async (id: string, updates: Partial<Habit>) => {
  return await updateDoc(doc(db, HABITS_COLLECTION, id), updates);
};

export const deleteHabit = async (id: string) => {
  return await deleteDoc(doc(db, HABITS_COLLECTION, id));
};