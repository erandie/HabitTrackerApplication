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
import { StyleSheet } from "react-native"

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
        router.push("/home")
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
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.background}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="journal-outline" size={32} color="#6B73FF" />
              </View>
              <Text style={styles.appTitle}>Mimi</Text>
              <Text style={styles.appSubtitle}>
                Your daily companion for growth
              </Text>
            </View>
          </View>

          {/* Login Form Card */}
          <View style={styles.formCard}>
            <View style={styles.welcomeHeader}>
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSubtitle}>
                Continue your journey of self-improvement
              </Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconLeft}>
                  <Ionicons name="mail-outline" size={20} color="#8B92A3" />
                </View>
                <TextInput
                  placeholder="Enter your email"
                  style={styles.textInput}
                  placeholderTextColor="#B5BAC7"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconLeft}>
                  <Ionicons name="lock-closed-outline" size={20} color="#8B92A3" />
                </View>
                <TextInput
                  placeholder="Enter your password"
                  style={styles.textInput}
                  placeholderTextColor="#B5BAC7"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.inputIconRight}
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

            {/* Forgot Password */}
            <Pressable style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>
                Forgot your password?
              </Text>
            </Pressable>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoadingLogin && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoadingLogin}
            >
              {isLoadingLogin ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.loadingText}>Signing in...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register and Back Buttons */}
            <View style={styles.bottomButtons}>
              <Pressable
                onPress={() => router.push("/register")}
                style={styles.registerButton}
              >
                <Text style={styles.registerButtonText}>
                  Create New Account
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/")}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>
                  Back to Home
                </Text>
              </Pressable>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>
                Track and improve your:
              </Text>
              <View style={styles.featuresGrid}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#6B73FF" />
                  </View>
                  <Text style={styles.featureText}>Habits</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="book-outline" size={18} color="#6B73FF" />
                  </View>
                  <Text style={styles.featureText}>Journal</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="calendar-outline" size={18} color="#6B73FF" />
                  </View>
                  <Text style={styles.featureText}>Planning</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="trending-up-outline" size={18} color="#6B73FF" />
                  </View>
                  <Text style={styles.featureText}>Progress</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6B73FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '400',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 52,
  },
  inputIconLeft: {
    marginRight: 12,
  },
  inputIconRight: {
    marginLeft: 12,
    padding: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '400',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6B73FF',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#6B73FF',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#6B73FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 14,
    color: '#8B92A3',
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  bottomButtons: {
    gap: 12,
    marginBottom: 32,
  },
  registerButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  registerButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#8B92A3',
    fontSize: 14,
    fontWeight: '500',
  },
  featuresContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#EEF0FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
})

export default Login