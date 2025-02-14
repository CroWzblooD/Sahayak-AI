import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const THEME_COLORS = {
  primary: '#34D399',
  secondary: '#10B981',
  background: '#F9FAFB',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEME_COLORS.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <View style={{ 
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: '100%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }} />
        ),
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'transparent',
            height: 85,
            borderTopWidth: 0,
            paddingBottom: 8,
            paddingTop: 8,
          },
          default: {
            height: 70,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }),
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 11,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schemes"
        options={{
          title: 'Schemes',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="file-document-multiple-outline" size={26} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ color }) => (
            <View style={{
              backgroundColor: THEME_COLORS.primary,
              width: 50,
              height: 50,
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              shadowColor: THEME_COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              gap:10,
              elevation: 5,
            }}>
              <MaterialCommunityIcons name="robot" size={30} color="white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="folder-multiple-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="compass-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schemes/[id]"
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />
    </Tabs>
  );
}
