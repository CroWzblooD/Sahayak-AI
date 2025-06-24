import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, router } from 'expo-router';
import React, { ReactNode } from 'react';
import { GestureResponderEvent, Text, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Custom tab bar icon component using emoji for better compatibility
interface TabIconProps {
  emoji: string;
  focused: boolean;
  color: string;
}

const TabIcon: React.FC<TabIconProps> = ({ emoji, focused, color }) => {
  return (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center',
      opacity: focused ? 1 : 0.7,
    }}>
      <Text style={{ 
        fontSize: 22,
        color: color,
      }}>{emoji}</Text>
    </View>
  );
};

// Custom chatbot tab button with glow effect
interface ChatbotTabButtonProps {
  onPress?: (e: GestureResponderEvent) => void;
}

const ChatbotTabButton: React.FC<ChatbotTabButtonProps> = ({ onPress }) => {
  const theme = Colors.light;
  
  const handleChatbotPress = () => {
    router.navigate('/(tabs)/chatbot');
  };
  
  return (
    <TouchableOpacity 
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        width: 60,
        height: 50,
        borderRadius: 30,
        elevation: 4,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 10,
      }}
      onPress={handleChatbotPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[theme.primary, theme.secondary]}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 30 }}>💬</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Custom tab bar background
const TabBarBackground = (): ReactNode => {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
      }}
    />
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors.light; // Always use light theme as per redesign

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: "#BDBDBD",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          position: 'absolute',
          height: 90,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingHorizontal: 20,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="🏠" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schemes"
        options={{
          title: 'Schemes',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="📋" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: 'Chatbot',
          tabBarButton: (props) => <ChatbotTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="centers"
        options={{
          title: 'Centers',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="📍" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: ({ focused, color }) => <TabIcon emoji="📄" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}
