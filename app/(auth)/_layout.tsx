import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // hide header for auth screens
        animation: "slide_from_right", // smooth transition
      }}
    />
  );
}