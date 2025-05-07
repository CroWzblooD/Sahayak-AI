import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
  Linking,
  ActivityIndicator,
  Share,
  Alert,
  Image,
  RefreshControl,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { GoogleGenerativeAI } from "@google/generative-ai";
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_REGION = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 30,
  longitudeDelta: 30,
};
const GOOGLE_MAPS_API_KEY = 'AIzaSyCctB7XAC_6yKjVWFfVaSNW1qytfDkHt3A';
const YOUTUBE_API_KEY = 'AIzaSyBE0SIN-Vm73ntz-_i36EvAo0AmDVTNno8';
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

const THEME_COLORS = {
  primary: '#34D399',
  secondary: '#10B981',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#1F2937',
  lightText: '#6B7280',
  accent: '#3B82F6',
  warning: '#FBBF24',
  error: '#EF4444',
  success: '#10B981',
};

interface SchemeLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  type: string;
}

interface SchemeVideo {
  id: string;
  title: string;
  thumbnail: string;
}

interface SchemeDetails {
  title: string;
  category: string;
  applicationDeadline: string;
  details: string;
  benefits: string[];
  requirements: string[];
  applicationUrl: string;
  applicationSteps: string[];
  helplineNumber: string;
  department: string;
  fundingAmount: string;
  documents: {
    required: string[];
    optional: string[];
  };
  status: 'Active' | 'Upcoming' | 'Closed';
  locations: SchemeLocation[];
  faqs: Array<{ question: string; answer: string }>;
  videos: SchemeVideo[];
}

// Add component definitions before the main component
const InfoSection = ({ title, icon, content }: { title: string; icon: string; content?: string }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Ionicons name={icon as any} size={24} color={THEME_COLORS.primary} />
      <ThemedText style={styles.cardTitle}>{title}</ThemedText>
    </View>
    <ThemedText style={styles.cardContent}>{content || 'Information not available'}</ThemedText>
  </View>
);

const BenefitsList = ({ benefits }: { benefits: string[] }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Ionicons name="gift-outline" size={24} color={THEME_COLORS.primary} />
      <ThemedText style={styles.cardTitle}>Benefits</ThemedText>
    </View>
    {benefits.map((benefit, index) => (
      <View key={index} style={styles.listItem}>
        <View style={styles.bulletPoint}>
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
        <ThemedText style={styles.listText}>{benefit}</ThemedText>
      </View>
    ))}
  </View>
);

const RequirementsList = ({ requirements }: { requirements: string[] }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Ionicons name="list-outline" size={24} color={THEME_COLORS.primary} />
      <ThemedText style={styles.cardTitle}>Requirements</ThemedText>
    </View>
    {requirements.map((requirement, index) => (
      <View key={index} style={styles.listItem}>
        <View style={styles.bulletPoint}>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </View>
        <ThemedText style={styles.listText}>{requirement}</ThemedText>
      </View>
    ))}
  </View>
);

const ApplicationSteps = ({ steps }: { steps: string[] }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Ionicons name="git-branch-outline" size={24} color={THEME_COLORS.primary} />
      <ThemedText style={styles.cardTitle}>How to Apply</ThemedText>
    </View>
    {steps.map((step, index) => (
      <View key={index} style={styles.stepItem}>
        <View style={styles.stepNumber}>
          <ThemedText style={styles.stepNumberText}>{index + 1}</ThemedText>
        </View>
        <ThemedText style={styles.stepText}>{step}</ThemedText>
      </View>
    ))}
  </View>
);

const DocumentsSection = ({ 
  required, 
  optional, 
  loading 
}: { 
  required: string[]; 
  optional: string[]; 
  loading: boolean;
}) => (
  <View style={styles.tabContent}>
    {loading ? (
      <LoadingShimmer />
    ) : (
      <>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={24} color={THEME_COLORS.primary} />
            <ThemedText style={styles.cardTitle}>Required Documents</ThemedText>
          </View>
          {required.map((doc, index) => (
            <View key={index} style={styles.documentItem}>
              <Ionicons name="checkmark-circle" size={20} color={THEME_COLORS.primary} />
              <ThemedText style={styles.documentText}>{doc}</ThemedText>
            </View>
          ))}
        </View>
        {optional.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-outline" size={24} color={THEME_COLORS.primary} />
              <ThemedText style={styles.cardTitle}>Optional Documents</ThemedText>
            </View>
            {optional.map((doc, index) => (
              <View key={index} style={styles.documentItem}>
                <Ionicons name="add-circle-outline" size={20} color={THEME_COLORS.lightText} />
                <ThemedText style={styles.documentText}>{doc}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </>
    )}
  </View>
);

// Define a type for center locations
interface Center {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  distance?: number;
}

// Ensure valid coordinates for Delhi centers
const DEFAULT_DELHI_CENTERS: Center[] = [
  {
    name: "Central Delhi Office",
    address: "Connaught Place, New Delhi",
    latitude: 28.6289,
    longitude: 77.2089,
    type: "Main Center"
  },
  {
    name: "South Delhi Center",
    address: "Nehru Place, New Delhi",
    latitude: 28.5491,
    longitude: 77.2533,
    type: "Regional Office"
  },
  {
    name: "North Delhi Center",
    address: "Civil Lines, Delhi",
    latitude: 28.6814,
    longitude: 77.2226,
    type: "Regional Office"
  }
];

// Delhi region boundaries
const DELHI_REGION = {
  latitude: 28.6139,
  longitude: 77.2090,
  latitudeDelta: 0.2,
  longitudeDelta: 0.2
};

const LocationSection = ({
  userLocation,
  centers,
  loading
}: {
  userLocation: Location.LocationObject | null;
  centers: SchemeLocation[];
  loading: boolean;
}) => {
  const mapRef = useRef<MapView>(null);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Validate coordinates before rendering markers
  const validateCoordinate = (coord: number) => {
    return typeof coord === 'number' && !isNaN(coord) && coord !== 0;
  };

  const isValidLocation = (location: any) => {
    return location && 
      validateCoordinate(location.latitude) && 
      validateCoordinate(location.longitude);
  };

  // Safe center coordinates
  const validCenters = (centers || DEFAULT_DELHI_CENTERS).filter(center => 
    isValidLocation(center)
  );

  useEffect(() => {
    if (mapRef.current && mapReady && validCenters.length > 0) {
      try {
        const coordinates = [
          ...(userLocation && isValidLocation(userLocation.coords) ? [{
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude
          }] : []),
          ...validCenters.map(center => ({
            latitude: center.latitude,
            longitude: center.longitude
          }))
        ];

        if (coordinates.length > 0) {
          setTimeout(() => {
            mapRef.current?.fitToCoordinates(coordinates, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true
            });
          }, 1000);
        }
      } catch (error) {
        console.error('Map fit error:', error);
      }
    }
  }, [mapReady, validCenters, userLocation]);

  return (
    <View style={styles.locationContainer}>
      <View style={styles.mapCard}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: 28.6139,
            longitude: 77.2090,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1
          }}
          onMapReady={() => setMapReady(true)}
          showsUserLocation
          showsMyLocationButton
          showsCompass
        >
          {mapReady && userLocation && isValidLocation(userLocation.coords) && (
            <Circle
              center={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude
              }}
              radius={2000}
              fillColor="rgba(52, 211, 153, 0.2)"
              strokeColor="rgba(52, 211, 153, 0.5)"
              strokeWidth={1}
            />
          )}

          {mapReady && validCenters.map((center, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: center.latitude,
                longitude: center.longitude
              }}
              title={center.name}
              description={center.address}
              onPress={() => setSelectedCenter(center)}
            >
              <View style={styles.markerContainer}>
                <View style={[
                  styles.marker,
                  selectedCenter?.name === center.name && styles.selectedMarker
                ]}>
                  <Ionicons 
                    name="location" 
                    size={24} 
                    color={selectedCenter?.name === center.name ? 
                      THEME_COLORS.primary : 
                      '#666'
                    } 
                  />
                </View>
              </View>
            </Marker>
          ))}
        </MapView>

        {selectedCenter && (
          <View style={styles.centerInfoCard}>
            <ThemedText style={styles.centerName}>{selectedCenter.name}</ThemedText>
            <ThemedText style={styles.centerAddress}>{selectedCenter.address}</ThemedText>
            {selectedCenter.distance && (
              <ThemedText style={styles.centerDistance}>
                {selectedCenter.distance.toFixed(1)} km away
              </ThemedText>
            )}
            <View style={styles.centerActions}>
              <Pressable
                style={styles.directionButton}
                onPress={() => Linking.openURL(
                  `https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.latitude},${selectedCenter.longitude}`
                )}
              >
                <Ionicons name="navigate" size={20} color="white" />
                <ThemedText style={styles.buttonText}>Get Directions</ThemedText>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <ScrollView style={styles.centersList}>
        {validCenters.map((center, index) => (
          <Pressable
            key={index}
            style={[
              styles.centerItem,
              selectedCenter?.name === center.name && styles.selectedCenterItem
            ]}
            onPress={() => {
              setSelectedCenter(center);
              if (mapReady && mapRef.current) {
                mapRef.current.animateToRegion({
                  latitude: center.latitude,
                  longitude: center.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02
                }, 1000);
              }
            }}
          >
            <View style={styles.centerItemContent}>
              <ThemedText style={styles.centerItemName}>{center.name}</ThemedText>
              <ThemedText style={styles.centerItemAddress}>{center.address}</ThemedText>
              {center.distance && (
                <ThemedText style={styles.centerItemDistance}>
                  {center.distance.toFixed(1)} km away
                </ThemedText>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const VideosSection = ({ videos, loading }: { videos: SchemeVideo[]; loading: boolean }) => {
  const [page, setPage] = useState(1);
  const videosPerPage = 3;
  const hasMoreVideos = videos.length > page * videosPerPage;

  return (
    <View style={styles.tabContent}>
      {loading ? (
        <LoadingShimmer />
      ) : (
        <>
          {videos
            .slice(0, page * videosPerPage)
            .map((video, index) => (
              <Pressable
                key={index}
                style={styles.videoCard}
                onPress={() => Linking.openURL(`https://youtube.com/watch?v=${video.id}`)}
              >
                <Image
                  source={{ uri: video.thumbnail }}
                  style={styles.videoThumbnail}
                />
                <ThemedText style={styles.videoTitle}>{video.title}</ThemedText>
              </Pressable>
            ))}
          {hasMoreVideos && (
            <Pressable
              style={styles.loadMoreButton}
              onPress={() => setPage(prev => prev + 1)}
            >
              <ThemedText style={styles.loadMoreText}>Load More Videos</ThemedText>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
};

const LoadingShimmer = () => (
  <MotiView
    from={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{
      type: 'timing',
      duration: 1000,
      loop: true
    }}
    style={styles.shimmer}
  />
);

export default function SchemeDetailsScreen() {
  const { title, category } = useLocalSearchParams();
  const router = useRouter();
  const [scheme, setScheme] = useState<SchemeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [eligibilityStatus, setEligibilityStatus] = useState<'eligible' | 'notEligible' | 'unknown'>('unknown');
  const [savedSchemes, setSavedSchemes] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [nearestCenters, setNearestCenters] = useState<SchemeLocation[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'locations' | 'videos'>('details');
  const mapRef = useRef<MapView>(null);

  // Add loading states for different sections
  const [contentLoading, setContentLoading] = useState({
    details: true,
    videos: true,
    locations: true
  });

  const fetchSchemeData = async () => {
    try {
      setLoading(true);
      
      // Fetch scheme details from Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(generatePrompt(title as string, category as string));
      const response = result.response;
      const text = response.text();

      // Clean and parse the JSON response
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      let schemeData;
      
      try {
        schemeData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Raw Response:', text);
        throw new Error('Invalid response format from AI');
      }

      // Fetch YouTube videos with error handling
      let videos = [];
      try {
        const videosResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(title + ' scheme india')}&type=video&maxResults=3&key=${YOUTUBE_API_KEY}`
        );
        
        if (!videosResponse.ok) {
          throw new Error('YouTube API request failed');
        }
        
        const videosData = await videosResponse.json();
        videos = videosData.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url
        }));
      } catch (videoError) {
        console.error('Error fetching videos:', videoError);
        videos = []; // Continue without videos if API fails
      }

      // Set default values for missing data
      const defaultData = {
        applicationDeadline: "2024-12-31",
        details: "Details not available",
        benefits: ["Information not available"],
        requirements: ["Information not available"],
        applicationSteps: ["Visit the official website for detailed steps"],
        documents: {
          required: ["Valid ID Proof", "Address Proof"],
          optional: []
        },
        locations: DEFAULT_DELHI_CENTERS // Use default Delhi centers
      };

      // Merge with defaults and validate data
      const validatedData = {
        ...defaultData,
        ...schemeData,
        videos,
        applicationDeadline: formatDeadline(schemeData.applicationDeadline || defaultData.applicationDeadline)
      };

      // Get user location and calculate distances
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
          });
          setUserLocation(location);

          validatedData.locations = validatedData.locations.map((center: SchemeLocation) => ({
            ...center,
            distance: calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              center.latitude,
              center.longitude
            )
          })).sort((a: SchemeLocation, b: SchemeLocation) => (a.distance || 0) - (b.distance || 0));
        }
      } catch (locationError) {
        console.error('Location Error:', locationError);
        // Still show Delhi centers even if location access fails
        setUserLocation({
          coords: {
            latitude: DELHI_REGION.latitude,
            longitude: DELHI_REGION.longitude,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        });
      }

      setScheme(validatedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setScheme({
        title: title as string,
        category: category as string,
        applicationDeadline: formatDeadline(new Date().toISOString()),
        details: "Unable to load scheme details. Please try again later.",
        benefits: ["Information temporarily unavailable"],
        requirements: ["Please check the official website"],
        applicationSteps: ["Visit the official website for application steps"],
        documents: {
          required: ["Valid ID Proof"],
          optional: []
        },
        applicationUrl: "",
        helplineNumber: "",
        department: "",
        fundingAmount: "",
        status: "Active" as const,
        locations: [],
        videos: [],
        faqs: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Load user profile and saved schemes
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const profileData = await AsyncStorage.getItem('onboardingResponses');
        if (profileData) {
          setUserProfile(JSON.parse(profileData));
        }
        const saved = await AsyncStorage.getItem('savedSchemes');
        if (saved) {
          setSavedSchemes(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  // Get user location and nearest centers
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location access is needed to show nearby centers');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);

        if (scheme?.locations) {
          // Calculate distances and sort centers
          const centersWithDistance = scheme.locations.map(center => ({
            ...center,
            distance: calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              center.latitude,
              center.longitude
            )
          })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

          setNearestCenters(centersWithDistance.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocationData();
  }, [scheme?.locations]);

  // Add the effect to fetch scheme data
  useEffect(() => {
    if (title && category) {
      fetchSchemeData();
    }
  }, [title, category]);

  // Improved generatePrompt function
  const generatePrompt = (title: string, category: string) => {
    return `Generate a detailed JSON object about the Indian government scheme "${title}" in the category "${category}". Respond ONLY with a valid JSON object, no additional text. Format:
    {
      "title": "${title}",
      "category": "${category}",
      "applicationDeadline": "2025-12-31",
      "details": "Brief description of the scheme",
      "benefits": ["benefit 1", "benefit 2"],
      "requirements": ["requirement 1", "requirement 2"],
      "applicationSteps": ["step 1", "step 2"],
      "documents": {
        "required": ["document 1", "document 2"],
        "optional": ["document 1", "document 2"]
      },
      "applicationUrl": "https://example.gov.in",
      "helplineNumber": "1800-XXX-XXXX",
      "department": "Department name",
      "fundingAmount": "Funding details",
      "status": "Active",
      "locations": [
        {
          "name": "Center name",
          "address": "Full address",
          "latitude": 28.6139,
          "longitude": 77.2090
        }
      ]
    }`;
  };

  // Helper functions
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // Haversine formula implementation
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Deadline not specified';
    }
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const checkEligibility = (scheme: SchemeDetails, profile: any) => {
    try {
      let isEligible = true;

      // Check state eligibility
      if (scheme.locations && scheme.locations.length > 0) {
        isEligible = isEligible && scheme.locations.some(location => location.latitude === profile.location?.latitude && location.longitude === profile.location?.longitude);
      }

      // Check income eligibility if profile has financial info
      if (profile.financial?.monthlyIncome && scheme.fundingAmount) {
        const monthlyIncome = parseInt(profile.financial.monthlyIncome);
        // Add your income eligibility logic here
      }

      // Check category eligibility
      if (scheme.benefits && scheme.benefits.length > 0) {
        isEligible = isEligible && scheme.benefits.includes(profile.financial?.category);
      }

      setEligibilityStatus(isEligible ? 'eligible' : 'notEligible');
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setEligibilityStatus('unknown');
    }
  };

  const handleShare = async () => {
    if (!scheme) return;
    
    try {
      const message = `
${scheme.title}

Category: ${scheme.category}
Last Date to Apply: ${scheme.applicationDeadline}

${scheme.details}

Apply now: ${scheme.applicationUrl}
Helpline: ${scheme.helplineNumber}

#GovernmentScheme #India
      `;

      await Share.share({
        message,
        title: scheme.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share scheme details');
    }
  };

  const toggleSaveScheme = async () => {
    if (!scheme) return;

    try {
      const newSavedSchemes = savedSchemes.includes(scheme.title)
        ? savedSchemes.filter(s => s !== scheme.title)
        : [...savedSchemes, scheme.title];

      await AsyncStorage.setItem('savedSchemes', JSON.stringify(newSavedSchemes));
      setSavedSchemes(newSavedSchemes);

      Alert.alert(
        savedSchemes.includes(scheme.title) ? 'Scheme Removed' : 'Scheme Saved',
        savedSchemes.includes(scheme.title)
          ? 'The scheme has been removed from your saved list'
          : 'The scheme has been saved to your list'
      );
    } catch (error) {
      console.error('Error saving scheme:', error);
      Alert.alert('Error', 'Failed to save scheme');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME_COLORS.primary} />
        <ThemedText style={styles.loadingText}>Loading scheme details...</ThemedText>
      </View>
    );
  }

  if (!scheme) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={THEME_COLORS.primary} />
        <ThemedText style={styles.errorText}>Failed to load scheme details</ThemedText>
        <Pressable style={styles.retryButton} onPress={() => router.back()}>
          <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Section - Always visible */}
        <LinearGradient
          colors={[THEME_COLORS.primary, THEME_COLORS.secondary]}
          style={styles.header}
        >
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <View style={styles.headerContent}>
            <MaterialCommunityIcons name="file-document-outline" size={40} color="white" />
            <ThemedText style={styles.title} numberOfLines={2}>
              {title || 'Loading...'}
            </ThemedText>
            <ThemedText style={styles.category}>{category}</ThemedText>
          </View>
        </LinearGradient>

        {/* Tab Navigation - Sticky */}
        <View style={styles.tabContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
          >
            {['Details', 'Documents', 'Location', 'Videos'].map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tab, activeTab === tab.toLowerCase() && styles.activeTab]}
                onPress={() => setActiveTab(tab.toLowerCase() as any)}
              >
                <ThemedText style={[styles.tabText, activeTab === tab.toLowerCase() && styles.activeTabText]}>
                  {tab}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Main Content Area with Pull to Refresh */}
        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                setLoading(true);
                if (title && category) {
                  fetchSchemeData();
                }
              }}
              colors={[THEME_COLORS.primary]}
            />
          }
        >
          <View style={styles.content}>
            {activeTab === 'details' && (
              <MotiView style={styles.tabContent}>
                {/* Deadline Card */}
                <View style={styles.card}>
                  {loading ? (
                    <LoadingShimmer />
                  ) : (
                    <>
                      <View style={styles.cardHeader}>
                        <Ionicons name="time-outline" size={24} color={THEME_COLORS.primary} />
                        <ThemedText style={styles.cardTitle}>Last Date to Apply</ThemedText>
                      </View>
                      <ThemedText style={styles.deadlineText}>
                        {scheme?.applicationDeadline || 'Date not specified'}
                      </ThemedText>
                    </>
                  )}
                </View>

                {/* Details Sections */}
                {loading ? (
                  <LoadingShimmer />
                ) : (
                  <>
                    <InfoSection
                      title="About the Scheme"
                      icon="information-circle-outline"
                      content={scheme?.details}
                    />
                    <BenefitsList benefits={scheme?.benefits || []} />
                    <RequirementsList requirements={scheme?.requirements || []} />
                    <ApplicationSteps steps={scheme?.applicationSteps || []} />
                  </>
                )}
              </MotiView>
            )}

            {activeTab === 'documents' && (
              <DocumentsSection
                required={scheme?.documents.required || []}
                optional={scheme?.documents.optional || []}
                loading={loading}
              />
            )}

            {activeTab === 'locations' && (
              <LocationSection
                userLocation={userLocation}
                centers={nearestCenters}
                loading={loading}
              />
            )}

            {activeTab === 'videos' && (
              <VideosSection
                videos={scheme?.videos || []}
                loading={loading}
              />
            )}
          </View>
        </ScrollView>

        {/* Bottom Action Bar - Fixed */}
        <View style={styles.bottomBar}>
          <Pressable 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={24} color={THEME_COLORS.primary} />
          </Pressable>
          <Pressable
            style={[
              styles.applyButton,
              !scheme?.applicationUrl && styles.disabledButton
            ]}
            onPress={() => scheme?.applicationUrl && Linking.openURL(scheme.applicationUrl)}
            disabled={!scheme?.applicationUrl}
          >
            <ThemedText style={styles.applyButtonText}>
              {loading ? 'Loading...' : 'Apply Now'}
            </ThemedText>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  category: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  tabContainer: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabScroll: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: THEME_COLORS.primary,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Space for bottom bar
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shimmer: {
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 8,
  },
  tabContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    color: THEME_COLORS.text,
  },
  cardContent: {
    fontSize: 16,
    color: THEME_COLORS.lightText,
    lineHeight: 24,
  },
  bulletPoint: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: THEME_COLORS.text,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: THEME_COLORS.text,
    lineHeight: 24,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentText: {
    flex: 1,
    fontSize: 16,
    color: THEME_COLORS.text,
  },
  mapCard: {
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
  },
  markerTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: THEME_COLORS.primary,
    transform: [{ rotate: '180deg' }],
  },
  selectedCenterCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  centerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  centersListContainer: {
    marginTop: 16,
  },
  centersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
    marginBottom: 12,
  },
  centerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedCenterItem: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  centerInfo: {
    flex: 1,
  },
  centerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
  },
  centerAddress: {
    fontSize: 14,
    color: THEME_COLORS.lightText,
  },
  centerDistance: {
    fontSize: 14,
    color: THEME_COLORS.lightText,
  },
  applyAtCenterButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: THEME_COLORS.primary,
  },
  applyAtCenterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  videoThumbnail: {
    width: 100,
    height: 75,
    borderRadius: 8,
    marginRight: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: THEME_COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: THEME_COLORS.text,
    textAlign: 'center',
    marginTop: 12,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 16,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  locationContainer: {
    flex: 1,
    padding: 16,
  },
  mapWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  userMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME_COLORS.primary,
    borderWidth: 2,
    borderColor: 'white',
  },
  userMarkerRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    opacity: 0.3,
  },
  centersList: {
    flex: 1,
  },
  centerItemContent: {
    flex: 1,
  },
  centerItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  centerItemAddress: {
    fontSize: 14,
    color: THEME_COLORS.lightText,
    marginBottom: 4,
  },
  centerItemDistance: {
    fontSize: 12,
    color: THEME_COLORS.primary,
  },
  loadMoreButton: {
    padding: 12,
    backgroundColor: THEME_COLORS.primary + '20',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  loadMoreText: {
    color: THEME_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabText: {
    fontSize: 14,
    color: THEME_COLORS.lightText,
  },
  activeTabText: {
    color: THEME_COLORS.primary,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  deadlineText: {
    fontSize: 16,
    color: THEME_COLORS.text,
    marginTop: 8,
  },
  selectedMarker: {
    borderColor: THEME_COLORS.primary,
    backgroundColor: THEME_COLORS.primary + '20',
  },
  centerInfoCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  directionButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: THEME_COLORS.primary,
    marginRight: 8,
  },
}); 