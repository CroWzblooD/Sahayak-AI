# 🤖 Sahayak-AI - Intelligent Government Scheme Discovery Platform

<div align="center">

![Sahayak-AI Logo](https://img.shields.io/badge/Sahayak-AI-Government%20Schemes-blue?style=for-the-badge&logo=home)
![React Native](https://img.shields.io/badge/React%20Native-0.79+-blue?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-53+-black?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue?style=for-the-badge&logo=typescript)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.0+-green?style=for-the-badge&logo=google)

**Empowering citizens with AI-powered government scheme discovery and assistance**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

</div>

---

## 📋 Table of Contents

- [🎯 Problem Statement](#-problem-statement)
- [💡 Solution Overview](#-solution-overview)
- [🚀 Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Installation & Setup](#-installation--setup)
- [🎮 Usage Guide](#-usage-guide)
- [🔬 Technical Details](#-technical-details)
- [📊 Data Coverage](#-data-coverage)
- [🔧 API Documentation](#-api-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Problem Statement

Accessing government schemes in India is **complex, fragmented, and overwhelming** for citizens:

- **🔍 Discovery**: 1000+ schemes across 28 states and central government
- **📋 Eligibility**: Complex criteria and documentation requirements
- **🌐 Language Barriers**: Limited access in regional languages
- **📱 Digital Divide**: Poor mobile experience for rural users
- **🤖 Lack of Guidance**: No personalized assistance for scheme selection
- **📄 Document Management**: Difficulty in organizing required documents

**Key Challenges:**
- Finding relevant schemes based on personal profile
- Understanding eligibility criteria and application process
- Managing and organizing required documents
- Getting real-time assistance in multiple languages
- Locating nearby service centers

---

## 💡 Solution Overview

**Sahayak-AI** is an **intelligent mobile platform** that leverages **artificial intelligence** and **voice technology** to help citizens discover, understand, and apply for government schemes.

### 🎯 Core Capabilities

1. **🤖 AI-Powered Discovery**: Personalized scheme recommendations based on user profile
2. **🗣️ Voice Assistant**: Multi-language voice interaction using Google Gemini AI
3. **📄 Smart Document Management**: OCR-powered document organization and verification
4. **📍 Location Services**: Find nearby government service centers
5. **🌐 Multi-Language Support**: 7 Indian languages with voice capabilities

---

## 🚀 Key Features

### 🏠 **Smart Home Dashboard**

- **📊 Personalized Insights**: AI-driven scheme recommendations
- **📈 Activity Tracking**: Weekly progress and application status
- **🔔 Smart Notifications**: Important updates and deadline reminders
- **🎯 Quick Actions**: One-tap access to popular features

### 🔍 **Intelligent Scheme Discovery**

#### **AI-Powered Search**
- **Smart Filtering**: Category, state, eligibility-based filtering
- **Personalized Recommendations**: Based on user profile and preferences
- **Real-time Updates**: Latest scheme information and deadlines
- **Eligibility Checker**: Instant eligibility assessment

#### **Comprehensive Database**
- **📊 4000+ Schemes**: Central and state government schemes
- **🏛️ 28 States**: Complete coverage of Indian states
- **📋 18 Categories**: Agriculture, Healthcare, Education, etc.
- **🔄 Regular Updates**: Latest scheme information

### 🤖 **AI Voice Assistant**

#### **Multi-Language Support**
- **🌐 7 Languages**: English, Hindi, Bengali, Telugu, Tamil, Kannada, Gujarati
- **🗣️ Voice Recognition**: Speech-to-text in all supported languages
- **🔊 Text-to-Speech**: Natural voice responses
- **💬 Contextual Conversations**: Remember user preferences and history

#### **Intelligent Features**
- **📋 Document Analysis**: AI-powered document verification
- **🎯 Eligibility Assessment**: Automated eligibility checking
- **📞 Application Guidance**: Step-by-step application assistance
- **❓ FAQ Support**: Instant answers to common questions

### 📄 **Smart Document Management**

#### **Document Organization**
- **📁 Category-based Folders**: Automatic document categorization
- **🔍 OCR Processing**: Extract text from images and documents
- **✅ Verification System**: Document authenticity checking
- **📱 Mobile Scanning**: Camera-based document capture

#### **Advanced Features**
- **🔄 Auto-sync**: Cloud backup and synchronization
- **🔒 Security**: Encrypted storage and access control
- **📊 Analytics**: Document usage and verification status
- **⏰ Expiry Tracking**: Automatic renewal reminders

### 📍 **Service Center Locator**

#### **Location Services**
- **🗺️ Interactive Maps**: Find nearby government centers
- **📍 Real-time Location**: GPS-based center discovery
- **📞 Contact Information**: Direct calling and directions
- **⏰ Operating Hours**: Center availability and timings

#### **Center Information**
- **🏢 Center Details**: Services offered and specializations
- **👥 Staff Information**: Contact details and availability
- **📋 Document Requirements**: Center-specific requirements
- **⭐ User Reviews**: Community feedback and ratings

### 👤 **Personalized Profile Management**

#### **User Profile**
- **📋 Personal Details**: Aadhaar, PAN, address information
- **💰 Income Details**: Income category and source
- **👨‍👩‍👧‍👦 Family Information**: Dependents and family size
- **🎓 Educational Background**: Qualifications and skills

#### **Smart Features**
- **🎯 Eligibility Matching**: Automatic scheme eligibility
- **📊 Progress Tracking**: Application status and history
- **📈 Analytics Dashboard**: Personal insights and recommendations
- **🔔 Smart Alerts**: Personalized notifications and reminders

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   AI Services   │    │   External      │
│   (React Native)│◄──►│   (Gemini AI)   │◄──►│   APIs          │
│                 │    │                 │    │                 │
│ • Voice Input   │    │ • Text Analysis │    │ • Google Speech │
│ • Document Scan │    │ • Eligibility   │    │ • OCR Services  │
│ • Location      │    │ • Recommendations│   │ • Maps API      │
│ • Multi-language│    │ • Voice Response│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow**

1. **User Input** → Voice/text query or document upload
2. **AI Processing** → Gemini AI analysis and response generation
3. **Scheme Matching** → Database search and eligibility checking
4. **Response Generation** → Multi-language voice/text response
5. **Data Storage** → Local storage with cloud sync
6. **UI Update** → Real-time interface updates

---

## 🛠️ Tech Stack

### **Frontend (React Native/Expo)**
| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.79+ | Cross-platform mobile framework |
| **Expo** | 53+ | Development platform and tools |
| **TypeScript** | 5.8+ | Type safety and development |
| **Expo Router** | 5.0+ | File-based navigation |
| **React Navigation** | 7.1+ | Navigation and routing |
| **Expo AV** | 15.1+ | Audio/video capabilities |
| **Expo Speech** | 13.1+ | Text-to-speech functionality |
| **Expo Camera** | 16.1+ | Document scanning |
| **Expo Location** | 18.1+ | GPS and location services |

### **AI & Services**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Google Gemini** | 2.0+ | AI-powered assistance |
| **Google Speech** | Latest | Speech recognition |
| **AsyncStorage** | 2.1+ | Local data persistence |
| **Expo File System** | 18.1+ | File management |
| **React Native Maps** | 1.20+ | Location services |

### **UI & UX**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Expo Linear Gradient** | 14.1+ | Beautiful gradients |
| **React Native Reanimated** | 3.17+ | Smooth animations |
| **Expo Haptics** | 14.1+ | Tactile feedback |
| **React Native SVG** | 15.11+ | Vector graphics |
| **Expo Blur** | 14.1+ | Visual effects |

### **Development Tools**
| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 9.25+ | Code linting |
| **TypeScript** | 5.8+ | Type checking |
| **Expo Dev Client** | 5.1+ | Development builds |
| **Expo Updates** | 0.28+ | Over-the-air updates |

---

## 📦 Installation & Setup

### **Prerequisites**

- **Node.js 18+**
- **npm or yarn**
- **Expo CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Google Gemini API Key** (for AI features)

### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/sahayak-ai.git
cd sahayak-ai
```

### **2. Install Dependencies**

```bash
# Install Node.js dependencies
npm install

# Install Expo CLI globally (if not already installed)
npm install -g @expo/cli
```

### **3. Environment Setup**

```bash
# Create environment file
cp .env.example .env

# Add your API keys to .env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_SPEECH_API_KEY=your_google_speech_api_key_here
```

### **4. Data Setup**

```bash
# Process scheme data (optional - for development)
npm run process-schemes

# Initialize scheme data
node ./scripts/init-scheme-data.js
```

### **5. Run the Application**

```bash
# Start the development server
npm start

# Or use specific platforms
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

### **6. Development Options**

- **Expo Go**: Scan QR code with Expo Go app
- **Development Build**: `expo run:android` or `expo run:ios`
- **Web Browser**: Opens automatically at http://localhost:8081

---

## 🎮 Usage Guide

### **Getting Started**

1. **Install the App**: Download from app store or build from source
2. **Create Account**: Sign up with phone number or email
3. **Complete Profile**: Add personal details and preferences
4. **Grant Permissions**: Allow camera, location, and microphone access
5. **Start Exploring**: Use voice assistant or browse schemes

### **Voice Assistant Usage**

1. **Tap Microphone**: Press the voice button on any screen
2. **Speak Your Query**: Ask questions in your preferred language
3. **Listen to Response**: AI will respond with voice and text
4. **Follow Up**: Ask follow-up questions for more details

**Example Queries:**
- "What housing schemes am I eligible for?"
- "Help me apply for PM Kisan"
- "Where is the nearest service center?"
- "Check my document status"

### **Scheme Discovery**

1. **Browse Categories**: Explore schemes by category
2. **Use Filters**: Filter by state, eligibility, or benefits
3. **Search**: Use text search for specific schemes
4. **Check Eligibility**: Get instant eligibility assessment
5. **Save Favorites**: Bookmark schemes for later

### **Document Management**

1. **Scan Documents**: Use camera to capture documents
2. **Organize**: Documents are automatically categorized
3. **Verify**: Check document authenticity and completeness
4. **Track**: Monitor verification status and expiry dates
5. **Share**: Share documents with service centers

### **Service Center Locator**

1. **Enable Location**: Allow location access
2. **Find Centers**: View nearby government centers
3. **Get Directions**: Navigate to selected center
4. **Check Details**: View services and operating hours
5. **Contact**: Call or message center directly

---

## 🔬 Technical Details

### **AI Integration**

#### **Google Gemini AI**
```typescript
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Multi-language support
const SUPPORTED_LANGUAGES = ['en', 'hi', 'bn', 'te', 'ta', 'kn', 'gu'];
```

#### **Voice Processing**
```typescript
// Speech-to-Text
const transcription = await voiceService.stopRecordingAndTranscribe(language);

// Text-to-Speech
await voiceService.speakText(response, language, voiceType);
```

### **Data Management**

#### **Scheme Database**
- **📊 4000+ Schemes**: Comprehensive government scheme database
- **🏛️ State-wise Organization**: Schemes categorized by state
- **📋 18 Categories**: Agriculture, Healthcare, Education, etc.
- **🔄 Real-time Updates**: Latest scheme information

#### **Local Storage**
```typescript
// AsyncStorage for offline access
await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
await AsyncStorage.setItem('schemes_cache', JSON.stringify(schemes));
```

### **Performance Optimization**

#### **Caching Strategy**
- **Scheme Data**: 24-hour cache with offline access
- **User Profile**: Persistent local storage
- **Documents**: Compressed image storage
- **AI Responses**: Intelligent response caching

#### **Memory Management**
- **Image Compression**: Automatic image optimization
- **Lazy Loading**: On-demand data loading
- **Background Processing**: Non-blocking AI operations
- **Memory Cleanup**: Automatic cache management

---

## 📊 Data Coverage

### **Government Schemes**

#### **Central Schemes (4000+)**
- **🏠 Housing**: PM Awas Yojana, PM Kisan Awas Yojana
- **🌾 Agriculture**: PM Kisan, PM Fasal Bima Yojana
- **⚕️ Healthcare**: Ayushman Bharat, PM-JAY
- **🎓 Education**: PM Scholarship, Digital India
- **💰 Finance**: PM MUDRA, Stand-Up India
- **👩‍💼 Women**: PM Ujjwala, Beti Bachao Beti Padhao

#### **State Schemes (28 States)**
- **Maharashtra**: 1594 schemes
- **Uttar Pradesh**: 1871 schemes
- **Karnataka**: 1092 schemes
- **Tamil Nadu**: 819 schemes
- **Andhra Pradesh**: 1634 schemes
- **And more...**

### **Service Centers**

#### **Coverage**
- **🏢 100,000+ Centers**: Common Service Centers (CSCs)
- **📍 Pan-India**: All states and union territories
- **🌐 Rural Focus**: Special emphasis on rural areas
- **📱 Digital Services**: Online and offline services

#### **Services Offered**
- **📋 Document Services**: Aadhaar, PAN, certificates
- **💰 Financial Services**: Banking, insurance, payments
- **🏥 Health Services**: Telemedicine, health camps
- **🎓 Education Services**: Skill development, training

---

## 🔧 API Documentation

### **AI Service Endpoints**

#### **Text Response**
```typescript
const response = await aiService.getTextResponse(
  "What housing schemes am I eligible for?",
  'en' // language code
);
```

#### **Voice Processing**
```typescript
// Start recording
await voiceService.startRecording();

// Stop and transcribe
const text = await voiceService.stopRecordingAndTranscribe('en');

// Text-to-speech
await voiceService.speakText("Your response", 'en', 'female');
```

### **Scheme Service**

#### **Get All Schemes**
```typescript
const schemes = await schemeService.getAllSchemes();
```

#### **Search Schemes**
```typescript
const results = await schemeService.searchSchemes("housing");
```

#### **Get by Category**
```typescript
const agricultureSchemes = await schemeService.getSchemesByCategory('agriculture');
```

### **Document Service**

#### **Upload Document**
```typescript
const document = await documentService.uploadDocument(uri, category);
```

#### **Process OCR**
```typescript
const ocrResult = await documentService.processOCR(imageUri);
```

#### **Verify Document**
```typescript
const verification = await documentService.verifyDocument(documentId);
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### **1. Fork the Repository**
```bash
git clone https://github.com/yourusername/sahayak-ai.git
cd sahayak-ai
```

### **2. Create a Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

### **3. Make Changes**
- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure multi-language support

### **4. Commit Changes**
```bash
git commit -m "Add amazing feature"
```

### **5. Push to Branch**
```bash
git push origin feature/amazing-feature
```

### **6. Open Pull Request**
Create a pull request with a detailed description of your changes.

### **Development Guidelines**
- **Code Style**: Follow ESLint configuration
- **Testing**: Add unit tests for new features
- **Documentation**: Update README and inline comments
- **Accessibility**: Ensure multi-language and voice support
- **Performance**: Optimize for mobile devices

---

## 🐛 Troubleshooting

### **Common Issues**

#### **Build Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
expo start --clear

# Reset Metro bundler
npx expo start --clear
```

#### **Voice Issues**
```bash
# Check microphone permissions
# Ensure Google Speech API key is valid
# Test with different languages
```

#### **Location Issues**
```bash
# Enable location permissions
# Check GPS settings
# Verify location services are enabled
```

#### **AI Service Issues**
```bash
# Verify Gemini API key
# Check internet connectivity
# Monitor API rate limits
```

### **Performance Optimization**
- **Image Compression**: Use appropriate image sizes
- **Lazy Loading**: Implement for large lists
- **Memory Management**: Monitor app memory usage
- **Network Optimization**: Implement request caching

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent assistance
- **Expo Team** for the amazing development platform
- **React Native Community** for the mobile framework
- **Indian Government** for scheme information
- **Open Source Contributors** for various libraries

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/sahayak-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/sahayak-ai/discussions)
- **Documentation**: [Project Wiki](https://github.com/yourusername/sahayak-ai/wiki)
- **Email**: support@sahayak-ai.com

---

<div align="center">

**Made with ❤️ for the citizens of India**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/sahayak-ai?style=social)](https://github.com/yourusername/sahayak-ai)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/sahayak-ai?style=social)](https://github.com/yourusername/sahayak-ai)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/sahayak-ai)](https://github.com/yourusername/sahayak-ai/issues)

**Empowering citizens through technology** 🚀

</div>
