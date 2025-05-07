import { 
  StyleSheet, 
  Platform, 
  Pressable, 
  FlatList, 
  Image, 
  Dimensions,
  View,
  ScrollView,
  ActivityIndicator,
  Linking,
  Text,
  TextInput,
  PermissionsAndroid
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Voice from '@react-native-voice/voice';

const { width } = Dimensions.get('window');

const shadeColor = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)}`;
};

const THEME_COLORS = {
  primary: '#34D399',
  secondary: '#10B981',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#1F2937',
  lightText: '#6B7280',
};

interface UserProfile {
  personal: {
    name: string;
    age: string;
    occupation: string;
    education: string;
    disability: string;
    disabilityType: string;
  };
  financial: {
    monthlyIncome: string;
    category: string;
  };
  location: {
    state: string;
    city: string;
  };
}

interface SchemeEligibilityCriteria {
  incomeLimit?: number;
  categories?: string[];
  age?: { min?: number; max?: number };
  education?: string[];
  occupation?: string[];
  disability?: boolean;
  states?: string[];
  gender?: string[];
}

interface GovernmentScheme {
  name: string;
  category: string;
  description: string;
  eligibilityCriteria: SchemeEligibilityCriteria;
  benefits: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface Scheme {
  id: string;
  title: string;
  category: string;
  deadline: Date;
  eligibility: string;
  icon: keyof typeof Ionicons.glyphMap;
  minIncome?: number;
  maxIncome?: number;
  targetCategories?: string[];
  targetOccupations?: string[];
  targetEducation?: string[];
  targetStates?: string[];
  disabilityEligible?: boolean;
  details?: string;
  applicationUrl?: string;
  location?: string;
}

const FEATURED_SCHEMES: Scheme[] = [
  {
    id: '1',
    title: 'PM Kisan Samman Nidhi',
    category: 'Agriculture',
    deadline: new Date('2024-12-31'),
    eligibility: 'Small and marginal farmers',
    icon: 'leaf-outline',
  },
  // ... add more schemes
];

const QUICK_ACTIONS = [
  {
    id: '1',
    title: 'Chat with AI',
    icon: 'chatbubbles-outline',
    color: '#34D399',
  },
  {
    id: '2',
    title: 'Voice Assistant',
    icon: 'mic-outline',
    color: '#10B981',
  },
  {
    id: '3',
    title: 'Nearby Offices',
    icon: 'location-outline',
    color: '#059669',
  },
  {
    id: '4',
    title: 'Documents',
    icon: 'document-text-outline',
    color: '#047857',
  },
];

const CATEGORIES = [
  {
    id: '1',
    title: 'Agriculture',
    icon: 'leaf-outline',
    schemes: 24,
  },
  {
    id: '2',
    title: 'Education',
    icon: 'school-outline',
    schemes: 18,
  },
  {
    id: '3',
    title: 'Healthcare',
    icon: 'medical-outline',
    schemes: 15,
  },
  {
    id: '4',
    title: 'Housing',
    icon: 'home-outline',
    schemes: 12,
  },
];

// Initialize Gemini
const genAI = new GoogleGenerativeAI('AIzaSyCXuS_V-WkItGd5UXqpp35B8w6MkjmJu5E'); // Replace with your actual API key

const generateRecommendedSchemes = async (profile: UserProfile): Promise<Scheme[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Only generate recommendations if we have meaningful profile data
    if (profile.personal.name === 'N/A' || !profile.personal.age) {
      return [];
    }

    const prompt = `You are a government scheme recommendation system. Based on the following user profile, recommend relevant Indian government schemes.
      
      User Profile:
      - Age: ${profile.personal.age}
      - Occupation: ${profile.personal.occupation}
      - Education: ${profile.personal.education}
      - Monthly Income: ${profile.financial.monthlyIncome}
      - Category: ${profile.financial.category}
      - State: ${profile.location.state}
      - Disability Status: ${profile.personal.disability}
      - Disability Type: ${profile.personal.disabilityType}

      Provide 3-5 most relevant government schemes as a valid JSON array. Each scheme should have:
      {
        "id": "unique_string",
        "title": "scheme name",
        "category": "scheme category",
        "deadline": "2024-12-31",
        "eligibility": "brief eligibility criteria",
        "icon": "one of: leaf-outline, school-outline, medical-outline, home-outline, business-outline",
        "details": "benefits description"
      }

      Ensure the JSON is properly formatted with commas between properties and no trailing commas.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and fix common JSON formatting issues
    const cleanedText = text.trim()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/^\s*\n/gm, '')
      // Fix the specific issue with "scheme_3": instead of "scheme_3",
      .replace(/"id":\s*"([^"]+)":\s*"([^"]+)"/, '"id": "$1", "title": "$2"')
      // Remove any trailing commas in objects
      .replace(/,(\s*})/g, '$1')
      // Remove any trailing commas in arrays
      .replace(/,(\s*\])/g, '$1');

    try {
      let generatedSchemes;
      try {
        generatedSchemes = JSON.parse(cleanedText);
      } catch (initialParseError) {
        // If initial parse fails, try to fix common JSON issues
        const fixedText = cleanedText
          // Fix missing commas between objects in array
          .replace(/}(\s*){/g, '},{')
          // Fix extra colons in id fields
          .replace(/"id":\s*"([^"]+)":\s*/, '"id": "$1", "title": ');
        
        generatedSchemes = JSON.parse(fixedText);
      }

      // Validate and format each scheme
      return generatedSchemes.map((scheme: any) => {
        // Ensure all required fields are present
        const formattedScheme = {
          id: scheme.id || Math.random().toString(36).substr(2, 9),
          title: scheme.title || scheme.name || 'Unknown Scheme', // Handle both title and name fields
          category: scheme.category || 'General',
          deadline: scheme.deadline === 'Ongoing' 
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Set 1 year for ongoing schemes
            : new Date(scheme.deadline || Date.now() + 90 * 24 * 60 * 60 * 1000),
          eligibility: scheme.eligibility || 'Contact local authorities for eligibility',
          icon: (scheme.icon as keyof typeof Ionicons.glyphMap) || 'document-outline',
          details: scheme.details || 'Details not available',
          applicationUrl: scheme.applicationUrl,
          location: scheme.location
        };

        return formattedScheme;
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.log('Received text:', cleanedText);
      // If all parsing attempts fail, return empty array
      return [];
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

export default function HomeScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendedSchemes, setRecommendedSchemes] = useState<Scheme[]>([]);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Scheme[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [hasVoicePermission, setHasVoicePermission] = useState(false);

  useEffect(() => {
    const loadUserDataAndGenerateRecommendations = async () => {
      try {
        const onboardingData = await AsyncStorage.getItem('onboardingResponses');
        if (!onboardingData) {
          return; // Don't proceed if no onboarding data
        }

        const parsedOnboarding = JSON.parse(onboardingData);
        
        // Only proceed if we have meaningful data
        if (!parsedOnboarding.fullName || !parsedOnboarding.age) {
          return;
        }

        const profile: UserProfile = {
          personal: {
            name: parsedOnboarding.fullName,
            age: parsedOnboarding.age,
            occupation: parsedOnboarding.occupation || 'N/A',
            education: parsedOnboarding.education || 'N/A',
            disability: parsedOnboarding.disability || 'No',
            disabilityType: parsedOnboarding.disabilityType || 'None'
          },
          financial: {
            monthlyIncome: parsedOnboarding.monthlyIncome || 'N/A',
            category: parsedOnboarding.caste || 'N/A',
          },
          location: {
            state: parsedOnboarding.location || 'N/A',
            city: parsedOnboarding.city || 'N/A',
          }
        };

        setUserProfile(profile);
        setIsGeneratingRecommendations(true);

        // Generate recommendations using Gemini
        const schemes = await generateRecommendedSchemes(profile);
        setRecommendedSchemes(schemes);
        setIsGeneratingRecommendations(false);
      } catch (error) {
        console.error('Error loading profile data:', error);
        setIsGeneratingRecommendations(false);
      }
    };

    loadUserDataAndGenerateRecommendations();
  }, []);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          // Request Android permissions explicitly
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Voice Permission',
              message: 'This app needs access to your microphone for voice search.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          setHasVoicePermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        } else {
          // For iOS, just check availability
          const available = await Voice.isAvailable();
          setHasVoicePermission(!!available);
        }
      } catch (error) {
        console.error('Voice recognition setup error:', error);
        setHasVoicePermission(false);
      }
    };

    checkPermission();

    Voice.onSpeechStart = () => setIsVoiceListening(true);
    Voice.onSpeechEnd = () => setIsVoiceListening(false);
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value[0]) {
        setSearchQuery(e.value[0]);
        handleSearch(e.value[0]);
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startVoiceSearch = async () => {
    try {
      if (!hasVoicePermission) {
        const available = await Voice.isAvailable();
        if (!available) {
          console.log('Voice recognition not available');
          return;
        }
      }

      await Voice.start('en-US');
    } catch (error) {
      console.error('Voice search error:', error);
    }
  };

  const stopVoiceSearch = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      const prompt = `Search for Indian government schemes related to "${query}". Return a valid JSON array with 3-5 most relevant schemes. Format strictly as follows:
      [
        {
          "id": "unique_string",
          "title": "scheme name",
          "category": "scheme category",
          "deadline": "2024-12-31",
          "eligibility": "brief eligibility criteria",
          "icon": "leaf-outline",
          "details": "detailed description",
          "applicationUrl": "https://example.com"
        }
      ]
      
      Notes:
      - Use only valid dates between today and 2025-12-31
      - Use only these icons: leaf-outline, school-outline, medical-outline, home-outline, business-outline
      - Ensure valid JSON format with no trailing commas
      - Include real application URLs when available`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean the response text
      text = text
        .replace(/```json\s*|\s*```/g, '')  // Remove JSON code blocks
        .replace(/[\u201C\u201D]/g, '"')    // Replace smart quotes
        .replace(/[\r\n\t]/g, ' ')          // Remove newlines and tabs
        .trim();

      // Extract JSON array if wrapped in other text
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }

      const cleanedText = jsonMatch[0];
      
      try {
        const searchResults = JSON.parse(cleanedText);
        
        // Validate and format each scheme
        const formattedResults = searchResults.map((scheme: any) => {
          // Set a default deadline 3 months from now if not provided or invalid
          const defaultDeadline = new Date();
          defaultDeadline.setMonth(defaultDeadline.getMonth() + 3);

          let deadline;
          try {
            deadline = scheme.deadline ? new Date(scheme.deadline) : defaultDeadline;
            // Ensure date is valid and not in the past
            if (isNaN(deadline.getTime()) || deadline < new Date()) {
              deadline = defaultDeadline;
            }
          } catch {
            deadline = defaultDeadline;
          }

          return {
            id: scheme.id || Math.random().toString(36).substr(2, 9),
            title: scheme.title || 'Unknown Scheme',
            category: scheme.category || 'General',
            deadline: deadline,
            eligibility: scheme.eligibility || 'Contact department for eligibility details',
            icon: scheme.icon || 'document-outline',
            details: scheme.details || 'Additional details not available',
            applicationUrl: scheme.applicationUrl || null
          };
        });

        setSearchResults(formattedResults);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error('Failed to parse search results');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderFeatureCard = ({ item }: { item: { title: string; icon: string } }) => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 500 }}
      style={styles.featureCard}
    >
      <LinearGradient
        colors={[THEME_COLORS.primary, THEME_COLORS.secondary]}
        style={styles.featureIcon}>
        <Ionicons name={item.icon as any} size={24} color="white" />
      </LinearGradient>
      <ThemedText style={styles.featureTitle}>{item.title}</ThemedText>
    </MotiView>
  );

  const renderSchemeCard = ({ item }: { item: Scheme }) => (
    <Pressable 
      style={styles.schemeCard}
      onPress={() => {
        if (item.applicationUrl) {
          Linking.openURL(item.applicationUrl).catch(err => 
            console.error('Error opening URL:', err)
          );
        } else {
          router.push('/schemes');
        }
      }}
    >
      <LinearGradient
        colors={[`${THEME_COLORS.primary}15`, `${THEME_COLORS.primary}05`]}
        style={styles.schemeCardGradient}
      >
        <View style={styles.schemeIcon}>
          <Ionicons name={item.icon} size={24} color={THEME_COLORS.primary} />
        </View>
        <View style={styles.schemeInfo}>
          <ThemedText type="title" style={styles.schemeTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.schemeCategory}>
            {item.category}
          </ThemedText>
          <View style={styles.schemeDeadline}>
            <Ionicons name="time-outline" size={16} color={THEME_COLORS.lightText} />
            <ThemedText style={styles.deadlineText}>
              Apply by: {item.deadline.toLocaleDateString()}
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );

  const renderQuickAction = ({ item }: { item: typeof QUICK_ACTIONS[0] }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: parseInt(item.id) * 100 }}
      style={styles.quickActionCard}
    >
      <LinearGradient
        colors={[item.color, shadeColor(item.color, -20)]}
        style={styles.quickActionGradient}
      >
        <Ionicons name={item.icon as any} size={24} color="white" />
      </LinearGradient>
      <ThemedText style={styles.quickActionTitle}>{item.title}</ThemedText>
    </MotiView>
  );

  const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <Pressable style={styles.categoryCard}>
      <View style={[styles.categoryIcon, { backgroundColor: `${THEME_COLORS.primary}15` }]}>
        <Ionicons name={item.icon as any} size={24} color={THEME_COLORS.primary} />
      </View>
      <ThemedText style={styles.categoryTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.schemeCount}>{item.schemes} schemes</ThemedText>
    </Pressable>
  );

  const renderRecommendedSchemes = () => {
    if (isGeneratingRecommendations) {
      return (
        <View style={styles.noSchemesContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <ThemedText style={styles.noSchemesText}>
            Generating personalized recommendations...
          </ThemedText>
        </View>
      );
    }

    if (recommendedSchemes.length === 0) {
      return (
        <View style={styles.noSchemesContainer}>
          <ThemedText style={styles.noSchemesText}>
            Complete your profile to get personalized scheme recommendations
          </ThemedText>
        </View>
      );
    }

    return (
      <FlatList
        data={recommendedSchemes}
        renderItem={renderSchemeCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.schemesList}
      />
    );
  };

  const renderSearchResults = () => (
    <ScrollView 
      style={styles.suggestionsScroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {searchResults.map((item) => (
        <Pressable
          key={item.id}
          style={styles.suggestionItem}
          onPress={() => {
            router.push({
              pathname: '/scheme-details',
              params: {
                title: item.title,
                category: item.category
              }
            });
            setSearchQuery('');
            setSearchResults([]);
          }}
        >
          <View style={styles.suggestionIconContainer}>
            <Ionicons 
              name={item.icon || 'document-outline'} 
              size={24} 
              color={THEME_COLORS.primary} 
            />
          </View>
          <View style={styles.suggestionContent}>
            <Text style={styles.suggestionTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.suggestionCategory}>
              {item.category}
            </Text>
            <View style={styles.suggestionDeadline}>
              <Ionicons 
                name="time-outline" 
                size={14} 
                color={THEME_COLORS.lightText} 
              />
              <Text style={styles.deadlineText}>
                Apply by: {item.deadline.toLocaleDateString()}
              </Text>
            </View>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={THEME_COLORS.lightText} 
          />
        </Pressable>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <ThemedText style={styles.welcomeText}>Welcome to</ThemedText>
              <ThemedText type="title" style={styles.appTitle}>
                Sahayak AI
              </ThemedText>
            </View>
            <Pressable 
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <Ionicons 
                name="person-circle-outline" 
                size={32} 
                color={THEME_COLORS.primary} 
              />
            </Pressable>
          </View>

          <View style={styles.headerSection}>
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={20} color={THEME_COLORS.lightText} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search government schemes..."
                  placeholderTextColor={THEME_COLORS.lightText}
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                {searchQuery ? (
                  <Pressable onPress={() => handleSearch('')}>
                    <Ionicons name="close-circle" size={20} color={THEME_COLORS.lightText} />
                  </Pressable>
                ) : (
                  <Ionicons name="mic-outline" size={20} color={THEME_COLORS.primary} />
                )}
              </View>

              {/* Search Suggestions Dropdown */}
              {(isSearching || searchResults.length > 0) && searchQuery && (
                <View style={styles.searchSuggestionsContainer}>
                  {isSearching ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={THEME_COLORS.primary} />
                      <Text style={styles.loadingText}>Searching schemes...</Text>
                    </View>
                  ) : (
                    renderSearchResults()
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.statCard}
          >
            <ThemedText style={styles.statNumber}>1000+</ThemedText>
            <ThemedText style={styles.statLabel}>Schemes</ThemedText>
          </MotiView>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 100 }}
            style={styles.statCard}
          >
            <ThemedText style={styles.statNumber}>12</ThemedText>
            <ThemedText style={styles.statLabel}>Languages</ThemedText>
          </MotiView>
        </View>

        <View style={styles.quickActionsContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Quick Actions
            </ThemedText>
          </View>
          <FlatList
            data={QUICK_ACTIONS}
            renderItem={renderQuickAction}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsList}
          />
        </View>

        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Browse by Category
            </ThemedText>
          </View>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => (
              <View key={category.id} style={styles.categoryWrapper}>
                {renderCategory({ item: category })}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.featuredSchemes}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Recommended Schemes
            </ThemedText>
            <Pressable>
              <ThemedText style={styles.seeAll}>View All</ThemedText>
            </Pressable>
          </View>
          {renderRecommendedSchemes()}
        </View>

        <View style={styles.aiAssistantCard}>
          <LinearGradient
            colors={[THEME_COLORS.primary, THEME_COLORS.secondary]}
            style={styles.aiAssistantGradient}
          >
            <View style={styles.aiAssistantContent}>
              <ThemedText style={styles.aiAssistantTitle}>
                Need Help?
              </ThemedText>
              <ThemedText style={styles.aiAssistantSubtitle}>
                Talk to our AI Assistant in your language
              </ThemedText>
              <Pressable style={styles.aiAssistantButton}>
                <ThemedText style={styles.aiAssistantButtonText}>
                  Start Conversation
                </ThemedText>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </Pressable>
            </View>
            <View style={styles.aiAssistantIconContainer}>
              <Ionicons name="chatbubbles" size={80} color="white" style={styles.aiAssistantIcon} />
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: THEME_COLORS.lightText,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
  },
  headerSection: {
    zIndex: 2, // Ensure dropdown appears above other content
  },
  searchContainer: {
    padding: 16,
    position: 'relative',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.card,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: THEME_COLORS.text,
  },
  profileButton: {
    padding: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME_COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: THEME_COLORS.primary,
  },
  schemeCard: {
    width: width * 0.8,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: THEME_COLORS.card,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  schemeCardGradient: {
    padding: 16,
    flexDirection: 'row',
  },
  schemeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${THEME_COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  schemeInfo: {
    flex: 1,
  },
  schemeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: THEME_COLORS.text,
  },
  schemeCategory: {
    fontSize: 14,
    color: THEME_COLORS.lightText,
    marginBottom: 8,
  },
  schemeDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    marginLeft: 4,
    fontSize: 12,
    color: THEME_COLORS.lightText,
  },
  deadlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: width * 0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: THEME_COLORS.lightText,
    marginTop: 4,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsList: {
    paddingHorizontal: 16,
  },
  quickActionCard: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: width * 0.28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  quickActionGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: THEME_COLORS.text,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  categoryWrapper: {
    width: '50%',
    padding: 6,
  },
  categoryCard: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  schemeCount: {
    fontSize: 12,
    color: THEME_COLORS.lightText,
  },
  aiAssistantCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  aiAssistantGradient: {
    flexDirection: 'row',
    padding: 20,
  },
  aiAssistantContent: {
    flex: 1,
  },
  aiAssistantTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  aiAssistantSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 16,
  },
  aiAssistantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  aiAssistantButtonText: {
    color: 'white',
    marginRight: 8,
  },
  aiAssistantIconContainer: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAssistantIcon: {
    opacity: 0.9,
  },
  featureCard: {
    backgroundColor: THEME_COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: width * 0.35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME_COLORS.text,
    textAlign: 'center',
  },
  featuredSchemes: {
    marginBottom: 24,
  },
  schemesList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  noSchemesContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noSchemesText: {
    color: THEME_COLORS.lightText,
    textAlign: 'center',
  },
  searchSuggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    backgroundColor: THEME_COLORS.card,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionsScroll: {
    maxHeight: 400,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${THEME_COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
    marginRight: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: THEME_COLORS.text,
    marginBottom: 2,
  },
  suggestionCategory: {
    fontSize: 14,
    color: THEME_COLORS.lightText,
    marginBottom: 2,
  },
  suggestionDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: THEME_COLORS.lightText,
  },
});