import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Pressable, TextInput, Alert } from 'react-native';
import { Text, YStack } from 'tamagui';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { LinearGradient } from 'tamagui/linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { THEME_COLORS } from "@/constants/Colors";
import { voiceAIService } from '@/services/voiceAIService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');
const GOOGLE_SPEECH_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY;

const questions = {
  en: [
    {
      id: 'fullName',
      question: "Hi there! I'm Sahayak AI, your personal assistant. What's your full name?",
      placeholder: "Enter your full name",
      icon: "user"
    },
    {
      id: 'age',
      question: "What's your age?",
      placeholder: "Enter your age",
      icon: "calendar"
    },
    {
      id: 'occupation',
      question: "What do you do for a living?",
      placeholder: "Enter your occupation",
      icon: "briefcase"
    },
    {
      id: 'monthlyIncome',
      question: "What's your monthly income?",
      placeholder: "Enter monthly income",
      icon: "dollar-sign"
    },
    {
      id: 'education',
      question: "What's your highest education qualification?",
      placeholder: "Enter education details",
      icon: "book"
    },
    {
      id: 'caste',
      question: "Which caste category do you belong to?",
      placeholder: "Enter caste category (General/OBC/SC/ST)",
      icon: "users"
    },
    {
      id: 'location',
      question: "Which state do you live in?",
      placeholder: "Enter your state",
      icon: "map-pin"
    }
  ],
  hi: [
    {
      id: 'fullName',
      question: "नमस्ते! मैं सहायक एआई हूं, आपका व्यक्तिगत सहायक। आपका पूरा नाम क्या है?",
      placeholder: "अपना पूरा नाम दर्ज करें",
      icon: "user"
    },
    {
      id: 'age',
      question: "आपकी उम्र क्या है?",
      placeholder: "अपनी उम्र दर्ज करें",
      icon: "calendar"
    },
    {
      id: 'occupation',
      question: "आप किस काम करते हैं?",
      placeholder: "अपनी व्यवसाय दर्ज करें",
      icon: "briefcase"
    },
    {
      id: 'monthlyIncome',
      question: "आपकी मासिक आय क्या है?",
      placeholder: "मासिक आय दर्ज करें",
      icon: "dollar-sign"
    },
    {
      id: 'education',
      question: "आपकी उच्चतम शैक्षणिक पालन क्या है?",
      placeholder: "शैक्षणिक विवरण दर्ज करें",
      icon: "book"
    },
    {
      id: 'caste',
      question: "आप किस वर्ग में आते हैं?",
      placeholder: "वर्ग दर्ज करें (सामान्य/ओबीसी/एससी/एसटी)",
      icon: "users"
    },
    {
      id: 'location',
      question: "आप किस राज्य में रहते हैं?",
      placeholder: "अपने राज्य का नाम दर्ज करें",
      icon: "map-pin"
    }
  ]
};

const commonPhrases = {
  en: {
    listening: "Listening...",
    heard: "I heard:",
    isCorrect: "Is this correct?",
    tryAgain: "Please try again.",
    completion: "Thank you! Your onboarding is complete.",
    error: "Could not understand. Please speak more clearly."
  },
  hi: {
    listening: "सुन रहा हूं...",
    heard: "मैंने सुना:",
    isCorrect: "क्या यह सही है?",
    tryAgain: "कृपया पुनः प्रयास करें।",
    completion: "धन्यवाद! आपका ऑनबोर्डिंग पूरा हो गया है।",
    error: "समझ नहीं आया। कृपया स्पष्ट रूप से बोलें।"
  }
};

export default function OnboardingForm() {
  const { user } = useAuth();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [transcribedText, setTranscribedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');

  const micScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(1.5, { duration: 1000, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 0 }),
          withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );
      micScale.value = withSpring(1.2);
    } else {
      pulseScale.value = withTiming(1);
      pulseOpacity.value = withTiming(0);
      micScale.value = withSpring(1);
    }
  }, [isRecording]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const micButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }));

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const lang = await AsyncStorage.getItem('preferredLanguage');
        if (lang === 'hi' || lang === 'en') {
          setSelectedLanguage(lang);
          // Speak first question in selected language
          await Speech.speak(questions[lang][0].question, {
            language: lang === 'hi' ? 'hi-IN' : 'en-US',
            pitch: 1.0,
            rate: 0.8,
          });
        } else {
          // If no language is selected, redirect back to language selection
          router.replace('/LanguageSelect');
        }
      } catch (error) {
        console.error('Error getting language preference:', error);
        // If there's an error, redirect back to language selection
        router.replace('/LanguageSelect');
      }
    };

    initializeLanguage();
  }, []);

  const speakCurrentQuestion = async () => {
    try {
      if (await Speech.isSpeakingAsync()) {
        await Speech.stop();
      }
      
      await Speech.speak(questions[selectedLanguage][currentQuestion].question, {
        language: selectedLanguage === 'hi' ? 'hi-IN' : 'en-US',
        pitch: 1.0,
        rate: 0.8,  // Slower rate for better clarity
        voice: 'com.apple.ttsbundle.Samantha-compact',
        onStart: () => console.log('Started speaking'),
        onDone: () => console.log('Finished speaking'),
        onError: (error) => console.error('Speech error:', error)
      });
    } catch (error) {
      console.error('Error speaking:', error);
    }
  };

  useEffect(() => {
    speakCurrentQuestion();
  }, [currentQuestion]);

  const moveToNextQuestion = () => {
    if (currentQuestion < questions[selectedLanguage].length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTranscribedText('');
      setShowConfirmation(false);
      setErrorMessage('');
    } else {
      handleCompletion();
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setResponses(prev => ({
        ...prev,
        [questions[selectedLanguage][currentQuestion].id]: textInput.trim()
      }));
      setTextInput('');
      moveToNextQuestion();
    } else {
      setErrorMessage('Please enter a response');
    }
  };

  const startRecording = async () => {
    try {
      console.log('Starting recording...');
      setErrorMessage('');
      
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Microphone permission not granted');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      setTranscribedText('');

      // Visual feedback that recording has started
      if (isSpeaking) {
        await Speech.stop();
      }

      setIsSpeaking(true);
      await Speech.speak(commonPhrases[selectedLanguage].listening, {
        language: selectedLanguage === 'hi' ? 'hi-IN' : 'en-US',
        pitch: 1.0,
        rate: 0.8,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });

    } catch (err) {
      console.error('Failed to start recording:', err);
      setErrorMessage('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        await processVoiceInput(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setErrorMessage('Failed to process recording. Please try again.');
    }
  };

  const processVoiceInput = async (uri: string) => {
    try {
      setIsProcessing(true);
      
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${process.env.EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config: {
              encoding: 'WEBM_OPUS',
              sampleRateHertz: 48000,
              languageCode: selectedLanguage === 'hi' ? 'hi-IN' : 'en-US',
              model: 'command_and_search',  // Changed model for better name recognition
              enableAutomaticPunctuation: true,
              audio_channel_count: 1,
              enableWordConfidence: true,
              speechContexts: [{
                phrases: [
                  "listening",
                  "Ashish", "Kumar", "Sharma", "Singh",
                  "name", "age", "yes", "no",
                  "correct", "incorrect"
                ],
                boost: 20
              }],
              useEnhanced: true
            },
            audio: {
              content: base64Audio
            }
          })
        }
      );

      const data = await response.json();
      console.log('Speech API response:', data);

      const transcription = data.results?.[0]?.alternatives?.[0]?.transcript;
      const confidence = data.results?.[0]?.alternatives?.[0]?.confidence;

      console.log('Raw transcription:', transcription);

      if (!transcription) {
        throw new Error(commonPhrases[selectedLanguage].error);
      }

      // Clean up the transcription
      let cleanTranscription = transcription
        .replace(/listening/gi, '')
        .replace(/uh/gi, '')
        .replace(/um/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      // If it's empty after cleanup, throw error
      if (!cleanTranscription) {
        throw new Error(commonPhrases[selectedLanguage].error);
      }

      console.log('Cleaned transcription:', cleanTranscription);

      setResponses(prev => ({
        ...prev,
        [questions[selectedLanguage][currentQuestion].id]: cleanTranscription
      }));

      setTranscribedText(cleanTranscription);

      if (isSpeaking) {
        await Speech.stop();
      }

      setIsSpeaking(true);
      await Speech.speak(
        `${commonPhrases[selectedLanguage].heard} ${cleanTranscription}. ${commonPhrases[selectedLanguage].isCorrect}`,
        {
          language: selectedLanguage === 'hi' ? 'hi-IN' : 'en-US',
          pitch: 1.0,
          rate: 0.8,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false)
        }
      );

      setShowConfirmation(true);

    } catch (error) {
      console.error('Voice processing error:', error);
      handleError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = async (error: any) => {
    const errorMessage = error instanceof Error ? 
      error.message : commonPhrases[selectedLanguage].error;
    setErrorMessage(errorMessage);
    
    if (isSpeaking) {
      await Speech.stop();
    }

    setIsSpeaking(true);
    await Speech.speak(errorMessage, {
      language: selectedLanguage === 'hi' ? 'hi-IN' : 'en-US',
      pitch: 1.0,
      rate: 0.8,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const handleCompletion = async () => {
    try {
      // Verify all questions are answered
      const allQuestionsAnswered = questions[selectedLanguage].every(q => responses[q.id]);
      
      if (!allQuestionsAnswered) {
        Alert.alert('Error', 'Please answer all questions before proceeding.');
        return;
      }

      await AsyncStorage.setItem('onboardingResponses', JSON.stringify(responses));
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');

      await Speech.speak(commonPhrases[selectedLanguage].completion, {
        language: selectedLanguage === 'hi' ? 'hi-IN' : 'en-US',
        pitch: 1.0,
        rate: 0.8,
        onDone: () => {
          router.replace('/(tabs)');
        }
      });
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      Alert.alert('Error', 'Failed to save your responses. Please try again.');
    }
  };

  const handleVoiceConfirmation = async () => {
    try {
      setResponses(prev => ({
        ...prev,
        [questions[selectedLanguage][currentQuestion].id]: transcribedText
      }));

      setTranscribedText('');
      setShowConfirmation(false);

      if (currentQuestion < questions[selectedLanguage].length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setTimeout(() => {
          Speech.speak(questions[selectedLanguage][currentQuestion + 1].question, {
            language: selectedLanguage === 'hi' ? 'hi-IN' : 'en-US',
            pitch: 1.0,
            rate: 0.8,
          });
        }, 500);
      } else {
        await handleCompletion();
      }
    } catch (error) {
      console.error('Error handling confirmation:', error);
      setErrorMessage('Failed to proceed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000', '#001810']}
        style={StyleSheet.absoluteFill}
      />

      <YStack space="$4" alignItems="center" style={styles.content}>
        <View style={styles.toggleContainer}>
          <Pressable
            onPress={() => setInputMode('voice')}
            style={[
              styles.toggleButton,
              inputMode === 'voice' && styles.toggleButtonActive
            ]}
          >
            <MaterialIcons name="mic" size={24} color="#00FF9D" />
          </Pressable>
          <Pressable
            onPress={() => setInputMode('text')}
            style={[
              styles.toggleButton,
              inputMode === 'text' && styles.toggleButtonActive
            ]}
          >
            <MaterialIcons name="keyboard" size={24} color="#00FF9D" />
          </Pressable>
        </View>

        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={styles.questionBox}
        >
          <Text style={styles.questionText}>
            {questions[selectedLanguage][currentQuestion].question}
          </Text>
          {transcribedText && (
            <Text style={styles.transcriptionText}>
              "{transcribedText}"
            </Text>
          )}
        </Animated.View>

        {errorMessage && (
          <Animated.View 
            entering={FadeIn}
            style={styles.errorContainer}
          >
            <MaterialIcons name="error-outline" size={24} color="#FF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </Animated.View>
        )}

        {inputMode === 'text' ? (
          <Animated.View 
            entering={FadeIn}
            style={styles.textInputContainer}
          >
            <TextInput
              style={styles.textInput}
              placeholder={questions[selectedLanguage][currentQuestion].placeholder}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={textInput}
              onChangeText={setTextInput}
              onSubmitEditing={handleTextSubmit}
            />
            <Pressable
              onPress={handleTextSubmit}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Continue</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.recordingContainer}>
            <Animated.View style={[styles.pulse, pulseStyle]} />
            <Pressable
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
            >
              <Animated.View 
                style={[styles.micButton, micButtonStyle]}
              >
                <MaterialIcons 
                  name={isRecording ? "mic" : "mic-none"} 
                  size={32} 
                  color="#00FF9D" 
                />
              </Animated.View>
            </Pressable>
          </View>
        )}

        <View style={styles.progressContainer}>
          {questions[selectedLanguage].map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                currentQuestion === index && styles.progressDotActive
              ]}
            />
          ))}
        </View>

        {showConfirmation && (
          <View style={styles.confirmationContainer}>
            <Pressable
              style={[styles.confirmButton, styles.retryButton]}
              onPress={handleVoiceConfirmation}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </Pressable>
          </View>
        )}
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  questionBox: {
    width: width * 0.9,
    padding: 24,
    backgroundColor: 'rgba(0, 255, 157, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 157, 0.2)',
    alignItems: 'center',
  },
  questionText: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  transcriptionText: {
    color: '#00FF9D',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 12,
  },
  recordingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginTop: 40,
  },
  pulse: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#00FF9D',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 255, 157, 0.1)',
    borderWidth: 2,
    borderColor: '#00FF9D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FF9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  processingContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(0, 255, 157, 0.1)',
    borderRadius: 12,
  },
  processingText: {
    color: '#00FF9D',
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 255, 157, 0.2)',
  },
  progressDotActive: {
    backgroundColor: '#00FF9D',
    transform: [{ scale: 1.2 }],
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 255, 157, 0.1)',
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(0, 255, 157, 0.2)',
  },
  textInputContainer: {
    width: width * 0.9,
    gap: 12,
    marginTop: 20,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 157, 0.2)',
  },
  submitButton: {
    backgroundColor: 'rgba(0, 255, 157, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#00FF9D',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
  },
  confirmationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    justifyContent: 'center',
  },
  confirmButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  confirmButtonPrimary: {
    backgroundColor: 'rgba(0, 255, 157, 0.2)',
    borderWidth: 1,
    borderColor: '#00FF9D',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});