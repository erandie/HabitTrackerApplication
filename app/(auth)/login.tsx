import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { login } from "@/services/authService"
import { Ionicons } from '@expo/vector-icons'
import { loginStyles } from "@/styles/loginStyles"

const Login = () => {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isLoadingLogin, setIsLoadingLogin] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email")
      return
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password")
      return
    }

    if (isLoadingLogin) return
    setIsLoadingLogin(true)

    await login(email, password)
      .then((res) => {
        console.log(res)
        router.push("/dash")
      })
      .catch((err) => {
        console.error(err)
        Alert.alert("Login Failed", "Please check your credentials and try again")
      })
      .finally(() => {
        setIsLoadingLogin(false)
      })
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={loginStyles.container}
    >
      <ScrollView
        contentContainerStyle={loginStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={loginStyles.background}>
          {/* Header Section */}
          <View style={loginStyles.header}>
            <View style={loginStyles.logoContainer}>
              <View style={loginStyles.logo}>
                <Ionicons name="paw" size={40} color="white" />
              </View>

              <Text style={loginStyles.appTitle}>PetoCloud</Text>
              <Text style={loginStyles.appSubtitle}>
                Your pet's health companion
              </Text>
            </View>
          </View>

          {/* Login Form Card */}
          <View style={loginStyles.formCard}>
            <Text style={loginStyles.welcomeTitle}>Welcome Back!</Text>
            <Text style={loginStyles.welcomeSubtitle}>
              Sign in to manage your pet's care
            </Text>

            {/* Email Input */}
            <View style={loginStyles.inputContainer}>
              <Text style={loginStyles.inputLabel}>Email</Text>
              <View style={loginStyles.inputWrapper}>
                <TextInput
                  placeholder="Enter your email"
                  style={loginStyles.textInput}
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={loginStyles.inputIcon}>
                  <Ionicons name="mail-outline" size={24} color="#9CA3AF" />
                </View>
              </View>
            </View>

            {/* Password Input */}
            <View style={loginStyles.inputContainer}>
              <Text style={loginStyles.inputLabel}>Password</Text>
              <View style={loginStyles.inputWrapper}>
                <TextInput
                  placeholder="Enter your password"
                  style={loginStyles.textInput}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={loginStyles.inputIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[loginStyles.loginButton, isLoadingLogin && loginStyles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoadingLogin}
            >
              {isLoadingLogin ? (
                <View style={loginStyles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={loginStyles.loadingText}>Signing in...</Text>
                </View>
              ) : (
                <Text style={loginStyles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password */}
            <Pressable style={loginStyles.forgotPassword}>
              <Text style={loginStyles.forgotPasswordText}>
                Forgot Password?
              </Text>
            </Pressable>

            {/* Divider */}
            <View style={loginStyles.divider}>
              <View style={loginStyles.dividerLine} />
              <Text style={loginStyles.dividerText}>or</Text>
              <View style={loginStyles.dividerLine} />
            </View>

            {/* Register Link */}
          <Pressable
            onPress={() => router.push("/register")}
            style={loginStyles.registerButton}
          >
            <Text style={loginStyles.registerButtonText}>
              Create New Account
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/")} // Navigate to index
            style={[loginStyles.backButton, { marginTop: 12 }]} // Add space
          >
            <Text style={loginStyles.backButtonText}>
              Back to Home
            </Text>
          </Pressable>



            {/* Features */}
            <View style={loginStyles.featuresContainer}>
              <Text style={loginStyles.featuresTitle}>
                Manage your pet's:
              </Text>
              <View style={loginStyles.featuresRow}>
                <View style={loginStyles.featureItem}>
                  <Ionicons name="medical-outline" size={20} color="#F97316" />
                  <Text style={loginStyles.featureText}>Health</Text>
                </View>
                <View style={loginStyles.featureItem}>
                  <Ionicons name="calendar-outline" size={20} color="#F97316" />
                  <Text style={loginStyles.featureText}>Schedule</Text>
                </View>
                <View style={loginStyles.featureItem}>
                  <Ionicons name="nutrition-outline" size={20} color="#F97316" />
                  <Text style={loginStyles.featureText}>Nutrition</Text>
                </View>
                <View style={loginStyles.featureItem}>
                  <Ionicons name="location-outline" size={20} color="#F97316" />
                  <Text style={loginStyles.featureText}>Vets</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Login