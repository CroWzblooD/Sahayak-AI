import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI("AIzaSyDqWpeErNqE79KalumA1dFaezG4wPmBTZw");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ta', name: 'தமிழ்' },
  // Add more languages as needed
];

const SAHAYAK_PROMPT = {
  en: `You are Sahayak AI Assistant, an expert in Indian government schemes, policies and citizen services. Respond in English.`,
  
  hi: `आप सहायक AI असिस्टेंट हैं, भारतीय सरकारी योजनाओं, नीतियों और नागरिक सेवाओं में विशेषज्ञ हैं। हिंदी में जवाब दें।`,
  
  bn: `আপনি সহায়ক AI সহকারী, ভারতীয় সরকারি প্রকল্প, নীতি এবং নাগরিক পরিষেবায় বিশেষজ্ঞ। বাংলায় উত্তর দিন।`,
  
  te: `మీరు సహాయక్ AI అసిస్టెంట్, భారత ప్రభుత్వ పథకాలు, విధానాలు మరియు పౌర సేవలలో నిపుణులు. తెలుగులో సమాధానం ఇవ్వండి।`,
  
  ta: `நீங்கள் சஹாயக் AI உதவியாளர், இந்திய அரசு திட்டங்கள், கொள்கைகள் மற்றும் குடிமக்கள் சேவைகளில் நிபுணர். தமிழில் பதிலளிக்கவும்.`
};

const FORMAT_INSTRUCTIONS = {
  en: `
RESPONSE FORMATTING RULES:
1. Always structure responses with clear sections using markdown:
   • Main headings: Use **heading** bold for primary sections
   • Subheadings: Use **subheading** bold for subsections
   • Use bullet points (•) for lists
   • Use numbered lists (1.) for steps or sequences
   • Use bold (**text**) for key terms
   • Use tables for comparative data

2. Every response must include:
   • A brief introduction (1-2 lines)
   • Clearly structured main content
   • A concise conclusion or next steps
   • 2-3 relevant follow-up questions

EXAMPLE STRUCTURE:
**[Topic Name]**
Brief introduction...

**[Key Points]**
• Point 1
• Point 2
• Point 3

**[Detailed Breakdown]**
1. First step...
2. Second step...

**[Next Steps]**
• **[Recommendation 1]**
• **[Recommendation 2]**

**[Follow-up Questions]**
• Question 1?
• Question 2?
`,

  hi: `
इस प्रारूप में जवाब दें:
- **शीर्षक** के लिए बोल्ड का उपयोग करें
- • बिंदुओं के लिए उपयोग करें
- चरणों को 1., 2., आदि के रूप में क्रमांकित करें
- महत्वपूर्ण शब्दों को बोल्ड में रखें`,

  bn: `
এই ফর্ম্যাটে উত্তর দিন:
- **শিরোনাম** এর জন্য বোল্ড ব্যবহার করুন
- • বুলেট পয়েন্টের জন্য ব্যবহার করুন
- ধাপগুলি 1., 2., ইত্যাদি হিসাবে নম্বর করুন
- গুরুত্বপূর্ণ শব্দগুলি বোল্ড রাখুন`,

  te: `
ఈ ఫార్మాట్‌లో సమాధానం ఇవ్వండి:
- **శీర్షిక** కోసం బోల్డ్ ఉపయోగించండి
- • బుల్లెట్ పాయింట్ల కోసం ఉపయోగించండి
- దశలను 1., 2., మొదలైనవిగా సంఖ్యలు వేయండి
- ముఖ్యమైన పదాలను బోల్డ్‌లో ఉంచండి`,

  ta: `
இந்த வடிவத்தில் பதிலளிக்கவும்:
- **தலைப்பு** க்கு போல்ட் பயன்படுத்தவும்
- • புள்ளி விவரங்களுக்கு பயன்படுத்தவும்
- படிகளை 1., 2., போன்றவை என எண்ணிடவும்
- முக்கிய சொற்களை போல்டில் வைக்கவும்`
};

type SupportedLanguage = 'en' | 'hi' | 'bn' | 'te' | 'ta';

export const aiService = {
  async getTextResponse(prompt: string, language: SupportedLanguage = 'en') {
    try {
      const result = await model.generateContent(`
        ${SAHAYAK_PROMPT[language]}
        
        ${FORMAT_INSTRUCTIONS[language]}
        
        User Query: ${prompt}
      `);
      
      const response = await result.response;
      const formattedText = response.text()
    //     .replace(/\*\*(.*?)\*\*/g, '**$1**')
    //     .replace(/[-*]/g, '•')
    //     .replace(/\n\s*\n/g, '\n\n')
    //     .trim();

      return formattedText;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async processVoiceToText(audioUri: string) {
    try {
      // Here you would implement actual voice-to-text processing
      // For now, returning a placeholder response
      return "I heard your voice message. How can I help you?";
    } catch (error) {
      console.error('Voice processing error:', error);
      throw error;
    }
  },

  async processDocument(imageUri: string) {
    try {
      // Here you would implement actual image processing
      // For now, returning a placeholder response
      return "I can see the image you've shared. How can I help you with it?";
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  },

  async analyzeEligibility(userDetails: string, schemeDetails: string) {
    try {
      const result = await model.generateContent(`
        As an expert in Indian government schemes, analyze the following:

        User Details:
        ${userDetails}

        Scheme Details:
        ${schemeDetails}

        Please provide:
        1. Eligibility assessment
        2. Required documents
        3. Alternative recommendations

        Format the response in clear sections with bullet points.
      `);
      
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing eligibility:', error);
      throw error;
    }
  }
}; 