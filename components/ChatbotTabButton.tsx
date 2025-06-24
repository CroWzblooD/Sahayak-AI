import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { GestureResponderEvent, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';

type ChatbotTabButtonProps = {
  onPress?: (e: GestureResponderEvent) => void;
};

export function ChatbotTabButton({ onPress }: ChatbotTabButtonProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handlePress = (e: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress && onPress(e);
  };

  return (
    <TouchableOpacity
      style={[styles.chatbotButton, { backgroundColor: theme.primary }]}
      onPress={handlePress}
    >
      <IconSymbol size={32} name="message.fill" color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatbotButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 