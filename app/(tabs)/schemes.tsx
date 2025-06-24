import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { categories, SchemeData, useSchemes } from '@/services/schemeService';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Emoji component
const Emoji: React.FC<{ symbol: string; size?: number }> = ({ symbol, size = 24 }) => (
  <Text style={{ fontSize: size }}>{symbol}</Text>
);

// Pagination controls component
const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  theme: any;
}> = ({ currentPage, totalPages, onPageChange, theme }) => {
  return (
    <View style={styles.paginationContainer}>
      <TouchableOpacity 
        style={[
          styles.paginationButton, 
          { backgroundColor: currentPage > 1 ? theme.primary : theme.lightBg },
          { opacity: currentPage > 1 ? 1 : 0.5 }
        ]}
        onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <Text style={[styles.paginationButtonText, { color: 'white' }]}>Previous</Text>
      </TouchableOpacity>
      
      <View style={styles.paginationInfo}>
        <Text style={{ color: theme.text }}>
          Page {currentPage} of {totalPages}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.paginationButton, 
          { backgroundColor: currentPage < totalPages ? theme.primary : theme.lightBg },
          { opacity: currentPage < totalPages ? 1 : 0.5 }
        ]}
        onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <Text style={[styles.paginationButtonText, { color: 'white' }]}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

// Helper functions to trim text
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

const extractTitle = (title: string): string => {
  // Ensure the title isn't too long - we want just a few words like the mockup
  const words = title.split(' ');
  if (words.length <= 5) return title;
  return words.slice(0, 5).join(' ') + '...';
};

// Define Category interface
interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

// Sample scheme data with emoji icons
const schemesData: SchemeData[] = [
  {
    id: '1',
    title: 'PM Kisan Samman Nidhi',
    description: 'Direct income support for farmers',
    longDescription: 'Provides financial assistance of ₹6,000 per year to all land-holding farmer families in the country, paid in installments of ₹2,000 every four months.',
    eligibility: 'All landholder farmer families with cultivable land',
    benefitAmount: '₹6,000 per year',
    deadline: '31st December 2023',
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account Details'],
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    emoji: '🌾',
    color: '#E8F5E9',
    category: 'Agriculture',
    isPopular: true,
    schemeType: 'central',
    state: null
  },
  {
    id: '2',
    title: 'Atal Pension Yojana',
    description: 'Pension scheme for unorganized sector',
    longDescription: 'A government-backed pension scheme focused on workers in unorganized sectors. Subscribers receive a fixed minimum pension after reaching 60 years of age.',
    eligibility: 'Citizens aged 18-40 years',
    benefitAmount: '₹1,000 to ₹5,000 monthly pension',
    deadline: 'Ongoing',
    documents: ['Aadhaar Card', 'Bank Account Details', 'Mobile Number'],
    ministry: 'Ministry of Finance',
    emoji: '👵🏽',
    color: '#FFF3E0',
    category: 'Finance',
    isPopular: true,
    schemeType: 'central',
    state: null
  },
  {
    id: '3',
    title: 'PM Awas Yojana',
    description: 'Housing for all by 2024',
    longDescription: 'Provides financial assistance for construction of pucca houses for eligible rural and urban households. Aims to achieve "Housing for All" by 2024.',
    eligibility: 'EWS and LIG households with annual income below ₹3 lakh',
    benefitAmount: 'Up to ₹2.5 lakh subsidy',
    deadline: '31st March 2024',
    documents: ['Aadhaar Card', 'Income Certificate', 'Land Documents'],
    ministry: 'Ministry of Housing and Urban Affairs',
    emoji: '🏠',
    color: '#E3F2FD',
    category: 'Housing',
    isPopular: true,
    schemeType: 'central',
    state: null
  },
  {
    id: '4',
    title: 'Sukanya Samriddhi Yojana',
    description: 'Savings scheme for girl child',
    longDescription: 'A small savings scheme for girl children that provides income tax benefits and higher interest rates compared to many other investment options.',
    eligibility: 'Parents of girl children under 10 years',
    benefitAmount: '7.6% interest rate (variable)',
    deadline: 'Ongoing',
    documents: ['Girl Child Birth Certificate', 'ID Proof of Parents', 'Address Proof'],
    ministry: 'Ministry of Women and Child Development',
    emoji: '👧',
    color: '#F8BBD0',
    category: 'Women & Child',
    isPopular: false,
    schemeType: 'central',
    state: null
  },
  {
    id: '5',
    title: 'MGNREGA',
    description: 'Guaranteed rural employment',
    longDescription: 'Provides at least 100 days of wage employment in a financial year to every rural household whose adult members volunteer to do unskilled manual work.',
    eligibility: 'Rural households seeking unskilled work',
    benefitAmount: 'State-wise varied daily wages',
    deadline: 'Ongoing',
    documents: ['Job Card', 'Aadhaar Card', 'Bank/Post Office Account'],
    ministry: 'Ministry of Rural Development',
    emoji: '👷',
    color: '#E1BEE7',
    category: 'Employment',
    isPopular: false,
    schemeType: 'central',
    state: null
  },
  {
    id: '6',
    title: 'Ayushman Bharat',
    description: 'Health insurance coverage',
    longDescription: 'Provides health insurance coverage of ₹5 lakh per family per year for secondary and tertiary hospitalization to poor and vulnerable families.',
    eligibility: 'Low-income families as per SECC database',
    benefitAmount: '₹5 lakh coverage per family per year',
    deadline: 'Ongoing',
    documents: ['Aadhaar Card', 'Ration Card', 'Income Certificate'],
    ministry: 'Ministry of Health and Family Welfare',
    emoji: '⚕️',
    color: '#E0F7FA',
    category: 'Healthcare',
    isPopular: true,
    schemeType: 'central',
    state: null
  },
  {
    id: '7',
    title: 'Startup India Scheme',
    description: 'Empowering young entrepreneurs',
    longDescription: 'Aims to build a strong ecosystem for nurturing innovation and startups in the country, driving sustainable economic growth and generating employment opportunities.',
    eligibility: 'Startups less than 10 years old with turnover less than ₹100 crore',
    benefitAmount: 'Tax benefits, easy compliance, funding support',
    deadline: 'Ongoing',
    documents: ['Company Registration Documents', 'Business Plan', 'PAN Card'],
    ministry: 'Ministry of Commerce and Industry',
    emoji: '🚀',
    color: '#FFECB3',
    category: 'Entrepreneurship',
    isPopular: false,
    schemeType: 'central',
    state: null
  },
  {
    id: '8',
    title: 'PM Fasal Bima Yojana',
    description: 'Crop insurance for farmers',
    longDescription: 'Provides financial support to farmers suffering crop loss/damage arising out of unforeseen events like natural calamities, pests & diseases.',
    eligibility: 'All farmers including sharecroppers',
    benefitAmount: 'Varies based on crop and land area',
    deadline: 'Varies by crop season',
    documents: ['Land Records', 'Aadhaar Card', 'Bank Account Details'],
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    emoji: '🌱',
    color: '#DCEDC8',
    category: 'Agriculture',
    isPopular: false,
    schemeType: 'central',
    state: null
  },
];

export default function SchemesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use the hook with pagination (10 items per page)
  const { 
    schemes, 
    loading, 
    error, 
    selectedCategory, 
    setSelectedCategory,
    currentPage,
    setCurrentPage,
    totalPages,
    totalSchemes
  } = useSchemes('all', 10);

  // Popular schemes for the slider
  const [popularSchemes, setPopularSchemes] = useState<SchemeData[]>([]);
  
  // Load popular schemes
  useEffect(() => {
    const loadPopularSchemes = async () => {
      // Take the first 5 popular schemes from the current page
      const popular = schemes.filter((scheme: SchemeData) => scheme.isPopular).slice(0, 4);
      setPopularSchemes(popular);
    };
    
    if (!loading && schemes.length > 0) {
      loadPopularSchemes();
    }
  }, [loading, schemes]);

  // Auto-slide effect for the carousel
  useEffect(() => {
    if (popularSchemes.length === 0) return;
    
    const autoSlideTimer = setInterval(() => {
      if (flatListRef.current && popularSchemes.length > 0) {
        const nextIndex = (currentIndex + 1) % popularSchemes.length;
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true
        });
        setCurrentIndex(nextIndex);
      }
    }, 4000);  // Change slide every 4 seconds

    return () => clearInterval(autoSlideTimer);
  }, [currentIndex, popularSchemes.length]);

  // Handle viewable items change
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  // Filter schemes based on search query
  const filteredSchemes = searchQuery.trim() === '' ? 
    schemes : 
    schemes.filter((scheme: SchemeData) => 
      scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // When search query changes, reset to page 1
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      setCurrentPage(1);
    }
  }, [searchQuery]);
  
  // Pagination dots for scheme slider
  const renderPagination = () => {
    return (
      <View style={styles.carouselPaginationContainer}>
        {popularSchemes.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={i}
              style={[
                styles.carouselDot,
                { 
                  width: dotWidth,
                  opacity, 
                  backgroundColor: i === currentIndex ? theme.primary : '#D0D0D0'
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.heading, { color: theme.text }]}>Schemes Sahayak</Text>
          <Text style={[styles.subheading, { color: theme.icon }]}>Find schemes you're eligible for</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.lightBg }]}>
            <Emoji symbol="🔔" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#F8BBD0' }]}>
            <Emoji symbol="👤" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchOuterContainer}>
        <View style={[styles.searchContainer, { backgroundColor: theme.lightBg }]}>
          <Emoji symbol="🔍" size={20} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search schemes, benefits, eligibility..."
            placeholderTextColor={theme.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Emoji symbol="❌" size={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading schemes...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Emoji symbol="⚠️" size={40} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            // In a real app, you'd implement a retry function here
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        >
          {/* Popular Schemes Slider */}
          {popularSchemes.length > 0 && (
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Popular Schemes
                </Text>
              </View>
              
              <FlatList
                ref={flatListRef}
                data={popularSchemes}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                renderItem={({ item }) => {
                  // Set different colors for different schemes with more vibrant options
                  const cardColors: Record<string, string> = {
                    'Housing': '#26A69A',
                    'Finance': '#FF9800',
                    'Agriculture': '#8BC34A',
                    'Healthcare': '#42A5F5',
                    'Women & Child': '#EC407A',
                    'Employment': '#7E57C2',
                    'Entrepreneurship': '#FF7043',
                    'Education': '#00BCD4',
                    'Pension': '#FF5722',
                    'Welfare': '#009688',
                    'Transportation': '#3F51B5',
                    'Infrastructure': '#607D8B',
                    'Energy': '#FFC107',
                    'Rural Development': '#4CAF50',
                    'Urban Development': '#9C27B0',
                    'Digital': '#00BCD4',
                    'Tourism': '#CDDC39',
                    'Other': '#78909C'
                  };
                  
                  const cardColor = cardColors[item.category as keyof typeof cardColors] || '#5E35B1';
                  
                  return (
                    <View style={styles.slideContainer}>
                      <View 
                        style={[
                          styles.slideContent, 
                          { 
                            backgroundColor: cardColor,
                            borderColor: 'rgba(255,255,255,0.3)',
                            borderWidth: 1 
                          }
                        ]}
                      >
                        <View style={styles.slideTextContent}>
                          <View style={styles.slideTopContent}>
                            <View style={styles.slideTagContainer}>
                              <Text style={styles.slideTag}>{item.category}</Text>
                            </View>
                            <Text style={styles.slideTitle}>{extractTitle(item.title)}</Text>
                            <Text style={styles.slideDescription}>{truncateText(item.description, 60)}</Text>
                          </View>
                          
                          <View style={styles.slideBottomContent}>
                            <View style={styles.schemeHighlightContainer}>
                              <View style={styles.schemeHighlight}>
                                <Emoji symbol="💰" size={16} />
                                <Text style={styles.schemeHighlightText}>{truncateText(item.benefitAmount, 30)}</Text>
                              </View>
                            </View>
                            
                            <TouchableOpacity style={styles.applyButton}>
                              <Text style={[styles.applyButtonText, { color: cardColor }]}>Apply Now</Text>
                              <Emoji symbol="➡️" size={14} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        
                        <View style={styles.slideEmojiContainer}>
                          <View style={styles.emojiCircle}>
                            <Emoji symbol={item.emoji} size={40} />
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                }}
              />  
              {renderPagination()}
            </View>
          )}

          {/* Categories */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Categories
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    { 
                      backgroundColor: selectedCategory === category.id 
                        ? theme.primary 
                        : category.color,
                      borderWidth: selectedCategory === category.id ? 0 : 1,
                      borderColor: 'rgba(0,0,0,0.1)',
                    }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text 
                    style={[
                      styles.categoryName, 
                      { 
                        color: selectedCategory === category.id 
                          ? 'white' 
                          : theme.text 
                      }
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Eligibility Banner */}
          <View style={styles.bannerContainer}>
            <LinearGradient
              colors={['#FAFAFA', '#F5F5F5']}
              style={[styles.eligibilityBanner, { borderColor: theme.border }]}
            >
              <View style={styles.bannerTextContent}>
                <Text style={[styles.bannerTitle, { color: theme.text }]}>
                  Check Your Eligibility
                </Text>
                <Text style={[styles.bannerDescription, { color: theme.icon }]}>
                  Answer a few questions to find schemes you qualify for
                </Text>
                <TouchableOpacity 
                  style={[styles.bannerButton, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.bannerButtonText}>Check Now</Text>
                  <Emoji symbol="➡️" size={14} />
                </TouchableOpacity>
              </View>
              <View style={styles.bannerImageContainer}>
                <Emoji symbol="📋" size={50} />
              </View>
            </LinearGradient>
          </View>

          {/* All Schemes List */}
          <View style={styles.schemesContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              All Schemes {selectedCategory !== 'all' && `(${categories.find(c => c.id === selectedCategory)?.name || selectedCategory})`}
              {totalSchemes > 0 && ` - ${totalSchemes} total`}
            </Text>

            {filteredSchemes.length > 0 ? (
              <>
                {filteredSchemes.map((scheme: SchemeData) => {
                  const isExpanded = expandedScheme === scheme.id;
                  
                  // Set different background colors for different categories - more subtle pastel shades
                  const cardBgColors: Record<string, string> = {
                    'Housing': '#E0F2F1',
                    'Finance': '#FFF3E0',
                    'Agriculture': '#F1F8E9',
                    'Healthcare': '#E1F5FE',
                    'Women & Child': '#FCE4EC',
                    'Employment': '#EDE7F6',
                    'Entrepreneurship': '#FBE9E7',
                    'Education': '#E0F7FA',
                    'Pension': '#FFF3E0',
                    'Welfare': '#E8F5E9',
                    'Transportation': '#E8EAF6',
                    'Infrastructure': '#ECEFF1',
                    'Energy': '#FFFDE7',
                    'Rural Development': '#E8F5E9',
                    'Urban Development': '#F3E5F5',
                    'Digital': '#E0F7FA',
                    'Tourism': '#F9FBE7',
                    'Other': '#FAFAFA'
                  };
                  
                  const cardBgColor = cardBgColors[scheme.category as keyof typeof cardBgColors] || '#FFFFFF';
                  
                  // Set different border colors based on category for more visual distinction
                  const borderColors: Record<string, string> = {
                    'Housing': '#80CBC4',
                    'Finance': '#FFCC80',
                    'Agriculture': '#C5E1A5',
                    'Healthcare': '#90CAF9',
                    'Women & Child': '#F48FB1',
                    'Employment': '#B39DDB',
                    'Entrepreneurship': '#FFAB91',
                    'Education': '#80DEEA',
                    'Pension': '#FFCC80',
                    'Welfare': '#A5D6A7',
                    'Transportation': '#9FA8DA',
                    'Infrastructure': '#B0BEC5',
                    'Energy': '#FFE082',
                    'Rural Development': '#A5D6A7',
                    'Urban Development': '#CE93D8',
                    'Digital': '#80DEEA',
                    'Tourism': '#DCE775',
                    'Other': '#B0BEC5'
                  };
                  
                  const borderColor = borderColors[scheme.category as keyof typeof borderColors] || '#E0E0E0';
                  
                  // Set different button colors for different categories - more vibrant
                  const buttonColors: Record<string, string> = {
                    'Housing': '#009688',
                    'Finance': '#FF9800',
                    'Agriculture': '#8BC34A',
                    'Healthcare': '#2196F3',
                    'Women & Child': '#E91E63',
                    'Employment': '#673AB7',
                    'Entrepreneurship': '#FF5722',
                    'Education': '#00BCD4',
                    'Pension': '#FF5722',
                    'Welfare': '#4CAF50',
                    'Transportation': '#3F51B5',
                    'Infrastructure': '#607D8B',
                    'Energy': '#FFC107',
                    'Rural Development': '#4CAF50',
                    'Urban Development': '#9C27B0',
                    'Digital': '#00BCD4',
                    'Tourism': '#CDDC39',
                    'Other': '#78909C'
                  };
                  
                  const buttonColor = buttonColors[scheme.category as keyof typeof buttonColors] || theme.primary;
                  
                  // Set icon container color
                  const iconBgColors: Record<string, string> = {
                    'Housing': '#B2DFDB',
                    'Finance': '#FFE0B2',
                    'Agriculture': '#DCEDC8',
                    'Healthcare': '#BBDEFB',
                    'Women & Child': '#F8BBD0',
                    'Employment': '#D1C4E9',
                    'Entrepreneurship': '#FFCCBC',
                    'Education': '#B2EBF2',
                    'Pension': '#FFE0B2',
                    'Welfare': '#C8E6C9',
                    'Transportation': '#C5CAE9',
                    'Infrastructure': '#CFD8DC',
                    'Energy': '#FFF9C4',
                    'Rural Development': '#C8E6C9',
                    'Urban Development': '#E1BEE7',
                    'Digital': '#B2EBF2',
                    'Tourism': '#F0F4C3',
                    'Other': '#ECEFF1'
                  };
                  
                  const iconBgColor = iconBgColors[scheme.category as keyof typeof iconBgColors] || '#EEEEEE';
                  
                  return (
                    <Animated.View
                      key={scheme.id}
                      style={[
                        styles.schemeCard, 
                        { 
                          backgroundColor: cardBgColor, 
                          borderColor: borderColor,
                          borderWidth: 1.5,
                          transform: [{ scale: isExpanded ? 1.02 : 1 }],
                        }
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => setExpandedScheme(isExpanded ? null : scheme.id)}
                        activeOpacity={0.9}
                        style={styles.schemeCardTouchable}
                      >
                        <View style={styles.schemeCardHeader}>
                          <View style={[styles.schemeIconContainer, { backgroundColor: iconBgColor }]}>
                            <Emoji symbol={scheme.emoji} size={24} />
                          </View>
                          <View style={styles.schemeTitleContainer}>
                            <Text style={[styles.schemeTitle, { color: theme.text }]}>
                              {extractTitle(scheme.title)}
                            </Text>
                            <Text style={[styles.schemeDescription, { color: theme.icon }]}>
                              {truncateText(scheme.description, 60)}
                            </Text>
                          </View>
                          <Animated.View style={styles.schemeExpandIcon}>
                            <Emoji 
                              symbol={isExpanded ? "🔼" : "🔽"} 
                              size={14} 
                            />
                          </Animated.View>
                        </View>
                        
                        {isExpanded && (
                          <View style={styles.schemeExpandedContent}>
                            <View style={styles.schemeDivider} />
                            
                            <Text style={[styles.schemeDetailsText, { color: theme.text }]}>
                              {truncateText(scheme.longDescription, 200)}
                            </Text>
                            
                            <View style={styles.schemeInfoGrid}>
                              <View style={styles.schemeInfoItem}>
                                <View style={styles.schemeInfoHeader}>
                                  <Emoji symbol="✅" size={14} />
                                  <Text style={[styles.schemeInfoTitle, { color: theme.text }]}>
                                    Eligibility
                                  </Text>
                                </View>
                                <Text style={[styles.schemeInfoValue, { color: theme.icon }]}>
                                  {truncateText(scheme.eligibility, 70)}
                                </Text>
                              </View>
                              
                              <View style={styles.schemeInfoItem}>
                                <View style={styles.schemeInfoHeader}>
                                  <Emoji symbol="💰" size={14} />
                                  <Text style={[styles.schemeInfoTitle, { color: theme.text }]}>
                                    Benefit
                                  </Text>
                                </View>
                                <Text style={[styles.schemeInfoValue, { color: theme.icon }]}>
                                  {truncateText(scheme.benefitAmount, 70)}
                                </Text>
                              </View>
                              
                              <View style={styles.schemeInfoItem}>
                                <View style={styles.schemeInfoHeader}>
                                  <Emoji symbol="📅" size={14} />
                                  <Text style={[styles.schemeInfoTitle, { color: theme.text }]}>
                                    Last Date
                                  </Text>
                                </View>
                                <Text style={[styles.schemeInfoValue, { color: theme.icon }]}>
                                  {truncateText(scheme.deadline, 40)}
                                </Text>
                              </View>
                              
                              <View style={styles.schemeInfoItem}>
                                <View style={styles.schemeInfoHeader}>
                                  <Emoji symbol="🏛️" size={14} />
                                  <Text style={[styles.schemeInfoTitle, { color: theme.text }]}>
                                    Ministry
                                  </Text>
                                </View>
                                <Text style={[styles.schemeInfoValue, { color: theme.icon }]}>
                                  {truncateText(scheme.ministry, 70)}
                                </Text>
                              </View>
                            </View>
                            
                            <View style={styles.documentsSection}>
                              <Text style={[styles.documentsSectionTitle, { color: theme.text }]}>
                                Required Documents
                              </Text>
                              <View style={styles.documentsList}>
                                {scheme.documents.slice(0, 4).map((doc: string, index: number) => (
                                  <View key={index} style={styles.documentItem}>
                                    <Emoji symbol="📄" size={14} />
                                    <Text style={[styles.documentText, { color: theme.text }]}>
                                      {truncateText(doc, 40)}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                            
                            <View style={styles.schemeButtons}>
                              <TouchableOpacity 
                                style={[styles.schemeDetailButton, { backgroundColor: theme.lightBg }]}
                              >
                                <Emoji symbol="📋" size={16} />
                                <Text style={[styles.schemeDetailButtonText, { color: theme.text }]}>
                                  More Details
                                </Text>
                              </TouchableOpacity>
                              
                              <TouchableOpacity 
                                style={[styles.schemeApplyButton, { 
                                  backgroundColor: buttonColor
                                }]}
                              >
                                <Emoji symbol="✅" size={16} />
                                <Text style={styles.schemeApplyButtonText}>
                                  Apply Now
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
                
                {/* Pagination controls */}
                {totalPages > 1 && (
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    theme={theme}
                  />
                )}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Emoji symbol="🔍" size={50} />
                <Text style={[styles.emptyText, { color: theme.text }]}>
                  No schemes found
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.icon }]}>
                  Try a different search or category
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
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
    paddingTop: 10,
    paddingBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subheading: {
    fontSize: 14,
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  searchOuterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
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
  scrollContent: {
    paddingBottom: 30,
  },
  
  // Slider styles
  sliderContainer: {
    marginBottom: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  slideContainer: {
    width: width - 40,
    paddingHorizontal: 20,
    paddingVertical: 5,
    height: 215, // Increased height for better visibility
  },
  slideContent: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    height: '100%', // Fill the container height
  },
  slideTextContent: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'space-between',
    height: '100%', // Ensure consistent height
  },
  slideTopContent: {
    marginBottom: 10,
  },
  slideBottomContent: {
    marginTop: 10,
  },
  slideTagContainer: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  slideTag: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  slideDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 12,
  },
  schemeHighlightContainer: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  schemeHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  schemeHighlightText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 5,
    fontWeight: '600',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  applyButtonText: {
    fontWeight: '600',
    fontSize: 13,
    marginRight: 5,
    color: '#2E8B57',
  },
  slideEmojiContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  emojiCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  carouselPaginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  carouselDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  
  // Categories
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoriesContainer: {
    paddingRight: 20,
    marginBottom: 6,
  },
  categoryItem: {
    width: 100,
    height: 100,
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Eligibility Banner
  bannerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  eligibilityBanner: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  bannerTextContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerDescription: {
    fontSize: 14,
    marginBottom: 15,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
    marginRight: 5,
  },
  bannerImageContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Schemes List
  schemesContainer: {
    paddingHorizontal: 20,
  },
  schemeCard: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  schemeCardTouchable: {
    padding: 16,
  },
  schemeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schemeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  schemeTitleContainer: {
    flex: 1,
  },
  schemeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  schemeDescription: {
    fontSize: 13,
  },
  schemeExpandIcon: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schemeExpandedContent: {
    marginTop: 15,
  },
  schemeDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginBottom: 15,
  },
  schemeDetailsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  schemeInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  schemeInfoItem: {
    width: '50%',
    marginBottom: 15,
    paddingRight: 10,
  },
  schemeInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  schemeInfoTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
  schemeInfoValue: {
    fontSize: 13,
    lineHeight: 18,
  },
  documentsSection: {
    marginBottom: 15,
  },
  documentsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  documentsList: {
    marginLeft: 5,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentText: {
    fontSize: 13,
    marginLeft: 8,
  },
  schemeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  schemeDetailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  schemeDetailButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
  schemeApplyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  schemeApplyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    marginLeft: 5,
  },
  
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
  },
  
  // Pagination for schemes list
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  paginationButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  paginationButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  paginationInfo: {
    paddingHorizontal: 10,
  },
});