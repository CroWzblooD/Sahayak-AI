import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TextInput, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME_COLORS } from '@/constants/Colors';
import { fetchSchemesByCategory } from '@/data/schemes';
import { Button, XStack } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { aiService } from '@/services/aiService';
import type { Scheme } from '@/types/schemes';

export default function SchemeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [showEligibility, setShowEligibility] = useState(false);
  const [userDetails, setUserDetails] = useState('');
  const [analysis, setAnalysis] = useState('');

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
        For the scheme "${scheme.name}":
        
        User Details: ${userDetails}
        
        Scheme Requirements:
        - Eligibility: ${scheme.eligibilityCriteria.join(', ')}
        - Benefits: ${scheme.benefits.join(', ')}
        
        Please provide:
        1. Detailed eligibility analysis
        2. Required documents
        3. Application process
        4. Next steps
        
        Format with clear sections and bullet points.
      `);
      setAnalysis(response);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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
        {schemes.map((scheme) => (
          <View key={scheme.id} style={styles.schemeCard}>
            <Text style={styles.schemeTitle}>{scheme.name}</Text>
            <Text style={styles.schemeDescription}>{scheme.description}</Text>
            
            <View style={styles.infoSection}>
              <MaterialIcons name="check-circle" size={20} color={THEME_COLORS.primary} />
              <Text style={styles.sectionTitle}>Eligibility</Text>
            </View>
            {scheme.eligibilityCriteria.map((item, index) => (
              <Text key={index} style={styles.bulletPoint}>• {item}</Text>
            ))}

            <View style={styles.infoSection}>
              <MaterialIcons name="star" size={20} color={THEME_COLORS.primary} />
              <Text style={styles.sectionTitle}>Benefits</Text>
            </View>
            {scheme.benefits.map((item, index) => (
              <Text key={index} style={styles.bulletPoint}>• {item}</Text>
            ))}

            <Button
              icon={<MaterialIcons name="person-search" size={20} color="white" />}
              backgroundColor={THEME_COLORS.primary}
              onPress={() => {
                setSelectedScheme(scheme);
                setShowEligibility(true);
              }}
              marginTop={16}
            >
              Check Your Eligibility
            </Button>
          </View>
        ))}

        {/* Eligibility Check Modal */}
        <Modal
          visible={showEligibility}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEligibility(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Check Eligibility for {selectedScheme?.name}
              </Text>
              
              <TextInput
                style={styles.input}
                multiline
                numberOfLines={4}
                placeholder="Enter your details to check eligibility..."
                value={userDetails}
                onChangeText={setUserDetails}
                placeholderTextColor="#666"
              />

              <XStack space="$3">
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
                  onPress={() => checkEligibility(selectedScheme)}
                  disabled={loading}
                >
                  {loading ? 'Analyzing...' : 'Check Eligibility'}
                </Button>
              </XStack>

              {analysis ? (
                <ScrollView style={styles.analysisContainer}>
                  <Text style={styles.analysisText}>{analysis}</Text>
                </ScrollView>
              ) : null}
            </View>
          </View>
        </Modal>
      </ScrollView>
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
  schemeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: THEME_COLORS.text,
  },
  schemeDescription: {
    fontSize: 14,
    color: THEME_COLORS.lightText,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: THEME_COLORS.text,
  },
  bulletPoint: {
    fontSize: 14,
    color: THEME_COLORS.text,
    marginLeft: 8,
    marginBottom: 4,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
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
}); 