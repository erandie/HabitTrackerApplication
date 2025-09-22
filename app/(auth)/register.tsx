import React from 'react';
import { Platform, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Register() {
  const [email, setEmail] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [selectedSuggestion, setSelectedSuggestion] = React.useState('');
  const [isLoadingReg, setIsLoadingReg] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();

  // Placeholder for handleRegister function (unchanged)
  const handleRegister = async () => {
    setIsLoadingReg(true);
    // Existing Firebase signup logic here
    setIsLoadingReg(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-emerald-100" // Light emerald background
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-4 bg-emerald-100">
          {/* Header Section */}
          <View className="items-center mb-5">
            <View className="items-center">
              <View className="bg-white rounded-full p-2.5 mb-2.5">
                <Ionicons name="journal-outline" size={32} color="#2ECC71" />
              </View>
              <Text className="text-3xl font-bold text-emerald-600">Mimi</Text>
              <Text className="text-base text-gray-600 text-center">
                Your daily companion for growth
              </Text>
            </View>
          </View>

          {/* Register Form Card */}
          <View className="bg-green rounded-2xl p-6 shadow-md">
            <View className="items-center mb-5">
              <Text className="text-2xl font-bold text-gray-900">Join Mimi</Text>
              <Text className="text-base text-gray-600 text-center">
                Start your journey of self-improvement
              </Text>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-900 mb-2">Email Address</Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                <View className="p-3">
                  <Ionicons name="mail-outline" size={20} color="#8B92A3" />
                </View>
                <TextInput
                  placeholder="Enter your email"
                  className="flex-1 py-3 px-1 text-base text-gray-900"
                  placeholderTextColor="#B5BAC7"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Nickname Input with Picker */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-900 mb-2">Cute Nickname (e.g., Adventurer, Dreamer)</Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                <View className="p-3">
                  <Ionicons name="person-outline" size={20} color="#8B92A3" />
                </View>
                <TextInput
                  placeholder="Enter your nickname"
                  className="flex-1 py-3 px-1 text-base text-gray-900"
                  placeholderTextColor="#B5BAC7"
                  value={nickname}
                  onChangeText={setNickname}
                />
                <View className="p-3">
                  <Picker
                    selectedValue={selectedSuggestion}
                    onValueChange={(value) => {
                      setNickname(value);
                      setSelectedSuggestion(value);
                    }}
                    style={{ width: 120, height: 40, backgroundColor: '#E8F5E9' }}
                    dropdownIconColor="#2ECC71"
                  >
                    <Picker.Item label="Select" value="" />
                    <Picker.Item label="Adventurer" value="Adventurer" />
                    <Picker.Item label="Dreamer" value="Dreamer" />
                    <Picker.Item label="Hero" value="Hero" />
                    <Picker.Item label="Zen" value="Zen" />
                  </Picker>
                </View>
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-900 mb-2">Password</Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
                <View className="p-3">
                  <Ionicons name="lock-closed-outline" size={20} color="#8B92A3" />
                </View>
                <TextInput
                  placeholder="Enter your password"
                  className="flex-1 py-3 px-1 text-base text-gray-900"
                  placeholderTextColor="#B5BAC7"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  className="p-3"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#8B92A3"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className={`bg-emerald-600 rounded-lg py-3.5 items-center mt-4 ${isLoadingReg ? 'opacity-50' : ''}`}
              onPress={handleRegister}
              disabled={isLoadingReg}
            >
              {isLoadingReg ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text className="text-lg font-semibold text-white ml-2">Creating Account...</Text>
                </View>
              ) : (
                <Text className="text-lg font-semibold text-white">Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-5">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-2.5 text-sm text-gray-600">or</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Login Link */}
            <TouchableOpacity
              className="items-center mt-3"
              onPress={() => router.push("/login")}
            >
              <Text className="text-base text-emerald-600 font-medium">
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>

            {/* Features */}
            <View className="mt-6 items-center">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Track and improve your:
              </Text>
              <View className="flex-row flex-wrap justify-center">
                <View className="flex-row items-center w-1/2 p-2">
                  <Ionicons name="checkmark-circle-outline" size={18} color="#2ECC71" />
                  <Text className="ml-2 text-sm text-gray-900">Habits</Text>
                </View>
                <View className="flex-row items-center w-1/2 p-2">
                  <Ionicons name="book-outline" size={18} color="#2ECC71" />
                  <Text className="ml-2 text-sm text-gray-900">Journal</Text>
                </View>
                <View className="flex-row items-center w-1/2 p-2">
                  <Ionicons name="calendar-outline" size={18} color="#2ECC71" />
                  <Text className="ml-2 text-sm text-gray-900">Planning</Text>
                </View>
                <View className="flex-row items-center w-1/2 p-2">
                  <Ionicons name="trending-up-outline" size={18} color="#2ECC71" />
                  <Text className="ml-2 text-sm text-gray-900">Progress</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}