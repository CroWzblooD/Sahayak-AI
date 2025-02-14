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
    const inSchemeDetails = segments.includes("schemes");
    
    if (!user && !inAuthGroup) {
      // If no user and not in auth group, go to login
      router.replace("/(auth)/login");
    } else if (user && !user.onboardingCompleted && 
               segments[0] !== "(tabs)" && 
               !segments.includes("OnBoardingForm") && 
               !inSchemeDetails) {
      // Only redirect to onboarding if not viewing scheme details
      router.replace("/OnBoardingForm");
    }
  }, [user, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="(auth)" 
        options={{ 
          headerShown: false,
          // Add this to ensure auth screens work properly
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
    </Stack>
  );
}
