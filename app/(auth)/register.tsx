import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator
} from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { register } from "@/services/authService"
import { Picker } from "@react-native-picker/picker"

const Register = () => {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [password, setPasword] = useState<string>("")
  const [isLodingReg, setIsLoadingReg] = useState<boolean>(false)
  const [nickname, setNickname] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState('');

  const handleRegister = async () => {
    // if(!email){

    // }
    // 
    if (isLodingReg) return
    setIsLoadingReg(true)
    await register(email, password)
      .then((res) => {
        console.log(res)
        router.back()
      })
      .catch((err) => {
        console.error(err)
        Alert.alert("Registration fail", "Somthing went wrong")
        // import { Alert } from "react-native"
      })
      .finally(() => {
        setIsLoadingReg(false)
      })
  }

  return (
    <View className="flex-1 bg-gray-100 justify-center p-4">
      <Text className="text-2xl font-bold mb-6 text-blue-600 text-center">
        Register
      </Text>
      <TextInput
        placeholder="Email"
        className="bg-surface border border-gray-300 rounded px-4 py-3 mb-4 text-gray-900"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
      />

    <View className="mb-4">
      <Text className="text-gray-700 mb-1">Cute Nickname (e.g., Adventurer, Dreamer)</Text>
        <View className="flex-row items-center mb-2">
          <TextInput
            className="bg-white rounded-lg p-2 text-gray-800 flex-1 mr-2"
            placeholder="Enter your nickname"
            value={nickname}
            onChangeText={setNickname}
          />
          <Picker
            selectedValue={selectedSuggestion}
            onValueChange={(value) => {
              setNickname(value);
              setSelectedSuggestion(value);
            }}
            style={{ width: 120, height: 40, backgroundColor: '#fff', borderRadius: 8 }}
            dropdownIconColor="#4a6bdf"
          >
            <Picker.Item label="Select a suggestion" value="" />
            <Picker.Item label="Adventurer" value="Adventurer" />
            <Picker.Item label="Dreamer" value="Dreamer" />
            <Picker.Item label="Hero" value="Hero" />
            <Picker.Item label="Zen" value="Zen" />
          </Picker>
        </View>
      </View>

      <TextInput
        placeholder="Password"
        className="bg-surface border border-gray-300 rounded px-4 py-3 mb-4 text-gray-900"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPasword}
      />
      <TouchableOpacity
        className="bg-green-600 p-4 rounded mt-2"
        onPress={handleRegister}
      >
        {isLodingReg ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text className="text-center text-2xl text-white">Register</Text>
        )}
      </TouchableOpacity>
      <Pressable onPress={() => router.back()}>
        <Text className="text-center text-blue-500 text-xl">
          Alredy have an account? Login
        </Text>
      </Pressable>
    </View>
  )
}

export default Register