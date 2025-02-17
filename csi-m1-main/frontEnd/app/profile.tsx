import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions, Modal, Switch } from 'react-native';
import { Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { THEME_COLORS } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const ProfileSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <Animated.View 
    entering={FadeInDown.delay(200)}
    style={styles.section}
  >
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </Animated.View>
);

const StatCard = ({ icon, value, label }: { icon: string, value: string, label: string }) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      <Ionicons name={icon as any} size={24} color={THEME_COLORS.primary} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ProfileItem = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <View style={styles.profileItem}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon as any} size={20} color={THEME_COLORS.primary} />
    </View>
    <View style={styles.itemContent}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const QuickAction = ({ icon, label, onPress }: { icon: string, label: string, onPress: () => void }) => (
  <Pressable style={styles.quickAction} onPress={onPress}>
    <View style={styles.quickActionIcon}>
      <Ionicons name={icon as any} size={24} color={THEME_COLORS.primary} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </Pressable>
);

const SettingsModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </Pressable>
          </View>
          
          <ScrollView>
            <View style={styles.settingItem}>
              <Ionicons name="moon" size={24} color={THEME_COLORS.primary} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#767577', true: THEME_COLORS.primary }}
              />
            </View>

            <View style={styles.settingItem}>
              <Ionicons name="notifications" size={24} color={THEME_COLORS.primary} />
              <Text style={styles.settingLabel}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#767577', true: THEME_COLORS.primary }}
              />
            </View>

            <Pressable style={styles.settingItem}>
              <Ionicons name="language" size={24} color={THEME_COLORS.primary} />
              <Text style={styles.settingLabel}>Language</Text>
              <Text style={styles.settingValue}>{language}</Text>
            </Pressable>

            <Pressable style={styles.settingItem}>
              <Ionicons name="shield-checkmark" size={24} color={THEME_COLORS.primary} />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </Pressable>

            <Pressable style={styles.settingItem}>
              <Ionicons name="document-text" size={24} color={THEME_COLORS.primary} />
              <Text style={styles.settingLabel}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  // Hardcoded data for now
  const profileData = {
    personal: {
      name: "Ashish K Choudhary",
      age: "28",
      occupation: "Software Engineer",
      education: "B.Tech in Computer Science",
      email: "ashishkchoudhary@gmail.com",
      disability: "No",
      disabilityType: "None"
    },
    financial: {
      monthlyIncome: "₹75,000",
      category: "General",
    },
    location: {
      state: "Delhi",
      city: "New Delhi",
    },
    stats: {
      appliedSchemes: "12",
      eligibleSchemes: "45",
      savedSchemes: "8",
    }
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const handleHelp = () => {
    router.push('/help');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[THEME_COLORS.primary, '#000']}
          style={styles.header}
        >
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profileData.personal.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <Text style={styles.name}>{profileData.personal.name}</Text>
            <Text style={styles.email}>{profileData.personal.email}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <StatCard 
              icon="documents-outline" 
              value={profileData.stats.appliedSchemes}
              label="Applied"
            />
            <StatCard 
              icon="checkmark-circle-outline" 
              value={profileData.stats.eligibleSchemes}
              label="Eligible"
            />
            <StatCard 
              icon="bookmark-outline" 
              value={profileData.stats.savedSchemes}
              label="Saved"
            />
          </View>

          <View style={styles.quickActionsContainer}>
            <QuickAction 
              icon="create-outline" 
              label="Edit Profile"
              onPress={handleEditProfile}
            />
            <QuickAction 
              icon="notifications-outline" 
              label="Notifications"
              onPress={handleNotifications}
            />
            <QuickAction 
              icon="settings-outline" 
              label="Settings"
              onPress={() => setShowSettings(true)}
            />
            <QuickAction 
              icon="help-circle-outline" 
              label="Help"
              onPress={handleHelp}
            />
          </View>

          <ProfileSection title="Personal Information">
            <ProfileItem 
              icon="person-outline" 
              label="Full Name" 
              value={profileData.personal.name} 
            />
            <ProfileItem 
              icon="calendar-outline" 
              label="Age" 
              value={profileData.personal.age} 
            />
            <ProfileItem 
              icon="briefcase-outline" 
              label="Occupation" 
              value={profileData.personal.occupation} 
            />
            <ProfileItem 
              icon="school-outline" 
              label="Education" 
              value={profileData.personal.education} 
            />
          </ProfileSection>

          <ProfileSection title="Disability Information">
            <ProfileItem 
              icon="fitness-outline" 
              label="Disability Status" 
              value={profileData.personal.disability} 
            />
            {profileData.personal.disability === "Yes" && (
              <ProfileItem 
                icon="medical-outline" 
                label="Disability Type" 
                value={profileData.personal.disabilityType} 
              />
            )}
          </ProfileSection>

          <ProfileSection title="Financial Information">
            <ProfileItem 
              icon="cash-outline" 
              label="Monthly Income" 
              value={profileData.financial.monthlyIncome} 
            />
            <ProfileItem 
              icon="people-outline" 
              label="Category" 
              value={profileData.financial.category} 
            />
          </ProfileSection>

          <ProfileSection title="Location">
            <ProfileItem 
              icon="location-outline" 
              label="State" 
              value={profileData.location.state} 
            />
            <ProfileItem 
              icon="business-outline" 
              label="City" 
              value={profileData.location.city} 
            />
          </ProfileSection>

          <Pressable 
            style={styles.logoutButton}
            onPress={signOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>

      <SettingsModal 
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  header: {
    height: 220,
    padding: 20,
    justifyContent: 'flex-end',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: width * 0.28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${THEME_COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAction: {
    width: width * 0.21,
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${THEME_COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
}); 