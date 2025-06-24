import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

// Mock data - replace with real data later
const mockUser = {
  name: 'Sahayak User',
  email: 'user@example.com',
  phone: '+91 98765 43210',
  language: 'English',
  avatar: '🧑‍💼',
  // Personal Details
  aadhaar: 'XXXX-XXXX-1234',
  pan: 'XXXXX1234X',
  address: {
    street: '123, Main Street',
    city: 'Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    pincode: '110001'
  },
  dob: '01-01-1990',
  gender: 'Male',
  // Income Details
  income: {
    annual: '₹4,50,000',
    category: 'Below Poverty Line',
    source: 'Self Employed'
  },
  // Documents
  documents: [
    { name: 'Aadhaar Card', status: 'verified', icon: 'card-account-details' as const },
    { name: 'PAN Card', status: 'verified', icon: 'card-account-details' as const },
    { name: 'Income Proof', status: 'pending', icon: 'file-document' as const }
  ],
  // Scheme Eligibility
  eligibleSchemes: [
    { 
      name: 'PMAY', 
      status: 'eligible',
      description: 'Housing for All',
      icon: 'home-city' as const
    },
    { 
      name: 'Ayushman Bharat', 
      status: 'eligible',
      description: 'Health Insurance',
      icon: 'medical-bag' as const
    },
    { 
      name: 'PM Ujjwala',
      status: 'eligible',
      description: 'LPG Connection',
      icon: 'fire' as const
    }
  ],
  // Activity Data
  activityData: {
    schemes: [3, 5, 2, 4, 6, 3, 4],
    documents: [2, 3, 1, 2, 3, 2, 1],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  }
};

const ProfilePage = () => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const languages = ['English', 'Hindi', 'Punjabi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati'];

  const renderActivityGraph = () => {
    const width = Dimensions.get('window').width - 64;
    const height = 200;
    const padding = 20;
    const graphWidth = width - (padding * 2);
    const graphHeight = height - (padding * 2);
    const maxValue = Math.max(...mockUser.activityData.schemes);
    const barWidth = (graphWidth / mockUser.activityData.schemes.length) - 10;

    return (
      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>Weekly Activity</Text>
        <Svg width={width} height={height}>
          {/* Grid Lines */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Path
              key={`grid-${i}`}
              d={`M${padding} ${padding + (i * (graphHeight / 6))} H${width - padding}`}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          
          {/* Bars */}
          {mockUser.activityData.schemes.map((value, index) => {
            const barHeight = (value / maxValue) * graphHeight;
            return (
              <Rect
                key={`bar-${index}`}
                x={padding + (index * (graphWidth / mockUser.activityData.schemes.length))}
                y={height - padding - barHeight}
                width={barWidth}
                height={barHeight}
                fill="#10B981"
                rx={4}
              />
            );
          })}

          {/* Labels */}
          {mockUser.activityData.labels.map((label, index) => (
            <Text
              key={`label-${index}`}
              style={[
                styles.graphLabel,
                {
                  left: padding + (index * (graphWidth / mockUser.activityData.labels.length)) + (barWidth / 2),
                  bottom: 0
                }
              ]}
            >
              {label}
            </Text>
          ))}
        </Svg>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header with Gradient */}
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.avatar}>{mockUser.avatar}</Text>
            <Text style={styles.name}>{mockUser.name}</Text>
            <Text style={styles.email}>{mockUser.email}</Text>
            <TouchableOpacity style={styles.editButton}>
              <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="file-check" size={24} color="#10B981" />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Documents</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Eligible</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#10B981" />
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Applied</Text>
          </View>
        </View>

        {/* Activity Graph */}
        {renderActivityGraph()}

        {/* Personal Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-details" size={24} color="#10B981" />
            <Text style={styles.cardTitle}>Personal Details</Text>
          </View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="phone" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{mockUser.phone}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>DOB</Text>
              <Text style={styles.detailValue}>{mockUser.dob}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="gender-male-female" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>Gender</Text>
              <Text style={styles.detailValue}>{mockUser.gender}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="cash" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>Income</Text>
              <Text style={styles.detailValue}>{mockUser.income.annual}</Text>
            </View>
          </View>
        </View>

        {/* Documents Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="file-document-multiple" size={24} color="#10B981" />
            <Text style={styles.cardTitle}>Documents</Text>
          </View>
          {mockUser.documents.map((doc, index) => (
            <View key={index} style={styles.documentRow}>
              <MaterialCommunityIcons name={doc.icon} size={24} color="#10B981" />
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: doc.status === 'verified' ? '#E8F5E9' : '#FFF3E0' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: doc.status === 'verified' ? '#10B981' : '#F97316' }
                  ]}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.uploadButton}>
            <MaterialCommunityIcons name="upload" size={20} color="#10B981" />
            <Text style={styles.uploadButtonText}>Upload New Document</Text>
          </TouchableOpacity>
        </View>

        {/* Scheme Eligibility Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="check-decagram" size={24} color="#10B981" />
            <Text style={styles.cardTitle}>Scheme Eligibility</Text>
          </View>
          {mockUser.eligibleSchemes.map((scheme, index) => (
            <View key={index} style={styles.schemeCard}>
              <View style={styles.schemeHeader}>
                <MaterialCommunityIcons name={scheme.icon} size={24} color="#10B981" />
                <View style={styles.schemeInfo}>
                  <Text style={styles.schemeName}>{scheme.name}</Text>
                  <Text style={styles.schemeDescription}>{scheme.description}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: scheme.status === 'eligible' ? '#E8F5E9' : '#FFEBEE' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: scheme.status === 'eligible' ? '#10B981' : '#EF4444' }
                  ]}>
                    {scheme.status === 'eligible' ? 'Eligible' : 'Not Eligible'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.checkMoreButton}>
            <Text style={styles.checkMoreText}>Check More Schemes</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* Support Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="help-circle" size={24} color="#10B981" />
            <Text style={styles.cardTitle}>Need Help?</Text>
          </View>
          <TouchableOpacity style={styles.supportButton}>
            <MaterialCommunityIcons name="robot" size={24} color="#fff" />
            <Text style={styles.supportButtonText}>Ask Sahayak AI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.supportButton, styles.callButton]}>
            <MaterialCommunityIcons name="phone" size={24} color="#fff" />
            <Text style={styles.supportButtonText}>Request Agent Call</Text>
          </TouchableOpacity>
        </View>

        {/* Language Selection */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="translate" size={24} color="#10B981" />
            <Text style={styles.cardTitle}>Language</Text>
          </View>
          <TouchableOpacity 
            style={styles.languageSelector}
            onPress={() => setShowLanguageModal(true)}
          >
            <Text style={styles.languageSelectorText}>{mockUser.language}</Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Language</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.languageList}>
                {languages.map((lang, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.languageOption,
                      lang === mockUser.language && styles.languageOptionActive
                    ]}
                    onPress={() => {
                      // Handle language change
                      setShowLanguageModal(false);
                    }}
                  >
                    <Text style={[
                      styles.languageOptionText,
                      lang === mockUser.language && styles.languageOptionTextActive
                    ]}>
                      {lang}
                    </Text>
                    {lang === mockUser.language && (
                      <MaterialCommunityIcons name="check" size={24} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    fontSize: 80,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#E5E7EB',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  graphContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  graphLabel: {
    position: 'absolute',
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    transform: [{ translateX: -15 }],
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '50%',
    padding: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  schemeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  schemeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schemeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  schemeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  schemeDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 12,
  },
  checkMoreText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  callButton: {
    backgroundColor: '#3B82F6',
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  languageSelectorText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  languageList: {
    maxHeight: 400,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  languageOptionActive: {
    backgroundColor: '#F3F4F6',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  languageOptionTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfilePage;
