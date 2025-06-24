import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LANGUAGES = [
  { code: 'en', name: 'English', emoji: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', emoji: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', emoji: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', emoji: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', emoji: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', emoji: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', emoji: '🇮🇳' },
];

export default function OnboardingScreen() {
  const [selectedLang, setSelectedLang] = useState('en');
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.emojiContainer}>
          <Text style={styles.bigEmoji}>🤝</Text>
        </View>
        <Text style={styles.title}>Sahayak</Text>
        <Text style={styles.subtitle}>Your smart assistant for all government services</Text>
        <View style={styles.langSection}>
          <Text style={styles.langLabel}>Choose your language</Text>
          <FlatList
            data={LANGUAGES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.code}
            contentContainerStyle={styles.langList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.langChip,
                  selectedLang === item.code && styles.langChipSelected,
                ]}
                onPress={() => setSelectedLang(item.code)}
                activeOpacity={0.8}
              >
                <Text style={styles.langEmoji}>{item.emoji}</Text>
                <Text style={[
                  styles.langName,
                  selectedLang === item.code && { color: 'white', fontWeight: 'bold' },
                ]}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => (navigation as any).replace('(auth)/login', { lang: selectedLang })}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <MaterialCommunityIcons name="arrow-right" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 32 : 0,
    paddingBottom: 32,
  },
  emojiContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
  bigEmoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  langSection: {
    marginBottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  langLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  langList: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 24,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 12,
    minWidth: 90,
    maxWidth: 120,
    minHeight: 44,
    maxHeight: 48,
    justifyContent: 'center',
  },
  langChipSelected: {
    backgroundColor: '#10B981',
  },
  langEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  langName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
}); 