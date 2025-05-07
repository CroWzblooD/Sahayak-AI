import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet, ActivityIndicator, Alert, Platform, Modal, SafeAreaView, Share, Linking, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { THEME_COLORS } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enhanced Document interface
interface Document {
  id: string;
  type: 'identity' | 'address' | 'income' | 'other';
  name: string;
  status: 'verified' | 'pending' | 'rejected' | 'not_uploaded';
  lastUpdated: string;
  expiryDate?: string;
  verificationId?: string;
  fileUri?: string;
  issuedBy?: string;
  thumbnail?: string;
  mimeType?: string;
  size?: number;
  extractedData?: {
    documentNumber?: string;
    name?: string;
    dateOfBirth?: string;
    address?: string;
    [key: string]: string | undefined;
  };
  confidence?: number;
}

// Basic document validation patterns
const DOCUMENT_PATTERNS = {
  identity: {
    aadhaar: /[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}/, // Aadhaar number pattern
    pan: /[A-Z]{5}[0-9]{4}[A-Z]{1}/, // PAN card pattern
    voter: /[A-Z]{3}[0-9]{7}/ // Voter ID pattern
  },
  address: {
    pincode: /[1-9]{1}[0-9]{5}/, // Indian pincode
    phone: /(\+91[\-\s]?)?[0]?(91)?[789]\d{9}/ // Indian phone number
  }
};

const DOCUMENT_TYPES = [
  {
    id: 'identity',
    title: 'Identity Proof',
    icon: 'card-account-details',
    required: ['Aadhaar Card', 'PAN Card', 'Voter ID'],
  },
  {
    id: 'address',
    title: 'Address Proof',
    icon: 'home',
    required: ['Utility Bill', 'Rent Agreement', 'Passport'],
  },
  {
    id: 'income',
    title: 'Income Proof',
    icon: 'currency-inr',
    required: ['Salary Slip', 'ITR', 'Form 16'],
  },
  {
    id: 'other',
    title: 'Other Documents',
    icon: 'file-document',
    required: ['Caste Certificate', 'Disability Certificate'],
  },
];

const DOCUMENT_CATEGORIES = [
  {
    id: 'identity',
    title: 'Identity',
    icon: 'card-account-details',
    documents: [
      { type: 'aadhaar', name: 'Aadhaar Card', icon: 'id-card' },
      { type: 'pan', name: 'PAN Card', icon: 'id-card' },
      { type: 'voter', name: 'Voter ID', icon: 'id-card' },
    ]
  },
  {
    id: 'address',
    title: 'Address',
    icon: 'home',
    documents: [
      { type: 'electricity', name: 'Electricity Bill', icon: 'file-document' },
      { type: 'rent', name: 'Rent Agreement', icon: 'file-document' },
      { type: 'passport', name: 'Passport', icon: 'passport' },
    ]
  },
  // ... other categories
];

interface CategoryType {
  id: string;
  title: string;
  icon: string;
  backgroundColor: string;
  documents: {
    type: string;
    name: string;
    format: string[];
    pattern?: RegExp;
  }[];
}

const CATEGORIES: CategoryType[] = [
  {
    id: 'identity',
    title: 'Identity',
    icon: 'card-account-details',
    backgroundColor: '#E8F5E9',
    documents: [
      {
        type: 'aadhaar',
        name: 'Aadhaar Card',
        format: ['image/jpeg', 'image/png', 'application/pdf'],
        pattern: /^[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}$/
      },
      {
        type: 'pan',
        name: 'PAN Card',
        format: ['image/jpeg', 'image/png', 'application/pdf'],
        pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
      }
    ]
  },
  {
    id: 'address',
    title: 'Address',
    icon: 'home',
    backgroundColor: '#E3F2FD',
    documents: [
      {
        type: 'electricity',
        name: 'Electricity Bill',
        format: ['image/jpeg', 'image/png', 'application/pdf']
      },
      {
        type: 'rent',
        name: 'Rent Agreement',
        format: ['application/pdf']
      }
    ]
  }
];

export const DigiLockerSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('identity');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Load documents from storage on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Save documents to storage whenever they change
  useEffect(() => {
    saveDocuments();
  }, [documents]);

  // Load documents from AsyncStorage
  const loadDocuments = async () => {
    try {
      const savedDocs = await AsyncStorage.getItem('documents');
      if (savedDocs) {
        setDocuments(JSON.parse(savedDocs));
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  // Save documents to AsyncStorage
  const saveDocuments = async () => {
    try {
      await AsyncStorage.setItem('documents', JSON.stringify(documents));
    } catch (error) {
      console.error('Error saving documents:', error);
    }
  };

  const handleUploadPress = () => {
    setShowUploadModal(true);
  };

  const handleDocumentSelect = async (docType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: CATEGORIES
          .find(cat => cat.id === selectedCategory)
          ?.documents.find(doc => doc.type === docType)?.format || ['*/*']
      });

      if (!result.canceled) {
        setScanning(true);
        // Simulate document verification
        await new Promise(resolve => setTimeout(resolve, 2000));

        const isValid = Math.random() > 0.3; // Simulate validation
        const verificationId = 'VER' + Math.random().toString().slice(2, 8);

        const newDoc: Document = {
          id: Date.now().toString(),
          type: docType as 'identity' | 'address' | 'income' | 'other',
          name: CATEGORIES
            .find(cat => cat.id === selectedCategory)
            ?.documents.find(doc => doc.type === docType)?.name || 'Document',
          status: isValid ? 'verified' : 'rejected',
          lastUpdated: new Date().toISOString(),
          verificationId: isValid ? verificationId : undefined,
          fileUri: result.assets[0].uri
        };

        setDocuments([...documents, newDoc]);
        setShowUploadModal(false);
        
        if (isValid) {
          Alert.alert('Success', 'Document verified successfully!');
        } else {
          Alert.alert('Verification Failed', 'Please upload a valid document.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setScanning(false);
    }
  };

  // Handle document preview
  const handleViewDocument = (doc: Document) => {
    setSelectedDoc(doc);
    setShowPreviewModal(true);
  };

  // Handle document sharing
  const handleShareDocument = async (doc: Document) => {
    try {
      if (doc.fileUri) {
        await Sharing.shareAsync(doc.fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${doc.name}`,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share document');
    }
  };

  // Handle document download
  const handleDownloadDocument = async (doc: Document) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status === 'granted') {
        if (doc.fileUri) {
          const asset = await MediaLibrary.createAssetAsync(doc.fileUri);
          await MediaLibrary.createAlbumAsync('DigiLocker', asset, false);
          Alert.alert('Success', 'Document downloaded successfully');
        }
      } else {
        Alert.alert('Permission Required', 'Please grant permission to save documents');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download document');
      console.error(error);
    }
  };

  // Handle document deletion
  const handleDeleteDocument = (docId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete file from storage if exists
              const doc = documents.find(d => d.id === docId);
              if (doc?.fileUri) {
                await FileSystem.deleteAsync(doc.fileUri, { idempotent: true });
              }
              
              // Remove from state and storage
              setDocuments(prev => prev.filter(d => d.id !== docId));
              Alert.alert('Success', 'Document deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document');
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const renderDocumentCard = (doc: Document) => (
    <View style={styles.documentCard} key={doc.id}>
      <View style={styles.documentHeader}>
        <View style={styles.docIconContainer}>
          <MaterialCommunityIcons 
            name="file-document-outline" 
            size={24} 
            color={THEME_COLORS.primary} 
          />
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docTitle}>{doc.name}</Text>
          <Text style={styles.docDate}>
            Last updated: {new Date(doc.lastUpdated).toLocaleDateString()}
          </Text>
          {doc.verificationId && (
            <Text style={styles.verificationId}>
              ID: {doc.verificationId}
            </Text>
          )}
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: doc.status === 'verified' ? '#00C853' : '#FF5252' }
        ]}>
          <Text style={styles.statusText}>
            {doc.status === 'verified' ? 'Verified' : 'Failed'}
          </Text>
        </View>
      </View>
      
      <View style={styles.docActions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleViewDocument(doc)}
        >
          <MaterialCommunityIcons name="eye" size={20} color={THEME_COLORS.primary} />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleDownloadDocument(doc)}
        >
          <MaterialCommunityIcons name="download" size={20} color={THEME_COLORS.primary} />
          <Text style={styles.actionText}>Download</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleShareDocument(doc)}
        >
          <MaterialCommunityIcons name="share-variant" size={20} color={THEME_COLORS.primary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDeleteDocument(doc.id)}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#FF5252" />
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Document Preview Modal */}
      <Modal
        visible={showPreviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <BlurView intensity={100} style={styles.modalContainer}>
          <SafeAreaView style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>
                {selectedDoc?.name}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowPreviewModal(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.previewContent}>
              {selectedDoc?.fileUri && (
                <Image
                  source={{ uri: selectedDoc.fileUri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              )}
              
              <View style={styles.previewInfo}>
                <Text style={styles.previewInfoTitle}>Document Details</Text>
                <View style={styles.previewInfoRow}>
                  <Text style={styles.previewLabel}>Status:</Text>
                  <Text style={[
                    styles.previewValue,
                    { color: selectedDoc?.status === 'verified' ? '#00C853' : '#FF5252' }
                  ]}>
                    {selectedDoc?.status === 'verified' ? 'Verified' : 'Failed'}
                  </Text>
                </View>
                {selectedDoc?.verificationId && (
                  <View style={styles.previewInfoRow}>
                    <Text style={styles.previewLabel}>Verification ID:</Text>
                    <Text style={styles.previewValue}>{selectedDoc.verificationId}</Text>
                  </View>
                )}
                <View style={styles.previewInfoRow}>
                  <Text style={styles.previewLabel}>Last Updated:</Text>
                  <Text style={styles.previewValue}>
                    {selectedDoc?.lastUpdated ? new Date(selectedDoc.lastUpdated).toLocaleDateString() : '-'}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </BlurView>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* DigiLocker Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerIcon}>
              <MaterialCommunityIcons 
                name="shield-lock" 
                size={32} 
                color="#2E7D32" 
              />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Sahayak Integration</Text>
              <Text style={styles.bannerText}>
                Securely store and manage your important documents
              </Text>
            </View>
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.categoryContainer}>
          {CATEGORIES.map(category => (
            <Pressable
              key={category.id}
              style={[
                styles.categoryBtn,
                selectedCategory === category.id && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <MaterialCommunityIcons 
                name={category.icon as any}
                size={24}
                color={selectedCategory === category.id ? '#00BFA5' : '#666'}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}>
                {category.title}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Documents List */}
        <View style={styles.documentsList}>
          {documents
            .filter(doc => CATEGORIES
              .find(cat => cat.id === selectedCategory)
              ?.documents.some(d => d.type === doc.type))
            .map(renderDocumentCard)}
          
          <Pressable 
            style={styles.addButton}
            onPress={handleUploadPress}
          >
            <MaterialCommunityIcons 
              name="plus-circle" 
              size={32} 
              color="#00BFA5" 
            />
            <Text style={styles.addButtonText}>Add New Document</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Upload Modal - Fixed */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Document Type</Text>
              <Pressable 
                onPress={() => setShowUploadModal(false)}
                style={styles.closeBtn}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </Pressable>
            </View>

            <ScrollView style={styles.documentTypesList}>
              {CATEGORIES
                .find(cat => cat.id === selectedCategory)
                ?.documents.map(doc => (
                  <Pressable
                    key={doc.type}
                    style={styles.documentTypeBtn}
                    onPress={() => handleDocumentSelect(doc.type)}
                  >
                    <View style={styles.docTypeBtnContent}>
                      <MaterialCommunityIcons 
                        name="file-document-outline" 
                        size={24} 
                        color="#00BFA5" 
                      />
                      <Text style={styles.documentTypeName}>{doc.name}</Text>
                    </View>
                    <MaterialCommunityIcons 
                      name="chevron-right" 
                      size={24} 
                      color="#666" 
                    />
                  </Pressable>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Scanning Overlay */}
      {scanning && (
        <View style={styles.scanningOverlay}>
          <ActivityIndicator size="large" color="#00BFA5" />
          <Text style={styles.scanningText}>Verifying document...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  banner: {
    margin: 16,
    padding: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 14,
    color: '#1B5E20',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  selectedCategory: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#00BFA5',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#00BFA5',
    fontWeight: '500',
  },
  documentsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00BFA520',
    borderStyle: 'dashed',
  },
  addButtonText: {
    marginTop: 8,
    fontSize: 16,
    color: '#00BFA5',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  closeBtn: {
    padding: 4,
  },
  documentTypesList: {
    padding: 16,
  },
  documentTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  docTypeBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentTypeName: {
    fontSize: 16,
    color: '#212529',
    marginLeft: 12,
    flex: 1,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  docIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
    marginLeft: 12,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  docDate: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#00C853',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  verificationId: {
    fontSize: 12,
    color: '#00C853',
    marginBottom: 12,
  },
  docActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 8,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    minWidth: '22%',
    justifyContent: 'center',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 12,
    color: THEME_COLORS.primary,
    fontWeight: '500',
  },
  deleteBtn: {
    backgroundColor: '#FFE5E5',
  },
  deleteText: {
    color: '#FF5252',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  previewContent: {
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#F5F5F5',
  },
  previewInfo: {
    padding: 16,
  },
  previewInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  previewInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
});

export default DigiLockerSection; 