import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet, TextInput, SafeAreaView, Modal, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { THEME_COLORS } from '@/constants/Colors';
import { Card } from 'tamagui';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

// Document type definition
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
}

// Add document validation types and interfaces
interface ValidationResult {
  isValid: boolean;
  confidenceScore: number;
  documentType: string;
  extractedData: Record<string, any>;
  errors?: string[];
}

interface DocumentValidationService {
  validateDocument: (file: File, type: string) => Promise<ValidationResult>;
}

// Add validation service
class DocumentValidationService {
  // Use your computer's local IP address (not localhost)
  private readonly API_URL = 'http://192.168.X.X:3000/api/validate-document'; // Replace X.X with your IP

  async validateDocument(file: any, type: string): Promise<ValidationResult> {
    try {
      console.log('Validating document:', { file, type });
      
      // Create form data with the correct structure
      const formData = new FormData();
      const fileAsset = file.assets[0];
      
      // Add file to form data with correct structure for RN
      formData.append('file', {
        uri: fileAsset.uri,
        type: fileAsset.mimeType,
        name: fileAsset.name,
      } as any);
      
      formData.append('documentType', type);

      console.log('Sending request to:', this.API_URL);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Validation response:', data);
      return data;
    } catch (error) {
      console.error('Validation error:', error);
      throw error;
    }
  }
}

// Create document validation service instance
const documentValidationService = new DocumentValidationService();

// Add these components before the DocumentsScreen component
const UploadDocumentModal = ({ 
  onClose, 
  onUpload 
}: { 
  onClose: () => void;
  onUpload: (document: Document) => Promise<void>;
}) => {
  const [file, setFile] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [selectedType, setSelectedType] = useState<Document['type']>('identity');
  const [loading, setLoading] = useState(false);

  const handleSelectDocument = async (type: Document['type']) => {
    try {
      setLoading(true);
      console.log('Selecting document for type:', type);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      console.log('Document picker result:', result);

      if (!result.canceled) {
        setFile(result);
        setSelectedType(type);
        await validateDocument(result, type);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert(
        'Error',
        'Failed to select document. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const validateDocument = async (selectedFile: any, type: Document['type']) => {
    setValidating(true);
    try {
      const validationData = await documentValidationService.validateDocument(selectedFile, type);
      setValidationResult(validationData);

      if (validationData.isValid) {
        const newDocument: Document = {
          id: Date.now().toString(),
          type: selectedType,
          name: selectedFile.assets[0].name,
          status: 'pending',
          lastUpdated: new Date().toISOString().split('T')[0],
          fileUri: selectedFile.assets[0].uri,
          verificationId: validationData.documentId
        };

        await onUpload(newDocument);
        Alert.alert('Success', 'Document uploaded successfully');
        onClose();
      } else {
        Alert.alert('Validation Failed', validationData.errors?.[0] || 'Please try again');
      }
    } catch (error) {
      console.error('Validation failed:', error);
      Alert.alert(
        'Error',
        'Failed to validate document. Please check your connection and try again.'
      );
    } finally {
      setValidating(false);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Upload Document</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </Pressable>
        </View>

        {(loading || validating) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={THEME_COLORS.primary} />
            <Text style={styles.loadingText}>
              {validating ? 'Validating document...' : 'Processing...'}
            </Text>
          </View>
        )}

        <View style={styles.uploadOptions}>
          {['identity', 'address', 'income', 'other'].map((type) => (
            <Pressable
              key={type}
              style={[
                styles.uploadOption,
                loading && styles.uploadOptionDisabled
              ]}
              onPress={() => !loading && handleSelectDocument(type as Document['type'])}
            >
              <View style={styles.uploadOptionIcon}>
                <FontAwesome5 
                  name={getDocumentIcon(type as Document['type'])} 
                  size={24} 
                  color={loading ? '#999' : THEME_COLORS.primary} 
                />
              </View>
              <Text style={styles.uploadOptionText}>
                {type.charAt(0).toUpperCase() + type.slice(1)} Document
              </Text>
            </Pressable>
          ))}
        </View>

        {file && <SmartDocumentPreview file={file} validationResult={validationResult} />}
      </View>
    </View>
  );
};

const ViewDocumentModal = ({ 
  document, 
  onClose 
}: { 
  document: Document | null;
  onClose: () => void;
}) => {
  if (!document) return null;

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{document.name}</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </Pressable>
        </View>

        <View style={styles.documentPreview}>
          {document.fileUri ? (
            <Image 
              source={{ uri: document.fileUri }}
              style={styles.documentImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noPreview}>
              <FontAwesome5 name="file-alt" size={48} color="#666" />
              <Text style={styles.noPreviewText}>No preview available</Text>
            </View>
          )}
        </View>

        <View style={styles.documentDetails}>
          <Text style={styles.detailLabel}>Status</Text>
          <StatusBadge status={document.status} />
          
          <Text style={styles.detailLabel}>Last Updated</Text>
          <Text style={styles.detailText}>{document.lastUpdated}</Text>

          {document.verificationId && (
            <>
              <Text style={styles.detailLabel}>Verification ID</Text>
              <Text style={styles.detailText}>{document.verificationId}</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

// Add smart document preview component
const SmartDocumentPreview = ({ 
  file, 
  validationResult 
}: { 
  file: any;
  validationResult: ValidationResult | null;
}) => {
  if (!file) return null;

  return (
    <View style={styles.documentPreview}>
      {file.uri ? (
        <>
          <Image 
            source={{ uri: file.uri }} 
            style={styles.documentImage} 
            resizeMode="contain"
          />
          {validationResult && (
            <View style={styles.validationOverlay}>
              {validationResult.isValid ? (
                <>
                  <Text style={styles.confidenceScore}>
                    Confidence: {(validationResult.confidenceScore * 100).toFixed(1)}%
                  </Text>
                  <View style={styles.extractedData}>
                    {Object.entries(validationResult.extractedData).map(([key, value]) => (
                      <Text key={key}>{key}: {value}</Text>
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.errors}>
                  {validationResult.errors?.map((error, index) => (
                    <Text key={index} style={styles.error}>{error}</Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </>
      ) : (
        <View style={styles.noPreview}>
          <FontAwesome5 name="file-alt" size={48} color="#666" />
          <Text style={styles.noPreviewText}>No preview available</Text>
        </View>
      )}
    </View>
  );
};

// Add document type detection
const DOCUMENT_PATTERNS = {
  identity: {
    aadhar: [/\d{4}[\s-]?\d{4}[\s-]?\d{4}/, /(unique identification|आधार)/i],
    pan: [/[A-Z]{5}[0-9]{4}[A-Z]/, /(permanent account|पैन कार्ड)/i],
    voter: [/ELECTION/, /VOTER/]
  },
  address: {
    ration: [/RATION/, /PUBLIC DISTRIBUTION/],
    utility: [/ELECTRICITY/, /WATER/, /GAS/]
  }
};

const detectDocumentType = async (file: File): Promise<string> => {
  // Implementation for document type detection
};

export default function DocumentsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Sample documents data
  const documentsData: Document[] = [
    {
      id: '1',
      type: 'identity',
      name: 'Aadhaar Card',
      status: 'verified',
      lastUpdated: '2024-02-15',
      verificationId: 'VER123456'
    },
    {
      id: '2',
      type: 'identity',
      name: 'PAN Card',
      status: 'verified',
      lastUpdated: '2024-01-20',
      verificationId: 'VER789012'
    },
    {
      id: '3',
      type: 'address',
      name: 'Electricity Bill',
      status: 'pending',
      lastUpdated: '2024-02-28'
    },
    // Add more sample documents
  ];

  // Filter documents based on search and category
  const filteredDocuments = documentsData.filter(doc => 
    (selectedCategory === 'all' || doc.type === selectedCategory) &&
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDocumentUpload = async (newDocument: Document) => {
    try {
      // Here you would typically send the document to your backend
      // For now, we'll just add it to the local state
      setDocuments(prev => [...prev, newDocument]);
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  // Categories with icons
  const categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'identity', label: 'Identity', icon: 'id-card' },
    { id: 'address', label: 'Address', icon: 'home' },
    { id: 'income', label: 'Income', icon: 'money-bill' }
  ];

  const renderDocumentCard = (document: Document) => (
    <Card key={document.id} style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <View style={styles.documentIcon}>
          <FontAwesome5 
            name={getDocumentIcon(document.type)} 
            size={24} 
            color={THEME_COLORS.primary} 
          />
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentName}>{document.name}</Text>
          <Text style={styles.documentDate}>
            Last updated: {document.lastUpdated}
          </Text>
        </View>
        <StatusBadge status={document.status} />
      </View>
      
      <View style={styles.documentActions}>
        <ActionButton 
          icon="eye" 
          label="View"
          onPress={() => {
            setSelectedDocument(document);
            setViewModalVisible(true);
          }}
        />
        <ActionButton 
          icon="history" 
          label="History"
          onPress={() => console.log('View history')}
        />
        <ActionButton 
          icon="share-alt" 
          label="Share"
          onPress={() => console.log('Share document')}
        />
      </View>

      {document.status === 'verified' && (
        <View style={styles.verificationInfo}>
          <MaterialIcons name="verified" size={20} color={THEME_COLORS.success} />
          <Text style={styles.verificationText}>
            Verified • ID: {document.verificationId}
          </Text>
        </View>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Documents</Text>
          <Pressable 
            style={styles.uploadButton}
            onPress={() => setUploadModalVisible(true)}
          >
            <FontAwesome5 name="plus" size={16} color="#FFF" />
            <Text style={styles.uploadButtonText}>Upload New</Text>
          </Pressable>
        </View>

        {/* Search and Categories */}
        <View style={styles.searchAndCategories}>
          <View style={styles.searchContainer}>
            <FontAwesome5 name="search" size={16} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search documents..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map(category => (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <FontAwesome5 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === category.id ? '#FFF' : '#666'} 
                />
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive
                ]}>
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Documents List */}
        <ScrollView style={styles.documentsList}>
          {filteredDocuments.map(renderDocumentCard)}
        </ScrollView>

        {/* Upload Modal */}
        <Modal
          visible={uploadModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setUploadModalVisible(false)}
        >
          <UploadDocumentModal 
            onClose={() => setUploadModalVisible(false)}
            onUpload={handleDocumentUpload}
          />
        </Modal>

        {/* View Document Modal */}
        <Modal
          visible={viewModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setViewModalVisible(false)}
        >
          <ViewDocumentModal 
            document={selectedDocument}
            onClose={() => setViewModalVisible(false)}
          />
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// Helper Components
const StatusBadge = ({ status }: { status: Document['status'] }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'verified': return THEME_COLORS.success;
      case 'pending': return THEME_COLORS.warning;
      case 'rejected': return THEME_COLORS.error;
      default: return '#666';
    }
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.statusText}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};

const ActionButton = ({ 
  icon, 
  label, 
  onPress 
}: { 
  icon: string; 
  label: string; 
  onPress: () => void;
}) => (
  <Pressable style={styles.actionButton} onPress={onPress}>
    <FontAwesome5 name={icon} size={16} color={THEME_COLORS.primary} />
    <Text style={styles.actionButtonText}>{label}</Text>
  </Pressable>
);

// Helper function for document icons
const getDocumentIcon = (type: Document['type']): string => {
  switch (type) {
    case 'identity':
      return 'id-card';
    case 'address':
      return 'home';
    case 'income':
      return 'money-bill';
    default:
      return 'file-alt';
  }
};

// Updated styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchAndCategories: {
    backgroundColor: '#FFF',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EEE',
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  categoryButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  documentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  documentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  documentDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: THEME_COLORS.primary,
    fontWeight: '500',
  },
  verificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    gap: 8,
  },
  verificationText: {
    color: '#666',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  uploadOptions: {
    gap: 12,
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  uploadOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  uploadOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  documentPreview: {
    aspectRatio: 3/4,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  noPreview: {
    alignItems: 'center',
    gap: 8,
  },
  noPreviewText: {
    color: '#666',
    fontSize: 16,
  },
  documentDetails: {
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
  },
  validationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confidenceScore: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  extractedData: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  errors: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  error: {
    color: THEME_COLORS.error,
    fontSize: 14,
    marginBottom: 8,
  },
  validatingContainer: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  validatingText: {
    fontSize: 16,
    color: '#666',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: THEME_COLORS.primary,
    fontWeight: '600',
  },
  uploadOptionDisabled: {
    opacity: 0.5,
  },
}); 