import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || "AIzaSyCXuS_V-WkItGd5UXqpp35B8w6MkjmJu5E");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const GOOGLE_SPEECH_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY || "AIzaSyA-e3uivpNa_3xqh8-W9gyA6SdVSM_4KFw";

// Add conversation context types
type ConversationContext = {
  lastMessage?: string;
  topic?: string;
  messageCount: number;
};

export const voiceAIService = {
  context: {
    messageCount: 0,
    lastMessage: '',
    topic: ''
  } as ConversationContext,

  // Clean and format the response for speech
  cleanResponseForSpeech(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\[(.*?)\]/g, '$1')      // Remove markdown links
      .replace(/\n\n/g, ' ')            // Replace double newlines with space
      .replace(/\n/g, ' ')              // Replace single newlines with space
      .replace(/\s+/g, ' ')             // Replace multiple spaces with single space
      .replace(/[•●]/g, '')             // Remove bullet points
      .replace(/[""]/g, '')             // Remove double quotes
      .replace(/^(AI:|Assistant:|Bot:)/i, '')
      .trim();
  },

  // Format response for display
  formatResponseForDisplay(text: string): string {
    // Keep formatting but make it more readable
    return text
      .replace(/\n{3,}/g, '\n\n')      // Normalize multiple newlines
      .replace(/^[-•●]\s*/gm, '• ')     // Standardize bullet points
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/^(AI:|Assistant:|Bot:)/i, '')
      .trim();
  },

  async speechToText(audioBase64: string, languageCode: string): Promise<string> {
    try {
      // Log for debugging
      console.log('Starting speech to text with language:', languageCode);
      
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_SPEECH_API_KEY}`, // Use API key in URL
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config: {
              encoding: 'WEBM_OPUS',  // Changed encoding format
              sampleRateHertz: 48000, // Updated sample rate
              languageCode: languageCode,
              model: 'default',
              enableAutomaticPunctuation: true,
            },
            audio: {
              content: audioBase64
            }
          })
        }
      );

      const data = await response.json();
      console.log('Speech API response:', data); // Log response for debugging

      if (!response.ok) {
        throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
      }

      if (!data.results || !data.results[0]) {
        throw new Error('No transcription results');
      }

      return data.results[0].alternatives[0].transcript;
    } catch (error: any) {
      console.error('Detailed speech to text error:', error);
      throw error;
    }
  },

  async getAIResponse(
    message: string,
    languageCode: string
  ): Promise<{ displayText: string; speechText: string }> {
    try {
      // Create a context-aware prompt
      const prompt = `
        Role: You are a helpful and friendly AI assistant specializing in providing information about government schemes and general assistance.

        Context: User is speaking in ${languageCode === 'hi' ? 'Hindi' : 'English'}
        Previous interaction: ${this.context.lastMessage || 'None'}
        
        User message: "${message}"

        Instructions:
        1. If the message is about government schemes:
           - Provide accurate, up-to-date information
           - Include eligibility criteria if relevant
           - Mention how to apply if applicable
        2. If it's a general question:
           - Give clear, concise answers
           - Be conversational and friendly
        3. If it's a greeting or casual conversation:
           - Respond naturally and warmly
        4. If the query is unclear:
           - Ask for clarification politely
        
        Please respond in ${languageCode === 'hi' ? 'Hindi' : 'English'}.
        Keep the response natural and conversational.
      `;

      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }]}],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          topP: 0.8,
          topK: 40,
        },
      });

      let rawResponse = response.response.text().trim();
      
      // Update context
      this.context = {
        lastMessage: message,
        messageCount: (this.context.messageCount || 0) + 1,
      };

      // Format responses
      const displayText = this.formatResponseForDisplay(rawResponse);
      const speechText = this.cleanResponseForSpeech(rawResponse);

      return { displayText, speechText };
    } catch (error: any) {
      console.error('AI Response error:', error);
      throw error;
    }
  },

  getFallbackResponse(languageCode: string): string {
    const fallbacks: { [key: string]: string[] } = {
      'en': [
        "I didn't catch that clearly. Could you please repeat?",
        "Sorry, I didn't understand. Could you say that again?",
        "Could you please rephrase that?"
      ],
      'hi': [
        "मैं ठीक से नहीं सुन पाया। क्या आप दोहरा सकते हैं?",
        "क्षमा करें, मैं समझ नहीं पाया। क्या आप फिर से कह सकते हैं?",
        "क्या आप इसे दूसरे तरीके से कह सकते हैं?"
      ]
    };

    const responses = fallbacks[languageCode] || fallbacks['en'];
    return responses[Math.floor(Math.random() * responses.length)];
  }
};

export default voiceAIService; 