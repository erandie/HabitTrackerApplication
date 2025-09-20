import "../global.css"
import { Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function Index() {
  return (
    <View style={{ padding: 20, alignItems: "center" }}>
      <TouchableOpacity
        style={{
          backgroundColor: "#007bff",
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          marginBottom: 12,
        }}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/(auth)/register")}
        style={{ paddingVertical: 8 }}
      >
        <Text style={{ color: "#007bff", fontSize: 14 }}>
          Create an account
        </Text>
      </TouchableOpacity>
    </View>
  );
}
