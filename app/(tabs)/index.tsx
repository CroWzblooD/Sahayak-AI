import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
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
type EmojiProps = { symbol: string; size?: number };
const Emoji: React.FC<EmojiProps> = ({ symbol, size = 24 }) => (
  <Text style={{ fontSize: size }}>{symbol}</Text>
);

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const scrollX = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  // Latest updates for slider
  const latestUpdates = [
    {
      id: '1',
      title: 'Last date for PM Kisan registration extended',
      date: 'May 15, 2023',
      tag: 'Important',
      color: '#FFF8E1',
      emoji: '📝'
    },
    {
      id: '2',
      title: 'New scheme for women entrepreneurs launched',
      date: 'May 10, 2023',
      tag: 'New',
      color: '#E8F5E9',
      emoji: '👩‍💼'
    },
    {
      id: '3',
      title: 'Digital literacy program starting next month',
      date: 'May 8, 2023',
      tag: 'Upcoming',
      color: '#E3F2FD',
      emoji: '💻'
    },
  ];

  // Recommended schemes with emoji icons
  const recommendedSchemes = [
    {
      id: '1',
      name: 'PM Kisan Samman Nidhi',
      description: 'Financial support to farmer families',
      emoji: '🌾',
      bgColor: '#E8F5E9',
    },
    {
      id: '2',
      name: 'Atal Pension Yojana',
      description: 'Pension scheme for unorganized sector',
      emoji: '👵🏽',
      bgColor: '#F1F8E9',
    },
    {
      id: '3',
      name: 'PM Awas Yojana',
      description: 'Housing for rural & urban poor',
      emoji: '🏠',
      bgColor: '#E0F2F1',
    },
    {
      id: '4',
      name: 'Startup India Scheme',
      description: 'Support for entrepreneurs',
      emoji: '🚀',
      bgColor: '#E8F5E9',
    },
  ];

  // Nearby centers
  const nearbyCenters = [
    {
      id: '1',
      name: 'Delhi Common Service Center',
      distance: '2.5 km',
      address: '123 Main Street, Delhi',
    },
    {
      id: '2',
      name: 'Mumbai Service Hub',
      distance: '3.2 km',
      address: '456 Marine Drive, Mumbai',
    },
  ];

  // Categories
  const categories = [
    { id: '1', name: 'Agriculture', emoji: '🌱', color: '#C8E6C9' },
    { id: '2', name: 'Healthcare', emoji: '⚕️', color: '#B2DFDB' },
    { id: '3', name: 'Education', emoji: '🎓', color: '#BBDEFB' },
    { id: '4', name: 'Employment', emoji: '💼', color: '#D1C4E9' },
    { id: '5', name: 'Housing', emoji: '🏘️', color: '#FFECB3' },
    { id: '6', name: 'Women & Child', emoji: '👩‍👧', color: '#F8BBD0' },
  ];

  // Pagination dots for update slider
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {latestUpdates.map((_, i) => {
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
                styles.dot,
                { 
                  width: dotWidth,
                  opacity, 
                  backgroundColor: theme.primary 
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
      {/* Header with Greeting */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.icon }]}>Welcome back</Text>
          <Text style={[styles.userName, { color: theme.text }]}>Sahayak User 👋</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.notificationButton, { backgroundColor: theme.lightBg }]}>
            <Emoji symbol="🔔" size={20} />
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.avatarContainer, { borderColor: theme.primary }]} onPress={() => (navigation as any).navigate('profile')}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>SU</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchOuterContainer}>
        <View style={styles.searchContainer}>
          <Emoji symbol="🔍" size={20} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search schemes, centers, documents..."
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Updates Slider */}
        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
        
          </View>
          
          <FlatList
            data={latestUpdates}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            renderItem={({ item }) => (
              <View style={styles.slideContainer}>
                <View style={[styles.slideContent, { backgroundColor: item.color }]}>
                  <View style={styles.slideTextContent}>
                    <View style={styles.slideTagContainer}>
                      <Text style={[styles.slideTag, { color: theme.primary }]}>{item.tag}</Text>
                    </View>
                    <Text style={[styles.slideTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.slideDate, { color: theme.icon }]}>{item.date}</Text>
                  </View>
                  <View style={styles.slideEmojiContainer}>
                    <Emoji symbol={item.emoji} size={40} />
                  </View>
                </View>
              </View>
            )}
          />  
          {renderPagination()}
        </View>

        {/* Categories */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Categories
            </Text>
          </View>

          <View style={styles.categoriesContainer}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryItem, { backgroundColor: category.color }]}
              >
                <Text style={[styles.categoryEmoji, { color: theme.primary }]}>{category.emoji}</Text>
                <Text style={[styles.categoryName, { color: theme.text }]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

            {/* Main Banner */}
          <TouchableOpacity style={styles.mainBannerContainer}>
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mainBanner}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>
                Check Your{'\n'}Scheme Eligibility
              </Text>
              <Text style={styles.bannerDescription}>
                Find out which government schemes you qualify for
              </Text>
              <View style={styles.bannerButton}>
                <Text style={[styles.bannerButtonText, { color: theme.primary }]}>
                  Check Now
                </Text>
                <Emoji symbol="➡️" size={12} />
              </View>
            </View>
            <View style={styles.bannerImageContainer}>
              <Emoji symbol="🔍" size={40} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recommended Schemes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recommended for You
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedContainer}
          >
            {recommendedSchemes.map(scheme => (
              <TouchableOpacity
                key={scheme.id}
                style={[
                  styles.schemeCard,
                  { backgroundColor: scheme.bgColor },
                ]}
              >
                <Text style={[styles.schemeEmoji, { color: theme.primary }]}>{scheme.emoji}</Text>
                <Text style={[styles.schemeName, { color: theme.text }]}>{scheme.name}</Text>
                <Text style={[styles.schemeDescription, { color: theme.icon }]}>
                  {scheme.description}
                </Text>
                <View style={styles.schemeDetails}>
                  <Text style={[styles.schemeDetailsText, { color: theme.primary }]}>
                    View Details
                  </Text>
                  <Emoji symbol="➡️" size={14} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Nearby Centers */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Nearby Centers
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>View Map</Text>
            </TouchableOpacity>
          </View>

          {nearbyCenters.map(center => (
            <TouchableOpacity
              key={center.id}
              style={[styles.centerCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            >
              <View style={[styles.centerIconContainer, { backgroundColor: theme.lightBg }]}>
                <Emoji symbol="🏢" size={22} />
              </View>
              <View style={styles.centerInfo}>
                <Text style={[styles.centerName, { color: theme.text }]}>{center.name}</Text>
                <Text style={[styles.centerAddress, { color: theme.icon }]}>
                  {center.address}
                </Text>
              </View>
              <View style={styles.centerDistance}>
                <Emoji symbol="📍" size={12} />
                <Text style={[styles.distanceText, { color: theme.primary }]}>
                  {center.distance}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={[styles.quickActionsContainer, { backgroundColor: theme.lightBg }]}>
          <Text style={[styles.quickActionsTitle, { color: theme.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionButtons}>
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Emoji symbol="📋" size={22} />
              </View>
              <Text style={[styles.quickActionText, { color: theme.text }]}>Apply</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#E0F7FA' }]}>
                <Emoji symbol="📄" size={22} />
              </View>
              <Text style={[styles.quickActionText, { color: theme.text }]}>Documents</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#F1F8E9' }]}>
                <Emoji symbol="📅" size={22} />
              </View>
              <Text style={[styles.quickActionText, { color: theme.text }]}>Appointments</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFF8E1' }]}>
                <Emoji symbol="❓" size={22} />
              </View>
              <Text style={[styles.quickActionText, { color: theme.text }]}>Help</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* Demo Logout Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 32,
          alignSelf: 'center',
          backgroundColor: '#EF4444',
          paddingHorizontal: 32,
          paddingVertical: 14,
          borderRadius: 30,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#EF4444',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 2,
        }}
        // @ts-ignore
        onPress={() => navigation.replace('(auth)/login')}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginRight: 8 }}>Logout</Text>
      </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 15,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  searchOuterContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
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
    color: '#212121',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sliderContainer: {
    marginBottom: 5,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  slideContainer: {
    width: width - 40,
    paddingHorizontal: 20,
  },
  slideContent: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    overflow: 'hidden',
  },
  slideTextContent: {
    flex: 1,
    justifyContent: 'center',
  },
  slideTagContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  slideTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
  },
  slideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 6,
  },
  slideDate: {
    fontSize: 13,
    color: '#616161',
  },
  slideEmojiContainer: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mainBannerContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  mainBanner: {
    flexDirection: 'row',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerDescription: {
    color: 'white',
    opacity: 0.9,
    fontSize: 13,
    marginBottom: 16,
    maxWidth: '90%',
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontWeight: '600',
    fontSize: 13,
    marginRight: 6,
    color: '#2E8B57',
  },
  bannerImageContainer: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: width / 3 - 25,
    aspectRatio: 0.9,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: '#212121',
  },
  recommendedContainer: {
    paddingRight: 10,
  },
  schemeCard: {
    width: 180,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  schemeEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  schemeName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 6,
  },
  schemeDescription: {
    fontSize: 13,
    color: '#616161',
    marginBottom: 12,
  },
  schemeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schemeDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E8B57',
    marginRight: 4,
  },
  centerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  centerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  centerInfo: {
    flex: 1,
  },
  centerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  centerAddress: {
    fontSize: 13,
    color: '#757575',
  },
  centerDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2E8B57',
    marginLeft: 4,
  },
  quickActionsContainer: {
    marginTop: 24,
    marginBottom: 40,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  quickActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#616161',
  },
});
