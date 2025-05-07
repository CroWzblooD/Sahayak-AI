import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal, TextInput, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { THEME_COLORS } from '@/constants/Colors';
import { Button, XStack, YStack, Card } from 'tamagui';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { fetchSchemeCategories } from '@/data/schemes';
import type { SchemeCategory } from '@/types/schemes';
import { useAuth } from '@/context/AuthContext';
import { aiService } from '@/services/aiService';
import { Linking } from 'react-native';

interface SchemeResult {
  id: string;
  name: string;
  eligibility: 'Eligible' | 'Not Eligible' | 'Potentially Eligible';
  description: string;
  whySuitable: string[];
  benefits: string[];
  howToApply: string[];
  documents: string[];
  applicationUrl?: string;
  category: string;
}

// Define scheme categories
const SCHEME_CATEGORIES = [
  { id: 'agriculture', title: 'Agriculture Schemes', icon: '🌾' },
  { id: 'education', title: 'Education Schemes', icon: '📚' },
  { id: 'health', title: 'Health Schemes', icon: '🏥' },
  { id: 'housing', title: 'Housing Schemes', icon: '🏠' },
  { id: 'women', title: 'Women Empowerment', icon: '👩' },
  { id: 'skill', title: 'Skill Development', icon: '💪' },
  { id: 'msme', title: 'MSME Support', icon: '🏭' },
  { id: 'social-security', title: 'Social Security', icon: '🛡️' },
  { id: 'rural', title: 'Rural Development', icon: '🌱' },
  { id: 'digital', title: 'Digital India', icon: '💻' },
];

// Add defaultScheme function
const defaultScheme = (category: any) => ({
  name: "Default Scheme",
  description: "Information temporarily unavailable. Please check back later.",
  lastDate: "Ongoing",
  fundingAmount: "As per guidelines",
  eligibilityCriteria: [
    "Indian Citizen",
    "Age 18 and above",
    "Valid documentation"
  ],
  benefits: [
    "Financial assistance",
    "Government support",
    "Official documentation"
  ],
  requiredDocuments: [
    "Aadhaar Card",
    "Income Certificate",
    "Address Proof"
  ],
  applicationSteps: [
    "Document verification",
    "Form submission",
    "Application processing"
  ],
  status: "Active",
  department: `${category.title} Department`,
  contactInfo: {
    website: "https://example.gov.in",
    helpline: "1800-XXX-XXX",
    email: "help@scheme.gov.in"
  }
});

export default function SchemesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<SchemeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFinder, setShowFinder] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    occupation: '',
    income: '',
    location: '',
    education: ''
  });
  const [recommendations, setRecommendations] = useState<SchemeResult[]>([]);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<SchemeResult | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchSchemeCategories();
        setCategories(data || []); // Ensure we always set an array
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const findSchemes = async () => {
    setLoading(true);
    const userDetailsFormatted = `
      Age: ${formData.age}
      Occupation: ${formData.occupation}
      Monthly Income: ${formData.income}
      Location: ${formData.location}
      Education: ${formData.education}
    `;
    
    try {
      const response = await aiService.getTextResponse(`
        As a scheme recommendation system, analyze these user details and return recommendations in the exact JSON format shown below. Do not include any additional text, markdown, or formatting.

        User Details:
        ${userDetailsFormatted}

        Return exactly in this format:
        [{"id":"scheme-1","name":"Scheme Name","eligibility":"Eligible","description":"Brief description","whySuitable":["reason1","reason2"],"benefits":["benefit1","benefit2"],"howToApply":["step1","step2"],"documents":["doc1","doc2"],"applicationUrl":"https://scheme-url.gov.in","category":"scheme-category"}]

        Remember: Return ONLY the JSON array with no additional characters, spaces, or formatting.
      `);

      let cleanedResponse = response;
      
      // Remove any backticks if present
      if (response.includes('```')) {
        cleanedResponse = response.replace(/```json\n?|\n?```/g, '');
      }
      
      // Remove any leading/trailing whitespace and newlines
      cleanedResponse = cleanedResponse.trim();
      
      // Remove any non-JSON characters
      cleanedResponse = cleanedResponse.replace(/^[^[\{]+|[^\}\]]+$/g, '');

      try {
        const parsedResponse = JSON.parse(cleanedResponse);
        if (Array.isArray(parsedResponse)) {
          setRecommendations(parsedResponse);
        } else if (typeof parsedResponse === 'object') {
          // If single object is returned, wrap in array
          setRecommendations([parsedResponse]);
        } else {
          console.error('Invalid response structure');
          setRecommendations([]);
        }
      } catch (parseError) {
        console.error('Initial Parse Error:', parseError);
        
        // Last resort: Try to extract JSON using regex
        try {
          const jsonMatch = cleanedResponse.match(/\[{.*}\]/);
          if (jsonMatch) {
            const extractedJson = jsonMatch[0];
            const parsedExtracted = JSON.parse(extractedJson);
            if (Array.isArray(parsedExtracted)) {
              setRecommendations(parsedExtracted);
            } else {
              setRecommendations([]);
            }
          } else {
            setRecommendations([]);
          }
        } catch (finalError) {
          console.error('Final Parse Error:', finalError);
          setRecommendations([]);
        }
      }
    } catch (error) {
      console.error('API Error:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = async (category: typeof SCHEME_CATEGORIES[0]) => {
    setLoading(true);
    try {
      const prompt = `Generate 5 government schemes for ${category.title} in India with exact details. Format as clean JSON array only, no additional text:
[{
  "name": "Scheme Name",
  "description": "Brief description",
  "lastDate": "Deadline",
  "fundingAmount": "Amount",
  "eligibilityCriteria": ["criteria1", "criteria2"],
  "benefits": ["benefit1", "benefit2"],
  "requiredDocuments": ["doc1", "doc2"],
  "applicationSteps": ["step1", "step2"],
  "status": "Active",
  "department": "Department Name",
  "contactInfo": {
    "website": "https://example.gov.in",
    "helpline": "1800-XXX-XXX",
    "email": "help@scheme.gov.in"
  }
}]`;

      let schemes = [];
      try {
        const response = await aiService.getTextResponse(prompt);
        // Clean the response to ensure valid JSON
        const cleanedResponse = response
          .replace(/```json\n?|\n?```/g, '')
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          .trim();
        
        // Validate if response starts with [ and ends with ]
        if (cleanedResponse.startsWith('[') && cleanedResponse.endsWith(']')) {
          schemes = JSON.parse(cleanedResponse);
        } else {
          throw new Error('Invalid JSON format');
        }
      } catch (error) {
        console.error('AI generation error:', error);
        // Use fallback schemes
        schemes = Array(5).fill(null).map(() => defaultScheme(category));
      }

      router.push({
        pathname: "/schemes-category",
        params: { 
          category: category.id,
          title: category.title,
          schemes: JSON.stringify(schemes)
        }
      });
    } catch (error) {
      console.error('Error handling schemes:', error);
      Alert.alert('Error', 'Failed to load schemes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME_COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <YStack>
            <Text style={styles.headerTitle}>Government Schemes</Text>
            <Text style={styles.headerSubtitle}>
              Find and apply for government schemes
            </Text>
          </YStack>
        </View>

        <View style={styles.finderCard}>
          <View style={styles.finderContent}>
            <View style={styles.searchIconWrapper}>
              <MaterialIcons name="search" size={24} color={THEME_COLORS.primary} />
            </View>
            <View style={styles.finderTextContainer}>
              <Text style={styles.finderTitle}>Find Perfect Schemes</Text>
              <Text style={styles.finderSubtitle}>
                Get personalized recommendations
              </Text>
            </View>
          </View>
          <Pressable 
            style={styles.finderButton}
            onPress={() => setShowFinder(true)}
          >
            <Text style={styles.finderButtonText}>Find Now</Text>
          </Pressable>
        </View>

        <View style={styles.categoriesGrid}>
          {SCHEME_CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.schemeCount}>View Schemes</Text>
            </Pressable>
          ))}
        </View>

        <Modal
          visible={showFinder}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFinder(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>AI Scheme Finder</Text>
                <Text style={styles.modalSubtitle}>
                  Tell us about yourself to find the perfect schemes for you
                </Text>
              </View>

              <ScrollView style={styles.formScroll}>
                {!recommendations.length ? (
                  <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Age</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your age"
                        value={formData.age}
                        onChangeText={(text) => setFormData({...formData, age: text})}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Occupation</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Your current occupation"
                        value={formData.occupation}
                        onChangeText={(text) => setFormData({...formData, occupation: text})}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Monthly Income (INR)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Your monthly income"
                        value={formData.income}
                        onChangeText={(text) => setFormData({...formData, income: text})}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Location</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Your city/state"
                        value={formData.location}
                        onChangeText={(text) => setFormData({...formData, location: text})}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Education</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Your highest education"
                        value={formData.education}
                        onChangeText={(text) => setFormData({...formData, education: text})}
                      />
                    </View>

                    <XStack space="$3" style={styles.buttonContainer}>
                      <Button
                        flex={1}
                        backgroundColor="#666"
                        onPress={() => setShowFinder(false)}
                      >
                        Close
                      </Button>
                      <Button
                        flex={1}
                        backgroundColor={THEME_COLORS.primary}
                        onPress={findSchemes}
                        disabled={loading}
                      >
                        {loading ? 'Finding...' : 'Find Schemes'}
                      </Button>
                    </XStack>
                  </View>
                ) : (
                  <View style={styles.recommendationsWrapper}>
                    <ScrollView style={styles.recommendationsContainer}>
                      <Text style={styles.mainTitle}>Recommended Schemes</Text>
                      
                      {recommendations.map((scheme: SchemeResult) => (
                        <Card key={scheme.id} elevate style={styles.schemeCard}>
                          <View style={styles.schemeHeader}>
                            <MaterialIcons name="verified" size={24} color={THEME_COLORS.primary} />
                            <Text style={styles.schemeTitle}>{scheme.name}</Text>
                          </View>

                          <View style={[styles.eligibilityBadge, 
                            { backgroundColor: 
                              scheme.eligibility === 'Eligible' ? '#E3FCEF' : 
                              scheme.eligibility === 'Not Eligible' ? '#FEE2E2' : 
                              '#FEF3C7'
                            }
                          ]}>
                            <MaterialIcons 
                              name={scheme.eligibility === 'Eligible' ? "check-circle" : 
                                    scheme.eligibility === 'Not Eligible' ? "cancel" : "help"}
                              size={16} 
                              color={scheme.eligibility === 'Eligible' ? "#00875A" :
                                     scheme.eligibility === 'Not Eligible' ? "#DC2626" : "#D97706"} 
                            />
                            <Text style={[styles.eligibilityText, {
                              color: scheme.eligibility === 'Eligible' ? "#00875A" :
                                     scheme.eligibility === 'Not Eligible' ? "#DC2626" : "#D97706"
                            }]}>{scheme.eligibility}</Text>
                          </View>

                          <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                              <FontAwesome5 name="check-double" size={16} color="#666" />
                              <Text style={styles.bodySectionTitle}>Why Suitable</Text>
                            </View>
                            <View style={styles.bulletPoints}>
                              {scheme.whySuitable.map((point, index) => (
                                <Text key={index} style={styles.bulletPoint}>• {point}</Text>
                              ))}
                            </View>
                          </View>

                          <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                              <FontAwesome5 name="gift" size={16} color="#666" />
                              <Text style={styles.bodySectionTitle}>Benefits</Text>
                            </View>
                            <View style={styles.bulletPoints}>
                              {scheme.benefits.map((benefit, index) => (
                                <Text key={index} style={styles.bulletPoint}>• {benefit}</Text>
                              ))}
                            </View>
                          </View>

                          <View style={styles.actionButtons}>
                            <Pressable 
                              style={[styles.actionButton, styles.infoButton]}
                              onPress={() => {
                                setSelectedScheme(scheme);
                                setShowMoreInfo(true);
                              }}
                            >
                              <MaterialIcons name="info-outline" size={20} color={THEME_COLORS.primary} />
                              <Text style={styles.infoButtonText}>More Info</Text>
                            </Pressable>
                            
                            <Pressable 
                              style={[styles.actionButton, styles.applyButton]}
                              onPress={() => {
                                if (scheme.applicationUrl) {
                                  Linking.openURL(scheme.applicationUrl);
                                } else {
                                  router.push("/schemes");
                                }
                              }}
                            >
                              <MaterialIcons name="arrow-forward" size={20} color="white" />
                              <Text style={styles.applyButtonText}>Apply Now</Text>
                            </Pressable>
                          </View>
                        </Card>
                      ))}
                    </ScrollView>

                    <View style={styles.bottomButtonsContainer}>
                      <Pressable 
                        style={styles.bottomButton}
                        onPress={() => {
                          setRecommendations([]);
                          setFormData({age: '', occupation: '', income: '', location: '', education: ''});
                        }}
                      >
                        <MaterialIcons name="refresh" size={20} color="white" />
                        <Text style={styles.bottomButtonText}>New Search</Text>
                      </Pressable>
                      
                      <Pressable 
                        style={[styles.bottomButton, styles.closeButton]}
                        onPress={() => setShowFinder(false)}
                      >
                        <MaterialIcons name="close" size={20} color="white" />
                        <Text style={styles.bottomButtonText}>Close</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* More Info Modal */}
        <Modal
          visible={showMoreInfo}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowMoreInfo(false)}
        >
          <View style={styles.moreInfoContainer}>
            <View style={styles.moreInfoContent}>
              <View style={styles.moreInfoHeader}>
                <Text style={styles.moreInfoTitle}>{selectedScheme?.name}</Text>
                <Pressable 
                  onPress={() => setShowMoreInfo(false)}
                  style={styles.closeIcon}
                >
                  <MaterialIcons name="close" size={24} color="#666" />
                </Pressable>
              </View>

              <ScrollView style={styles.moreInfoScroll}>
                <View style={styles.infoSection}>
                  <Text style={styles.infoSectionTitle}>Description</Text>
                  <Text style={styles.infoText}>{selectedScheme?.description}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoSectionTitle}>Required Documents</Text>
                  {selectedScheme?.documents.map((doc, index) => (
                    <Text key={index} style={styles.bulletPoint}>• {doc}</Text>
                  ))}
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoSectionTitle}>How to Apply</Text>
                  {selectedScheme?.howToApply.map((step, index) => (
                    <Text key={index} style={styles.stepText}>{index + 1}. {step}</Text>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME_COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingBottom: 80,
    backgroundColor: THEME_COLORS.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  categoriesGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  schemeCount: {
    fontSize: 14,
    color: '#666',
  },
  finderCard: {
    marginHorizontal: 16,
    marginTop: -50,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  finderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchIconWrapper: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  finderTextContainer: {
    flex: 1,
  },
  finderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  finderSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  finderButton: {
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  finderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '50%',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  formScroll: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    marginTop: 24,
  },
  recommendationsWrapper: {
    flex: 1,
    marginTop: 16,
  },
  recommendationsContainer: {
    flex: 1,
    padding: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  schemeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  schemeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  schemeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  eligibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 6,
  },
  eligibilityBadgeBackground: {
    backgroundColor: 'transparent',
  },
  eligibilityText: {
    color: '#00875A',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionContainer: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  bodySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  bulletPoints: {
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: THEME_COLORS.primary,
  },
  applyButton: {
    backgroundColor: THEME_COLORS.primary,
  },
  infoButtonText: {
    color: THEME_COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#666',
  },
  closeButton: {
    backgroundColor: THEME_COLORS.primary,
  },
  bottomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  moreInfoContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  moreInfoContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  moreInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  moreInfoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  closeIcon: {
    padding: 8,
  },
  moreInfoScroll: {
    flex: 1,
    padding: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
}); 