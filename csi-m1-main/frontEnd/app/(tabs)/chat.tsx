import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { aiService, SUPPORTED_LANGUAGES } from '@/services/aiService';
import * as Speech from 'expo-speech';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { voiceAIService } from '@/services/voiceAIService';
import * as FileSystem from 'expo-file-system';

const THEME_COLORS = {
  primary: '#34D399',
  secondary: '#10B981',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#1F2937',
  lightText: '#6B7280',
};

type InputMode = 'text' | 'voice' | 'upload';
type Message = {
  id: string;
  text: string;
  isUser: boolean;
  type: 'text' | 'voice' | 'upload';
  timestamp: Date;
};

const SUGGESTIONS = {
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
  // Add more languages as needed
};

// Add this for voice recording
const RECORDING_OPTIONS = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

// First, initialize Gemini with proper error handling
const genAI = new GoogleGenerativeAI("AIzaSyA-e3uivpNa_3xqh8-W9gyA6SdVSM_4KFw");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Add rate limiting
let lastRequestTime = 0;
const RATE_LIMIT_MS = 1000; // 1 second between requests

const FormattedMessage = ({ text, isUser }: { text: string; isUser: boolean }) => {
  const processText = (rawText: string) => {
    const sections = rawText.split('\n\n');
    return sections.map((section, index) => {
      if (section.startsWith('**') && section.endsWith('**')) {
        // Header/title
        return (
          <Text key={index} style={styles.sectionHeader}>
            {section.replace(/\*\*/g, '')}
          </Text>
        );
      }
      
      // Process bullet points and normal text
      const lines = section.split('\n');
      return (
        <View key={index} style={styles.section}>
          {lines.map((line, lineIndex) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('•')) {
              return (
                <View key={lineIndex} style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={[styles.bulletText, isUser && styles.userText]}>
                    {trimmedLine.substring(1).trim()}
                  </Text>
                </View>
              );
            }
            return (
              <Text key={lineIndex} style={[styles.normalText, isUser && styles.userText]}>
                {trimmedLine}
              </Text>
            );
          })}
        </View>
      );
    });
  };

  return <View style={styles.formattedMessage}>{processText(text)}</View>;
};

// First define the styles without any dynamic values
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
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME_COLORS.text,
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
    shadowRadius: 4,
    elevation: 2,
  },
  formattedMessage: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 12,
    marginTop: 8,
  },
  section: {
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    paddingLeft: 12,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: THEME_COLORS.primary,
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  normalText: {
    fontSize: 15,
    color: THEME_COLORS.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  userText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 11,
    color: THEME_COLORS.lightText,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    backgroundColor: THEME_COLORS.card,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: THEME_COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginTop: 8,
  },
  voiceIndicatorText: {
    fontSize: 14,
    color: '#666',
  },
  voiceButton: {
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  voiceButtonActive: {
    backgroundColor: THEME_COLORS.primary,
  },
  voiceButtonInactive: {
    backgroundColor: '#F3F4F6',
  },
  voiceButtonTextActive: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  voiceButtonTextInactive: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  uploadButton: {
    backgroundColor: `${THEME_COLORS.primary}15`,
    borderRadius: 24,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: THEME_COLORS.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: THEME_COLORS.lightText,
  },
  suggestionsContainer: {
    maxHeight: 50,
    marginBottom: 12,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
  },
  suggestionChip: {
    backgroundColor: `${THEME_COLORS.primary}15`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    color: THEME_COLORS.primary,
    fontSize: 14,
  },
  voiceButtonContainer: {
    alignItems: 'center',
    width: '100%',
    padding: 16,
  },
  transcribingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: `${THEME_COLORS.primary}15`,
    padding: 8,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
  },
  transcribingText: {
    marginLeft: 8,
    color: THEME_COLORS.primary,
    fontSize: 14,
  },
  transcribedText: {
    marginTop: 12,
    color: THEME_COLORS.lightText,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    width: '100%',
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
});

export default function ChatScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hello! I'm your Sahayak AI Assistant. How can I help you today?",
      isUser: false,
      type: 'text',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0]);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Move VoiceButton outside of the main component
  type VoiceButtonProps = {
    isRecording: boolean;
    isTranscribing: boolean;
    transcribedText: string | null;
    onPress: () => void;
  };

  const VoiceButton = ({ 
    isRecording, 
    isTranscribing, 
    transcribedText, 
    onPress 
  }: VoiceButtonProps) => (
    <View style={styles.voiceButtonContainer}>
      <Pressable 
        style={[
          styles.voiceButton,
          isRecording ? styles.voiceButtonActive : styles.voiceButtonInactive
        ]}
        onPress={onPress}
      >
        <MaterialCommunityIcons 
          name={isRecording ? "microphone" : "microphone-off"} 
          size={24} 
          color={isRecording ? "white" : "#666"} 
        />
        <Text style={isRecording ? styles.voiceButtonTextActive : styles.voiceButtonTextInactive}>
          {isRecording ? "Listening..." : "Press to speak"}
        </Text>
      </Pressable>
      {isTranscribing && (
        <View style={styles.transcribingIndicator}>
          <ActivityIndicator color={THEME_COLORS.primary} size="small" />
          <Text style={styles.transcribingText}>Transcribing...</Text>
        </View>
      )}
      {transcribedText && (
        <Text style={styles.transcribedText}>"{transcribedText}"</Text>
      )}
    </View>
  );

  // Fix Speech initialization
  useEffect(() => {
    const initSpeech = async () => {
      try {
        await Speech.stop();
        // Remove setDefaultLanguage as it's not available
        await Speech.speak('', { language: selectedLanguage.code }); // Initialize with empty text
      } catch (error) {
        console.error('Speech initialization error:', error);
      }
    };

    initSpeech();
    return () => {
      Speech.stop();
    };
  }, [selectedLanguage]);

  // Add unique keys to messages
  const addMessage = (text: string, isUser: boolean, type: Message['type'] = 'text') => {
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      text,
      isUser,
      type,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMessage = inputText.trim();
    setInputText('');
    addMessage(userMessage, true, 'text');
    setIsLoading(true);
    
    try {
      const response = await aiService.getTextResponse(userMessage, selectedLanguage.code);
      if (response) {
        addMessage(response, false, 'text');
      } else {
        throw new Error('Empty response');
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage("I apologize for the inconvenience. Please try rephrasing your question.", false, 'text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };

  useEffect(() => {
    (async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: '.webm',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_WEBM,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_OPUS,
          sampleRate: 48000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.webm',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
          sampleRate: 48000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCM: false,
          audioFormat: Audio.RECORDING_OPTION_IOS_AUDIO_FORMAT_OPUS
        },
      });

      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      setTranscribedText('');
      
      console.log('Started recording');
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      console.log('Stopping recording');
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      console.log('Recording stopped, URI:', uri);
      if (uri) {
        await handleVoiceInput(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  const handleVoiceInput = async (uri: string) => {
    setIsProcessingVoice(true);
    setIsTranscribing(true);
    
    try {
      console.log('Processing voice input from URI:', uri);

      // Convert audio file to base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Audio converted to base64');

      // Get transcription
      const transcription = await voiceAIService.speechToText(
        base64Audio,
        selectedLanguage.code
      );
      
      console.log('Transcription received:', transcription);

      // Show transcribed text
      setTranscribedText(transcription);
      const userMessage = selectedLanguage.code === 'hi' ? 
        `आपने कहा: ${transcription}` : 
        `You said: ${transcription}`;
      addMessage(userMessage, true, 'voice');

      // Get AI response
      const { displayText, speechText } = await voiceAIService.getAIResponse(
        transcription,
        selectedLanguage.code
      );

      // Show and speak response
      addMessage(displayText, false, 'voice');
      await speakResponse(speechText);

    } catch (error) {
      console.error('Detailed voice processing error:', error);
      const errorMsg = selectedLanguage.code === 'hi' ? 
        'माफ़ कीजिये, कुछ तकनीकी समस्या हुई। कृपया दोबारा कोशिश करें।' :
        'Sorry, there was a technical issue. Please try again.';
      addMessage(errorMsg, false, 'voice');
      await speakResponse(errorMsg);
    } finally {
      setIsProcessingVoice(false);
      setIsTranscribing(false);
    }
  };

  const speakResponse = async (text: string) => {
    try {
      await Speech.stop();
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      
      for (const sentence of sentences) {
        await new Promise<void>((resolve) => {
          Speech.speak(sentence.trim(), {
            language: selectedLanguage.code,
            pitch: 1.1,
            rate: selectedLanguage.code === 'hi' ? 0.8 : 0.9,
            onDone: () => {
              setTimeout(resolve, 250);
            },
            onError: (error) => {
              console.error('Speech error:', error);
              resolve();
            }
          });
        });
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
    }
  };

  const handleImageUpload = async () => {
    try {
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to upload images.');
        return;
      }

      // Launch image picker with updated options
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true, // Get base64 data for API processing
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        
        // Show loading state
        setIsLoading(true);
        addMessage("Processing your image...", false, 'text');

        try {
          // Create FormData for image upload
          const formData = new FormData();
          formData.append('image', {
            uri: selectedAsset.uri,
            type: 'image/jpeg',
            name: 'upload.jpg'
          });

          // Process the image
          const response = await aiService.processDocument(selectedAsset.uri);
          
          // Add the response to chat
          if (response) {
            addMessage(response, false, 'text');
          } else {
            throw new Error('No response from image processing');
          }
        } catch (error) {
          console.error('Image processing error:', error);
          addMessage("Sorry, I couldn't process the image. Please try again.", false, 'text');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const renderInputSection = () => {
    switch (inputMode) {
      case 'voice':
        return (
          <View style={styles.voiceInputContainer}>
            <VoiceButton 
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              transcribedText={transcribedText}
              onPress={isRecording ? stopRecording : startRecording}
            />
          </View>
        );
      
      case 'upload':
        return (
          <Pressable
            style={styles.uploadButton}
            onPress={handleImageUpload}>
            <View style={styles.uploadButtonContent}>
              <MaterialCommunityIcons
                name="image-plus"
                size={28}
                color={THEME_COLORS.primary}
              />
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </View>
          </Pressable>
        );
      
      default:
        return (
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <Pressable
              style={[styles.sendButton, !inputText && styles.sendButtonDisabled]}
              disabled={!inputText || isLoading}
              onPress={handleSend}>
              <MaterialCommunityIcons
                name="send"
                size={24}
                color={inputText && !isLoading ? 'white' : THEME_COLORS.lightText}
              />
            </Pressable>
          </View>
        );
    }
  };

  const renderSuggestions = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.suggestionsContainer}
      contentContainerStyle={styles.suggestionsContent}>
      {SUGGESTIONS[selectedLanguage.code as keyof typeof SUGGESTIONS]?.map((suggestion, index) => (
        <Pressable
          key={index}
          style={styles.suggestionChip}
          onPress={() => handleSuggestionPress(suggestion)}>
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sahayak Assistant</Text>
        <Pressable 
          style={styles.languageButton}
          onPress={() => {
            const nextLangIndex = (SUPPORTED_LANGUAGES.findIndex(
              lang => lang.code === selectedLanguage.code
            ) + 1) % SUPPORTED_LANGUAGES.length;
            setSelectedLanguage(SUPPORTED_LANGUAGES[nextLangIndex]);
          }}>
          <MaterialCommunityIcons name="translate" size={20} color={THEME_COLORS.primary} />
          <Text style={styles.languageButtonText}>{selectedLanguage.name}</Text>
        </Pressable>
      </View>

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
                <MaterialCommunityIcons name="robot" size={24} color={THEME_COLORS.primary} />
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
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        {renderSuggestions()}
        <View style={styles.inputModeToggle}>
          <Pressable
            style={[styles.modeButton, inputMode === 'text' && styles.modeButtonActive]}
            onPress={() => setInputMode('text')}>
            <MaterialCommunityIcons name="keyboard" size={24} color={inputMode === 'text' ? THEME_COLORS.primary : THEME_COLORS.lightText} />
          </Pressable>
          <Pressable
            style={[styles.modeButton, inputMode === 'voice' && styles.modeButtonActive]}
            onPress={() => setInputMode('voice')}>
            <MaterialCommunityIcons name="microphone" size={24} color={inputMode === 'voice' ? THEME_COLORS.primary : THEME_COLORS.lightText} />
          </Pressable>
          <Pressable
            style={[styles.modeButton, inputMode === 'upload' && styles.modeButtonActive]}
            onPress={() => setInputMode('upload')}>
            <MaterialCommunityIcons name="upload" size={24} color={inputMode === 'upload' ? THEME_COLORS.primary : THEME_COLORS.lightText} />
          </Pressable>
        </View>
        {renderInputSection()}
      </View>
    </SafeAreaView>
  );
} 