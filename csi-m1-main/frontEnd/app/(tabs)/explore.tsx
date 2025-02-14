import { useState, useEffect, useRef, useMemo, useCallback, Platform } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, TextInput } from 'react-native';
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker, Callout, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { THEME_COLORS } from '@/constants/Colors';
import { ScrollView } from 'react-native-gesture-handler';
import { Card } from 'tamagui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types for centers
interface SchemeCenter {
  id: string;
  name: string;
  type: 'CSC' | 'Bank' | 'Government' | 'NGO';
  address: string;
  distance: number;
  schemes: string[];
  contact: string;
  timing: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Add new types for places
interface Place {
  id: string;
  name: string;
  type: 'CSC' | 'Bank' | 'Government' | 'NGO' | 'Hospital' | 'PostOffice';
  address: string;
  distance: number;
  schemes: string[];
  contact: string;
  timing: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  isOpen: boolean;
}

// Replace this with your new API key after setting up properly
const GOOGLE_PLACES_API_KEY = 'AIzaSyCctB7XAC_6yKjVWFfVaSNW1qytfDkHt3A';

// Update CustomMarkerIcons with correct FontAwesome5 icon names
const CustomMarkerIcons = {
  USER: {
    icon: 'user-circle',
    color: '#2196F3',
    label: 'You are here'
  },
  CSC: {
    icon: 'building',
    color: '#4CAF50',
    label: 'Jan Seva Kendra/CSC'
  },
  Bank: {
    icon: 'university',
    color: '#2196F3',
    label: 'Bank'
  },
  Government: {
    icon: 'building',
    color: '#F44336',
    label: 'Government Office'
  },
  NGO: {
    icon: 'hands',
    color: '#9C27B0',
    label: 'NGO'
  },
  Hospital: {
    icon: 'hospital',
    color: '#E91E63',
    label: 'Hospital'
  }
};

// Update the PlaceCard component with proper error handling
const PlaceCard = ({ place }: { place: Place }) => {
  if (!place) return null; // Add null check

  return (
    <Pressable style={styles.centerCard}>
      <View style={styles.centerHeader}>
        <View style={[
          styles.markerContainer, 
          { backgroundColor: CustomMarkerIcons[place.type]?.color || '#999' }
        ]}>
          <FontAwesome5 
            name={CustomMarkerIcons[place.type]?.icon || 'question'} 
            size={20} 
            color="#FFF"
          />
        </View>
        <View style={styles.centerInfo}>
          <Text style={styles.centerName}>{place.name || 'Unknown Place'}</Text>
          <Text style={styles.centerType}>
            {CustomMarkerIcons[place.type]?.label || 'Other'}
          </Text>
          <Text style={styles.distance}>{place.distance?.toFixed(1) || '?'} km away</Text>
        </View>
      </View>
      <View style={styles.centerDetails}>
        <Text style={styles.detailText}>
          📍 {place.address || 'Address not available'}
        </Text>
        <Text style={styles.detailText}>
          ⏰ {place.timing || '9:00 AM - 6:00 PM'}
        </Text>
        <Text style={styles.detailText}>
          📞 {place.contact || 'Contact not available'}
        </Text>
      </View>
      <View style={styles.schemesTags}>
        {(place.schemes || []).map((scheme, index) => (
          <View key={index} style={styles.schemeTag}>
            <Text style={styles.schemeTagText}>{scheme}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
};

// Then, create a constant for the map provider
const MAP_PROVIDER = Platform?.OS === 'ios' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;

// Add this constant at the top
const DELHI_BOUNDARY = {
  minLat: 28.4,
  maxLat: 28.9,
  minLon: 76.8,
  maxLon: 77.4
};

// Update the radius to meters (5000 meters = 5km)
const NEARBY_RADIUS = 5000; 

// Add this helper function to check if a location is nearby
const isNearby = (lat1: number, lon1: number, lat2: number, lon2: number, radius: number): boolean => {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radius;
};

// Add custom marker component
const CustomMarker = ({ place, onPress }: { place: Place; onPress: () => void }) => (
  <Marker
    coordinate={place.coordinates}
    onPress={onPress}
  >
    <View style={[styles.markerContainer, { backgroundColor: CustomMarkerIcons[place.type].color }]}>
      <FontAwesome5 
        name={CustomMarkerIcons[place.type].icon}
        size={20}
        color="#FFF"
      />
    </View>
    <Callout style={styles.calloutContainer}>
      <View>
        <Text style={styles.calloutTitle}>{place.name}</Text>
        <Text style={styles.calloutType}>{CustomMarkerIcons[place.type].label}</Text>
        <Text style={styles.calloutDistance}>{place.distance} km away</Text>
        <Text style={styles.calloutAddress}>{place.address}</Text>
        <Text style={styles.calloutTiming}>{place.timing}</Text>
      </View>
    </Callout>
  </Marker>
);

// First, create a separate PlaceCallout component at the top level
const PlaceCallout = ({ place, onDirectionsPress }: { 
  place: Place; 
  onDirectionsPress: () => void;
}) => (
  <Callout style={styles.callout}>
    <View style={styles.calloutContent}>
      <Text style={styles.calloutTitle}>{place.name}</Text>
      <Text style={styles.calloutType}>{CustomMarkerIcons[place.type]?.label}</Text>
      <Text style={styles.calloutDistance}>{place.distance.toFixed(1)} km away</Text>
      <Text style={styles.calloutAddress}>{place.address}</Text>
      <Pressable 
        style={styles.directionsButton}
        onPress={onDirectionsPress}
      >
        <FontAwesome5 name="directions" size={16} color="#FFF" />
        <Text style={styles.directionsButtonText}>Get Directions</Text>
      </Pressable>
    </View>
  </Callout>
);

// Add mock CSC data
const mockCSCData = [
  {
    id: 'csc-1',
    name: 'Jan Seva Kendra - Bakkarwala',
    type: 'CSC',
    address: 'Near Market, Bakkarwala, New Delhi',
    distance: 0.8,
    schemes: ['Aadhaar Services', 'PAN Card', 'Banking Services', 'Insurance'],
    contact: '011-2345xxxx',
    timing: '9:00 AM - 6:00 PM',
    coordinates: {
      latitude: 28.665234,
      longitude: 77.008945
    },
    rating: 4.2,
    isOpen: true
  },
  {
    id: 'csc-2',
    name: 'Digital Seva Kendra',
    type: 'CSC',
    address: 'Mundka Village, New Delhi',
    distance: 1.5,
    schemes: ['Digital Services', 'Government Schemes', 'Bill Payments'],
    contact: '011-6789xxxx',
    timing: '9:00 AM - 5:00 PM',
    coordinates: {
      latitude: 28.668123,
      longitude: 77.015678
    },
    rating: 4.0,
    isOpen: true
  },
  {
    id: 'csc-3',
    name: 'Common Service Center',
    type: 'CSC',
    address: 'Nangloi, New Delhi',
    distance: 2.3,
    schemes: ['Pension Services', 'Certificate Services', 'Banking'],
    contact: '011-9876xxxx',
    timing: '8:30 AM - 6:30 PM',
    coordinates: {
      latitude: 28.657890,
      longitude: 77.002345
    },
    rating: 4.1,
    isOpen: true
  }
];

function ExploreScreen() {
  // Move all useState hooks to the top of the component
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedType, setSelectedType] = useState<Place['type'] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [directionsVisible, setDirectionsVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  
  const mapRef = useRef<MapView | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const fetchPlaces = async (latitude: number, longitude: number) => {
    try {
      console.log('Fetching places for:', latitude, longitude);

      const searchTypes = [
        {
          type: 'Bank',
          keywords: 'bank',
          googleTypes: 'bank'
        },
        {
          type: 'Hospital',
          keywords: 'hospital',
          googleTypes: 'hospital'
        },
        {
          type: 'Government',
          keywords: 'government|sarkari|municipal|tehsil|SDM office|district office',
          googleTypes: 'local_government_office|city_hall|courthouse|post_office',
          extraSearch: true // Flag for additional search
        },
        {
          type: 'CSC',
          keywords: 'jan seva kendra|common service centre|CSC|e seva|citizen service|digital seva',
          googleTypes: 'local_government_office|point_of_interest|store',
          extraSearch: true // Flag for additional search
        },
        {
          type: 'NGO',
          keywords: 'ngo|social welfare|foundation',
          googleTypes: 'point_of_interest'
        }
      ];

      let allPlaces: Place[] = [];

      for (const searchType of searchTypes) {
        try {
          // First attempt with original search
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
            {
              params: {
                location: `${latitude},${longitude}`,
                radius: NEARBY_RADIUS,
                type: searchType.googleTypes,
                keyword: searchType.keywords,
                key: GOOGLE_PLACES_API_KEY
              }
            }
          );

          let places = [];
          if (response.data?.results) {
            places = response.data.results;
          }

          // For CSC and Government, try additional search if needed
          if (searchType.extraSearch && places.length === 0) {
            // Try text search instead of nearby search
            const textResponse = await axios.get(
              `https://maps.googleapis.com/maps/api/place/textsearch/json`,
              {
                params: {
                  query: `${searchType.keywords} near ${latitude},${longitude}`,
                  radius: NEARBY_RADIUS,
                  key: GOOGLE_PLACES_API_KEY
                }
              }
            );
            
            if (textResponse.data?.results) {
              places = [...places, ...textResponse.data.results];
            }
          }

          const filteredPlaces = places
            .map(place => {
              const distance = calculateDistance(
                latitude,
                longitude,
                place.geometry.location.lat,
                place.geometry.location.lng
              );
              
              return {
                id: place.place_id,
                name: place.name,
                type: searchType.type as Place['type'],
                address: place.vicinity || place.formatted_address || 'Address not available',
                distance: distance,
                schemes: getSchemesByType(searchType.type),
                contact: place.formatted_phone_number || 'Contact at location',
                timing: place.opening_hours?.open_now ? 'Open now' : 'Hours vary',
                coordinates: {
                  latitude: place.geometry.location.lat,
                  longitude: place.geometry.location.lng
                },
                rating: place.rating || 4.0,
                isOpen: place.opening_hours?.open_now || false
              };
            })
            .filter(place => place.distance <= 5); // Filter within 5km

          if (searchType.type === 'CSC') {
            // Add mock CSC data
            const mockCSCs = mockCSCData.map(csc => ({
              ...csc,
              distance: calculateDistance(
                latitude,
                longitude,
                csc.coordinates.latitude,
                csc.coordinates.longitude
              )
            })).filter(csc => csc.distance <= 5); // Only include CSCs within 5km

            allPlaces = [...allPlaces, ...mockCSCs];
            console.log(`Found ${mockCSCs.length} mock CSCs within 5km`);
          }

          allPlaces = [...allPlaces, ...filteredPlaces];
          console.log(`Found ${filteredPlaces.length} places for ${searchType.type} within 5km`);

        } catch (error) {
          console.error(`Error fetching ${searchType.type}:`, error);
        }
      }

      // Sort places by distance
      allPlaces.sort((a, b) => a.distance - b.distance);
      setPlaces(allPlaces);

    } catch (error) {
      console.error('Error in fetchPlaces:', error);
      setPlaces([]);
    }
  };

  // Helper function to determine place type from Google Places result
  const determineType = (place: any): Place['type'] => {
    const types = place.types || [];
    if (types.includes('bank')) return 'Bank';
    if (types.includes('hospital') || types.includes('doctor')) return 'Hospital';
    if (types.includes('local_government_office')) return 'Government';
    if (types.includes('point_of_interest') && place.name.toLowerCase().includes('seva')) return 'CSC';
    return 'Government';
  };

  // Helper function to determine if a place is open
  const isPlaceOpen = (type: Place['type']): boolean => {
    const now = new Date();
    const hour = now.getHours();
    
    switch(type) {
      case 'Hospital':
        return true; // 24/7
      case 'Bank':
        return hour >= 9 && hour < 17; // 9 AM - 5 PM
      default:
        return hour >= 9 && hour < 18; // 9 AM - 6 PM
    }
  };

  // Helper function to get default timing based on type
  const getDefaultTiming = (type: Place['type']): string => {
    switch(type) {
      case 'Hospital':
        return '24/7';
      case 'Bank':
        return '9:00 AM - 5:00 PM';
      default:
        return '9:00 AM - 6:00 PM';
    }
  };

  // Add helper function for address formatting
  const formatAddress = (address: any): string => {
    const parts = [];
    if (address?.road) parts.push(address.road);
    if (address?.suburb) parts.push(address.suburb);
    if (address?.city) parts.push(address.city);
    return parts.length > 0 ? parts.join(', ') : 'Delhi';
  };

  // Add helper function for schemes
  const getSchemesByType = (type: Place['type']): string[] => {
    switch (type) {
      case 'CSC':
        return ['Digital India', 'PM Kisan', 'Ayushman Bharat'];
      case 'Bank':
        return ['Jan Dhan Yojana', 'Mudra Loan', 'PM SVANidhi'];
      case 'Government':
        return ['Various Government Schemes'];
      case 'NGO':
        return ['Social Welfare Programs'];
      case 'Hospital':
        return ['Ayushman Bharat', 'Health Insurance'];
      default:
        return [];
    }
  };

  // Helper function to map Google Places types to our Place types
  const getPlaceType = (googleType: string): Place['type'] => {
    const typeMap: { [key: string]: Place['type'] } = {
      bank: 'Bank',
      local_government_office: 'Government',
      hospital: 'Hospital',
      doctor: 'Hospital',
      health: 'Hospital'
    };
    return typeMap[googleType] || 'Government';
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  useEffect(() => {
    (async () => {
      try {
        console.log('Requesting location permission...'); // Debug log
        
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Location permission denied');
          return;
        }

        console.log('Getting current location...'); // Debug log
        
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        console.log('Location received:', currentLocation); // Debug log
        
        setLocation(currentLocation);
        await fetchPlaces(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
      } catch (error) {
        console.error('Error in location setup:', error);
      }
    })();
  }, []);

  // Update the filteredPlaces memo to ensure radius restriction
  const filteredPlaces = useMemo(() => {
    return places
      .filter(place => {
        const isWithinRadius = place.distance <= 5;
        const matchesSearch = 
          place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.schemes.some(scheme => 
            scheme.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          place.address.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesType = selectedType ? place.type === selectedType : true;
        
        return isWithinRadius && matchesSearch && matchesType;
      })
      .sort((a, b) => a.distance - b.distance);
  }, [places, searchQuery, selectedType]);

  // Add helper function to decode Google's polyline format
  const decodePolyline = (encoded: string) => {
    const points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let shift = 0, result = 0;
      
      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result & 0x20);
      
      lat += ((result & 1) ? ~(result >> 1) : (result >> 1));
      
      shift = 0;
      result = 0;
      
      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result & 0x20);
      
      lng += ((result & 1) ? ~(result >> 1) : (result >> 1));

      points.push({
        latitude: lat * 1e-5,
        longitude: lng * 1e-5
      });
    }
    
    return points;
  };

  // Add DirectionsService helper
  const getDirections = async (destinationPlace: Place) => {
    if (!location) return;

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json`,
        {
          params: {
            origin: `${location.coords.latitude},${location.coords.longitude}`,
            destination: `${destinationPlace.coordinates.latitude},${destinationPlace.coordinates.longitude}`,
            key: GOOGLE_PLACES_API_KEY,
            mode: 'driving'
          }
        }
      );

      if (response.data.routes.length > 0) {
        const points = response.data.routes[0].overview_polyline.points;
        setSelectedRoute(points);
        setDirectionsVisible(true);
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.topPadding} />
      <GestureHandlerRootView style={styles.flexContainer}>
        <View style={styles.container}>
          {location && (
            <MapView
              ref={mapRef}
              provider={MAP_PROVIDER}
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
              showsCompass={true}
              showsScale={true}
              mapPadding={{ top: 60, right: 0, bottom: 0, left: 0 }}
            >
              <Circle
                center={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                radius={5000} // 5km in meters
                strokeWidth={1}
                strokeColor={THEME_COLORS.primary}
                fillColor={'rgba(33, 150, 243, 0.1)'}
              />

              {filteredPlaces.map((place) => (
                <Marker
                  key={place.id}
                  coordinate={place.coordinates}
                  onPress={() => {
                    setSelectedPlace(place);
                    const index = filteredPlaces.findIndex(p => p.id === place.id);
                    if (index !== -1 && scrollViewRef.current) {
                      scrollViewRef.current.scrollTo({
                        y: index * 200,
                        animated: true
                      });
                    }
                  }}
                >
                  <View style={[
                    styles.markerContainer,
                    { backgroundColor: CustomMarkerIcons[place.type]?.color || '#999' }
                  ]}>
                    <FontAwesome5 
                      name={CustomMarkerIcons[place.type]?.icon || 'question'} 
                      size={20} 
                      color="#FFF"
                    />
                  </View>
                  <PlaceCallout 
                    place={place} 
                    onDirectionsPress={() => getDirections(place)}
                  />
                </Marker>
              ))}

              {directionsVisible && selectedRoute && (
                <MapView.Polyline
                  coordinates={decodePolyline(selectedRoute)}
                  strokeWidth={4}
                  strokeColor={THEME_COLORS.primary}
                />
              )}
            </MapView>
          )}

          <View style={styles.filterContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              <Pressable
                style={[
                  styles.filterButton,
                  { backgroundColor: !selectedType ? THEME_COLORS.primary : '#999' }
                ]}
                onPress={() => setSelectedType(null)}
              >
                <Text style={styles.filterText}>All</Text>
              </Pressable>
              {Object.entries(CustomMarkerIcons).map(([type, data]) => (
                type !== 'USER' && (
                  <Pressable
                    key={type}
                    style={[
                      styles.filterButton,
                      { 
                        backgroundColor: selectedType === type ? data.color : '#999',
                        opacity: selectedType === type ? 1 : 0.7
                      }
                    ]}
                    onPress={() => setSelectedType(type as Place['type'])}
                  >
                    <FontAwesome5 
                      name={data.icon} 
                      size={16} 
                      color="#FFF" 
                      style={styles.filterIcon}
                    />
                    <Text style={styles.filterText}>{data.label}</Text>
                  </Pressable>
                )
              ))}
            </ScrollView>
          </View>

          <View style={styles.searchAndListContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search centers or schemes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <ScrollView 
              ref={scrollViewRef}
              style={styles.centersList}
            >
              {filteredPlaces.map((place) => (
                <Pressable
                  key={place.id}
                  style={[
                    styles.centerCard,
                    selectedPlace?.id === place.id && styles.selectedCard
                  ]}
                  onPress={() => {
                    setSelectedPlace(place);
                    mapRef.current?.animateToRegion({
                      latitude: place.coordinates.latitude,
                      longitude: place.coordinates.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }, 1000);
                  }}
                >
                  <PlaceCard place={place} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topPadding: {
    height: 25, // Fixed height instead of using Platform.OS
  },
  flexContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  map: {
    height: '60%',
  },
  searchAndListContainer: {
    height: '50%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  centersList: {
    flex: 1,
  },
  mapCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 250,
  },
  markerContainer: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutContainer: {
    width: 250,
  },
  calloutBubble: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  calloutType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  calloutAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  calloutTiming: {
    fontSize: 14,
    marginBottom: 4,
  },
  calloutContact: {
    fontSize: 14,
    marginBottom: 8,
  },
  calloutSchemes: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  calloutScheme: {
    fontSize: 13,
    color: THEME_COLORS.primary,
    marginBottom: 2,
  },
  calloutArrow: {
    backgroundColor: 'transparent',
    borderWidth: 16,
    borderColor: 'transparent',
    borderTopColor: 'white',
    alignSelf: 'center',
    marginTop: -0.5,
  },
  centerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2.84,
    elevation: 3,
  },
  selectedCard: {
    borderColor: THEME_COLORS.primary,
    borderWidth: 2,
  },
  centerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  centerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  centerType: {
    fontSize: 14,
    color: '#666',
  },
  distance: {
    fontSize: 14,
    color: THEME_COLORS.primary,
    fontWeight: '600',
  },
  centerDetails: {
    marginTop: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  schemesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  schemeTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  schemeTagText: {
    color: THEME_COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: THEME_COLORS.primary,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  userMarkerRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: THEME_COLORS.primary,
    opacity: 0.2,
  },
  filterContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  filterScrollContent: {
    paddingHorizontal: 10,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    width: '100%',
    justifyContent: 'center',
  },
  directionsButtonText: {
    color: '#FFF',
    marginLeft: 6,
    fontWeight: '600',
  },
  callout: {
    width: 200,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  calloutContent: {
    alignItems: 'center',
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  calloutType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  calloutDistance: {
    fontSize: 12,
    color: THEME_COLORS.primary,
    fontWeight: '500',
  },
});

export default ExploreScreen;
