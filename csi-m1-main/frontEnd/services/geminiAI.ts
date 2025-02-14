import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with your API key
// Get API key from: https://makersuite.google.com/app/apikey
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

export interface DocumentAnalysis {
  documentId: string;
  analysis: string;
}

export interface UserProfileAnalysis {
  recommendations: string;
  eligibleSchemes: string[];
  [key: string]: any;
}

export async function analyzeDocumentWithGemini(base64Image: string): Promise<DocumentAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    const prompt = `
      Analyze this document and extract the following information:
      1. Document type
      2. Key personal information
      3. Verification status
      Please format the response in a clear, structured way.
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
    ]);

    const response = await result.response;
    
    return {
      documentId: Date.now().toString(), // In production, use proper ID generation
      analysis: response.text(),
    };
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to analyze document');
  }
}

export async function analyzeUserProfile(profile: any): Promise<UserProfileAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Given this user profile:
      ${JSON.stringify(profile, null, 2)}
      
      Please analyze and provide:
      1. List of government schemes they might be eligible for
      2. Personalized recommendations based on their profile
      3. Additional documents they might need
      
      Format the response in a structured way.
    `;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    
    // Parse the AI response and structure it
    const analysis = {
      recommendations: response.text(),
      eligibleSchemes: [], // You can parse the response to extract schemes
      profile: profile,
    };

    return analysis;
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to analyze user profile');
  }
} 