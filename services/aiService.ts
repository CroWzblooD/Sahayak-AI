import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with proper API version
const genAI = new GoogleGenerativeAI("AIzaSyCo8rxD6BkINc2cBMLoqzdMregyCfwBnK4");
// Use the correct model name - check current documentation for the latest name
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'gu', name: 'ગુજરાતી' },
  // Add more languages as needed
];

const SAHAYAK_PROMPT = {
  en: `You are Sahayak AI Assistant, an expert in Indian government schemes, policies and citizen services. Respond in English.`,
  
  hi: `आप सहायक AI असिस्टेंट हैं, भारतीय सरकारी योजनाओं, नीतियों और नागरिक सेवाओं में विशेषज्ञ हैं। हिंदी में जवाब दें।`,
  
  bn: `আপনি সহায়ক AI সহকারী, ভারতীয় সরকারি প্রকল্প, নীতি এবং নাগরিক পরিষেবায় বিশেষজ্ঞ। বাংলায় উত্তর দিন।`,
  
  te: `మీరు సహాయక్ AI అసిస్టెంట్, భారత ప్రభుత్వ పథకాలు, విధానాలు మరియు పౌర సేవలలో నిపుణులు. తెలుగులో సమాధానం ఇవ్వండి।`,
  
  ta: `நீங்கள் சஹாயக் AI உதவியாளர், இந்திய அரசு திட்டங்கள், கொள்கைகள் மற்றும் குடிமக்கள் சேவைகளில் நிபுணர். தமிழில் பதிலளிக்கவும்.`,
  
  kn: `ನೀವು ಸಹಾಯಕ್ AI ಸಹಾಯಕ, ಭಾರತೀಯ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ನೀತಿಗಳು ಮತ್ತು ನಾಗರಿಕ ಸೇವೆಗಳಲ್ಲಿ ತಜ್ಞರು. ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ.`,
  
  gu: `તમે સહાયક AI સહાયક છો, ભારતીય સરકારી યોજનાઓ, નીતિઓ અને નાગરિક સેવાઓમાં નિષ્ણાત છો. ગુજરાતીમાં જવાબ આપો.`
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
- முக்கிய சொற்களை போல்டில் வைக்கவும்`,

  kn: `
ಈ ಫಾರ್ಮ್ಯಾಟ್‌ನಲ್ಲಿ ಉತ್ತರಿಸಿ:
- **ಶೀರ್ಷಿಕೆ** ಗಾಗಿ ಬೋಲ್ಡ್ ಬಳಸಿ
- • ಬುಲೆಟ್ ಪಾಯಿಂಟ್‌ಗಳಿಗಾಗಿ ಬಳಸಿ
- ಹಂತಗಳನ್ನು 1., 2., ಇತ್ಯಾದಿಯಾಗಿ ಸಂಖ್ಯೆ ಮಾಡಿ
- ಪ್ರಮುಖ ಪದಗಳನ್ನು ಬೋಲ್ಡ್‌ನಲ್ಲಿ ಇರಿಸಿ`,

  gu: `
આ ફોર્મેટમાં જવાબ આપો:
- **શીર્ષક** માટે બોલ્ડનો ઉપયોગ કરો
- • બુલેટ પોઈન્ટ્સ માટે ઉપયોગ કરો
- પગલાંઓને 1., 2., વગેરે તરીકે ક્રમાંકિત કરો
- મહત્વપૂર્ણ શબ્દોને બોલ્ડમાં રાખો`
};

type SupportedLanguage = 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'kn' | 'gu';

// Add error handling and retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const aiService = {
  async getTextResponse(prompt: string, language: SupportedLanguage = 'en') {
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
      try {
        console.log(`Attempting to generate content (attempt ${retries + 1})`);
        
        const result = await model.generateContent({
          contents: [{ 
            role: "user",
            parts: [{ 
              text: `
                ${SAHAYAK_PROMPT[language]}
                
                ${FORMAT_INSTRUCTIONS[language]}
                
                User Query: ${prompt}
              `
            }]
          }]
        });
        
        const response = result.response;
        const formattedText = response.text();
        
        return formattedText;
      } catch (error: any) {
        console.error(`Attempt ${retries + 1} failed:`, error);
        
        // Check if we should retry
        if (retries < MAX_RETRIES - 1) {
          retries++;
          console.log(`Waiting ${RETRY_DELAY}ms before retry ${retries}`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          // If all retries failed, fall back to a default response
          console.error('All retries failed');
          
          const fallbackResponses = {
            en: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
            hi: "मुझे खेद है, मैं अभी अपने ज्ञान आधार से कनेक्ट करने में समस्या का सामना कर रहा हूं। कृपया थोड़ी देर बाद पुनः प्रयास करें।",
            bn: "আমি দুঃখিত, আমি এখন আমার জ্ঞান ভান্ডারের সাথে সংযোগ করতে সমস্যা হচ্ছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।",
            te: "క్షమించండి, నా నాలెడ్జ్ బేస్‌కి కనెక్ట్ చేయడంలో నాకు ఇప్పుడు సమస్య ఉంది. దయచేసి కొద్ది సేపట్లో మళ్లీ ప్రయత్నించండి.",
            ta: "மன்னிக்கவும், என் அறிவுத்தளத்துடன் இணைப்பதில் தற்போது எனக்கு சிரமம் ஏற்படுகிறது. சிறிது நேரத்தில் மீண்டும் முயற்சிக்கவும்.",
            kn: "ಕ್ಷಮಿಸಿ, ನನ್ನ ಜ್ಞಾನ ಮೂಲಕ್ಕೆ ಸಂಪರ್ಕಿಸುವಲ್ಲಿ ನನಗೆ ಈಗ ಸಮಸ್ಯೆ ಇದೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
            gu: "માફ કરશો, મને અત્યારે મારા જ્ઞાન આધારથી કનેક્ટ કરવામાં સમસ્યા આવી રહી છે. કૃપા કરીને થોડી વાર પછી ફરી પ્રયાસ કરો."
          };
          
          return fallbackResponses[language] || fallbackResponses.en;
        }
      }
    }
    
    // This shouldn't be reached due to our retry logic, but TypeScript requires a return
    return "An unexpected error occurred. Please try again.";
  },

  async processVoiceToText(audioUri: string) {
    try {
      // Here you would implement actual voice-to-text processing
      // For now, returning a placeholder response
      return "I heard your voice message. How can I help you?";
    } catch (error: any) {
      console.error('Voice processing error:', error);
      throw error;
    }
  },

  async processDocument(imageUri: string) {
    try {
      // Here you would implement actual image processing
      // For now, returning a placeholder response
      return "I can see the image you've shared. How can I help you with it?";
    } catch (error: any) {
      console.error('Image processing error:', error);
      throw error;
    }
  },

  async analyzeEligibility(userDetails: string, schemeDetails: string) {
    try {
      const result = await model.generateContent({
        contents: [{ 
          role: "user",
          parts: [{ 
            text: `
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
            `
          }]
        }]
      });
      
      const response = result.response;
      return response.text();
    } catch (error: any) {
      console.error('Error analyzing eligibility:', error);
      throw error;
    }
  }
}; 