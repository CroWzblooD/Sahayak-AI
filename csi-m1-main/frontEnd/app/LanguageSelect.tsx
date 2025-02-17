import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { Text } from 'tamagui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { THEME_COLORS } from '@/constants/Colors';
import Animated, { FadeInDown } from 'react-native-reanimated';

const languages = [
  { 
    code: 'en', 
    name: 'English', 
    nativeName: 'English',
    welcomeText: 'Welcome! Please select your language'
  },
  { 
    code: 'hi', 
    name: 'Hindi', 
    nativeName: 'हिंदी',
    welcomeText: 'स्वागत है! कृपया अपनी भाषा चुनें'
  }
];

export default function LanguageSelect() {
  const handleLanguageSelect = async (langCode: 'en' | 'hi') => {
    try {
      // Save the selected language
      await AsyncStorage.setItem('preferredLanguage', langCode);
      
      // Clear any existing onboarding responses
      await AsyncStorage.removeItem('onboardingResponses');
      await AsyncStorage.removeItem('hasCompletedOnboarding');
      
      // After selecting language, go to onboarding
      router.replace('/OnBoardingForm');
    } catch (error) {
      console.error('Error saving language preference:', error);
      Alert.alert('Error', 'Failed to set language preference. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeInDown.delay(200)}
        style={styles.content}
      >
        <Text style={styles.title}>Select Your Language</Text>
        <Text style={styles.subtitle}>अपनी भाषा चुनें</Text>
        
        {languages.map(lang => (
          <Pressable
            key={lang.code}
            style={styles.languageButton}
            onPress={() => handleLanguageSelect(lang.code as 'en' | 'hi')}
          >
            <Text style={styles.languageName}>{lang.name}</Text>
            <Text style={styles.nativeName}>{lang.nativeName}</Text>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 32,
    textAlign: 'center',
  },
  languageButton: {
    width: '100%',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  languageName: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 4,
  },
  nativeName: {
    fontSize: 16,
    color: THEME_COLORS.primary,
  },
}); 