import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Location from 'expo-location';
import * as React from "react";
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Callout, Circle, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryMarkers } from '../../components/CategoryMarker';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = 160;
const CARD_WIDTH = width * 0.9;
const SPACING_FOR_CARD_INSET = width * 0.1 - 10;

// Define interface for marker data
interface ServiceCenter {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
  address: string;
  rating: number;
  reviews: number;
  distance?: string;
  categories: string[];
  services: string[];
  contact: string;
  openTime: string;
  image: string;
  documentTypes: string[];
  availableSchemes: string[];
}

// Replace initialMarkers with 20 unique, well-distributed locations across Delhi
const initialMarkers: ServiceCenter[] = [
  {
    id: '1',
    coordinate: { latitude: 28.7041, longitude: 77.1025 }, // North Delhi
    title: 'North Delhi Service Center',
    description: 'Comprehensive government services for North Delhi residents',
    address: 'Model Town, North Delhi',
    rating: 4.6,
    reviews: 198,
    distance: '5.2 km',
    categories: ['Document Services'],
    services: ['Property Tax Payment', 'Water Bill Payment'],
    contact: '+91 98765 43215',
    openTime: '9:00 AM - 6:00 PM',
    image: '🏢',
    documentTypes: ['Property Documents', 'Utility Bills'],
    availableSchemes: ['PM Awas Yojana'],
  },
  {
    id: '2',
    coordinate: { latitude: 28.5276, longitude: 77.1384 }, // South Delhi
    title: 'South Delhi Digital Hub',
    description: 'Modern digital services center in South Delhi',
    address: 'Saket, South Delhi',
    rating: 4.9,
    reviews: 312,
    distance: '6.8 km',
    categories: ['Digital Services'],
    services: ['Online Course Registration'],
    contact: '+91 98765 43216',
    openTime: '10:00 AM - 7:00 PM',
    image: '💻',
    documentTypes: ['Student ID'],
    availableSchemes: ['Digital India'],
  },
  {
    id: '3',
    coordinate: { latitude: 28.6692, longitude: 77.4538 }, // West Delhi
    title: 'West Delhi Service Hub',
    description: 'Comprehensive service center for West Delhi residents',
    address: 'Rajouri Garden, West Delhi',
    rating: 4.7,
    reviews: 234,
    distance: '4.8 km',
    categories: ['Health Services'],
    services: ['Business Registration'],
    contact: '+91 98765 43218',
    openTime: '9:00 AM - 6:00 PM',
    image: '🏢',
    documentTypes: ['Business Documents'],
    availableSchemes: ['PM Mudra Yojana'],
  },
  {
    id: '4',
    coordinate: { latitude: 28.6517, longitude: 77.2219 }, // Old Delhi
    title: 'Old Delhi Service Center',
    description: 'Traditional services in Old Delhi',
    address: 'Chandni Chowk, Old Delhi',
    rating: 4.5,
    reviews: 210,
    distance: '3.1 km',
    categories: ['Document Services'],
    services: ['Aadhaar Enrollment'],
    contact: '+91 98765 43240',
    openTime: '9:00 AM - 5:00 PM',
    image: '🏢',
    documentTypes: ['Aadhaar Card'],
    availableSchemes: ['PM Kisan'],
  },
  {
    id: '5',
    coordinate: { latitude: 28.6129, longitude: 77.2295 }, // Lodhi Road
    title: 'Lodhi Road Digital Center',
    description: 'State-of-the-art digital services center',
    address: 'Lodhi Road, New Delhi',
    rating: 4.9,
    reviews: 345,
    distance: '1.8 km',
    categories: ['Digital Services'],
    services: ['Smart Card Services'],
    contact: '+91 98765 43220',
    openTime: '10:00 AM - 7:00 PM',
    image: '💻',
    documentTypes: ['Aadhaar Card'],
    availableSchemes: ['Digital India'],
  },
  {
    id: '6',
    coordinate: { latitude: 28.6139, longitude: 77.2090 }, // Connaught Place
    title: 'Central Delhi Service Center',
    description: 'Heritage area service center with modern facilities',
    address: 'Connaught Place, Central Delhi',
    rating: 4.8,
    reviews: 287,
    distance: '2.3 km',
    categories: ['Business Services'],
    services: ['Heritage Site Pass', 'Tour Guide Registration'],
    contact: '+91 98765 43219',
    openTime: '9:30 AM - 6:30 PM',
    image: '🏛️',
    documentTypes: ['ID Proof', 'Address Proof'],
    availableSchemes: ['Swadesh Darshan'],
  },
  {
    id: '7',
    coordinate: { latitude: 28.7045, longitude: 77.1855 }, // Rohini
    title: 'Rohini Service Center',
    description: 'Comprehensive services for Rohini residents',
    address: 'Rohini, North West Delhi',
    rating: 4.5,
    reviews: 198,
    distance: '5.5 km',
    categories: ['Education Services'],
    services: ['Course Registration'],
    contact: '+91 98765 43221',
    openTime: '9:00 AM - 6:00 PM',
    image: '🎓',
    documentTypes: ['Educational Certificates'],
    availableSchemes: ['Skill India'],
  },
  {
    id: '8',
    coordinate: { latitude: 28.5355, longitude: 77.3910 }, // Noida border
    title: 'Noida Border Service Center',
    description: 'Services for border area residents',
    address: 'Noida Border, East Delhi',
    rating: 4.6,
    reviews: 256,
    distance: '4.5 km',
    categories: ['Business Services'],
    services: ['Business Registration'],
    contact: '+91 98765 43229',
    openTime: '9:00 AM - 6:00 PM',
    image: '💼',
    documentTypes: ['Business Plan'],
    availableSchemes: ['Startup India'],
  },
  {
    id: '9',
    coordinate: { latitude: 28.6096, longitude: 77.0417 }, // Dwarka
    title: 'Dwarka Service Center',
    description: 'Modern service center for Dwarka',
    address: 'Dwarka, South West Delhi',
    rating: 4.7,
    reviews: 267,
    distance: '7.2 km',
    categories: ['Business Services'],
    services: ['Property Registration'],
    contact: '+91 98765 43222',
    openTime: '9:30 AM - 6:30 PM',
    image: '🏠',
    documentTypes: ['Property Documents'],
    availableSchemes: ['PM Awas Yojana'],
  },
  {
    id: '10',
    coordinate: { latitude: 28.6846, longitude: 77.2100 }, // Civil Lines
    title: 'Civil Lines Service Center',
    description: 'Service center for Civil Lines',
    address: 'Civil Lines, North Delhi',
    rating: 4.4,
    reviews: 189,
    distance: '4.3 km',
    categories: ['Health Services'],
    services: ['Health Checkup'],
    contact: '+91 98765 43223',
    openTime: '8:30 AM - 5:30 PM',
    image: '🏥',
    documentTypes: ['Health Records'],
    availableSchemes: ['Ayushman Bharat'],
  },
  {
    id: '11',
    coordinate: { latitude: 28.5672, longitude: 77.2100 }, // Lajpat Nagar
    title: 'Lajpat Nagar Service Center',
    description: 'Service center for Lajpat Nagar',
    address: 'Lajpat Nagar, South Delhi',
    rating: 4.8,
    reviews: 345,
    distance: '3.8 km',
    categories: ['Education Services'],
    services: ['Course Registration'],
    contact: '+91 98765 43231',
    openTime: '9:30 AM - 6:30 PM',
    image: '🎓',
    documentTypes: ['Student ID'],
    availableSchemes: ['PM e-VIDYA'],
  },
  {
    id: '12',
    coordinate: { latitude: 28.7041, longitude: 77.2500 }, // Yamuna Vihar
    title: 'Yamuna Vihar Service Center',
    description: 'Service center for Yamuna Vihar',
    address: 'Yamuna Vihar, North East Delhi',
    rating: 4.4,
    reviews: 176,
    distance: '3.5 km',
    categories: ['Health Services'],
    services: ['Health Card Registration'],
    contact: '+91 98765 43217',
    openTime: '8:30 AM - 5:30 PM',
    image: '🏥',
    documentTypes: ['Health Records'],
    availableSchemes: ['Ayushman Bharat'],
  },
  {
    id: '13',
    coordinate: { latitude: 28.6096, longitude: 77.3025 }, // Mayur Vihar
    title: 'Mayur Vihar Service Center',
    description: 'Service center for Mayur Vihar',
    address: 'Mayur Vihar, East Delhi',
    rating: 4.6,
    reviews: 267,
    distance: '4.7 km',
    categories: ['Education Services'],
    services: ['Skill Training'],
    contact: '+91 98765 43235',
    openTime: '9:00 AM - 6:00 PM',
    image: '🎓',
    documentTypes: ['Educational Certificates'],
    availableSchemes: ['Skill India'],
  },
  {
    id: '14',
    coordinate: { latitude: 28.5355, longitude: 77.2732 }, // Akshardham
    title: 'Akshardham Service Center',
    description: 'Service center for Akshardham',
    address: 'Akshardham, East Delhi',
    rating: 4.7,
    reviews: 312,
    distance: '5.4 km',
    categories: ['Health Services'],
    services: ['Vaccination'],
    contact: '+91 98765 43236',
    openTime: '8:30 AM - 5:30 PM',
    image: '🏥',
    documentTypes: ['Health Records'],
    availableSchemes: ['Ayushman Bharat'],
  },
  {
    id: '15',
    coordinate: { latitude: 28.7041, longitude: 77.3500 }, // Shahdara
    title: 'Shahdara Service Center',
    description: 'Service center for Shahdara',
    address: 'Shahdara, East Delhi',
    rating: 4.8,
    reviews: 356,
    distance: '7.1 km',
    categories: ['Business Services'],
    services: ['Heritage Tour Booking'],
    contact: '+91 98765 43234',
    openTime: '9:30 AM - 6:30 PM',
    image: '🏛️',
    documentTypes: ['ID Proof'],
    availableSchemes: ['Swadesh Darshan'],
  },
  {
    id: '16',
    coordinate: { latitude: 28.6096, longitude: 77.1855 }, // Janakpuri
    title: 'Janakpuri Service Center',
    description: 'Service center for Janakpuri',
    address: 'Janakpuri, West Delhi',
    rating: 4.7,
    reviews: 298,
    distance: '5.2 km',
    categories: ['Digital Services'],
    services: ['Digital Payments'],
    contact: '+91 98765 43230',
    openTime: '10:00 AM - 7:00 PM',
    image: '💻',
    documentTypes: ['Aadhaar Card'],
    availableSchemes: ['Digital India'],
  },
  {
    id: '17',
    coordinate: { latitude: 28.5672, longitude: 77.3025 }, // Kalkaji
    title: 'Kalkaji Service Center',
    description: 'Service center for Kalkaji',
    address: 'Kalkaji, South Delhi',
    rating: 4.8,
    reviews: 345,
    distance: '3.8 km',
    categories: ['Education Services'],
    services: ['Course Registration'],
    contact: '+91 98765 43231',
    openTime: '9:30 AM - 6:30 PM',
    image: '🎓',
    documentTypes: ['Student ID'],
    availableSchemes: ['PM e-VIDYA'],
  },
  {
    id: '18',
    coordinate: { latitude: 28.6517, longitude: 77.3500 }, // Seelampur
    title: 'Seelampur Service Center',
    description: 'Service center for Seelampur',
    address: 'Seelampur, North East Delhi',
    rating: 4.4,
    reviews: 176,
    distance: '3.5 km',
    categories: ['Health Services'],
    services: ['Health Card Registration'],
    contact: '+91 98765 43217',
    openTime: '8:30 AM - 5:30 PM',
    image: '🏥',
    documentTypes: ['Health Records'],
    availableSchemes: ['Ayushman Bharat'],
  },
  {
    id: '19',
    coordinate: { latitude: 28.5276, longitude: 77.2732 }, // Vasant Kunj
    title: 'Vasant Kunj Service Center',
    description: 'Service center for Vasant Kunj',
    address: 'Vasant Kunj, South West Delhi',
    rating: 4.7,
    reviews: 267,
    distance: '7.2 km',
    categories: ['Business Services'],
    services: ['Property Registration'],
    contact: '+91 98765 43222',
    openTime: '9:30 AM - 6:30 PM',
    image: '🏠',
    documentTypes: ['Property Documents'],
    availableSchemes: ['PM Awas Yojana'],
  },
  {
    id: '20',
    coordinate: { latitude: 28.6846, longitude: 77.3025 }, // Pitampura
    title: 'Pitampura Service Center',
    description: 'Service center for Pitampura',
    address: 'Pitampura, North West Delhi',
    rating: 4.5,
    reviews: 198,
    distance: '5.5 km',
    categories: ['Education Services'],
    services: ['Course Registration'],
    contact: '+91 98765 43221',
    openTime: '9:00 AM - 6:00 PM',
    image: '🎓',
    documentTypes: ['Educational Certificates'],
    availableSchemes: ['Skill India'],
  },
];

// Add category color mapping with enhanced colors
const categoryColors: Record<string, string> = {
  'All': '#4CAF50',
  'Document Services': '#E3F2FD',
  'Pension Services': '#FFF8E1',
  'Digital Services': '#F3E5F5',
  'Agriculture Services': '#E8F5E9',
  'Banking Services': '#FFEBEE',
  'Health Services': '#FFEBEE',
  'Education Services': '#E8F5E9',
  'Business Services': '#E3F2FD',
  'Heritage Services': '#FFF8E1',
  'Cultural Services': '#F3E5F5',
  'Municipal Services': '#E8F5E9',
  'Tourism Services': '#FFEBEE',
  'Property Services': '#E3F2FD',
  'Startup Services': '#FFF8E1',
  'Technology Services': '#F3E5F5',
  'Learning Services': '#E8F5E9',
  'Corporate Services': '#FFEBEE',
  'Medical Services': '#E3F2FD',
  'Skill Development': '#FFF8E1',
};

type CategoryName = keyof typeof CategoryMarkers;

// Add type for marker icons
type MarkerIconsType = {
  [key: string]: any;
  'Document Services': any;
  'Digital Services': any;
  'Health Services': any;
  'Education Services': any;
  'Business Services': any;
  'default': any;
};

// Update marker icons with proper typing
const markerIcons: MarkerIconsType = {
  'Document Services': require('../../assets/images/icons8-location-48.png'),
  'Digital Services': require('../../assets/images/icons8-location-48 (1).png'),
  'Health Services': require('../../assets/images/icons8-location-48 (2).png'),
  'Education Services': require('../../assets/images/icons8-location-48 (3).png'),
  'Business Services': require('../../assets/images/icons8-marker-48.png'),
  'default': require('../../assets/images/icons8-location-48.png'),
};

export default function CentersScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }>({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });
  const [markers, setMarkers] = useState<ServiceCenter[]>(initialMarkers);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [showRadius, setShowRadius] = useState<boolean>(true);
  const [radiusSize, setRadiusSize] = useState<number>(3000); // 3km in meters
  const [expandedCenter, setExpandedCenter] = useState<string | null>(null);
  
  // Refs
  const mapRef = useRef<MapView | null>(null);
  const searchInputRef = useRef<TextInput | null>(null);
  const flatListRef = useRef<FlatList | null>(null);
  const markerRefs = useRef<{[key: string]: any}>({});
  
  // Dynamically generate filter categories from initialMarkers
  const allCategories = Array.from(new Set(initialMarkers.flatMap(marker => marker.categories)));
  const filterCategories = ['All', ...allCategories];
  
  // Animation value for horizontal scroll
  const scrollX = useRef(new Animated.Value(0)).current;

  // Request location permission and get user location
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === 'granted');
        
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
          
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          });
          
          // Simulate API call to get nearby centers
          setTimeout(() => {
            // In a real app, you would fetch centers based on the user's location
            setIsLoading(false);
          }, 1000);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setIsLoading(false);
      }
    })();
  }, []);

  // Filter markers based on search query and selected filter
  useEffect(() => {
    let filtered = initialMarkers;
    
    // Apply category filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(marker => 
        marker.categories.some(category => 
          category.toLowerCase().includes(selectedFilter.toLowerCase())
        )
      );
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(marker => 
        marker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        marker.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        marker.services.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        marker.availableSchemes.some(scheme =>
          scheme.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    setMarkers(filtered);
    
    // Reset selected marker if it's no longer in the filtered results
    if (selectedMarkerId && !filtered.find(m => m.id === selectedMarkerId)) {
      setSelectedMarkerId(null);
    }
  }, [searchQuery, selectedFilter]);
  
  // Handle marker selection
  useEffect(() => {
    if (selectedMarkerId) {
      const selectedMarker = markers.find(m => m.id === selectedMarkerId);
      if (selectedMarker) {
        // Center the map on the selected marker
        mapRef.current?.animateToRegion(
          {
            ...selectedMarker.coordinate,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          350
        );
        
        // Scroll to the corresponding card
        const index = markers.findIndex(m => m.id === selectedMarkerId);
        if (index >= 0) {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5
          });
        }
      }
    }
  }, [selectedMarkerId]);

  // Navigate to user's current location
  const goToMyLocation = async () => {
    if (locationPermission && userLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        },
        350
      );
    } else {
      // Request permission again if not granted
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        
        mapRef.current?.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          },
          350
        );
      }
    }
  };

  // Open maps app with directions
  const openDirections = (marker: ServiceCenter) => {
    const destination = `${marker.coordinate.latitude},${marker.coordinate.longitude}`;
    const url = Platform.select({
      ios: `maps:?daddr=${destination}`,
      android: `google.navigation:q=${destination}`,
    });
    
    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          const browserUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
          Linking.openURL(browserUrl);
        }
      });
    }
  };

  // Emoji component
const Emoji: React.FC<{ symbol: string; size?: number }> = ({ symbol, size = 24 }) => (
  <Text style={{ fontSize: size }}>{symbol}</Text>
); 

  // Make a phone call
  const makePhoneCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };
  
  // Toggle radius circle
  const toggleRadius = () => {
    setShowRadius(!showRadius);
  };
  
  // Adjust radius size
  const changeRadiusSize = (size: number) => {
    setRadiusSize(size);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedFilter('All');
    setMarkers(initialMarkers);
  };
  
  // Toggle expanded center details
  const toggleExpandedCenter = (id: string) => {
    if (expandedCenter === id) {
      setExpandedCenter(null);
    } else {
      setExpandedCenter(id);
    }
  };
  
  // Interpolate card index to scale value for markers
  const interpolations = markers.map((marker, index) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + 20),
      index * (CARD_WIDTH + 20),
      (index + 1) * (CARD_WIDTH + 20),
    ];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [1, 1.5, 1],
      extrapolate: 'clamp',
    });
    
    return { scale };
  });

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('★');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('★');
      } else {
        stars.push('☆');
      }
    }
    
    return (
      <Text style={styles.ratingStars}>
        {stars.join('')}
      </Text>
    );
  };

  // Helper to get category color
  const getCategoryColor = (category: string) => categoryColors[category] || '#ECEFF1';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>  
      {/* Redesigned Header Section */}
      <View style={styles.schemeHeaderContainer}>
        <View style={styles.schemeHeaderRow}>
          <View>
            <Text style={[styles.schemeHeaderTitle, { color: theme.text }]}>Service Centers</Text>
            <Text style={[styles.schemeHeaderSubtitle, { color: theme.lightText }]}>Find government service centers near you</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.lightBg }]}>
              <Emoji symbol="🔔" size={20} />
            </TouchableOpacity>
         
          </View>
        </View>
        {/* Search Bar attached to header */}
        <View style={[styles.schemeSearchContainer, { backgroundColor: theme.lightBg }]}> 
          <IconSymbol name="magnifyingglass" size={18} color={theme.icon} />
          <TextInput
            ref={searchInputRef}
            style={[styles.schemeSearchInput, { color: theme.text }]}
            placeholder="Search centers, services, schemes..."
            placeholderTextColor={theme.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={theme.icon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Categories with colored chips */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterCategories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                { backgroundColor: selectedFilter === item ? theme.primary : getCategoryColor(item) },
                selectedFilter === item && { borderWidth: 2, borderColor: theme.primary },
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: selectedFilter === item ? '#fff' : theme.text },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>Locating service centers near you...</Text>
          </View>
        ) : (
          <>
            {/* Map View - reduced height, beautiful markers, scroll-to-list button */}
            <View style={styles.mapContainerCustom}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation={locationPermission || false}
                showsCompass={true}
              >
                {showRadius && userLocation && (
                  <Circle
                    center={userLocation}
                    radius={radiusSize}
                    fillColor="rgba(46, 139, 87, 0.1)"
                    strokeColor="rgba(46, 139, 87, 0.5)"
                    strokeWidth={1}
                  />
                )}
                {markers.map((marker) => {
                  const categoryName = marker.categories[0];
                  const iconSource = markerIcons[categoryName as keyof MarkerIconsType] || markerIcons.default;
                  
                  return (
                    <Marker
                      key={marker.id}
                      coordinate={marker.coordinate}
                      onPress={() => setSelectedMarkerId(marker.id)}
                      anchor={{ x: 0.5, y: 1 }}
                    >
                      <Image
                        source={iconSource}
                        style={styles.markerImageRaw}
                      />
                      <Callout tooltip={false}>
                        <View style={{ padding: 8, maxWidth: 180 }}>
                          <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{marker.title}</Text>
                          <Text style={{ fontSize: 12 }}>{marker.address}</Text>
                          <Text style={{ fontSize: 12 }}>{marker.openTime}</Text>
                          <Text style={{ fontSize: 12, color: '#888' }}>{marker.categories.join(', ')}</Text>
                        </View>
                      </Callout>
                    </Marker>
                  );
                })}
              </MapView>
              {/* Scroll to list button overlay */}
              <TouchableOpacity style={styles.scrollToListBtn} onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}>
                <IconSymbol name="chevron.down" size={24} color={theme.primary} />
              </TouchableOpacity>
            </View>

            {/* Centers List - unchanged */}
            <View style={styles.centersListContainer}>
              <View style={styles.centersListHeader}>
                <Text style={[styles.centersListTitle, { color: theme.text }]}>
                  {markers.length} Centers {userLocation ? 'Near You' : 'Available'}
                </Text>
                {(searchQuery !== '' || selectedFilter !== 'All') && (
                  <TouchableOpacity onPress={resetFilters}>
                    <Text style={[styles.resetFilters, { color: theme.primary }]}>
                      Reset Filters
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <FlatList
                ref={flatListRef}
                data={markers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.centerCard, { 
                      backgroundColor: categoryColors[item.categories[0]] || theme.cardBg,
                      borderColor: selectedMarkerId === item.id ? theme.primary : theme.border,
                      borderWidth: selectedMarkerId === item.id ? 2 : 1,
                    }]}
                    onPress={() => setSelectedMarkerId(item.id)}
                  >
                    <View style={styles.centerCardHeader}>
                      <View style={[styles.centerIconContainer, { backgroundColor: theme.lightBg }]}>
                        <Text style={styles.centerIconText}>{item.image}</Text>
                      </View>
                      <View style={styles.centerHeaderInfo}>
                        <Text style={[styles.centerTitle, { color: theme.text }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <View style={styles.centerRatingContainer}>
                          {renderStars(item.rating)}
                          <Text style={[styles.centerReviews, { color: theme.icon }]}>
                            ({item.reviews} reviews)
                          </Text>
                        </View>
                      </View>
                      {item.distance && (
                        <View style={[styles.distanceBadge, { backgroundColor: theme.lightBg }]}>
                          <IconSymbol name="location.fill" size={12} color={theme.primary} />
                          <Text style={[styles.distanceText, { color: theme.primary }]}>
                            {item.distance}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.centerCardBody}>
                      <View style={styles.centerInfoRow}>
                        <IconSymbol name="mappin.and.ellipse" size={14} color={theme.primary} />
                        <Text style={[styles.centerInfoText, { color: theme.text }]} numberOfLines={1}>
                          {item.address}
                        </Text>
                      </View>
                      <View style={styles.centerInfoRow}>
                        <IconSymbol name="clock.fill" size={14} color={theme.primary} />
                        <Text style={[styles.centerInfoText, { color: theme.text }]}>
                          {item.openTime}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.centerTagsContainer}>
                      {item.categories.map((category: string, idx: number) => (
                        <View 
                          key={idx} 
                          style={[styles.centerTag, { backgroundColor: theme.lightBg }]}
                        >
                          <Text style={[styles.centerTagText, { color: theme.primary }]}>
                            {category}
                          </Text>
                        </View>
                      ))}
                    </View>
                    
                    {expandedCenter === item.id && (
                      <View style={styles.expandedContent}>
                        <View style={styles.expandedSection}>
                          <Text style={[styles.expandedSectionTitle, { color: theme.text }]}>
                            Available Services
                          </Text>
                          <View style={styles.servicesList}>
                            {item.services.map((service: string, idx: number) => (
                              <View key={idx} style={styles.serviceItem}>
                                <View style={[styles.serviceBullet, { backgroundColor: theme.primary }]} />
                                <Text style={[styles.serviceText, { color: theme.text }]}>
                                  {service}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                        
                        <View style={styles.expandedSection}>
                          <Text style={[styles.expandedSectionTitle, { color: theme.text }]}>
                            Documents Required
                          </Text>
                          <View style={styles.documentsList}>
                            {item.documentTypes.map((doc: string, idx: number) => (
                              <View key={idx} style={styles.documentItem}>
                                <IconSymbol name="doc.text" size={14} color={theme.primary} />
                                <Text style={[styles.documentText, { color: theme.text }]}>
                                  {doc}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                        
                        <View style={styles.expandedSection}>
                          <Text style={[styles.expandedSectionTitle, { color: theme.text }]}>
                            Available Schemes
                          </Text>
                          <View style={styles.schemesList}>
                            {item.availableSchemes.map((scheme: string, idx: number) => (
                              <View 
                                key={idx} 
                                style={[styles.schemeTag, { backgroundColor: theme.primary + '20' }]}
                              >
                                <Text style={[styles.schemeTagText, { color: theme.primary }]}>
                                  {scheme}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      </View>
                    )}
                    
                    <View style={styles.centerCardFooter}>
                      <TouchableOpacity
                        style={[styles.centerButton, { backgroundColor: theme.lightBg }]}
                        onPress={() => makePhoneCall(item.contact)}
                      >
                        <IconSymbol name="phone.fill" size={16} color={theme.primary} />
                        <Text style={[styles.centerButtonText, { color: theme.primary }]}>
                          Call
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.centerButton, { backgroundColor: theme.primary }]}
                        onPress={() => openDirections(item)}
                      >
                        <IconSymbol name="map.fill" size={16} color="#FFF" />
                        <Text style={styles.centerButtonTextWhite}>
                          Directions
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.centerButton, { backgroundColor: theme.lightBg }]}
                        onPress={() => toggleExpandedCenter(item.id)}
                      >
                        <IconSymbol 
                          name={expandedCenter === item.id ? "chevron.up" : "chevron.down"} 
                          size={16} 
                          color={theme.primary} 
                        />
                        <Text style={[styles.centerButtonText, { color: theme.primary }]}>
                          {expandedCenter === item.id ? "Less" : "More"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.centersList}
                showsVerticalScrollIndicator={false}
                onScrollToIndexFailed={() => {}}
              />
            </View>
          </>
        )}
      </View>
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
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  searchOuterContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterList: {
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  mapContainer: {
    height: height * 0.4,
    borderRadius: 20,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapControlsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 10,
  },
  radiusControls: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radiusButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginVertical: 5,
  },
  radiusValue: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  radiusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    fontSize: 18,
  },
  markerPulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    opacity: 0.4,
  },
  callout: {
    width: 160,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 3,
  },
  calloutDescription: {
    fontSize: 10,
  },
  centersListContainer: {
    flex: 1,
    marginTop: 16,
  },
  centersListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  centersListTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resetFilters: {
    fontSize: 13,
    fontWeight: '500',
  },
  centersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  centerCard: {
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  centerCardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  centerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  centerIconText: {
    fontSize: 24,
  },
  centerHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  centerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  centerRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStars: {
    color: '#FFC107',
    fontSize: 14,
    marginRight: 5,
  },
  centerReviews: {
    fontSize: 12,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  centerCardBody: {
    marginBottom: 12,
  },
  centerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  centerInfoText: {
    fontSize: 13,
    marginLeft: 8,
  },
  centerTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  centerTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  centerTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: 5,
    marginBottom: 12,
  },
  expandedSection: {
    marginBottom: 12,
  },
  expandedSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  servicesList: {
    marginLeft: 4,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  serviceBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  serviceText: {
    fontSize: 13,
  },
  documentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 6,
  },
  documentText: {
    fontSize: 12,
    marginLeft: 6,
  },
  schemesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  schemeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  schemeTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  centerCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  centerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  centerButtonTextWhite: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    color: '#FFFFFF',
  },
  schemeHeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  schemeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  schemeHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  schemeHeaderSubtitle: {
    fontSize: 14,
    marginBottom: 6,
  },
  uploadHeaderBtn: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 10,
    marginLeft: 10,
  },
  schemeSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  schemeSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  mapContainerCustom: {
    height: height * 0.32,
    borderRadius: 20,
    marginHorizontal: 20,
    overflow: 'hidden',
    marginBottom: 10,
  },
  customMarkerBeautiful: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  markerImageRaw: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
  scrollToListBtn: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
  },
}); 