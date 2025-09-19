import { StyleSheet } from "react-native";

// Tailwind CSS inspired styles
export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF', // bg-blue-50
  },
  scrollContainer: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#F6E8DB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FB923C', // bg-orange-400
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937', // text-gray-800
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 18,
    color: '#6B7280', // text-gray-500
    textAlign: 'center',
  },
  formCard: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937', // text-gray-800
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280', // text-gray-500
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151', // text-gray-700
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  textInput: {
    backgroundColor: '#F9FAFB', // bg-gray-50
    borderWidth: 2,
    borderColor: '#E5E7EB', // border-gray-200
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 48,
    fontSize: 16,
    color: '#1F2937', // text-gray-800
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  loginButton: {
    backgroundColor: '#FB923C', // bg-orange-400
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  forgotPassword: {
    marginTop: 16,
    marginBottom: 24,
  },
  forgotPasswordText: {
    textAlign: 'center',
    color: '#F97316', // text-orange-500
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB', // border-gray-300
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280', // text-gray-500
  },
  registerButton: {
    borderWidth: 2,
    borderColor: '#FB923C', // border-orange-400
    paddingVertical: 16,
    borderRadius: 12,
  },
  registerButtonText: {
    textAlign: 'center',
    color: '#F97316', // text-orange-500
    fontSize: 16,
    fontWeight: '600',
  },

  backButton: {
      borderWidth: 2,
      borderColor: '#FB923C', // border-orange-400
      paddingVertical: 16,
      backgroundColor: '#E8E8E8',
      borderRadius: 12,
    },
    backButtonText: {
      textAlign: 'center',
      color: 'black', // text-orange-500
      fontSize: 16,
      fontWeight: '600',
    },
  featuresContainer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // border-gray-200
  },
  featuresTitle: {
    color: '#6B7280', // text-gray-500
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 12,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  featureItem: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  featureText: {
    fontSize: 12,
    color: '#6B7280', // text-gray-500
    marginTop: 4,
  },
});