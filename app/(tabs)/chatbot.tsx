import { aiService } from '@/services/aiService';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const THEME_COLORS = {
  primary: '#34D399',
  secondary: '#10B981',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#1F2937',
  lightText: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
};

type InputMode = 'text' | 'voice' | 'upload';
type Message = {
  id: string;
  text: string;
  isUser: boolean;
  type: 'text';
  timestamp: Date;
};

type SupportedLanguage = 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'kn' | 'gu';

// Define a more specific type for selectedLanguage to avoid type mismatches
type LanguageOption = {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  emoji: string;
};

// Explicitly cast the suggestions object keys
const SUGGESTIONS: Record<SupportedLanguage, string[]> = {
  en: [
    "What schemes are available for farmers?",
    "Tell me about PM Kisan Yojana",
    "Education scholarships for students",
    "Healthcare benefits for senior citizens",
    "Women empowerment schemes"
  ],
  hi: [
    "किसानों के लिए कौन सी योजनाएं उपलब्ध हैं?",
    "पीएम किसान योजना के बारे में बताएं",
    "छात्रों के लिए शिक्षा छात्रवृत्ति",
    "वरिष्ठ नागरिकों के लिए स्वास्थ्य लाभ",
    "महिला सशक्तिकरण योजनाएं"
  ],
  bn: [
    "কৃষকদের জন্য কি কি প্রকল্প উপলব্ধ?",
    "পিএম কিষাণ যোজনা সম্পর্কে বলুন",
    "ছাত্রদের জন্য শিক্ষা বৃত্তি",
    "বয়স্ক নাগরিকদের জন্য স্বাস্থ্যসেবা সুবিধা",
    "মহিলা ক্ষমতায়ন প্রকল্প"
  ],
  te: [
    "రైతులకు ఏ పథకాలు అందుబాటులో ఉన్నాయి?",
    "పిఎం కిసాన్ యోజన గురించి చెప్పండి",
    "విద్యార్థులకు విద్యా స్కాలర్‌షిప్‌లు",
    "వృద్ధులకు ఆరోగ్య ప్రయోజనాలు",
    "మహిళా సాధికారత పథకాలు"
  ],
  ta: [
    "விவசாயிகளுக்கு என்ன திட்டங்கள் உள்ளன?",
    "பிஎம் கிசான் யோஜனா பற்றி சொல்லுங்கள்",
    "மாணவர்களுக்கான கல்வி உதவித்தொகை",
    "முதியோருக்கான சுகாதார நலன்கள்",
    "பெண்கள் அதிகாரமளிப்பு திட்டங்கள்"
  ],
  kn: [
    "ರೈತರಿಗೆ ಯಾವ ಯೋಜನೆಗಳು ಲಭ್ಯವಿವೆ?",
    "ಪಿಎಂ ಕಿಸಾನ್ ಯೋಜನೆ ಬಗ್ಗೆ ತಿಳಿಸಿ",
    "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಶಿಕ್ಷಣ ವಿದ್ಯಾರ್ಥಿ ವೇತನ",
    "ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ ಆರೋಗ್ಯ ಪ್ರಯೋಜನಗಳು",
    "ಮಹಿಳಾ ಸಬಲೀಕರಣ ಯೋಜನೆಗಳು"
  ],
  gu: [
    "ખેડૂતો માટે કઈ યોજનાઓ ઉપલબ્ધ છે?",
    "PM કિસાન યોજના વિશે મને કહો",
    "વિદ્યાર્થીઓ માટે શિક્ષણ શિષ્યવૃત્તિ",
    "વરિષ્ઠ નાગરિકો માટે આરોગ્ય લાભ",
    "મહિલા સશક્તિકરણ યોજનાઓ"
  ]
};

// Define SUPPORTED_LANGUAGES with proper type casting
const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en' as SupportedLanguage, name: 'English', nativeName: 'English', emoji: '🇮🇳' },
  { code: 'hi' as SupportedLanguage, name: 'Hindi', nativeName: 'हिंदी', emoji: '🇮🇳' },
  { code: 'bn' as SupportedLanguage, name: 'Bengali', nativeName: 'বাংলা', emoji: '🇮🇳' },
  { code: 'te' as SupportedLanguage, name: 'Telugu', nativeName: 'తెలుగు', emoji: '🇮🇳' },
  { code: 'ta' as SupportedLanguage, name: 'Tamil', nativeName: 'தமிழ்', emoji: '🇮🇳' },
  { code: 'kn' as SupportedLanguage, name: 'Kannada', nativeName: 'ಕನ್ನಡ', emoji: '🇮🇳' },
  { code: 'gu' as SupportedLanguage, name: 'Gujarati', nativeName: 'ગુજરાતી', emoji: '🇮🇳' }
];

const FormattedMessage = ({ text, isUser }: { text: string; isUser: boolean }) => {
  const renderContent = () => {
    // Handle user messages directly
    if (isUser) {
      return <Text style={[styles.normalText, styles.userText]}>{text}</Text>;
    }

    // Process and render bot messages with formatting
    const processText = (rawText: string) => {
      // Identify sections by headings (bolded text surrounded by **)
      const sections = rawText.split(/(\*\*.*?\*\*)/g).filter(Boolean);
      
      return sections.map((section, sectionIndex) => {
        // If this is a heading (bold text)
        if (section.startsWith('**') && section.endsWith('**')) {
          const headingText = section.replace(/\*\*/g, '');
          return (
            <Text key={`heading-${sectionIndex}`} style={styles.sectionHeader}>
              {headingText}
            </Text>
          );
        } 
        
        // Regular content - process for bullet points, lists, etc.
        const lines = section.split('\n').filter(line => line.trim());
        
        return (
          <View key={`content-${sectionIndex}`} style={styles.contentSection}>
            {lines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              
              // Bullet point
              if (trimmedLine.startsWith('•') || trimmedLine.startsWith('·')) {
                return (
                  <View key={`bullet-${lineIndex}`} style={styles.bulletItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>
                      {trimmedLine.substring(1).trim()}
                    </Text>
                  </View>
                );
              }
              
              // Numbered list
              if (/^\d+\./.test(trimmedLine)) {
                const number = trimmedLine.match(/^\d+/)?.[0] || '';
                return (
                  <View key={`number-${lineIndex}`} style={styles.numberedItem}>
                    <Text style={styles.bulletNumber}>{number}.</Text>
                    <Text style={styles.bulletText}>
                      {trimmedLine.substring(number.length + 1).trim()}
                    </Text>
                  </View>
                );
              }
              
              // Regular text
              return (
                <Text key={`text-${lineIndex}`} style={styles.normalText}>
                  {trimmedLine}
                </Text>
              );
            })}
          </View>
        );
      });
    };

    return <>{processText(text)}</>;
  };

  return (
    <View style={styles.formattedMessage}>
      {renderContent()}
    </View>
  );
};

export default function ChatScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "👋 Hello! I'm your Sahayak AI Assistant. How can I help you today?",
      isUser: false,
      type: 'text',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [inputPadding, setInputPadding] = useState(80);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setInputPadding(4));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setInputPadding(5));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Add unique keys to messages
  const addMessage = (text: string, isUser: boolean) => {
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      isUser,
      type: 'text' as const,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMessage = inputText.trim();
    setInputText('');
    addMessage(userMessage, true);
    setIsLoading(true);
    
    try {
      const response = await aiService.getTextResponse(userMessage, selectedLanguage.code);
      if (response) {
        addMessage(response, false);
      } else {
        throw new Error('Empty response');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = selectedLanguage.code === 'en' 
        ? "I apologize for the inconvenience. Please try rephrasing your question."
        : "Sorry, there was an error. Please try again.";
      addMessage(errorMsg, false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };

  const renderInputSection = () => {
    return (
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.input}
          placeholder={selectedLanguage.code === 'en' ? "Type your message..." : "मैसेज टाइप करें..."}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <Pressable
          style={[styles.sendButton, !inputText && styles.sendButtonDisabled]}
          disabled={!inputText || isLoading}
          onPress={handleSend}>
          <MaterialIcons
            name="send"
            size={22}
            color={inputText && !isLoading ? 'white' : THEME_COLORS.lightText}
          />
        </Pressable>
      </View>
    );
  };

  const renderSuggestions = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.suggestionsContainer}
      contentContainerStyle={styles.suggestionsContent}>
      {SUGGESTIONS[selectedLanguage.code].map((suggestion, index) => (
        <Pressable
          key={index}
          style={styles.suggestionChip}
          onPress={() => handleSuggestionPress(suggestion)}>
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  const renderLanguageModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isLanguageModalVisible}
      onRequestClose={() => setIsLanguageModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <Pressable 
              style={styles.closeButton} 
              onPress={() => setIsLanguageModalVisible(false)}
            >
              <Feather name="x" size={24} color={THEME_COLORS.text} />
            </Pressable>
          </View>
          
          <FlatList
            data={SUPPORTED_LANGUAGES}
            keyExtractor={(item) => item.code}
            renderItem={({item}) => (
              <TouchableOpacity 
                style={[
                  styles.languageOption,
                  item.code === selectedLanguage.code && styles.selectedLanguageOption
                ]}
                onPress={() => {
                  setSelectedLanguage(item);
                  setIsLanguageModalVisible(false);
                }}
              >
                <Text style={styles.languageEmoji}>{item.emoji}</Text>
                <View style={styles.languageNames}>
                  <Text style={styles.languageName}>{item.name}</Text>
                  <Text style={styles.languageNativeName}>{item.nativeName}</Text>
                </View>
                {item.code === selectedLanguage.code && (
                  <MaterialIcons name="check-circle" size={24} color={THEME_COLORS.primary} />
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <MaterialCommunityIcons name="robot-happy" size={24} color={THEME_COLORS.primary} />
            <Text style={styles.headerTitle}>Sahayak Assistant</Text>
          </View>
          <Pressable 
            style={styles.languageButton}
            onPress={() => setIsLanguageModalVisible(true)}>
            <Text style={styles.languageEmoji}>{selectedLanguage.emoji}</Text>
            <Text style={styles.languageButtonText}>{selectedLanguage.nativeName}</Text>
          </Pressable>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}>
          {messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.assistantMessage,
              ]}>
              {!message.isUser && (
                <View style={styles.assistantAvatar}>
                  <MaterialCommunityIcons name="robot-happy" size={20} color={THEME_COLORS.primary} />
                </View>
              )}
              <View style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.assistantBubble,
              ]}>
                <FormattedMessage text={message.text} isUser={message.isUser} />
                <Text style={styles.timestamp}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={THEME_COLORS.primary} />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input area */}
        <View style={[styles.inputContainer, { paddingBottom: inputPadding }]}>
          {renderSuggestions()}
          <View style={styles.inputModeToggle}>
            <Pressable
              style={[styles.modeButton, styles.modeButtonActive]}
              onPress={() => setInputMode('text')}>
              <MaterialCommunityIcons name="keyboard" size={22} color={THEME_COLORS.primary} />
            </Pressable>
            <Pressable
              style={[styles.modeButton, { opacity: 0.5 }]}
              disabled={true}>
              <MaterialCommunityIcons name="microphone" size={22} color={THEME_COLORS.lightText} />
            </Pressable>
            <Pressable
              style={[styles.modeButton, { opacity: 0.5 }]}
              disabled={true}>
              <MaterialCommunityIcons name="image-plus" size={22} color={THEME_COLORS.lightText} />
            </Pressable>
          </View>
          {renderInputSection()}
        </View>
        
        {/* Language selection modal */}
        {renderLanguageModal()}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: THEME_COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
    marginLeft: '15%',
  },
  assistantMessage: {
    marginRight: '15%',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${THEME_COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: THEME_COLORS.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: THEME_COLORS.card,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  formattedMessage: {
    flex: 1,
  },
  contentSection: {
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 10,
    marginTop: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 8,
    alignItems: 'flex-start',
  },
  numberedItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: THEME_COLORS.primary,
    marginRight: 8,
    marginTop: 2,
  },
  bulletNumber: {
    fontSize: 16,
    color: THEME_COLORS.primary,
    marginRight: 6,
    minWidth: 18,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: THEME_COLORS.text,
  },
  normalText: {
    fontSize: 15,
    color: THEME_COLORS.text,
    lineHeight: 22,
    marginBottom: 4,
  },
  userText: {
    color: 'white',
    fontSize: 15,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    color: THEME_COLORS.lightText,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    backgroundColor: THEME_COLORS.card,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.border,
    padding: 16,
  },
  inputModeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    backgroundColor: `${THEME_COLORS.primary}10`,
    borderRadius: 24,
    padding: 4,
  },
  modeButton: {
    padding: 8,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: THEME_COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 120,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: THEME_COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: `${THEME_COLORS.primary}10`,
    borderRadius: 16,
    marginVertical: 8,
  },
  loadingText: {
    marginLeft: 12,
    color: THEME_COLORS.primary,
    fontWeight: '500',
  },
  suggestionsContainer: {
    maxHeight: 50,
    marginBottom: 12,
  },
  suggestionsContent: {
    paddingHorizontal: 8,
  },
  suggestionChip: {
    backgroundColor: `${THEME_COLORS.primary}15`,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: `${THEME_COLORS.primary}30`,
  },
  suggestionText: {
    color: THEME_COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: `${THEME_COLORS.primary}15`,
    borderWidth: 1,
    borderColor: `${THEME_COLORS.primary}30`,
  },
  languageButtonText: {
    marginLeft: 6,
    color: THEME_COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME_COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME_COLORS.text,
  },
  closeButton: {
    padding: 5,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  selectedLanguageOption: {
    backgroundColor: `${THEME_COLORS.primary}10`,
  },
  languageEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  languageNames: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: THEME_COLORS.text,
  },
  languageNativeName: {
    fontSize: 14,
    color: THEME_COLORS.lightText,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: THEME_COLORS.border,
  },
});
