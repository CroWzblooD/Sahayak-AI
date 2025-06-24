import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface DocumentCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

interface DocumentDetails {
  documentNumber?: string;
  name?: string;
  dob?: string;
  address?: string;
  issueDate?: string;
  expiryDate?: string;
  isVerified: boolean;
  verificationDate?: string;
  accountNumber?: string;
  bankName?: string;
  period?: string;
  balance?: string;
  certificateNumber?: string;
  annualIncome?: string;
  issuingAuthority?: string;
}

interface Document {
  id: string;
  name: string;
  category: string;
  date: string;
  size: string;
  type: string;
  emoji: string;
  details: DocumentDetails;
}

// Document categories with emojis and colors matching schemes page
const documentCategories: DocumentCategory[] = [
  { id: '1', name: 'Identity', emoji: '🪪', color: '#E3F2FD', description: 'Personal identification documents' },
  { id: '2', name: 'Financial', emoji: '💰', color: '#E8F5E9', description: 'Bank statements and financial records' },
  { id: '3', name: 'Education', emoji: '📚', color: '#FFF8E1', description: 'Academic certificates and records' },
  { id: '4', name: 'Property', emoji: '🏠', color: '#F3E5F5', description: 'Property documents and agreements' },
  { id: '5', name: 'Medical', emoji: '🏥', color: '#FFEBEE', description: 'Health records and prescriptions' },
  { id: '6', name: 'Others', emoji: '📋', color: '#ECEFF1', description: 'Miscellaneous documents' },
];

// Enhanced sample documents data with more details
const sampleDocuments: Document[] = [
  {
    id: '1',
    name: 'Aadhaar Card',
    category: 'Identity',
    date: '2024-03-15',
    size: '2.4 MB',
    type: 'PDF',
    emoji: '🪪',
    details: {
      documentNumber: '1234 5678 9012',
      name: 'John Doe',
      dob: '01-01-1990',
      address: '123 Main Street, City',
      issueDate: '2020-01-01',
      expiryDate: '2030-01-01',
      isVerified: true,
      verificationDate: '2024-02-15',
    },
  },
  {
    id: '2',
    name: 'PAN Card',
    category: 'Identity',
    date: '2024-03-10',
    size: '1.8 MB',
    type: 'PDF',
    emoji: '💳',
    details: {
      documentNumber: 'ABCDE1234F',
      name: 'John Doe',
      dob: '01-01-1990',
      issueDate: '2015-01-01',
      isVerified: true,
      verificationDate: '2024-02-10',
    },
  },
  {
    id: '3',
    name: 'Bank Statement',
    category: 'Financial',
    date: '2024-03-01',
    size: '3.2 MB',
    type: 'PDF',
    emoji: '🏦',
    details: {
      accountNumber: 'XXXX1234',
      bankName: 'State Bank of India',
      period: 'March 2024',
      balance: '₹50,000',
      isVerified: false,
    },
  },
  {
    id: '4',
    name: 'Income Certificate',
    category: 'Financial',
    date: '2024-02-28',
    size: '1.5 MB',
    type: 'PDF',
    emoji: '📄',
    details: {
      certificateNumber: 'INC/2024/123',
      name: 'John Doe',
      annualIncome: '₹6,00,000',
      issueDate: '2024-02-28',
      issuingAuthority: 'District Revenue Office',
      isVerified: true,
      verificationDate: '2024-03-01',
    },
  },
];

export default function DocumentsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Filter documents based on search and category
  const filteredDocuments = sampleDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDocumentPress = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedFile(result);
        setShowCategoryModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleCategorySelect = (category: DocumentCategory) => {
    // Here you would typically save the document with the selected category
    Alert.alert('Success', `Document uploaded to ${category.name} category`);
    setShowCategoryModal(false);
    setShowUploadModal(false);
    setSelectedFile(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <MaterialCommunityIcons name="file-document" size={24} color={theme.primary} />
            <Text style={[styles.title, { color: theme.text }]}>Documents</Text>
          </View>
          <Text style={[styles.subtitle, { color: theme.lightText }]}>
            Manage your important documents
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconButton}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <MaterialCommunityIcons name="cog-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchOuterContainer}>
        <View style={[styles.searchContainer, { backgroundColor: theme.lightBg }]}>
          <Ionicons name="search" size={20} color={theme.lightText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search documents..."
            placeholderTextColor={theme.lightText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.lightText} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === 'all' && { backgroundColor: theme.primary },
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'all' && { color: 'white' },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {documentCategories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: category.color },
                  selectedCategory === category.name && { borderColor: theme.primary, borderWidth: 2 },
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[styles.categoryChipText, { color: theme.text }]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.quickActionsGradient}
          >
            <TouchableOpacity style={styles.quickAction} onPress={() => setShowUploadModal(true)}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="cloud-upload" size={24} color={theme.primary} />
              </View>
              <Text style={styles.quickActionText}>Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="scan" size={24} color={theme.primary} />
              </View>
              <Text style={styles.quickActionText}>Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="folder" size={24} color={theme.primary} />
              </View>
              <Text style={styles.quickActionText}>New Folder</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Documents List */}
        <View style={styles.documentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Documents</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {filteredDocuments.map(doc => (
            <TouchableOpacity
              key={doc.id}
              style={[styles.documentCard, { backgroundColor: theme.cardBg }]}
              onPress={() => handleDocumentPress(doc)}
            >
              <View style={[styles.documentIcon, { backgroundColor: documentCategories.find(c => c.name === doc.category)?.color || '#F5F5F5' }]}>
                <Text style={styles.documentEmoji}>{doc.emoji}</Text>
              </View>
              <View style={styles.documentInfo}>
                <Text style={[styles.documentName, { color: theme.text }]}>{doc.name}</Text>
                <Text style={[styles.documentMeta, { color: theme.lightText }]}>
                  {doc.type} • {doc.size} • {doc.date}
                </Text>
              </View>
              <TouchableOpacity style={styles.documentAction}>
                <Ionicons name="ellipsis-vertical" size={20} color={theme.lightText} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {filteredDocuments.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateEmoji, { color: theme.lightText }]}>📂</Text>
              <Text style={[styles.emptyStateText, { color: theme.text }]}>
                No documents found
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.lightText }]}>
                Try adjusting your search or category filter
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Document Details Modal */}
      <Modal
        visible={selectedDocument !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedDocument(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Document Details</Text>
              <TouchableOpacity onPress={() => setSelectedDocument(null)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            {selectedDocument && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.documentHeader}>
                  <View style={[styles.documentIcon, { backgroundColor: documentCategories.find(c => c.name === selectedDocument.category)?.color || '#F5F5F5' }]}>
                    <Text style={styles.documentEmoji}>{selectedDocument.emoji}</Text>
                  </View>
                  <View style={styles.documentHeaderInfo}>
                    <Text style={[styles.documentHeaderName, { color: theme.text }]}>{selectedDocument.name}</Text>
                    <Text style={[styles.documentHeaderMeta, { color: theme.lightText }]}>
                      {selectedDocument.type} • {selectedDocument.size}
                    </Text>
                  </View>
                </View>
                <View style={styles.documentDetails}>
                  {Object.entries(selectedDocument.details).map(([key, value]) => (
                    <View key={key} style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.lightText }]}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>{value.toString()}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Upload Document</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.uploadOptions}>
              <TouchableOpacity style={styles.uploadOption} onPress={handleUpload}>
                <View style={[styles.uploadIcon, { backgroundColor: theme.lightBg }]}>
                  <Ionicons name="cloud-upload" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.uploadOptionText, { color: theme.text }]}>Upload from Device</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadOption}>
                <View style={[styles.uploadIcon, { backgroundColor: theme.lightBg }]}>
                  <Ionicons name="scan" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.uploadOptionText, { color: theme.text }]}>Scan Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.categoryList}>
              {documentCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryOption, { backgroundColor: category.color }]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <View style={styles.categoryOptionInfo}>
                    <Text style={[styles.categoryOptionName, { color: theme.text }]}>{category.name}</Text>
                    <Text style={[styles.categoryOptionDescription, { color: theme.lightText }]}>
                      {category.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setShowUploadModal(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchOuterContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionsGradient: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  documentsSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  documentIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  documentEmoji: {
    fontSize: 24,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
  },
  documentAction: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  documentHeaderInfo: {
    flex: 1,
  },
  documentHeaderName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentHeaderMeta: {
    fontSize: 14,
  },
  documentDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  uploadOptions: {
    padding: 20,
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#F5F5F5',
  },
  uploadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  uploadOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryList: {
    padding: 20,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  categoryOptionInfo: {
    flex: 1,
    marginLeft: 15,
  },
  categoryOptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryOptionDescription: {
    fontSize: 12,
  },
}); 