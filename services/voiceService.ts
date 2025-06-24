import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';

// API keys
const GOOGLE_SPEECH_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY || "AIzaSyA-e3uivpNa_3xqh8-W9gyA6SdVSM_4KFw";

// Voice types available for TTS
type VoiceType = 'default' | 'male' | 'female';

// Supported languages mapping for speech recognition
const SPEECH_RECOGNITION_LANGUAGES = {
  en: 'en-US',
  hi: 'hi-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  gu: 'gu-IN',
};

// Supported languages mapping for text-to-speech
const TTS_LANGUAGES = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  gu: 'gu-IN',
};

// TTS voice options by language and gender
const TTS_VOICES = {
  en: {
    male: 'en-IN-Standard-B',
    female: 'en-IN-Standard-A',
    default: 'en-IN-Standard-A',
  },
  hi: {
    male: 'hi-IN-Standard-B',
    female: 'hi-IN-Standard-A',
    default: 'hi-IN-Standard-A',
  },
  bn: {
    male: 'bn-IN-Standard-B',
    female: 'bn-IN-Standard-A',
    default: 'bn-IN-Standard-A',
  },
  te: {
    male: 'te-IN-Standard-B',
    female: 'te-IN-Standard-A',
    default: 'te-IN-Standard-A',
  },
  ta: {
    male: 'ta-IN-Standard-B',
    female: 'ta-IN-Standard-A',
    default: 'ta-IN-Standard-A',
  },
  kn: {
    male: 'kn-IN-Standard-B',
    female: 'kn-IN-Standard-A',
    default: 'kn-IN-Standard-A',
  },
  gu: {
    male: 'gu-IN-Standard-B',
    female: 'gu-IN-Standard-A',
    default: 'gu-IN-Standard-A',
  },
};

// Managing recording state
let recording: Audio.Recording | null = null;
let audioPlayer: Audio.Sound | null = null;

export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'kn' | 'gu';

export const voiceService = {
  // Text-to-Speech using expo-speech (simpler, works offline)
  async speakText(text: string, language: SupportedLanguage = 'en', voiceType: VoiceType = 'default'): Promise<void> {
    try {
      // Stop any existing speech
      await Speech.stop();
      
      // Configure speech options
      const options = {
        language: TTS_LANGUAGES[language] || TTS_LANGUAGES.en,
        pitch: 1.0,
        rate: 0.9, // Slightly slower for better clarity
        voice: TTS_VOICES[language]?.[voiceType] || TTS_VOICES[language]?.default,
      };
      
      // Start speaking
      await Speech.speak(text, options);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      return Promise.reject(error);
    }
  },
  
  // Check if text is currently being spoken
  isSpeaking: async (): Promise<boolean> => {
    return await Speech.isSpeakingAsync();
  },
  
  // Stop any ongoing speech
  stopSpeaking: async (): Promise<void> => {
    await Speech.stop();
  },
  
  // Start recording audio for speech-to-text
  startRecording: async (): Promise<void> => {
    try {
      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      
      if (!granted) {
        throw new Error('Audio recording permission not granted');
      }
      
      // Prepare the audio recorder
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      
      // Create and prepare a new recording
      const recordingOptions: Audio.RecordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        }
      };
      
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(recordingOptions);
      await newRecording.startAsync();
      
      recording = newRecording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  },
  
  // Stop recording and transcribe the audio
  stopRecordingAndTranscribe: async (language: SupportedLanguage = 'en'): Promise<string> => {
    try {
      if (!recording) {
        throw new Error('No active recording found');
      }
      
      // Stop the recording
      await recording.stopAndUnloadAsync();
      
      // Get the recording URI
      const uri = recording.getURI();
      if (!uri) {
        throw new Error('Recording URI not found');
      }
      
      // Reset the recording state
      recording = null;
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      
      // Read the audio file as base64
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('Recording file not found');
      }
      
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Send to Google Speech-to-Text API
      const transcription = await voiceService.transcribeAudio(base64Audio, language);
      
      // Clean up the temporary file
      await FileSystem.deleteAsync(uri).catch(err => 
        console.warn('Failed to delete temporary recording:', err)
      );
      
      return transcription;
    } catch (error) {
      console.error('Failed to transcribe audio:', error);
      if (recording) {
        try {
          // Try to stop and unload if there was an error
          await recording.stopAndUnloadAsync();
        } catch (stopError) {
          // Ignore errors when cleaning up
        }
        recording = null;
      }
      
      // Reset audio mode in case of error
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      }).catch(() => {});
      
      throw error;
    }
  },
  
  // Cancel ongoing recording
  cancelRecording: async (): Promise<void> => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
          await FileSystem.deleteAsync(uri).catch(() => {});
        }
      } catch (error) {
        console.warn('Error canceling recording:', error);
      }
      recording = null;
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      }).catch(() => {});
    }
  },
  
  // Check if currently recording
  isRecording: (): boolean => {
    return recording !== null;
  },
  
  // Call Google Speech-to-Text API to transcribe audio
  transcribeAudio: async (base64Audio: string, language: SupportedLanguage = 'en'): Promise<string> => {
    try {
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_SPEECH_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config: {
              encoding: 'LINEAR16',
              sampleRateHertz: 44100,
              languageCode: SPEECH_RECOGNITION_LANGUAGES[language] || SPEECH_RECOGNITION_LANGUAGES.en,
              model: 'default',
              enableAutomaticPunctuation: true,
            },
            audio: {
              content: base64Audio,
            },
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Speech API error:', data);
        throw new Error(data.error?.message || 'Failed to transcribe audio');
      }
      
      // Extract the transcription text
      if (
        data.results &&
        data.results.length > 0 &&
        data.results[0].alternatives &&
        data.results[0].alternatives.length > 0
      ) {
        return data.results[0].alternatives[0].transcript || '';
      }
      
      return '';
    } catch (error) {
      console.error('Error calling Speech-to-Text API:', error);
      throw error;
    }
  },
  
  // Play the recorded audio for verification
  playRecordedAudio: async (uri: string): Promise<void> => {
    try {
      // Stop any existing playback
      if (audioPlayer) {
        await audioPlayer.stopAsync();
        await audioPlayer.unloadAsync();
        audioPlayer = null;
      }
      
      // Load and play the audio
      const { sound } = await Audio.Sound.createAsync({ uri });
      audioPlayer = sound;
      
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  },
  
  // Stop playing audio
  stopPlayingAudio: async (): Promise<void> => {
    if (audioPlayer) {
      try {
        await audioPlayer.stopAsync();
        await audioPlayer.unloadAsync();
      } catch (error) {
        console.warn('Error stopping audio playback:', error);
      }
      audioPlayer = null;
    }
  },
}; 