import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    // Implement logout logic
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.email}</Text>
      <Text style={styles.subtitle}>Track your habits and journal your thoughts</Text>
      
      <View style={styles.featureContainer}>
        <View style={styles.featureBox}>
          <Text style={styles.featureTitle}>Habits</Text>
          <Text>Track your daily habits</Text>
          <Button title="View Habits" onPress={() => router.push('/habits')} />
        </View>
        
        <View style={styles.featureBox}>
          <Text style={styles.featureTitle}>Journal</Text>
          <Text>Record your thoughts</Text>
          <Button title="View Journal" onPress={() => router.push('/journal')} />
        </View>
      </View>
      
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  featureContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  featureBox: { 
    width: '48%', 
    backgroundColor: '#f5f5f5', 
    padding: 16, 
    borderRadius: 8 
  },
  featureTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 }
});