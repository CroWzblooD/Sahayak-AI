import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet, TextInput, SafeAreaView, Modal, Platform, StatusBar, ActivityIndicator, Alert, Dimensions, FlatList, Linking } from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME_COLORS } from '@/constants/Colors';
import { Card } from 'tamagui';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DigiLockerSection from '@/components/DigiLockerSection';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 24;

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

interface SchemeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  views: string;
  publishedAt: string;
  videoUrl: string;
}

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

const YOUTUBE_API_KEY = 'AIzaSyBE0SIN-Vm73ntz-_i36EvAo0AmDVTNno8';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

export default function DocumentsScreen() {
  const [activeSection, setActiveSection] = useState<'documents' | 'videos'>('documents');
  const [activeVideoTab, setActiveVideoTab] = useState<'shorts' | 'videos'>('shorts');
  const [activeNewsTab, setActiveNewsTab] = useState<'news' | 'videos'>('news');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<SchemeVideo[]>([]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsPage, setNewsPage] = useState(1);
  const [loadingNews, setLoadingNews] = useState(false);

  const languages = [
    { id: 'all', label: 'All' },
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'Hindi' },
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'central', label: 'Central Schemes' },
    { id: 'state', label: 'State Schemes' },
    { id: 'education', label: 'Education' },
    { id: 'health', label: 'Health' },
    { id: 'agriculture', label: 'Agriculture' },
  ];

  useEffect(() => {
    if (activeSection === 'videos') {
      if (activeNewsTab === 'news') {
        fetchNews();
      } else {
        fetchVideos();
      }
    }
  }, [activeSection, activeNewsTab, selectedLanguage]);

  const fetchVideos = async (nextPage?: boolean) => {
    try {
      if (!nextPage) setLoading(true);
      
      const searchQuery = encodeURIComponent(
        `${searchText || 'government schemes india'} ${selectedCategory !== 'all' ? selectedCategory : ''} ${activeVideoTab === 'shorts' ? 'shorts' : ''}`
      );
      
      const apiUrl = `https://youtube.googleapis.com/youtube/v3/search?` +
        `part=snippet` +
        `&maxResults=20` +
        `&q=${searchQuery}` +
        `&type=video` +
        `&key=${YOUTUBE_API_KEY}` +
        (selectedLanguage !== 'all' ? `&relevanceLanguage=${selectedLanguage}` : '') +
        (nextPage && pageToken ? `&pageToken=${pageToken}` : '');

      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!data.items) {
        throw new Error('No videos found');
      }

      setPageToken(data.nextPageToken || null);

      const transformedVideos = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));

      setVideos(prevVideos => 
        nextPage ? [...prevVideos, ...transformedVideos] : transformedVideos
      );
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async (nextPage?: boolean) => {
    try {
      if (!nextPage) setLoadingNews(true);
      
      // Basic scheme-related keywords
      const baseQuery = selectedCategory !== 'all' 
        ? `${selectedCategory} scheme india`
        : 'government scheme india OR yojana OR pradhan mantri';
      
      const searchQuery = encodeURIComponent(
        `${searchText || baseQuery}`
      );
      
      const apiUrl = `https://newsapi.org/v2/everything?` +
        `q=${searchQuery}` +
        `&apiKey=ed089d581b824a308c52fb11df9cb311` +
        `&pageSize=20` +
        `&page=${nextPage ? newsPage + 1 : 1}` +
        `&language=${selectedLanguage !== 'all' ? selectedLanguage : 'en'}` +
        `&sortBy=publishedAt` +
        `&domains=indiatoday.in,indianexpress.com,timesofindia.indiatimes.com,livemint.com,businesstoday.in,ndtv.com,hindustantimes.com`;

      console.log('Fetching news with URL:', apiUrl);

      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`API Error: ${data.message || 'Failed to fetch news'}`);
      }

      if (!data.articles || data.articles.length === 0) {
        // If no articles found with strict filtering, try with broader search
        const broadSearchUrl = `https://newsapi.org/v2/everything?` +
          `q=india government scheme OR policy` +
          `&apiKey=ed089d581b824a308c52fb11df9cb311` +
          `&pageSize=20` +
          `&page=${nextPage ? newsPage + 1 : 1}` +
          `&language=en` +
          `&sortBy=publishedAt`;

        const broadResponse = await fetch(broadSearchUrl);
        const broadData = await broadResponse.json();
        
        if (!broadData.articles) {
          throw new Error('No news found');
        }

        if (nextPage) {
          setNewsPage(newsPage + 1);
          setNewsArticles(prev => [...prev, ...broadData.articles]);
        } else {
          setNewsPage(1);
          setNewsArticles(broadData.articles);
        }
        
        return;
      }

      // Light filtering to ensure relevance
      const filteredArticles = data.articles.filter(article => {
        const content = (article.title + ' ' + (article.description || '')).toLowerCase();
        return content.includes('scheme') || 
               content.includes('yojana') || 
               content.includes('policy') ||
               content.includes('government') ||
               content.includes('ministry');
      });

      if (nextPage) {
        setNewsPage(newsPage + 1);
        setNewsArticles(prev => [...prev, ...filteredArticles]);
      } else {
        setNewsPage(1);
        setNewsArticles(filteredArticles);
      }

    } catch (error) {
      console.error('Error fetching news:', error);
      // On error, try with broader search terms
      try {
        const fallbackUrl = `https://newsapi.org/v2/top-headlines?` +
          `country=in` +
          `&category=business` +
          `&apiKey=ed089d581b824a308c52fb11df9cb311` +
          `&pageSize=20` +
          `&page=${nextPage ? newsPage + 1 : 1}`;

        const fallbackResponse = await fetch(fallbackUrl);
        const fallbackData = await fallbackResponse.json();

        if (fallbackData.articles && fallbackData.articles.length > 0) {
          if (nextPage) {
            setNewsPage(newsPage + 1);
            setNewsArticles(prev => [...prev, ...fallbackData.articles]);
          } else {
            setNewsPage(1);
            setNewsArticles(fallbackData.articles);
          }
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setLoadingNews(false);
    }
  };

  const handleDocumentUpload = async (docType: string) => {
    try {
      setUploadingDoc(docType);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        const newDoc: Document = {
          id: Date.now().toString(),
          type: docType as Document['type'],
          name: result.assets[0].name,
          status: 'pending',
          lastUpdated: new Date().toISOString(),
        };

        setDocuments([...documents, newDoc]);
        // Here you would typically upload to your backend
        // await uploadToServer(result.assets[0], docType);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setUploadingDoc(null);
      setShowUploadModal(false);
    }
  };

  const renderVideoCard = ({ item }: { item: SchemeVideo }) => (
    <Pressable 
      style={styles.videoCard}
      onPress={() => Linking.openURL(item.videoUrl)}
    >
      <Image 
        source={{ uri: item.thumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.videoOverlay}
      >
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.videoInfo}>
          <Text style={styles.channelTitle}>{item.channelTitle}</Text>
          <Text style={styles.publishDate}>{item.publishedAt}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );

  const renderVideoSection = () => (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.videoSectionContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <LinearGradient
            colors={['#ffffff', '#f8f8f8']}
            style={styles.searchBar}
          >
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search schemes..."
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => activeNewsTab === 'news' ? fetchNews() : fetchVideos()}
            />
          </LinearGradient>
        </View>

        {/* Toggle Tabs */}
        <View style={styles.filtersContainer}>
          <View style={styles.toggleContainer}>
            <Pressable
              style={[styles.toggleButton, activeNewsTab === 'news' && styles.activeToggle]}
              onPress={() => setActiveNewsTab('news')}
            >
              <MaterialCommunityIcons 
                name="newspaper-variant" 
                size={20} 
                color={activeNewsTab === 'news' ? '#fff' : '#666'} 
              />
              <Text style={[styles.toggleText, activeNewsTab === 'news' && styles.activeToggleText]}>
                News
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleButton, activeNewsTab === 'videos' && styles.activeToggle]}
              onPress={() => setActiveNewsTab('videos')}
            >
              <MaterialCommunityIcons 
                name="youtube" 
                size={20} 
                color={activeNewsTab === 'videos' ? '#fff' : '#666'} 
              />
              <Text style={[styles.toggleText, activeNewsTab === 'videos' && styles.activeToggleText]}>
                Videos
              </Text>
            </Pressable>
          </View>

          {/* Categories */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            data={categories}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.categoryChip, selectedCategory === item.id && styles.activeCategoryChip]}
                onPress={() => {
                  setSelectedCategory(item.id);
                  activeNewsTab === 'news' ? fetchNews() : fetchVideos();
                }}
              >
                <Text style={[styles.categoryText, selectedCategory === item.id && styles.activeCategoryText]}>
                  {item.label}
                </Text>
              </Pressable>
            )}
            keyExtractor={item => item.id}
          />
        </View>

        {/* News/Videos Grid */}
        {activeNewsTab === 'news' ? (
          <FlatList
            data={newsArticles}
            renderItem={({ item, index }) => (
              <Pressable 
                style={[
                  styles.newsCard,
                  index % 2 === 0 && { marginRight: 8 }
                ]}
                onPress={() => Linking.openURL(item.url)}
              >
                <Image 
                  source={{ uri: item.urlToImage || 'https://via.placeholder.com/300' }}
                  style={styles.newsThumbnail}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.newsOverlay}
                >
                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.newsInfo}>
                    <Text style={styles.sourceText}>{item.source.name}</Text>
                    <Text style={styles.dateText}>
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </LinearGradient>
              </Pressable>
            )}
            numColumns={2}
            columnWrapperStyle={styles.newsGrid}
            contentContainerStyle={styles.newsList}
            onEndReached={() => !loadingNews && fetchNews(true)}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => 
              loadingNews && <ActivityIndicator size="large" color={THEME_COLORS.primary} />
            }
          />
        ) : (
          // Existing video grid
          <FlatList
            data={videos}
            renderItem={renderVideoCard}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.videoGrid}
            contentContainerStyle={styles.videoList}
            onEndReached={() => pageToken && fetchVideos(true)}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => 
              loading && <ActivityIndicator size="large" color={THEME_COLORS.primary} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.sectionTabs}>
            <Pressable
              style={[styles.sectionTab, activeSection === 'documents' && styles.activeSection]}
              onPress={() => setActiveSection('documents')}
            >
              <MaterialCommunityIcons 
                name="folder-multiple" 
                size={24} 
                color={activeSection === 'documents' ? THEME_COLORS.primary : '#666'} 
              />
              <Text style={[styles.sectionText, activeSection === 'documents' && styles.activeSectionText]}>
                DigiLocker
              </Text>
            </Pressable>
            <Pressable
              style={[styles.sectionTab, activeSection === 'videos' && styles.activeSection]}
              onPress={() => setActiveSection('videos')}
            >
              <MaterialCommunityIcons 
                name="play-box-multiple" 
                size={24} 
                color={activeSection === 'videos' ? THEME_COLORS.primary : '#666'} 
              />
              <Text style={[styles.sectionText, activeSection === 'videos' && styles.activeSectionText]}>
                Videos
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {activeSection === 'documents' ? (
            <DigiLockerSection />
          ) : (
            renderVideoSection()
          )}
        </View>
      </SafeAreaView>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    </View>
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
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  sectionTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
  },
  sectionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  activeSection: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeSectionText: {
    color: THEME_COLORS.primary,
  },
  documentsContainer: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoCardGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${THEME_COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  documentSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME_COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    fontWeight: '600',
    color: '#333',
  },
  requiredDocs: {
    marginBottom: 20,
  },
  requiredDocsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  requiredDocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  requiredDocText: {
    fontSize: 14,
    color: '#666',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchAndCategories: {
    backgroundColor: '#FFF',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filtersContainer: {
    padding: 16,
    gap: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 12,
    gap: 8,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  activeToggle: {
    backgroundColor: THEME_COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#fff',
  },
  categoriesContainer: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeCategoryChip: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  activeCategoryText: {
    color: '#fff',
  },
  videoGrid: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  videoList: {
    padding: 8,
  },
  videoCard: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.4,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  videoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  channelTitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  publishDate: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: THEME_COLORS.primary,
    fontWeight: '500',
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
  uploadOptionDisabled: {
    opacity: 0.5,
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
  newsCard: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.2,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newsThumbnail: {
    width: '100%',
    height: '100%',
  },
  newsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  newsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  dateText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  newsGrid: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  newsList: {
    padding: 8,
  },
  videoSectionContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: 41,
  },
  filtersContainer: {
    padding: 16,
    gap: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 12,
    gap: 8,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  activeToggle: {
    backgroundColor: THEME_COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#fff',
  },
  categoriesContainer: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeCategoryChip: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  activeCategoryText: {
    color: '#fff',
  },
  videoGrid: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  videoList: {
    padding: 8,
  },
}); 