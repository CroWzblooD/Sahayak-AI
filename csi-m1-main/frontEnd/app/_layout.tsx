// Required for tailwind CSS
import "../global.css";
// Requirement ends

import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { createTamagui, TamaguiProvider } from "tamagui";
import defaultConfig from "@tamagui/config/v3";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const config = createTamagui(defaultConfig);

SplashScreen.preventAutoHideAsync();

type AppSegment = 
  | "(auth)"
  | "LanguageSelect"
  | "profile"
  | "edit-profile"
  | "notifications"
  | "help"
  | "schemes-category"
  | "scheme-details"
  | "(tabs)"
  | "OnBoardingForm";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <TamaguiProvider config={config}>
          <ThemeProvider value={DarkTheme}>
            <RootLayoutNav />
            <StatusBar style="light" />
          </ThemeProvider>
        </TamaguiProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export function RootLayoutNav() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    const currentSegment = segments[segments.length - 1];
    
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (
      user && 
      !["LanguageSelect", "profile", "edit-profile", "notifications", "help", "schemes-category", "scheme-details", "OnBoardingForm"].includes(currentSegment) &&
      segments[0] !== "(tabs)"
    ) {
      router.replace("/LanguageSelect");
    }
  }, [user, segments]);

  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="(auth)" 
        options={{ 
          headerShown: false,
          presentation: 'modal' 
        }} 
      />
      <Stack.Screen 
        name="LanguageSelect" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="OnBoardingForm" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="help" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="scheme-details"
        options={{ 
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="schemes/[id]" 
        options={{ 
          headerShown: true,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="schemes-category" 
        options={{ 
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }} 
      />
    </Stack>
  );
}
