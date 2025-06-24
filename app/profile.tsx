import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfilePage from '../components/ProfilePage';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ProfilePage />
    </SafeAreaView>
  );
}
