import React from "react";
import "./../global.css";
import { AuthProvider } from "@/context/AuthContext";
import { LoaderProvider } from "@/context/LoaderContext"
import { Slot } from "expo-router";
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

const RootLayout = () => {

  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Please enable notifications for reminders.');
        }
      })();
    }
  }, []);

  return (
      <LoaderProvider>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </LoaderProvider>
  );
};

export default RootLayout;