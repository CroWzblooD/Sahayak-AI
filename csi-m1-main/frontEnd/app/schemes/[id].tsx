import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TextInput, Modal, Linking, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME_COLORS } from '@/constants/Colors';
import { fetchSchemesByCategory } from '@/data/schemes';
import { Button, XStack, YStack } from 'tamagui';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { aiService } from '@/services/aiService';
import type { Scheme } from '@/types/schemes';

export default function SchemeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [showEligibility, setShowEligibility] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [userDetails, setUserDetails] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [guide, setGuide] = useState('');

  useEffect(() => {
    async function loadSchemes() {
      if (!id) return;
      try {
        const result = await fetchSchemesByCategory(id);
        setSchemes(result.schemes);
      } catch (error) {
        console.error('Error loading schemes:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSchemes();
  }, [id]);

  const checkEligibility = async (scheme: Scheme) => {
    setLoading(true);
    try {
      const response = await aiService.getTextResponse(`
        Analyze eligibility for scheme "${scheme.name}":
        
        User Details: ${userDetails}
        
        Scheme Requirements:
        - Eligibility: ${scheme.eligibilityCriteria.join(', ')}
        - Benefits: ${scheme.benefits.join(', ')}
        
        Provide:
        1. Detailed eligibility analysis
        2. Required documents
        3. Next steps if eligible
        4. Alternative options if not eligible
        
        Format with clear sections and bullet points.
      `);
      setAnalysis(response);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateGuide = async (scheme: Scheme) => {
    setLoading(true);
    try {
      const response = await aiService.getTextResponse(`
        Create a comprehensive guide for "${scheme.name}":

        Scheme Details:
        - Description: ${scheme.description}
        - Benefits: ${scheme.benefits.join(', ')}
        - Eligibility: ${scheme.eligibilityCriteria.join(', ')}

        Provide:
        1. Step-by-step application process
        2. Required documents with details
        3. Important deadlines and timelines
        4. Application submission methods
        5. Contact information and helpline
        6. Common mistakes to avoid
        7. Tips for successful application
        8. Post-application follow-up steps
        9. Relevant links and resources
        
        Format with clear sections, numbering, and bullet points.
      `);
      setGuide(response);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSchemeCard = (scheme: Scheme) => (
    <View key={scheme.id} style={styles.schemeCard}>
      <View style={styles.schemeHeader}>
        <View style={styles.schemeTitleContainer}>
          <MaterialIcons name="policy" size={24} color={THEME_COLORS.primary} />
          <Text style={styles.schemeTitle}>{scheme.name}</Text>
        </View>
        <Text style={styles.schemeDescription}>{scheme.description}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="check-circle" size={20} color={THEME_COLORS.primary} />
          <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
        </View>
        {scheme.eligibilityCriteria.map((item, index) => (
          <View key={index} style={styles.bulletPoint}>
            <MaterialIcons name="arrow-right" size={16} color={THEME_COLORS.primary} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="star" size={20} color={THEME_COLORS.primary} />
          <Text style={styles.sectionTitle}>Benefits</Text>
        </View>
        {scheme.benefits.map((item, index) => (
          <View key={index} style={styles.bulletPoint}>
            <MaterialIcons name="arrow-right" size={16} color={THEME_COLORS.primary} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>

      <XStack space="$3" marginTop={16}>
        <Button
          flex={1}
          backgroundColor={THEME_COLORS.primary}
          onPress={() => {
            setSelectedScheme(scheme);
            setShowEligibility(true);
          }}
          icon={<MaterialIcons name="person-search" size={20} color="white" />}
        >
          Check Eligibility
        </Button>
        <Button
          flex={1}
          backgroundColor={THEME_COLORS.secondary}
          onPress={() => {
            setSelectedScheme(scheme);
            generateGuide(scheme);
            setShowGuide(true);
          }}
          icon={<MaterialIcons name="help" size={20} color="white" />}
        >
          Get Guide
        </Button>
      </XStack>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={THEME_COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {schemes.map(renderSchemeCard)}
      </ScrollView>

      {/* Eligibility Check Modal */}
      <Modal
        visible={showEligibility}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEligibility(false)}
      >
        <BlurView intensity={100} style={styles.modalContainer}>
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Check Eligibility for {selectedScheme?.name}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowEligibility(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <TextInput
                style={styles.input}
                multiline
                numberOfLines={4}
                placeholder="Enter your details (age, income, occupation, etc.) to check eligibility..."
                value={userDetails}
                onChangeText={setUserDetails}
                placeholderTextColor="#666"
              />

              <XStack space="$3" marginVertical={16}>
                <Button
                  flex={1}
                  backgroundColor="#666"
                  onPress={() => setShowEligibility(false)}
                >
                  Close
                </Button>
                <Button
                  flex={1}
                  backgroundColor={THEME_COLORS.primary}
                  onPress={() => checkEligibility(selectedScheme!)}
                  disabled={loading}
                >
                  {loading ? 'Analyzing...' : 'Check Eligibility'}
                </Button>
              </XStack>

              {analysis && (
                <View style={styles.analysisContainer}>
                  <Text style={styles.analysisText}>{analysis}</Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </BlurView>
      </Modal>

      {/* Scheme Guide Modal */}
      <Modal
        visible={showGuide}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGuide(false)}
      >
        <BlurView intensity={100} style={styles.modalContainer}>
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Application Guide: {selectedScheme?.name}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowGuide(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={THEME_COLORS.primary} />
                  <Text style={styles.loadingText}>Generating guide...</Text>
                </View>
              ) : (
                <View style={styles.guideContainer}>
                  <Text style={styles.guideText}>{guide}</Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  schemeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  schemeHeader: {
    marginBottom: 16,
  },
  schemeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schemeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: THEME_COLORS.text,
  },
  schemeDescription: {
    fontSize: 14,
    color: THEME_COLORS.lightText,
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: THEME_COLORS.text,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bulletText: {
    fontSize: 14,
    color: THEME_COLORS.text,
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
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  modalScroll: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  analysisContainer: {
    marginTop: 16,
    maxHeight: 300,
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
  guideContainer: {
    flex: 1,
  },
  guideText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 