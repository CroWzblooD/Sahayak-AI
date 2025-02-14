import { 
  StyleSheet, 
  Platform, 
  Pressable, 
  FlatList, 
  Image, 
  Dimensions,
  View,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

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

interface Scheme {
  id: string;
  title: string;
  category: string;
  deadline: Date;
  eligibility: string;
  icon: keyof typeof Ionicons.glyphMap;
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

export default function HomeScreen() {
  const router = useRouter();

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
      onPress={() => router.push({
        pathname: "/(tabs)/schemes" as const,
        params: { id: item.id }
      })}>
      <View style={styles.schemeIcon}>
        <Ionicons name={item.icon} size={24} color={THEME_COLORS.primary} />
      </View>
      <View style={styles.schemeInfo}>
        <ThemedText type="title" style={styles.schemeTitle}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.schemeCategory}>
          {item.category}
        </ThemedText>
        <View style={styles.schemeDeadline}>
          <Ionicons name="time-outline" size={16} color={THEME_COLORS.lightText} />
          <ThemedText style={styles.deadlineText}>
            Deadline: {item.deadline.toLocaleDateString()}
          </ThemedText>
        </View>
      </View>
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
            <Pressable style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={32} color={THEME_COLORS.primary} />
            </Pressable>
          </View>

          <Pressable style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={THEME_COLORS.lightText} />
            <ThemedText style={styles.searchText}>Search government schemes...</ThemedText>
            <Ionicons name="mic-outline" size={20} color={THEME_COLORS.primary} />
          </Pressable>
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
              Featured Schemes
            </ThemedText>
            <Pressable>
              <ThemedText style={styles.seeAll}>View All</ThemedText>
            </Pressable>
          </View>
          <FlatList
            data={FEATURED_SCHEMES}
            renderItem={renderSchemeCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.schemesList}
          />
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: THEME_COLORS.lightText,
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
    flexDirection: 'row',
    backgroundColor: THEME_COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: width * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    color: THEME_COLORS.text,
    marginBottom: 4,
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
    fontSize: 12,
    color: THEME_COLORS.lightText,
    marginLeft: 4,
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
});