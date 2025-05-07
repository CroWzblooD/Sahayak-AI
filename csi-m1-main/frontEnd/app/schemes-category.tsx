import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Animated, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { THEME_COLORS } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { aiService } from '@/services/aiService';

const { width } = Dimensions.get('window');

interface ApplicationStep {
  title: string;
  description: string;
  timeRequired: string;
  requirements?: string[];
}

interface ApplicationGuide {
  steps: ApplicationStep[];
}

interface DocumentGuide {
  documents: Array<{
    name: string;
    whereToObtain: string;
    validity: string;
    formatRequirements: string[];
    onlineLink?: string;
    tips: string[];
  }>;
}

interface Scheme {
  name: string;
  department: string;
  description: string;
  lastDate: string;
  fundingAmount: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  applicationSteps: string[];
  contactInfo: {
    website: string;
    helpline: string;
  };
}

interface SchemeCardProps {
  scheme: Scheme;
  index: number;
  fadeAnim: Animated.Value;
}

interface GuideModalProps {
  visible: boolean;
  onClose: () => void;
  scheme: Scheme;
}

interface LocationData {
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
}

export default function SchemeCategoryScreen() {
  const { category, title, schemes: schemesParam } = useLocalSearchParams();
  const schemes = JSON.parse(schemesParam as string);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[THEME_COLORS.primary + '15', '#fff']}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={THEME_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        <ScrollView style={styles.schemesList} showsVerticalScrollIndicator={false}>
          {schemes.map((scheme: Scheme, index: number) => (
            <SchemeCard
              key={index}
              scheme={scheme}
              index={index}
              fadeAnim={fadeAnim}
            />
          ))}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const SchemeCard = ({ scheme, index, fadeAnim }: SchemeCardProps) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <Animated.View
      style={[
        styles.schemeCard,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        },
      ]}
    >
      <View style={styles.cardContent}>
        {/* Scheme Header */}
        <View style={styles.schemeHeader}>
          <View style={styles.schemeIconContainer}>
            <MaterialIcons name="assignment" size={24} color={THEME_COLORS.primary} />
          </View>
          <View style={styles.schemeTitleContainer}>
            <Text numberOfLines={2} style={styles.schemeName}>
              {scheme.name}
            </Text>
            <Text numberOfLines={1} style={styles.schemeDepartment}>
              {scheme.department}
            </Text>
          </View>
        </View>

        {/* Scheme Description */}
        <Text numberOfLines={2} style={styles.schemeDescription}>
          {scheme.description}
        </Text>

        {/* Quick Info */}
        <View style={styles.quickInfo}>
          <View style={styles.infoItem}>
            <MaterialIcons name="event" size={16} color="#dc2626" />
            <Text numberOfLines={1} style={styles.infoText}>
              Last Date: {scheme.lastDate}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="payments" size={16} color="#059669" />
            <Text numberOfLines={1} style={styles.infoText}>
              {scheme.fundingAmount}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => Linking.openURL(scheme.contactInfo.website)}
          >
            <LinearGradient
              colors={[THEME_COLORS.primary, `${THEME_COLORS.primary}dd`]}
              style={styles.buttonGradient}
            >
              <MaterialIcons name="launch" size={20} color="#fff" />
              <Text style={styles.applyButtonText}>Apply Online</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guideButton}
            onPress={() => setShowGuide(true)}
          >
            <View style={styles.guideButtonContent}>
              <MaterialIcons name="map" size={20} color={THEME_COLORS.primary} />
              <Text style={styles.guideButtonText}>View Guide</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <GuideModal 
        visible={showGuide}
        onClose={() => setShowGuide(false)}
        scheme={scheme}
      />
    </Animated.View>
  );
};

// Helper functions for generating content
const generateDetailsForCriteria = (criteria: string) => {
  return {
    description: `Detailed explanation for ${criteria}`,
    requirements: [
      "Must be a resident of India",
      "Should have valid documentation",
      "Must meet specific category requirements"
    ],
    documents: ["Aadhaar Card", "Income Certificate", "Category Certificate"]
  };
};

const generateDocumentGuidelines = (doc: string) => {
  return {
    format: "PDF/JPG",
    maxSize: "2MB",
    validity: "Must be recent (within 6 months)",
    where: "Available at local government offices"
  };
};

const generateApplicationStepDetails = (step: string) => {
  return {
    timeRequired: "15-20 minutes",
    important: "Keep all documents ready before starting",
    tips: ["Use good quality scans", "Fill all fields carefully", "Save draft frequently"]
  };
};

const generateNearbyLocations = (scheme: Scheme) => {
  return [
    {
      name: "District Agriculture Office",
      address: "Civil Lines, Near District Court",
      distance: "2.5 km",
      contact: "1800-XXX-XXX"
    },
    {
      name: "Krishi Bhavan",
      address: "Sector 10, City Center",
      distance: "3.8 km",
      contact: "1800-XXX-XXX"
    }
  ];
};

const generateTrackingSteps = (scheme: Scheme) => {
  return [
    {
      stage: "Application Submission",
      duration: "Instant",
      status: "Get application reference number"
    },
    {
      stage: "Document Verification",
      duration: "3-5 working days",
      status: "Track through SMS/Portal"
    },
    {
      stage: "Final Approval",
      duration: "7-10 working days",
      status: "Receive confirmation"
    }
  ];
};

// Default functions for fallbacks
const defaultQuestions = (scheme: Scheme) => {
  return [
    {
      question: "Are you a resident of India?",
      options: ["Yes", "No"],
      weights: [1, 0],
      explanation: "Most schemes require Indian residency"
    },
    {
      question: "Do you have all required documents?",
      options: ["Yes", "No", "Some"],
      weights: [1, 0, 0.5],
      explanation: "Documents are essential for application processing"
    }
  ];
};

const defaultSteps = (scheme: Scheme) => {
  return {
    steps: scheme.applicationSteps.map(step => ({
      title: step,
      description: "Follow official guidelines",
      timeRequired: "Varies",
      requirements: []
    }))
  };
};

const generateEligibilityQuestions = async (scheme: Scheme) => {
  const prompt = `Generate detailed eligibility questions for ${scheme.name} scheme.
  Consider these criteria: ${scheme.eligibilityCriteria.join(', ')}
  Format: Return JSON array of questions with options and weights:
  [
    {
      "question": "detailed question",
      "options": ["option1", "option2", "option3"],
      "weights": [1, 0, 0.5],
      "explanation": "why this matters"
    }
  ]`;

  try {
    const response = await aiService.getTextResponse(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating questions:', error);
    return defaultQuestions(scheme);
  }
};

const generateDocumentGuide = async (scheme: Scheme) => {
  const prompt = `Generate a detailed document preparation guide for ${scheme.name} scheme.
  Required documents: ${scheme.requiredDocuments.join(', ')}
  
  Return only a JSON object in this exact format without any markdown:
  {
    "documents": [
      {
        "name": "document name",
        "description": "detailed description",
        "whereToObtain": "location details",
        "validity": "validity period",
        "format": ["format requirement 1", "format requirement 2"],
        "requirements": ["requirement 1", "requirement 2"],
        "processingTime": "estimated time",
        "fees": "if any",
        "onlineLink": "URL if available",
        "offlineProcess": "step by step guide",
        "helplineNumber": "contact number"
      }
    ]
  }`;

  try {
    const response = await aiService.getTextResponse(prompt);
    const cleanedResponse = response
      .replace(/```json\n?|\n?```/g, '')
      .replace(/\*/g, '')
      .trim();
    
    const parsedGuide = JSON.parse(cleanedResponse);
    return parsedGuide;
  } catch (error) {
    console.error('Error loading document guide:', error);
    // Fallback with basic structure
    return {
      documents: scheme.requiredDocuments.map(doc => ({
        name: doc,
        description: `Official ${doc} for verification`,
        whereToObtain: "Local government office",
        validity: "Please verify at center",
        format: ["Original copy", "Self-attested photocopy"],
        requirements: ["Must be clearly legible", "Recent document"],
        processingTime: "7-14 working days",
        fees: "As applicable",
        onlineLink: scheme.contactInfo.website,
        offlineProcess: "Visit nearest center with required documents",
        helplineNumber: scheme.contactInfo.helpline
      }))
    };
  }
};

const generateApplicationSteps = async (scheme: Scheme) => {
  const prompt = `Generate detailed application process for ${scheme.name} scheme.
  Current steps: ${scheme.applicationSteps.join(', ')}
  Include:
  - Pre-application preparation
  - Step-by-step guide
  - Time required for each step
  - Important notes
  - Common errors to avoid
  Return in JSON format.`;

  try {
    const response = await aiService.getTextResponse(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating steps:', error);
    return defaultSteps(scheme);
  }
};

const GuideModal = ({ visible, onClose, scheme }: GuideModalProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [documentGuide, setDocumentGuide] = useState<null | { documents: any[] }>(null);
  const [applicationGuide, setApplicationGuide] = useState<ApplicationGuide>({ steps: [] });
  const [nearbyLocations, setNearbyLocations] = useState<LocationData[]>([]);

  // Remove eligibility, keep only 3 steps
  const steps = [
    {
      id: 'documents',
      title: "Document Guide",
      icon: "description" as const,
      color: "#F59E0B",
    },
    {
      id: 'application',
      title: "Apply Now",
      icon: "edit" as const,
      color: "#3B82F6",
    },
    {
      id: 'locations',
      title: "Help Centers",
      icon: "location-on" as const,
      color: "#8B5CF6",
    }
  ];

  useEffect(() => {
    if (activeStep === 0) {
      loadDocumentGuide();
    } else if (activeStep === 1) {
      loadApplicationGuide();
    } else if (activeStep === 2) {
      loadNearbyLocations();
    }
  }, [activeStep]);

  const loadDocumentGuide = async () => {
    setLoading(true);
    try {
      const prompt = `Create a document guide for ${scheme.name} scheme with these documents: ${scheme.requiredDocuments.join(', ')}. Return ONLY a JSON object without any markdown formatting or additional text, in this exact format:
{
  "documents": [
    {
      "name": "document name",
      "description": "description",
      "whereToObtain": "location",
      "validity": "period",
      "format": ["requirement1", "requirement2"],
      "requirements": ["point1", "point2"],
      "processingTime": "time",
      "fees": "amount",
      "onlineLink": "url",
      "helplineNumber": "number"
    }
  ]
}`;

      const response = await aiService.getTextResponse(prompt);
      // Clean the response
      const cleanedResponse = response
        .replace(/```json\n?|\n?```/g, '')  // Remove code blocks
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/\*/g, '')  // Remove asterisks
        .trim();

      // Validate JSON structure before parsing
      if (!cleanedResponse.startsWith('{') || !cleanedResponse.endsWith('}')) {
        throw new Error('Invalid JSON structure');
      }

      const parsedGuide = JSON.parse(cleanedResponse);
      
      // Validate parsed data structure
      if (!parsedGuide.documents || !Array.isArray(parsedGuide.documents)) {
        throw new Error('Invalid document guide format');
      }

      setDocumentGuide(parsedGuide);
    } catch (error) {
      console.error('Error loading document guide:', error);
      // Fallback content
      setDocumentGuide({
        documents: scheme.requiredDocuments.map((doc: string) => ({
          name: doc,
          description: `Required document for ${scheme.name}`,
          whereToObtain: "Local government office",
          validity: "Please verify at center",
          format: ["Original copy", "Self-attested photocopy"],
          requirements: ["Must be clearly legible", "Recent document"],
          processingTime: "7-14 working days",
          fees: "As applicable",
          onlineLink: scheme.contactInfo.website,
          helplineNumber: scheme.contactInfo.helpline
        }))
      });
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationGuide = async () => {
    setLoading(true);
    try {
      const prompt = `Create application steps for ${scheme.name} scheme. Return ONLY a JSON object without any markdown formatting or additional text, in this exact format:
{
  "steps": [
    {
      "title": "step title",
      "description": "details",
      "timeRequired": "duration",
      "requirements": ["req1", "req2"]
    }
  ]
}`;

      const response = await aiService.getTextResponse(prompt);
      const cleanedResponse = response
        .replace(/```json\n?|\n?```/g, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/\*/g, '')
        .trim();

      if (!cleanedResponse.startsWith('{') || !cleanedResponse.endsWith('}')) {
        throw new Error('Invalid JSON structure');
      }

      const parsedGuide = JSON.parse(cleanedResponse);
      setApplicationGuide(parsedGuide);
    } catch (error) {
      console.error('Error loading application guide:', error);
      setApplicationGuide({
        steps: scheme.applicationSteps.map((step: string) => ({
          title: step,
          description: "Contact center for detailed information",
          timeRequired: "Processing time varies",
          requirements: scheme.requiredDocuments
        }))
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyLocations = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({});
      const prompt = `Generate nearby centers for ${scheme.name} scheme. Return ONLY a JSON array without any markdown formatting or additional text, in this format:
[
  {
    "name": "center name",
    "address": "full address",
    "distance": "approximate distance",
    "contact": "phone number",
    "services": ["service1", "service2"],
    "timings": "working hours",
    "vicinity": "area",
    "geometry": {
      "location": {
        "lat": 12.345,
        "lng": 67.890
      }
    }
  }
]`;

      const response = await aiService.getTextResponse(prompt);
      const cleanedResponse = response
        .replace(/```json\n?|\n?```/g, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/\*/g, '')
        .trim();

      if (!cleanedResponse.startsWith('[') || !cleanedResponse.endsWith(']')) {
        throw new Error('Invalid JSON structure');
      }

      const centers = JSON.parse(cleanedResponse);
      setNearbyLocations(centers);
    } catch (error) {
      console.error('Error loading locations:', error);
      setNearbyLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      );
    }

    switch (activeStep) {
      case 0:
        return renderDocumentGuide();
      case 1:
        return (
          <ScrollView style={styles.stepContent}>
            <Text style={styles.stepTitle}>Application Process</Text>
            <View style={styles.applicationContainer}>
              <View style={styles.timelineContainer}>
                {applicationGuide.steps.map((step, index) => (
                  <View key={index} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={styles.timelineDot} />
                      {index < applicationGuide.steps.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>
                    
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>{step.title}</Text>
                      <Text style={styles.timelineDescription}>{step.description}</Text>
                      
                      <View style={styles.timelineDetails}>
                        <View style={styles.timelineDetail}>
                          <MaterialIcons name="schedule" size={16} color="#666" />
                          <Text style={styles.detailText}>
                            Time: {step.timeRequired}
                          </Text>
                        </View>
                        
                        {step.requirements && (
                          <View style={styles.requirementItem}>
                            {step.requirements.map((req: string, idx: number) => (
                              <View key={idx} style={styles.requirementItem}>
                                <MaterialIcons name="check" size={16} color="#059669" />
                                <Text style={styles.requirementText}>{req}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        );
      case 2:
        return renderNearbyLocations();
      default:
        return null;
    }
  };

  const renderDocumentGuide = () => (
    <ScrollView style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Document Preparation Guide</Text>
      {documentGuide?.documents.map((doc, index) => (
        <View key={index} style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <MaterialIcons name="description" size={24} color={THEME_COLORS.primary} />
            <Text style={styles.documentTitle}>{doc.name}</Text>
          </View>

          <Text style={styles.documentDescription}>{doc.description}</Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <Text style={styles.infoText}>{doc.whereToObtain}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={20} color="#666" />
              <Text style={styles.infoText}>Validity: {doc.validity}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="schedule" size={20} color="#666" />
              <Text style={styles.infoText}>Processing: {doc.processingTime}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="payment" size={20} color="#666" />
              <Text style={styles.infoText}>Fees: {doc.fees}</Text>
            </View>
          </View>

          <View style={styles.requirementsSection}>
            <Text style={styles.subTitle}>Format Requirements:</Text>
            {doc.format.map((fmt: string, idx: number) => (
              <View key={idx} style={styles.requirementItem}>
                <MaterialIcons name="check-circle" size={16} color="#059669" />
                <Text style={styles.requirementText}>{fmt}</Text>
              </View>
            ))}
          </View>

          <View style={styles.requirementsSection}>
            <Text style={styles.subTitle}>Important Requirements:</Text>
            {doc.requirements.map((req: string, idx: number) => (
              <View key={idx} style={styles.requirementItem}>
                <MaterialIcons name="info" size={16} color="#3B82F6" />
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}
          </View>

          <View style={styles.processSection}>
            <Text style={styles.subTitle}>Offline Process:</Text>
            <Text style={styles.processText}>{doc.offlineProcess}</Text>
          </View>

          <View style={styles.actionButtons}>
            {doc.onlineLink && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => Linking.openURL(doc.onlineLink)}
              >
                <MaterialIcons name="launch" size={20} color="#fff" />
                <Text style={styles.buttonText}>Apply Online</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.helpButton]}
              onPress={() => Linking.openURL(`tel:${doc.helplineNumber}`)}
            >
              <MaterialIcons name="help" size={20} color="#fff" />
              <Text style={styles.buttonText}>Get Help</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderNearbyLocations = () => {
    return (
      <View style={styles.mapContainer}>
        {nearbyLocations.map((location, index) => (
          <TouchableOpacity
            key={index}
            style={styles.locationCard}
            onPress={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${location.geometry.location.lat},${location.geometry.location.lng}`;
              Linking.openURL(url);
            }}
          >
            <Text style={styles.locationName}>{location.name}</Text>
            <Text style={styles.locationAddress}>{location.vicinity}</Text>
            <View style={styles.locationDistance}>
              <MaterialIcons name="directions" size={16} color={THEME_COLORS.primary} />
              <Text style={styles.distanceText}>Get Directions</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Application Guide</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stepsNavContainer}
          >
            {steps.map((step, index) => (
              <TouchableOpacity
                key={step.id}
                onPress={() => setActiveStep(index)}
                style={[styles.stepTab, activeStep === index && styles.activeStepTab]}
              >
                <MaterialIcons name={step.icon} size={24} color={step.color} />
                <Text style={styles.stepTabText}>{step.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: THEME_COLORS.text,
  },
  schemesList: {
    padding: 16,
  },
  schemeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  schemeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  schemeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${THEME_COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  schemeTitleContainer: {
    flex: 1,
  },
  schemeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  schemeDepartment: {
    fontSize: 13,
    color: '#666',
  },
  schemeDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#4b5563',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  applyButton: {
    flex: 1,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  guideButton: {
    flex: 1,
  },
  guideButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: `${THEME_COLORS.primary}10`,
    gap: 8,
  },
  guideButtonText: {
    color: THEME_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: THEME_COLORS.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepsNavContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  stepTab: {
    alignItems: 'center',
    opacity: 0.6,
  },
  activeStepTab: {
    opacity: 1,
  },
  stepTabText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME_COLORS.text,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  eligibilityChecker: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
  },
  checkerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  criteriaItem: {
    marginBottom: 16,
  },
  criteriaQuestion: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 8,
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  answerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  selectedYes: {
    backgroundColor: '#dcfce7',
  },
  selectedNo: {
    backgroundColor: '#fee2e2',
  },
  answerText: {
    fontSize: 14,
    color: '#4b5563',
  },
  selectedAnswerText: {
    fontWeight: '600',
  },
  checkButton: {
    backgroundColor: THEME_COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    padding: 16,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  eligibleText: {
    color: '#059669',
  },
  notEligibleText: {
    color: '#dc2626',
  },
  applyNowButton: {
    backgroundColor: THEME_COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  applyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  documentsSection: {
    marginBottom: 20,
  },
  stepContent: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 16,
  },
  criteriaContainer: {
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  documentNote: {
    fontSize: 13,
    color: '#666',
  },
  applicationStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  stepInfo: {
    flex: 1,
  },
  stepText: {
    fontSize: 16,
    color: '#4b5563',
  },
  trackingSteps: {
    marginBottom: 16,
  },
  trackingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trackingInfo: {
    flex: 1,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  trackingStatus: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  questionContainer: {
    marginBottom: 16,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#dcfce7',
  },
  optionText: {
    fontSize: 14,
    color: '#4b5563',
  },
  analyzeButton: {
    backgroundColor: THEME_COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scoreText: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 8,
  },
  detailsContainer: {
    marginTop: 16,
  },
  detailItem: {
    marginBottom: 8,
  },
  detailQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  detailAnswer: {
    fontSize: 14,
    color: '#4b5563',
  },
  detailExplanation: {
    fontSize: 14,
    color: '#666',
  },
  mapContainer: {
    flex: 1,
    height: 400,
  },
  map: {
    flex: 1,
  },
  locationsList: {
    padding: 16,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginRight: 16,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
  },
  locationDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  formatContainer: {
    marginBottom: 12,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  formatText: {
    fontSize: 14,
    color: '#4b5563',
  },
  tipsContainer: {
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#4b5563',
  },
  applicationContainer: {
    padding: 16,
  },
  timelineContainer: {
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineLeft: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
    marginBottom: 4,
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#f3f4f6',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#4b5563',
  },
  timelineDetails: {
    marginBottom: 12,
  },
  timelineDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  documentDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementsSection: {
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  processSection: {
    marginBottom: 16,
  },
  processText: {
    fontSize: 14,
    color: '#4b5563',
  },
  actionButton: {
    flex: 1,
    backgroundColor: THEME_COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  helpButton: {
    backgroundColor: THEME_COLORS.primary,
  },
}); 