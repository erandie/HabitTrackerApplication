import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Image, Animated, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import * as Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/app/(dashboard)/_layout';
import { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function EditProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState(''); // Current password for re-auth
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null); // Store image URI or base64
  const { colors } = useTheme();

  // Load saved image on mount
  React.useEffect(() => {
    const loadImage = async () => {
      const savedImage = await AsyncStorage.getItem(`profileImage_${user?.uid}`);
      if (savedImage) setImageUri(savedImage);
    };
    loadImage();
  }, [user?.uid]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload a profile picture.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square crop
      quality: 0.5,   // Reduce quality for smaller size
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 200 } }], // Resize to 200px width
        { compress: 0.7, format: ImageManipulator.SaveFormat.PNG } // Compress to ~50-100KB
      );
      const base64 = await ImageManipulator.manipulateAsync(manipResult.uri, [], {
        base64: true,
      });
      if (base64.base64) {
        await AsyncStorage.setItem(`profileImage_${user?.uid}`, base64.base64);
        setImageUri(base64.base64);
        Alert.alert('Success', 'Profile picture updated!');
      }
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (!password && (email !== user.email || newPassword)) {
      Alert.alert('Error', 'Please enter your current password for verification');
      return;
    }

    setIsLoading(true);
    try {
      let changesMade = false;

      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
        changesMade = true;
        await logChange('displayName', displayName);
      }

      if (email && email !== user.email) {
        const credential = EmailAuthProvider.credential(user.email ?? '', password);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, email);
        changesMade = true;
        await logChange('email', email);
        Alert.alert('Note', 'Email change requires re-login next time.');
      }

      if (newPassword) {
        const credential = EmailAuthProvider.credential(user.email ?? '', password);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        changesMade = true;
        await logChange('password', 'updated');
        Alert.alert('Note', 'Password updated successfully.');
      }

      if (changesMade) {
        Toast.show({
          type: 'success',
          text1: 'Profile Updated!',
          text2: 'Your changes have been saved.',
          visibilityTime: 3000,
        });
        router.replace('/(dashboard)/profile'); // Adjust path if needed
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      Alert.alert('Error', `Failed to update profile: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const logChange = async (field: string, value: string) => {
    await addDoc(collection(db, 'profileChanges'), {
      userId: user?.uid,
      field,
      value,
      timestamp: serverTimestamp(),
    });
  };

return (
  <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]} // Only change background color
  >
  
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Edit Profile 👤</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Update your personal information</Text>
      </Animated.View>

      {/* Profile Picture */}
      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.imageSection}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Image
            style={styles.image}
            source={imageUri ? { uri: `data:image/png;base64,${imageUri}` } : require('../../assets/images/habitTrackerAvater.jpeg')}
          />
          <Text style={[styles.pickText, { color: colors.accent }]}>📷 Change Profile Picture</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Form */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.formContainer}>
        <TextInput 
          style={[styles.input, { 
            backgroundColor: colors.backgroundWhite, 
            color: colors.textPrimary,
            borderColor: colors.textSecondary 
          }]} 
          placeholder="Display Name" 
          placeholderTextColor={colors.textSecondary}
          value={displayName} 
          onChangeText={setDisplayName} 
        />
        
        <TextInput 
          style={[styles.input, { 
            backgroundColor: colors.backgroundWhite, 
            color: colors.textPrimary,
            borderColor: colors.textSecondary 
          }]} 
          placeholder="New Email" 
          placeholderTextColor={colors.textSecondary}
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
        />
        
        <TextInput 
          style={[styles.input, { 
            backgroundColor: colors.backgroundWhite, 
            color: colors.textPrimary,
            borderColor: colors.textSecondary 
          }]} 
          placeholder="Current Password (for verification)" 
          placeholderTextColor={colors.textSecondary}
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />
        
        <TextInput 
          style={[styles.input, { 
            backgroundColor: colors.backgroundWhite, 
            color: colors.textPrimary,
            borderColor: colors.textSecondary 
          }]} 
          placeholder="New Password (optional)" 
          placeholderTextColor={colors.textSecondary}
          value={newPassword} 
          onChangeText={setNewPassword} 
          secureTextEntry 
        />
      </Animated.View>

      {/* Save Button */}
      <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <Text style={styles.buttonText}>💾 Save Changes</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imagePicker: { 
    alignItems: 'center',
  },
  image: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: '#e7e5e4',
    marginBottom: 12,
  },
  pickText: { 
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 32,
  },
  input: { 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16, 
    fontSize: 16,
    borderWidth: 0.1,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  button: { 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700' 
  },
});